require('dotenv').config(); // Esta deve ser a primeira linha do seu server.js


const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const OpenAI = require('openai'); // Importa o SDK da OpenAI

const app = express();
const port = process.env.PORT; // Define a porta do servidor, padrão é 3000

// --- Configuração da OpenAI API ---
// SUBSTITUA 'SUA_CHAVE_DE_API_OPENAI' PELA SUA CHAVE REAL DA OPENAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Vamos carregar de uma variável de ambiente
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // Isso é o padrão, mas é bom ser explícito
});
// --- Fim da Configuração da OpenAI API ---

// Middleware para permitir CORS
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Configuração da conexão com o banco de dados MySQL
const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
};

// --- Definição das Perguntas dos Quizzes (mantidas do seu frontend) ---
const quizQuestionsTreino = [
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

const quizQuestionsDieta = [
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
// --- Fim da Definição das Perguntas dos Quizzes ---


// Função para calcular o perfil (mantida para log no DB)
function calculateProfile(quizType, answers) {
    const profilesTreino = ["HIIT", "FORCA", "RESISTENCIA", "FUNCIONAL", "MENTE_CORPO"];
    const profilesDieta = ["LOW_CARB", "MEDITERRANEA", "EQUILIBRADA", "BEM_ESTAR", "VEGANA"];

    const profiles = quizType === 'treino' ? profilesTreino : profilesDieta;

    const count = new Array(profiles.length).fill(0);
    answers.forEach(answerIndex => {
        if (answerIndex !== undefined && answerIndex !== null) {
            count[answerIndex]++;
        }
    });

    let maxCount = -1;
    let winningProfileIndex = -1;

    for (let i = 0; i < count.length; i++) {
        if (count[i] > maxCount) {
            maxCount = count[i];
            winningProfileIndex = i;
        }
    }
    return profiles[winningProfileIndex];
}

// Rota para receber as respostas do quiz de treino e gerar o plano com IA
app.post('/quiz/treino', async (req, res) => {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: 'Respostas inválidas fornecidas.' });
    }

    try {
        let userPreferences = "";
        answers.forEach((answerIndex, qIndex) => {
            if (quizQuestionsTreino[qIndex] && quizQuestionsTreino[qIndex].opcoes[answerIndex]) {
                userPreferences += `Pergunta: "${quizQuestionsTreino[qIndex].pergunta}" Resposta: "${quizQuestionsTreino[qIndex].opcoes[answerIndex]}".\n`;
            }
        });

        const prompt = `Com base nas seguintes preferências de treino do usuário, gere um plano de treino detalhado para 7 dias. Inclua sugestões de exercícios, duração, intensidade e dias de descanso. O plano deve ser prático, seguro e alinhado com as preferências. Use um formato fácil de ler, com emojis e marcadores.

        Preferências do usuário:\n${userPreferences}

        Formato de saída desejado (exemplo para um dia):
        Plano de Treino (7 dias)
        💪 Segunda-feira: [Tipo de Treino], [Duração], [Exemplos de Exercícios]
        🏃 Terça-feira: [Tipo de Treino], [Duração], [Exemplos de Exercícios]
        🧘 Quarta-feira: [Dia de Descanso Ativo/Alongamento]
        
        Gere o plano completo para os 7 dias.`;

        // --- Chamada à API da OpenAI ---
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Modelo da OpenAI
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7, // Controla a criatividade da resposta (0.0 a 1.0)
            max_tokens: 1000, // Limite de tokens na resposta para evitar respostas muito longas
        });
        const generatedText = chatCompletion.choices[0].message.content;
        // --- Fim da Chamada à API da OpenAI ---

        const calculatedProfile = calculateProfile('treino', answers);
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO quiz_results (quiz_type, answers, calculated_profile, generated_content) VALUES (?, ?, ?, ?)',
            ['treino', JSON.stringify(answers), calculatedProfile, generatedText]
        );
        connection.end();

        res.status(200).json({
            message: 'Plano de treino gerado com sucesso!',
            plan: generatedText
        });

    } catch (error) {
        console.error('Erro ao gerar plano de treino com IA (OpenAI):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar plano de treino.', error: error.message });
    }
});

// Rota para receber as respostas do quiz de dieta e gerar o plano com IA
app.post('/quiz/dieta', async (req, res) => {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: 'Respostas inválidas fornecidas.' });
    }

    try {
        let userPreferences = "";
        answers.forEach((answerIndex, qIndex) => {
            if (quizQuestionsDieta[qIndex] && quizQuestionsDieta[qIndex].opcoes[answerIndex]) {
                userPreferences += `Pergunta: "${quizQuestionsDieta[qIndex].pergunta}" Resposta: "${quizQuestionsDieta[qIndex].opcoes[answerIndex]}".\n`;
            }
        });

        const prompt = `Com base nas seguintes preferências de dieta do usuário, gere um plano alimentar detalhado para 7 dias. Inclua café da manhã, almoço, lanche e jantar para cada dia. O plano deve ser prático, saudável e alinhado com as preferências. Use um formato fácil de ler, com emojis e marcadores.
        
        Preferências do usuário:\n${userPreferences}
        
        Formato de saída desejado (exemplo para um dia):
        Plano alimentar (7 dias)
        🥑 Segunda-feira
        ✅ Café da manhã: [Sugestão]
        ✅ Almoço: [Sugestão]
        ✅ Lanche: [Sugestão]
        ✅ Jantar: [Sugestão]
        
        Gere o plano completo para os 7 dias.`;

        // --- Chamada à API da OpenAI ---
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Modelo da OpenAI
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7, // Controla a criatividade da resposta (0.0 a 1.0)
            max_tokens: 1000, // Limite de tokens na resposta
        });
        const generatedText = chatCompletion.choices[0].message.content;
        // --- Fim da Chamada à API da OpenAI ---

        const calculatedProfile = calculateProfile('dieta', answers);
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO quiz_results (quiz_type, answers, calculated_profile, generated_content) VALUES (?, ?, ?, ?)',
            ['dieta', JSON.stringify(answers), calculatedProfile, generatedText]
        );
        connection.end();

        res.status(200).json({
            message: 'Plano de dieta gerado com sucesso!',
            plan: generatedText
        });

    } catch (error) {
        console.error('Erro ao gerar plano de dieta com IA (OpenAI):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar plano de dieta.', error: error.message });
    }
});

// As rotas GET /recommendations/treino/:profileName e /recommendations/dieta/:profileName
// não serão mais usadas para gerar o conteúdo dinâmico. Elas podem ser removidas
// ou adaptadas para buscar o 'generated_content' da tabela 'quiz_results' se você
// quiser permitir que usuários vejam planos gerados anteriormente.
// Por simplicidade, vou mantê-las, mas elas não serão chamadas pela nova lógica do frontend.
// Se você não for usá-las, pode removê-las para limpar o código.

// Rota para obter recomendações de treino por perfil (agora busca conteúdo pré-definido ou histórico)
app.get('/recommendations/treino/:profileName', async (req, res) => {
    const { profileName } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        res.status(404).json({ message: 'Esta rota não é mais usada para gerar conteúdo dinâmico. Use o quiz para gerar um novo plano.' });
        connection.end();
    } catch (error) {
        console.error('Erro ao buscar recomendação de treino:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para obter recomendações de dieta por perfil (agora busca conteúdo pré-definido ou histórico)
app.get('/recommendations/dieta/:profileName', async (req, res) => {
    const { profileName } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        res.status(404).json({ message: 'Esta rota não é mais usada para gerar conteúdo dinâmico. Use o quiz para gerar um novo plano.' });
        connection.end();
    } catch (error) {
        console.error('Erro ao buscar recomendação de dieta:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}` );
});
