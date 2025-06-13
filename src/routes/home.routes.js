// src/routes/home.routes.js
const express = require('express');
const path = require('path');
const authController = require('../controllers/authController'); // Verifique o caminho se o seu authController estiver em outro lugar

const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
    // Caminho correto para views:
    // __dirname (src/routes) -> ../ (src) -> views/home.html
    res.sendFile(path.join(__dirname, '../views/home.html')); // CORREÇÃO AQUI
});


// Rota para a página de login/cadastro
router.get('/login-cadastro', (req, res) => {
    // Caminho correto para views:
    // __dirname (src/routes) -> ../ (src) -> views/login-cadastro.html
    res.sendFile(path.join(__dirname, '../views/login-cadastro.html')); // CORREÇÃO AQUI
});

router.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/HTML/sobre.html'));
});

router.get('/dieta', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/HTML/dieta.html'));
});

router.get('/treinos', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/HTML/treinos.html'));
});

router.get('/calculo-imc', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/HTML/calculo-imc.html'));
});

// Rotas POST para registro e login que o frontend irá chamar
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
