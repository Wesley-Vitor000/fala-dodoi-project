if (
  sessionStorage.getItem(
    "triagemAutenticada"
  ) !== "true"
) {

  window.location.href =
    "../login-triagem/index.html";

}

const chavePaciente = 'dadosPacienteTriagem';
const chaveTea = 'protocoloTeaTriagem';

const infoPaciente = document.getElementById('info-paciente');
const btnVoltar = document.getElementById('btn-voltar');
const btnProximo = document.getElementById('btn-proximo');
const textoTea = document.getElementById('texto-tea');
const checksTea = document.querySelectorAll('.check-tea');
const observacoesTea = document.getElementById('observacoesTea');

document.addEventListener('DOMContentLoaded', () => {
  carregarPaciente();
  carregarTeaSalvo();
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

function obterDadosTea() {
  const itensSelecionados = [];

  checksTea.forEach((check) => {
    if (check.checked) {
      itensSelecionados.push(check.value);
    }
  });

  return {
    itens: itensSelecionados,
    observacoes: observacoesTea.value.trim()
  };
}

function salvarTea() {
  const dados = obterDadosTea();
  localStorage.setItem(chaveTea, JSON.stringify(dados));
}

function carregarTeaSalvo() {
  const dados = localStorage.getItem(chaveTea);

  if (!dados) return;

  const tea = JSON.parse(dados);

  checksTea.forEach((check) => {
    check.checked = tea.itens.includes(check.value);
  });

  observacoesTea.value = tea.observacoes || '';
}

function atualizarResumo() {
  const dados = obterDadosTea();
  const partes = [];

  if (dados.itens.length > 0) {
    partes.push(`Itens marcados: ${dados.itens.join(', ')}`);
  }

  if (dados.observacoes) {
    partes.push(`Observações: ${dados.observacoes}`);
  }

  if (partes.length === 0) {
    textoTea.textContent = 'Nenhuma observação selecionada ainda.';
    return;
  }

  textoTea.textContent = partes.join(' • ');
}

function aplicarEventos() {
  checksTea.forEach((check) => {
    check.addEventListener('change', () => {
      salvarTea();
      atualizarResumo();
    });
  });

  observacoesTea.addEventListener('input', () => {
    salvarTea();
    atualizarResumo();
  });
}

btnVoltar.addEventListener('click', () => {
  window.location.href = '../05-anamnese/index.html';
});

btnProximo.addEventListener('click', () => {
  salvarTea();
  window.location.href = '../07-documento-final/index.html';
});