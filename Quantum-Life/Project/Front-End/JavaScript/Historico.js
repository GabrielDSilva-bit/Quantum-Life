// Dados de exemplo (substitua por dados reais do backend, se houver)
const historyData = {
  dieta: [
    { startDate: '10/02/2025', endDate: '20/03/2025', duration: '4 semanas', name: 'dieta mediterrânea', focus: 'Queima de gordura, preserva músculo' },
    { startDate: '28/11/2024', endDate: '05/02/2025', duration: '4 semanas', name: 'dieta cetogênica', focus: 'Perda rápida de gordura' },
    { startDate: '10/06/2024', endDate: '23/11/2024', duration: '3 semanas', name: 'dieta low carb', focus: 'Saúde do coração, movimento diário' },
    { startDate: '24/12/2023', endDate: '05/06/2024', duration: '6 semanas', name: 'dieta vegana', focus: 'Equilíbrio, mobilidade' },
    { startDate: '15/01/2023', endDate: '05/02/2023', duration: '3 semanas', name: 'dieta DASH', focus: 'Energia, consciência corporal' },
  ],
  treino: [
    { startDate: '10/02/2025', endDate: '20/03/2025', duration: '4 semanas', name: 'Força e Resistência', focus: 'Queima de gordura, preserva músculo' },
    { startDate: '28/11/2024', endDate: '05/02/2025', duration: '4 semanas', name: 'HIIT', focus: 'Perda rápida de gordura' },
    { startDate: '10/06/2024', endDate: '23/11/2024', duration: '3 semanas', name: 'Cardio e Caminhada', focus: 'Saúde do coração, movimento diário' },
    { startDate: '24/12/2023', endDate: '05/06/2024', duration: '6 semanas', name: 'Funcional e Alongamento', focus: 'Equilíbrio, mobilidade' },
    { startDate: '15/01/2023', endDate: '05/02/2023', duration: '3 semanas', name: 'Yoga e Respiração', focus: 'Energia, consciência corporal' },
  ],
  imc: [
    { date: '10/02/2025', imc: 22.6, classification: 'Peso Normal', variation: '+6,26' },
    { date: '28/11/2024', imc: 16.34, classification: 'Abaixo do Peso', variation: '-11,46' },
    { date: '10/06/2024', imc: 27.8, classification: 'Sobrepeso', variation: '-4,6' },
    { date: '24/12/2023', imc: 32.4, classification: 'Obesidade grau I', variation: '-8,7' },
    { date: '15/01/2023', imc: 41.1, classification: 'Obesidade grau III', variation: '-' },
  ]
};

let currentHistoryType = 'dieta'; // Tipo de histórico padrão
let currentHistoryData = [];
let filteredHistoryData = [];
let searchTerm = '';
let startDateFilter = '';
let endDateFilter = '';

const historyContentDiv = document.getElementById('history-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchOptions = document.querySelectorAll('.search-options a');

// Função para formatar data para comparação
function parseDate(dateString) {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Função para filtrar dados
function filterData(data, type, term, startDate, endDate) {
  let filtered = data;

  // Filtro por termo de pesquisa
  if (term) {
    const lowerCaseTerm = term.toLowerCase();
    filtered = filtered.filter(item => {
      if (type === 'imc') {
        return item.classification.toLowerCase().includes(lowerCaseTerm) ||
               item.imc.toString().includes(lowerCaseTerm) ||
               item.date.includes(lowerCaseTerm);
      } else { // dieta ou treino
        return item.name.toLowerCase().includes(lowerCaseTerm) ||
               item.focus.toLowerCase().includes(lowerCaseTerm) ||
               item.startDate.includes(lowerCaseTerm) ||
               item.endDate.includes(lowerCaseTerm);
      }
    });
  }

  // Filtro por período
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filtered = filtered.filter(item => {
      const itemDate = parseDate(type === 'imc' ? item.date : item.startDate);
      return itemDate >= start && itemDate <= end;
    });
  }

  return filtered;
}

// Função para renderizar o histórico de Dieta/Treino
function renderDietTreinoHistory(data, title, isFilteredOrSearched) {
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
    historyHtml += `
      <div class="history-container empty">
        <div class="empty-state-content">
          <div class="empty-state-text">
            ${isFilteredOrSearched ? 'Nenhum resultado para sua busca. Tente procurar novamente.' : 'Historico vazio'}
          </div>
        </div>
      </div>
    `;
  } else {
    historyHtml += `
      <div class="history-container">
        <div class="history-header diet-treino">
          <h3>Data de Início</h3>
          <h3>Data de Término</h3>
          <h3>Duração</h3>
          <div class="treino-column">
            <h3>${title}</h3>
          </div>
          <h3>Foco da ${title}</h3>
        </div>
        ${data.map(item => `
          <div class="history-item diet-treino">
            <div>${item.startDate}</div>
            <div>${item.endDate}</div>
            <div>${item.duration}</div>
            <div class="link">
              <a href="">${item.name}</a>
            </div>
            <div>${item.focus}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  historyHtml += `
    <div class="delete-btn-container">
      <a href="#" class="delete-history-btn">Excluir Histórico</a>
    </div>
  `;
  historyContentDiv.innerHTML = historyHtml;
  addEventListenersToPeriodSelector();
  addEventListenersToClearFilterLink();
  addEventListenersToDeleteHistoryBtn();
}

// Função para renderizar o histórico de IMC
function renderIMCHistory(data, isFilteredOrSearched) {
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
    historyHtml += `
      <div class="history-container empty">
        <div class="empty-state-content">
          <img src="../IMG/${isFilteredOrSearched ? 'Filtro.svg' : 'HistoricoVazio.svg'}" alt="Nenhum resultado" class="empty-state-image">
          <div class="empty-state-text">
            ${isFilteredOrSearched ? 'Nenhum resultado para sua busca. Tente procurar novamente.' : 'Seu histórico está vazio. Comece a registrar seus dados para vê-los aqui!'}
            <a href="#" class="clear-filter-link">Apagar filtro de busca</a>
          </div>
        </div>
      </div>
    `;
  } else {
    historyHtml += `
      <div class="history-container">
        <div class="history-header imc">
          <h3>Data do Cálculo</h3>
          <div class="header-group">
            <h3>Seu IMC</h3>
            <h3>Classificação</h3>
            <h3>Variação</h3>
          </div>
        </div>
        ${data.map(item => `
          <div class="history-item imc">
            <div class="item-date">${item.date}</div>
            <div class="item-values">
              <div>${item.imc}</div>
              <div>${item.classification}</div>
              <div class="${item.variation.includes('+') ? 'positive' : (item.variation.includes('-') ? 'negative' : '')}">${item.variation}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  historyHtml += `
    <div class="delete-btn-container">
      <a href="#" class="delete-history-btn">Excluir Histórico</a>
    </div>
  `;

  // Cards Comparativos (REMOVIDOS DO HTML, mas o CSS ainda os esconde)
  // O HTML para os cards comparativos não será gerado aqui.

  historyContentDiv.innerHTML = historyHtml;
  addEventListenersToPeriodSelector();
  addEventListenersToClearFilterLink();
  addEventListenersToDeleteHistoryBtn();
}

// Função para atualizar o indicador na search-box
function updateSearchOptionsIndicator() {
  searchOptions.forEach(link => {
    const originalText = link.dataset.originalText || link.textContent; // Armazena o texto original
    link.dataset.originalText = originalText; // Garante que o originalText esteja salvo

    if (link.dataset.type === currentHistoryType) {
      link.textContent = `>${originalText}`;
    } else {
      link.textContent = originalText.replace('>', ''); // Remove o '>' se não for o tipo atual
    }
  });
}


// Função principal para atualizar a visualização
function updateHistoryView() {
  currentHistoryData = historyData[currentHistoryType];
  filteredHistoryData = filterData(currentHistoryData, currentHistoryType, searchTerm, startDateFilter, endDateFilter);

  const isFilteredOrSearched = searchTerm !== '' || (startDateFilter !== '' && endDateFilter !== '');

  if (currentHistoryType === 'imc') {
    renderIMCHistory(filteredHistoryData, isFilteredOrSearched);
  } else {
    renderDietTreinoHistory(filteredHistoryData, currentHistoryType === 'dieta' ? 'Dieta' : 'Treino', isFilteredOrSearched);
  }
  updateSearchOptionsIndicator(); // Atualiza o indicador após renderizar
}

// Adiciona listeners para os links de navegação (Treino, Dieta, IMC)
searchOptions.forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    currentHistoryType = this.dataset.type;
    searchTerm = ''; // Limpa o termo de pesquisa ao mudar de tipo
    startDateFilter = ''; // Limpa o filtro de data
    endDateFilter = ''; // Limpa o filtro de data
    searchInput.value = ''; // Limpa o input de pesquisa
    updateHistoryView();
  });
});

// Adiciona listener para o botão de pesquisa
searchBtn.addEventListener('click', function() {
  searchTerm = searchInput.value;
  updateHistoryView();
});

// Adiciona listener para o Enter no campo de pesquisa
searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    searchTerm = searchInput.value;
    updateHistoryView();
  }
});

// Funções para adicionar listeners aos seletores de período (tabela e cards)
function addEventListenersToPeriodSelector() {
  const periodToggle = document.querySelector('.period-toggle');
  if (periodToggle) {
    periodToggle.addEventListener('click', () => {
      periodToggle.closest('.period-selector').classList.toggle('active');
    });

    const btnClear = document.querySelector('.period-actions .btn-clear');
    const btnApply = document.querySelector('.period-actions .btn-apply');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        startDateFilter = '';
        endDateFilter = '';
        startDateInput.value = '';
        endDateInput.value = '';
        updateHistoryView();
        periodToggle.closest('.period-selector').classList.remove('active');
      });
    }

    if (btnApply) {
      btnApply.addEventListener('click', () => {
        startDateFilter = startDateInput.value;
        endDateFilter = endDateInput.value;
        updateHistoryView();
        periodToggle.closest('.period-selector').classList.remove('active');
      });
    }
  }
}

// A função addEventListenersToPeriodSelectorCard não é mais necessária, pois os cards foram removidos.
// No entanto, se você quiser mantê-la para futuras implementações, ela estaria aqui.

// Adiciona listener para o link "Apagar filtro de busca"
function addEventListenersToClearFilterLink() {
  const clearFilterLink = document.querySelector('.clear-filter-link');
  if (clearFilterLink) {
    clearFilterLink.addEventListener('click', function(event) {
      event.preventDefault();
      searchTerm = '';
      startDateFilter = '';
      endDateFilter = '';
      searchInput.value = '';
      updateHistoryView();
    });
  }
}

// Adiciona listener para o botão "Excluir Histórico"
function addEventListenersToDeleteHistoryBtn() {
  const deleteHistoryBtn = document.querySelector('.delete-history-btn');
  if (deleteHistoryBtn) {
    deleteHistoryBtn.addEventListener('click', function(event) {
      event.preventDefault();
      if (confirm(`Tem certeza que deseja excluir todo o histórico de ${currentHistoryType}?`)) {
        historyData[currentHistoryType] = []; // Limpa os dados
        searchTerm = '';
        startDateFilter = '';
        endDateFilter = '';
        searchInput.value = '';
        updateHistoryView(); // Atualiza a visualização para mostrar o estado vazio
      }
    });
  }
}

// Inicializa a visualização com o histórico de dieta
updateHistoryView();
