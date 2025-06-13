document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica para alternar entre os formulários (animação visual) ---
    // Selecionar os botões
    var btnsignin = document.querySelector("#signin"); // Botão "Criar conta" na seção de Login
    var btnsignup = document.querySelector("#signup-second"); // Botão "Login" na seção de Cadastro

    var body = document.querySelector("body");

    // Adicionar eventos de clique aos botões de transição
    if (btnsignin) { // Verifica se o elemento existe antes de adicionar o listener
        btnsignin.addEventListener("click", function () {
            body.className = "sign-up-js"; // Adiciona a classe para mostrar o formulário de Cadastro
        });
    }

    if (btnsignup) { // Verifica se o elemento existe
        btnsignup.addEventListener("click", function(){
            body.className = "sign-in-js"; // Adiciona a classe para mostrar o formulário de Login
        });
    }

    // --- Lógica para o Formulário de CADASTRO (envio para o backend) ---
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.createElement('div'); // Criar uma div para mensagens
    messageDiv.className = 'message'; // Aplicar classes de estilo para a mensagem
    messageDiv.style.display = 'none'; // Esconder por padrão
    // Adicionar a div de mensagem ao body. Você pode ajustar onde ela aparece no seu CSS.
    // Uma boa prática seria adicioná-la a um elemento específico no HTML, como um div placeholder.
    // Por simplicidade, vou adicionar ao body por enquanto.
    document.body.appendChild(messageDiv);


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const email = document.getElementById('regEmail').value;
            const cpf = document.getElementById('regCpf').value;
            const password = document.getElementById('regPassword').value;

            try {
                // Envia uma requisição POST para a rota /register do seu backend
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Indica que estamos enviando JSON
                    },
                    body: JSON.stringify({ email, cpf, password }) // Converte os dados do formulário em JSON
                });

                const text = await response.text(); // Lê a resposta do servidor como texto

                if (response.ok) { // Se o status da resposta for 2xx (sucesso)
                    messageDiv.className = 'message success';
                    messageDiv.textContent = text; // Exibe a mensagem de sucesso do servidor
                    registerForm.reset(); // Limpa o formulário após o sucesso
                } else { // Se o status da resposta não for 2xx (erro)
                    messageDiv.className = 'message error';
                    messageDiv.textContent = text;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Erro de rede: ' + error.message;
            } finally {
                messageDiv.style.display = 'block'; // Garante que a div de mensagem seja visível
            }
        });
    }


    // --- Lógica para o Formulário de LOGIN (envio para o backend) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const cpf = document.getElementById('loginCpf').value;
            const password = document.getElementById('loginPassword').value;

            try {
                // Envia uma requisição POST para a rota /login do seu backend
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cpf, password })
                });

                const text = await response.text();

                if (response.ok) { // Se o status da resposta for 2xx (sucesso)
                    messageDiv.className = 'message success';
                    messageDiv.textContent = text;
                    loginForm.reset(); // Limpa o formulário após o login
                    // AQUI VOCÊ PODE REDIRECIONAR O USUÁRIO APÓS O LOGIN BEM-SUCEDIDO
                    // window.location.href = '/dashboard'; // Exemplo: Redirecionar para uma página de dashboard
                } else { // Se o status da resposta não for 2xx (erro)
                    messageDiv.className = 'message error';
                    messageDiv.textContent = text;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Erro de rede: ' + error.message;
            } finally {
                messageDiv.style.display = 'block'; // Garante que a div de mensagem seja visível
            }
        });
    }

    // A linha 'var botaoCriar = document.getElementById('meubotao');' não é usada
    // na lógica que você me forneceu. Se ela for para outro propósito, mantenha.
    // Caso contrário, pode removê-la para limpar o código.
    // Por exemplo, se 'meubotao' for um botão de submit de algum formulário,
    // ele deve ser tratado da mesma forma que registerForm ou loginForm.

}); // Fim do DOMContentLoaded