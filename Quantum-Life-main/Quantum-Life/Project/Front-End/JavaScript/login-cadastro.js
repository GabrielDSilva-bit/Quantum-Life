document.addEventListener('DOMContentLoaded', function() {
    // Selecionar os botões
    var btnsignin = document.querySelector("#signin");
    var btnsignup = document.querySelector("#signup-second"); // Mudado para ID único
    var botaoCriar = document.getElementById('meubotao'); // Corrigido o método e o ID

    var body = document.querySelector("body");

    // Adicionar eventos de clique aos botões
    btnsignin.addEventListener("click", function () {
        body.className = "sign-in-js";
    });

    btnsignup.addEventListener("click", function(){
        body.className = "sign-up-js";
    });

});
