const API='https://provabd.hebersonmiliano.chatgpt.site';
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatScore=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
let draft=null,examActive=false,sending=false,teacherToken='',records=[],usedCodes=[],refreshTimer;
function stored(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function saveDraft(){try{localStorage.setItem('bd-draft-v3',JSON.stringify(draft));return true;}catch{$('submitErr').textContent='O navegador não permite salvar uma cópia local. Mantenha esta página aberta até confirmar o envio.';$('submitErr').classList.remove('hidden');return false;}}
async function request(path,body,teacher=false){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const r=await fetch(API+path,{method:body===undefined?'GET':'POST',headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(teacher?{Authorization:'Bearer '+teacherToken}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,cache:'no-store'});const data=await r.json();if(!r.ok)throw Error(data.error||'Falha ao acessar o servidor.');return data;}catch(e){if(e instanceof TypeError||e.name==='AbortError')throw Error('Sem confirmação do servidor. Verifique a internet e tente novamente. Suas respostas foram preservadas.');throw e;}finally{clearTimeout(timer);}}
function showError(id,message){$(id).textContent=message;$(id).classList.remove('hidden');}
async function startExam(){
 const b={name:$('student').value.trim(),turma:$('classSelect').value,codigo:$('accessCode').value.trim().toUpperCase()};
 $('startErr').classList.add('hidden');const btn=$('start').querySelector('button');btn.disabled=true;btn.textContent='Verificando código…';
 try{const pending=stored('bd-start-v3',null);b.nonce=pending&&pending.name===b.name&&pending.turma===b.turma&&pending.codigo===b.codigo?pending.nonce:Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');try{localStorage.setItem('bd-start-v3',JSON.stringify(b));}catch{}const data=await request('/api/start',b);draft={...b,id:data.id,token:data.token,questions:data.questions,answers:Array(40).fill(null),saidas:0,forced:false,pending:false};saveDraft();showExam();}catch(e){showError('startErr',e.message);}finally{btn.disabled=false;btn.textContent='Começar prova';}
}
const contexts=['Durante o desenvolvimento de um sistema, a equipe precisa organizar as informações de forma correta. Considere a situação e responda:','Em uma atividade prática de Banco de Dados, uma turma analisa um sistema do dia a dia. Leia o caso com atenção e escolha a alternativa correta:','Uma empresa está melhorando seu sistema para evitar erros nos cadastros. Com base nesse cenário, responda:','Ao construir um aplicativo, os dados precisam ser armazenados e consultados com facilidade. Observe a situação apresentada:','Em uma aula de Desenvolvimento de Sistemas, o professor apresenta o exemplo a seguir para revisar conceitos básicos. Assinale a resposta correta:'];
function showExam(){examActive=!draft.pending;$('start').classList.add('hidden');$('result').classList.add('hidden');$('exam').classList.remove('hidden');$('studentLabel').textContent=draft.name;$('classLabel').textContent=draft.turma;
 $('quiz').innerHTML=draft.questions.map((q,i)=>`<article class="card question"><h3>${i+1}. ${contexts[i%5]} ${escapeHTML(q.text)}</h3>${q.options.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" ${draft.answers[i]===j?'checked':''} ${draft.pending?'disabled':''} onchange="answer(${i},${j})"><span>${String.fromCharCode(65+j)}) ${escapeHTML(o)}</span></label>`).join('')}</article>`).join('');updateProgress();if(draft.pending){$('sendButton').textContent='Tentar enviar novamente';showError('submitErr','A prova ainda não tem confirmação de recebimento. Clique em tentar enviar novamente.');}window.scrollTo(0,0);
}
function answer(i,j){if(draft.pending)return;draft.answers[i]=j;saveDraft();updateProgress();}
function updateProgress(){const n=draft.answers.filter(x=>x!==null).length;$('progressText').textContent=`${n} de 40 respondidas`;$('progressBar').style.width=`${n/40*100}%`;}
async function submitExam(e,force=false){
 if(e)e.preventDefault();if(!draft||sending)return;if(!force&&!draft.forced&&draft.answers.includes(null)){showError('submitErr','Responda todas as questões antes de enviar.');return;}
 draft.forced=force||draft.forced;draft.pending=true;examActive=false;saveDraft();sending=true;$('sendButton').disabled=true;$('sendButton').textContent='Enviando…';$('submitErr').classList.add('hidden');document.querySelectorAll('#quiz input').forEach(el=>el.disabled=true);
 try{const data=await request('/api/submit',{id:draft.id,token:draft.token,name:draft.name,turma:draft.turma,codigo:draft.codigo,answers:draft.answers,saidas:draft.saidas,forced:draft.forced});
  $('exam').classList.add('hidden');$('result').classList.remove('hidden');$('resultName').textContent=draft.name;$('score').textContent=`${formatScore(data.score)} / 10,00`;$('receipt').textContent='Recebimento confirmado. Protocolo: '+data.id;
  try{localStorage.removeItem('bd-draft-v3');localStorage.removeItem('bd-start-v3');}catch{}draft=null;
 }catch(e){showError('submitErr',e.message);}finally{sending=false;$('sendButton').disabled=false;$('sendButton').textContent='Tentar enviar novamente';}
}
document.addEventListener('visibilitychange',()=>{if(!examActive||document.visibilityState!=='hidden')return;draft.saidas++;saveDraft();if(draft.saidas>=2){draft.forced=true;submitExam(null,true);}else{$('securityNotice').textContent='Você saiu da página da prova. Se sair novamente, a prova será encerrada e o envio será iniciado.';$('securityNotice').className='notice security-alert';}});
for(const name of ['copy','cut','paste','contextmenu'])document.addEventListener(name,e=>{if(examActive)e.preventDefault();});
// Dificulta a abertura das ferramentas de desenvolvedor durante a prova.
// A correção e a nota continuam protegidas no servidor.
document.addEventListener('keydown',e=>{
 const key=String(e.key||'').toLowerCase();
 const blocked=e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(key))||(e.ctrlKey&&key==='u')||(e.ctrlKey&&key==='p');
 if(examActive&&blocked){e.preventDefault();e.stopPropagation();$('securityNotice').textContent='Ferramentas do navegador e impressão estão bloqueadas durante a prova.';$('securityNotice').className='notice security-alert';}
},true);
document.addEventListener('dragstart',e=>{if(examActive)e.preventDefault();});
window.addEventListener('online',()=>{if(draft?.pending&&!sending)submitExam(null,draft.forced);});
window.addEventListener('beforeunload',e=>{if(draft){e.preventDefault();e.returnValue='';}});
function openTeacher(){$('teacherLogin').classList.remove('hidden');$('teacherUsername').focus();}
async function loginTeacher(event){event.preventDefault();const username=$('teacherUsername').value.trim(),password=$('teacherPassword').value;try{teacherToken=(await request('/api/login',{username,password})).token;$('teacherPassword').value='';$('teacherLogin').classList.add('hidden');$('start').classList.add('hidden');$('teacher').classList.remove('hidden');await refreshResults();clearInterval(refreshTimer);refreshTimer=setInterval(()=>refreshResults(),15000);}catch(e){showError('loginError',e.message);}}
async function refreshResults(){try{const data=await request('/api/teacher/results',undefined,true);records=data.records;usedCodes=data.usedCodes;renderTeacher();$('teacherStatus').textContent='Resultados do banco central • atualizado às '+new Date().toLocaleTimeString('pt-BR');}catch(e){$('teacherStatus').textContent=e.message;if(!$('teacherBody').innerHTML)renderTeacher();}}
function renderTeacher(){
 if(!$('codeGenerator')){
  const box=document.createElement('section');box.id='codeGenerator';box.className='card';box.style.padding='18px';
  box.innerHTML='<h3>Gerador de códigos individuais</h3><p class="muted">Escolha a turma e obtenha um código disponível para copiar e entregar ao aluno. Códigos já selecionados neste navegador não se repetem.</p><div class="field"><label for="codeClass">Turma do aluno</label><select id="codeClass" style="padding:12px;font-size:16px"></select></div><div class="actions"><button id="generateCodeButton" class="btn" onclick="generateTeacherCode()">Gerar código</button><button id="copyCodeButton" class="btn secondary" onclick="copyTeacherCode()" disabled>Copiar código</button></div><div class="field"><label for="generatedCode">Código individual</label><input id="generatedCode" readonly placeholder="O código aparecerá aqui"></div><p id="codeMessage" class="muted" role="status"></p>';
  $('teacherBody').before(box);$('codeClass').innerHTML=$('classSelect').innerHTML;
 }
 $('teacherBody').innerHTML='<div class="actions"><button class="btn secondary" onclick="refreshResults()">Atualizar resultados</button><button class="btn secondary" onclick="exportCSV()">Baixar resultados CSV</button><button class="btn secondary" onclick="exportCodes()">Baixar 200 códigos</button><button class="btn secondary" onclick="document.getElementById(\'importFile\').click()">Importar provas antigas</button><input id="importFile" type="file" accept=".json" hidden onchange="importBackup(this)"></div><div id="importStatus" class="muted" role="status"></div>';
 const oldRecords=stored('bd-results',[]);if(teacherToken&&Array.isArray(oldRecords)&&oldRecords.length){const btn=document.createElement('button');btn.className='btn secondary';btn.textContent='Baixar provas antigas deste navegador';btn.onclick=exportBackup;$('teacherBody').querySelector('.actions').append(btn);}
 if(!records.length)$('teacherBody').insertAdjacentHTML('beforeend','<p class="muted">Nenhuma prova recebida no banco central. Os resultados aparecerão aqui após a confirmação do envio.</p>');
 const turmas=[...new Set(records.map(r=>r.turma))];
 for(const turma of turmas){const list=records.filter(r=>r.turma===turma);$('teacherBody').insertAdjacentHTML('beforeend',`<h3>${escapeHTML(turma)} (${list.length})</h3><div class="table-wrap"><table><thead><tr><th>Aluno</th><th>Código</th><th>Nota</th><th>Data</th><th>Saídas</th><th>Origem</th></tr></thead><tbody>${list.map(r=>`<tr><td>${escapeHTML(r.name)}</td><td>${escapeHTML(r.codigo)}</td><td>${formatScore(r.score)} / 10</td><td>${escapeHTML(r.source==='online'?new Date(r.at).toLocaleString('pt-BR'):r.at)}</td><td>${escapeHTML(r.saidas)}</td><td>${r.source==='online'?'Online':'Recuperada'}</td></tr>`).join('')}</tbody></table></div>`);}
 if(usedCodes.length){$('teacherBody').insertAdjacentHTML('beforeend','<h3>Códigos utilizados</h3><p class="muted">Liberar um código permite outra tentativa e preserva a nota anterior.</p>');const box=document.createElement('div');box.className='actions';for(const code of usedCodes){const btn=document.createElement('button');btn.className='btn secondary';btn.textContent='Liberar '+code;btn.onclick=()=>resetCode(code);box.append(btn);}$('teacherBody').append(box);}
}
async function resetCode(codigo){if(!confirm('Liberar '+codigo+' para outra tentativa? Uma tentativa em andamento será invalidada. As notas recebidas serão preservadas.'))return;try{await request('/api/teacher/reset',{codigo},true);await refreshResults();}catch(e){alert(e.message);}}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function csv(name,rows){download(name,'\ufeff'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');}
function exportCSV(){csv('resultados-prova-banco-dados.csv',[['Nome','Turma','Código','Nota','Data','Saídas','Origem','Protocolo','Respostas'],...records.map(r=>[r.name,r.turma,r.codigo,formatScore(r.score),r.at,r.saidas,r.source,r.id,r.answers.map((a,i)=>`${i+1}:${a===null?'-':String.fromCharCode(65+a)}`).join(' ')])]);}
async function exportCodes(){if(!teacherToken)return;try{const data=await request('/api/teacher/codes',{},true);csv('novos-codigos-individuais.csv',[['Turma','Código','Status'],...data.codes.map(c=>[c.turma,c.codigo,({available:'DISPONÍVEL',active:'EM ANDAMENTO',used:'UTILIZADO'})[c.state]])]);}catch(e){$('teacherStatus').textContent=e.message;}}
async function generateTeacherCode(){
 if(!teacherToken)return;
 const turma=$('codeClass').value;if(!turma){$('codeMessage').textContent='Selecione a turma do aluno.';return;}
 $('generateCodeButton').disabled=true;
 try{
  const code=await request('/api/teacher/generate-code',{turma},true);
  $('generatedCode').value=code.codigo;$('copyCodeButton').disabled=false;
  $('codeMessage').textContent='Código para '+turma+'. Clique em Copiar código e entregue a apenas um aluno.';
 }catch(e){$('codeMessage').textContent=e.message;}finally{$('generateCodeButton').disabled=false;}
}
async function copyTeacherCode(){
 if(!teacherToken||!$('generatedCode').value)return;
 try{await navigator.clipboard.writeText($('generatedCode').value);$('codeMessage').textContent='Código copiado! Cole na mensagem para o aluno.';}
 catch{$('generatedCode').focus();$('generatedCode').select();$('codeMessage').textContent='Código selecionado. Pressione Ctrl+C para copiar.';}
}
async function logoutTeacher(){try{await request('/api/teacher/logout',{},true);}finally{teacherToken='';records=[];usedCodes=[];clearInterval(refreshTimer);location.reload();}}
async function exportBackup(){if(!teacherToken)return;try{await request('/api/teacher/results',undefined,true);const old=stored('bd-results',[]);download('recuperacao-provas.json',JSON.stringify({records:old},null,2),'application/json');}catch(e){$('teacherStatus').textContent=e.message;}}
function exportPending(){if(draft)download('copia-prova-pendente.json',JSON.stringify({pending:draft},null,2),'application/json');}
async function importBackup(input){const file=input.files[0];if(!file)return;try{if(file.size>200000)throw Error('Arquivo muito grande.');const data=JSON.parse(await file.text());const r=await request('/api/teacher/import',data,true);await refreshResults();$('importStatus').textContent=`${r.imported} prova(s) recuperada(s). Registros repetidos não foram duplicados.`;}catch(e){$('importStatus').textContent=e.message;}finally{input.value='';}}
const previous=stored('bd-draft-v3',null);if(previous?.id&&previous.token&&previous.questions?.length===40&&previous.answers?.length===40){draft=previous;showExam();}

