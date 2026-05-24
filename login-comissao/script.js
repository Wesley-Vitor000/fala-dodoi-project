const formLogin =
  document.getElementById("form-login");

const inputUsuario =
  document.getElementById("usuario");

const inputSenha =
  document.getElementById("senha");

formLogin.addEventListener("submit", (event) => {

  event.preventDefault();

  const usuario =
    inputUsuario.value.trim();

  const senha =
    inputSenha.value.trim();

  if (
    usuario === "adminDor" &&
    senha === "adminDor"
  ) {

    sessionStorage.setItem(
      "comissaoAutenticada",
      "true"
    );

    window.location.href =
      "../09-alerta-comissao-dor/index.html";

  }

  else {

    alert(
      "Usuário ou senha inválidos."
    );

  }

});