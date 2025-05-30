// Seleção de elementos
const options = document.querySelectorAll('.quiz-option');
const finishButton = document.getElementById('finish-button');

// Adiciona a classe "selected" quando uma opção é clicada
options.forEach(option => {
    option.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected')); // Remove de todos
        option.classList.add('selected'); // Adiciona no clicado
    });
});

// Ação do botão Finalizar
finishButton.addEventListener('click', () => {
    const selectedOption = document.querySelector('.quiz-option.selected');

    if (selectedOption) {
        console.log('Você selecionou:', selectedOption.innerText.trim());
        // Redireciona para a página de resultado
        window.location.href = '../resultado-treino.html';
    } else {
        console.log('Por favor, selecione uma opção antes de finalizar.');
        alert('Por favor, selecione uma opção antes de finalizar o quiz.');
    }
});
