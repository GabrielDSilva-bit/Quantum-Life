// Array com as 10 perguntas de dieta
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
      mostrarPergunta();
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

// ----- FUNÇÃO ATUALIZADA -----
function atualizarBotoes() {
  // A lógica de esconder o botão 'prevButton' foi REMOVIDA.
  // Ele agora ficará sempre visível.

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
    alert("Por favor, selecione uma opção para continuar.");
    return;
  }
  if (perguntaAtual < perguntas.length - 1) {
    perguntaAtual++;
    mostrarPergunta();
  }
}

// ----- FUNÇÃO ATUALIZADA -----
function perguntaAnterior() {
  // Esta verificação garante que a função só execute
  // se a pergunta atual NÃO for a primeira (índice 0).
  if (perguntaAtual > 0) {
    perguntaAtual--;
    mostrarPergunta();
  }
}

function finalizarQuiz() {
  if (respostas[perguntaAtual] === undefined) {
    alert("Por favor, selecione uma opção para finalizar.");
    return;
  }

  // Enviar as respostas para o backend para gerar o plano com IA
  fetch('http://localhost:3000/quiz/treino', { // <-- URL do seu backend
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers: respostas } ), // Envia o array de respostas
  })
  .then(response => response.json())
  .then(data => {
    if (data.plan) { // O backend agora retorna 'plan' em vez de 'profile'
      // Armazena o plano gerado pela IA no localStorage
      localStorage.setItem("generatedTreinoPlan", data.plan); // Salva o plano gerado
      // Redireciona para a página de resultados
      window.location.href = "resultado-treino.html";
    } else {
      alert("Erro ao gerar plano de treino: " + data.message);
    }
  })
  .catch(error => {
    console.error('Erro ao enviar quiz de treino para IA:', error);
    alert("Erro de conexão com o servidor ou geração de IA. Tente novamente.");
  });
}
// Adiciona os eventos aos botões
prevButton.addEventListener("click", perguntaAnterior);
nextButton.addEventListener("click", proximaPergunta);
finishButton.addEventListener("click", finalizarQuiz);

// Inicia o quiz
mostrarPergunta();
