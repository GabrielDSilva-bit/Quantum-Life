// public/js/login-cadastro.js

document.addEventListener('DOMContentLoaded', function() {
    // Selecionar os botões de animação
    var btnsignin = document.querySelector("#signin");
    var btnsignup = document.querySelector("#signup-second");
    var body = document.querySelector("body");

    // Adicionar eventos de clique aos botões de animação
    if (btnsignin && btnsignup && body) { // Verifica se os elementos existem
        btnsignin.addEventListener("click", function () {
            body.className = "sign-in-js";
            hideAllMessages(); // Esconde mensagens ao mudar de formulário
        });

        btnsignup.addEventListener("click", function(){
            body.className = "sign-up-js";
            hideAllMessages(); // Esconde mensagens ao mudar de formulário
        });
    } else {
        console.warn("Um ou mais elementos de botões de animação ou 'body' não foram encontrados.");
    }

    // --- Elementos da Mensagem Genérica (opcional, para outros erros/sucessos que não são pop-up) ---
    const generalMessageContainer = document.getElementById('general-message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.style.display = 'none';
    if (generalMessageContainer) {
        generalMessageContainer.appendChild(messageDiv);
    } else {
        document.body.appendChild(messageDiv); // Fallback caso o container não exista
        console.warn("Elemento 'general-message-container' não encontrado. Mensagens gerais serão adicionadas diretamente ao body.");
    }

    // Função auxiliar para exibir a mensagem genérica
    function showGeneralMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
        }, 5000);
    }

    // Função para esconder todas as mensagens (útil ao alternar formulários)
    function hideAllMessages() {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // --- Elementos do Pop-up (Modal) ---
    const successModal = document.getElementById('successModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.querySelector('.close-button');
    const modalOkButton = document.getElementById('modalOkButton');

    // Garantir que o modal esteja oculto ao carregar a página
    if (successModal) {
        successModal.style.display = 'none';
    }

    // Variável para armazenar a função showModal, para que possa ser acessada globalmente
    let showModalFunction;

    // Verifica se todos os elementos do modal existem antes de tentar manipulá-los
    if (successModal && modalTitle && modalMessage && closeButton && modalOkButton) {
        showModalFunction = function(title, message, type) { // type: 'success' ou 'error'
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            successModal.classList.remove('success', 'error'); // Remove classes anteriores
            successModal.classList.add(type); // Adiciona a nova classe de tipo

            successModal.style.display = 'flex'; // Exibe o modal

            // Ajusta cores dos elementos do modal
            if (type === 'error') {
                modalTitle.style.color = '#f44336';
                modalOkButton.style.backgroundColor = '#f44336';
                modalOkButton.onmouseover = () => modalOkButton.style.backgroundColor = '#d32f2f';
                modalOkButton.onmouseout = () => modalOkButton.style.backgroundColor = '#f44336';
            } else { // type === 'success'
                modalTitle.style.color = '#4CAF50';
                modalOkButton.style.backgroundColor = '#4CAF50';
                modalOkButton.onmouseover = () => modalOkButton.style.backgroundColor = '#45a049';
                modalOkButton.onmouseout = () => modalOkButton.style.backgroundColor = '#4CAF50';
            }
        };

        // Eventos para fechar o pop-up
        closeButton.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
        modalOkButton.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    } else {
        console.error("Um ou mais elementos do modal não foram encontrados no HTML. Usando fallback de alert().");
        // Fallback simples se o modal não existir (para garantir que as mensagens ainda apareçam)
        showModalFunction = (title, message, type) => {
            alert(`${title}\n${message}`);
            console.log(`Modal Fallback: ${type} - ${title}: ${message}`);
        };
    }

    // Expor a função showModal para que possa ser usada em outros lugares se necessário
    window.showModal = showModalFunction;


    // --- Lógica para o Formulário de CADASTRO (envio para o backend) ---
    const registerForm = document.getElementById('registerForm');

    if (registerForm && typeof window.showModal === 'function') { // Garante que showModal foi definida
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('regEmail').value;
            const cpf = document.getElementById('regCpf').value;
            const password = document.getElementById('regPassword').value;

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, cpf, password })
                });

                const data = await response.json(); 

                if (response.ok) { // Status 2xx (ex: 201 Created)
                    window.showModal('Cadastro Realizado!', data.message, 'success');
                    registerForm.reset();

                    // --- ESTE É O BLOCO QUE GARANTE A ANIMAÇÃO DE VOLTA PARA O LOGIN ---
                    setTimeout(() => {
                        if (successModal) { // Verifica se o modal existe antes de tentar esconder
                            successModal.style.display = 'none'; // 1. Esconde o modal de sucesso
                        }
                        // 2. Altera a classe do <body> para 'sign-in-js'
                        // Isso dispara as animações CSS de transição para a tela de login.
                        if (body) {
                            body.className = "sign-in-js";
                        }
                        // IMPORTANTE: Não há nenhum redirecionamento de página aqui.
                        // O usuário ficará na tela de login, esperando para inserir as credenciais.
                    }, 2000); // Dá tempo para o usuário ler a mensagem no modal (2 segundos)
                    // ------------------------------------------------------------------

                } else { // Status 4xx ou 5xx
                    window.showModal('Erro no Cadastro', data.message || 'Erro ao cadastrar. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro de rede ou JSON inválido:', error);
                window.showModal('Erro de Conexão', 'Não foi possível se comunicar com o servidor. Verifique sua conexão.', 'error');
            }
        });
    } else {
        console.warn("Elemento 'registerForm' ou a função 'showModal' não estão disponíveis para configurar o evento de submit.");
    }

    // --- Lógica para o Formulário de LOGIN (envio para o backend) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm && typeof window.showModal === 'function') { // Garante que showModal foi definida
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cpf = document.getElementById('loginCpf').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf, password })
                });

                const data = await response.json(); 

                if (response.ok) { // Status 2xx (ex: 200 OK)
                    if (data.token) {
                        localStorage.setItem('token', data.token); // Salva o token
                        window.showModal('Login Realizado!', data.message, 'success');
                        loginForm.reset();

                        setTimeout(async () => { 
                            if (successModal) { // Verifica se o modal existe antes de tentar esconder
                                successModal.style.display = 'none'; // Esconde a modal
                            }

                            const token = localStorage.getItem('token'); 

                            // Lógica de verificação de perfil e redirecionamento APÓS o login bem-sucedido
                            // Isso é esperado para o fluxo de login, pois o usuário já está logado
                            try {
                                const perfilResponse = await fetch('/perfil', {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': 'Bearer ' + token
                                    }
                                });

                                if (perfilResponse.ok) {
                                    const perfilData = await perfilResponse.json();
                                    if (perfilData.logado) {
                                        window.location.href = '/'; // Redireciona para a página principal
                                    } else {
                                        // Token inválido ou usuário não logado após verificação de perfil
                                        localStorage.removeItem('token');
                                        window.location.href = '/login-cadastro'; // Redireciona de volta para login
                                    }
                                } else if (perfilResponse.status === 401 || perfilResponse.status === 403) {
                                    // Token expirado ou não autorizado
                                    localStorage.removeItem('token');
                                    window.location.href = '/login-cadastro'; // Redireciona de volta para login
                                } else {
                                    // Outros erros na verificação de perfil, redireciona para a home
                                    window.location.href = '/';
                                }
                            } catch (perfilError) {
                                console.error('Erro ao verificar perfil após login:', perfilError);
                                window.location.href = '/'; // Em caso de erro na rede ou fetch do perfil
                            }
                        }, 1500); // Tempo para o usuário ver a mensagem de sucesso do login
                    } else {
                        window.showModal('Erro no Login', 'Token não recebido na resposta do servidor.', 'error');
                    }
                } else { 
                    window.showModal('Erro no Login', data.message || 'Credenciais inválidas.', 'error');
                }
            } catch (error) {
                console.error('Erro de rede ou JSON inválido:', error);
                window.showModal('Erro de Conexão', 'Não foi possível se comunicar com o servidor. Verifique sua conexão.', 'error');
            }
        });
    } else {
        console.warn("Elemento 'loginForm' ou a função 'showModal' não estão disponíveis para configurar o evento de submit.");
    }
});