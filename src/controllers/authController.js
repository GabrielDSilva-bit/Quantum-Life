// src/controllers/authController.js
require('dotenv').config();
const User = require('../models/user');
// Não precisamos mais de path aqui se não estamos renderizando a página HTML
// const path = require('path');

const authController = {
    // Lidar com o registro de usuário
    register: (req, res) => {
        const { email, cpf, password } = req.body; // Agora esperando email, cpf e password

        if (!email || !cpf || !password) {
            return res.status(400).send('Email, CPF e senha são obrigatórios.');
        }

        // 1. Verificar se o CPF já existe
        User.findByCpf(cpf, (err, userByCpf) => {
            if (err) {
                console.error('Erro ao encontrar usuário por CPF durante o registro:', err);
                return res.status(500).send('Erro interno do servidor.');
            }
            if (userByCpf) {
                return res.status(409).send('CPF já registrado.');
            }

            // 2. Verificar se o Email já existe
            User.findByEmail(email, (err, userByEmail) => {
                if (err) {
                    console.error('Erro ao encontrar usuário por Email durante o registro:', err);
                    return res.status(500).send('Erro interno do servidor.');
                }
                if (userByEmail) {
                    return res.status(409).send('Email já registrado.');
                }

                // Se nem CPF nem Email existem, criar o novo usuário
                User.create(email, cpf, password, (err, newUser) => {
                    if (err) {
                        console.error('Erro ao criar usuário:', err);
                        // Mensagens mais específicas podem ajudar na depuração
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).send('O CPF ou Email já está em uso.');
                        }
                        return res.status(500).send('Erro ao registrar o usuário.');
                    }
                    res.status(201).send('Usuário registrado com sucesso!');
                });
            });
        });
    },

    // Lidar com o login de usuário (usando CPF)
    login: (req, res) => {
        const { cpf, password } = req.body; // Agora esperando cpf e password

        if (!cpf || !password) {
            return res.status(400).send('CPF e senha são obrigatórios.');
        }

        User.findByCpf(cpf, (err, user) => { // Busca o usuário pelo CPF
            if (err) {
                console.error('Erro ao encontrar usuário durante o login:', err);
                return res.status(500).send('Erro interno do servidor.');
            }
            if (!user) {
                return res.status(401).send('CPF ou senha inválidos.'); // Mensagem genérica por segurança
            }

            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Erro ao comparar senha:', err);
                    return res.status(500).send('Erro interno do servidor.');
                }
                if (isMatch) {
                    // Em uma aplicação real, você geraria uma sessão ou JWT aqui
                    res.status(200).send('Login bem-sucedido!');
                } else {
                    res.status(401).send('CPF ou senha inválidos.'); // Mensagem genérica por segurança
                }
            });
        });
    }
};

module.exports = authController;