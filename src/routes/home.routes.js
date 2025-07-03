// src/routes/home.routes.js

const path = require("path");
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../config/db");

// <<< FUNÇÃO AUXILIAR PARA PARSE SEGURO DE JSON >>>
/**
 * Tenta fazer o parse de uma string JSON de forma segura.
 * Se o valor já for um objeto, retorna o próprio objeto.
 * Se o parse falhar, loga o erro e retorna o valor original (string).
 * @param {string|object} data O dado a ser processado.
 * @param {*} defaultValue O valor a ser retornado em caso de falha no parse.
 * @returns {object|string|null} O objeto processado ou o valor padrão.
 */
function parseJSONSafely(data, defaultValue = null) {
  // Se o dado não for uma string, provavelmente já é um objeto. Retorne-o.
  if (typeof data !== "string") {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    // Se o parse falhar, loga o erro e retorna um valor padrão ou a própria string.
    console.warn(
      `Falha ao fazer parse de JSON. Conteúdo: "${data.substring(0, 50)}..."`,
      e.message
    );
    return defaultValue !== null ? defaultValue : data;
  }
}

// --- Rotas GET para servir as páginas HTML ---
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home.html"));
});
router.get("/login-cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login-cadastro.html"));
});
router.get("/esqueceu-senha", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/esqueceu-a-senha.html"));
});
router.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/redifinezao-senha.html"));
});
router.get("/sobre", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/sobre.html"));
});
router.get("/dieta", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/QuizDiet1.html"));
});
router.get("/treinos", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/QuizTreino1.html"));
});
router.get("/imc", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/calculo-imc.html"));
});
router.get("/quiz-treino", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/QuizTreino1.html"));
});
// Rota para o resultado IMEDIATO do quiz de treino (mantida)
router.get("/resultado-treino", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/resultado-treino.html"));
});
// NOVA ROTA para o resultado de TREINO do HISTÓRICO
router.get("/historico-treino-detalhes", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/Resultado-historico-treino.html"));
});

router.get("/quiz-dieta", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/QuizDiet1.html"));
});
// Rota para o resultado IMEDIATO do quiz de dieta (mantida)
router.get("/resultado-dieta", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/Resultado-Dieta.html"));
});
// NOVA ROTA para o resultado de DIETA do HISTÓRICO (já existente)
router.get("/historico-dieta-detalhes", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/Resultado-historico-dieta.html"));
});

router.get("/alterar-senha", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/alterar-senha.html"));
});
router.get("/alterar-email", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/Alterar-email.html"));
});
router.get("/historico", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/Historico.html"));
});

router.get("/perfil", authMiddleware, async (req, res) => {
  const preferredType = req.accepts(["json", "html"]);

  if (preferredType === "json") {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ logado: false, message: "Usuário não autenticado." });
    }
    try {
      const [userRows] = await db.execute(
        "SELECT id, username, email, cpf FROM users WHERE id = ?",
        [userId]
      );
      if (userRows.length === 0) {
        return res
          .status(404)
          .json({ logado: false, message: "Usuário não encontrado." });
      }
      const user = userRows[0];

      // <<< MUDANÇA 2: SIMPLIFICAÇÃO DA ROTA /perfil >>>
      const [treinoRows] = await db.execute(
        `SELECT id, generated_content, calculated_profile FROM quiz_results WHERE user_id = ? AND quiz_type = "treino" ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      let treino_atual = null;
      if (treinoRows.length > 0) {
        treino_atual = {
          id: treinoRows[0].id,
          calculated_profile: treinoRows[0].calculated_profile,
          plano: parseJSONSafely(
            treinoRows[0].generated_content,
            treinoRows[0].generated_content
          ),
        };
      }

      const [dietaRows] = await db.execute(
        `SELECT id, generated_content, calculated_profile FROM quiz_results WHERE user_id = ? AND quiz_type = "dieta" ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      let dieta_atual = null;
      if (dietaRows.length > 0) {
        dieta_atual = {
          id: dietaRows[0].id,
          calculated_profile: dietaRows[0].calculated_profile,
          plano: parseJSONSafely(
            dietaRows[0].generated_content,
            dietaRows[0].generated_content
          ),
        };
      }

      return res.status(200).json({
        logado: true,
        usuario: {
          id: user.id,
          username: user.username,
          email: user.email,
          cpf: user.cpf,
          treino_atual: treino_atual,
          dieta_atual: dieta_atual,
        },
        message: "Dados do perfil carregados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({
        logado: false,
        message: "Erro interno do servidor ao buscar perfil.",
        error: error.message,
      });
    }
  } else {
    res.sendFile(path.join(__dirname, "../views/Edicao-de-perfil.html"));
  }
});

// --- Rotas POST ---
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

async function generatePlanWithAI(quizType, answers) {
  // ... (O conteúdo desta função permanece o mesmo)
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  let promptContent = "";
  const answersJson = JSON.stringify(answers);

  if (quizType === "dieta") {
    promptContent = `Com base nas seguintes respostas do quiz de dieta: ${answersJson}, gere um plano de dieta detalhado de 7 dias, incluindo café da manhã, almoço, lanche e jantar. O plano deve ser nutritivo, adaptado às preferências indicadas nas respostas e adequado para um humano.\n\n        *SIGA EXATAMENTE ESTE FORMATO, INCLUINDO TODOS OS EMOJIS E A FRASE FINAL. NÃO ADICIONE NENHUM TEXTO EXTRA OU INTRODUÇÃO ALÉM DO FORMATO FORNECIDO:*\n\n        Plano alimentar (7 dias)\n\n        [Emoji de fruta relevante para o dia, ex: 🥑] Dia 1:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🍏] Dia 2:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🍌] Dia 3:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🍇] Dia 4:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🍓] Dia 5:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🥥] Dia 6:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        [Emoji de fruta relevante para o dia, ex: 🍍] Dia 7:\n        ✅ Café da manhã: [Sugestão de refeição]\n        ✅ Almoço: [Sugestão de refeição]\n        ✅ Lanche: [Sugestão de refeição]\n        ✅ Jantar: [Sugestão de refeição]\n\n        Espero que goste do plano alimentar proposto! 😉`;
  } else if (quizType === "treino") {
    promptContent = `Com base nas seguintes respostas do quiz de treino: ${answersJson}, gere um plano de treino detalhado de 7 dias. O plano deve incluir diferentes tipos de exercícios (ex: cardio, força, flexibilidade) e ser adequado ao nível de experiência e objetivos indicados nas respostas.\n\n        *SIGA EXATAMENTE ESTE FORMATO, INCLUINDO TODOS OS EMOJIS E A FRASE FINAL. NÃO ADICIONE NENHUM TEXTO EXTRA OU INTRODUÇÃO ALÉM DO FORMATO FORNECIDO:*\n\n        Plano de Treino (7 dias)\n\n        💪 Dia 1:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🏋‍♀ Dia 2:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🏃‍♂ Dia 3:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🧘‍♀ Dia 4:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🤸‍♂ Dia 5:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🔥 Dia 6:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        🏆 Dia 7:\n        ✅ Aquecimento: [Sugestão de aquecimento]\n        ✅ Treino Principal: [Sugestão de treino]\n        ✅ Alongamento: [Sugestão de alongamento]\n\n        Bons treinos e alcance seus objetivos! 💪`;
  } else {
    throw new Error("Tipo de quiz inválido para geração de IA.");
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptContent }],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`[OpenAI Error]`, error);
    throw new Error(`Falha ao gerar plano com IA para ${quizType}.`);
  }
}

router.post("/salvar-quiz", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const { quiz_type, answers } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Usuário não autenticado. Não é possível salvar o quiz.",
    });
  }
  if (!quiz_type || !answers) {
    return res
      .status(400)
      .json({ message: "Tipo de quiz e respostas são obrigatórios." });
  }

  let aiGeneratedPlan =
    "Conteúdo gerado pela IA (placeholder - falha na geração)";
  let calculatedProfile = "TIPO_NAO_DEFINIDO";

  try {
    if (quiz_type === "dieta") {
      const respostaOrigemAnimalIndex = answers[2];
      switch (respostaOrigemAnimalIndex) {
        case 4:
          calculatedProfile = "VEGANA";
          break;
        case 0:
        case 3:
          calculatedProfile = "VEGETARIANA";
          break;
        case 1:
          calculatedProfile = "FLEXITARIANA";
          break;
        case 2:
          calculatedProfile = "ONIVORA";
          break;
        default:
          calculatedProfile = "DIETA_GERAL";
      }
    } else if (quiz_type === "treino") {
      const objetivoTreinoIndex = answers[0];
      switch (objetivoTreinoIndex) {
        case 0:
          calculatedProfile = "TREINO_CARDIO_EMAGRECIMENTO";
          break;
        case 1:
          calculatedProfile = "TREINO_FORCA_RESISTENCIA";
          break;
        case 2:
          calculatedProfile = "TREINO_CONDICIONAMENTO_GERAL";
          break;
        case 3:
          calculatedProfile = "TREINO_FUNCIONAL_FLEXIBILIDADE";
          break;
        case 4:
          calculatedProfile = "TREINO_BEM_ESTAR_FLEXIBILIDADE";
          break;
        default:
          calculatedProfile = "TREINO_GERAL";
      }
    }

    aiGeneratedPlan = await generatePlanWithAI(quiz_type, answers);
    const answersString = JSON.stringify(answers);
    const generatedContentToSave = aiGeneratedPlan;

    const [result] = await db.execute(
      "INSERT INTO quiz_results (quiz_type, answers, calculated_profile, generated_content, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [
        quiz_type,
        answersString,
        calculatedProfile,
        generatedContentToSave,
        userId,
      ]
    );

    res.status(201).json({
      message: "Resultado do quiz salvo com sucesso!",
      quiz_result_id: result.insertId,
      plan: aiGeneratedPlan,
      calculated_profile: calculatedProfile,
    });
  } catch (error) {
    console.error("Erro ao processar e salvar o quiz:", error);
    res.status(500).json({
      message: "Erro ao processar e salvar o quiz: " + error.message,
    });
  }
});

// <<< MUDANÇA 3: CORREÇÃO E ROBUSTEZ DA ROTA /meus-quizzes >>>
router.get("/meus-quizzes", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    const [results] = await db.execute(
      "SELECT id, quiz_type, answers, calculated_profile, generated_content, created_at FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    const quizzes = results.map((quiz) => ({
      ...quiz,
      // Usando a função auxiliar para os dois campos que podem ser JSON
      answers: parseJSONSafely(quiz.answers, []), // Retorna [] se o parse falhar
      generated_content: parseJSONSafely(
        quiz.generated_content,
        quiz.generated_content
      ), // Retorna a string original se falhar
    }));

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Erro na rota /meus-quizzes:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao buscar resultados." });
  }
});

// Rota para buscar um quiz específico por ID (usada pelo histórico)
router.get("/api/quiz/:id", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const quizId = req.params.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
        const [results] = await db.execute(
            "SELECT id, quiz_type, answers, calculated_profile, generated_content, created_at FROM quiz_results WHERE id = ? AND user_id = ?",
            [quizId, userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Quiz não encontrado ou você não tem permissão para acessá-lo." });
        }

        const quiz = results[0];
        let parsedAnswers = null;
        try {
            if (quiz.answers) {
                parsedAnswers = JSON.parse(quiz.answers);
            }
        } catch (e) {
            console.error(`Erro ao parsear 'answers' para quiz ID ${quiz.id}:`, e.message);
            parsedAnswers = null;
        }

        let parsedGeneratedContent = null;
        try {
            if (quiz.generated_content) {
                if (quiz.generated_content.startsWith("{") || quiz.generated_content.startsWith("[")) {
                    parsedGeneratedContent = JSON.parse(quiz.generated_content);
                } else {
                    parsedGeneratedContent = quiz.generated_content;
                }
            }
        } catch (e) {
            console.error(`Erro ao parsear 'generated_content' para quiz ID ${quiz.id}:`, e.message);
            parsedGeneratedContent = quiz.generated_content;
        }

        res.status(200).json({
            ...quiz,
            answers: parsedAnswers,
            generated_content: parsedGeneratedContent,
        });

    } catch (error) {
        console.error("Erro ao buscar quiz específico:", error);
        res.status(500).json({ message: "Erro ao buscar quiz específico." });
    }
});


// Rota para buscar o histórico de IMC
router.get("/meu-imc-historico", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    const [results] = await db.execute(
      "SELECT id, peso, altura, imc, categoria, created_at FROM imc_results WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar histórico de IMC:", error);
    res.status(500).json({ message: "Erro ao buscar histórico de IMC." });
  }
});

// Rota para salvar o IMC
router.post("/api/salvar-imc", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const { peso, altura, imc, categoria } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }
  if (
    !peso ||
    !altura ||
    !imc ||
    !categoria ||
    isNaN(peso) ||
    isNaN(altura) ||
    isNaN(imc) ||
    parseFloat(peso) <= 0 ||
    parseFloat(altura) <= 0
  ) {
    return res.status(400).json({
      message:
        "Dados de peso, altura, IMC e classificação válidos são obrigatórios.",
    });
  }

  const parsedPeso = parseFloat(peso);
  const parsedAltura = parseFloat(altura);
  const parsedImc = parseFloat(imc);

  try {
    const [result] = await db.execute(
      "INSERT INTO imc_results (user_id, peso, altura, imc, categoria, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, parsedPeso, parsedAltura, parsedImc.toFixed(2), categoria]
    );

    res.status(200).json({
      message: "IMC salvo com sucesso!",
      imc: parsedImc.toFixed(2),
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao salvar IMC no banco de dados:", error);
    res.status(500).json({
      message: "Erro interno do servidor ao salvar IMC.",
      error: error.message,
    });
  }
});

// Rota para alterar a senha
router.put("/api/alterar-senha", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Senha atual e nova senha são obrigatórias." });
  }
  if (
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||
    !/[#?!&.]/.test(newPassword)
  ) {
    return res.status(400).json({
      message:
        "A nova senha não atende aos requisitos de segurança (mínimo 8 caracteres, 1 maiúscula, 1 caractere especial #?!&.).",
    });
  }

  try {
    const [userRows] = await db.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const user = userRows[0];
    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      newHashedPassword,
      userId,
    ]);

    res.status(200).json({ message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao alterar senha." });
  }
});

// Rota para alterar o email
router.put("/api/alterar-email", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const userId = req.userId;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({ message: "Novo e-mail é obrigatório." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ message: "Formato de e-mail inválido." });
  }

  try {
    const [existingUserRows] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [newEmail, userId]
    );

    if (existingUserRows.length > 0) {
      return res
        .status(409)
        .json({ message: "Este e-mail já está em uso por outra conta." });
    }

    await db.execute("UPDATE users SET email = ? WHERE id = ?", [
      newEmail,
      userId,
    ]);

    res.status(200).json({ message: "E-mail alterado com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar e-mail:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao alterar e-mail." });
  }
});

// Rota para atualizar o perfil
router.put("/perfil/atualizar", authMiddleware, async (req, res) => {
  // ... (O conteúdo desta função permanece o mesmo)
  const userId = req.userId;
  const { username, email, cpf } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    await db.execute("UPDATE users SET username = ?, email = ? WHERE id = ?", [
      username,
      email,
      userId,
    ]);
    res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res
      .status(500)
      .json({ message: "Erro ao atualizar perfil.", error: error.message });
  }
});

// --- Rotas DELETE (Ordem corrigida) ---

// NOVO: Rotas DELETE para exclusão em massa
// Excluir todos os resultados de um tipo de quiz (dieta ou treino)
router.delete("/api/quiz/all/:type", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const quizType = req.params.type; // 'dieta' ou 'treino'

  if (!["dieta", "treino"].includes(quizType)) {
    return res.status(400).json({ message: "Tipo de quiz inválido." });
  }

  try {
    await db.execute(
      "DELETE FROM quiz_results WHERE user_id = ? AND quiz_type = ?",
      [userId, quizType]
    );
    res.status(200).json({
      message: `Todo o histórico de ${quizType} excluído com sucesso.`,
    });
  } catch (error) {
    console.error(`Erro ao excluir todo o histórico de ${quizType}:`, error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao excluir histórico." });
  }
});

// * IMPORTANTE: Esta rota deve vir ANTES de "/api/imc/:id" *
// Excluir todo o histórico de IMC
router.delete("/api/imc/all", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    await db.execute("DELETE FROM imc_results WHERE user_id = ?", [userId]);
    res
      .status(200)
      .json({ message: "Todo o histórico de IMC excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir todo o histórico de IMC:", error);
    res.status(500).json({
      message: "Erro interno do servidor ao excluir histórico de IMC.",
    });
  }
});

// Excluir um resultado de IMC (Esta rota agora vem DEPOIS da rota /api/imc/all)
router.delete("/api/imc/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const imcId = req.params.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM imc_results WHERE id = ? AND user_id = ?",
      [imcId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Resultado de IMC não encontrado ou você não tem permissão para excluí-lo.",
      });
    }
    res.status(200).json({ message: "Resultado de IMC excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir IMC:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao excluir IMC." });
  }
});


// Excluir um resultado de quiz individual
router.delete("/api/quiz/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const quizId = req.params.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM quiz_results WHERE id = ? AND user_id = ?",
      [quizId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Resultado de quiz não encontrado ou você não tem permissão para excluí-lo.",
      });
    }
    res
      .status(200)
      .json({ message: "Resultado de quiz excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir quiz:", error);
    res
      .status(500)
      .json({ message: "Erro interno do servidor ao excluir quiz." });
  }
});


module.exports = router;

