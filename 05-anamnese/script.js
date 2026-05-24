if (
  sessionStorage.getItem(
    "triagemAutenticada"
  ) !== "true"
) {

  window.location.href =
    "../login-triagem/index.html";

}

const chavePaciente = 'dadosPacienteTriagem';
const chaveAnamnese = 'anamneseTriagem';

const infoPaciente = document.getElementById('info-paciente');
const btnVoltar = document.getElementById('btn-voltar');
const btnProximo = document.getElementById('btn-proximo');
const textoAnamnese = document.getElementById('texto-anamnese');

const inicioDor = document.getElementById('inicioDor');
const duracaoDor = document.getElementById('duracaoDor');
const pioraDor = document.getElementById('pioraDor');
const melhoraDor = document.getElementById('melhoraDor');
const sinaisAssociados = document.getElementById('sinaisAssociados');
const observacoes = document.getElementById('observacoes');
const dificuldadeComunicacao = document.getElementById('dificuldadeComunicacao');

document.addEventListener('DOMContentLoaded', () => {
  carregarPaciente();
  carregarAnamneseSalva();
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

function obterDadosAnamnese() {
  return {
    inicioDor: inicioDor.value,
    duracaoDor: duracaoDor.value,
    pioraDor: pioraDor.value.trim(),
    melhoraDor: melhoraDor.value.trim(),
    sinaisAssociados: sinaisAssociados.value.trim(),
    observacoes: observacoes.value.trim(),
    dificuldadeComunicacao: dificuldadeComunicacao.checked
  };
}

function salvarAnamnese() {
  const dados = obterDadosAnamnese();
  localStorage.setItem(chaveAnamnese, JSON.stringify(dados));
}

function carregarAnamneseSalva() {
  const dados = localStorage.getItem(chaveAnamnese);

  if (!dados) return;

  const anamnese = JSON.parse(dados);

  inicioDor.value = anamnese.inicioDor || '';
  duracaoDor.value = anamnese.duracaoDor || '';
  pioraDor.value = anamnese.pioraDor || '';
  melhoraDor.value = anamnese.melhoraDor || '';
  sinaisAssociados.value = anamnese.sinaisAssociados || '';
  observacoes.value = anamnese.observacoes || '';
  dificuldadeComunicacao.checked = anamnese.dificuldadeComunicacao || false;
}

function atualizarResumo() {
  const dados = obterDadosAnamnese();
  const partes = [];

  if (dados.inicioDor) partes.push(`Início da dor: ${dados.inicioDor}`);
  if (dados.duracaoDor) partes.push(`Padrão: ${dados.duracaoDor}`);
  if (dados.pioraDor) partes.push(`Piora com: ${dados.pioraDor}`);
  if (dados.melhoraDor) partes.push(`Melhora com: ${dados.melhoraDor}`);
  if (dados.sinaisAssociados) partes.push(`Sinais associados: ${dados.sinaisAssociados}`);
  if (dados.observacoes) partes.push(`Observações: ${dados.observacoes}`);
  if (dados.dificuldadeComunicacao) partes.push(`Paciente com dificuldade de comunicação verbal`);

  if (partes.length === 0) {
    textoAnamnese.textContent = 'Nenhuma informação adicional preenchida ainda.';
    return;
  }

  textoAnamnese.textContent = partes.join(' • ');
}

function aplicarEventos() {
  const campos = [
    inicioDor,
    duracaoDor,
    pioraDor,
    melhoraDor,
    sinaisAssociados,
    observacoes
  ];

  campos.forEach((campo) => {
    campo.addEventListener('input', () => {
      salvarAnamnese();
      atualizarResumo();
    });

    campo.addEventListener('change', () => {
      salvarAnamnese();
      atualizarResumo();
    });
  });

  dificuldadeComunicacao.addEventListener('change', () => {
    salvarAnamnese();
    atualizarResumo();
  });
}

btnVoltar.addEventListener('click', () => {
  window.location.href = '../04-desconforto/index.html';
});

btnProximo.addEventListener('click', () => {
  salvarAnamnese();
  window.location.href = '../06-protocolo-tea/index.html';
});