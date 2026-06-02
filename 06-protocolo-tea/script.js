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
const radiosSuporte = document.querySelectorAll('.radio-suporte');
const reforcadorTea = document.getElementById('reforcadorTea');

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

  let nivelSuporte = '';

  checksTea.forEach((check) => {
    if (check.checked) {
      itensSelecionados.push(check.value);
    }
  });

  radiosSuporte.forEach((radio) => {
    if (radio.checked) {
      nivelSuporte = radio.value;
    }
  });

  return {
    itens: itensSelecionados,
    nivelSuporte: nivelSuporte,
    reforcador: reforcadorTea.value.trim(),
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
    check.checked = tea.itens?.includes(check.value) || false;
  });

    radiosSuporte.forEach((radio) => {
    radio.checked = tea.nivelSuporte === radio.value;
  });

  reforcadorTea.value = tea.reforcador || '';

  observacoesTea.value = tea.observacoes || '';
}

function atualizarResumo() {
  const dados = obterDadosTea();
  const partes = [];

  if (dados.itens.length > 0) {
    partes.push(`Itens marcados: ${dados.itens.join(', ')}`);
  }

  if (dados.nivelSuporte) {
    partes.push(`Nível de suporte: ${dados.nivelSuporte}`);
  }

  if (dados.reforcador) {
    partes.push(`Reforçador: ${dados.reforcador}`);
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

    radiosSuporte.forEach((radio) => {
    radio.addEventListener('change', () => {
      salvarTea();
      atualizarResumo();
    });
  });

  reforcadorTea.addEventListener('input', () => {
    salvarTea();
    atualizarResumo();
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