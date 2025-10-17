import pkg from 'pg';
const { Pool } = pkg;

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mangues',
  password: '17112007',
  port: 5432,
  // Configurações adicionais para melhor performance
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err);
});

// Função auxiliar para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

// Função para obter um cliente do pool (para transações)
export const getClient = async () => {
  return await pool.connect();
};

// Inicializar tabelas do banco de dados
export const initDatabase = async () => {
  try {
    console.log('🔧 Inicializando banco de dados...');

    // Tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        apelido VARCHAR(50) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        avatar VARCHAR(10) DEFAULT '🦀',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_pontos INTEGER DEFAULT 0,
        visitas INTEGER DEFAULT 1
      )
    `);

    // Tabela de estatísticas de jogos
    await query(`
      CREATE TABLE IF NOT EXISTS estatisticas_jogos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo_jogo VARCHAR(20) NOT NULL,
        dificuldade VARCHAR(20),
        pontuacao INTEGER NOT NULL,
        data_jogo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completado BOOLEAN DEFAULT TRUE
      )
    `);

    // Tabela de conquistas
    await query(`
      CREATE TABLE IF NOT EXISTS conquistas (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        pontos INTEGER NOT NULL
      )
    `);

    // Tabela de conquistas dos usuários
    await query(`
      CREATE TABLE IF NOT EXISTS usuario_conquistas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        conquista_id VARCHAR(50) REFERENCES conquistas(id),
        data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, conquista_id)
      )
    `);

    // Tabela de espécies visualizadas
    await query(`
      CREATE TABLE IF NOT EXISTS especies_visualizadas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        especie_id INTEGER NOT NULL,
        data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, especie_id)
      )
    `);

    // Tabela de ameaças visualizadas
    await query(`
      CREATE TABLE IF NOT EXISTS ameacas_visualizadas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        ameaca_id INTEGER NOT NULL,
        data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, ameaca_id)
      )
    `);

    // Tabela de ações de ameaças completadas
    await query(`
      CREATE TABLE IF NOT EXISTS acoes_ameacas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        ameaca_id INTEGER NOT NULL,
        acao_index INTEGER NOT NULL,
        data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, ameaca_id, acao_index)
      )
    `);

    // Inserir conquistas padrão
    const conquistas = [
      { id: 'primeira_especie', nome: 'Explorador Iniciante', descricao: 'Visualizou sua primeira espécie', emoji: '🔍', pontos: 10 },
      { id: 'memoria_facil', nome: 'Memória Afiada', descricao: 'Completou o jogo da memória fácil', emoji: '🧠', pontos: 50 },
      { id: 'memoria_medio', nome: 'Mestre da Memória', descricao: 'Completou o jogo da memória médio', emoji: '🎯', pontos: 100 },
      { id: 'memoria_dificil', nome: 'Campeão da Memória', descricao: 'Completou o jogo da memória difícil', emoji: '👑', pontos: 200 },
      { id: 'conexoes_completas', nome: 'Conector Expert', descricao: 'Acertou todas as conexões perfeitamente', emoji: '⚡', pontos: 75 },
      { id: 'todas_especies', nome: 'Biólogo Júnior', descricao: 'Visualizou todas as espécies', emoji: '🌿', pontos: 150 },
      { id: 'todas_ameacas', nome: 'Guardião do Mangue', descricao: 'Conheceu todas as ameaças', emoji: '🛡️', pontos: 100 },
      { id: 'visitante_frequente', nome: 'Explorador Dedicado', descricao: 'Visitou o site 10 vezes', emoji: '🌟', pontos: 50 },
      { id: 'jogo_perfeito', nome: 'Perfeição Total', descricao: 'Completou um jogo com pontuação máxima', emoji: '💎', pontos: 300 },
      { id: 'maratonista', nome: 'Maratonista dos Jogos', descricao: 'Completou 20 jogos', emoji: '🏃', pontos: 250 },
    ];

    for (const conquista of conquistas) {
      await query(`
        INSERT INTO conquistas (id, nome, descricao, emoji, pontos)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE 
        SET nome = $2, descricao = $3, emoji = $4, pontos = $5
      `, [conquista.id, conquista.nome, conquista.descricao, conquista.emoji, conquista.pontos]);
    }

    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📊 Tabelas criadas: usuarios, estatisticas_jogos, conquistas, usuario_conquistas, especies_visualizadas, ameacas_visualizadas, acoes_ameacas');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export default pool;