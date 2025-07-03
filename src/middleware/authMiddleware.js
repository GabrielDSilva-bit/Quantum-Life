const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    console.error('ERRO FATAL NO AUTH MIDDLEWARE: JWT_SECRET não está definido! Verifique seu arquivo .env.');
    process.exit(1);
}

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log('\n--- AUTH MIDDLEWARE INICIADO ---');
    console.log('Request URL:', req.originalUrl);
    console.log('Authorization Header RECEBIDO:', authHeader ? authHeader.substring(0, 50) + (authHeader.length > 50 ? '...' : '') : 'Nenhum');

    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    console.log('Token EXTRAÍDO:', token ? token.substring(0, 50) + (token.length > 50 ? '...' : '') : 'Nulo ou Vazio');

    if (!token) {
        // Se NÃO há token no cabeçalho:
        // Se é uma requisição GET para uma página HTML (ex: navegador acessando /perfil)
        if (req.method === 'GET' && req.accepts('html')) {
            console.log('Middleware: Token ausente no cabeçalho para GET HTML. Permitindo que a página HTML seja servida. O JS do frontend irá verificar o token no localStorage e buscar os dados.');
            // NÃO redirecione AQUI. Deixe a requisição prosseguir para a rota (/perfil)
            // para que a página HTML (Edição-de-perfil.html) seja carregada.
            // O JavaScript dentro de Edição-de-perfil.html (edicao-de-perfil.js)
            // será responsável por pegar o token do localStorage e fazer a requisição de dados.
            return next(); // <--- CHAVE: Permite que a requisição continue para a rota
        } else {
            // Para requisições que não são GET HTML (ex: requisições API via fetch sem token),
            // retorne 401.
            console.log('Middleware: Token ausente para API ou método não GET HTML. Retornando 401.');
            return res.status(401).send('Token de autenticação não fornecido.');
        }
    }

    // Se um token EXISTE no cabeçalho, tenta verificá-lo
    try {
        console.log('Middleware: Tentando verificar o token com SECRET (primeiros 10 chars):', SECRET.substring(0, 10) + '...');

        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.userId || decoded.id;
        console.log('Middleware: Token VALIDADO com sucesso para userId:', req.userId);
        next(); // Token válido, continua para a próxima função da rota
    } catch (err) {
        console.error('Middleware: Erro de autenticação do token:', err.message); // Log para depuração

        // Se o token existe, mas é inválido/expirado, e é uma requisição GET HTML, redireciona.
        // Isso ainda é válido: se o usuário *enviou* um token, mas ele é ruim, redirecione.
        if (req.method === 'GET' && req.accepts('html')) {
            console.log('Middleware: Token inválido/expirado, redirecionando para login-cadastro (GET HTML).');
            return res.redirect('/login-cadastro');
        }
        // Para requisições de API com token inválido, retorna o erro 403.
        console.log('Middleware: Token inválido/expirado, retornando 403 (API).');
        return res.status(403).send('Token de autenticação inválido ou expirado.');
    }
};