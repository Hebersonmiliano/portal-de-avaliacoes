# Fluxo de homologação e produção

Este projeto possui dois estágios de publicação:

1. **Homologação local:** alterações são feitas no código e copiadas para `dist`. Execute `npm run verify:release` e depois `npm run preview:test`. A prévia abre em `http://localhost:4173` com banco temporário e dados fictícios.
2. **Produção:** somente o conteúdo aprovado em `dist` pode ser enviado ao GitHub Pages e ao backend de produção.

## Regra obrigatória

Nunca atualizar o GitHub Pages antes de:

- executar os testes da API;
- executar a verificação de integridade dos sete cards, imagens, links e painel;
- conferir visualmente o portal, a disciplina alterada e o painel na prévia local;
- preservar todos os recursos já publicados.

O comando de liberação é:

```powershell
npm run verify:release
```

Se qualquer disciplina, imagem ou recurso obrigatório desaparecer, o comando falha e a produção não deve ser atualizada.

