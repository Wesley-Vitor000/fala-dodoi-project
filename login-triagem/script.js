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
    usuario === "adminTriagem" &&
    senha === "adminTriagem"
  ) {

    sessionStorage.setItem(
      "triagemAutenticada",
      "true"
    );

    window.location.href =
      "../01-identificacao/index.html";

  }

  else {

    alert(
      "Usuário ou senha inválidos."
    );

  }

});