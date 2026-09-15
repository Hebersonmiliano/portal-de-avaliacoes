import {classes,hex,randomToken,sha,constantEqual,passwordVerifier,attemptToken,arrangeQuestions} from './security.mjs';
const origins=new Set(['https://hebersonmiliano.github.io','https://provabd.hebersonmiliano.chatgpt.site']);
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
function db(env){if(!env.DB)throw Error('Banco indisponível');return env.DB;}
function validStudent(b){return b&&typeof b.name==='string'&&b.name.trim().length>=3&&b.name.length<=150&&classes.includes(b.turma)&&typeof b.codigo==='string'&&b.codigo.length<=50;}
function validAnswers(a,legacy=false){return Array.isArray(a)&&(a.length===40||legacy&&a.length===39)&&a.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<5);}
const readRecord=r=>({...r,answers:JSON.parse(r.answers)});
const bearer=req=>(req.headers.get('Authorization')||'').replace(/^Bearer /,'');
async function authenticated(req,env){const token=bearer(req);if(!/^[a-f0-9]{64}$/.test(token))return false;return !!await db(env).prepare('SELECT token FROM secure_teacher_sessions WHERE token=? AND expires>?').bind(await sha(token),Date.now()).first();}
async function throttle(req,env,scope,limit,ms){
 // Only the trusted Cloudflare ingress supplies CF-Connecting-IP. Ignore X-Forwarded-For.
 const ip=req.headers.get('CF-Connecting-IP')||'unknown',key=scope+':'+await sha(ip),now=Date.now();
 const row=await db(env).prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count').bind(key,now+ms,now,now).first();
 return row.count<=limit;
}
async function ensureCodes(env){
 const queries=[];for(const turma of classes)for(let i=1;i<=40;i++){
  const codigo=hex(crypto.getRandomValues(new Uint8Array(10))).toUpperCase().match(/.{1,5}/g).join('-');
  queries.push(db(env).prepare('INSERT OR IGNORE INTO secure_codes (codigo,turma,slot,state) VALUES (?,?,?,?)').bind(codigo,turma,turma+':'+i,'available'));
 }for(let i=0;i<queries.length;i+=50)await db(env).batch(queries.slice(i,i+50));
}
function publicQuestions(list){return list.map(({text,options})=>({text,options}));}
async function handle(req,env){
 const path=new URL(req.url).pathname;
 if(req.method==='GET'&&path==='/api/health'){const row=await db(env).prepare('SELECT COUNT(*) n FROM private_question_bank').first();return json({ok:true,ready:row.n>=40});}
 if(req.method==='POST'&&path==='/api/login'){
  if(!await throttle(req,env,'login-v2',8,2*60*1000))return json({error:'Muitas tentativas de acesso. Aguarde 2 minutos antes de tentar novamente.'},429);
  const b=await req.json();if(!env.TEACHER_PASSWORD_SALT||!env.TEACHER_PASSWORD_VERIFIER)return json({error:'Acesso do professor temporariamente indisponível.'},503);
  if(typeof b?.password!=='string'||b.password.length>200||!constantEqual(await passwordVerifier(b.password,env.TEACHER_PASSWORD_SALT),env.TEACHER_PASSWORD_VERIFIER))return json({error:'Senha incorreta.'},401);
  const token=randomToken();await db(env).batch([db(env).prepare('DELETE FROM secure_teacher_sessions WHERE expires<?').bind(Date.now()),db(env).prepare('INSERT INTO secure_teacher_sessions (token,expires) VALUES (?,?)').bind(await sha(token),Date.now()+2*3600000)]);return json({token});
 }
 if(path.startsWith('/api/teacher/')){
  if(!await authenticated(req,env))return json({error:'Entre novamente no painel do professor.'},401);
  if(req.method==='POST'&&path==='/api/teacher/logout'){await db(env).prepare('DELETE FROM secure_teacher_sessions WHERE token=?').bind(await sha(bearer(req))).run();return json({ok:true});}
  if(req.method==='GET'&&path==='/api/teacher/results'){
   const [records,codes]=await db(env).batch([db(env).prepare('SELECT * FROM submissions ORDER BY at DESC'),db(env).prepare('SELECT codigo,state FROM secure_codes WHERE state!=?').bind('available')]);return json({records:records.results.map(readRecord),usedCodes:codes.results.map(r=>r.codigo)});
  }
  if(req.method==='POST'&&path==='/api/teacher/codes'){await ensureCodes(env);const list=await db(env).prepare('SELECT codigo,turma,state FROM secure_codes ORDER BY turma,slot').all();return json({codes:list.results});}
  if(req.method==='POST'&&path==='/api/teacher/generate-code'){
   const b=await req.json();if(!classes.includes(b?.turma))return json({error:'Selecione uma turma válida.'},400);
   for(let i=0;i<100;i++){
    const bytes=crypto.getRandomValues(new Uint8Array(4));
    const codigo=String.fromCharCode(65+bytes[0]%26,65+bytes[1]%26)+String(bytes[2]%10)+String(bytes[3]%10);
    const result=await db(env).prepare('INSERT OR IGNORE INTO secure_codes (codigo,turma,slot,state) VALUES (?,?,?,?)').bind(codigo,b.turma,'short:'+crypto.randomUUID(),'available').run();
    if(result.meta.changes)return json({codigo,turma:b.turma});
   }
   return json({error:'Não foi possível gerar um código novo. Tente novamente.'},503);
  }
  if(req.method==='POST'&&path==='/api/teacher/reset'){
   const b=await req.json();if(typeof b?.codigo!=='string')return json({error:'Código inválido.'},400);
   await db(env).batch([db(env).prepare('UPDATE exam_attempts SET status=? WHERE id=(SELECT attempt_id FROM secure_codes WHERE codigo=?) AND status=?').bind('revoked',b.codigo,'active'),db(env).prepare('UPDATE secure_codes SET state=?,attempt_id=NULL WHERE codigo=?').bind('available',b.codigo)]);return json({ok:true});
  }
  if(req.method==='POST'&&path==='/api/teacher/bank'){
   const b=await req.json();if(!Array.isArray(b?.questions)||b.questions.length!==40||b.questions.some(q=>typeof q.text!=='string'||q.text.length<15||q.text.length>1500||!Array.isArray(q.options)||q.options.length!==5||q.options.some(o=>typeof o!=='string'||o.length<1||o.length>700)||!Number.isInteger(q.correct)||q.correct<0||q.correct>4))return json({error:'Banco de questões inválido.'},400);
   await db(env).batch(b.questions.map((q,i)=>db(env).prepare('INSERT INTO private_question_bank (id,payload) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind('q'+String(i+1).padStart(2,'0'),JSON.stringify(q))));return json({ok:true,count:40});
  }
  if(req.method==='POST'&&path==='/api/teacher/import'){
   const b=await req.json();if(!Array.isArray(b?.records)||b.records.length>200||!b.records.length)return json({error:'Selecione um arquivo de recuperação válido (até 200 registros).'},400);
   if(b.records.some(r=>!validStudent(r)||!validAnswers(r.answers,true)||typeof r.score!=='number'||!Number.isFinite(r.score)||r.score<0||r.score>10||typeof r.at!=='string'||r.at.length>100))return json({error:'O arquivo contém registros inválidos.'},400);
   let imported=0;for(const r of b.records){
    const id='legacy-'+await sha(JSON.stringify([r.name,r.turma,r.codigo,r.at,r.answers,r.score]));
    const result=await db(env).prepare('INSERT OR IGNORE INTO submissions (id,name,turma,codigo,score,answers,saidas,at,source) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,r.name,r.turma,r.codigo,r.score,JSON.stringify(r.answers),Number.isInteger(r.saidas)?Math.max(0,r.saidas):0,r.at,'recuperado').run();imported+=result.meta.changes;
   }return json({ok:true,imported});
  }
  return json({error:'Operação não encontrada.'},404);
 }
 if(req.method==='POST'&&path==='/api/start'){
  if(!await throttle(req,env,'start',250,15*60*1000))return json({error:'Muitas tentativas. Aguarde alguns minutos.'},429);
  const b=await req.json();if(!validStudent(b)||! /^[a-f0-9]{64}$/.test(b.nonce||''))return json({error:'Informe nome, turma e um código válido.'},400);
  const code=await db(env).prepare('SELECT * FROM secure_codes WHERE codigo=? AND turma=?').bind(b.codigo,b.turma).first();if(!code)return json({error:'Código ou turma inválidos. Use o novo código fornecido pelo professor.'},400);
  const nonceHash=await sha(b.nonce),token=await attemptToken(env.ATTEMPT_SECRET,b.codigo,b.nonce);
  if(code.state==='available'){
   const bank=await db(env).prepare('SELECT payload FROM private_question_bank ORDER BY id').all();if(bank.results.length!==40)return json({error:'O professor ainda está preparando as questões. Aguarde.'},503);
   const list=arrangeQuestions(bank.results.map(r=>JSON.parse(r.payload))),id=crypto.randomUUID(),now=Date.now();
   await db(env).batch([
    db(env).prepare('INSERT INTO exam_attempts (id,codigo,name,turma,token_hash,nonce_hash,questions,created,expires,status) SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM secure_codes WHERE codigo=? AND state=?)').bind(id,b.codigo,b.name.trim(),b.turma,await sha(token),nonceHash,JSON.stringify(list),now,now+24*3600000,'active',b.codigo,'available'),
    db(env).prepare('UPDATE secure_codes SET state=?,attempt_id=? WHERE codigo=? AND state=? AND EXISTS (SELECT 1 FROM exam_attempts WHERE id=?)').bind('active',id,b.codigo,'available',id)
   ]);
  }
  const attempt=await db(env).prepare('SELECT a.* FROM exam_attempts a JOIN secure_codes c ON c.attempt_id=a.id WHERE c.codigo=?').bind(b.codigo).first();
  if(!attempt||attempt.status!=='active'||attempt.expires<=Date.now()||!constantEqual(attempt.nonce_hash,nonceHash)||attempt.name!==b.name.trim()||attempt.turma!==b.turma)return json({error:'Este código já está em uso ou foi finalizado. Procure o professor.'},409);
  return json({id:attempt.id,token,questions:publicQuestions(JSON.parse(attempt.questions))});
 }
 if(req.method==='POST'&&path==='/api/submit'){
  const b=await req.json();if(!validStudent(b)||! /^[a-f0-9-]{36}$/.test(b.id||'')||! /^[a-f0-9]{64}$/.test(b.token||''))return json({error:'Tentativa inválida. Preserve a cópia das respostas e procure o professor.'},401);
  const attempt=await db(env).prepare('SELECT * FROM exam_attempts WHERE id=?').bind(b.id).first();
  if(!attempt||!constantEqual(attempt.token_hash,await sha(b.token))||attempt.codigo!==b.codigo||attempt.name!==b.name.trim()||attempt.turma!==b.turma)return json({error:'A tentativa não pertence a este aluno ou código.'},403);
  const existing=await db(env).prepare('SELECT id,score FROM submissions WHERE id=?').bind(b.id).first();if(existing)return json({ok:true,id:existing.id,score:existing.score});
  if(attempt.status!=='active'||attempt.expires<=Date.now())return json({error:'Tentativa encerrada ou expirada. Sua cópia foi preservada; procure o professor.'},409);
  if(!validAnswers(b.answers)||!Number.isInteger(b.saidas)||b.saidas<0||b.saidas>1000||typeof b.forced!=='boolean'||(!b.forced&&b.answers.includes(null)))return json({error:'Respostas inválidas ou incompletas.'},400);
  const list=JSON.parse(attempt.questions),score=b.answers.reduce((s,a,i)=>s+(a===list[i].correct?0.25:0),0);
  await db(env).batch([
   db(env).prepare('INSERT OR IGNORE INTO submissions (id,name,turma,codigo,score,answers,saidas,at,source) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM exam_attempts a JOIN secure_codes c ON c.attempt_id=a.id WHERE a.id=? AND a.status=? AND c.state=?)').bind(b.id,attempt.name,attempt.turma,attempt.codigo,score,JSON.stringify(b.answers),b.saidas,new Date().toISOString(),'online',b.id,'active','active'),
   db(env).prepare('UPDATE exam_attempts SET status=? WHERE id=? AND EXISTS (SELECT 1 FROM submissions WHERE id=?)').bind('submitted',b.id,b.id),
   db(env).prepare('UPDATE secure_codes SET state=? WHERE attempt_id=? AND EXISTS (SELECT 1 FROM submissions WHERE id=?)').bind('used',b.id,b.id)
  ]);
  const saved=await db(env).prepare('SELECT id,score FROM submissions WHERE id=?').bind(b.id).first();if(!saved)return json({error:'O código foi liberado pelo professor. Esta tentativa não pode mais ser enviada.'},409);
  return json({ok:true,id:saved.id,score:saved.score});
 }
 return json({error:'Operação não encontrada.'},404);
}
export async function api(req,env){
 const origin=req.headers.get('Origin');if(origin&&!origins.has(origin)&&origin!==new URL(req.url).origin)return json({error:'Origem não autorizada.'},403);
 let response;try{if(req.method==='OPTIONS')response=new Response(null,{status:204});else{
  if(req.method==='POST'){
   const text=await req.text();if(new TextEncoder().encode(text).length>200000)response=json({error:'Arquivo muito grande.'},413);
   else{try{JSON.parse(text);}catch{response=json({error:'Dados inválidos.'},400);}if(!response)req=new Request(req.url,{method:req.method,headers:req.headers,body:text});}
  }
  if(!response)response=await handle(req,env);
 }}catch(e){console.error('Falha na API:',e.message);response=json({error:'Não foi possível acessar o banco. Suas respostas foram preservadas. Tente novamente.'},503);}
 if(origin){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Vary','Origin');}
 response.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');return response;
}

