// Resultados dos jogos de estudo (Trilha Dev).
// O jogo corrige as respostas no navegador do aluno, então estes números servem para
// ranking e acompanhamento. Nunca use como nota oficial: a nota vem da prova com código.
const GAMES=new Map([['trilha-dev',new Map([['html',6],['css',3],['js',3],['logica',3],['bd',3],['git',3]])]]);
const MAX_XP=1500; // teto por fase: 5 questões com todos os bônus ficam abaixo disso
const MAX_ROWS_PER_CLASS=6300; // 300 alunos x 21 fases: barra o enchimento do banco com nomes falsos
const WINDOW=15*60*1000;
const clean=value=>typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
const int=(value,min,max)=>Number.isInteger(value)&&value>=min&&value<=max;

// O ranking é público, então mostra só o primeiro nome e a inicial do último.
export function shortName(name){const parts=clean(name).split(' ');return parts.length>1?parts[0]+' '+parts[parts.length-1][0].toUpperCase()+'.':parts[0];}

async function knownClass(db,env,turma){
 const row=await db(env).prepare('SELECT name FROM admin_classes WHERE active=1 AND name=? COLLATE NOCASE UNION SELECT name FROM teacher_classes WHERE name=? COLLATE NOCASE UNION SELECT turma AS name FROM discipline_codes WHERE turma=? COLLATE NOCASE UNION SELECT turma AS name FROM secure_codes WHERE turma=? COLLATE NOCASE LIMIT 1').bind(turma,turma,turma,turma).first();
 return row?.name||null;
}

export async function publicGameRoute(req,env,path,url,{db,json,throttle}){
 if(req.method==='POST'&&path==='/api/game/result'){
  if(!await throttle(req,env,'game-result',1500,WINDOW))return json({error:'Muitos envios desta rede. Aguarde alguns minutos.'},429);
  const b=await req.json(),trails=GAMES.get(b?.game),name=clean(b?.name),requested=clean(b?.turma);
  if(!trails||!trails.has(b.trail)||!int(b.phase,0,trails.get(b.trail)-1)||name.length<2||name.length>40||!requested||requested.length>100||!int(b.xp,0,MAX_XP)||!int(b.stars,1,3)||!int(b.firstTry,0,5))return json({error:'Dados inválidos.'},400);
  const turma=await knownClass(db,env,requested);if(!turma)return json({error:'Turma não encontrada.'},404);
  const existing=await db(env).prepare('SELECT xp FROM game_results WHERE game=? AND turma=? AND name=? AND trail=? AND phase=?').bind(b.game,turma,name,b.trail,b.phase).first();
  if(!existing){const total=await db(env).prepare('SELECT COUNT(*) n FROM game_results WHERE game=? AND turma=?').bind(b.game,turma).first();if(total.n>=MAX_ROWS_PER_CLASS)return json({error:'Esta turma atingiu o limite de registros. Avise o professor.'},429);}
  const now=new Date().toISOString();
  const saved=await db(env).prepare('INSERT INTO game_results (game,turma,name,trail,phase,xp,stars,first_try,plays,first_at,at) VALUES (?,?,?,?,?,?,?,?,1,?,?) ON CONFLICT(game,turma,name,trail,phase) DO UPDATE SET xp=MAX(xp,excluded.xp),stars=MAX(stars,excluded.stars),first_try=MAX(first_try,excluded.first_try),plays=plays+1,at=excluded.at RETURNING xp,stars').bind(b.game,turma,name,b.trail,b.phase,b.xp,b.stars,b.firstTry,now,now).first();
  return json({ok:true,turma,xp:saved.xp,stars:saved.stars});
 }
 if(req.method==='GET'&&path==='/api/game/ranking'){
  if(!await throttle(req,env,'game-ranking',3000,WINDOW))return json({error:'Muitas consultas desta rede. Aguarde alguns minutos.'},429);
  const game=url.searchParams.get('game')||'',turma=clean(url.searchParams.get('turma'));
  if(!GAMES.has(game)||!turma||turma.length>100)return json({error:'Dados inválidos.'},400);
  const rows=await db(env).prepare('SELECT name,SUM(xp) xp,SUM(stars) stars,COUNT(*) phases FROM game_results WHERE game=? AND turma=? GROUP BY name ORDER BY xp DESC,name LIMIT 20').bind(game,turma).all();
  return json({game,turma,ranking:rows.results.map(r=>({name:shortName(r.name),xp:r.xp,stars:r.stars,phases:r.phases}))});
 }
 return null;
}

export async function teacherGameRoute(req,env,path,url,session,{db,json}){
 if(req.method==='GET'&&path==='/api/teacher/game-results'){
  const game=url.searchParams.get('game')||'';if(!GAMES.has(game))return json({error:'Jogo inválido.'},400);
  const columns='turma,name,trail,phase,xp,stars,first_try,plays,first_at,at';
  const rows=session.role==='admin'
   ?await db(env).prepare('SELECT '+columns+' FROM game_results WHERE game=? ORDER BY turma,name,trail,phase').bind(game).all()
   :await db(env).prepare('SELECT '+columns+' FROM game_results WHERE game=? AND turma IN (SELECT name FROM teacher_classes WHERE teacher_username=?) ORDER BY turma,name,trail,phase').bind(game,session.teacher_username).all();
  return json({game,results:rows.results});
 }
 if(req.method==='POST'&&path==='/api/teacher/game-results/remove'){
  const b=await req.json(),name=clean(b?.name),turma=clean(b?.turma);
  if(!GAMES.has(b?.game)||!name||name.length>40||!turma||turma.length>100)return json({error:'Dados inválidos.'},400);
  const result=session.role==='admin'
   ?await db(env).prepare('DELETE FROM game_results WHERE game=? AND turma=? AND name=?').bind(b.game,turma,name).run()
   :await db(env).prepare('DELETE FROM game_results WHERE game=? AND turma=? AND name=? AND turma IN (SELECT name FROM teacher_classes WHERE teacher_username=?)').bind(b.game,turma,name,session.teacher_username).run();
  if(!result.meta.changes)return json({error:'Aluno não encontrado nas suas turmas.'},404);
  return json({ok:true,removed:result.meta.changes});
 }
 return null;
}
