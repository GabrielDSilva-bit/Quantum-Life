// src/controllers/authController.js

const bcrypt = require('bcryptjs'); // Certifique-se de que é 'bcryptjs' se você instalou essa versão
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Seu arquivo de conexão com o banco de dados

// --- REVERTA AQUI PARA USAR O .env ---
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error('ERRO FATAL NO AUTH CONTROLLER: JWT_SECRET não está definido! Verifique seu arquivo .env.');
    process.exit(1);
}
// --- FIM DA REVERSÃO ---

// Funções auxiliares de validação
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Assumindo que o CPF deve ter exatamente 11 números, sem pontos ou hífens para validação de entrada
function isValidCPF(cpf) {
    // Remove qualquer caractere que não seja dígito e verifica se tem 11 dígitos
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
}

// MODIFICADO: Validação de senha mais robusta
function isValidPassword(password) {
    // Pelo menos 8 caracteres
    if (password.length < 8) {
        return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
    }
    // Pelo menos 1 letra maiúscula
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'A senha deve conter pelo menos 1 letra maiúscula.' };
    }
    // Pelo menos 1 caractere especial (usando uma regex comum para caracteres especiais)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
        return { valid: false, message: 'A senha deve conter pelo menos 1 caractere especial.' };
    }
    return { valid: true };
}


// --- REGISTRO ---
exports.register = async (req, res) => {
    // Ajustado para não esperar 'username'
    const { email, cpf, password } = req.body;

    // Ajustado para não validar 'username'
    if (!email || !cpf || !password) {
        return res.status(400).json({ message: 'Email, CPF e senha são obrigatórios.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    if (!isValidCPF(cpf)) {
        return res.status(400).json({ message: 'CPF inválido. Deve conter exatamente 11 números.' });
    }

    // MODIFICADO: Chamada e tratamento da nova validação de senha
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    try {
        const [usersByCpf] = await db.query('SELECT * FROM users WHERE cpf = ?', [cpf]);
        if (usersByCpf.length > 0) {
            return res.status(409).json({ message: 'CPF já registrado.' });
        }

        const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (usersByEmail.length > 0) {
            return res.status(409).json({ message: 'Email já registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Ajustado para não inserir 'username'. Certifique-se de que a coluna 'username' foi removida do DB ou é NULLABLE.
        await db.query('INSERT INTO users (email, cpf, password) VALUES (?, ?, ?)', [email, cpf, hashedPassword]);

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar o usuário.' });
    }
};

// --- LOGIN COM TOKEN JWT ---
exports.login = async (req, res) => {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE cpf = ?', [cpf]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        // --- LOGS DE DEPURACÃO ADICIONADOS AQUI ---
        console.log('\n--- AUTH CONTROLLER: INICIANDO LOGIN ---');
        console.log('SECRET (primeiros 10 chars) para assinar token:', SECRET ? SECRET.substring(0, 10) + '...' : 'NÃO DEFINIDO');
        // --- FIM DOS LOGS DE DEPURACÃO ---

        // Geração do token JWT
        // Use user.id (ou user.userId se essa for a propriedade no seu banco)
        const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '2h' }); // Use userId para consistência com authMiddleware
        console.log('Token JWT GERADO:', token);

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: {
                id: user.id,
                email: user.email,
                cpf: user.cpf,
                // Removido username aqui também
            }
        });
        console.log('Usuário logado. Resposta enviada ao frontend.');
    } catch (error) {
        console.error('Erro ao logar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao logar.' });
    }
};

// --- RECUPERAÇÃO DE SENHA DESATIVADA ---
exports.forgotPassword = async (req, res) => {
    return res.status(503).json({ message: 'Funcionalidade de recuperação de senha temporariamente indisponível.' });
};

// --- REDEFINIÇÃO DE SENHA ---
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
            [token, Date.now()]
        );
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Token de redefinição de senha inválido ou expirado.' });
        }

        // MODIFICADO: Chamada e tratamento da nova validação de senha
        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Sua senha foi redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro em resetPassword:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao redefinir a senha.' });
    }
};