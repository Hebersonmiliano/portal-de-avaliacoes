import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {characters,missions,practice} from '../dist/teste/metodologias-ageis-dados.js';

const source=fs.readFileSync(new URL('../dist/teste/metodologias-ageis-jornada.js',import.meta.url),'utf8').replace(/^import .*?;\s*/,'').replace('export function validCampaign','function validCampaign');
function ui(mode,storage=new Map()){
  const elements=new Map(),handlers={};
  const element=id=>{if(!elements.has(id))elements.set(id,{hidden:false,innerHTML:'',textContent:'',style:{},scrollIntoView(){}});return elements.get(id)};
  const context=vm.createContext({characters,missions,practice,document:{body:{dataset:{mode}},getElementById:element,addEventListener(type,callback){handlers[type]=callback}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},location:{search:''},URLSearchParams,confirm:()=>true});
  vm.runInContext(source,context);
  const click=(attribute,value)=>{const dataset={};if(value!==undefined)dataset[attribute.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);const target={dataset,hasAttribute:key=>key===attribute};handlers.click({target:{closest:()=>target}})};
  return {context,element,click,storage};
}
test('todos os 40 assuntos possuem missão e desafio de estudo',()=>{
  assert.equal(missions.length,8);assert.equal(practice.length,40);
  const expected=Array.from({length:40},(_,i)=>i+1);
  assert.deepEqual(missions.flatMap(m=>m.covers).sort((a,b)=>a-b),expected);
  assert.deepEqual(practice.map(q=>q.covers).sort((a,b)=>a-b),expected);
  assert.ok(practice.every(q=>q.options.length===4&&q.correct>=0&&q.correct<4));
  assert.ok(characters.some(c=>c.id==='maya')&&characters.some(c=>c.id==='luna'));
});
test('trilha conclui as oito missões sem duplicar XP e mantém personagem feminino',()=>{
  const page=ui('trail');page.click('data-character','luna');
  for(const m of missions){page.click('data-mission',m.id);page.click('data-gate',m.gate.c)}
  assert.equal(page.element('trailFinish').hidden,false);
  assert.match(page.element('playerPanel').innerHTML,/800 XP/);
  page.click('data-mission',missions[0].id);page.click('data-gate',missions[0].gate.c);
  assert.match(page.element('playerPanel').innerHTML,/800 XP/);
  const reopened=ui('trail',page.storage);assert.match(reopened.element('playerPanel').innerHTML,/Luna/);assert.equal(reopened.element('trailFinish').hidden,false);
});
test('simulado retoma a campanha e conclui os 40 desafios sem travar',()=>{
  let page=ui('simulation');page.click('data-start');
  const answer=()=>{const correct=vm.runInContext('practice[campaign.order[campaign.cursor]].correct',page.context);page.click('data-answer',correct);page.click('data-next')};
  for(let i=0;i<3;i++)answer();
  const storage=page.storage;page=ui('simulation',storage);assert.match(page.element('beginSimulation').textContent,/Retomar/);page.click('data-start');assert.equal(vm.runInContext('campaign.cursor',page.context),3);
  for(let i=3;i<40;i++){assert.match(page.element('quiz').innerHTML,/Sair do simulado/);answer()}
  assert.equal(page.element('simulationResult').hidden,false);assert.match(page.element('simulationResult').innerHTML,/40 \/ 40/);
  page=ui('simulation',storage);page.click('data-start');assert.equal(page.element('simulationResult').hidden,false);
});
