import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function database(){const sqlite=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const prepare=sql=>({bind(...args){return statement(sql,args);},...statement(sql,[])});
 function statement(sql,args){return {async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};},sql,args};}
 return {prepare,async batch(items){sqlite.exec('BEGIN');try{const out=items.map(s=>{const p=sqlite.prepare(s.sql);if(/^SELECT/i.test(s.sql))return {results:p.all(...s.args)};return {meta:{changes:Number(p.run(...s.args).changes)}};});sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}},sqlite};
}
