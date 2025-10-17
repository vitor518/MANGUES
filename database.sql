-- ====================================================================================
--              SCRIPT COMPLETO DO BANCO DE DADOS - PROJETO MANGUES (v2.3 - FINAL)
-- ====================================================================================
-- Versão: 2.3 (Final com Hash)
-- Data: 2025-10-17
-- Descrição: Script completo fornecido pelo usuário, com todas as tabelas de
-- gamificação e a senha do usuário de teste devidamente hasheada com bcrypt.
-- ====================================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    apelido VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '🦀',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_pontos INTEGER DEFAULT 0,
    visitas INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS especies (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    habitat TEXT NOT NULL,
    imagem VARCHAR(10) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adaptacoes (
    id SERIAL PRIMARY KEY,
    especie_id INTEGER REFERENCES especies(id) ON DELETE CASCADE,
    adaptacao TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (especie_id, adaptacao)
);

CREATE TABLE IF NOT EXISTS ameacas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    impacto VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contatos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conquistas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    pontos INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario_conquistas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    conquista_id VARCHAR(50) REFERENCES conquistas(id),
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, conquista_id)
);

CREATE TABLE IF NOT EXISTS estatisticas_jogos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_jogo VARCHAR(20) NOT NULL,
    dificuldade VARCHAR(20),
    pontuacao INTEGER NOT NULL,
    data_jogo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completado BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS especies_visualizadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    especie_id INTEGER REFERENCES especies(id) ON DELETE CASCADE,
    data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, especie_id)
);

CREATE TABLE IF NOT EXISTS ameacas_visualizadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    ameaca_id INTEGER REFERENCES ameacas(id) ON DELETE CASCADE,
    data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, ameaca_id)
);

CREATE TABLE IF NOT EXISTS acoes_ameacas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    ameaca_id INTEGER REFERENCES ameacas(id) ON DELETE CASCADE,
    acao_index INTEGER NOT NULL,
    data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, ameaca_id, acao_index)
);

INSERT INTO usuarios (nome, apelido, senha) VALUES
('Usuário Teste', 'teste', '$2b$10$n0jMdAIiA.A5M55ZYDEPcedkxodFvztnC3D2Nipz3Q8aS7tD4H6/6') -- Senha 'teste123'
ON CONFLICT (apelido) DO NOTHING;

-- Views and other data can be added here as needed by the application logic.

DO $$
BEGIN
    RAISE NOTICE '✅ Script do banco de dados (v2.3 - secured) executado com sucesso!';
END $$;