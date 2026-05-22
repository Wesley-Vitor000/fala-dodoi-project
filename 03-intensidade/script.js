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


const titiBox = document.querySelector(".titi-assistente");
const titiVideo = document.querySelector(".titi-video");
const titiAudio = document.getElementById("audio-titi");

let titiJaFalou = false;

window.addEventListener("load", () => {
  if (!titiBox) return;

  setTimeout(() => {
    mostrarTiti();
  }, 800);
});

function mostrarTiti() {
  titiBox.classList.add("titi-visivel");

  if (titiVideo) {
    titiVideo.currentTime = 0;
    titiVideo.play().catch(() => {});
  }

  tocarAudioTiti();
}

function tocarAudioTiti() {
  if (!titiAudio || titiJaFalou) return;

  titiAudio.currentTime = 0;

  const tentativa = titiAudio.play();

  if (tentativa !== undefined) {
    tentativa
      .then(() => {
        titiJaFalou = true;
      })
      .catch(() => {
        document.addEventListener("click", tocarAposInteracao, { once: true });
        document.addEventListener("touchstart", tocarAposInteracao, { once: true });
      });
  }

  titiAudio.onended = esconderTiti;
}

function tocarAposInteracao() {
  if (!titiAudio || titiJaFalou) return;

  titiAudio.currentTime = 0;

  titiAudio.play().then(() => {
    titiJaFalou = true;
  });

  titiAudio.onended = esconderTiti;
}

function esconderTiti() {
  titiBox.classList.remove("titi-visivel");

  setTimeout(() => {
    if (titiVideo) {
      titiVideo.pause();
    }
  }, 900);
}
 

// Favicon Interativo
const btnReferencia = document.getElementById("btn-referencia");
const popupReferencia = document.getElementById("popup-referencia");

if (btnReferencia && popupReferencia) {
  btnReferencia.addEventListener("click", (event) => {
    event.stopPropagation();
    popupReferencia.classList.toggle("aberto");
  });

  document.addEventListener("click", () => {
    popupReferencia.classList.remove("aberto");
  });

  popupReferencia.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}