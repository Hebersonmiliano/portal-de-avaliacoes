import http from 'node:http';
import fs from 'node:fs';
import {api} from '../server/api.mjs';
import {database} from '../tests/database.mjs';
import {passwordVerifier,randomToken} from '../server/security.mjs';
const salt=randomToken();
const env={DB:database(),TEACHER_PASSWORD_SALT:salt,TEACHER_PASSWORD_VERIFIER:await passwordVerifier('teste-local',salt),ATTEMPT_SECRET:randomToken()};
// Only synthetic test questions belong in the public source repository.
for(let i=0;i<40;i++)env.DB.sqlite.prepare('INSERT INTO private_question_bank (id,payload) VALUES (?,?)').run('test'+i,JSON.stringify({text:'Questão fictícia da prévia local '+(i+1),options:['Opção A','Opção B','Opção C','Opção D','Opção E'],correct:i%5}));
http.createServer(async(req,res)=>{try{const url='http://localhost:4173'+req.url;if(req.url.startsWith('/api/')){let body='';for await(const chunk of req)body+=chunk;const r=await api(new Request(url,{method:req.method,headers:req.headers,...(body?{body}:{})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}if(req.url==='/banco-de-dados.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('dist/banco-de-dados.png'));return;}res.setHeader('Content-Type','text/html;charset=utf-8');res.end(fs.readFileSync('dist/index.html','utf8').replace("const API='https://provabd.hebersonmiliano.chatgpt.site'","const API='http://localhost:4173'"));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://localhost:4173'));
