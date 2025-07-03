// public/js/historico.js

// Dados que serão carregados do backend
let historyData = {
    dieta: [],
    treino: [],
    imc: []
};

// Variáveis de estado para filtros e tipo de histórico
let currentHistoryType = 'dieta'; // Tipo de histórico padrão (pode ser 'dieta', 'treino', 'imc')
let searchTerm = '';
let startDateFilter = ''; // Formato YYYY-MM-DD para input type="date"
let endDateFilter = '';    // Formato YYYY-MM-DD para input type="date"

// Referências aos elementos DOM
const historyContentDiv = document.getElementById('history-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchOptions = document.querySelectorAll('.search-options a');

// --- Funções Auxiliares ---

// Função para formatar data para Date object (DD/MM/YYYY ou YYYY-MM-DD)
function parseDate(dateString) {
    if (!dateString) return null;
    // Se for formato DD/MM/YYYY
    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    // Se for formato YYYY-MM-DD (do input type="date")
    // Adiciona T00:00:00 para evitar problemas de fuso horário em comparações de data
    return new Date(dateString + 'T00:00:00');
}

// Função para formatar Date object para DD/MM/YYYY
function formatDateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função para mapear o perfil calculado para um texto mais amigável
function getFriendlyProfileName(profile) {
    if (!profile) return 'Não especificado';
    return profile.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

// Função para filtrar dados - LÓGICA DE PESQUISA APRIMORADA AQUI
function filterData(data, type, term, startDate, endDate) {
    let filtered = data;

    // Converte as datas de filtro para Date objects para comparação
    const startFilterDate = startDate ? parseDate(startDate) : null;
    const endFilterDate = endDate ? parseDate(endDate) : null;

    // Filtro por termo de pesquisa
    if (term) {
        const searchTerms = term.toLowerCase().split(/\s+ou\s+/); // Divide por ' ou '
        filtered = filtered.filter(item => {
            // Verifica se o item corresponde a QUALQUER um dos termos de pesquisa
            return searchTerms.some(singleTerm => {
                const singleTermWords = singleTerm.split(/\s+/).filter(word => word.length > 0);
                const contentToSearch = (type === 'imc' ? `${item.imc} ${item.date} ${item.categoria}` : `${item.generated_content ? (typeof item.generated_content === 'string' ? item.generated_content : JSON.stringify(item.generated_content)) : ''} ${item.calculated_profile} ${item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : ''}`).toLowerCase();

                // Verifica se TODAS as palavras do singleTerm estão presentes no contentToSearch
                return singleTermWords.every(word => contentToSearch.includes(word));
            });
        });
    }

    // Filtro por período
    if (startFilterDate && endFilterDate) {
        filtered = filtered.filter(item => {
            let itemDate;
            if (type === 'imc') {
                itemDate = parseDate(item.date); // item.date já é DD/MM/YYYY
            } else { // dieta ou treino
                itemDate = new Date(item.created_at); // created_at é Date object/string ISO
            }

            // Certifique-se de que itemDate é válido e compare apenas as datas
            if (itemDate && !isNaN(itemDate.getTime())) {
                // Para comparar apenas a data (ignorando a hora), normalize para o início do dia
                const normalizedItemDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
                const normalizedStartDate = new Date(startFilterDate.getFullYear(), startFilterDate.getMonth(), startFilterDate.getDate());
                const normalizedEndDate = new Date(endFilterDate.getFullYear(), endFilterDate.getMonth(), endFilterDate.getDate());

                return normalizedItemDate >= normalizedStartDate && normalizedItemDate <= normalizedEndDate;
            }
            return false; // Se a data do item for inválida, não inclua
        });
    }
    return filtered;
}

// --- Funções de Renderização HTML ---

function renderDietTreinoHistory(data, title, isFilteredOrSearched) {
    console.log(`[renderDietTreinoHistory] Iniciando renderização para ${title}. Dados recebidos:`, data);
    console.log(`[renderDietTreinoHistory] Quantidade de itens: ${data.length}`);

    let historyHtml = `<h1>Histórico de ${title}</h1>`;

    historyHtml += `
        <div class="period-selector">
            <button class="period-toggle">
                <i class="far fa-calendar-alt"></i> Selecionar Período
            </button>
            <div class="period-dropdown">
                <div class="date-range">
                    <div class="date-picker">
                        <label>De:</label>
                        <input type="date" id="start-date" value="${startDateFilter}">
                    </div>
                    <div class="date-picker">
                        <label>Até:</label>
                        <input type="date" id="end-date" value="${endDateFilter}">
                    </div>
                </div>
                <div class="period-actions">
                    <button class="btn-clear">Limpar</button>
                    <button class="btn-apply">Aplicar</button>
                </div>
            </div>
        </div>
    `;

    if (data.length === 0) {
        console.log(`[renderDietTreinoHistory] Nenhum dado para renderizar para ${title}. Exibindo estado vazio.`);
        historyHtml += `
            <div class="history-container empty">
                <div class="empty-state-content">
                    <div class="empty-state-text">
                        ${isFilteredOrSearched ? 'Nenhum resultado para sua busca. Tente procurar novamente.' : 'Histórico vazio. Faça um quiz para gerar seu primeiro plano!'}
                        ${isFilteredOrSearched ? '<a href="#" class="clear-filter-link">Apagar filtro de busca</a>' : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        console.log(`[renderDietTreinoHistory] Dados disponíveis. Mapeando e renderizando itens para ${title}.`);
        historyHtml += `
            <div class="history-container">
                <div class="history-header diet-treino">
                    <h3>Data de Criação</h3>
                    <h3>Perfil</h3>
                    <h3>Plano Detalhado (Prévia)</h3>
                    <h3 class="action-header-column">Ações</h3>
                </div>
                ${data.map(item => {
                    const dateGenerated = new Date(item.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    const friendlyProfile = getFriendlyProfileName(item.calculated_profile);

                    let planContentPreview = '';
                    if (typeof item.generated_content === 'string') {
                        const previewLength = 100; // Ajuste o tamanho da prévia conforme necessário
                        planContentPreview = item.generated_content.substring(0, previewLength);
                        if (item.generated_content.length > previewLength) {
                            planContentPreview += '...';
                        }
                    } else if (typeof item.generated_content === 'object' && item.generated_content !== null) {
                        const previewLength = 100;
                        const stringifiedContent = JSON.stringify(item.generated_content);
                        planContentPreview = 'Conteúdo Estruturado: ' + stringifiedContent.substring(0, previewLength);
                        if (stringifiedContent.length > previewLength) {
                            planContentPreview += '...';
                        }
                    } else {
                        planContentPreview = 'Conteúdo do plano não disponível.';
                    }

                    return `
                        <div class="history-item diet-treino">
                            <div>${dateGenerated}</div>
                            <div>
                                <button class="btn-view-profile" data-id="${item.id}" data-type="${item.quiz_type}">
                                    ${friendlyProfile}
                                </button>
                            </div>
                            <div>${planContentPreview}</div>
                            <div class="item-actions-column">
                                <i class="fas fa-trash-alt delete-item-btn" data-id="${item.id}" data-type="${item.quiz_type}"></i>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    historyHtml += `
        <div class="delete-btn-container">
            <button class="delete-history-btn" data-type="${currentHistoryType}">Excluir Todos os Históricos de ${title}</button>
        </div>
    `;
    historyContentDiv.innerHTML = historyHtml;
    addEventListenersToPeriodSelector();
    addEventListenersToClearFilterLink();
    addEventListenersToDeleteHistoryBtn(); // MANTENHA ESTA CHAMADA
    addEventListenersToDeleteItemButtons();
    addEventListenersToViewProfileButtons(); // Adiciona listener para o botão "Ver Perfil"
}

// Função para adicionar listeners aos botões "Ver Perfil"
function addEventListenersToViewProfileButtons() {
    document.querySelectorAll('.btn-view-profile').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id; // ID do quiz_result
            const type = this.dataset.type; // 'dieta' ou 'treino'

            // Redireciona para as novas rotas de detalhes com o ID como query parameter
            if (type === 'treino') {
                window.location.href = `/historico-treino-detalhes?id=${id}`;
            } else if (type === 'dieta') {
                window.location.href = `/historico-dieta-detalhes?id=${id}`;
            } else {
                console.warn('Tipo de perfil desconhecido:', type);
            }
        });
    });
}


function renderIMCHistory(data, isFilteredOrSearched) {
    console.log(`[renderIMCHistory] Iniciando renderização para IMC. Dados recebidos:`, data);
    console.log(`[renderIMCHistory] Quantidade de itens: ${data.length}`);

    let historyHtml = `<h1>Histórico IMC</h1>`;

    historyHtml += `
        <div class="period-selector">
            <button class="period-toggle">
                <i class="far fa-calendar-alt"></i> Selecionar Período
            </button>
            <div class="period-dropdown">
                <div class="date-range">
                    <div class="date-picker">
                        <label>De:</label>
                        <input type="date" id="start-date" value="${startDateFilter}">
                    </div>
                    <div class="date-picker">
                        <label>Até:</label>
                        <input type="date" id="end-date" value="${endDateFilter}">
                    </div>
                </div>
                <div class="period-actions">
                    <button class="btn-clear">Limpar</button>
                    <button class="btn-apply">Aplicar</button>
                </div>
            </div>
        </div>
    `;

    if (data.length === 0) {
        console.log(`[renderIMCHistory] Nenhum dado para renderizar para IMC. Exibindo estado vazio.`);
        historyHtml += `
            <div class="history-container empty">
                <div class="empty-state-content">
                    <img src="../IMG/${isFilteredOrSearched ? 'Filtro.svg' : 'HistoricoVazio.svg'}" alt="Nenhum resultado" class="empty-state-image">
                    <div class="empty-state-text">
                        ${isFilteredOrSearched ? 'Nenhum resultado para sua busca. Tente procurar novamente.' : 'Seu histórico de IMC está vazio. Calcule seu IMC para vê-lo aqui!'}
                        ${isFilteredOrSearched ? '<a href="#" class="clear-filter-link">Apagar filtro de busca</a>' : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        console.log(`[renderIMCHistory] Dados disponíveis. Mapeando e renderizando itens para IMC.`);
        historyHtml += `
            <div class="history-container">
                <div class="history-header imc">
                    <h3>Data do Cálculo</h3>
                    <h3>IMC</h3>
                    <h3>Categoria</h3>
                    <h3>Variação</h3>
                    <h3 class="action-header-column">Ações</h3>
                </div>
                ${data.map(item => `
                    <div class="history-item imc" data-imc-id="${item.id}">
                        <div class="item-date">${item.date}</div>
                        <div class="item-imc">${item.imc}</div>
                        <div class="item-categoria">${item.categoria || 'N/A'}</div>
                        <div class="item-variation ${item.variation.includes('+') ? 'positive' : (item.variation.includes('-') ? 'negative' : '')}">${item.variation}</div>
                        <div class="item-actions-column">
                            <i class="fas fa-trash-alt delete-imc-btn" data-id="${item.id}"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    historyHtml += `
        <div class="delete-btn-container">
            <button class="delete-history-btn" data-type="imc">Excluir Todo o Histórico de IMC</button>
        </div>
    `;

    historyContentDiv.innerHTML = historyHtml;
    addEventListenersToPeriodSelector();
    addEventListenersToClearFilterLink();
    addEventListenersToDeleteHistoryBtn(); // MANTENHA ESTA CHAMADA
    addEventListenersToDeleteItemButtons();
}

// Função para atualizar o indicador na search-box ('>')
function updateSearchOptionsIndicator() {
    searchOptions.forEach(link => {
        const originalText = link.dataset.originalText || link.textContent.replace('>', '').trim();
        link.dataset.originalText = originalText;

        if (link.dataset.type === currentHistoryType) {
            link.textContent = `> ${originalText}`;
        } else {
            link.textContent = originalText;
        }
    });
}

// --- Funções de Fetch para o Backend ---

async function fetchAllHistoryData() {
    console.log("[fetchAllHistoryData] Iniciando busca por todos os históricos...");
    const token = localStorage.getItem('token');
    if (!token) {
        console.log("[fetchAllHistoryData] Token não encontrado. Usuário não autenticado.");
        historyData.dieta = [];
        historyData.treino = [];
        historyData.imc = [];
        Swal.fire({
            icon: 'info',
            title: 'Sessão Expirada',
            text: 'Sua sessão expirou. Por favor, faça login novamente.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login-cadastro';
        });
        return false; // Indica que a busca falhou ou não foi necessária
    }

    try {
        // Fetch Quiz History
        const quizResponse = await fetch('/meus-quizzes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("[fetchAllHistoryData] Status da resposta para /meus-quizzes:", quizResponse.status);

        if (quizResponse.status === 401 || quizResponse.status === 403) {
            console.log("[fetchAllHistoryData] Autenticação falhou para /meus-quizzes.");
            localStorage.removeItem('token');
            Swal.fire({
                icon: 'info',
                title: 'Sessão Expirada',
                text: 'Sua sessão expirou. Por favor, faça login novamente.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/login-cadastro';
            });
            return false;
        }

        if (!quizResponse.ok) {
            const errorData = await quizResponse.json().catch(() => ({ message: quizResponse.statusText || 'Erro desconhecido.' }));
            console.error("[fetchAllHistoryData] Erro na resposta de /meus-quizzes:", errorData);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Erro ao buscar histórico de quizzes: ${errorData.message || 'Erro desconhecido.'}`,
                confirmButtonText: 'OK'
            });
            throw new Error(errorData.message || 'Erro ao buscar histórico de quizzes.');
        }

        const quizzes = await quizResponse.json();
        console.log("[fetchAllHistoryData] Dados brutos de Quizzes do Backend:", quizzes);

        historyData.dieta = quizzes.filter(q => q.quiz_type === 'dieta');
        historyData.treino = quizzes.filter(q => q.quiz_type === 'treino');
        console.log("[fetchAllHistoryData] Histórico de Dieta filtrado:", historyData.dieta);
        console.log("[fetchAllHistoryData] Histórico de Treino filtrado:", historyData.treino);

        // Fetch IMC History
        const imcResponse = await fetch('/meu-imc-historico', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("[fetchAllHistoryData] Status da resposta para /meu-imc-historico:", imcResponse.status);

        if (imcResponse.status === 401 || imcResponse.status === 403) {
            console.log("[fetchAllHistoryData] Autenticação falhou para /meu-imc-historico.");
            localStorage.removeItem('token');
            Swal.fire({
                icon: 'info',
                title: 'Sessão Expirada',
                text: 'Sua sessão expirou. Por favor, faça login novamente.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/login-cadastro';
            });
            return false;
        }

        if (!imcResponse.ok) {
            const errorData = await imcResponse.json().catch(() => ({ message: imcResponse.statusText || 'Erro desconhecido.' }));
            console.error("[fetchAllHistoryData] Erro na resposta de /meu-imc-historico:", errorData);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Erro ao buscar histórico de IMC: ${errorData.message || 'Erro desconhecido.'}`,
                confirmButtonText: 'OK'
            });
            throw new Error(errorData.message || 'Erro ao buscar histórico de IMC.');
        }

        const imcResults = await imcResponse.json();
        console.log("[fetchAllHistoryData] Dados brutos de IMC do Backend:", imcResults);

        // Mapeia os dados do backend para o formato do frontend e calcula variação
        let processedImc = imcResults.map(imcItem => ({
            id: imcItem.id,
            date: formatDateToDDMMYYYY(new Date(imcItem.created_at)),
            imc: parseFloat(imcItem.imc).toFixed(2),
            categoria: imcItem.categoria, // Adicionando a categoria aqui
            variation: '-' // Será calculado depois de ordenar
        }));

        // Ordena por data crescente para calcular a variação corretamente
        processedImc.sort((a, b) => parseDate(a.date) - parseDate(b.date));

        // Calcula a variação
        for (let i = 1; i < processedImc.length; i++) {
            const prevImc = parseFloat(processedImc[i - 1].imc);
            const currentImc = parseFloat(processedImc[i].imc);
            const diff = currentImc - prevImc;
            if (diff > 0) {
                processedImc[i].variation = `+${diff.toFixed(2)}`;
            } else if (diff < 0) {
                processedImc[i].variation = `${diff.toFixed(2)}`;
            } else {
                processedImc[i].variation = '0.00';
            }
        }

        // Reverte para ordem decrescente para exibição (mais recente primeiro)
        historyData.imc = processedImc.reverse();
        console.log("[fetchAllHistoryData] Histórico de IMC processado:", historyData.imc);
        return true; // Indica que a busca foi bem-sucedida

    } catch (error) {
        console.error('Erro ao buscar todos os históricos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: `Erro ao carregar histórico: ${error.message}`,
            confirmButtonText: 'OK'
        });
        return false;
    }
}


// Função principal para atualizar a visualização
async function updateHistoryView(initialLoad = false) {
    console.log(`[updateHistoryView] Iniciando atualização da visualização. InitialLoad: ${initialLoad}`);
    if (initialLoad) {
        historyContentDiv.innerHTML = '<p>Carregando seu histórico...</p>';
        const fetched = await fetchAllHistoryData(); // Busca todos os dados apenas no carregamento inicial
        if (!fetched) return; // Para se a busca falhar
    }

    let dataToRender = historyData[currentHistoryType];
    console.log(`[updateHistoryView] Dados para renderizar (${currentHistoryType}):`, dataToRender);

    const isFilteredOrSearched = searchTerm !== '' || (startDateFilter !== '' && endDateFilter !== '');
    let filteredData = filterData(dataToRender, currentHistoryType, searchTerm, startDateFilter, endDateFilter);
    console.log(`[updateHistoryView] Dados filtrados (${currentHistoryType}):`, filteredData);


    if (currentHistoryType === 'imc') {
        renderIMCHistory(filteredData, isFilteredOrSearched);
    } else {
        renderDietTreinoHistory(filteredData, currentHistoryType === 'dieta' ? 'Dieta' : 'Treino', isFilteredOrSearched);
    }
    updateSearchOptionsIndicator();
    console.log("[updateHistoryView] Visualização atualizada.");
}

// --- Event Listeners para Botões e Inputs ---

// Adiciona listeners para os links de navegação (Treino, Dieta, IMC)
searchOptions.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        currentHistoryType = this.dataset.type;
        searchTerm = '';
        startDateFilter = '';
        endDateFilter = '';
        searchInput.value = '';
        console.log(`[Event] Tipo de histórico alterado para: ${currentHistoryType}`);
        updateHistoryView(); // Chama a atualização para renderizar o novo tipo
    });
});

// Adiciona listener para o botão de pesquisa
searchBtn.addEventListener('click', function() {
    searchTerm = searchInput.value.toLowerCase(); // Convertendo para minúsculas aqui
    console.log(`[Event] Botão de pesquisa clicado. Termo: "${searchTerm}"`);
    updateHistoryView();
});

// Adiciona listener para o Enter no campo de pesquisa
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita que o Enter submeta formulários indesejadamente
        searchTerm = searchInput.value.toLowerCase(); // Convertendo para minúsculas aqui
        console.log(`[Event] Enter pressionado no campo de pesquisa. Termo: "${searchTerm}"`);
        updateHistoryView();
    }
});

// Adiciona listeners aos seletores de período (para qualquer renderização)
function addEventListenersToPeriodSelector() {
    // É importante selecionar novamente os elementos pois eles são recriados a cada renderização
    const periodToggle = document.querySelector('.period-toggle');
    const btnClear = document.querySelector('.period-actions .btn-clear');
    const btnApply = document.querySelector('.period-actions .btn-apply');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (periodToggle) {
        periodToggle.addEventListener('click', () => {
            periodToggle.closest('.period-selector').classList.toggle('active');
            console.log("[Event] Toggle de período clicado.");
        });

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                startDateFilter = '';
                endDateFilter = '';
                startDateInput.value = '';
                endDateInput.value = '';
                console.log("[Event] Botão 'Limpar' filtro de período clicado.");
                updateHistoryView();
                periodToggle.closest('.period-selector').classList.remove('active');
            });
        }

        if (btnApply) {
            btnApply.addEventListener('click', () => {
                startDateFilter = startDateInput.value;
                endDateFilter = endDateInput.value;
                console.log(`[Event] Botão 'Aplicar' filtro de período clicado. De: ${startDateFilter}, Até: ${endDateFilter}`);
                updateHistoryView();
                periodToggle.closest('.period-selector').classList.remove('active');
            });
        }
    }
}

// Adiciona listener para o link "Apagar filtro de busca" (dentro do empty state)
function addEventListenersToClearFilterLink() {
    // É importante selecionar novamente o elemento pois ele é recriado a cada renderização
    const clearFilterLink = document.querySelector('.clear-filter-link');
    if (clearFilterLink) {
        clearFilterLink.addEventListener('click', function(event) {
            event.preventDefault();
            searchTerm = '';
            searchInput.value = '';
            startDateFilter = '';
            endDateFilter = '';
            console.log("[Event] Link 'Apagar filtro de busca' clicado.");
            updateHistoryView();
        });
    }
}

// Funções para deletar itens individuais e todo o histórico
async function deleteHistoryItem(id, type) {
    console.log(`[deleteHistoryItem] Tentando deletar item. ID: ${id}, Tipo: ${type}`);
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'info',
            title: 'Sessão Expirada',
            text: 'Sua sessão expirou. Por favor, faça login novamente.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login-cadastro';
        });
        return;
    }

    let endpoint = '';
    if (type === 'imc') {
        endpoint = `/api/imc/${id}`;
    } else if (type === 'dieta' || type === 'treino') {
        endpoint = `/api/quiz/${id}`;
    } else {
        console.error('Tipo de histórico desconhecido para deleção:', type);
        return;
    }

    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Você não poderá reverter isso!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            Swal.fire(
                'Excluído!',
                'Item excluído com sucesso!',
                'success'
            );
            // Remove o item do historyData localmente
            historyData[type] = historyData[type].filter(item => item.id !== id);
            updateHistoryView(); // Atualiza a visualização
        } else if (response.status === 401 || response.status === 403) {
            Swal.fire({
                icon: 'info',
                title: 'Sessão Expirada',
                text: 'Sua sessão expirou. Por favor, faça login novamente.',
                confirmButtonText: 'OK'
            }).then(() => {
                localStorage.removeItem('token');
                window.location.href = '/login-cadastro';
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Erro ao excluir item: ${errorData.message || response.statusText}`,
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Erro ao deletar item do histórico:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: 'Erro de conexão ao tentar excluir o item.',
            confirmButtonText: 'OK'
        });
    }
}

async function deleteAllHistory(type) {
    console.log(`[deleteAllHistory] Tentando deletar todo o histórico. Tipo: ${type}`);
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'info',
            title: 'Sessão Expirada',
            text: 'Sua sessão expirou. Por favor, faça login novamente.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login-cadastro';
        });
        return;
    }

    let endpoint = '';
    if (type === 'imc') {
        endpoint = `/api/imc/all`;
    } else if (type === 'dieta' || type === 'treino') {
        endpoint = `/api/quiz/all/${type}`;
    } else {
        console.error('Tipo de histórico desconhecido para deleção em massa:', type);
        return;
    }

    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: `Você tem certeza que deseja excluir TODO o histórico de ${type}? Esta ação é irreversível.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir tudo!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            Swal.fire(
                'Excluído!',
                `Todo o histórico de ${type} excluído com sucesso!`, 
                'success'
            );
            historyData[type] = []; // Limpa os dados localmente
            updateHistoryView(); // Atualiza a visualização
        } else if (response.status === 401 || response.status === 403) {
            Swal.fire({
                icon: 'info',
                title: 'Sessão Expirada',
                text: 'Sua sessão expirou. Por favor, faça login novamente.',
                confirmButtonText: 'OK'
            }).then(() => {
                localStorage.removeItem('token');
                window.location.href = '/login-cadastro';
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Erro ao excluir todo o histórico: ${errorData.message || response.statusText}`,
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Erro ao deletar todo o histórico:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: 'Erro de conexão ao tentar excluir todo o histórico.',
            confirmButtonText: 'OK'
        });
    }
}

function addEventListenersToDeleteItemButtons() {
    document.querySelectorAll('.delete-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const type = this.dataset.type;
            deleteHistoryItem(id, type);
        });
    });
    document.querySelectorAll('.delete-imc-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            deleteHistoryItem(id, 'imc');
        });
    });
}

function addEventListenersToDeleteHistoryBtn() {
    const deleteHistoryBtn = document.querySelector('.delete-history-btn');
    if (deleteHistoryBtn) {
        deleteHistoryBtn.addEventListener('click', function() {
            const type = this.dataset.type;
            deleteAllHistory(type);
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateHistoryView(true); // Carrega os dados e renderiza a view inicial
});


