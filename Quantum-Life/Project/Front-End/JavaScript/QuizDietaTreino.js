// Array com as 10 perguntas de treino
const perguntas = [
  {
    pergunta: "Qual é seu principal objetivo com o treino?",
    opcoes: [
      "Melhorar a resistência cardiovascular e perder peso rapidamente",
      "Aumentar a força muscular e a resistência geral",
      "Melhorar o condicionamento físico geral com uma atividade constante e moderada",
      "Trabalhar todo o corpo com movimentos dinâmicos e melhorar a flexibilidade",
      "Reduzir o estresse e aumentar a flexibilidade mental e física",
    ],
  },
  {
    pergunta: "Qual é o seu nível de experiência com treinos físicos?",
    opcoes: [
      "Sou iniciante, mas estou disposto(a) a me esforçar",
      "Tenho experiência, mas quero intensificar meu treino",
      "Tenho um nível intermediário, gosto de treinos mais tranquilos",
      "Sou iniciante ou intermediário, busco um treino dinâmico e leve",
      "Sou iniciante ou médio, gosto de focar na respiração e no controle do corpo",
    ],
  },
  {
    pergunta: "Como você prefere que sejam os treinos?",
    opcoes: [
      "Intensos, com movimentos rápidos e desafiadores",
      "Exigentes, focando em levantamentos e resistência muscular",
      "Constantes, com foco em atividades mais tranquilas, porém duradouras",
      "Variados, com muita dinâmica e momentos de descanso",
      "Calmos, com foco no relaxamento e na conexão corpo-mente",
    ],
  },
  {
    pergunta: "Qual é a sua disponibilidade de tempo para o treino?",
    opcoes: [
      "Tenho pouco tempo, então prefiro treinos rápidos e eficientes",
      "Tenho tempo para dedicar treinos mais longos e intensos",
      "Tenho tempo médio, prefiro algo que seja consistente, mas que não exija muito esforço",
      "Prefiro treinos curtos, mas com variação de atividades",
      "Tenho tempo para uma prática de longo prazo, mais focada no controle e respiração",
    ],
  },
  {
    pergunta: "Como você lida com a intensidade do treino?",
    opcoes: [
      "Adoro desafios intensos e sou capaz de manter o ritmo por um bom tempo",
      "Prefiro aumentar a intensidade aos poucos e fazer treinos pesados",
      "Gosto de treinos mais leves e contínuos, sem grande intensidade",
      "Prefiro uma mistura de atividades e pausas, com foco no corpo inteiro",
      "Busco intensidade baixa, focando mais em alongamento e controle mental",
    ],
  },
  {
    pergunta: "Qual é a sua relação com a musculação e levantamentos de peso?",
    opcoes: [
      "Gosto de treinos sem foco em musculação, onde o corpo trabalha em alta intensidade",
      "Adoro trabalhar a musculação e a resistência com pesos",
      "Não gosto de musculação, prefiro treinos que não envolvem pesos",
      "Gosto de usar o peso do corpo para treinar e melhorar a resistência",
      "Não sou muito fã de musculação, prefiro atividades mais suaves e com foco em respiração",
    ],
  },
  {
    pergunta: "Como você se sente em relação ao ritmo do treino?",
    opcoes: [
      "Gosto de um ritmo rápido e dinâmico, com pouco tempo de descanso",
      "Prefiro um ritmo constante e mais focado na força muscular",
      "Gosto de algo moderado e sem pressa, focando em resistência cardiovascular.",
      "Prefiro variar o ritmo, com momentos de descanso e atividades rápidas",
      "Busco um ritmo calmo e controlado, com foco no bem-estar mental",
    ],
  },
  {
    pergunta: "Você está em busca de melhorar sua flexibilidade e alongamento?",
    opcoes: [
      "Não muito, estou mais focado(a) em aumentar minha resistência",
      "Sim, mas meu foco é mais no aumento da força do que na flexibilidade",
      "Um pouco, mas meu principal objetivo é trabalhar a resistência cardiovascular",
      "Sim, flexibilidade é importante para mim, além da força e resistência",
      "Sim, flexibilidade e alongamento são meus principais focos",
    ],
  },
  {
    pergunta: "Você prefere treinos com variedade ou treinos repetitivos?",
    opcoes: [
      "Prefiro treinos variados com pouco descanso entre os exercícios",
      "Prefiro treinos focados em força, onde posso repetir o mesmo exercício",
      "Gosto de treinos que sigam uma rotina, mas sem se tornar monótono",
      "Prefiro uma mistura de atividades, com muitos exercícios dinâmicos",
      "Prefiro treinos repetitivos e focados no relaxamento e alongamento",
    ],
  },
  {
    pergunta: "Qual é a sua maior motivação para praticar exercícios físicos?",
    opcoes: [
      "Melhorar o condicionamento cardiovascular e perder peso rapidamente",
      "Aumentar a força, a resistência e a definição muscular",
      "Melhorar a saúde geral com atividades físicas constantes e moderadas",
      "Melhorar a flexibilidade, equilíbrio e resistência física",
      "Relaxar, controlar o estresse e melhorar a consciência corporal e respiratória",
    ],
  },
];

let perguntaAtual = 0;
const respostas = new Array(perguntas.length).fill(null); // Inicializa com null para consistência

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
      // Remove a seleção de todas as opções e adiciona à selecionada
      document
        .querySelectorAll(".quiz-option")
        .forEach((o) => o.classList.remove("selected"));
      opcaoElement.classList.add("selected");
    });

    opcaoElement.innerHTML = `
            <span class="option-circle"></span>
            <span class="option-text">${texto}</span>
        `;
    optionsContainer.appendChild(opcaoElement);
  });

  // Mantém a opção selecionada se o usuário voltar
  if (respostas[perguntaAtual] !== null) {
    optionsContainer.children[respostas[perguntaAtual]].classList.add(
      "selected"
    );
  }

  atualizarProgresso();
  atualizarBotoes();
}

function atualizarProgresso() {
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === perguntaAtual);
  });
}

function atualizarBotoes() {
  // O botão de voltar estará sempre visível, mas só funciona se não for a primeira pergunta
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

function perguntaAnterior() {
  if (perguntaAtual > 0) {
    perguntaAtual--;
    mostrarPergunta();
  }
}

function finalizarQuiz() {
  if (respostas[perguntaAtual] === null) {
    alert("Por favor, selecione uma opção para finalizar.");
    return;
  }

  // Enviar as respostas para o backend para gerar o plano com IA
  fetch('http://localhost:3000/quiz/treino', { // <-- URL CORRETA PARA O QUIZ DE TREINO
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers: respostas } ), // Envia o array de respostas
  })
  .then(response => response.json())
  .then(data => {
    if (data.plan) {
      // Armazena o plano gerado pela IA no localStorage com a CHAVE CORRETA
      localStorage.setItem("generatedTreinoPlan", data.plan);
      // Redireciona para a página de resultados CORRETA
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

prevButton.addEventListener("click", perguntaAnterior);
nextButton.addEventListener("click", proximaPergunta);
finishButton.addEventListener("click", finalizarQuiz);

mostrarPergunta();
