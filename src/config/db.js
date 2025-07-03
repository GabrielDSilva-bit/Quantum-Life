// src/config/db.js

require('dotenv').config(); // Isso está correto aqui para carregar as variáveis de ambiente

const mysql = require('mysql2/promise'); // Importa a versão com Promise

// Criação do POOL de conexões MySQL com variáveis de ambiente
const pool = mysql.createPool({ // <--- MUDANÇA AQUI: use createPool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Garante que a porta padrão seja 3306 se não definida
  waitForConnections: true, // Se não houver conexões disponíveis, espera
  connectionLimit: 10,       // Limite máximo de conexões no pool
  queueLimit: 0              // Se 0, não há limite de fila para requisições pendentes
});

// Verificação da conexão do pool (com Promises)
pool.getConnection() // <--- MUDANÇA AQUI: use getConnection() para testar o pool
  .then(conn => {
    console.log('✅ Conectado ao banco de dados MySQL com sucesso.');
    conn.release(); // Libera a conexão de volta para o pool
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    // Em um ambiente de produção, você pode querer encerrar o processo aqui para evitar mais erros
    process.exit(1);
  });

module.exports = pool; // <--- MUDANÇA AQUI: exporte o pool