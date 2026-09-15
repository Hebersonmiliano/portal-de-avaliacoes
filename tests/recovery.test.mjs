import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('recuperação não aparece para alunos e exige sessão válida antes de baixar',async()=>{
 const page=fs.readFileSync('server/page.html','utf8');
 assert.equal(page.includes('id="recovery"'),false);
 const status={textContent:''};let downloads=0,calls=0,authorized=false;
 const context=vm.createContext({
  document:{addEventListener(){},getElementById(){return status;}},window:{addEventListener(){}},
  localStorage:{getItem(key){return key==='bd-results'?'[{"name":"Registro antigo"}]':null;}},
  AbortController,setTimeout,clearTimeout,
  fetch:async()=>{calls++;return {ok:authorized,json:async()=>authorized?{records:[]}:{error:'Sessão inválida'}};}
 });
 vm.runInContext(fs.readFileSync('server/client.js','utf8'),context);
 context.recordDownload=()=>downloads++;vm.runInContext('download=recordDownload',context);
 await vm.runInContext('exportBackup()',context);assert.equal(downloads,0);assert.equal(calls,0);
 vm.runInContext("teacherToken='invalid'",context);
 await vm.runInContext('exportBackup()',context);assert.equal(downloads,0);assert.equal(calls,1);
 authorized=true;
 await vm.runInContext('exportBackup()',context);assert.equal(downloads,1);assert.equal(calls,2);
});
