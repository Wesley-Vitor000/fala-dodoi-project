const API_COMISSAO = "https://fala-dodoi-project.onrender.com/alertas-comissao";

let condutaSelecionada = null;
let alertaAtual = null;

async function buscarUltimoAlerta() {
  const resposta = await fetch(API_COMISSAO);
  const dados = await resposta.json();

  return dados.alertas[0] || null;
}

function textoSeguro(valor, fallback = "-") {
  return valor || fallback;
}

function criarChips(containerId, itens) {
  const container = document.getElementById(containerId);
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

function definirRisco(alerta) {
  const score = Number(alerta.score || 0);
  const badge = document.getElementById("badge-risco");
  const painel = document.querySelector(".alerta-principal");

  badge.className = "badge-risco";
  painel.className = "alerta-principal";

  if (score >= 25 || alerta.risco === "Respiratório/Cardíaco") {
    badge.textContent = "🔴 Crítico";
    badge.classList.add("critico");
    painel.classList.add("critico");
    return "Crítico";
  }

  if (score >= 19) {
    badge.textContent = "🟠 Alto";
    badge.classList.add("alto");
    painel.classList.add("alto");
    return "Alto";
  }

  if (score >= 6) {
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

function preencherTela(alerta) {
  alertaAtual = alerta;

  if (!alerta) {
    return;
  }

  const nivelRisco = definirRisco(alerta);

  document.getElementById("codigo-caso").textContent = alerta.codigoCaso || "Caso #---";
  document.getElementById("data-hora").textContent = alerta.dataHora || "-";

  document.getElementById("titulo-alerta").textContent =
    `Paciente com classificação ${nivelRisco} identificado pelo Fala Dodói`;

  document.getElementById("mensagem-alerta").textContent =
    alerta.mensagem || "Alerta clínico gerado automaticamente.";

  document.getElementById("score-atual").textContent = alerta.score || 0;

  document.getElementById("paciente-nome").textContent = textoSeguro(alerta.paciente?.nome);
  document.getElementById("paciente-idade").textContent = textoSeguro(alerta.paciente?.idade);
  document.getElementById("paciente-sexo").textContent = textoSeguro(alerta.paciente?.sexo);
  document.getElementById("paciente-prontuario").textContent = textoSeguro(alerta.paciente?.prontuario);

  document.getElementById("risco-texto").textContent = nivelRisco;
  document.getElementById("intensidade").textContent = textoSeguro(alerta.intensidade);
  document.getElementById("locais").textContent = Array.isArray(alerta.locais) ? alerta.locais.join(", ") : "-";

  const porcentagem = Math.min((Number(alerta.score || 0) / 30) * 100, 100);
  document.getElementById("barra-score-preenchida").style.width = `${porcentagem}%`;

  criarChips("sinais-lista", alerta.sintomas ? alerta.sintomas.split(", ") : []);
  criarChips("tea-lista", alerta.comportamentosTea || []);

  document.getElementById("tea-observacoes").textContent =
    alerta.observacoesTea || "Nenhuma observação TEA registrada.";

  document.getElementById("interpretacao").textContent =
    alerta.interpretacao || "Interpretação automática indisponível.";

  preencherLista("linha-tempo", alerta.linhaTempo || []);
  preencherLista("condutas-lista", alerta.condutasSugeridas || []);
}

function preencherLista(id, itens) {
  const lista = document.getElementById(id);
  lista.innerHTML = "";

  itens.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    lista.appendChild(li);
  });
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

document.getElementById("btn-encerrar-alerta").addEventListener("click", () => {
  const registro = document.getElementById("registro-comissao").value.trim();
  const mensagem = document.getElementById("mensagem-bloqueio");

  if (!condutaSelecionada) {
    mensagem.textContent = "Selecione uma conduta antes de encerrar o alerta.";
    return;
  }

  if (registro.length < 20) {
    mensagem.textContent = "Registre uma justificativa clínica com pelo menos 20 caracteres.";
    return;
  }

  mensagem.textContent = "Alerta encerrado com registro da Comissão de Dor.";
  mensagem.classList.add("sucesso");
});

async function iniciarTela() {
  const alerta = await buscarUltimoAlerta();
  preencherTela(alerta);
}

iniciarTela();