// server.js (seu app.js)
require('dotenv').config(); // Deve ser a primeira linha

// Adicione este console.log para verificar o carregamento do JWT_SECRET no app.js
console.log('--- APP.JS: JWT_SECRET (do .env) carregado:', process.env.JWT_SECRET ? 'SIM' : 'NÃO');
console.log('APP.JS: Primeiros 10 caracteres do JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'N/A');

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// --- Configuração da OpenAI ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Configuração do Banco de Dados (usado para novas conexões pontuais) ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Importação de Rotas e Middlewares ---
const homeRoutes = require('./routes/home.routes');
const authMiddleware = require('./middleware/authMiddleware'); // Importe o authMiddleware

// --- O 'db' que você usa nas rotas homeRoutes (pool de conexão) ---
const db = require('./config/db'); // Esta importação está correta

// --- Aplicação das Rotas ---
app.use('/', homeRoutes); // Suas rotas do home.routes.js continuam funcionando aqui

// --- Teste de Conexão com o Banco (usando o pool 'db') ---
app.get('/config/db', (req, res) => {
    db.query('SELECT NOW() AS agora', (err, results) => {
        if (err) {
            console.error('Erro ao consultar o banco:', err);
            return res.status(500).send('Erro ao consultar o banco.');
        }
        res.send(`Conexão bem-sucedida! Horário do MySQL: ${results[0].agora}`);
    });
});

// --- Perguntas dos Quizzes (mantidas) ---
const quizQuestionsTreino = [ /* ... suas perguntas de treino ... */ ];
const quizQuestionsDieta = [ /* ... suas perguntas de dieta ... */ ];

// Função para calcular o perfil (mantida)
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
app.post('/quiz/treino', authMiddleware, async (req, res) => {
    const { answers } = req.body;
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado. Faça login para gerar um plano.' });
    }
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
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000,
        });
        const generatedText = chatCompletion.choices[0].message.content;
        // --- Fim da Chamada à API da OpenAI ---

        const calculatedProfile = calculateProfile('treino', answers);
        await db.execute(
            'INSERT INTO quiz_results (quiz_type, answers, calculated_profile, generated_content, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            ['treino', JSON.stringify(answers), calculatedProfile, generatedText, userId]
        );

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
app.post('/quiz/dieta', authMiddleware, async (req, res) => {
    const { answers } = req.body;
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado. Faça login para gerar um plano.' });
    }
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
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000,
        });
        const generatedText = chatCompletion.choices[0].message.content;
        // --- Fim da Chamada à API da OpenAI ---

        const calculatedProfile = calculateProfile('dieta', answers);
        await db.execute(
            'INSERT INTO quiz_results (quiz_type, answers, calculated_profile, generated_content, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            ['dieta', JSON.stringify(answers), calculatedProfile, generatedText, userId]
        );

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
// Por simplicidade, vou mantê-las, mas elas não serão chamadas pela nova lógica do frontend.
app.get('/recommendations/treino/:profileName', async (req, res) => {
    const { profileName } = req.params;
    res.status(404).json({ message: 'Esta rota não é mais usada para gerar conteúdo dinâmico. Use o quiz para gerar um novo plano.' });
});

app.get('/recommendations/dieta/:profileName', async (req, res) => {
    const { profileName } = req.params;
    res.status(404).json({ message: 'Esta rota não é mais usada para gerar conteúdo dinâmico. Use o quiz para gerar um novo plano.' });
});


// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});