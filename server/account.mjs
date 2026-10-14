import {hex,randomToken,sha,constantEqual,passwordVerifier} from './security.mjs';

const PORTAL='https://hebersonmiliano.github.io/portal-de-avaliacoes/';
const response=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
const mailReady=env=>Boolean(env.MAIL_SEND||(env.BREVO_API_KEY&&env.BREVO_FROM_EMAIL));
const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=200;
const resetLink=token=>PORTAL+'recuperar-senha.html#reset='+encodeURIComponent(token);
const verifyLink=token=>PORTAL+'recuperar-senha.html#confirm='+encodeURIComponent(token);

async function sendMail(env,to,subject,link){
 if(env.MAIL_SEND)return env.MAIL_SEND({to,subject,link});
 const result=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({sender:{email:env.BREVO_FROM_EMAIL,name:'Portal de Avaliações'},to:[{email:to}],subject,textContent:`Abra este link para continuar: ${link}\n\nSe você não solicitou isso, ignore esta mensagem.`})});
 if(!result.ok)throw Error('Falha ao enviar e-mail de recuperação.');
}
async function issueToken(env,username,purpose,pendingEmail=null,minutes=30){
 const token=randomToken(),hash=await sha(token),now=Date.now();
 await env.DB.batch([
  env.DB.prepare('DELETE FROM teacher_account_tokens WHERE teacher_username=? AND purpose=? AND used_at IS NULL').bind(username,purpose),
  env.DB.prepare('INSERT INTO teacher_account_tokens (token_hash,teacher_username,purpose,pending_email,expires_at,created_at) VALUES (?,?,?,?,?,?)').bind(hash,username,purpose,pendingEmail,now+minutes*60000,now)
 ]);
 return {token,hash};
}
async function rateLimit(env,key,limit,windowMs){
 const now=Date.now(),row=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count').bind(key,now+windowMs,now,now).first();
 return row.count<=limit;
}
async function verifyCurrentPassword(env,username,password){
 const row=await env.DB.prepare('SELECT password_salt,password_verifier FROM teachers WHERE username=? AND active=1').bind(username).first();
 return Boolean(row&&typeof password==='string'&&password.length<=200&&constantEqual(await passwordVerifier(password,row.password_salt),row.password_verifier));
}

export async function publicAccountRoute(req,env,path){
 if(req.method==='GET'&&path==='/api/account/recovery-config')return response({emailEnabled:mailReady(env)});
 if(req.method==='POST'&&path==='/api/account/request-reset'){
  if(!mailReady(env))return response({error:'Recuperação por e-mail ainda não configurada. Procure o administrador.'},503);
  const b=await req.json(),identity=typeof b?.identity==='string'?b.identity.trim().toLowerCase():'';
  if(identity.length<3||identity.length>254)return response({error:'Informe seu usuário ou e-mail.'},400);
  const ip=req.headers.get('CF-Connecting-IP')||'unknown';
  if(!await rateLimit(env,'recover-ip:'+await sha(ip),5,15*60000)||!await rateLimit(env,'recover-account:'+await sha(identity),3,15*60000))return response({error:'Aguarde alguns minutos antes de pedir outro link.'},429);
  const teacher=await env.DB.prepare('SELECT username,email FROM teachers WHERE active=1 AND email_verified_at IS NOT NULL AND (username=? OR email=? COLLATE NOCASE)').bind(identity,identity).first();
  if(teacher){const issued=await issueToken(env,teacher.username,'reset_password');try{await sendMail(env,teacher.email,'Recuperar senha do Portal de Avaliações',resetLink(issued.token));}catch(error){await env.DB.prepare('DELETE FROM teacher_account_tokens WHERE token_hash=?').bind(issued.hash).run();console.error('Falha no envio de recuperação:',error);}}
  return response({ok:true,message:'Se a conta tiver um e-mail confirmado, enviaremos um link de recuperação.'});
 }
 if(req.method==='POST'&&path==='/api/account/confirm-email'){
  const b=await req.json();if(typeof b?.token!=='string'||!/^[a-f0-9]{64}$/.test(b.token))return response({error:'Link inválido ou expirado.'},400);
  const hash=await sha(b.token),row=await env.DB.prepare("SELECT teacher_username,pending_email FROM teacher_account_tokens WHERE token_hash=? AND purpose='verify_email' AND used_at IS NULL AND expires_at>?").bind(hash,Date.now()).first();
  if(!row||!validEmail(row.pending_email))return response({error:'Link inválido ou expirado.'},400);
  if(await env.DB.prepare('SELECT username FROM teachers WHERE email=? COLLATE NOCASE AND email_verified_at IS NOT NULL AND username!=?').bind(row.pending_email,row.teacher_username).first())return response({error:'Este e-mail já está associado a outra conta.'},409);
  await env.DB.batch([env.DB.prepare('UPDATE teachers SET email=?,email_verified_at=? WHERE username=? AND active=1').bind(row.pending_email,new Date().toISOString(),row.teacher_username),env.DB.prepare('UPDATE teacher_account_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL').bind(Date.now(),hash)]);
  return response({ok:true});
 }
 if(req.method==='POST'&&path==='/api/account/reset'){
  const b=await req.json();if(typeof b?.token!=='string'||!/^[a-f0-9]{64}$/.test(b.token)||!validPassword(b.password))return response({error:'Link inválido ou senha com menos de 12 caracteres.'},400);
  const hash=await sha(b.token),row=await env.DB.prepare("SELECT t.teacher_username FROM teacher_account_tokens t JOIN teachers u ON u.username=t.teacher_username WHERE t.token_hash=? AND t.purpose='reset_password' AND t.used_at IS NULL AND t.expires_at>? AND u.active=1").bind(hash,Date.now()).first();
  if(!row)return response({error:'Link inválido ou expirado.'},400);
  const salt=hex(crypto.getRandomValues(new Uint8Array(16))),verifier=await passwordVerifier(b.password,salt),now=Date.now();
  await env.DB.batch([env.DB.prepare('UPDATE teachers SET password_salt=?,password_verifier=? WHERE username=?').bind(salt,verifier,row.teacher_username),env.DB.prepare('UPDATE teacher_account_tokens SET used_at=? WHERE teacher_username=? AND used_at IS NULL').bind(now,row.teacher_username),env.DB.prepare('DELETE FROM secure_teacher_sessions WHERE teacher_username=?').bind(row.teacher_username)]);
  return response({ok:true});
 }
 return null;
}

export async function teacherAccountRoute(req,env,path,session){
 if(req.method==='GET'&&path==='/api/teacher/profile'){
  if(session.role!=='teacher')return response({error:'Somente professores têm este perfil.'},403);
  const row=await env.DB.prepare('SELECT username,name,email,email_verified_at FROM teachers WHERE username=?').bind(session.teacher_username).first();
  return response({username:row.username,name:row.name,email:row.email_verified_at?row.email:null,emailEnabled:mailReady(env)});
 }
 if(req.method==='POST'&&path==='/api/teacher/change-password'){
  if(session.role!=='teacher')return response({error:'Esta opção é para contas de professores.'},403);
  const b=await req.json();if(!validPassword(b?.newPassword))return response({error:'A nova senha deve ter entre 12 e 200 caracteres.'},400);
  if(!await verifyCurrentPassword(env,session.teacher_username,b?.currentPassword))return response({error:'Senha atual incorreta.'},403);
  const salt=hex(crypto.getRandomValues(new Uint8Array(16))),verifier=await passwordVerifier(b.newPassword,salt);
  await env.DB.batch([env.DB.prepare('UPDATE teachers SET password_salt=?,password_verifier=? WHERE username=?').bind(salt,verifier,session.teacher_username),env.DB.prepare('DELETE FROM secure_teacher_sessions WHERE teacher_username=?').bind(session.teacher_username),env.DB.prepare('UPDATE teacher_account_tokens SET used_at=? WHERE teacher_username=? AND used_at IS NULL').bind(Date.now(),session.teacher_username)]);
  return response({ok:true});
 }
 if(req.method==='POST'&&path==='/api/teacher/request-email-verification'){
  if(session.role!=='teacher')return response({error:'Esta opção é para contas de professores.'},403);
  if(!mailReady(env))return response({error:'O envio de e-mails ainda não foi configurado.'},503);
  const b=await req.json(),email=typeof b?.email==='string'?b.email.trim().toLowerCase():'';
  if(!validEmail(email))return response({error:'Informe um e-mail válido.'},400);
  if(!await verifyCurrentPassword(env,session.teacher_username,b?.currentPassword))return response({error:'Senha atual incorreta.'},403);
  if(await env.DB.prepare('SELECT username FROM teachers WHERE email=? COLLATE NOCASE AND email_verified_at IS NOT NULL AND username!=?').bind(email,session.teacher_username).first())return response({error:'Este e-mail já está associado a outra conta.'},409);
  if(!await rateLimit(env,'verify-email:'+await sha(session.teacher_username),3,15*60000))return response({error:'Aguarde alguns minutos antes de pedir outro link.'},429);
  const issued=await issueToken(env,session.teacher_username,'verify_email',email);
  try{await sendMail(env,email,'Confirme seu e-mail no Portal de Avaliações',verifyLink(issued.token));}catch(error){await env.DB.prepare('DELETE FROM teacher_account_tokens WHERE token_hash=?').bind(issued.hash).run();console.error('Falha no envio de confirmação:',error);return response({error:'Não foi possível enviar o e-mail. Tente novamente.'},503);}
  return response({ok:true});
 }
 if(req.method==='POST'&&path==='/api/teacher/accounts/recovery'){
  if(session.role!=='admin')return response({error:'Somente o administrador pode gerar recuperação de emergência.'},403);
  const b=await req.json(),username=typeof b?.username==='string'?b.username.trim().toLowerCase():'';
  const teacher=await env.DB.prepare('SELECT username FROM teachers WHERE username=? AND active=1').bind(username).first();if(!teacher)return response({error:'Professor ativo não encontrado.'},404);
  const issued=await issueToken(env,username,'reset_password',null,60);
  return response({ok:true,link:resetLink(issued.token),expiresInMinutes:60});
 }
 return null;
}
