    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    const searchInput = document.getElementById('search-input');
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    let currentTab = 'dieta';

    const data = {
      dieta: JSON.parse(localStorage.getItem('historicoDieta')) || [],
      imc: JSON.parse(localStorage.getItem('historicoIMC')) || [],
      treino: JSON.parse(localStorage.getItem('historicoTreino')) || []
    };

    function render(tab) {
      const container = document.getElementById(`tab-${tab}`);
      container.innerHTML = '<h1>Histórico de ' + tab.toUpperCase() + '</h1>';
      const filtered = data[tab].filter(entry => {
        const date = new Date(entry.data);
        const start = startDate.value ? new Date(startDate.value) : null;
        const end = endDate.value ? new Date(endDate.value) : null;
        return (!start || date >= start) && (!end || date <= end);
      }).filter(entry => {
        return searchInput.value === '' || JSON.stringify(entry).toLowerCase().includes(searchInput.value.toLowerCase());
      });

      if (filtered.length === 0) {
        container.innerHTML += '<div class="empty-state-text">Nenhum resultado encontrado.</div>';
        return;
      }

      filtered.forEach(entry => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = Object.values(entry).map(v => `<div>${v}</div>`).join('');
        container.appendChild(item);
      });
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        contents.forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
        currentTab = btn.dataset.tab;
        render(currentTab);
      });
    });

    document.getElementById('btn-apply').addEventListener('click', () => render(currentTab));
    document.getElementById('btn-clear').addEventListener('click', () => {
      startDate.value = endDate.value = searchInput.value = '';
      render(currentTab);
    });
    document.getElementById('search-btn').addEventListener('click', () => render(currentTab));
    document.getElementById('btn-delete').addEventListener('click', () => {
      if (confirm("Deseja realmente apagar o histórico de " + currentTab + "?")) {
        localStorage.removeItem('historico' + currentTab.charAt(0).toUpperCase() + currentTab.slice(1));
        data[currentTab] = [];
        render(currentTab);
      }
    });

    document.querySelector('.period-toggle').addEventListener('click', () => {
      document.querySelector('.period-selector').classList.toggle('active');
    });

    // Inicializa aba padrão
    render(currentTab);