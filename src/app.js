// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const db = require('./config/db'); // Caminho para db.js

// Middleware para servir arquivos estáticos (public/)
app.use(express.static(path.join(__dirname, 'public'))); // Assumindo que 'public' está na raiz do seu projeto

// Middleware para analisar corpos de requisição JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da sua aplicação (incluindo as rotas que servem HTML e as rotas POST para auth)
const homeRoutes = require('./routes/home.routes'); // Caminho para home.routes.js
app.use('/', homeRoutes); // Isso permitirá acessar /login-cadastro e as rotas POST /register e /login

// Teste de conexão com o banco
app.get('/config/db', (req, res) => {
    db.query('SELECT NOW() AS agora', (err, results) => {
        if (err) {
            console.error('Erro ao consultar o banco:', err);
            return res.status(500).send('Erro ao consultar o banco.');
        }
        res.send(`Conexão bem-sucedida! Horário do MySQL: ${results[0].agora}`);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});