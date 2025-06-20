document.addEventListener('DOMContentLoaded', () => {
    const generatedPlan = localStorage.getItem("generatedDietPlan"); // Pega o plano gerado do localStorage
    const profileTitleElement = document.getElementById("profileTitle");
    const profileDescriptionElement = document.getElementById("profileDescription");
    const profileDetailsElement = document.getElementById("profileDetails"); // O <ul> onde os detalhes serão exibidos

    if (generatedPlan) {
        profileTitleElement.textContent = "Seu Plano Alimentar Personalizado!";
        profileDescriptionElement.textContent = "Aqui está o plano de dieta gerado pela nossa inteligência artificial, feito sob medida para suas preferências:";

        profileDetailsElement.innerHTML = ''; // Limpa qualquer conteúdo antigo

        // O plano gerado pela IA virá como uma string de texto formatada.
        // Vamos dividir o texto em linhas e criar itens de lista para cada linha.
        const lines = generatedPlan.split('\n');
        lines.forEach(line => {
            const li = document.createElement('li');
            li.textContent = line;
            profileDetailsElement.appendChild(li);
        });

        // Se a formatação da IA for melhor em um bloco de texto simples, você pode usar:
        // profileDetailsElement.innerHTML = `<pre>${generatedPlan}</pre>`;
        // Ou: profileDetailsElement.innerHTML = `<div>${generatedPlan.replace(/\n/g, '<br>')}</div>`;

    } else {
        profileTitleElement.textContent = "Plano de Dieta Não Encontrado.";
        profileDescriptionElement.textContent = "Não foi possível carregar o plano de dieta. Por favor, complete o quiz novamente.";
        profileDetailsElement.innerHTML = '';
    }
});
