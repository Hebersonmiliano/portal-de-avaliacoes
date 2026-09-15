import {qs, classPrefixes} from './questions.mjs';
const teacherHash='7a2ec40ff8a1247c532309355f798a779e00acff579c63eec3636ffb2902c1ac';
const origins=new Set(['https://hebersonmiliano.github.io','https://provabd.hebersonmiliano.chatgpt.site']);
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const sha=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
function db(env){if(!env.DB)throw Error('Banco indisponível');return env.DB;}
function shuffle(list,seed){const a=[...list];let n=seed.split('').reduce((s,c)=>s+c.charCodeAt(0),0)||1;for(let i=a.length-1;i>0;i--){n=(n*9301+49297)%233280;const j=Math.floor(n/233280*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}
export function questions(code){return shuffle(qs.map((q,i)=>{const correct=q[1][q[2]],opts=shuffle(q[1],code+i),found=opts.indexOf(correct),target=i%5;[opts[found],opts[target]]=[opts[target],opts[found]];return {text:q[0],options:opts,correct:target};}),code);}
function validStudent(b){return typeof b.name==='string'&&b.name.trim().length>=3&&b.name.length<=150&&typeof b.codigo==='string'&&Array.from({length:40},(_,i)=>`${classPrefixes[b.turma]}-${String(i+1).padStart(3,'0')}`).includes(b.codigo)&&!!classPrefixes[b.turma];}
function validAnswers(a,legacy=false){return Array.isArray(a)&&(a.length===40||legacy&&a.length===39)&&a.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<5);}
const readRecord=r=>({...r,answers:JSON.parse(r.answers)});
async function authenticated(req,env){const token=(req.headers.get('Authorization')||'').replace(/^Bearer /,'');if(!token)return false;return !!await db(env).prepare('SELECT token FROM teacher_sessions WHERE token=? AND expires>?').bind(await sha(token),Date.now()).first();}
async function handle(req,env){
 const path=new URL(req.url).pathname;
 if(req.method==='GET'&&path==='/api/health'){await db(env).prepare('SELECT count(*) AS n FROM submissions').first();return json({ok:true});}
 if(req.method==='POST'&&path==='/api/login'){
  const b=await req.json();if(typeof b.password!=='string'||b.password.length>200||await sha(b.password)!==(env.TEACHER_PASSWORD_HASH||teacherHash))return json({error:'Senha incorreta.'},401);
  const token=crypto.randomUUID()+crypto.randomUUID();await db(env).batch([db(env).prepare('DELETE FROM teacher_sessions WHERE expires<?').bind(Date.now()),db(env).prepare('INSERT INTO teacher_sessions (token,expires) VALUES (?,?)').bind(await sha(token),Date.now()+8*3600000)]);return json({token});
 }
 if(path.startsWith('/api/teacher/')){
  if(!await authenticated(req,env))return json({error:'Entre novamente no painel do professor.'},401);
  if(req.method==='GET'&&path==='/api/teacher/results'){
   const [records,locks]=await db(env).batch([db(env).prepare('SELECT * FROM submissions ORDER BY at DESC'),db(env).prepare('SELECT codigo FROM code_locks')]);return json({records:records.results.map(readRecord),usedCodes:locks.results.map(r=>r.codigo)});
  }
  if(req.method==='POST'&&path==='/api/teacher/reset'){const b=await req.json();await db(env).prepare('DELETE FROM code_locks WHERE codigo=?').bind(String(b.codigo)).run();return json({ok:true});}
  if(req.method==='POST'&&path==='/api/teacher/import'){
   const b=await req.json();if(!Array.isArray(b.records)||b.records.length>200||!b.records.length)return json({error:'Selecione um arquivo de recuperação válido (até 200 registros).'},400);
   if(b.records.some(r=>!validStudent(r)||!validAnswers(r.answers,true)||typeof r.score!=='number'||!Number.isFinite(r.score)||r.score<0||r.score>10||typeof r.at!=='string'||r.at.length>100))return json({error:'O arquivo contém registros inválidos.'},400);
   let imported=0;
   for(const r of b.records){const id='legacy-'+await sha(JSON.stringify([r.name,r.turma,r.codigo,r.at,r.answers,r.score]));
    const results=await db(env).batch([db(env).prepare('INSERT OR IGNORE INTO submissions (id,name,turma,codigo,score,answers,saidas,at,source) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,r.name,r.turma,r.codigo,r.score,JSON.stringify(r.answers),Number.isInteger(r.saidas)?Math.max(0,r.saidas):0,r.at,'recuperado'),db(env).prepare('INSERT OR IGNORE INTO code_locks (codigo,submission_id) VALUES (?,?)').bind(r.codigo,id)]);imported+=results[0].meta.changes;
   }return json({ok:true,imported});
  }
  return json({error:'Operação não encontrada.'},404);
 }
 if(req.method==='POST'&&(path==='/api/start'||path==='/api/submit')){
  const b=await req.json();if(!validStudent(b))return json({error:'Informe nome, turma e um código válido.'},400);
  if(path==='/api/start'){
   if(await db(env).prepare('SELECT codigo FROM code_locks WHERE codigo=?').bind(b.codigo).first())return json({error:'Este código já foi utilizado. Peça ao professor para verificar.'},409);
   return json({questions:questions(b.codigo).map(({text,options})=>({text,options}))});
  }
  if(typeof b.id!=='string'||! /^[a-f0-9-]{36}$/.test(b.id)||!validAnswers(b.answers)||!Number.isInteger(b.saidas)||b.saidas<0||b.saidas>1000||(!b.forced&&b.answers.includes(null)))return json({error:'Respostas inválidas ou incompletas.'},400);
  const existing=await db(env).prepare('SELECT id,score FROM submissions WHERE id=?').bind(b.id).first();if(existing)return json({ok:true,id:existing.id,score:existing.score});
  const score=b.answers.reduce((s,a,i)=>s+(a===questions(b.codigo)[i].correct?0.25:0),0);
  try{await db(env).batch([db(env).prepare('INSERT INTO code_locks (codigo,submission_id) VALUES (?,?)').bind(b.codigo,b.id),db(env).prepare('INSERT INTO submissions (id,name,turma,codigo,score,answers,saidas,at,source) VALUES (?,?,?,?,?,?,?,?,?)').bind(b.id,b.name.trim(),b.turma,b.codigo,score,JSON.stringify(b.answers),b.saidas,new Date().toISOString(),'online')]);}
  catch(e){const saved=await db(env).prepare('SELECT id,score FROM submissions WHERE id=?').bind(b.id).first();if(saved)return json({ok:true,id:saved.id,score:saved.score});if(await db(env).prepare('SELECT codigo FROM code_locks WHERE codigo=?').bind(b.codigo).first())return json({error:'Este código já tem uma prova recebida. Sua cópia foi preservada; procure o professor.'},409);throw e;}
  return json({ok:true,id:b.id,score});
 }
 return json({error:'Operação não encontrada.'},404);
}
export async function api(req,env){
 const origin=req.headers.get('Origin');const allowed=!origin||origins.has(origin)||origin===new URL(req.url).origin;
 if(!allowed)return json({error:'Origem não autorizada.'},403);
 let response;
 try{if(req.method==='OPTIONS')response=new Response(null,{status:204});else if(Number(req.headers.get('Content-Length')||0)>200000)response=json({error:'Arquivo muito grande.'},413);else response=await handle(req,env);}
 catch(e){console.error('Falha na API:',e.message);response=json({error:'Não foi possível acessar o banco. Suas respostas foram preservadas. Tente novamente.'},503);}
 if(origin){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Vary','Origin');}
 response.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');return response;
}
