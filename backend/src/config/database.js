// ====================================================================================
//          CONFIGURAÇÃO DO BANCO DE DADOS - PROJETO MANGUES (ROBUSTO)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Versão 4.0. Esta versão lê o arquivo `database.sql` diretamente
// do sistema de arquivos e o executa, garantindo que o banco de dados
// seja sempre 100% fiel ao script SQL final e correto.
// ====================================================================================

import pkg from 'pg';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// Configuração do Pool de Conexões
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mangues',
  password: process.env.DB_PASSWORD || '17112007',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

pool.on('connect', () => console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida.'));
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

// Funções Auxiliares de Query
export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

// Função de Inicialização do Banco de Dados
export const initDatabase = async () => {
  console.log('🔧 Inicializando banco de dados a partir de database.sql...');
  const client = await pool.connect();
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const sqlFilePath = path.resolve(__dirname, '../../../database.sql');

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`CRITICAL: database.sql não encontrado em ${sqlFilePath}`);
    }
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    await client.query(sqlScript);
    console.log('✅ Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('❌ Erro fatal ao inicializar o banco de dados:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

export default pool;