import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {api} from '../server/api.mjs';
import {database} from '../tests/database.mjs';
import {passwordVerifier,randomToken} from '../server/security.mjs';
const salt=randomToken();
const env={DB:database(),TEACHER_PASSWORD_SALT:salt,TEACHER_PASSWORD_VERIFIER:await passwordVerifier('teste-local',salt),ATTEMPT_SECRET:randomToken()};
// Only synthetic test questions belong in the public source repository.
for(let i=0;i<40;i++)env.DB.sqlite.prepare('INSERT INTO private_question_bank (id,payload) VALUES (?,?)').run('test'+i,JSON.stringify({text:'Questão fictícia da prévia local '+(i+1),options:['Opção A','Opção B','Opção C','Opção D','Opção E'],correct:i%5}));
const types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const requestUrl=new URL(req.url,'http://localhost:4173');if(requestUrl.pathname.startsWith('/api/')){let body='';for await(const chunk of req)body+=chunk;const r=await api(new Request(requestUrl,{method:req.method,headers:req.headers,...(body?{body}:{})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}const relative=decodeURIComponent(requestUrl.pathname==='/'?'index.html':requestUrl.pathname.slice(1)),file=path.resolve('dist',relative);if(!file.startsWith(path.resolve('dist')+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('Não encontrado');return}const extension=path.extname(file).toLowerCase();res.setHeader('Content-Type',types[extension]||'application/octet-stream');if(extension==='.html'){const html=fs.readFileSync(file,'utf8').replaceAll('https://provabd.hebersonmiliano.chatgpt.site','http://localhost:4173');res.end(html);return}res.end(fs.readFileSync(file));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(4173,'127.0.0.1',()=>console.log('Homologação: http://localhost:4173 — banco temporário e dados fictícios'));

