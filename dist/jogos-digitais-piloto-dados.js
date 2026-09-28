// Questões formativas do piloto. Não contém enunciados nem gabarito da prova oficial.
export const topics = [
  {
    title:'Mecânica, regra e objetivo', icon:'🎮',
    learn:'Mecânica é uma ação disponível ao jogador, como correr ou coletar. Regra determina quando e como essa ação funciona. Objetivo é o resultado que o jogador tenta alcançar.',
    example:'No jogo Guardião dos Cristais, coletar cristais é uma mecânica; precisar de dez cristais para abrir o portal é uma regra; chegar ao portal é o objetivo.',
    check:{q:'Qual elemento descreve algo que o jogador pode fazer?',o:['Coletar itens durante a fase','O nome do arquivo do projeto','A data de publicação do jogo','A cor da marca do estúdio'],c:0,why:'Coletar é uma ação do jogador; por isso, é uma mecânica.'},
    sim:{q:'Em um jogo de exploração, o personagem pode combinar duas peças para fabricar uma ferramenta. O que essa possibilidade representa?',o:['Um objetivo final','Uma mecânica de criação','Uma plataforma de publicação','Um formato de imagem'],c:1,why:'Combinar peças é uma ação disponível ao jogador: uma mecânica.'}
  },
  {
    title:'Ciclo principal do jogo', icon:'🔄',
    learn:'O core loop é a sequência de ações que se repete ao longo da partida. Ele ajuda a definir o que o jogador fará muitas vezes e por que continuará jogando.',
    example:'Explorar uma sala → encontrar recursos → superar um obstáculo → ganhar uma melhoria → explorar a próxima sala.',
    check:{q:'O que caracteriza um core loop?',o:['Um desenho usado uma única vez','A sequência recorrente de ações do jogador','O endereço do site do jogo','Somente a tela de abertura'],c:1,why:'O ciclo principal reúne ações que voltam a acontecer durante a experiência.'},
    sim:{q:'Em um jogo de culinária, o participante recebe pedidos, prepara pratos, entrega e ganha moedas para comprar ingredientes. O que a sequência descreve?',o:['Uma configuração gráfica','O nome de uma cena','O ciclo principal da partida','Um erro de programação'],c:2,why:'Receber, preparar, entregar e melhorar formam a rotina repetida do jogo.'}
  },
  {
    title:'Um marco da história dos jogos', icon:'🚀',
    learn:'Spacewar! surgiu em 1962 em um computador PDP-1. Dois participantes comandavam naves em um confronto. Conhecer esse exemplo ajuda a reconhecer um marco inicial dos jogos digitais.',
    example:'Mesmo sem os gráficos atuais, Spacewar! já explorava interação entre jogadores e regras de movimento e combate.',
    check:{q:'Qual jogo de 1962 é um marco histórico dos jogos em computador?',o:['Pac-Man','Spacewar!','Minecraft','Pong'],c:1,why:'Spacewar! estreou em 1962 e se tornou uma referência histórica.'},
    sim:{q:'Uma exposição mostra um confronto entre duas naves no PDP-1, criado no início dos anos 1960. Qual título corresponde à descrição?',o:['Spacewar!','Tetris','Super Mario Bros.','The Sims'],c:0,why:'A descrição do PDP-1 e das duas naves se refere a Spacewar!.'}
  },
  {
    title:'Plataforma, modo e linguagem visual', icon:'🧭',
    learn:'Plataforma indica onde o jogo roda, como celular ou computador. Modo de participação indica como as pessoas jogam, como sozinho ou em grupo. Linguagem visual descreve o estilo das imagens, como pixel art.',
    example:'Um jogo mobile, multiplayer e em pixel art usa celular como plataforma, vários participantes como modo e pixels aparentes como estilo visual.',
    check:{q:'Na descrição “mobile, multiplayer e pixel art”, qual termo indica a plataforma?',o:['Multiplayer','Pixel art','Mobile','Nenhum deles'],c:2,why:'Mobile informa que o jogo foi pensado para aparelhos móveis.'},
    sim:{q:'Uma equipe fará um jogo para computador, cooperativo e com imagens em aquarela. Qual ordem representa plataforma, modo e visual?',o:['Computador, cooperativo, aquarela','Cooperativo, aquarela, computador','Aquarela, computador, cooperativo','Computador, aquarela, cooperativo'],c:0,why:'O computador é a plataforma; cooperativo é o modo; aquarela é o estilo visual.'}
  },
  {
    title:'Jogo de plataforma', icon:'🦘',
    learn:'Em um jogo de plataforma, o personagem percorre um cenário apoiando-se em superfícies, desviando de obstáculos e usando movimentos como correr e pular. Gravidade, chão, salto e câmera precisam funcionar juntos.',
    example:'Para atravessar um vão, o personagem salta; a gravidade o traz de volta e o chão impede que caia através da plataforma.',
    check:{q:'Qual conjunto de elementos é central em uma fase de plataforma?',o:['Gravidade, salto, chão e câmera','Somente caixas de texto','Apenas uma planilha de notas','Somente uma tela de créditos'],c:0,why:'Esses elementos sustentam o movimento e a leitura da fase de plataforma.'},
    sim:{q:'O personagem salta entre blocos suspensos, cai quando não alcança o próximo e a câmera acompanha seu caminho. Qual gênero descreve melhor essa fase?',o:['Jogo de cartas','Jogo de plataforma','Simulador de planilhas','Aplicativo de mensagens'],c:1,why:'Pular entre superfícies com gravidade é característica de jogo de plataforma.'}
  },
  {
    title:'Level design', icon:'🗺️',
    learn:'Level design organiza o espaço jogável: caminhos, obstáculos, inimigos e recompensas. Uma boa fase apresenta desafios em uma ordem que ajuda o jogador a aprender e progredir.',
    example:'Primeiro aparece um salto simples; depois, o mesmo salto com um inimigo; por fim, um caminho alternativo recompensa quem dominou o movimento.',
    check:{q:'Quem decide onde colocar obstáculos e recompensas em uma fase?',o:['A área de level design','Somente o sistema de áudio','O cadastro do professor','O navegador do jogador'],c:0,why:'Level design organiza os elementos e desafios no espaço da fase.'},
    sim:{q:'Um estudante muda a posição de plataformas para ensinar o salto antes de apresentar um obstáculo difícil. Qual trabalho ele está realizando?',o:['Compressão de áudio','Controle de versões','Level design','Tradução de interface'],c:2,why:'Ele organiza o espaço e a progressão dos desafios da fase.'}
  },
  {
    title:'Protótipo e teste da ideia', icon:'🧪',
    learn:'Protótipo é uma versão pequena feita para testar uma hipótese antes de produzir o jogo inteiro. Ele pode usar formas simples e apenas a mecânica principal. O objetivo é aprender cedo o que funciona.',
    example:'Antes de desenhar dez fases, a equipe cria uma sala com um personagem, um salto e um obstáculo. Observa outra pessoa jogar e ajusta o salto.',
    check:{q:'Por que criar um protótipo antes de produzir todas as fases?',o:['Para evitar qualquer teste','Para verificar cedo se a ideia funciona','Para substituir a versão final automaticamente','Para escolher apenas o nome do jogo'],c:1,why:'O protótipo permite testar a ideia com pouco custo e corrigir problemas cedo.'},
    sim:{q:'Uma equipe ainda não sabe se o gancho de movimento é divertido. Qual próximo passo é mais útil?',o:['Produzir toda a arte final','Publicar sem testar','Criar uma fase simples para observar jogadores','Comprar anúncios'],c:2,why:'Uma fase simples testa a mecânica antes de investir na produção completa.'}
  },
  {
    title:'GDevelop e eventos', icon:'⚙️',
    learn:'GDevelop permite construir lógica visual por eventos. Uma condição verifica se algo aconteceu; uma ação diz o que o jogo fará em resposta. Também é possível usar JavaScript em situações específicas.',
    example:'Condição: o jogador colide com uma moeda. Ações: aumentar os pontos e remover a moeda tocada.',
    check:{q:'Em um evento de coleta, qual parte verifica o contato com a moeda?',o:['A ação de somar pontos','A condição de colisão','O título da cena','O nome do estúdio'],c:1,why:'A condição verifica o contato; as ações acontecem quando ela é verdadeira.'},
    sim:{q:'Ao apertar um botão, uma porta deve abrir. No editor de eventos, como organizar essa lógica?',o:['A porta aberta é condição; apertar é ação','Não é preciso usar condição','Apertar o botão é condição; abrir a porta é ação','Cada evento precisa conter somente imagens'],c:2,why:'O acionamento do botão é verificado pela condição; abrir a porta é a ação.'}
  }
];
