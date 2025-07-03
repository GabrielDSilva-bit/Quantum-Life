document.addEventListener("DOMContentLoaded", () => {
  // 1. Pega os dados do localStorage
  const generatedPlan = localStorage.getItem("generatedDietPlan");
  const calculatedProfile = localStorage.getItem("calculatedDietProfile");

  // 2. Pega as referências dos elementos HTML pelos seus IDs
  const idealDietHeadingElement = document.getElementById("idealDietHeading"); // O <h1> "A Dieta Ideal para você é"
  const profileTitleElement = document.getElementById("profileTitle"); // O <h2> "Seu Plano Alimentar Personalizado!"
  const profileDescriptionElement =
    document.getElementById("profileDescription"); // O <p> "Aqui está o plano..."
  const profileDetailsElement = document.getElementById("profileDetails"); // O <ul> onde o plano dia a dia será exibido
  const dietDescriptionTextElement = document.getElementById(
    "dietDescriptionText"
  ); // O <p> da seção "Alimentos Recomendados"

  // 3. Mapeamento dos perfis de dieta para suas descrições detalhadas
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

  // 4. Mapeamento dos perfis de dieta para o título principal
  const idealDietTitles = {
    VEGANA: "A Dieta VEGANA Ideal para você é",
    VEGETARIANA: "A Dieta VEGETARIANA Ideal para você é",
    FLEXITARIANA: "A Dieta FLEXITARIANA Ideal para você é",
    ONIVORA: "A Dieta ONÍVORA Ideal para você é",
    LOW_CARB: "A Dieta LOW CARB Ideal para você é",
    MEDITERRANEA: "A Dieta MEDITERRÂNEA Ideal para você é",
    BEM_ESTAR: "A Dieta para o BEM-ESTAR Ideal para você é",
    DIETA_GERAL: "A Dieta Geral Ideal para você é",
    TIPO_NAO_DEFINIDO: "A Dieta Ideal para você é", // Fallback para o título original
  };

  // NOVO: Mapeamento para a introdução dinâmica da dieta
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

  // NOVO: Mapeamento para o nome da dieta (para o h2)
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

  // 5. Lógica para preencher os elementos HTML
  if (generatedPlan) {
    // Atualiza o título principal (h1) para ser sempre genérico
    if (idealDietHeadingElement) {
      idealDietHeadingElement.textContent = "A Dieta Ideal para você é";
    }

    // Atualiza o subtítulo (h2) com o nome específico da dieta
    if (profileTitleElement && calculatedProfile) {
      profileTitleElement.textContent =
        dietNames[calculatedProfile] || dietNames["TIPO_NAO_DEFINIDO"];
    } else if (profileTitleElement) {
      profileTitleElement.textContent = dietNames["TIPO_NAO_DEFINIDO"];
    }

    // ATUALIZA A DESCRIÇÃO ABAIXO DO TÍTULO COM A INTRODUÇÃO DINÂMICA
    if (profileDescriptionElement && calculatedProfile) {
      profileDescriptionElement.textContent =
        introductoryDescriptions[calculatedProfile] ||
        introductoryDescriptions["TIPO_NAO_DEFINIDO"];
    } else if (profileDescriptionElement) {
      profileDescriptionElement.textContent =
        introductoryDescriptions["TIPO_NAO_DEFINIDO"];
    }

    // Atualiza a descrição da dieta na seção "Alimentos Recomendados" (este permanece o mesmo)
    if (dietDescriptionTextElement && calculatedProfile) {
      dietDescriptionTextElement.textContent =
        dietDescriptions[calculatedProfile] ||
        dietDescriptions["TIPO_NAO_DEFINIDO"];
    } else if (dietDescriptionTextElement) {
      dietDescriptionTextElement.textContent =
        dietDescriptions["TIPO_NAO_DEFINIDO"];
    }

    // Limpa qualquer conteúdo antigo da lista do plano
    profileDetailsElement.innerHTML = "";

    // Divide o plano gerado em linhas e cria itens de lista
    const lines = generatedPlan.split("\n");
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      profileDetailsElement.appendChild(li);
    });
  } else {
    // Caso o plano não seja encontrado no localStorage
    if (idealDietHeadingElement) {
      idealDietHeadingElement.textContent = "A Dieta Ideal para você é"; // Fallback para o título genérico
    }
    if (profileTitleElement) {
      profileTitleElement.textContent = dietNames["TIPO_NAO_DEFINIDO"]; // Fallback para o nome da dieta
    }
    // Fallback para a introdução dinâmica
    if (profileDescriptionElement) {
      profileDescriptionElement.textContent =
        introductoryDescriptions["TIPO_NAO_DEFINIDO"];
    }
    profileDetailsElement.innerHTML = "";
    if (dietDescriptionTextElement) {
      dietDescriptionTextElement.textContent =
        dietDescriptions["TIPO_NAO_DEFINIDO"];
    }
  }
});