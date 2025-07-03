// src/models/user.js
const db = require('../config/db'); // Caminho atualizado para 'config/db'
const bcrypt = require('bcrypt');

const User = {
    // Encontrar um usuário por CPF para login
    findByCpf: (cpf, callback) => { // Alterado para findByCpf
        const query = 'SELECT * FROM users WHERE cpf = ?'; // Busca pelo CPF
        db.query(query, [cpf], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]); // Retorna o primeiro usuário encontrado (ou undefined)
        });
    },

    // Encontrar um usuário por email para verificar duplicidade no cadastro
    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },

    // Criar um novo usuário com email, cpf e senha
    create: (email, cpf, password, callback) => { // Adicionado email e cpf
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);

            // Inserindo email, cpf e senha hashada
            const query = 'INSERT INTO users (email, cpf, password) VALUES (?, ?, ?)';
            db.query(query, [email, cpf, hashedPassword], (err, result) => {
                if (err) return callback(err);
                callback(null, { id: result.insertId, email: email, cpf: cpf });
            });
        });
    },

    // Comparar uma senha em texto simples com uma senha hash
    comparePassword: (plainPassword, hashedPassword, callback) => {
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) return callback(err);
            callback(null, isMatch);
        });
    }
};

module.exports = User;