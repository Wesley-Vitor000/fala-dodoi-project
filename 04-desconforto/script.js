const chavePaciente = 'dadosPacienteTriagem';
const chaveDesconforto = 'desconfortosTriagem';

const infoPaciente = document.getElementById('info-paciente');
const textoDesconforto = document.getElementById('texto-desconforto');
const btnVoltar = document.getElementById('btn-voltar');
const btnProximo = document.getElementById('btn-proximo');
const cardsDesconforto = document.querySelectorAll('.card-desconforto');

let desconfortosSelecionados = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarPaciente();
  carregarDesconfortosSalvos();
  aplicarEventos();
  atualizarResumo();
});

function carregarPaciente() {
  const dados = localStorage.getItem(chavePaciente);

  if (!dados) {
    infoPaciente.textContent = 'Paciente não identificado ainda.';
    return;
  }

  const paciente = JSON.parse(dados);
  infoPaciente.textContent = `${paciente.nome} • ${paciente.idade} anos • Prontuário: ${paciente.prontuario || 'não informado'}`;
}

function carregarDesconfortosSalvos() {
  const dados = localStorage.getItem(chaveDesconforto);

  if (!dados) return;

  desconfortosSelecionados = JSON.parse(dados);

  cardsDesconforto.forEach((card) => {
    const valor = card.dataset.valor;
    const existe = desconfortosSelecionados.find((item) => item.valor === valor);

    if (existe) {
      card.classList.add('ativa');
    }
  });
}

function salvarDesconfortos() {
  localStorage.setItem(chaveDesconforto, JSON.stringify(desconfortosSelecionados));
}

function atualizarResumo() {
  if (desconfortosSelecionados.length === 0) {
    textoDesconforto.textContent = 'Nenhum desconforto selecionado.';
    return;
  }

  const texto = desconfortosSelecionados.map((item) => item.valor);
  textoDesconforto.textContent = texto.join(', ');
}

function aplicarEventos() {
  cardsDesconforto.forEach((card) => {
    card.addEventListener('click', () => {
      const valor = card.dataset.valor;

      const index = desconfortosSelecionados.findIndex((item) => item.valor === valor);

      if (index > -1) {
        desconfortosSelecionados.splice(index, 1);
        card.classList.remove('ativa');
      } else {
        desconfortosSelecionados.push({ valor });
        card.classList.add('ativa');
      }

      salvarDesconfortos();
      atualizarResumo();
    });
  });
}

btnVoltar.addEventListener('click', () => {
  window.location.href = '../03-intensidade/index.html';
});

btnProximo.addEventListener('click', () => {
  window.location.href = '../05-anamnese/index.html';
});

const btnMenu = document.getElementById("btn-menu");
const menuAcoes = document.getElementById("menu-acoes");
const btnLimparDesconforto = document.getElementById("btn-limpar-desconforto");

if (btnMenu && menuAcoes) {
  btnMenu.addEventListener("click", () => {
    menuAcoes.classList.toggle("aberto");

    btnMenu.textContent = menuAcoes.classList.contains("aberto")
      ? "×"
      : "☰";
  });
}

if (btnLimparDesconforto) {
  btnLimparDesconforto.addEventListener("click", () => {
    desconfortosSelecionados = [];

    localStorage.removeItem(chaveDesconforto);

    cardsDesconforto.forEach((card) => {
      card.classList.remove("ativa");
    });

    atualizarResumo();

    if (menuAcoes) {
      menuAcoes.classList.remove("aberto");
      btnMenu.textContent = "☰";
    }
  });
}


// Titi Assistente - Arrastar e Soltar
const titiAssistente = document.querySelector(".titi-assistente");
const titiVideoBox = document.querySelector(".titi-video-box");
const titiBalao = document.querySelector(".titi-balao");
const titiVideo = document.querySelector(".titi-video");

let arrastandoTiti = false;
let deslocamentoY = 0;
let timerEsconderTiti = null;
let timerReaparecerTiti = null;

if (titiAssistente && titiVideoBox) {
  titiVideoBox.addEventListener("mousedown", iniciarArrastoTiti);
  titiVideoBox.addEventListener("touchstart", iniciarArrastoTiti, { passive: false });

  document.addEventListener("mousemove", arrastarTiti);
  document.addEventListener("touchmove", arrastarTiti, { passive: false });

  document.addEventListener("mouseup", pararArrastoTiti);
  document.addEventListener("touchend", pararArrastoTiti);

  titiVideoBox.addEventListener("click", mostrarTitiNovamente);

  iniciarCicloTiti();

  ["click", "touchstart", "keydown", "scroll"].forEach((evento) => {
    document.addEventListener(evento, reiniciarEsperaTiti, { passive: true });
  });
}

function iniciarArrastoTiti(event) {
  const toque = event.touches ? event.touches[0] : event;
  const posicao = titiAssistente.getBoundingClientRect();

  arrastandoTiti = true;
  deslocamentoY = toque.clientY - posicao.top;

  titiAssistente.classList.add("arrastando");

  mostrarTitiNovamente();

  event.preventDefault();
}

function arrastarTiti(event) {
  if (!arrastandoTiti) return;

  const toque = event.touches ? event.touches[0] : event;

  let novaPosicaoY = toque.clientY - deslocamentoY;

  const alturaTela = window.innerHeight;
  const alturaTiti = titiAssistente.offsetHeight;

  novaPosicaoY = Math.max(
    12,
    Math.min(novaPosicaoY, alturaTela - alturaTiti - 12)
  );

  titiAssistente.style.position = "fixed";
  titiAssistente.style.top = `${novaPosicaoY}px`;
  titiAssistente.style.bottom = "auto";

  if (window.innerWidth > 768) {
    titiAssistente.style.right = "24px";
  } else {
    titiAssistente.style.right = "10px";
  }
}

function pararArrastoTiti() {
  if (!arrastandoTiti) return;

  arrastandoTiti = false;
  titiAssistente.classList.remove("arrastando");

  agendarEsconderTiti();
}

function iniciarCicloTiti() {
  mostrarTitiNovamente();
}

function mostrarTitiNovamente() {
  clearTimeout(timerEsconderTiti);
  clearTimeout(timerReaparecerTiti);

  titiAssistente.classList.remove("titi-descansando");
  titiAssistente.classList.add("titi-ativo");

  if (titiVideo) {
    titiVideo.play().catch(() => {});
  }

  agendarEsconderTiti();
}

function agendarEsconderTiti() {
  clearTimeout(timerEsconderTiti);

  timerEsconderTiti = setTimeout(() => {
    esconderBalaoEPausarTiti();
  }, 6500);
}

function esconderBalaoEPausarTiti() {
  titiAssistente.classList.remove("titi-ativo");
  titiAssistente.classList.add("titi-descansando");

  if (titiVideo) {
    titiVideo.pause();
  }

  agendarReaparecerTiti();
}

function agendarReaparecerTiti() {
  clearTimeout(timerReaparecerTiti);

  timerReaparecerTiti = setTimeout(() => {
    mostrarTitiNovamente();
  }, 18000);
}

function reiniciarEsperaTiti() {
  if (arrastandoTiti) return;

  clearTimeout(timerReaparecerTiti);
  agendarReaparecerTiti();
}