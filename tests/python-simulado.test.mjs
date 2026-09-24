import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

for (const page of ['dist/logica-python-simulado.html', 'dist/teste/logica-python-simulado.html']) {
  test(`${page}: aluno conclui as 20 questões e pode sair da arena`, () => {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script, 'script do simulado presente');
    assert.match(html, /\[hidden\]\{display:none!important\}/);

    const elements = new Map();
    function element(id) {
      if (!elements.has(id)) {
        elements.set(id, {
          hidden: false,
          innerHTML: '',
          textContent: '',
          style: {},
          classList: { add() {} },
          appendChild() {},
          scrollIntoView() {},
        });
      }
      return elements.get(id);
    }
    const context = vm.createContext({
      document: {
        getElementById: element,
        querySelectorAll: () => Array.from({ length: 4 }, () => ({ disabled: false, classList: { add() {} } })),
        createElement: () => ({ style: { setProperty() {} }, appendChild() {}, remove() {} }),
      },
      localStorage: { getItem: () => null, setItem() {} },
      window: {},
      setTimeout() {},
      Math,
    });
    vm.runInContext(script, context);
    vm.runInContext(`
      start();
      for (let i = 0; i < questions.length; i++) {
        if (!document.getElementById('quiz').innerHTML.includes('Sair do simulado')) {
          throw new Error('Saída indisponível na questão ' + (i + 1));
        }
        answer((questions[order[index]].correct + 1) % 4);
        next();
      }
    `, context);

    assert.equal(element('summary').hidden, false);
    assert.match(element('summary').innerHTML, /20/);
    assert.match(element('summary').innerHTML, /Ir para a prova/);
  });
}
