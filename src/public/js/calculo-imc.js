document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const alturaInput = form.querySelector('input[name="altura"]');
  const pesoInput = form.querySelector('input[name="peso"]');
  const resultadoEl = document.querySelector(".results-value");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const altura = parseFloat(alturaInput.value.replace(",", "."));
    const peso = parseFloat(pesoInput.value.replace(",", "."));

    const faixaEtaria = form.querySelector('input[name="faixa_etaria"]:checked')?.value;
    const sexo = form.querySelector('input[name="sexo"]:checked')?.value;

    if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
      alert("Por favor, insira valores válidos para altura e peso.");
      return;
    }

    const imc = peso / (altura * altura);
    const imcArredondado = imc.toFixed(2);
    let classificacao = "";

    

    resultadoEl.textContent = `${imcArredondado} `;
  });
});
