const listaAlertas = document.querySelector(".lista-alertas");
let alertasAbertoId = null;


async function buscarAlertasSalvos() {
  const resposta = await fetch("https://fala-dodoi-project.onrender.com/alertas");   // Substitua pela URL correta do seu backend
  
  const dados = await resposta.json(); // Supondo que a resposta seja um objeto com uma propriedade "alertas" que é uma lista

  return dados.alertas; // Retorna apenas a lista de alertas
}

function definirClasseDoAlerta(status) {
  if (status === "emergencia") {
    return {
      classe: "alerta-emergencia",
      texto: "Emergência"
    };
  }

  if (status === "atencao") {
    return {
      classe: "alerta-atencao",
      texto: "Atenção"
    };
  }

  return {
    classe: "alerta-estavel",
    texto: "Estável"
  };
}

function criarCardDeAlerta(alerta) {
  const tipoAlerta = definirClasseDoAlerta(alerta.status);

  const card = document.createElement("article");

  card.className = `alerta ${tipoAlerta.classe}`;

  card.innerHTML = `
    <div>
      <span class="tag">${tipoAlerta.texto}</span>

      <h3>Paciente: ${alerta.nome}</h3>

      <p>${alerta.mensagem}</p>

      <small>
        Idade: ${alerta.idade} • Prontuário: ${alerta.prontuario}
      </small>

      <br>

      <small>
        Intensidade: ${alerta.intensidade} • ${alerta.dataHora}
      </small>
    </div>

    <button onclick="abrirDetalhes(${alerta.id})">Ver detalhes</button>
  `;

  listaAlertas.appendChild(card);
}

function atualizarResumo(alertas) {
  const totalEmergencias = alertas.filter(alerta => alerta.status === "emergencia").length;

  const totalAtencao = alertas.filter(alerta => alerta.status === "atencao").length;

  const totalEstaveis = alertas.filter(alerta => alerta.status === "estavel").length;

  document.getElementById("total-emergencias").textContent = totalEmergencias;
  document.getElementById("total-atencao").textContent = totalAtencao;
  document.getElementById("total-estaveis").textContent = totalEstaveis;
}

async function atualizarPainel() {
  const alertas = await buscarAlertasSalvos();
    
    atualizarResumo(alertas);

  const cardsAntigos = document.querySelectorAll(".alerta");

  cardsAntigos.forEach(card => {
    card.remove();
  });

  if (alertas.length === 0) {
    const mensagemVazia = document.createElement("p");
    mensagemVazia.className = "mensagem-vazia";
    mensagemVazia.textContent = "Nenhum alerta recebido até o momento.";

    listaAlertas.appendChild(mensagemVazia);
    return;
  }

  alertas.forEach(alerta => {
    criarCardDeAlerta(alerta);
  });
}

atualizarPainel();

function abrirDetalhes(id) {
    alertasAbertoId = id;

  const alertas = buscarAlertasSalvos();

  const alertaSelecionado = alertas.find(alerta => alerta.id === id);

  if (!alertaSelecionado) {
    alert("Alerta não encontrado.");
    return;
  }

  document.getElementById("modal-nome").textContent =
    `Paciente: ${alertaSelecionado.nome}`;

  document.getElementById("modal-mensagem").textContent =
    alertaSelecionado.mensagem;

  document.getElementById("modal-idade").textContent =
    alertaSelecionado.idade;

  document.getElementById("modal-prontuario").textContent =
    alertaSelecionado.prontuario;

  document.getElementById("modal-intensidade").textContent =
    alertaSelecionado.intensidade;

  document.getElementById("modal-classificacao").textContent =
    alertaSelecionado.classificacao;

  document.getElementById("modal-sintomas").textContent =
    alertaSelecionado.sintomas;

  document.getElementById("modal-data").textContent =
    alertaSelecionado.dataHora;

  document.getElementById("modal-detalhes").classList.remove("oculto");
}

document.getElementById("fechar-modal").addEventListener("click", () => {
  document.getElementById("modal-detalhes").classList.add("oculto");
});

document.getElementById("btn-atendido").addEventListener("click", () => {
  if (!alertaAbertoId) {
    return;
  }

  const alertas = buscarAlertasSalvos();

  const alertasAtualizados = alertas.filter(alerta => alerta.id !== alertaAbertoId);

  localStorage.setItem("alertasFalaDodoi", JSON.stringify(alertasAtualizados));

  document.getElementById("modal-detalhes").classList.add("oculto");

  atualizarPainel();
});

const btnLimpar = document.getElementById("btn-limpar-alertas");

btnLimpar.addEventListener("click", async () => {

  const confirmar = confirm("Deseja apagar todos os alertas?");

  if (!confirmar) {
    return;
  }

  await fetch("https://fala-dodoi-project.onrender.com/alertas", {
    method: "DELETE"
  });

  atualizarPainel();
});