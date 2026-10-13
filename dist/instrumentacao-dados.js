// Conteúdo original de estudo. Não reproduz questões oficiais do SAEP.
export const characters = [
  {id:'lia',icon:'👩🏽‍🔬',name:'Lia',role:'Técnica de instrumentação',description:'Investiga sinais e compara medições com cuidado.'},
  {id:'nara',icon:'👩🏻‍🏭',name:'Nara',role:'Operadora de processos',description:'Observa as variáveis da planta e toma decisões seguras.'},
  {id:'caio',icon:'👨🏿‍🔧',name:'Caio',role:'Calibrador',description:'Confere instrumentos e registra evidências.'},
  {id:'pixel',icon:'🤖',name:'Pixel',role:'Assistente de campo',description:'Ajuda a transformar dados em decisões.'}
];

export const missions = [
  {
    id:'fundamentos',icon:'🧭',world:'Estação 1 · Medir',title:'O que a instrumentação faz',
    intro:'Uma planta industrial precisa conhecer o que acontece em seus tanques, tubulações e máquinas antes de controlar o processo.',
    concepts:[
      ['Variável de processo','É uma grandeza que muda durante a operação, como temperatura, pressão, nível ou vazão.','A temperatura de um forno é uma variável de processo.'],
      ['Medição','É a comparação de uma grandeza com uma referência para produzir um valor com unidade.','Ler 80 °C é mais útil do que dizer apenas “está quente”.'],
      ['Sensor e transdutor','O sensor percebe a grandeza; um transdutor transforma uma forma de energia ou sinal em outra. Em alguns equipamentos as funções se combinam.','Um termopar gera uma pequena tensão relacionada à diferença de temperatura.'],
      ['Transmissor e indicador','O transmissor prepara e envia o valor medido; o indicador apresenta esse valor para leitura.','Um transmissor envia 4–20 mA e o painel mostra a pressão em kPa.'],
      ['Controlador e elemento final','O controlador compara a medida com o valor desejado e decide uma ação. O elemento final atua fisicamente no processo.','O controlador manda abrir uma válvula para ajustar a vazão.']
    ],
    gate:{q:'Um tanque precisa mostrar ao operador o nível medido. Qual função apresenta o valor para leitura?',o:['Indicador','Válvula de controle','Fonte de alimentação','Tubulação','Elemento de aquecimento'],c:0,why:'O indicador apresenta a medição; o sensor e o transmissor participam da obtenção e envio do sinal.'}
  },
  {
    id:'metrologia',icon:'📏',world:'Estação 2 · Comparar',title:'Qualidade da medição',
    intro:'Uma leitura confiável depende de faixa adequada, interpretação dos erros e comparação com referências.',
    concepts:[
      ['Faixa e span','A faixa vai do limite inferior ao superior. Span é a diferença entre esses limites.','Para 20 a 120 °C, a faixa é 20–120 °C e o span é 100 °C.'],
      ['Exatidão e precisão','Exatidão é proximidade do valor de referência; precisão descreve quão próximas ficam medições repetidas.','Leituras repetidas em 90 °C para um padrão de 100 °C podem ser precisas, mas pouco exatas.'],
      ['Resolução e sensibilidade','Resolução é o menor incremento distinguível na indicação; sensibilidade relaciona a mudança da saída à mudança da entrada.','Um visor que muda de 0,1 em 0,1 °C tem resolução de 0,1 °C.'],
      ['Histerese e zona morta','Histerese é a diferença de resposta para o mesmo ponto alcançado em subida ou descida; zona morta é uma mudança de entrada sem resposta perceptível.','Uma válvula pode começar a mover em valores diferentes ao abrir e ao fechar.'],
      ['Calibração e rastreabilidade','Calibrar é comparar indicações com referências em condições definidas; rastreabilidade liga a medição a padrões por uma cadeia documentada.','O certificado registra pontos medidos, padrão usado e incerteza.']
    ],
    gate:{q:'Um instrumento mede de 20 a 120 °C. Qual é seu span?',o:['20 °C','100 °C','120 °C','140 °C','Não é possível calcular'],c:1,why:'Span = limite superior − limite inferior = 120 − 20 = 100 °C.'}
  },
  {
    id:'pressao',icon:'🔵',world:'Estação 3 · Pressão',title:'Pressão na tubulação',
    intro:'Pressão pode ser comparada ao vácuo, à atmosfera ou a outro ponto do processo.',
    concepts:[
      ['Pressão absoluta e manométrica','A absoluta usa o vácuo como referência. A manométrica compara o processo com a pressão atmosférica local.','Um manômetro comum pode indicar zero quando está aberto para a atmosfera.'],
      ['Pressão diferencial','É a diferença de pressão entre dois pontos.','Um filtro pode ser acompanhado pela diferença entre entrada e saída.'],
      ['Manômetro','Indica pressão localmente. O modelo deve ter faixa e conexão compatíveis com o processo.','Um manômetro na linha permite conferência visual durante a inspeção.'],
      ['Coluna hidrostática','Em um líquido parado, a pressão devido à coluna cresce com densidade, gravidade e altura: p = ρgh.','Um ponto mais profundo de um tanque sente maior pressão da coluna líquida.'],
      ['Diagnóstico por diferencial','Uma queda de pressão anormal em um componente pode indicar obstrução ou mudança no escoamento.','Um filtro que acumula sujeira tende a apresentar maior diferença de pressão.']
    ],
    gate:{q:'Para acompanhar o entupimento de um filtro, qual grandeza é mais útil?',o:['Cor externa do filtro','Diferença de pressão entre entrada e saída','Tensão da iluminação','Data de fabricação','Altura do operador'],c:1,why:'A pressão diferencial permite acompanhar a perda de carga no filtro.'}
  },
  {
    id:'temperatura',icon:'🌡️',world:'Estação 4 · Temperatura',title:'Calor sob observação',
    intro:'Escolher o sensor de temperatura exige considerar faixa, instalação e comportamento do processo.',
    concepts:[
      ['RTD Pt100','É um detector resistivo de temperatura feito de platina; sua resistência nominal é 100 Ω a 0 °C.','Em uma faixa usual, a resistência da Pt100 aumenta com a temperatura.'],
      ['Termopar','Dois metais distintos geram uma tensão relacionada à diferença de temperatura entre as junções.','Um forno pode usar termopar quando a faixa de temperatura é elevada.'],
      ['Compensação da junta fria','A leitura do termopar precisa considerar a temperatura da junção de referência.','Um transmissor compensa a temperatura dos bornes para calcular a temperatura de processo.'],
      ['Termistor','É um resistor muito sensível à temperatura, com resposta não linear; seu tipo e faixa determinam o uso.','Um termistor NTC reduz a resistência quando aquece.'],
      ['Poço termométrico','Protege o sensor e permite sua retirada sem expor diretamente o processo, quando o projeto da instalação permite.','O técnico retira a Pt100 do poço para manutenção sem abrir a linha.']
    ],
    gate:{q:'Qual instrumento é um detector resistivo de platina com 100 Ω nominais a 0 °C?',o:['Termopar tipo K','Pt100','Turbina','Manômetro','Válvula'],c:1,why:'Pt100 é o nome comum do RTD de platina com 100 Ω nominais a 0 °C.'}
  },
  {
    id:'nivel',icon:'🛢️',world:'Estação 5 · Nível',title:'Quanto há no tanque',
    intro:'A escolha da medição de nível depende do líquido, do tanque e da necessidade de leitura contínua ou apenas de alarme.',
    concepts:[
      ['Nível contínuo e pontual','A medição contínua acompanha a altura ao longo da faixa; a pontual detecta um limite específico.','Um transmissor informa 63%; uma chave de nível sinaliza “alto”.'],
      ['Boia','A flutuação acompanha a superfície do líquido e pode acionar indicação ou contato.','Uma boia pode disparar alarme de nível alto.'],
      ['Nível hidrostático','Usa a pressão no fundo de um tanque para inferir a altura de líquido, conhecendo a densidade.','Se a densidade mudar, a conversão de pressão para nível precisa ser revista.'],
      ['Ultrassom','Mede a distância até a superfície pelo tempo de retorno de uma onda sonora; a instalação e o meio afetam a leitura.','Espuma intensa ou obstáculos podem prejudicar o eco.'],
      ['Escolha da aplicação','A tecnologia deve considerar espuma, vapor, densidade, corrosão e geometria.','Para alarme simples de transbordamento, uma chave pontual pode bastar.']
    ],
    gate:{q:'Para acionar um alarme quando o tanque atingir apenas o limite alto, que tipo de medição pode bastar?',o:['Pontual','Contínua obrigatoriamente','De vazão','De pH','De velocidade'],c:0,why:'Uma chave de nível pontual detecta a chegada ao limite configurado.'}
  },
  {
    id:'vazao',icon:'💧',world:'Estação 6 · Vazão',title:'Fluxo na linha',
    intro:'Vazão descreve quanto fluido passa em um intervalo de tempo. O princípio de medição precisa combinar com o fluido.',
    concepts:[
      ['Vazão volumétrica e mássica','A volumétrica informa volume por tempo; a mássica, massa por tempo.','m³/h é vazão volumétrica; kg/h é vazão mássica.'],
      ['Elemento de restrição','Uma placa de orifício causa diferença de pressão relacionada ao escoamento.','O transmissor diferencial mede a queda de pressão na placa.'],
      ['Turbina','O rotor gira com o escoamento; a rotação é relacionada à vazão dentro das condições especificadas.','O medidor com turbina precisa de condições de instalação adequadas.'],
      ['Eletromagnético','Aplica o princípio de indução em líquidos eletricamente condutivos.','Pode medir água condutiva, mas não é escolha para óleo isolante.'],
      ['Totalização','Soma o volume ou a massa que passou durante um período; é diferente da vazão instantânea.','O painel mostra 12 m³/h agora e 350 m³ acumulados no turno.']
    ],
    gate:{q:'Qual unidade representa vazão volumétrica?',o:['kg','°C','m³/h','kPa','Ω'],c:2,why:'m³/h representa volume dividido pelo tempo.'}
  },
  {
    id:'sinais',icon:'📡',world:'Estação 7 · Sinais',title:'Do campo ao controle',
    intro:'A medida precisa viajar do instrumento ao controlador com faixa e escala corretamente configuradas.',
    concepts:[
      ['Malha de 4–20 mA','Em uma escala linear usual, 4 mA representam 0% e 20 mA, 100%.','Um nível de 50% corresponde a 12 mA se a escala for linear.'],
      ['Zero vivo','Os 4 mA no mínimo ajudam a distinguir uma leitura válida de uma falha como circuito aberto, que pode levar a corrente para perto de zero.','0 mA não deve ser interpretado automaticamente como 0% de processo.'],
      ['Escalonamento','Converte a corrente para unidades de engenharia usando os limites configurados.','Em 0–200 kPa, 12 mA representam 100 kPa numa escala linear.'],
      ['Malha fechada','O controlador compara a variável medida com o valor desejado e corrige o processo pela saída.','Ao medir nível baixo, o controlador pode aumentar a entrada de líquido.'],
      ['Válvula de controle','É um elemento final que modifica a passagem do fluido conforme o comando e o projeto de segurança.','O posicionador recebe o sinal e ajuda a ajustar a abertura da válvula.']
    ],
    gate:{q:'Em uma escala linear de 4–20 mA, qual corrente representa 50%?',o:['0 mA','4 mA','8 mA','12 mA','20 mA'],c:3,why:'A metade do intervalo de 16 mA é 8 mA; 4 + 8 = 12 mA.'}
  },
  {
    id:'diagramas',icon:'🗺️',world:'Estação 8 · Diagnóstico',title:'Diagramas, testes e segurança',
    intro:'Uma boa medição também depende de identificar a malha, testar com segurança e registrar o que foi encontrado.',
    concepts:[
      ['P&ID e identificação','O diagrama de tubulação e instrumentação mostra equipamentos, linhas e funções de instrumentação. Tags ajudam a localizar instrumentos.','PT costuma identificar um transmissor de pressão; confirme a convenção no projeto.'],
      ['Teste de malha','Verifica o caminho completo do sinal, do campo à indicação ou ação no sistema.','Simular 12 mA e observar 50% no controlador ajuda a conferir a escala.'],
      ['Como encontrado e como deixado','Registre a condição antes de qualquer ajuste e depois da intervenção.','O relatório mostra o desvio inicial e o resultado final.'],
      ['Intervenção segura','Siga procedimento local: autorização, isolamento, desenergização e controle da energia antes de abrir equipamentos.','Não remova um transmissor de uma linha pressurizada sem isolamento e liberação.'],
      ['Registro e rastreabilidade','Documente tag, faixa, padrão, pontos, data, responsável e resultado para análise posterior.','Um registro permite saber qual padrão foi usado na calibração.']
    ],
    gate:{q:'Um técnico vai retirar um transmissor instalado em linha pressurizada. Qual é a primeira decisão segura?',o:['Soltar a conexão rapidamente','Isolar e despressurizar conforme procedimento autorizado','Aumentar a pressão','Ignorar o procedimento','Apenas desligar a tela do painel'],c:1,why:'A intervenção precisa controlar as energias e a pressão antes da abertura da linha.'}
  }
];

// Cada questão apresenta uma situação de trabalho original, cinco alternativas e uma explicação.
// O simulado é público e formativo; não deve ser usado como prova oficial.
const rows = [
  ['fundamentos','Uma operadora acompanha um forno e precisa saber qual grandeza varia quando ele aquece. Qual é a variável de processo?', ['Número de série do forno','Temperatura interna','Nome do fabricante','Cor da etiqueta','Data de compra'],1,'Temperatura é a grandeza que muda durante a operação.'],
  ['fundamentos','No painel aparece 72 °C. O que torna essa informação uma medição útil?', ['O valor estar sem unidade','O valor ter sido escolhido ao acaso','Haver um valor relacionado a uma unidade e referência','A tela ser colorida','O número ser inteiro'],2,'A medição expressa uma grandeza por valor e unidade, obtidos com referência.'],
  ['fundamentos','Um elemento em contato com o processo detecta uma mudança de temperatura. Qual função ele desempenha?', ['Sensor','Válvula','Controlador','Registrador de produção','Atuador pneumático'],0,'O sensor percebe a grandeza do processo.'],
  ['fundamentos','Um dispositivo recebe a medida de pressão e envia um sinal padronizado ao painel. Qual é sua função?', ['Isolamento térmico','Transmissão da medida','Abertura da válvula','Armazenamento de líquido','Filtragem mecânica'],1,'O transmissor prepara e envia a informação de medição.'],
  ['fundamentos','O controlador envia um comando para reduzir a passagem de vapor. Qual equipamento executa a ação física?', ['Indicador','Sensor','Registrador','Válvula de controle','Manômetro'],3,'A válvula é um elemento final de controle que altera o processo.'],
  ['metrologia','Um termômetro trabalha de 10 a 110 °C. Qual é seu span?', ['10 °C','100 °C','110 °C','120 °C','Não há span'],1,'Span é a diferença entre limites: 110 − 10 = 100 °C.'],
  ['metrologia','Um instrumento repete 89,9; 90,0; 90,1 °C para um padrão de 100 °C. Qual descrição é adequada?', ['Pouco preciso e exato','Preciso, mas pouco exato','Exato e impreciso','Sem desvio','Incapaz de repetir'],1,'As leituras são próximas entre si, mas distantes do valor de referência.'],
  ['metrologia','O visor de uma balança muda de 0,1 em 0,1 kg. Qual característica está indicada?', ['Span','Histerese','Resolução','Rastreabilidade','Zona morta'],2,'Resolução é o menor incremento distinguível na indicação.'],
  ['metrologia','Ao subir e descer a pressão, o instrumento indica valores diferentes para o mesmo ponto. Qual efeito foi observado?', ['Histerese','Zero vivo','Vazão mássica','Compensação','Totalização'],0,'Histerese é a diferença de resposta no mesmo ponto para trajetórias de subida e descida.'],
  ['metrologia','Antes de ajustar um transmissor, a técnica compara suas leituras com um padrão documentado. Qual atividade ela inicia?', ['Aquecimento','Calibração','Pintura','Totalização','Filtragem'],1,'Calibração compara o instrumento a referências em condições definidas.'],
  ['pressao','Um manômetro aberto para a atmosfera indica zero. A qual referência ele está associado?', ['Vácuo absoluto','Pressão atmosférica local','Temperatura da linha','Massa do fluido','Corrente do circuito'],1,'Pressão manométrica usa a atmosfera local como referência.'],
  ['pressao','Um filtro apresenta 20 kPa na entrada e 14 kPa na saída. Qual é a pressão diferencial?', ['6 kPa','14 kPa','20 kPa','34 kPa','280 kPa'],0,'A diferença é 20 − 14 = 6 kPa.'],
  ['pressao','Durante a ronda, o técnico precisa ler pressão no ponto de instalação sem abrir o painel. Qual instrumento atende diretamente?', ['Termopar','Boia','Manômetro local','Totalizador','Sensor de luz'],2,'O manômetro permite indicação local de pressão.'],
  ['pressao','Dois pontos do mesmo líquido parado estão a profundidades diferentes. Qual tende a ter maior pressão hidrostática?', ['O mais raso','O mais profundo','Ambos sempre zero','O mais iluminado','O mais próximo da tampa, independentemente da altura'],1,'A pressão da coluna cresce com a profundidade, se densidade e gravidade forem as mesmas.'],
  ['pressao','A diferença de pressão em um filtro cresce continuamente durante a produção. Qual hipótese deve ser investigada primeiro?', ['Obstrução progressiva do filtro','Melhora garantida da filtragem','Falha do relógio da sala','Mudança na cor do painel','Diminuição obrigatória da densidade'],0,'Maior perda de carga pode indicar acúmulo de material; confirme as condições de operação.'],
  ['temperatura','Uma Pt100 foi escolhida para medir a temperatura de um tanque. Qual propriedade do elemento é usada?', ['Variação da resistência elétrica','Giro de uma turbina','Pressão diferencial','Flutuação','Reflexão de som'],0,'Pt100 é um detector resistivo de platina.'],
  ['temperatura','Um forno usa um sensor formado por dois metais diferentes que gera pequena tensão. Qual é ele?', ['Boia','Termopar','Manômetro','Placa de orifício','Válvula globo'],1,'O termopar usa o efeito termoelétrico entre metais distintos.'],
  ['temperatura','A leitura de um termopar mudou após aquecimento dos bornes. O que o transmissor precisa considerar?', ['A cor do fio','A pressão da tubulação','A compensação da junta de referência','O nível do tanque','A rotação da bomba'],2,'A tensão do termopar depende da diferença entre junções; a referência precisa ser compensada.'],
  ['temperatura','Um NTC aquece durante um teste. Qual comportamento é esperado?', ['Resistência tende a diminuir','Resistência sempre vira zero','Vazão aumenta automaticamente','Pressão absoluta cai','O termistor gera sinal de nível'],0,'NTC tem coeficiente negativo de temperatura: a resistência cai quando a temperatura sobe.'],
  ['temperatura','A equipe precisa retirar um sensor de temperatura para manutenção sem abrir a tubulação, conforme projeto. Qual componente ajuda?', ['Placa de orifício','Poço termométrico','Boia','Manômetro','Filtro de linha'],1,'O poço separa o sensor do fluido e permite retirada conforme o projeto de instalação.'],
  ['nivel','O painel deve mostrar de 0% a 100% do tanque durante todo o turno. Qual tipo de medição é necessário?', ['Pontual apenas','Contínua','Somente alarme alto','Somente termometria','Apenas totalização de vazão'],1,'A medição contínua acompanha a altura ao longo da faixa.'],
  ['nivel','Uma boia sobe com a superfície do líquido e aciona um contato no limite. Que função ela pode cumprir?', ['Alarme de nível','Medição de pressão absoluta','Compensação de termopar','Medição de corrente','Filtragem'],0,'A boia acompanha o nível e pode acionar uma chave pontual.'],
  ['nivel','Um transmissor no fundo converte pressão em nível. O líquido foi trocado por outro de densidade diferente. O que deve ser revisto?', ['Somente a cor do painel','A conversão hidrostática para altura','O número do tanque','A tensão da iluminação','A data do turno'],1,'A pressão hidrostática depende da densidade; a escala de nível pode mudar.'],
  ['nivel','Um medidor ultrassônico perde o eco quando há muita espuma. Qual explicação é mais plausível?', ['A espuma interfere no retorno do sinal acústico','A espuma torna a pressão absoluta zero','O medidor virou manômetro','A corrente de 4 mA indica 100%','A boia deixou de existir'],0,'A superfície e o meio de propagação afetam o eco ultrassônico.'],
  ['nivel','A única necessidade é avisar quando o reservatório chegar ao limite alto. Qual solução pode ser suficiente?', ['Chave pontual de nível','Medidor mássico de vazão','Termopar com junta fria','Manômetro de vácuo','Totalizador de energia'],0,'Uma chave pontual pode detectar o limite alto sem medir toda a faixa.'],
  ['vazao','Uma linha informa 15 m³/h de água. Que grandeza está sendo indicada?', ['Vazão volumétrica','Vazão mássica','Pressão','Temperatura','Nível'],0,'m³/h é volume por unidade de tempo.'],
  ['vazao','O relatório de produção informa 800 kg/h de produto. Qual é o tipo de vazão?', ['Volumétrica','Mássica','Pontual','Hidrostática','Elétrica'],1,'kg/h expressa massa por unidade de tempo.'],
  ['vazao','Uma placa de orifício foi instalada em tubulação. Que sinal primário pode ser medido para inferir vazão?', ['Cor do fluido','Diferença de pressão na restrição','Altura do prédio','Frequência do relógio','Peso do painel'],1,'A restrição produz uma diferença de pressão relacionada ao escoamento.'],
  ['vazao','Uma indústria quer medir um líquido eletricamente condutivo sem peça móvel no escoamento. Qual princípio é candidato?', ['Eletromagnético','Boia simples','Termopar','Manômetro de Bourdon','Poço termométrico'],0,'Medidores eletromagnéticos aplicam indução em líquidos condutivos.'],
  ['vazao','O painel mostra 10 m³/h agora e 300 m³ no turno. O segundo valor representa:', ['Pressão diferencial','Total acumulado','Temperatura instantânea','Resolução do sensor','Corrente mínima'],1,'Totalização soma a quantidade que passou durante o período.'],
  ['sinais','Um transmissor linear indica 4 mA no mínimo e 20 mA no máximo. Qual corrente corresponde a 25%?', ['0 mA','4 mA','8 mA','12 mA','16 mA'],2,'25% de 16 mA são 4 mA; 4 + 4 = 8 mA.'],
  ['sinais','Um cabo de sinal 4–20 mA se rompe e o receptor lê corrente próxima de zero. Qual interpretação é mais segura?', ['Processo em 0% confirmado','Possível falha do circuito','Processo em 50%','Escala em 100%','Calibração perfeita'],1,'Zero vivo: 0 mA está fora da faixa normal e pode indicar falha.'],
  ['sinais','Um transmissor 0–200 kPa envia 16 mA em escala linear. Qual pressão corresponde?', ['50 kPa','100 kPa','150 kPa','200 kPa','250 kPa'],2,'16 mA são 75% do intervalo 4–20 mA; 75% de 200 kPa = 150 kPa.'],
  ['sinais','O nível cai abaixo do valor desejado e o controlador aumenta a entrada de líquido usando a medida recebida. Que estratégia aparece?', ['Malha fechada','Controle sem realimentação','Medição sem ação','Somente indicação local','Totalização manual'],0,'Na malha fechada a ação usa a diferença entre medida e valor desejado.'],
  ['sinais','Uma válvula recebe comando do controlador e muda a passagem de fluido. Qual papel ocupa?', ['Padrão de calibração','Elemento final de controle','Sensor de temperatura','Unidade de pressão','Indicador passivo'],1,'A válvula modifica fisicamente o processo.'],
  ['diagramas','No P&ID de uma planta, aparece a tag PT-101. Pela convenção adotada no desenho, o que ela indica?', ['Transmissor de pressão','Termopar de vazão','Válvula de nível','Totalizador de massa','Bomba de pressão'],0,'PT é usado para pressure transmitter; confirme sempre a legenda do projeto.'],
  ['diagramas','Um técnico injeta 12 mA na entrada e observa 50% no painel de uma malha 4–20 mA. O que o teste verifica?', ['Apenas a pintura do instrumento','A escala e o caminho de indicação da malha','A vazão mássica automaticamente','A resistência do poço termométrico','A cor do cabo'],1,'O teste de malha verifica se o sinal chega e é escalonado como previsto.'],
  ['diagramas','Antes do ajuste, um transmissor apresenta desvio. Qual registro deve ser feito primeiro?', ['Somente o valor após ajuste','Valores como encontrados','Apenas o nome do operador','Nenhum, se o ajuste for rápido','Somente uma foto da caixa'],1,'O registro como encontrado preserva a condição inicial para comparação.'],
  ['diagramas','Uma intervenção exige retirar transmissor de linha pressurizada. O que fazer antes de abrir a conexão?', ['Aumentar a pressão','Isolar, despressurizar e seguir a autorização local','Desligar só o monitor','Retirar sem comunicar','Usar o instrumento como alavanca'],1,'O controle de energias e da pressão vem antes da abertura segura.'],
  ['diagramas','Ao concluir uma calibração, qual registro permite rastrear a comparação?', ['Apenas “aprovado”','Tag, faixa, pontos, padrão, data e responsável','Somente a cor da válvula','Nome do turno sem resultados','Um número sem unidade'],1,'Documentação completa liga o resultado ao padrão e à intervenção realizada.']
];

export const practice = rows.map(([mission,text,options,correct,explain],i)=>{
  const target=i%5,shift=(target-correct+5)%5,balanced=Array(5);
  options.forEach((option,j)=>{balanced[(j+shift)%5]=option});
  return {
    id:i+1,mission,text,options:balanced,correct:target,explain,
    difficulty:i%5===0?'muito fácil':i%5===1?'fácil':i%5===2?'média':i%5===3?'média':'difícil'
  };
});

