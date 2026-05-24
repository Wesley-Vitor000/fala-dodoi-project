if (
  sessionStorage.getItem(
    "triagemAutenticada"
  ) !== "true"
) {

  window.location.href =
    "../login-triagem/index.html";

}

const formIdentificacao = document.getElementById('form-identificacao');
const mensagem = document.getElementById('mensagem');

formIdentificacao.addEventListener('submit', function (event) {
  event.preventDefault();

  sessionStorage.removeItem('alertaFalaDodoiEnviado');

  const nome = document.getElementById('nome').value.trim();
  const sexo = document.getElementById("sexo").value;
  const idade = document.getElementById('idade').value.trim();
  const prontuario = document.getElementById('prontuario').value.trim();

  if (!nome || !sexo || !idade) {
    mensagem.textContent = 'Preencha pelo menos nome e idade para continuar.';
    return;
  }

  const dadosPaciente = {
    nome,
    sexo,
    idade,
    prontuario
  };

  localStorage.setItem('dadosPacienteTriagem', JSON.stringify(dadosPaciente));

  mensagem.textContent = 'Dados salvos com sucesso. A próxima tela será a seleção do local da dor.';

  window.location.href = "../02-corpo/index.html";
});