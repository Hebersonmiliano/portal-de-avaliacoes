import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const html=fs.readFileSync('server/page.html','utf8').replace('<!-- APPLICATION_SCRIPT -->','<script>'+fs.readFileSync('server/client.js','utf8')+'</script>').trimEnd()+'\n';
fs.writeFileSync('dist/index.html',html);
fs.copyFileSync('server/api.mjs','dist/server/api.mjs');fs.copyFileSync('server/security.mjs','dist/server/security.mjs');
// The retired answer key must never be included in a newly packaged build.
if(fs.existsSync('dist/server/questions.mjs'))fs.unlinkSync('dist/server/questions.mjs');
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
fs.writeFileSync('dist/server/index.js',`import {api} from './api.mjs';\nconst html=${JSON.stringify(html)};\nconst png=${JSON.stringify(fs.readFileSync('dist/banco-de-dados.png').toString('base64'))};\nexport default {async fetch(req,env){const path=new URL(req.url).pathname;if(path.startsWith('/api/'))return api(req,env);if(path==='/banco-de-dados.png')return new Response(Uint8Array.from(atob(png),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=86400'}});if(path==='/'||path==='/index.html')return new Response(html,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-cache'}});return new Response('Não encontrado',{status:404});}};\n`);
console.log('Build concluído: GitHub Pages + API com banco central.');
