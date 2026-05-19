const chavePaciente = 'dadosPacienteTriagem';
const chaveLocais = 'locaisDorTriagem';

const infoPaciente = document.getElementById('info-paciente');
const textoLocais = document.getElementById('texto-locais');
const btnVoltar = document.getElementById('btn-voltar');
const btnProximo = document.getElementById('btn-proximo');
const btnVirar = document.getElementById('btn-virar');
const btnLimpar = document.getElementById('btn-limpar');
const vistaFrente = document.getElementById('vista-frente');
const vistaCostas = document.getElementById('vista-costas');
const tituloVista = document.getElementById('titulo-vista');
const subtituloVista = document.getElementById('subtitulo-vista');

let vistaAtual = 'frente';
let locaisSelecionados = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarPaciente();
  limparSelecaoSeAbrirDireto();
  carregarLocaisSalvos();
  aplicarEventosNasPartes();
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

function limparSelecaoSeAbrirDireto() {
  const veioDaIdentificacao = document.referrer.includes('01-identificacao');
  const veioDaIntensidade = document.referrer.includes('03-intensidade');

  if (!veioDaIdentificacao && !veioDaIntensidade) {
    localStorage.removeItem(chaveLocais);
  }
}

function carregarLocaisSalvos() {
  const dados = localStorage.getItem(chaveLocais);

  if (!dados) {
    locaisSelecionados = [];
    return;
  }

  locaisSelecionados = JSON.parse(dados);
}

function salvarLocais() {
  localStorage.setItem(chaveLocais, JSON.stringify(locaisSelecionados));
}

function atualizarResumo() {
  if (locaisSelecionados.length === 0) {
    textoLocais.textContent = 'Nenhuma região selecionada.';
    return;
  }

  textoLocais.textContent = locaisSelecionados.join(', ');
}

function aplicarEventosNasPartes() {
  const partesCorpo = document.querySelectorAll('.parte-corpo');

  partesCorpo.forEach((parte) => {
    const local = parte.dataset.local;

    if (locaisSelecionados.includes(local)) {
      parte.classList.add('selecionada');
    }

    parte.addEventListener('click', () => {
      const existe = locaisSelecionados.includes(local);

      if (existe) {
        locaisSelecionados = locaisSelecionados.filter(item => item !== local);
        parte.classList.remove('selecionada');
      } else {
        locaisSelecionados.push(local);
        parte.classList.add('selecionada');
      }

      salvarLocais();
      atualizarResumo();
    });
  });
}

function alternarVista() {
  if (vistaAtual === 'frente') {
    vistaAtual = 'costas';
    vistaFrente.classList.remove('ativa');
    vistaCostas.classList.add('ativa');
    tituloVista.textContent = 'Onde está doendo? (Costas)';
    subtituloVista.textContent = 'Toque nas partes posteriores do corpo onde o paciente sente dor';
    btnVirar.textContent = 'Ver frente';
  } else {
    vistaAtual = 'frente';
    vistaCostas.classList.remove('ativa');
    vistaFrente.classList.add('ativa');
    tituloVista.textContent = 'Onde está doendo? (Frente)';
    subtituloVista.textContent = 'Toque nas partes do corpo onde o paciente sente dor';
    btnVirar.textContent = 'Ver costas';
  }
}

function limparSelecaoManual() {
  locaisSelecionados = [];
  localStorage.removeItem(chaveLocais);

  const partesCorpo = document.querySelectorAll('.parte-corpo');
  partesCorpo.forEach((parte) => {
    parte.classList.remove('selecionada');
  });

  atualizarResumo();
}

btnVirar.addEventListener('click', alternarVista);
btnLimpar.addEventListener('click', limparSelecaoManual);

btnVoltar.addEventListener('click', () => {
  window.location.href = '../01-identificacao/index.html';
});

btnProximo.addEventListener('click', () => {
  if (locaisSelecionados.length === 0) {
    alert('Selecione pelo menos uma região do corpo antes de continuar.');
    return;
  }

  window.location.href = '../03-intensidade/index.html';
});

const btnMenu = document.getElementById("btn-menu");
const menuAcoes = document.getElementById("menu-acoes");

if (btnMenu && menuAcoes) {
  btnMenu.addEventListener("click", () => {
    menuAcoes.classList.toggle("aberto");

    if (menuAcoes.classList.contains("aberto")) {
      btnMenu.textContent = "×";
    } else {
      btnMenu.textContent = "☰";
    }
  });
}

// ARRASTAVEL DO AVATAR
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