if (
  sessionStorage.getItem(
    "comissaoAutenticada"
  ) !== "true"
) {

  window.location.href =
    "../login-comissao/index.html";

}

const API_COMISSAO = "https://fala-dodoi-project.onrender.com/alertas-comissao";
const API_FINALIZAR_BASE = "https://fala-dodoi-project.onrender.com/alerta-comissao";

let condutaSelecionada = null;
let alertaAtual = null;
let alertasComissao = [];

async function buscarAlertasComissao() {
  const resposta = await fetch(API_COMISSAO);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar alertas da Comissão de Dor.");
  }

  const dados = await resposta.json();
  return dados.alertas || [];
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

function obterNivelRisco(alerta) {
  const score = Number(alerta.score || 0);

  if (score >= 25 || alerta.risco === "Respiratório/Cardíaco" || alerta.status === "Crítico") {
    return {
      texto: "Crítico",
      classe: "critico",
      badge: "🔴 Crítico",
      tempo: "Imediata"
    };
  }

  if (score >= 19) {
    return {
      texto: "Alto",
      classe: "alto",
      badge: "🟠 Alto",
      tempo: "Até 1 hora"
    };
  }

  if (score >= 6) {
    return {
      texto: "Atenção",
      classe: "atencao",
      badge: "🟡 Atenção",
      tempo: "Reavaliação em até 20 minutos"
    };
  }

  return {
    texto: "Baixo risco",
    classe: "baixo",
    badge: "🟢 Baixo risco",
    tempo: "Conduta padrão"
  };
}

function atualizarCabecalho() {
  const total = alertasComissao.length;
  const totalTexto = total === 1 ? "1 paciente" : `${total} pacientes`;

  document.getElementById("total-alertas").textContent = totalTexto;
  document.getElementById("ultima-atualizacao").textContent =
    `Atualizado em ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  const badgeGeral = document.getElementById("badge-geral");
  badgeGeral.className = "badge-risco";

  if (total === 0) {
    badgeGeral.textContent = "Aguardando";
    badgeGeral.classList.add("aguardando");
    return;
  }

  const existeCritico = alertasComissao.some((alerta) => obterNivelRisco(alerta).classe === "critico");

  if (existeCritico) {
    badgeGeral.textContent = "🔴 Casos críticos";
    badgeGeral.classList.add("critico");
  } else {
    badgeGeral.textContent = "🟠 Casos em avaliação";
    badgeGeral.classList.add("alto");
  }
}

function renderizarEstadoVazio() {
  document.getElementById("estado-vazio").classList.remove("oculto");
  document.getElementById("area-pacientes").classList.add("oculto");
  document.getElementById("detalhes-caso").classList.add("oculto");
}

function renderizarListaPacientes() {
  const lista = document.getElementById("lista-pacientes");
  lista.innerHTML = "";

  alertasComissao.forEach((alerta) => {
    const risco = obterNivelRisco(alerta);

    const card = document.createElement("article");
    card.className = `card-paciente ${risco.classe}`;

    card.innerHTML = `
      <div class="card-paciente-topo">
        <span class="tag-risco ${risco.classe}">${risco.badge}</span>

        <div class="score-mini">
          <span>Score</span>
          <strong>${alerta.score || 0}</strong>
        </div>
      </div>

      <h3>${textoSeguro(alerta.paciente?.nome, "Paciente não identificado")}</h3>

      <p><strong>Prontuário:</strong> ${textoSeguro(alerta.paciente?.prontuario, "Não informado")}</p>
      <p><strong>Classificação:</strong> ${risco.texto}</p>
      <p><strong>Sinais:</strong> ${textoSeguro(alerta.sintomas, "Não informado")}</p>
      <p><strong>Horário:</strong> ${textoSeguro(alerta.dataHora, "Não informado")}</p>

      <div class="card-acoes">
        <button class="btn-detalhes" data-id="${alerta.id}">
          Ver detalhes
        </button>

        <button class="btn-finalizar-card" data-id="${alerta.id}">
          Finalizar
        </button>
      </div>
    `;

    lista.appendChild(card);
  });

  document.querySelectorAll(".btn-detalhes").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);
      abrirDetalhes(id);
    });
  });

  document.querySelectorAll(".btn-finalizar-card").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);
      finalizarAtendimentoRapido(id);
    });
  });

  document.getElementById("estado-vazio").classList.add("oculto");
  document.getElementById("area-pacientes").classList.remove("oculto");
}

function definirPainelDetalhe(alerta) {
  const risco = obterNivelRisco(alerta);
  const badge = document.getElementById("badge-geral");
  const painel = document.getElementById("painel-alerta-detalhe");

  painel.className = `alerta-principal ${risco.classe}`;

  badge.className = `badge-risco ${risco.classe}`;
  badge.textContent = risco.badge;

  return risco;
}

function abrirDetalhes(id) {
  const alerta = alertasComissao.find((item) => Number(item.id) === Number(id));

  if (!alerta) {
    alert("Caso não encontrado.");
    return;
  }

  alertaAtual = alerta;
  condutaSelecionada = null;

  document.querySelectorAll(".acoes button").forEach((btn) => {
    btn.classList.remove("selecionado");
  });

  document.getElementById("registro-comissao").value = "";
  document.getElementById("mensagem-bloqueio").textContent = "";
  document.getElementById("mensagem-bloqueio").className = "mensagem-bloqueio";

  const risco = definirPainelDetalhe(alerta);

  document.getElementById("detalhe-titulo").textContent =
    `Caso de ${textoSeguro(alerta.paciente?.nome, "paciente não identificado")}`;

  document.getElementById("titulo-alerta").textContent =
    `Paciente com classificação ${risco.texto} identificado pelo Fala Dodói`;

  document.getElementById("mensagem-alerta").textContent =
    alerta.mensagem || "Alerta clínico gerado automaticamente.";

  document.getElementById("score-atual").textContent = alerta.score || 0;

  document.getElementById("paciente-nome").textContent = textoSeguro(alerta.paciente?.nome);
  document.getElementById("paciente-idade").textContent = textoSeguro(alerta.paciente?.idade);
  document.getElementById("paciente-sexo").textContent = textoSeguro(alerta.paciente?.sexo);
  document.getElementById("paciente-prontuario").textContent = textoSeguro(alerta.paciente?.prontuario);

  document.getElementById("risco-texto").textContent = risco.texto;
  document.getElementById("intensidade").textContent = textoSeguro(alerta.intensidade);
  document.getElementById("locais").textContent = listaParaTexto(alerta.locais);

  const porcentagem = Math.min((Number(alerta.score || 0) / 40) * 100, 100);
  document.getElementById("barra-score-preenchida").style.width = `${porcentagem}%`;

  criarChips("sinais-lista", alerta.sintomas ? alerta.sintomas.split(", ") : []);
  criarChips("tea-lista", alerta.comportamentosTea || []);

  const campoNivelSuporte =
    document.getElementById("tea-nivel-suporte");

  if (campoNivelSuporte) {
    campoNivelSuporte.textContent =
      alerta.nivelSuporteTea || "Não informado";
  }

  const campoReforcador =
    document.getElementById("tea-reforcador");

  if (campoReforcador) {
    campoReforcador.textContent =
      alerta.reforcadorTea || "Não informado";
  }

  document.getElementById("tea-observacoes").textContent =
    alerta.observacoesTea || "Nenhuma observação TEA registrada.";

  document.getElementById("hospital").textContent = alerta.hospital || "Hospital Universitário";
  document.getElementById("setor").textContent = alerta.setor || "Emergência Pediátrica";

  document.getElementById("prioridade-classificacao").textContent = risco.texto;
  document.getElementById("prioridade-tempo").textContent = risco.tempo;

  document.getElementById("interpretacao").textContent =
    alerta.interpretacao || "Interpretação automática indisponível.";

  preencherLista("linha-tempo", alerta.linhaTempo || []);
  preencherLista("condutas-lista", alerta.condutasSugeridas || []);
  preencherTabelaIntervencoes(alerta.condutasRealizadas || []);

  document.getElementById("status-caso").textContent = "Em análise";
  document.getElementById("detalhes-caso").classList.remove("oculto");

  window.scrollTo({
    top: document.getElementById("detalhes-caso").offsetTop - 20,
    behavior: "smooth"
  });
}

function preencherLista(id, itens) {
  const lista = document.getElementById(id);
  lista.innerHTML = "";

  if (!itens || itens.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma informação registrada.";
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

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.classList.remove("oculto");

  setTimeout(() => {
    toast.classList.add("oculto");
  }, 3500);
}

async function finalizarNoBackend(id) {
  const resposta = await fetch(`${API_FINALIZAR_BASE}/${id}`, {
    method: "DELETE"
  });

  if (!resposta.ok) {
    throw new Error("Erro ao finalizar atendimento no backend.");
  }
}

async function finalizarAtendimentoRapido(id) {
  const confirmar = confirm("Deseja finalizar este atendimento e remover o paciente da fila?");

  if (!confirmar) {
    return;
  }

  try {
    await finalizarNoBackend(id);
    mostrarToast("✅ Atendimento finalizado e removido da fila.");
    await iniciarTela();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao finalizar atendimento.");
  }
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

document.getElementById("btn-encerrar-alerta").addEventListener("click", async () => {
  const registro = document.getElementById("registro-comissao").value.trim();
  const mensagem = document.getElementById("mensagem-bloqueio");

  if (!alertaAtual) {
    mensagem.textContent = "Nenhum caso selecionado.";
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

  try {
    await finalizarNoBackend(alertaAtual.id);

    mensagem.textContent = "Atendimento finalizado com registro da Comissão de Dor.";
    mensagem.classList.add("sucesso");

    document.getElementById("status-caso").textContent = "Finalizado";
    mostrarToast("✅ Caso finalizado pela Comissão de Dor.");

    setTimeout(async () => {
      document.getElementById("detalhes-caso").classList.add("oculto");
      await iniciarTela();
    }, 1200);
  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Erro ao finalizar atendimento.";
  }
});

document.getElementById("btn-fechar-detalhes").addEventListener("click", () => {
  document.getElementById("detalhes-caso").classList.add("oculto");
});

document.getElementById("btn-atualizar").addEventListener("click", async () => {
  await iniciarTela();
  mostrarToast("🔄 Fila atualizada.");
});

async function iniciarTela() {
  try {
    const alertasAnteriores = alertasComissao.length;

    alertasComissao = await buscarAlertasComissao();

    atualizarCabecalho();

    if (alertasComissao.length === 0) {
      renderizarEstadoVazio();
      return;
    }

    renderizarListaPacientes();

    if (alertasAnteriores < alertasComissao.length) {
      mostrarToast("🔴 Novo alerta crítico recebido.");
    }
  } catch (erro) {
    console.error("Erro ao carregar tela da Comissão de Dor:", erro);
    renderizarEstadoVazio();
  }
}

const btnSairSessao =
  document.getElementById("btn-sair-sessao");

if (btnSairSessao) {

  btnSairSessao.addEventListener("click", () => {

    sessionStorage.removeItem(
      "comissaoAutenticada"
    );

    window.location.href =
      "../login-escolha/index.html";

  });

}

iniciarTela();

setInterval(iniciarTela, 15000);
