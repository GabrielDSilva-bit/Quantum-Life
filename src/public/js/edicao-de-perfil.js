// public/js/edicao-de-perfil.js

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token'); // Pega o token do localStorage

    if (!token) {
        console.log("Frontend: Token não encontrado no localStorage. Redirecionando para login.");
        window.location.href = '/login-cadastro'; // Redireciona se não há token
        return;
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('/perfil', { // Faz a requisição para a rota /perfil no backend
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // ANEXA O TOKEN AQUI
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Frontend: Dados do usuário carregados com sucesso:', userData);

                // --- PREENCHER OS ELEMENTOS DE EXIBIÇÃO DE DADOS DO PERFIL ---
                if (userData.usuario) {
                    document.getElementById('displayEmail').textContent = userData.usuario.email || 'Não informado';
                    document.getElementById('displayCpf').textContent = userData.usuario.cpf || 'Não informado';
                    
                    // CORREÇÃO E REFORÇO: Preenche a data de criação
                    const createdAtElement = document.getElementById('displayCreatedAt');
                    if (createdAtElement) { // Verifica se o elemento existe no HTML
                        if (userData.usuario.created_at) { // Verifica se a data veio do backend
                            try {
                                const date = new Date(userData.usuario.created_at);
                                // Verifica se a data é válida
                                if (!isNaN(date.getTime())) { 
                                    const formattedDate = date.toLocaleDateString('pt-BR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    });
                                    createdAtElement.textContent = formattedDate;
                                } else {
                                    createdAtElement.textContent = 'Data inválida';
                                    console.warn('Frontend: Data de criação recebida é inválida:', userData.usuario.created_at);
                                }
                            } catch (e) {
                                console.error('Frontend: Erro ao parsear ou formatar a data de criação:', e);
                                createdAtElement.textContent = 'Erro ao carregar data';
                            }
                        } else {
                            createdAtElement.textContent = 'Não informado';
                            console.warn('Frontend: Coluna created_at não recebida do backend para o usuário.');
                        }
                    }

                    // Exibir os planos de treino/dieta
                    const treinoDiv = document.getElementById('treinoAtual');
                    const dietaDiv = document.getElementById('dietaAtual');

                    // Lógica para treinoDiv e dietaDiv permanece a mesma
                    // ... (seu código existente para treinoDiv e dietaDiv) ...
                     if (treinoDiv) { // Verifica se a div existe
                        if (userData.usuario.treino_atual) {
                            treinoDiv.innerHTML = '<h3>Último Plano de Treino:</h3><pre>' +
                                (typeof userData.usuario.treino_atual === 'object' && userData.usuario.treino_atual.plano_texto
                                ? userData.usuario.treino_atual.plano_texto
                                : JSON.stringify(userData.usuario.treino_atual, null, 2)) +
                                '</pre>';
                        } else {
                            treinoDiv.innerHTML = '<h3>Último Plano de Treino:</h3><p>Nenhum plano de treino encontrado.</p>';
                        }
                    }

                    if (dietaDiv) { // Verifica se a div existe
                        if (userData.usuario.dieta_atual) {
                            dietaDiv.innerHTML = '<h3>Último Plano de Dieta:</h3><pre>' +
                                (typeof userData.usuario.dieta_atual === 'object' && userData.usuario.dieta_atual.plano_texto
                                ? userData.usuario.dieta_atual.plano_texto
                                : JSON.stringify(userData.usuario.dieta_atual, null, 2)) +
                                '</pre>';
                        } else {
                            dietaDiv.innerHTML = '<h3>Último Plano de Dieta:</h3><p>Nenhum plano de dieta encontrado.</p>';
                        }
                    }

                } else {
                    console.warn('Frontend: Dados do usuário não encontrados na resposta /perfil.');
                    document.getElementById('displayEmail').textContent = 'Erro ao carregar';
                    document.getElementById('displayCpf').textContent = 'Erro ao carregar';
                    const createdAtElement = document.getElementById('displayCreatedAt');
                    if (createdAtElement) {
                        createdAtElement.textContent = 'Erro ao carregar';
                    }
                }

            } else if (response.status === 401 || response.status === 403) {
                console.error("Frontend: Sessão expirada ou acesso não autorizado. Redirecionando para o login.");
                localStorage.removeItem('token'); // Limpa o token inválido
                window.location.href = '/login-cadastro'; // Redireciona para a página de login
            } else {
                console.error('Frontend: Erro HTTP ao carregar dados do perfil:', response.status, response.statusText);
                alert('Erro ao carregar os dados do perfil.');
            }
        } catch (error) {
            console.error('Frontend: Erro de rede ao carregar perfil:', error);
            alert('Erro de conexão ao carregar os dados do perfil.');
        }
    }

    // Chama a função para carregar o perfil assim que a página é carregada
    loadUserProfile();

}); // Fim do DOMContentLoaded