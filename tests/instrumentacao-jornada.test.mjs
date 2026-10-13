import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {characters,missions,practice} from '../dist/teste/instrumentacao-dados.js';

const source=fs.readFileSync(new URL('../dist/teste/instrumentacao-jornada.js',import.meta.url),'utf8').replace(/^import .*?;\s*/,'').replace('export function validCampaign','function validCampaign');
function ui(mode,storage=new Map()){
  const elements=new Map(),handlers={};
  const element=id=>{if(!elements.has(id))elements.set(id,{hidden:false,innerHTML:'',textContent:'',style:{},scrollIntoView(){}});return elements.get(id)};
  const context=vm.createContext({
    characters,missions,practice,
    document:{body:{dataset:{mode}},getElementById:element,addEventListener(type,callback){handlers[type]=callback}},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    location:{search:''},URLSearchParams,confirm:()=>true
  });
  vm.runInContext(source,context);
  const click=(attribute,value)=>{
    const dataset={};
    if(value!==undefined)dataset[attribute.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);
    const target={dataset,hasAttribute:key=>key===attribute};
    handlers.click({target:{closest:()=>target}});
  };
  return {context,element,click,storage};
}

test('40 conceitos e 40 situações cobrem as oito estações com cinco alternativas',()=>{
  assert.equal(missions.length,8);
  assert.equal(missions.reduce((sum,m)=>sum+m.concepts.length,0),40);
  assert.equal(practice.length,40);
  assert.ok(practice.every(q=>q.options.length===5&&q.correct>=0&&q.correct<5&&missions.some(m=>m.id===q.mission)));
  assert.deepEqual(practice.reduce((counts,q)=>(counts[q.correct]++,counts),[0,0,0,0,0]),[8,8,8,8,8]);
  assert.ok(characters.filter(c=>c.name==='Lia'||c.name==='Nara').length===2);
});
test('trilha conclui as oito estações, salva progresso e não duplica XP',()=>{
  const page=ui('trail');page.click('data-character','nara');
  for(const m of missions){page.click('data-mission',m.id);page.click('data-gate',m.gate.c)}
  assert.equal(page.element('trailFinish').hidden,false);
  assert.match(page.element('playerPanel').innerHTML,/800 XP/);
  page.click('data-mission',missions[0].id);page.click('data-gate',missions[0].gate.c);
  assert.match(page.element('playerPanel').innerHTML,/800 XP/);
  const reopened=ui('trail',page.storage);
  assert.match(reopened.element('playerPanel').innerHTML,/Nara/);
  assert.equal(reopened.element('trailFinish').hidden,false);
});
test('simulado aceita cinco alternativas, retoma e conclui 40 situações',()=>{
  let page=ui('simulation');page.click('data-start');
  const answer=()=>{const correct=vm.runInContext('practice[campaign.order[campaign.cursor]].correct',page.context);page.click('data-answer',correct);page.click('data-next')};
  for(let i=0;i<3;i++)answer();
  const storage=page.storage;page=ui('simulation',storage);
  assert.match(page.element('beginSimulation').textContent,/Retomar/);
  page.click('data-start');assert.equal(vm.runInContext('campaign.cursor',page.context),3);
  for(let i=3;i<40;i++){assert.match(page.element('quiz').innerHTML,/Sair e salvar/);answer()}
  assert.equal(page.element('simulationResult').hidden,false);
  assert.match(page.element('simulationResult').innerHTML,/40 \/ 40/);
  page=ui('simulation',storage);page.click('data-start');
  assert.equal(page.element('simulationResult').hidden,false);
});

