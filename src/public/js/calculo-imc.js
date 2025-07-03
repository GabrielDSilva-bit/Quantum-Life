// /js/calculo-imc.js
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const alturaInput = form.querySelector('input[name="altura"]');
    const pesoInput = form.querySelector('input[name="peso"]');
    const resultadoEl = document.querySelector(".results-value");
    const categoriaEl = document.querySelector(".results-description");
    const mensagemFeedbackEl = document.getElementById('api-feedback-message');

    // Referência ao modal
    const modal = document.getElementById("successModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");

    function openModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = "flex";
    }

    function closeModal() {
        modal.style.display = "none";
    }

    const closeButton = document.querySelector(".close-button");
    const modalOkButton = document.getElementById("modalOkButton");

    closeButton.addEventListener("click", closeModal);
    modalOkButton.addEventListener("click", closeModal);

    // Função para limitar dígitos e formatar com vírgula
    function limitDigits(input, maxDigits) {
        let value = input.value;
        // Remove tudo que não for número ou vírgula/ponto
        value = value.replace(/[^0-9.,]/g, '');

        // Temporariamente substitui vírgula por ponto para padronizar o processamento numérico
        let processedValue = value.replace(/,/g, '.');

        // Aplica a lógica de limitação de dígitos ao processedValue (que usa ponto)
        if (processedValue.includes('.')) {
            const parts = processedValue.split('.');
            // Limita o número de dígitos na parte inteira
            if (parts[0].length > maxDigits) {
                parts[0] = parts[0].substring(0, maxDigits);
            }
            // Limita o número de dígitos na parte decimal (mantendo o maxDigits como limite para cada parte)
            if (parts[1] && parts[1].length > maxDigits) {
                parts[1] = parts[1].substring(0, maxDigits);
            }
            processedValue = parts.join('.');
        } else {
            // Se não houver ponto decimal, limita o número total de dígitos
            if (processedValue.length > maxDigits) {
                processedValue = processedValue.substring(0, maxDigits);
            }
        }

        // Converte de volta para vírgula para exibição se houver um separador decimal
        if (processedValue.includes('.')) {
            input.value = processedValue.replace('.', ',');
        } else {
            input.value = processedValue;
        }
    }

    // Torna a função acessível globalmente para uso no HTML (oninput)
    window.limitDigits = limitDigits;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        mensagemFeedbackEl.textContent = '';
        mensagemFeedbackEl.style.color = '';
        resultadoEl.textContent = '0.00';
        categoriaEl.textContent = 'O resultado obtido fornece uma estimativa do estado nutricional, podendo indicar se o peso está adequado ou se há riscos associados à saúde.';

        // Garante que a altura e o peso sejam lidos com ponto para o cálculo, independentemente do que o usuário digitou (vírgula ou ponto)
        let altura = parseFloat(alturaInput.value.replace(",", "."));
        const peso = parseFloat(pesoInput.value.replace(",", "."));

        if (isNaN(altura) || isNaN(peso) || altura <= 0 || peso <= 0) {
            const errorMsg = "Por favor, insira valores válidos e positivos para altura e peso.";
            mensagemFeedbackEl.textContent = errorMsg;
            mensagemFeedbackEl.style.color = "red";

            openModal(
                "Erro de entrada!",
                errorMsg
            );
            return;
        }

        // Se a altura for digitada em centímetros (ex: 175), converte para metros (1.75)
        if (altura > 100) {
            altura = altura / 100;
            // Atualiza o campo de input com o valor formatado em metros e com vírgula
            alturaInput.value = altura.toFixed(2).replace('.', ',');
        }

        const imc = peso / (altura * altura);
        const imcArredondado = imc.toFixed(2); // Arredonda para 2 casas decimais

        let classificacao = "";

        if (imc < 18.5) classificacao = 'Abaixo do peso';
        else if (imc < 24.9) classificacao = 'Peso Normal';
        else if (imc < 29.9) classificacao = 'Sobrepeso';
        else if (imc < 34.9) classificacao = 'Obesidade Grau I';
        else if (imc < 39.9) classificacao = 'Obesidade Grau II';
        else classificacao = 'Obesidade Grau III';

        resultadoEl.textContent = `${imcArredondado}`;
        categoriaEl.textContent = `${classificacao}. O resultado obtido fornece uma estimativa do estado nutricional, podendo indicar se o peso está adequado ou se há riscos associados à saúde.`;

        const token = localStorage.getItem('token');

        if (!token) {
            mensagemFeedbackEl.textContent = 'Você precisa estar logado para salvar seu IMC.';
            mensagemFeedbackEl.style.color = "orange";

            openModal(
                "Você não está logado!",
                "O cálculo foi realizado, mas para salvar e acompanhar seu histórico de IMC, por favor faça login. Redirecionando para a página de login..."
            );

            setTimeout(() => {
                window.location.href = '/login-cadastro';
            }, 3000);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/salvar-imc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    peso: peso,
                    altura: altura, // Envia a altura já convertida para metros
                    imc: imcArredondado,
                    categoria: classificacao
                } )
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                mensagemFeedbackEl.textContent = 'Sessão expirada. Faça login novamente.';
                mensagemFeedbackEl.style.color = "red";

                openModal(
                    "Sessão expirada!",
                    "Sua sessão expirou ou o token é inválido. Redirecionando para login..."
                );

                setTimeout(() => {
                    window.location.href = '/login-cadastro';
                }, 3000);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'Erro desconhecido ao salvar IMC.');
            }

            const data = await response.json();
            mensagemFeedbackEl.textContent = data.message || 'IMC salvo com sucesso!';
            mensagemFeedbackEl.style.color = "green";

            openModal("IMC cadastrado com sucesso!", "Seu índice de massa corporal foi calculado e salvo com sucesso.");

        } catch (error) {
            console.error('Erro ao salvar IMC:', error);
            mensagemFeedbackEl.textContent = `Erro: ${error.message}`;
            mensagemFeedbackEl.style.color = "red";

            openModal("Erro ao salvar!", `Ocorreu um erro ao tentar salvar o IMC: ${error.message}`);
        }
    });
});
