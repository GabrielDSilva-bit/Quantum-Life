const perguntas = [
  {
    pergunta: "Como você se sente em relação ao consumo de carboidratos?",
    opcoes: [
      "Prefiro reduzir ao máximo...",
      "Eu tento manter um equilíbrio...",
      "Gosto de carboidratos integrais...",
      "Prefiro uma dieta rica em frutas...",
      "Eu sou vegano(a)...",
    ],
  },
  {
    pergunta: "Como você se sente em relação ao consumo de gordura?",
    opcoes: [
      "Eu evito o consumo de gordura...",
      "Prefiro fontes de gorduras saudáveis...",
      "Gosto de adicionar gordura saudável...",
      "Eu gosto de uma dieta balanceada...",
      "Eu foco em fontes vegetais de gordura...",
    ],
  },
  {
    pergunta:
      "Você está buscando uma dieta que inclua alimentos de origem animal?",
    opcoes: [
      "Não, prefiro uma dieta com pouca ou nenhuma carne",
      "Sim, mas apenas carnes magras...",
      "Eu como de tudo...",
      "Não, estou mais focado(a) em vegetais",
      "Não, sigo uma dieta 100% baseada em plantas",
    ],
  },
  {
    pergunta: "Quais são seus principais objetivos com a alimentação?",
    opcoes: [
      "Perder peso rapidamente...",
      "Melhorar a saúde cardiovascular...",
      "Manter uma alimentação balanceada...",
      "Melhorar o bem-estar geral...",
      "Adotar um estilo de vida vegano...",
    ],
  },
  {
    pergunta: "Como você vê o consumo de temperos e ervas?",
    opcoes: [
      "Eu prefiro evitar temperos processados...",
      "Adoro usar temperos frescos...",
      "Eu gosto de temperos, mas não me preocupo tanto...",
      "Sou fã de especiarias e ervas...",
      "Eu adoro usar temperos e ervas frescas...",
    ],
  },
  {
    pergunta: "Como você lida com a ingestão de doces e alimentos processados?",
    opcoes: [
      "Eu tento evitar doces e processados...",
      "Eu consumo ocasionalmente...",
      "Eu não sou tão rigoroso(a)...",
      "Tento evitar o açúcar...",
      "Evito completamente produtos de origem animal...",
    ],
  },
  {
    pergunta:
      "Você prefere comer grandes porções ou porções menores e mais frequentes?",
    opcoes: [
      "Prefiro porções menores e mais frequentes...",
      "Gosto de manter uma quantidade balanceada...",
      "Prefiro porções generosas...",
      "Costumo optar por porções leves...",
      "Prefiro porções leves e vegetais...",
    ],
  },
  {
    pergunta: "Você tem alguma preferência por alimentos frescos e sazonais?",
    opcoes: [
      "Prefiro alimentos simples...",
      "Sim, gosto de consumir alimentos frescos...",
      "Gosto de alimentos frescos, mas também incluo outros...",
      "Sim, me preocupo com a sazonalidade...",
      "Sempre procuro alimentos frescos e sazonais...",
    ],
  },
  {
    pergunta: "Qual é a sua abordagem em relação ao consumo de laticínios?",
    opcoes: [
      "Evito completamente laticínios",
      "Consumo laticínios com moderação...",
      "Não me importo em consumir laticínios...",
      "Não consumo laticínios, mas adoro alternativas...",
      "Não consumo laticínios, buscando opções vegetais...",
    ],
  },
  {
    pergunta: "Qual a sua preferência em relação ao consumo de proteínas?",
    opcoes: [
      "Prefiro consumir proteínas vegetais...",
      "Consumo proteínas de fontes magras...",
      "Não me preocupo com a origem...",
      "Prefiro uma dieta rica em alimentos frescos...",
      "Eu sou vegano(a) e consumo apenas proteínas vegetais...",
    ],
  },
];

let perguntaAtual = 0;
const respostas = new Array(perguntas.length).fill(null);

const questionTextElement = document.querySelector(".quiz-question");
const optionsContainer = document.querySelector(".quiz-options");
const progressDots = document.querySelectorAll(".progress-dot");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const finishButton = document.getElementById("finish-button");
const loadingOverlay = document.getElementById("loadingOverlay");

function mostrarPergunta() {
  const p = perguntas[perguntaAtual];
  questionTextElement.textContent = p.pergunta;
  optionsContainer.innerHTML = "";

  p.opcoes.forEach((texto, index) => {
    const opcaoElement = document.createElement("a");
    opcaoElement.href = "#";
    opcaoElement.className = "quiz-option";
    opcaoElement.addEventListener("click", (e) => {
      e.preventDefault();
      respostas[perguntaAtual] = index;
      document.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("selected"));
      opcaoElement.classList.add("selected");
    });

    if (respostas[perguntaAtual] === index) {
      opcaoElement.classList.add("selected");
    }

    opcaoElement.innerHTML = `
      <span class="option-circle"></span>
      <span class="option-text">${texto}</span>
    `;
    optionsContainer.appendChild(opcaoElement);
  });

  atualizarProgresso();
  atualizarBotoes();
}

function atualizarProgresso() {
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === perguntaAtual);
  });
}

function atualizarBotoes() {
  if (perguntaAtual === perguntas.length - 1) {
    nextButton.style.display = "none";
    finishButton.style.display = "block";
  } else {
    nextButton.style.display = "block";
    finishButton.style.display = "none";
  }
}

function proximaPergunta() {
  if (respostas[perguntaAtual] === null) {
    Swal.fire({
      icon: "warning",
      title: "Atenção!",
      text: "Por favor, selecione uma opção para continuar.",
      confirmButtonColor: "#d33"
    });
    return;
  }
  if (perguntaAtual < perguntas.length - 1) {
    perguntaAtual++;
    mostrarPergunta();
  }
}

function perguntaAnterior() {
  if (perguntaAtual > 0) {
    perguntaAtual--;
    mostrarPergunta();
  }
}

async function finalizarQuiz() {
  if (respostas[perguntaAtual] === null) {
    Swal.fire({
      icon: "warning",
      title: "Atenção!",
      text: "Por favor, selecione uma opção para finalizar.",
      confirmButtonColor: "#d33"
    });
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "info",
      title: "Login necessário",
      text: "Você precisa estar logado para gerar um plano! Redirecionando...",
      confirmButtonColor: "#3085d6"
    }).then(() => {
      window.location.href = "/login-cadastro";
    });
    return;
  }

  loadingOverlay.classList.remove("loading-hidden");
  loadingOverlay.classList.add("loading-visible");

  try {
    const response = await fetch("/salvar-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quiz_type: "dieta",
        answers: respostas,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      Swal.fire({
        icon: "error",
        title: "Sessão expirada",
        text: "Sua sessão expirou ou o token é inválido. Redirecionando...",
        confirmButtonColor: "#d33"
      }).then(() => {
        window.location.href = "/login-cadastro";
      });
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message);
    }

    const data = await response.json();

    if (data.plan) {
      localStorage.setItem("generatedDietPlan", data.plan);
      localStorage.setItem("calculatedDietProfile", data.calculated_profile);
      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: data.message || "Plano de dieta gerado com sucesso!",
        confirmButtonColor: "#28a745"
      }).then(() => {
        window.location.href = "/resultado-dieta";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: data.message || "Plano não retornado pelo servidor.",
        confirmButtonColor: "#d33"
      });
    }
  } catch (error) {
    console.error("Erro ao enviar quiz de dieta:", error);
    Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: error.message || "Erro ao conectar com o servidor.",
      confirmButtonColor: "#d33"
    });
  } finally {
    loadingOverlay.classList.remove("loading-visible");
    loadingOverlay.classList.add("loading-hidden");
  }
}

prevButton.addEventListener("click", perguntaAnterior);
nextButton.addEventListener("click", proximaPergunta);
finishButton.addEventListener("click", finalizarQuiz);

mostrarPergunta();
