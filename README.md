# Prova de Banco de Dados

O GitHub Pages serve a página; o Site existente em https://provabd.hebersonmiliano.chatgpt.site fornece a API e o banco D1.

## Uso pelo professor

A nova senha é entregue privadamente, fora deste repositório. Entre no painel e use **Baixar 200 códigos**. Cada turma tem 40 códigos aleatórios; os códigos previsíveis antigos não iniciam novas tentativas.

Os resultados antigos permanecem no histórico. Uma tentativa ativa reserva o código. Liberar um código revoga a tentativa em andamento e preserva as notas já recebidas.

O aluno só vê confirmação após a gravação no banco. Reenvios de uma tentativa válida retornam o mesmo protocolo e nota. A tentativa expira após 24 horas; o professor pode liberar o código novamente.

A correção usa a cópia das questões e alternativas guardada no servidor no início da tentativa. Alterações no navegador não mudam essa cópia, a identidade vinculada nem a nota calculada pelo servidor.

## Conteúdo confidencial

O gabarito e as 40 questões novas ficam exclusivamente na tabela private_question_bank do D1. Nenhum conteúdo real do banco ou senha pode ser incluído em código, testes, migrações, arquivos do GitHub Pages ou histórico Git. As questões antigas publicadas no histórico estão fora de uso; excluir um arquivo atual não apaga cópias históricas.

A carga do banco usa POST /api/teacher/bank com uma sessão autenticada. A resposta informa apenas a quantidade gravada. Não existe rota pública de exportação do banco. As tentativas recebem somente enunciados e alternativas.

## Autenticação

A senha usa PBKDF2-SHA256 com sal e 100.000 iterações. Os valores TEACHER_PASSWORD_SALT, TEACHER_PASSWORD_VERIFIER e ATTEMPT_SECRET são segredos do ambiente Sites. Não existe senha nem verificador de produção no repositório. Sessões antigas foram descontinuadas; as novas expiram em duas horas e são revogadas ao sair.

O login limita solicitações por IP a oito por quinze minutos. O início de prova aceita até 250 solicitações por IP a cada quinze minutos para permitir redes escolares compartilhadas. Os códigos possuem 80 bits aleatórios. Tentativas exigem um token HMAC, identidade vinculada e código reservado no banco. A correção nunca aceita a nota enviada pelo cliente.

## Recuperação

No mesmo endereço, aparelho e navegador utilizados pelo aluno, entre no painel do professor. **Baixar provas antigas deste navegador** aparece somente no painel quando há registros antigos. O download valida a sessão com o servidor. Use **Importar provas antigas** para recuperar o JSON sem duplicar registros. A importação é uma operação exclusiva do professor; os arquivos antigos não têm assinatura digital e precisam ser conferidos.

## Desenvolvimento

Node 24: npm ci, npm test, npm run build. A prévia usa node scripts/preview.mjs em http://localhost:4173, com senha teste-local e questões fictícias.

Edite server/client.js e server/page.html. O build gera dist/index.html para GitHub Pages e o Worker em dist/server para Sites. Alterações no esquema usam npm run db:generate. Nunca reescreva migrações aplicadas.

Publique a API e suas migrações antes da página. Configure os segredos e carregue o banco privado antes de aplicar provas. Testes públicos usam dados fictícios.

## Limites

Atalhos de inspeção podem ser bloqueados apenas como barreira de interface. O navegador do aluno continua sob controle dele. Registro de saídas, cópia local e teclas não constituem prova confiável de cola. A proteção implementada está na autenticação, reserva da tentativa, sigilo do banco e correção no servidor.
