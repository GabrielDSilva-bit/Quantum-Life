document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.quiz-option');
    const nextButton = document.getElementById('next-button');
    let selectedOption = null;

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove seleção anterior
            options.forEach(o => o.classList.remove('selected'));

            // Adiciona seleção
            option.classList.add('selected');

            // Armazena o link da opção
            selectedOption = option.getAttribute('data-target');
        });
    });

    nextButton.addEventListener('click', () => {
        if (selectedOption) {
            window.location.href = selectedOption;
        } else {
            alert('Por favor, selecione uma opção antes de continuar!');
        }
    });
});
