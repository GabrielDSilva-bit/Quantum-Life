// public/js/resultadohistoricoTreino.js

document.addEventListener("DOMContentLoaded", async () => { // Torna a função assíncrona
  // 1. Pega o ID do quiz da URL
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id'); // Pega o ID do quiz da URL

  // 2. Pega as referências dos elementos HTML pelos seus IDs
  const idealTreinoHeadingElement = document.getElementById("idealTreinoHeading");
  const generatedDateElement = document.getElementById("generatedDate"); // Elemento para a data
  const profileTreinoTitleElement = document.getElementById("profileTreinoTitle");
  const profileTreinoDescriptionElement = document.getElementById("profileTreinoDescription");
  const treinoSuggestionContentElement = document.getElementById("treinoSuggestionContent"); // O container dos 3 itens
  const profileTreinoDetailsElement = document.getElementById("profileTreinoDetails");

  // Mapeamento dos perfis de treino para suas sugestões detalhadas (3 itens: ícone e texto)
  // ATENÇÃO: Os caminhos dos ícones são exemplos. Você deve ter esses arquivos na pasta /img/
  // Certifique-se de que os arquivos de imagem (exercicio (7).png, icone_frequencia.png, etc.)
  // existam na sua pasta public/img/
  const treinoSuggestions = {
    TREINO_CARDIO_EMAGRECIMENTO: [
      {
        icon: "/img/exercicio7.png", // Ícone de corrida
        text: "Foco em Cardio e Queima de Gordura",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "4 - 5 vezes por semana",
      },
      {
        icon: "/img/exercicio6.png", // Ícone de movimento dinâmico para intensidade
        text: "Intensidade Moderada a Alta",
      },
    ],
    TREINO_FORCA_RESISTENCIA: [
      {
        icon: "/img/exercicio3.png", // Ícone de levantamento de peso
        text: "Musculação e Força",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "3 - 4 vezes por semana",
      },
      {
        icon: "/img/exercicio8.png", // Ícone de trigo (nutrição)
        text: "Proteínas e Descanso Adequado",
      },
    ],
    TREINO_CONDICIONAMENTO_GERAL: [
      {
        icon: "/img/exercicio6.png", // Ícone de movimento dinâmico
        text: "Condicionamento Físico Geral",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "3 - 5 vezes por semana",
      },
      {
        icon: "/img/exercicio5.png", // <<< ÍCONE DIVERSIFICADO: Prancha para duração
        text: "40 - 60 minutos por sessão",
      },
    ],
    TREINO_FUNCIONAL_FLEXIBILIDADE: [
      {
        icon: "/img/exercicio5.png", // Ícone de prancha (funcional)
        text: "Treino Funcional e Flexibilidade",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "3 - 4 vezes por semana",
      },
      {
        icon: "/img/exercicio4.png", // Ícone de natação (flexibilidade)
        text: "Mobilidade e Fluidez",
      },
    ],
    TREINO_BEM_ESTAR_FLEXIBILIDADE: [
      {
        icon: "/img/exercicio3.png", // Ícone de alongamento
        text: "Bem-Estar e Relaxamento",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "2 - 3 vezes por semana",
      },
      {
        icon: "/img/exercicio4.png", // Ícone de natação (consciência corporal)
        text: "Consciência Corporal",
      },
    ],
    TREINO_GERAL: [
      {
        icon: "/img/exercicio2.png", // Ícone de abdominal (exercício geral)
        text: "Treino Geral e Equilibrado",
      },
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora para frequência
        text: "3 - 4 vezes por semana",
      },
      {
        icon: "/img/exercicio5.png", // <<< ÍCONE DIVERSIFICADO: Prancha para duração
        text: "45 - 60 minutos por sessão",
      },
    ],
    TIPO_NAO_DEFINIDO: [
      {
        icon: "/img/exercicio9.png", // Ícone de calculadora como fallback
        text: "Plano de treino personalizado.",
      },
      { icon: "", text: "" },
      { icon: "", text: "" },
    ],
  };

  // Mapeamento dos perfis de treino para o nome do treino (para o h2)
  const treinoNames = {
    TREINO_CARDIO_EMAGRECIMENTO: "Treino de Cardio e Emagrecimento",
    TREINO_FORCA_RESISTENCIA: "Treino de Força e Resistência",
    TREINO_CONDICIONAMENTO_GERAL: "Treino de Condicionamento Geral",
    TREINO_FUNCIONAL_FLEXIBILIDADE: "Treino Funcional e Flexibilidade",
    TREINO_BEM_ESTAR_FLEXIBILIDADE: "Treino de Bem-Estar e Flexibilidade",
    TREINO_GERAL: "Treino Geral",
    TIPO_NAO_DEFINIDO: "Plano de Treino",
  };

  // Mapeamento para a introdução dinâmica do treino
  const introductoryTreinoDescriptions = {
    TREINO_CARDIO_EMAGRECIMENTO:
      "Este plano é focado em exercícios cardiovasculares para otimizar a queima de calorias e auxiliar na perda de peso, com sessões dinâmicas e eficazes.",
    TREINO_FORCA_RESISTENCIA:
      "Este plano visa o desenvolvimento da força muscular e da resistência, com exercícios que desafiam seus limites e promovem o crescimento e a tonificação.",
    TREINO_CONDICIONAMENTO_GERAL:
      "Este plano busca melhorar seu condicionamento físico de forma abrangente, combinando diferentes tipos de exercícios para aumentar sua capacidade e bem-estar geral.",
    TREINO_FUNCIONAL_FLEXIBILIDADE:
      "Este plano integra movimentos funcionais e exercícios de flexibilidade para melhorar sua mobilidade, equilíbrio e desempenho em atividades do dia a dia.",
    TREINO_BEM_ESTAR_FLEXIBILIDADE:
      "Este plano prioriza o bem-estar e o relaxamento, com foco em alongamento, mobilidade e técnicas que promovem a conexão mente-corpo e reduzem o estresse.",
    TREINO_GERAL:
      "Este é um plano de treino geral e equilibrado, com sugestões variadas para manter você ativo e saudável, adaptando-se a diferentes níveis de condicionamento.",
    TIPO_NAO_DEFINIDO:
      "Aqui está o plano de treino gerado pela nossa inteligência artificial, feito sob medida para suas preferências:",
  };

  // Exibe mensagem de carregamento inicial
  if (profileTreinoDetailsElement) {
    profileTreinoDetailsElement.innerHTML = '<p>Carregando seu plano de treino...</p>';
  }

  // Verifica se o ID do quiz foi fornecido na URL
  if (!quizId) {
    if (profileTreinoDetailsElement) {
      profileTreinoDetailsElement.innerHTML = '<p>ID do quiz não encontrado na URL. Por favor, retorne ao histórico.</p>';
    }
    return;
  }
  
  // Verifica se o usuário está autenticado
  const token = localStorage.getItem('token');
  if (!token) {
    if (profileTreinoDetailsElement) {
      profileTreinoDetailsElement.innerHTML = '<p>Você não está logado. <a href="/login-cadastro">Faça login para ver seu plano.</a></p>';
    }
    return;
  }

  try {
    // Faz a requisição ao backend para buscar os detalhes do quiz
    const response = await fetch(`/api/quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Lida com respostas de erro de autenticação
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token'); // Limpa token inválido
      if (profileTreinoDetailsElement) {
        profileTreinoDetailsElement.innerHTML = '<p>Sua sessão expirou. <a href="/login-cadastro">Por favor, faça login novamente</a>.</p>';
      }
      return;
    }

    // Lida com outras respostas de erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText || 'Erro desconhecido.' }));
      throw new Error(errorData.message || 'Erro ao buscar o plano de treino.');
    }

    // Processa a resposta bem-sucedida
    const quizResult = await response.json();
    const generatedPlan = quizResult.generated_content;
    const calculatedProfile = quizResult.calculated_profile;
    const createdAt = quizResult.created_at;

    // Formata a data de criação
    const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    // Preenche os elementos HTML com os dados do quiz
    if (idealTreinoHeadingElement) {
      idealTreinoHeadingElement.textContent = "Seu perfil de treino";
    }

    if (generatedDateElement) {
      generatedDateElement.textContent = `Plano Gerado em: ${formattedDate}`;
    }

    if (profileTreinoTitleElement) {
      profileTreinoTitleElement.textContent = `${treinoNames[calculatedProfile] || treinoNames["TIPO_NAO_DEFINIDO"]}`;
    }

    if (profileTreinoDescriptionElement) {
      profileTreinoDescriptionElement.textContent =
        introductoryTreinoDescriptions[calculatedProfile] ||
        introductoryTreinoDescriptions["TIPO_NAO_DEFINIDO"];
    }

    // Atualiza a seção de sugestões de treino (os 3 itens)
    if (treinoSuggestionContentElement && calculatedProfile) {
      const currentSuggestions =
        treinoSuggestions[calculatedProfile] ||
        treinoSuggestions["TIPO_NAO_DEFINIDO"];

      const item1 = document.getElementById("treinoSuggestionItem1");
      const item2 = document.getElementById("treinoSuggestionItem2");
      const item3 = document.getElementById("treinoSuggestionItem3");

      if (item1 && currentSuggestions[0]) {
        item1.querySelector("img").src = currentSuggestions[0].icon;
        item1.querySelector("p").textContent = currentSuggestions[0].text;
      }
      if (item2 && currentSuggestions[1]) {
        item2.querySelector("img").src = currentSuggestions[1].icon;
        item2.querySelector("p").textContent = currentSuggestions[1].text;
      }
      if (item3 && currentSuggestions[2]) {
        item3.querySelector("img").src = currentSuggestions[2].icon;
        item3.querySelector("p").textContent = currentSuggestions[2].text;
      }
    } else if (treinoSuggestionContentElement) {
      // Fallback para TIPO_NAO_DEFINIDO ou sem plano
      const fallbackSuggestions = treinoSuggestions["TIPO_NAO_DEFINIDO"];
      const item1 = document.getElementById("treinoSuggestionItem1");
      const item2 = document.getElementById("treinoSuggestionItem2");
      const item3 = document.getElementById("treinoSuggestionItem3");

      if (item1 && fallbackSuggestions[0]) {
        item1.querySelector("img").src = fallbackSuggestions[0].icon;
        item1.querySelector("p").textContent = fallbackSuggestions[0].text;
      }
      if (item2 && fallbackSuggestions[1]) {
        item2.querySelector("img").src = fallbackSuggestions[1].icon;
        item2.querySelector("p").textContent = fallbackSuggestions[1].text;
      }
      if (item3 && fallbackSuggestions[2]) {
        item3.querySelector("img").src = fallbackSuggestions[2].icon;
        item3.querySelector("p").textContent = fallbackSuggestions[2].text;
      }
    }

    // Limpa qualquer conteúdo antigo da lista do plano (o plano dia a dia)
    if (profileTreinoDetailsElement) {
      profileTreinoDetailsElement.innerHTML = "";

      // Divide o plano gerado em linhas e cria itens de lista
      if (typeof generatedPlan === 'string') {
        const lines = generatedPlan.split("\n");
        lines.forEach((line) => {
          const li = document.createElement("li");
          li.textContent = line;
          profileTreinoDetailsElement.appendChild(li);
        });
      } else if (typeof generatedPlan === 'object' && generatedPlan !== null) {
        // Se o conteúdo for um objeto JSON (ex: se a IA retornar um JSON estruturado)
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(generatedPlan, null, 2);
        profileTreinoDetailsElement.appendChild(pre);
      } else {
        const p = document.createElement("p");
        p.textContent = "Conteúdo do plano não disponível.";
        profileTreinoDetailsElement.appendChild(p);
      }
    }

  } catch (error) {
    console.error('Erro ao carregar plano de treino:', error);
    if (profileTreinoDetailsElement) {
      profileTreinoDetailsElement.innerHTML = `<p>Erro ao carregar seu plano: ${error.message}</p>`;
    }
  }
});
