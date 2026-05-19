const chavePaciente = 'dadosPacienteTriagem';
const chaveIntensidade = 'intensidadeDorTriagem';

const infoPaciente = document.getElementById('info-paciente');
const textoIntensidade = document.getElementById('texto-intensidade');
const btnVoltar = document.getElementById('btn-voltar');
const btnProximo = document.getElementById('btn-proximo');
const cardsIntensidade = document.querySelectorAll('.card-intensidade');

let intensidadeSelecionada = null;

document.addEventListener('DOMContentLoaded', () => {
  carregarPaciente();
  aplicarSexoNasImagens();
  carregarIntensidadeSalva();
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

function carregarIntensidadeSalva() {
  const dados = localStorage.getItem(chaveIntensidade);

  if (!dados) return;

  intensidadeSelecionada = JSON.parse(dados);

  cardsIntensidade.forEach((card) => {
    const valor = card.dataset.valor;
    if (intensidadeSelecionada && intensidadeSelecionada.valor === valor) {
      card.classList.add('ativa');
    }
  });
}

function salvarIntensidade() {
  localStorage.setItem(chaveIntensidade, JSON.stringify(intensidadeSelecionada));
}

function atualizarResumo() {
  if (!intensidadeSelecionada) {
    textoIntensidade.textContent = 'Nenhuma intensidade selecionada.';
    return;
  }

  textoIntensidade.textContent = intensidadeSelecionada.valor;
}

function aplicarEventos() {
  cardsIntensidade.forEach((card) => {
    card.addEventListener('click', () => {
      cardsIntensidade.forEach((item) => item.classList.remove('ativa'));
      card.classList.add('ativa');

      intensidadeSelecionada = {
        valor: card.dataset.valor
      };

      salvarIntensidade();
      atualizarResumo();
    });
  });
}

// Carregar imagens de acordo com o sexo escolhido
function aplicarSexoNasImagens() {
  const dados = localStorage.getItem(chavePaciente);
  if (!dados) return;

  const paciente = JSON.parse(dados);

  const sexo = paciente.sexo === 'feminino' ? 'feminino' : 'masculino';

  const imagens = document.querySelectorAll('.imagem-escala');
  imagens.forEach((img) => {
    const tipo = img.dataset.tipo;

    img.src = `img/${sexo}/${tipo}.png`;
  });
}

btnVoltar.addEventListener('click', () => {
  window.location.href = '../02-corpo/index.html';
});

btnProximo.addEventListener('click', () => {
  if (!intensidadeSelecionada) {
    alert('Selecione a intensidade da dor antes de continuar.');
    return;
  }

  window.location.href = '../04-desconforto/index.html';
});

const btnMenu = document.getElementById("btn-menu");
const menuAcoes = document.getElementById("menu-acoes");
const btnLimparIntensidade = document.getElementById("btn-limpar-intensidade");

if (btnMenu && menuAcoes) {
  btnMenu.addEventListener("click", () => {
    menuAcoes.classList.toggle("aberto");

    btnMenu.textContent = menuAcoes.classList.contains("aberto")
      ? "×"
      : "☰";
  });
}

if (btnLimparIntensidade) {
  btnLimparIntensidade.addEventListener("click", () => {
    intensidadeSelecionada = null;

    localStorage.removeItem(chaveIntensidade);

    cardsIntensidade.forEach((card) => {
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