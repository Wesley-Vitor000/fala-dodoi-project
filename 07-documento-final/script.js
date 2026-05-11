const chavePaciente = 'dadosPacienteTriagem';
const chaveLocais = 'locaisDorTriagem';
const chaveIntensidade = 'intensidadeDorTriagem';
const chaveDesconforto = 'desconfortosTriagem';
const chaveAnamnese = 'anamneseTriagem';
const chaveTea = 'protocoloTeaTriagem';

const btnVoltar = document.getElementById('btn-voltar');
const btnNovaTriagem = document.getElementById('btn-nova-triagem');
const btnImprimir = document.getElementById('btn-imprimir');

let dadosGlobais = null;
let analiseGlobal = null;

const API_ALERTA_GERAL = "https://fala-dodoi-project.onrender.com/alerta";
const API_ALERTA_COMISSAO = "https://fala-dodoi-project.onrender.com/alerta-comissao";

document.addEventListener('DOMContentLoaded', () => {
  preencherDocumento();
});

function lerStorage(chave, fallback) {
  const valor = localStorage.getItem(chave);
  return valor ? JSON.parse(valor) : fallback;
}

function formatarDataHora() {
  return new Date().toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

/* ========================= */
/* PROTOCOLO CLÍNICO         */
/* ========================= */

const pontuacoesSintomas = {
  'Ardência': 1,
  'Enjoo': 2,
  'Cefaleia': 3,
  'Formigamento': 4,
  'Febre': 5,
  'Vermelhidão': 6,
  'Edema': 7,
  'Choro': 8,
  'Irritabilidade': 9,
  'Falta de ar': 10,
  'Falta de Ar': 10,
  'Pressão no peito': 11,
  'Pressão': 11,
  'Dor em pontada': 12,
  'Pontada': 12
};

function nomePadraoSintoma(nome) {
  const mapa = {
    'Pontada': 'Dor em pontada',
    'Pressão': 'Pressão no peito',
    'Falta de Ar': 'Falta de ar'
  };

  return mapa[nome] || nome;
}

function obterPlanoReavaliacao(classificacao) {
  const nivel = classificacao.nivel;

  if (nivel === 'Respiratório/Cardíaco') {
    return {
      gravidade: 'Grave',
      tempo: '5–10 minutos',
      acao: 'Alerta + Comissão de Dor + ação imediata',
      resumo: 'Reavaliar rapidamente, manter segurança do paciente e acionar equipe responsável sem aguardar evolução espontânea.',
      passos: [
        'Acionar imediatamente a equipe responsável ou Comissão de Dor.',
        'Manter o paciente em segurança e em posição confortável.',
        'Monitorar sinais de piora durante todo o atendimento.',
        'Registrar a conduta adotada e a resposta observada.'
      ]
    };
  }

  if (nivel === 'Moderado' || nivel === 'Inflamatório' || nivel === 'Emocional') {
    return {
      gravidade: 'Moderada',
      tempo: '10–20 minutos',
      acao: 'Protocolo imediato + reavaliação obrigatória',
      resumo: 'Aplicar medidas padronizadas e não invasivas, sem esperar a dor piorar. Após o período definido, realizar nova checagem e registrar a evolução.',
      passos: [
        'Aplicar imediatamente a medida não farmacológica indicada pelo protocolo.',
        'Reduzir estímulos ambientais, como luz forte, ruído e excesso de pessoas.',
        'Oferecer acolhimento sensorial com voz calma, previsibilidade e apoio visual quando possível.',
        'Registrar qual medida foi aplicada.',
        'Reavaliar a resposta do paciente entre 10 e 20 minutos.',
        'Comparar a evolução: melhorou, manteve ou piorou.',
        'Se não houver melhora, preparar escalonamento para alerta vermelho ou Comissão de Dor.'
      ]
    };
  }

  if (nivel === 'Leve') {
    return {
      gravidade: 'Leve',
      tempo: '30–60 minutos',
      acao: 'Observação + medidas simples',
      resumo: 'Aplicar medidas simples de conforto, manter observação e reavaliar dentro do período indicado.',
      passos: [
        'Aplicar medida simples de conforto conforme o sintoma identificado.',
        'Manter ambiente calmo e previsível.',
        'Evitar intervenções excessivas ou toque desnecessário.',
        'Observar sinais de melhora ou piora.',
        'Reavaliar entre 30 e 60 minutos ou antes, caso haja mudança no quadro.'
      ]
    };
  }

  return {
    gravidade: 'Sem sinais pontuáveis',
    tempo: 'Conforme observação clínica',
    acao: 'Monitoramento',
    resumo: 'Não há sinal pontuável no protocolo. Manter observação e repetir avaliação se surgirem novos sintomas.',
    passos: [
      'Manter o paciente em ambiente confortável.',
      'Observar mudanças de comportamento ou novos sinais.',
      'Repetir a triagem caso surjam sintomas.'
    ]
  };
}

const protocolos = {
  'Cefaleia': {
    classificacao: 'Leve',
    emoji: '🟢',
    classe: 'risco-verde',
    diagnostico: 'Cefaleia',
    explicacao: 'A cefaleia em pacientes com TEA pode estar associada não apenas à dor física, mas também à sobrecarga sensorial, desidratação ou estresse ambiental.',
    medida: 'Ambiente silencioso + hidratação + compressa fria',
    execucao: [
      'Aproximar-se de forma calma, sem movimentos bruscos.',
      'Evitar contato físico imediato.',
      'Falar em tom de voz baixo e ritmo lento.',
      'Se possível, usar apoio visual ou gestual simples para indicar o que será feito.',
      'Reduzir luzes fortes, preferindo luz indireta.',
      'Diminuir ruídos, fechar portas e evitar conversas paralelas.',
      'Limitar a circulação de pessoas no ambiente.',
      'Manter o ambiente previsível, sem mudanças bruscas.',
      'Oferecer água em pequenos volumes, como copos pequenos ou canudo, se facilitar.',
      'Evitar insistência caso haja recusa, tentando novamente após alguns minutos.',
      'Observar sinais de náusea.',
      'Envolver gelo ou bolsa fria em tecido macio.',
      'Mostrar a compressa ao paciente antes de aplicar, evitando susto.',
      'Encostar primeiro de forma leve para adaptação sensorial.',
      'Aplicar na testa ou região referida por 10 a 15 minutos.',
      'Observar a reação durante todo o processo.'
    ],
    cuidados: [
      'Evitar toque inesperado.',
      'Sempre antecipar verbalmente ou gestualmente o que será feito.',
      'Respeitar recusa sensorial, pois nem todo paciente tolera frio.',
      'Observar sinais não verbais de desconforto, como agitação, retração ou choro.'
    ],
    conduta: 'Reavaliar intensidade da dor, considerar progressão do quadro e comunicar equipe assistencial ou Comissão de Dor se não houver melhora.'
  },

  'Enjoo': {
    classificacao: 'Leve',
    emoji: '🟢',
    classe: 'risco-verde',
    diagnostico: 'Enjoo',
    explicacao: 'O enjoo pode ser intensificado por odores, excesso de estímulos visuais, movimentação ou desconforto ambiental.',
    medida: 'Ambiente ventilado + repouso',
    execucao: [
      'Levar o paciente para local com circulação de ar, como janela aberta ou ventilação leve.',
      'Posicionar em repouso com cabeceira levemente elevada.',
      'Evitar odores fortes, como perfume, álcool ou alimentação próxima.',
      'Reduzir estímulos visuais e movimentação ao redor do paciente.'
    ],
    cuidados: [
      'Evitar mudanças bruscas de ambiente.',
      'Explicar a mudança antes de realizar.',
      'Permitir objeto de conforto, se houver.'
    ],
    conduta: 'Reavaliar se o sintoma persistir.'
  },

  'Formigamento': {
    classificacao: 'Moderado',
    emoji: '🟡',
    classe: 'risco-amarelo',
    diagnostico: 'Formigamento',
    explicacao: 'O formigamento pode estar relacionado a desconforto sensorial, compressão local ou alteração de percepção corporal.',
    medida: 'Massoterapia',
    execucao: [
      'Higienizar as mãos antes do contato.',
      'Avisar o paciente antes de tocar.',
      'Iniciar com toque leve e progressivo.',
      'Realizar movimentos circulares lentos.',
      'Observar a reação do paciente a cada estímulo.'
    ],
    cuidados: [
      'Alguns pacientes apresentam hipersensibilidade ao toque.',
      'Se houver rejeição, suspender imediatamente.',
      'Pode-se substituir por compressa fria se necessário e se houver tolerância.'
    ],
    conduta: 'Reavaliar a resposta do paciente após a intervenção.'
  },

  'Choro': {
    classificacao: 'Moderado',
    emoji: '🟡',
    classe: 'risco-amarelo',
    diagnostico: 'Choro',
    explicacao: 'O choro pode representar dor, medo, sobrecarga sensorial, dificuldade de comunicação ou necessidade de acolhimento.',
    medida: 'Musicoterapia + acolhimento + redução de estímulos',
    execucao: [
      'Reduzir estímulos do ambiente imediatamente.',
      'Falar com voz calma e frases curtas.',
      'Oferecer música suave, caso o paciente tolere.',
      'Manter presença próxima sem invadir o espaço pessoal.',
      'Permitir autorregulação, como balanço, objeto de conforto ou silêncio.'
    ],
    cuidados: [
      'Não forçar interação.',
      'Não elevar o tom de voz.',
      'Evitar múltiplos comandos ao mesmo tempo.'
    ],
    conduta: 'Se persistir, comunicar a equipe responsável.'
  },

  'Edema': {
    classificacao: 'Inflamatório',
    emoji: '🟠',
    classe: 'risco-laranja',
    diagnostico: 'Edema',
    explicacao: 'O edema indica inchaço local e pode estar associado a processo inflamatório, trauma ou retenção de líquido na região.',
    medida: 'Elevação de membro',
    execucao: [
      'Posicionar o membro acima do nível do coração, quando possível.',
      'Utilizar travesseiros ou apoio confortável.',
      'Manter alinhamento adequado do membro.',
      'Reavaliar a região após alguns minutos.'
    ],
    cuidados: [
      'Explicar o posicionamento antes de realizar.',
      'Evitar contenção forçada.',
      'Ajustar a posição conforme o conforto do paciente.'
    ],
    conduta: 'Reavaliar e comunicar equipe se houver piora, dor intensa, alteração de cor ou aumento do inchaço.'
  },

  'Falta de ar': {
    classificacao: 'Crítico',
    emoji: '🔴',
    classe: 'risco-vermelho',
    diagnostico: 'Falta de ar',
    explicacao: 'A falta de ar é um sinal de alerta e deve ser tratada como prioridade, especialmente quando associada a desconforto, agitação ou alteração do padrão respiratório.',
    medida: 'Exercícios respiratórios',
    execucao: [
      'Manter o paciente sentado ou em posição semi-Fowler.',
      'Orientar respiração lenta, modelando com o próprio corpo.',
      'Usar comando simples, como: “puxa o ar… solta devagar”.',
      'Demonstrar visualmente o movimento respiratório, especialmente em pacientes com TEA.'
    ],
    cuidados: [
      'Monitorar sinais de agravamento.',
      'Não insistir nos exercícios se houver piora.',
      'Evitar estímulos excessivos durante o episódio.'
    ],
    conduta: 'Encaminhamento imediato e alerta à equipe responsável ou Comissão de Dor.'
  },

  'Ardência': {
    classificacao: 'Leve',
    emoji: '🟢',
    classe: 'risco-verde',
    diagnostico: 'Ardência',
    explicacao: 'A ardência pode estar relacionada a irritação local, hipersensibilidade ou desconforto na região afetada.',
    medida: 'Compressa fria',
    execucao: [
      'Explicar ao paciente o que será feito antes da aplicação.',
      'Envolver a compressa fria em tecido macio.',
      'Mostrar a compressa antes de encostar na pele.',
      'Aplicar de forma leve na região referida.',
      'Observar sinais de rejeição ou piora do desconforto.'
    ],
    cuidados: [
      'Evitar toque inesperado.',
      'Respeitar recusa sensorial.',
      'Não aplicar frio direto na pele.'
    ],
    conduta: 'Reavaliar a resposta e comunicar a equipe se houver piora.'
  },

  'Febre': {
    classificacao: 'Inflamatório',
    emoji: '🟠',
    classe: 'risco-laranja',
    diagnostico: 'Febre',
    explicacao: 'A febre pode indicar alteração clínica sistêmica e deve ser acompanhada com atenção.',
    medida: 'Compressa morna + hidratação',
    execucao: [
      'Manter o paciente em ambiente confortável e ventilado.',
      'Oferecer hidratação em pequenos volumes, se permitido.',
      'Aplicar compressa morna na testa, nuca ou axila.',
      'Observar resposta do paciente e sinais associados.'
    ],
    cuidados: [
      'Evitar mudanças bruscas de temperatura.',
      'Não forçar hidratação em caso de recusa.',
      'Monitorar sinais de piora.'
    ],
    conduta: 'Comunicar a equipe se a febre persistir ou houver agravamento do quadro.'
  },

  'Vermelhidão': {
    classificacao: 'Inflamatório',
    emoji: '🟠',
    classe: 'risco-laranja',
    diagnostico: 'Vermelhidão',
    explicacao: 'A vermelhidão pode indicar irritação, pressão local, inflamação ou sensibilidade da região.',
    medida: 'Compressa fria no local',
    execucao: [
      'Observar a área afetada sem manipulação excessiva.',
      'Explicar antes de tocar ou aproximar a compressa.',
      'Aplicar compressa fria protegida por tecido.',
      'Evitar atrito ou pressão sobre a região.'
    ],
    cuidados: [
      'Não realizar toque brusco.',
      'Respeitar desconforto sensorial.',
      'Observar sinais como aumento da vermelhidão ou dor.'
    ],
    conduta: 'Reavaliar e comunicar equipe se houver progressão.'
  },

  'Irritabilidade': {
    classificacao: 'Emocional',
    emoji: '🟠',
    classe: 'risco-laranja',
    diagnostico: 'Irritabilidade',
    explicacao: 'A irritabilidade pode ser uma forma de comunicação de dor, desconforto, medo ou sobrecarga sensorial.',
    medida: 'Musicoterapia + massoterapia',
    execucao: [
      'Reduzir estímulos do ambiente.',
      'Falar em tom baixo e com frases simples.',
      'Permitir objeto de conforto ou presença de acompanhante.',
      'Oferecer música suave, se tolerada.',
      'Realizar toque terapêutico apenas se houver aceitação.'
    ],
    cuidados: [
      'Evitar múltiplas pessoas falando ao mesmo tempo.',
      'Não forçar contato físico.',
      'Permitir tempo para autorregulação.'
    ],
    conduta: 'Reavaliar comportamento e comunicar equipe se persistir ou piorar.'
  },

  'Pressão no peito': {
    classificacao: 'Crítico',
    emoji: '🔴',
    classe: 'risco-vermelho',
    diagnostico: 'Pressão no peito',
    explicacao: 'A pressão no peito é um sinal de alerta e exige avaliação profissional prioritária.',
    medida: 'Ambiente calmo + controle da respiração',
    execucao: [
      'Manter o paciente em repouso.',
      'Reduzir estímulos externos.',
      'Evitar esforço físico.',
      'Orientar respiração lenta se o paciente tolerar.',
      'Comunicar imediatamente a equipe responsável.'
    ],
    cuidados: [
      'Não minimizar a queixa.',
      'Não insistir em exercícios se houver piora.',
      'Monitorar sinais associados, como falta de ar, palidez ou agitação.'
    ],
    conduta: 'Acionamento imediato da equipe responsável ou Comissão de Dor.'
  },

  'Dor em pontada': {
    classificacao: 'Crítico',
    emoji: '🔴',
    classe: 'risco-vermelho',
    diagnostico: 'Dor em pontada',
    explicacao: 'A dor em pontada pode indicar desconforto agudo e deve ser observada conforme localização, intensidade e sinais associados.',
    medida: 'Repouso + acupuntura + massoterapia',
    execucao: [
      'Manter o paciente em repouso.',
      'Posicionar de forma confortável.',
      'Evitar manipulação brusca da região.',
      'Utilizar massoterapia leve apenas se houver aceitação.',
      'Encaminhar para avaliação profissional conforme intensidade e persistência.'
    ],
    cuidados: [
      'Avisar antes de qualquer toque.',
      'Observar sinais não verbais de piora.',
      'Suspender toque se houver rejeição.'
    ],
    conduta: 'Reavaliar e comunicar equipe se houver persistência, aumento da dor ou associação com sinais críticos.'
  }
};

function obterSintomasPontuados(desconfortos) {
  return desconfortos
    .map((item) => {
      const nome = nomePadraoSintoma(item.valor);
      const pontos = pontuacoesSintomas[nome];

      if (!pontos) return null;

      return { nome, pontos };
    })
    .filter(Boolean);
}

function calcularPontuacaoTotal(sintomas) {
  return sintomas.reduce((total, sintoma) => total + sintoma.pontos, 0);
}

function escolherSintomaPrincipal(sintomas) {
  if (sintomas.length === 0) return null;

  return sintomas.reduce((maior, atual) => {
    return atual.pontos > maior.pontos ? atual : maior;
  });
}

function classificarPorPontuacao(soma) {
  if (soma >= 25) {
    return {
      nivel: 'Respiratório/Cardíaco',
      status: 'Crítico',
      emoji: '🔴',
      classe: 'risco-vermelho',
      descricao: 'Classificação de alta prioridade. Recomenda-se avaliação imediata.'
    };
  }

  if (soma >= 19) {
    return {
      nivel: 'Emocional',
      status: 'Atenção',
      emoji: '🟠',
      classe: 'risco-laranja',
      descricao: 'Classificação compatível com sinais emocionais relevantes.'
    };
  }

  if (soma >= 11) {
    return {
      nivel: 'Inflamatório',
      status: 'Atenção',
      emoji: '🟠',
      classe: 'risco-laranja',
      descricao: 'Classificação compatível com possível componente inflamatório.'
    };
  }

  if (soma >= 6) {
    return {
      nivel: 'Moderado',
      status: 'Reavaliação necessária',
      emoji: '🟡',
      classe: 'risco-amarelo',
      descricao: 'Classificação compatível com dor ou desconforto moderado.'
    };
  }

  if (soma >= 1) {
    return {
      nivel: 'Leve',
      status: 'Conduta padrão',
      emoji: '🟢',
      classe: 'risco-verde',
      descricao: 'Classificação compatível com dor ou desconforto leve.'
    };
  }

  return {
    nivel: 'Sem sinais pontuáveis',
    status: 'Monitoramento',
    emoji: '⚪',
    classe: 'risco-neutro',
    descricao: 'Nenhum sintoma pontuável foi identificado no protocolo.'
  };
}

function criarListaHtml(titulo, itens, classeExtra = '') {
  if (!itens || itens.length === 0) return '';

  return `
    <div class="protocolo-grupo ${classeExtra}">
      <h4>${titulo}</h4>
      <ul>
        ${itens.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;
}

function gerarHtmlProtocolo(protocolo) {
  return `
    <div class="protocolo-clinico">
      <div class="protocolo-cabecalho ${protocolo.classe}">
        <span class="protocolo-emoji">${protocolo.emoji}</span>
        <div>
          <strong>Classificação: ${protocolo.classificacao}</strong>
          <p>Diagnóstico principal: ${protocolo.diagnostico}</p>
        </div>
      </div>

      <div class="protocolo-grupo interpretacao-clinica">
        <h4>Interpretação clínica</h4>
        <p>${protocolo.explicacao}</p>
      </div>

      <div class="protocolo-grupo medida-indicada">
        <h4>Medida não farmacológica indicada</h4>
        <p>${protocolo.medida}</p>
      </div>

      ${criarListaHtml('Execução — passo a passo clínico', protocolo.execucao, 'execucao-clinica')}
      ${criarListaHtml('Cuidados específicos para TEA', protocolo.cuidados, 'cuidados-tea')}

      <div class="protocolo-grupo plano-reavaliacao">
        <h4>Tempo de reavaliação e ação do sistema</h4>

        <div class="reavaliacao-grid">
          <div class="reavaliacao-item">
            <span>Gravidade</span>
            <strong>${protocolo.planoReavaliacao.gravidade}</strong>
          </div>

          <div class="reavaliacao-item">
            <span>Tempo de reavaliação</span>
            <strong>${protocolo.planoReavaliacao.tempo}</strong>
          </div>

          <div class="reavaliacao-item">
            <span>Ação do sistema</span>
            <strong>${protocolo.planoReavaliacao.acao}</strong>
          </div>
        </div>

        <p class="reavaliacao-resumo">${protocolo.planoReavaliacao.resumo}</p>

        <ul>
          ${protocolo.planoReavaliacao.passos.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="protocolo-grupo conduta-final">
        <h4>Conduta em caso de não melhora</h4>
        <p>${protocolo.conduta}</p>
      </div>
    </div>
  `;
}

function gerarAnaliseProtocolo(desconfortos) {
  const sintomas = obterSintomasPontuados(desconfortos);
  const soma = calcularPontuacaoTotal(sintomas);
  const classificacao = classificarPorPontuacao(soma);
  const sintomaPrincipal = escolherSintomaPrincipal(sintomas);
  const planoReavaliacao = obterPlanoReavaliacao(classificacao);

  const protocoloBase = sintomaPrincipal ? protocolos[sintomaPrincipal.nome] : null;

  const protocoloFinal = protocoloBase
    ? {
        ...protocoloBase,
        classificacao: classificacao.nivel,
        emoji: classificacao.emoji,
        classe: classificacao.classe,
        planoReavaliacao
      }
    : null;

  const sintomasTexto = sintomas.length
    ? sintomas.map((sintoma) => sintoma.nome).join(', ')
    : 'Nenhum sintoma pontuável identificado.';

  const interpretacaoClinica = sintomas.length
    ? `${classificacao.descricao} O protocolo foi gerado considerando o sintoma de maior prioridade clínica selecionado.`
    : 'Quadro sem sintomas pontuáveis no momento da triagem. Sugere-se manter monitoramento clínico e reavaliação caso surjam novos sinais.';

  const medidasHtml = protocoloFinal
    ? gerarHtmlProtocolo(protocoloFinal)
    : '<p>Não há protocolo específico disponível para os sinais informados. Sugere-se monitoramento clínico, conforto ambiental e reavaliação caso surjam novos sintomas.</p>';

  const alertaAtivo = classificacao.status === 'Crítico';

  const alertaTexto = alertaAtivo
    ? 'Atenção: classificação crítica identificada. Recomenda-se avaliação imediata da equipe responsável e acionamento da Comissão de Dor.'
    : '';

  const mensagemComissao = alertaAtivo
    ? `Alerta automático – Sistema Fala Dodói. Classificação: ${classificacao.nivel}. Sintomas identificados: ${sintomasTexto}. Solicita-se avaliação clínica especializada para definição de conduta terapêutica. Prioridade: Alta.`
    : '';

  return {
    sintomas,
    sintomasTexto,
    soma,
    classificacao,
    interpretacaoClinica,
    medidasHtml,
    alertaAtivo,
    alertaTexto,
    mensagemComissao
  };
}

/* ========================= */
/* TEXTO CLÍNICO AUTOMÁTICO */
/* ========================= */

function localParaTextoClinico(local) {
  const mapa = {
    'Região cefálica': 'região cefálica',
    'Região cervical': 'região cervical',
    'Região acromial direita': 'região acromial direita',
    'Região acromial esquerda': 'região acromial esquerda',
    'Região torácica': 'região torácica',
    'Região abdominal': 'região abdominal',
    'Região braquial anterior direita': 'região braquial anterior direita',
    'Região braquial anterior esquerda': 'região braquial anterior esquerda',
    'Região cubital direita': 'região cubital direita',
    'Região cubital esquerda': 'região cubital esquerda',
    'Região antebraquial direita': 'região antebraquial direita',
    'Região antebraquial esquerda': 'região antebraquial esquerda',
    'Região manual direita': 'região manual direita',
    'Região manual esquerda': 'região manual esquerda',
    'Região femoral direita': 'região femoral direita',
    'Região femoral esquerda': 'região femoral esquerda',
    'Região patelar direita': 'região patelar direita',
    'Região patelar esquerda': 'região patelar esquerda',
    'Região crural direita': 'região crural direita',
    'Região crural esquerda': 'região crural esquerda',
    'Região podálica direita': 'região podálica direita',
    'Região podálica esquerda': 'região podálica esquerda',
    'Região cefálica posterior': 'região cefálica posterior',
    'Região cervical posterior': 'região cervical posterior',
    'Região dorsal superior': 'região dorsal superior',
    'Região lombar': 'região lombar',
    'Região braquial posterior direita': 'região braquial posterior direita',
    'Região braquial posterior esquerda': 'região braquial posterior esquerda',
    'Região sural direita': 'região sural direita',
    'Região sural esquerda': 'região sural esquerda'
  };

  return mapa[local] || local.toLowerCase();
}

function montarTextoClinico(dados) {
  const partes = [];

  const locaisTraduzidos = dados.locais.length
    ? dados.locais.map(localParaTextoClinico).join(', ')
    : 'local não informado';

  const intensidade = dados.intensidade?.valor
    ? dados.intensidade.valor.toLowerCase()
    : 'não especificada';

  const desconfortos = dados.desconfortos.length
    ? dados.desconfortos.map(item => item.valor.toLowerCase()).join(', ')
    : null;

  let fraseInicial = `Paciente refere dor ${intensidade} em ${locaisTraduzidos}`;
  if (desconfortos) {
    fraseInicial += `, associada a ${desconfortos}`;
  }
  fraseInicial += '.';
  partes.push(fraseInicial);

  if (dados.anamnese.inicioDor) partes.push(`Início relatado: ${dados.anamnese.inicioDor.toLowerCase()}.`);
  if (dados.anamnese.duracaoDor) partes.push(`Padrão da dor: ${dados.anamnese.duracaoDor.toLowerCase()}.`);
  if (dados.anamnese.pioraDor) partes.push(`Piora com ${dados.anamnese.pioraDor.toLowerCase()}.`);
  if (dados.anamnese.melhoraDor) partes.push(`Melhora com ${dados.anamnese.melhoraDor.toLowerCase()}.`);
  if (dados.anamnese.sinaisAssociados) partes.push(`Sinais associados: ${dados.anamnese.sinaisAssociados}.`);
  if (dados.anamnese.observacoes) partes.push(`Observações da anamnese: ${dados.anamnese.observacoes}.`);
  if (dados.anamnese.dificuldadeComunicacao) partes.push('Paciente apresenta dificuldade de comunicação verbal.');
  if (dados.tea.itens.length > 0) partes.push(`Durante a avaliação, observou-se: ${dados.tea.itens.join(', ')}.`);
  if (dados.tea.observacoes) partes.push(`Observações complementares do protocolo TEA: ${dados.tea.observacoes}.`);

  return partes.join(' ');
}

/* ========================= */
/* PREENCHIMENTO DO DOCUMENTO */
/* ========================= */

function preencherDocumento() {
  const paciente = lerStorage(chavePaciente, { nome: '-', idade: '-', sexo: '-', prontuario: '-' });
  const locais = lerStorage(chaveLocais, []);
  const intensidade = lerStorage(chaveIntensidade, null);
  const desconfortos = lerStorage(chaveDesconforto, []);
  const anamnese = lerStorage(chaveAnamnese, {
    inicioDor: '',
    duracaoDor: '',
    pioraDor: '',
    melhoraDor: '',
    sinaisAssociados: '',
    observacoes: '',
    dificuldadeComunicacao: false
  });
  const tea = lerStorage(chaveTea, {
    itens: [],
    observacoes: ''
  });

  document.getElementById('data-hora-geracao').textContent = `Gerado em: ${formatarDataHora()}`;

  document.getElementById('doc-nome').textContent = paciente.nome || '-';
  document.getElementById('doc-idade').textContent = paciente.idade ? `${paciente.idade} anos` : '-';
  document.getElementById('doc-prontuario').textContent = paciente.prontuario || 'Não informado';

  document.getElementById('doc-locais').textContent = locais.length ? locais.join(', ') : '-';
  document.getElementById('doc-intensidade').textContent = intensidade ? intensidade.valor : '-';
  document.getElementById('doc-desconfortos').textContent = desconfortos.length
    ? desconfortos.map(item => item.valor).join(', ')
    : '-';

  document.getElementById('doc-inicio').textContent = anamnese.inicioDor || '-';
  document.getElementById('doc-duracao').textContent = anamnese.duracaoDor || '-';
  document.getElementById('doc-piora').textContent = anamnese.pioraDor || '-';
  document.getElementById('doc-melhora').textContent = anamnese.melhoraDor || '-';
  document.getElementById('doc-sinais').textContent = anamnese.sinaisAssociados || '-';
  document.getElementById('doc-observacoes').textContent = anamnese.observacoes || '-';

  document.getElementById('doc-tea').textContent = tea.itens.length ? tea.itens.join(', ') : '-';
  document.getElementById('doc-tea-obs').textContent = tea.observacoes || '-';

  dadosGlobais = {
    paciente,
    locais,
    intensidade,
    desconfortos,
    anamnese,
    tea
  };

  analiseGlobal = gerarAnaliseProtocolo(desconfortos);

  document.getElementById('texto-clinico-final').textContent = montarTextoClinico(dadosGlobais);

  const sintomasPontuados = document.getElementById('doc-sintomas-pontuados');
  if (sintomasPontuados) {
    sintomasPontuados.textContent = analiseGlobal.sintomasTexto;
  }

  document.getElementById('doc-pontuacao-protocolo').textContent =
    analiseGlobal.interpretacaoClinica;

  document.getElementById('doc-classificacao-protocolo').textContent =
    `${analiseGlobal.classificacao.emoji} ${analiseGlobal.classificacao.nivel}`;

  document.getElementById('doc-recomendacoes').innerHTML = analiseGlobal.medidasHtml;

  const cardRisco = document.getElementById('card-risco');
  const riscoIcone = document.getElementById('risco-icone');

  cardRisco.classList.add(analiseGlobal.classificacao.classe);
  riscoIcone.textContent = analiseGlobal.classificacao.emoji;

  const blocoAlerta = document.getElementById('bloco-alerta-clinico');

  if (analiseGlobal.alertaAtivo) {
    blocoAlerta.classList.remove('oculto');
    document.getElementById('doc-alerta-clinico').textContent = analiseGlobal.alertaTexto;
    document.getElementById('doc-mensagem-comissao').textContent = analiseGlobal.mensagemComissao;

    enviarAlertaComissaoDor(dadosGlobais, analiseGlobal)
      .catch((erro) => {
        console.error('Erro ao enviar alerta automático para Comissão de Dor:', erro);
      });
  }
}

function limparTriagemCompleta() {
  localStorage.removeItem(chavePaciente);
  localStorage.removeItem(chaveLocais);
  localStorage.removeItem(chaveIntensidade);
  localStorage.removeItem(chaveDesconforto);
  localStorage.removeItem(chaveAnamnese);
  localStorage.removeItem(chaveTea);

  sessionStorage.removeItem('alertaComissaoDorEnviado');
}

if (btnVoltar) {
  btnVoltar.addEventListener('click', () => {
    window.location.href = '../06-protocolo-tea/index.html';
  });
}

if (btnImprimir) {
  btnImprimir.addEventListener('click', () => {
    window.print();
  });
}

if (btnNovaTriagem) {
  btnNovaTriagem.addEventListener('click', () => {
    const confirmar = confirm('Deseja iniciar uma nova triagem? Os dados atuais serão apagados.');
    if (!confirmar) return;

    limparTriagemCompleta();
    window.location.href = '../01-identificacao/index.html';
  });
}


function definirStatusPainel(analiseProtocolo) {
  const status = analiseProtocolo.classificacao.status;
  const nivel = analiseProtocolo.classificacao.nivel;

  if (status === "Crítico" || nivel === "Respiratório/Cardíaco") {
    return "emergencia";
  }

  if (
    status === "Atenção" ||
    status === "Reavaliação necessária" ||
    nivel === "Moderado" ||
    nivel === "Inflamatório" ||
    nivel === "Emocional"
  ) {
    return "atencao";
  }

  return "estavel";
}

async function salvarAlertaNoPainel(dados, analiseProtocolo) {

  if (!dados || !analiseProtocolo) {
    throw new Error('Dados da triagem ainda não foram carregados.');
  }

  const novoAlerta = {
    id: Date.now(),
    nome: dados.paciente.nome || "Paciente não identificado",
    idade: dados.paciente.idade || "Não informada",
    prontuario: dados.paciente.prontuario || "Não informado",
    locais: dados.locais,
    intensidade: dados.intensidade ? dados.intensidade.valor : "Não informada",
    sintomas: analiseProtocolo.sintomasTexto,
    classificacao: analiseProtocolo.classificacao.nivel,
    mensagem: analiseProtocolo.alertaTexto || "Triagem finalizada",
    dataHora: new Date().toLocaleString("pt-BR"),
    status: definirStatusPainel(analiseProtocolo)
  };

  const resposta = await fetch(API_ALERTA_GERAL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(novoAlerta)
  });

  if (!resposta.ok) {
    throw new Error('Erro na API ao salvar alerta.');
  }
}
const btnSalvarAlerta = document.getElementById("btn-salvar-alerta");
const btnAbrirPainel = document.getElementById("btn-abrir-painel");
const btnAbrirComissao = document.getElementById("btn-abrir-comissao");

if (btnSalvarAlerta) {
  btnSalvarAlerta.addEventListener("click", async () => {
    try {
      await salvarAlertaNoPainel(dadosGlobais, analiseGlobal);

      if (analiseGlobal && (analiseGlobal.alertaAtivo || analiseGlobal.soma >= 25)) {
        await enviarAlertaComissaoDor(dadosGlobais, analiseGlobal);
      }

      alert("Dados enviados com sucesso!");
    } catch (erro) {
      console.error("Erro ao enviar alerta:", erro);
      alert("Erro ao enviar os dados para o sistema de alertas.");
    }
  });
}

if (btnAbrirPainel) {
  btnAbrirPainel.addEventListener("click", () => {
    window.open("../08-painel-alertas/index.html", "_blank");
  });
}

if (btnAbrirComissao) {
  btnAbrirComissao.addEventListener("click", () => {
    window.open("../09-alerta-comissao-dor/index.html", "_blank");
  });
}

async function enviarAlertaComissaoDor(dados, analiseProtocolo) {
  if (!dados || !analiseProtocolo) {
    throw new Error('Dados da triagem ainda não foram carregados para a Comissão de Dor.');
  }

  const jaEnviado = sessionStorage.getItem("alertaComissaoDorEnviado");

  if (jaEnviado === "sim") {
    return;
  }

  const alertaComissao = {
    id: Date.now(),
    codigoCaso: `FD-${Date.now()}`,
    dataHora: new Date().toLocaleString("pt-BR"),

    hospital: "Hospital Universitário",
    setor: "Emergência Pediátrica",

    paciente: {
      nome: dados.paciente.nome || "Paciente não identificado",
      idade: dados.paciente.idade || "Não informada",
      sexo: dados.paciente.sexo || "Não informado",
      prontuario: dados.paciente.prontuario || "Não informado"
    },

    score: analiseProtocolo.soma || 0,
    risco: analiseProtocolo.classificacao.nivel,
    status: analiseProtocolo.classificacao.status,
    sintomas: analiseProtocolo.sintomasTexto,
    locais: dados.locais,
    intensidade: dados.intensidade ? dados.intensidade.valor : "Não informada",
    comportamentosTea: dados.tea.itens || [],
    observacoesTea: dados.tea.observacoes || "Nenhuma observação registrada.",

    interpretacao: analiseProtocolo.interpretacaoClinica,
    mensagem: analiseProtocolo.mensagemComissao || analiseProtocolo.alertaTexto,

    condutasSugeridas: [
      "Reavaliação multiprofissional imediata",
      "Revisão da analgesia",
      "Redução de estímulos sensoriais",
      "Monitorização contínua",
      "Registro obrigatório da conduta adotada"
    ],

    linhaTempo: [
      "Entrada na triagem",
      "Coleta de sinais e comportamento",
      "Geração do protocolo clínico",
      "Classificação de risco elevada",
      "Alerta automático enviado para Comissão de Dor"
    ],

    condutasRealizadas: [
      {
        nome: "Protocolo Fala Dodói gerado",
        resposta: "Pendente de avaliação da Comissão"
      }
    ]
  };

  const resposta = await fetch(API_ALERTA_COMISSAO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alertaComissao)
  });

  if (!resposta.ok) {
    throw new Error('Erro na API ao enviar alerta para Comissão de Dor.');
  }

  sessionStorage.setItem("alertaComissaoDorEnviado", "sim");
}

