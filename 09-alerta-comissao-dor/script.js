const API_COMISSAO = "https://fala-dodoi-project.onrender.com/alertas-comissao";

let condutaSelecionada = null;
let alertaAtual = null;

async function buscarUltimoAlerta() {
  const resposta = await fetch(API_COMISSAO);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar alertas da Comissão de Dor.");
  }

  const dados = await resposta.json();

  return dados.alertas[0] || null;
}

function textoSeguro(valor, fallback = "-") {
  return valor || fallback;
}

function listaParaTexto(lista, fallback = "-") {
  if (!Array.isArray(lista) || lista.length === 0) {
    return fallback;
  }

  return lista.join(", ");
}

function criarChips(containerId, itens) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!itens || itens.length === 0) {
    container.innerHTML = "<span class='chip vazio'>Não informado</span>";
    return;
  }

  itens.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function preencherLista(id, itens) {
  const lista = document.getElementById(id);

  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  if (!itens || itens.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhum registro disponível.";
    lista.appendChild(li);
    return;
  }

  itens.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    lista.appendChild(li);
  });
}

function preencherTabelaIntervencoes(intervencoes) {
  const tabela = document.getElementById("tabela-intervencoes");

  if (!tabela) {
    return;
  }

  tabela.innerHTML = "";

  if (!intervencoes || intervencoes.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td>Protocolo Fala Dodói</td>
        <td>Automático</td>
        <td>Pendente de avaliação</td>
      </tr>
    `;

    return;
  }

  intervencoes.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.nome || "Intervenção registrada"}</td>
      <td>${item.horario || "Automático"}</td>
      <td>${item.resposta || "Pendente"}</td>
    `;

    tabela.appendChild(tr);
  });
}

function definirRisco(alerta) {
  const score = Number(alerta.score || 0);
  const badge = document.getElementById("badge-risco");
  const painel = document.querySelector(".alerta-principal");

  badge.className = "badge-risco";
  painel.className = "alerta-principal";

  if (score >= 25 || alerta.risco === "Respiratório/Cardíaco" || alerta.status === "Crítico") {
    badge.textContent = "🔴 Crítico";
    badge.classList.add("critico");
    painel.classList.add("critico");
    return "Crítico";
  }

  if (score >= 19 || alerta.risco === "Emocional") {
    badge.textContent = "🟠 Alto";
    badge.classList.add("alto");
    painel.classList.add("alto");
    return "Alto";
  }

  if (score >= 6 || alerta.status === "Atenção" || alerta.status === "Reavaliação necessária") {
    badge.textContent = "🟡 Atenção";
    badge.classList.add("atencao");
    painel.classList.add("atencao");
    return "Atenção";
  }

  badge.textContent = "🟢 Baixo risco";
  badge.classList.add("baixo");
  painel.classList.add("baixo");
  return "Baixo risco";
}

function definirTempoPrioridade(nivelRisco) {
  if (nivelRisco === "Crítico") {
    return "Imediata";
  }

  if (nivelRisco === "Alto") {
    return "Até 1 hora";
  }

  if (nivelRisco === "Atenção") {
    return "Reavaliação em até 20 minutos";
  }

  return "Conduta padrão";
}

function preencherCamposExtras(alerta, nivelRisco) {
  const campos = {
    hospital: alerta.hospital || "Hospital Universitário",
    setor: alerta.setor || "Emergência Pediátrica",
    leito: alerta.leito || "Não informado",
    profissional: alerta.profissional || "Sistema Fala Dodói",
    "tempo-melhora": alerta.tempoMelhora || "Sem melhora registrada",
    "qtd-reavaliacoes": alerta.quantidadeReavaliacoes || "1",
    progressao: alerta.progressao || (nivelRisco === "Crítico" ? "Progressão rápida" : "Sem progressão crítica"),
    persistencia: alerta.persistencia || (nivelRisco === "Crítico" ? "Persistente" : "Em observação"),
    "prioridade-classificacao": nivelRisco,
    "prioridade-tempo": definirTempoPrioridade(nivelRisco),
    "prioridade-criterios": alerta.criteriosPrioridade || "Score, persistência, comportamento e risco clínico",
    "status-caso": alerta.statusCaso || "Em análise"
  };

  Object.keys(campos).forEach((id) => {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.textContent = campos[id];
    }
  });
}

function preencherTelaVazia() {
  document.getElementById("titulo-alerta").textContent =
    "Nenhum alerta da Comissão de Dor recebido";

  document.getElementById("mensagem-alerta").textContent =
    "Quando um caso crítico for enviado pelo documento final, ele aparecerá automaticamente nesta tela.";

  document.getElementById("score-atual").textContent = "0";

  criarChips("sinais-lista", []);
  criarChips("tea-lista", []);
  preencherLista("linha-tempo", []);
  preencherLista("condutas-lista", []);
  preencherTabelaIntervencoes([]);
}

function preencherTela(alerta) {
  alertaAtual = alerta;

  if (!alerta) {
    preencherTelaVazia();
    return;
  }

  const nivelRisco = definirRisco(alerta);

  document.getElementById("codigo-caso").textContent =
    alerta.codigoCaso || "Caso #---";

  document.getElementById("data-hora").textContent =
    alerta.dataHora || "-";

  document.getElementById("titulo-alerta").textContent =
    `Paciente com classificação ${nivelRisco} identificado pelo Fala Dodói`;

  document.getElementById("mensagem-alerta").textContent =
    alerta.mensagem || "Alerta clínico gerado automaticamente.";

  document.getElementById("score-atual").textContent =
    alerta.score || 0;

  document.getElementById("paciente-nome").textContent =
    textoSeguro(alerta.paciente?.nome);

  document.getElementById("paciente-idade").textContent =
    textoSeguro(alerta.paciente?.idade);

  document.getElementById("paciente-sexo").textContent =
    textoSeguro(alerta.paciente?.sexo);

  document.getElementById("paciente-prontuario").textContent =
    textoSeguro(alerta.paciente?.prontuario);

  document.getElementById("risco-texto").textContent =
    nivelRisco;

  document.getElementById("intensidade").textContent =
    textoSeguro(alerta.intensidade);

  document.getElementById("locais").textContent =
    listaParaTexto(alerta.locais);

  const porcentagem = Math.min((Number(alerta.score || 0) / 30) * 100, 100);

  document.getElementById("barra-score-preenchida").style.width =
    `${porcentagem}%`;

  const sinais = alerta.sintomas
    ? alerta.sintomas.split(", ").filter(Boolean)
    : [];

  criarChips("sinais-lista", sinais);
  criarChips("tea-lista", alerta.comportamentosTea || []);

  document.getElementById("tea-observacoes").textContent =
    alerta.observacoesTea || "Nenhuma observação TEA registrada.";

  document.getElementById("interpretacao").textContent =
    alerta.interpretacao || "Interpretação automática indisponível.";

  preencherLista("linha-tempo", alerta.linhaTempo || []);
  preencherLista("condutas-lista", alerta.condutasSugeridas || []);
  preencherTabelaIntervencoes(alerta.condutasRealizadas || []);
  preencherCamposExtras(alerta, nivelRisco);
}

document.querySelectorAll(".acoes button").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".acoes button").forEach((btn) => {
      btn.classList.remove("selecionado");
    });

    botao.classList.add("selecionado");
    condutaSelecionada = botao.dataset.conduta;
  });
});

const btnEncerrarAlerta = document.getElementById("btn-encerrar-alerta");

if (btnEncerrarAlerta) {
  btnEncerrarAlerta.addEventListener("click", () => {
    const registro = document.getElementById("registro-comissao").value.trim();
    const mensagem = document.getElementById("mensagem-bloqueio");

    mensagem.classList.remove("sucesso");

    if (!alertaAtual) {
      mensagem.textContent = "Nenhum alerta carregado para encerrar.";
      return;
    }

    if (!condutaSelecionada) {
      mensagem.textContent = "Selecione uma conduta antes de encerrar o alerta.";
      return;
    }

    if (registro.length < 20) {
      mensagem.textContent = "Registre uma justificativa clínica com pelo menos 20 caracteres.";
      return;
    }

    mensagem.textContent =
      `Alerta encerrado com a conduta: ${condutaSelecionada}. Registro salvo para demonstração clínica.`;

    mensagem.classList.add("sucesso");

    const statusCaso = document.getElementById("status-caso");

    if (statusCaso) {
      statusCaso.textContent = "Encerrado pela Comissão de Dor";
    }
  });
}

async function iniciarTela() {
  try {
    const alerta = await buscarUltimoAlerta();
    preencherTela(alerta);
  } catch (erro) {
    console.error("Erro ao carregar tela da Comissão de Dor:", erro);
    preencherTelaVazia();
  }
}

iniciarTela();
