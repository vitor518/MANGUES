-- ====================================================================================
--              SCRIPT COMPLETO DO BANCO DE DADOS - PROJETO MANGUES (CORRIGIDO)
-- ====================================================================================
-- Versão: 2.2
-- Data: 2025-10-17
-- Correção: Adição de restrições UNIQUE para 'ON CONFLICT' e inclusão da tabela 'ameacas'.
-- ====================================================================================

-- ============================================
-- 1. TABELAS PRINCIPAIS
-- ============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '🦀',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_pontos INTEGER DEFAULT 0,
    visitas INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema, com pontuação e visitas.';
COMMENT ON COLUMN usuarios.senha_hash IS 'Senha criptografada com bcrypt.';

-- Tabela de espécies (CORRIGIDA: nome agora é UNIQUE para permitir ON CONFLICT)
CREATE TABLE IF NOT EXISTS especies (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE, -- CORREÇÃO APLICADA AQUI
    descricao TEXT NOT NULL,
    habitat TEXT NOT NULL,
    imagem VARCHAR(10) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE especies IS 'Espécies de animais e plantas do mangue.';

-- Tabela de adaptações das espécies (CORRIGIDA: adicionado UNIQUE(especie_id, adaptacao))
CREATE TABLE IF NOT EXISTS adaptacoes (
    id SERIAL PRIMARY KEY,
    especie_id INTEGER REFERENCES especies(id) ON DELETE CASCADE,
    adaptacao TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (especie_id, adaptacao) -- CORREÇÃO APLICADA AQUI
);

COMMENT ON TABLE adaptacoes IS 'Adaptações especiais de cada espécie.';

-- Tabela de ameaças ao ecossistema (TABELA ADICIONAL NECESSÁRIA)
CREATE TABLE IF NOT EXISTS ameacas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    impacto VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ameacas IS 'Lista de ameaças ao ecossistema do mangue.';

-- Tabela de contatos
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

COMMENT ON TABLE contatos IS 'Mensagens enviadas pelo formulário de contato.';

-- ============================================
-- 2. TABELAS DE GAMIFICAÇÃO
-- ============================================

-- Tabela de conquistas disponíveis no sistema
CREATE TABLE IF NOT EXISTS conquistas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    pontos INTEGER NOT NULL
);

COMMENT ON TABLE conquistas IS 'Catálogo de todas as conquistas possíveis no sistema.';

-- Tabela de conquistas desbloqueadas pelos usuários
CREATE TABLE IF NOT EXISTS usuario_conquistas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    conquista_id VARCHAR(50) REFERENCES conquistas(id),
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, conquista_id)
);

COMMENT ON TABLE usuario_conquistas IS 'Associa os usuários às conquistas que eles desbloquearam.';

-- Tabela de estatísticas de jogos
CREATE TABLE IF NOT EXISTS estatisticas_jogos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_jogo VARCHAR(20) NOT NULL, -- 'memoria', 'conexoes', etc.
    dificuldade VARCHAR(20), -- 'facil', 'medio', 'dificil'
    pontuacao INTEGER NOT NULL,
    data_jogo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completado BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE estatisticas_jogos IS 'Registra cada partida que um usuário joga.';

-- Tabela de espécies que o usuário já visualizou
CREATE TABLE IF NOT EXISTS especies_visualizadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    especie_id INTEGER REFERENCES especies(id) ON DELETE CASCADE,
    data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, especie_id)
);

COMMENT ON TABLE especies_visualizadas IS 'Diário de bordo das espécies que o usuário encontrou.';

-- Tabela de ameaças que o usuário já visualizou (CORRIGIDA: referência a tabela 'ameacas')
CREATE TABLE IF NOT EXISTS ameacas_visualizadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    ameaca_id INTEGER REFERENCES ameacas(id) ON DELETE CASCADE, -- CORREÇÃO APLICADA AQUI
    data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, ameaca_id)
);

COMMENT ON TABLE ameacas_visualizadas IS 'Registra as ameaças que o usuário já aprendeu.';

-- Tabela de ações contra ameaças que o usuário completou (CORRIGIDA: referência a tabela 'ameacas')
CREATE TABLE IF NOT EXISTS acoes_ameacas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    ameaca_id INTEGER REFERENCES ameacas(id) ON DELETE CASCADE, -- CORREÇÃO APLICADA AQUI
    acao_index INTEGER NOT NULL,
    data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, ameaca_id, acao_index)
);

COMMENT ON TABLE acoes_ameacas IS 'Registra as ações de mitigação de ameaças completadas pelo usuário.';

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_pontos ON usuarios(total_pontos DESC);
CREATE INDEX IF NOT EXISTS idx_especies_nome ON especies(nome);
CREATE INDEX IF NOT EXISTS idx_adaptacoes_especie ON adaptacoes(especie_id);
CREATE INDEX IF NOT EXISTS idx_contatos_usuario ON contatos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_stats_jogos_usuario ON estatisticas_jogos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_user_conquistas ON usuario_conquistas(usuario_id, conquista_id);
CREATE INDEX IF NOT EXISTS idx_ameacas_titulo ON ameacas(titulo); -- NOVO ÍNDICE

-- ============================================
-- 4. DADOS INICIAIS (SEMENTE)
-- ============================================

-- Inserir espécies de exemplo (usa ON CONFLICT (nome))
INSERT INTO especies (nome, descricao, habitat, imagem) VALUES
('Caranguejo-Uçá', 'O caranguejo-uçá é o rei dos mangues! Ele tem uma carapaça dura e garras fortes. Durante a lua cheia, fazem a "andada" para encontrar parceiros. São engenheiros do mangue, cavando túneis que ajudam a circular ar e água.', 'Vive em tocas no solo lamacento do mangue', '🦀'),
('Garça-Branca', 'Uma ave elegante com penas branquinhas. É uma pescadora expert, ficando super quieta e sendo rápida como um ninja para pegar peixes.', 'Encontrada nas margens e áreas rasas dos mangues', '🦆'),
('Mangue-Vermelho', 'Uma árvore especial com raízes que parecem pernas de aranha, segurando-a firme no solo. Funciona como um filtro natural, limpando a água.', 'Cresce diretamente na água salgada, nas bordas dos mangues', '🌳'),
('Guaiamum', 'Primo forte do caranguejo-uçá, com garras poderosas. Adora subir em árvores e é importante para espalhar sementes.', 'Vive tanto no solo quanto nas árvores do mangue', '🦞'),
('Tainha', 'Peixe prateado que nada em grupos e adora pular fora da água. Alimenta muitos outros animais do mangue.', 'Nada nas águas do mangue, perto da superfície', '🐟'),
('Mangue-Branco', 'Com folhas mais claras, vive um pouco mais longe da água. Suas raízes especiais ajudam a planta a respirar.', 'Cresce em áreas mais secas do mangue', '🌿')
ON CONFLICT (nome) DO NOTHING;

-- Inserir adaptações das espécies (usa ON CONFLICT DO NOTHING)
-- O ON CONFLICT agora funciona graças à restrição UNIQUE(especie_id, adaptacao)
INSERT INTO adaptacoes (especie_id, adaptacao) VALUES
((SELECT id FROM especies WHERE nome = 'Caranguejo-Uçá'), 'Brânquias modificadas para respirar fora da água'),
((SELECT id FROM especies WHERE nome = 'Caranguejo-Uçá'), 'Garras fortes para cavar buracos profundos'),
((SELECT id FROM especies WHERE nome = 'Caranguejo-Uçá'), 'Carapaça resistente contra predadores'),
((SELECT id FROM especies WHERE nome = 'Garça-Branca'), 'Bico longo e pontiagudo para pescar'),
((SELECT id FROM especies WHERE nome = 'Garça-Branca'), 'Pernas longas para andar na água rasa'),
((SELECT id FROM especies WHERE nome = 'Garça-Branca'), 'Visão aguçada para detectar peixes'),
((SELECT id FROM especies WHERE nome = 'Mangue-Vermelho'), 'Raízes aéreas para sustentação no solo mole'),
((SELECT id FROM especies WHERE nome = 'Mangue-Vermelho'), 'Folhas especiais que eliminam excesso de sal'),
((SELECT id FROM especies WHERE nome = 'Mangue-Vermelho'), 'Sementes que germinam ainda na árvore'),
((SELECT id FROM especies WHERE nome = 'Guaiamum'), 'Garras extremamente fortes'),
((SELECT id FROM especies WHERE nome = 'Guaiamum'), 'Habilidade de subir em árvores'),
((SELECT id FROM especies WHERE nome = 'Guaiamum'), 'Respiração adaptada para terra e água'),
((SELECT id FROM especies WHERE nome = 'Tainha'), 'Capacidade de pular fora da água'),
((SELECT id FROM especies WHERE nome = 'Tainha'), 'Nadadeiras potentes para nadar rápido'),
((SELECT id FROM especies WHERE nome = 'Tainha'), 'Sistema de navegação em grupo'),
((SELECT id FROM especies WHERE nome = 'Mangue-Branco'), 'Raízes respiratórias (pneumatóforos)'),
((SELECT id FROM especies WHERE nome = 'Mangue-Branco'), 'Tolerância a diferentes níveis de sal'),
((SELECT id FROM especies WHERE nome = 'Mangue-Branco'), 'Folhas que refletem luz solar excessiva')
ON CONFLICT DO NOTHING;

-- Inserir ameaças padrão (NOVO BLOCO DE DADOS INICIAIS)
INSERT INTO ameacas (titulo, descricao, impacto, emoji) VALUES
('Poluição por Plástico', 'Resíduos plásticos sufocam e prendem a fauna, além de liberar microplásticos na cadeia alimentar.', 'Morte de fauna, contaminação da cadeia alimentar.', '🗑️'),
('Desmatamento', 'Corte de árvores do mangue para construção ou agricultura, removendo o berçário da vida marinha.', 'Perda de habitat, erosão do solo, redução da biodiversidade.', '🔪'),
('Vazamento de Óleo', 'Derramamento de petróleo ou óleo que cobre as raízes e os animais, impedindo a respiração.', 'Asfixia da flora e fauna, destruição imediata do ecossistema.', '🛢️')
ON CONFLICT (titulo) DO NOTHING;

-- Inserir conquistas padrão do sistema (usa ON CONFLICT (id))
INSERT INTO conquistas (id, nome, descricao, emoji, pontos) VALUES
('primeira_especie', 'Explorador Iniciante', 'Visualizou sua primeira espécie', '🔍', 10),
('memoria_facil', 'Memória Afiada', 'Completou o jogo da memória fácil', '🧠', 50),
('memoria_medio', 'Mestre da Memória', 'Completou o jogo da memória médio', '🎯', 100),
('memoria_dificil', 'Campeão da Memória', 'Completou o jogo da memória difícil', '👑', 200),
('conexoes_completas', 'Conector Expert', 'Acertou todas as conexões perfeitamente', '⚡', 75),
('todas_especies', 'Biólogo Júnior', 'Visualizou todas as espécies', '🌿', 150),
('todas_ameacas', 'Guardião do Mangue', 'Conheceu todas as ameaças', '🛡️', 100),
('visitante_frequente', 'Explorador Dedicado', 'Visitou o site 10 vezes', '🌟', 50),
('jogo_perfeito', 'Perfeição Total', 'Completou um jogo com pontuação máxima', '💎', 300),
('maratonista', 'Maratonista dos Jogos', 'Completou 20 jogos', '🏃', 250)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    emoji = EXCLUDED.emoji,
    pontos = EXCLUDED.pontos;

-- Criar usuário de teste para desenvolvimento (senha: teste123)
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Usuário Teste', 'teste@exemplo.com', '$2b$10$XqJy7LqKZQr5JXI.nKmU0.3XHzXZYMvVWPQHVm5l6xPPqJXZQfJQW')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar o campo 'atualizado_em' automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para a tabela 'especies'
DROP TRIGGER IF EXISTS trigger_especies_timestamp ON especies;
CREATE TRIGGER trigger_especies_timestamp
BEFORE UPDATE ON especies
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- ============================================
-- 6. VIEWS (VISUALIZAÇÕES ÚTEIS)
-- ============================================

-- View para listar espécies com suas adaptações
CREATE OR REPLACE VIEW v_especies_completas AS
SELECT
    e.id,
    e.nome,
    e.descricao,
    e.habitat,
    e.imagem,
    array_agg(a.adaptacao ORDER BY a.id) as adaptacoes
FROM especies e
LEFT JOIN adaptacoes a ON e.id = a.especie_id
GROUP BY e.id
ORDER BY e.nome;

-- View para estatísticas gerais de usuários
CREATE OR REPLACE VIEW v_estatisticas_usuarios AS
SELECT
    COUNT(*) as total_usuarios,
    COUNT(*) FILTER (WHERE ativo = true) as usuarios_ativos,
    COUNT(*) FILTER (WHERE ultimo_acesso > NOW() - INTERVAL '30 days') as usuarios_ativos_mes,
    SUM(total_pontos) as soma_total_pontos,
    AVG(total_pontos) as media_pontos_por_usuario
FROM usuarios;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Script do banco de dados (v2.2) executado com sucesso!';
    RAISE NOTICE '🔧 Restrições UNIQUE adicionadas e tabela ameacas criada.';
    RAISE NOTICE '👤 Usuário de teste criado -> Email: teste@exemplo.com | Senha: teste123';
    RAISE NOTICE '🚀 O sistema está pronto para registrar e exibir a pontuação dos usuários.';
END $$;