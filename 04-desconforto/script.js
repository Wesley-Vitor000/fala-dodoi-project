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