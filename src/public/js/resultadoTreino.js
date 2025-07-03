// resultadoTreino.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Pega os dados do localStorage
  const generatedPlan = localStorage.getItem("generatedTreinoPlan");
  const calculatedProfile = localStorage.getItem("calculatedTreinoProfile");

  // 2. Pega as referências dos elementos HTML
  const idealTreinoHeadingElement =
    document.getElementById("idealTreinoHeading");
  const profileTreinoTitleElement =
    document.getElementById("profileTreinoTitle");
  const profileTreinoDescriptionElement = document.getElementById(
    "profileTreinoDescription"
  );
  const treinoSuggestionContentElement = document.getElementById(
    "treinoSuggestionContent"
  );
  const profileTreinoDetailsElement = document.getElementById(
    "profileTreinoDetails"
  );

  // 3. Mapeamento dos perfis para sugestões
  // <<< VERSÃO FINAL: Ícones diversificados para evitar repetição em cada bloco >>>
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

  // 4. Mapeamento dos perfis para o nome do treino
  const treinoNames = {
    TREINO_CARDIO_EMAGRECIMENTO: "Treino de Cardio e Emagrecimento",
    TREINO_FORCA_RESISTENCIA: "Treino de Força e Resistência",
    TREINO_CONDICIONAMENTO_GERAL: "Treino de Condicionamento Geral",
    TREINO_FUNCIONAL_FLEXIBILIDADE: "Treino Funcional e Flexibilidade",
    TREINO_BEM_ESTAR_FLEXIBILIDADE: "Treino de Bem-Estar e Flexibilidade",
    TREINO_GERAL: "Treino Geral",
    TIPO_NAO_DEFINIDO: "Plano de Treino",
  };

  // 5. Mapeamento para a introdução dinâmica
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

  // 6. Lógica para preencher a página
  if (generatedPlan) {
    if (idealTreinoHeadingElement) {
      idealTreinoHeadingElement.textContent = "Seu perfil de treino";
    }

    if (profileTreinoTitleElement && calculatedProfile) {
      profileTreinoTitleElement.textContent =
        treinoNames[calculatedProfile] || treinoNames["TIPO_NAO_DEFINIDO"];
    }

    if (profileTreinoDescriptionElement && calculatedProfile) {
      profileTreinoDescriptionElement.textContent =
        introductoryTreinoDescriptions[calculatedProfile] ||
        introductoryTreinoDescriptions["TIPO_NAO_DEFINIDO"];
    }

    if (treinoSuggestionContentElement && calculatedProfile) {
      const currentSuggestions =
        treinoSuggestions[calculatedProfile] ||
        treinoSuggestions["TIPO_NAO_DEFINIDO"];

      const items = [
        document.getElementById("treinoSuggestionItem1"),
        document.getElementById("treinoSuggestionItem2"),
        document.getElementById("treinoSuggestionItem3"),
      ];

      items.forEach((item, index) => {
        if (item && currentSuggestions[index]) {
          const img = item.querySelector("img");
          const p = item.querySelector("p");
          if (img) img.src = currentSuggestions[index].icon;
          if (p) p.textContent = currentSuggestions[index].text;
        }
      });
    }

    if (profileTreinoDetailsElement) {
      profileTreinoDetailsElement.innerHTML = "";
      const lines = generatedPlan.split("\n");
      lines.forEach((line) => {
        if (line.trim() !== "") {
          const li = document.createElement("li");
          li.textContent = line;
          profileTreinoDetailsElement.appendChild(li);
        }
      });
    }
  } else {
    if (idealTreinoHeadingElement)
      idealTreinoHeadingElement.textContent = "Plano não encontrado";
  }
});
