import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';
import {classes,randomToken,passwordVerifier,sha} from '../server/security.mjs';
import {database} from './database.mjs';
const bank=Array.from({length:40},(_,i)=>({text:'Questão fictícia exclusiva de teste '+i,options:['Resposta de teste','B','C','D','E'],correct:0}));
export async function setup(){
 const DB=database(),salt=randomToken(),env={DB,TEACHER_PASSWORD_SALT:salt,TEACHER_PASSWORD_VERIFIER:await passwordVerifier('senha-local-de-teste',salt),ATTEMPT_SECRET:randomToken()};
 const call=async(path,body,token,ip='192.0.2.1')=>{
  const res=await api(new Request('https://provabd.hebersonmiliano.chatgpt.site/api/'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://hebersonmiliano.github.io','CF-Connecting-IP':ip,...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env);
  return {status:res.status,data:await res.json(),headers:res.headers};
 };
 const token=(await call('login',{password:'senha-local-de-teste'})).data.token;
 return {DB,env,call,token};
}
test('código curto exige professor, é único e inicia prova',async()=>{
 const {call,token}=await setup();
 assert.equal((await call('teacher/generate-code',{turma:classes[0]})).status,401);
 assert.equal((await call('teacher/generate-code',{turma:'inválida'},token)).status,400);
 const seen=new Set();let codigo;
 for(let i=0;i<30;i++){
  const r=await call('teacher/generate-code',{turma:classes[0]},token);
  assert.equal(r.status,200);codigo=r.data.codigo;assert.match(codigo,/^[A-Z]{2}[0-9]{2}$/);assert.ok(!seen.has(codigo));seen.add(codigo);
 }
 await call('teacher/bank',{questions:bank},token);
 assert.equal((await call('start',{name:'Aluno teste',turma:classes[0],codigo,nonce:randomToken()})).status,200);
});
test('códigos privados, reserva, identidade, correção e reenvio idempotente',async()=>{
 const {DB,call,token}=await setup();
 assert.equal((await call('teacher/results')).status,401);
 assert.equal((await call('teacher/codes',{})).status,401);
 assert.equal((await call('teacher/bank',{questions:bank})).status,401);
 await call('teacher/bank',{questions:bank},token);
 const codes=(await call('teacher/codes',{},token)).data.codes;
 assert.equal(codes.length,200);assert.equal(new Set(codes.map(c=>c.codigo)).size,200);
 assert.ok(codes.every(c=>/^[A-F0-9]{5}(-[A-F0-9]{5}){3}$/.test(c.codigo)));
 assert.deepEqual((await call('teacher/codes',{},token)).data.codes,codes);
 const student={name:'Aluno Teste',turma:codes[0].turma,codigo:codes[0].codigo,nonce:randomToken()};
 assert.equal((await call('start',{...student,codigo:'MAT-001'})).status,400);
 const started=await call('start',student);assert.equal(started.status,200);assert.equal(started.data.questions.length,40);assert.ok(started.data.questions.every(q=>q.correct===undefined));
 assert.deepEqual((await call('start',student)).data,started.data);
 assert.equal((await call('start',{...student,nonce:randomToken()})).status,409);
 const body={...student,id:started.data.id,token:started.data.token,answers:started.data.questions.map(q=>q.options.indexOf('Resposta de teste')),saidas:0,forced:false};
 assert.equal((await call('submit',{...body,token:''})).status,401);
 assert.equal((await call('submit',{...body,token:randomToken()})).status,403);
 assert.equal((await call('submit',{...body,name:'Outro Aluno'})).status,403);
 assert.equal((await call('submit',{...body,codigo:codes[1].codigo})).status,403);
 assert.equal((await call('submit',{...body,id:crypto.randomUUID()})).status,403);
 assert.equal((await call('submit',{...body,answers:[]})).status,400);
 const submitted=await call('submit',{...body,score:100});assert.equal(submitted.data.score,10);
 assert.deepEqual((await call('submit',{...body,answers:Array(40).fill(null)})).data,submitted.data);
 const result=(await call('teacher/results',undefined,token)).data;assert.equal(result.records.length,1);assert.equal(result.records[0].name,student.name);assert.equal(result.records[0].score,10);
 assert.equal((await call('start',student)).status,409);
 await call('teacher/reset',{codigo:student.codigo},token);
 const next=await call('start',{...student,nonce:randomToken()});assert.equal(next.status,200);assert.notEqual(next.data.id,body.id);
 await call('teacher/reset',{codigo:student.codigo},token);
 assert.equal((await call('submit',{...body,id:next.data.id,token:next.data.token})).status,409);
 assert.equal((await call('teacher/results',undefined,token)).data.records.length,1);
 await call('teacher/logout',{},token);assert.equal((await call('teacher/results',undefined,token)).status,401);
 DB.sqlite.close();
});
test('sessões antigas não funcionam, tentativas expiram e notas antigas são preservadas',async()=>{
 const {DB,call,token}=await setup();await call('teacher/bank',{questions:bank},token);
 const legacyToken=randomToken();DB.sqlite.prepare('INSERT INTO teacher_sessions VALUES (?,?)').run(await sha(legacyToken),Date.now()+999999);
 assert.equal((await call('teacher/results',undefined,legacyToken)).status,401);
 const legacy={name:'Aluno antigo',turma:classes[0],codigo:'MAT-001',answers:Array(39).fill(0),score:9.75,at:'15/09/2026',saidas:0};
 assert.equal((await call('teacher/import',{records:[legacy]},token)).data.imported,1);
 assert.equal((await call('teacher/import',{records:[legacy]},token)).data.imported,0);
 const code=(await call('teacher/codes',{},token)).data.codes[0],b={name:'Novo Aluno',turma:code.turma,codigo:code.codigo,nonce:randomToken()};
 const started=(await call('start',b)).data;
 DB.sqlite.prepare('UPDATE exam_attempts SET expires=0 WHERE id=?').run(started.id);
 assert.equal((await call('submit',{...b,id:started.id,token:started.token,answers:Array(40).fill(0),saidas:0,forced:false})).status,409);
 assert.equal((await call('teacher/results',undefined,token)).data.records[0].score,9.75);
 DB.sqlite.close();
});
test('limite de login, corpo inválido, origem e indisponibilidade',async()=>{
 const {DB,env,call}=await setup();
 for(let i=0;i<8;i++)assert.equal((await call('login',{password:'errada'},undefined,'192.0.2.55')).status,401);
 assert.equal((await call('login',{password:'senha-local-de-teste'},undefined,'192.0.2.55')).status,429);
 const bad=await api(new Request('https://provabd.hebersonmiliano.chatgpt.site/api/start',{method:'POST',headers:{Origin:'https://hebersonmiliano.github.io'},body:'{' }),env);
 assert.equal(bad.status,400);assert.equal(bad.headers.get('Access-Control-Allow-Origin'),'https://hebersonmiliano.github.io');
 const other=await api(new Request('https://provabd.hebersonmiliano.chatgpt.site/api/health',{headers:{Origin:'https://example.org'}}),env);assert.equal(other.status,403);
 const unavailable=await api(new Request('https://provabd.hebersonmiliano.chatgpt.site/api/health'),{});assert.equal(unavailable.status,503);
 DB.sqlite.close();
});

