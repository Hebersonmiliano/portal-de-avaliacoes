# Prova de Banco de Dados

A página do aluno e o painel permanecem no GitHub Pages. O serviço de recebimento usa o Site existente em `https://provabd.hebersonmiliano.chatgpt.site`, com banco D1 central.

## Aplicação

- Acesso do professor: use a senha existente. O painel atualiza a cada 15 segundos.
- O aluno só vê a confirmação quando o banco recebe a prova, com protocolo.
- Se houver falha de conexão, as respostas ficam pendentes no navegador e podem ser reenviadas. O reenvio usa o mesmo protocolo e não duplica o resultado.
- Cada código é bloqueado no banco após o recebimento. Liberar o código preserva as notas anteriores.
- As notas usam duas casas decimais para preservar os incrementos de 0,25.
- O banco original continha 39 questões. A nova versão contém 40; notas antigas são importadas sem recalcular.

## Recuperação de provas anteriores

No mesmo endereço, aparelho e navegador utilizados pelo aluno, a página mostra **Baixar provas antigas deste navegador** quando encontra registros antigos. Entregue o arquivo JSON ao professor e use **Importar provas antigas** no painel. A importação exige a senha do professor e evita duplicatas. Ela não recupera dados apagados do navegador.

## Desenvolvimento

Node 24 ou superior. Execute `npm ci`, `npm test` e `npm run build`. Para conferir com um banco SQLite descartável: `node scripts/preview.mjs`; endereço `http://localhost:4173`, senha local `teste-local`. Esta senha só vale para a prévia local.

Edite `server/client.js` e `server/page.html`; o build gera `dist/index.html` para o GitHub Pages e `dist/server/index.js` para Sites. O banco é definido em `db/schema.ts`; use `npm run db:generate` para novas migrações. Nunca altere migrações já publicadas.

Publique primeiro o serviço Sites com a migração D1 e depois a página no GitHub Pages. O fluxo `.github/workflows/pages.yml` publica somente a página já gerada e a imagem. A senha existente é verificada pelo servidor; uma configuração `TEACHER_PASSWORD_HASH` no ambiente Sites pode substituir o hash legado. Nenhum token de sessão é enviado nos arquivos da página.
