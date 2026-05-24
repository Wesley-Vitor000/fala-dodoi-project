const btnTriagem = document.getElementById("btn-triagem");
const btnComissao = document.getElementById("btn-comissao");

btnTriagem.addEventListener("click", () => {

  window.location.href =
    "../login-triagem/index.html";

});

btnComissao.addEventListener("click", () => {

  window.location.href =
    "../login-comissao/index.html";

});