import http from 'node:http';
import fs from 'node:fs';
import {api} from '../server/api.mjs';
import {database} from '../tests/database.mjs';
const env={DB:database(),TEACHER_PASSWORD_HASH:Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('teste-local'))).toString('hex')};
http.createServer(async(req,res)=>{try{const url='http://localhost:4173'+req.url;if(req.url.startsWith('/api/')){let body='';for await(const chunk of req)body+=chunk;const r=await api(new Request(url,{method:req.method,headers:req.headers,...(body?{body}:{})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}if(req.url==='/banco-de-dados.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync('dist/banco-de-dados.png'));return;}res.setHeader('Content-Type','text/html;charset=utf-8');res.end(fs.readFileSync('dist/index.html','utf8').replace("const API='https://provabd.hebersonmiliano.chatgpt.site'","const API='http://localhost:4173'"));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://localhost:4173'));
