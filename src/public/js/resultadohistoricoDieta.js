// public/js/resultadohistoricoDieta.js

document.addEventListener("DOMContentLoaded", async () => { // Torna a função assíncrona
  // 1. Pega o ID do quiz da URL
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');

  // 2. Pega as referências dos elementos HTML pelos seus IDs
  const idealDietHeadingElement = document.getElementById("idealDietHeading");
  const generatedDateElement = document.getElementById("generatedDate"); // Novo elemento para a data
  const profileTitleElement = document.getElementById("profileTitle");
  const profileDescriptionElement = document.getElementById("profileDescription");
  const profileDetailsElement = document.getElementById("profileDetails");
  const dietDescriptionTextElement = document.getElementById("dietDescriptionText");

  // Mapeamento dos perfis de dieta para suas descrições detalhadas
  const dietDescriptions = {
    VEGANA:
      "A dieta VEGANA exclui todos os produtos de origem animal, incluindo carne, laticínios, ovos e mel. Foca em vegetais, frutas, grãos, leguminosas, nozes e sementes. É rica em fibras e nutrientes vegetais, promovendo saúde e sustentabilidade.",
    VEGETARIANA:
      "A dieta VEGETARIANA exclui carne, aves e peixes, mas pode incluir laticínios e ovos. Foca em vegetais, frutas, grãos, leguminosas, nozes e sementes, promovendo uma alimentação saudável e equilibrada.",
    FLEXITARIANA:
      "A dieta FLEXITARIANA é predominantemente vegetariana, mas ocasionalmente inclui carne, aves ou peixe. É flexível e foca em alimentos integrais e vegetais, buscando um equilíbrio entre saúde e prazer sem restrições rígidas.",
    ONIVORA:
      "A dieta ONÍVORA inclui uma variedade de alimentos de origem vegetal e animal. Foca em uma alimentação equilibrada com todos os grupos alimentares, adaptando-se a diversas necessidades e preferências para uma nutrição completa.",
    LOW_CARB:
      "A dieta LOW CARB foca na redução de carboidratos, priorizando proteínas, gorduras saudáveis e vegetais de baixo carboidrato. Ajuda no controle de peso e açúcar no sangue, promovendo saciedade e energia constante.",
    MEDITERRANEA:
      "A dieta MEDITERRÂNEA é rica em vegetais, frutas, grãos integrais, azeite de oliva, peixes e frutos do mar, com consumo moderado de laticínios e carne vermelha. Promove a saúde cardiovascular, longevidade e bem-estar geral.",
    BEM_ESTAR:
      "A dieta BEM-ESTAR foca em uma alimentação equilibrada e consciente, priorizando alimentos frescos, minimamente processados, para promover a saúde geral, o bem-estar e a vitalidade, adaptando-se às necessidades individuais.",
    DIETA_GERAL:
      "Esta é uma dieta geral e equilibrada, focada em alimentos integrais, vegetais, proteínas magras e gorduras saudáveis. É um plano versátil que pode ser adaptado a diversas necessidades e objetivos de saúde.",
    TIPO_NAO_DEFINIDO:
      "Não foi possível determinar um tipo específico de dieta. Consulte um profissional de saúde para um plano personalizado e informações detalhadas.",
  };

  // Mapeamento para a introdução dinâmica da dieta
  const introductoryDescriptions = {
    VEGANA:
      "Este plano é focado em uma alimentação 100% baseada em vegetais, excluindo todos os produtos de origem animal. Ele oferece opções nutritivas e saborosas para um estilo de vida vegano.",
    VEGETARIANA:
      "Este plano é centrado em alimentos vegetais, com a possibilidade de incluir laticínios e ovos. Ele oferece refeições equilibradas e ricas em nutrientes para uma dieta sem carne.",
    FLEXITARIANA:
      "Este plano prioriza alimentos vegetais, mas com a flexibilidade de incluir ocasionalmente carnes magras ou peixes. É ideal para quem busca um equilíbrio e variedade na alimentação.",
    ONIVORA:
      "Este plano abrange uma ampla variedade de alimentos, incluindo opções vegetais e de origem animal. Ele foi elaborado para oferecer uma nutrição completa e adaptada às suas preferências.",
    LOW_CARB:
      "Este plano é desenhado para reduzir a ingestão de carboidratos, focando em proteínas, gorduras saudáveis e vegetais de baixo teor de carboidratos. Ideal para controle de peso e energia.",
    MEDITERRANEA:
      "Este plano é inspirado na culinária mediterrânea, rica em vegetais, azeite de oliva, grãos integrais e peixes. Promove a saúde do coração e um estilo de vida equilibrado.",
    BEM_ESTAR:
      "Este plano visa o bem-estar geral, com foco em alimentos frescos e minimamente processados. Ele busca nutrir seu corpo e mente para uma vida mais saudável e equilibrada.",
    DIETA_GERAL:
      "Este é um plano alimentar geral e balanceado, com sugestões nutritivas e variadas. Ele serve como uma base sólida para uma alimentação saudável e pode ser adaptado às suas necessidades.",
    TIPO_NAO_DEFINIDO:
      "Aqui está o plano de dieta gerado pela nossa inteligência artificial, feito sob medida para suas preferências:", // Fallback para a frase original
  };

  // Mapeamento para o nome da dieta (para o h2)
  const dietNames = {
    VEGANA: "Dieta VEGANA",
    VEGETARIANA: "Dieta VEGETARIANA",
    FLEXITARIANA: "Dieta FLEXITARIANA",
    ONIVORA: "Dieta ONÍVORA",
    LOW_CARB: "Dieta LOW CARB",
    MEDITERRANEA: "Dieta MEDITERRÂNEA",
    BEM_ESTAR: "Dieta para o BEM-ESTAR",
    DIETA_GERAL: "Dieta Geral",
    TIPO_NAO_DEFINIDO: "Plano Alimentar", // Fallback para o nome da dieta
  };

  // Exibe mensagem de carregamento inicial
  if (profileDetailsElement) {
    profileDetailsElement.innerHTML = '<p>Carregando seu plano de dieta...</p>';
  }

  // Verifica se o ID do quiz foi fornecido na URL
  if (!quizId) {
    if (profileDetailsElement) {
      profileDetailsElement.innerHTML = '<p>ID do quiz não encontrado na URL. Por favor, retorne ao histórico.</p>';
    }
    return;
  }

  // Verifica se o usuário está autenticado
  const token = localStorage.getItem('token');
  if (!token) {
    if (profileDetailsElement) {
      profileDetailsElement.innerHTML = '<p>Você não está logado. <a href="/login-cadastro">Faça login para ver seu plano.</a></p>';
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
      if (profileDetailsElement) {
        profileDetailsElement.innerHTML = '<p>Sua sessão expirou. <a href="/login-cadastro">Por favor, faça login novamente</a>.</p>';
      }
      return;
    }

    // Lida com outras respostas de erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText || 'Erro desconhecido.' }));
      throw new Error(errorData.message || 'Erro ao buscar o plano de dieta.');
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
    if (idealDietHeadingElement) {
      idealDietHeadingElement.textContent = "A Dieta Ideal para você é";
    }

    if (generatedDateElement) {
      generatedDateElement.textContent = `Plano Gerado em: ${formattedDate}`;
    }

    if (profileTitleElement) {
      profileTitleElement.textContent = `${dietNames[calculatedProfile] || dietNames["TIPO_NAO_DEFINIDO"]}`;
    }

    if (profileDescriptionElement) {
      profileDescriptionElement.textContent =
        introductoryDescriptions[calculatedProfile] ||
        introductoryDescriptions["TIPO_NAO_DEFINIDO"];
    }

    if (dietDescriptionTextElement) {
      dietDescriptionTextElement.textContent =
        dietDescriptions[calculatedProfile] ||
        dietDescriptions["TIPO_NAO_DEFINIDO"];
    }

    // Limpa qualquer conteúdo antigo da lista do plano
    if (profileDetailsElement) {
      profileDetailsElement.innerHTML = "";

      // Divide o plano gerado em linhas e cria itens de lista
      if (typeof generatedPlan === 'string') {
        const lines = generatedPlan.split("\n");
        lines.forEach((line) => {
          const li = document.createElement("li");
          li.textContent = line;
          profileDetailsElement.appendChild(li);
        });
      } else if (typeof generatedPlan === 'object' && generatedPlan !== null) {
        // Se o conteúdo for um objeto JSON (ex: se a IA retornar um JSON estruturado)
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(generatedPlan, null, 2);
        profileDetailsElement.appendChild(pre);
      } else {
        const p = document.createElement("p");
        p.textContent = "Conteúdo do plano não disponível.";
        profileDetailsElement.appendChild(p);
      }
    }

  } catch (error) {
    console.error('Erro ao carregar plano de dieta:', error);
    if (profileDetailsElement) {
      profileDetailsElement.innerHTML = `<p>Erro ao carregar seu plano: ${error.message}</p>`;
    }
  }
});
