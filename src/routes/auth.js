import express from 'express';
const router = express.Router();
import { query, getClient } from '../config/database.js';

// Avatares disponíveis
const avatarsDisponiveis = [
  '🦀', '🦢', '🌳', '🐋', '🦩', '🐦', '🦪', '🦐', '🌿', '🐬', '🐤', '🐙', '🐊', '🦋', '🐟'
];

// POST /api/auth/cadastro - Criar nova conta
router.post('/auth/cadastro', async (req, res) => {
  try {
    const { nome, apelido, senha, avatar } = req.body;
    
    // Validações básicas
    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Nome deve ter pelo menos 2 caracteres' 
      });
    }
    
    if (!apelido || apelido.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Apelido deve ter pelo menos 3 caracteres' 
      });
    }
    
    if (!senha || senha.length < 4) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 4 caracteres' 
      });
    }
    
    // Verificar se apelido já existe
    const usuarioExistente = await query(
      'SELECT id FROM usuarios WHERE LOWER(apelido) = LOWER($1)',
      [apelido.trim()]
    );
    
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Este apelido já está sendo usado. Escolha outro!' 
      });
    }
    
    // Criar usuário
    const resultado = await query(
      `INSERT INTO usuarios (nome, apelido, senha, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, apelido, avatar, data_criacao, ultimo_acesso, total_pontos, visitas`,
      [nome.trim(), apelido.trim(), senha, avatar || '🦀']
    );
    
    const novoUsuario = resultado.rows[0];
    
    res.status(201).json({
      message: 'Conta criada com sucesso! Bem-vindo ao Mundo dos Mangues! 🌿',
      usuario: novoUsuario
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// POST /api/auth/login - Fazer login
router.post('/auth/login', async (req, res) => {
  try {
    const { apelido, senha } = req.body;
    
    if (!apelido || !senha) {
      return res.status(400).json({ 
        error: 'Apelido e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário
    const resultado = await query(
      'SELECT * FROM usuarios WHERE LOWER(apelido) = LOWER($1)',
      [apelido]
    );
    
    if (resultado.rows.length === 0 || resultado.rows[0].senha !== senha) {
      return res.status(401).json({ 
        error: 'Apelido ou senha incorretos' 
      });
    }
    
    const usuario = resultado.rows[0];
    
    // Incrementar visitas e atualizar último acesso
    await query(
      `UPDATE usuarios 
       SET visitas = visitas + 1, ultimo_acesso = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [usuario.id]
    );
    
    // Verificar conquista de visitante frequente
    if (usuario.visitas + 1 >= 10) {
      await verificarEAdicionarConquista(usuario.id, 'visitante_frequente');
    }
    
    // Buscar dados completos do perfil
    const perfilCompleto = await obterPerfilCompleto(usuario.id);
    
    res.json({
      message: 'Bem-vindo de volta! 🎉',
      usuario: perfilCompleto
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /api/auth/perfil/:id - Buscar perfil completo do usuário
router.get('/auth/perfil/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const perfil = await obterPerfilCompleto(id);
    
    if (!perfil) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(perfil);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// PUT /api/auth/perfil/:id - Atualizar perfil
router.put('/auth/perfil/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, avatar } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (nome && nome.trim().length >= 2) {
      updates.push(`nome = $${paramCount++}`);
      values.push(nome.trim());
    }
    
    if (avatar && avatarsDisponiveis.includes(avatar)) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(avatar);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado válido para atualizar' });
    }
    
    values.push(id);
    
    await query(
      `UPDATE usuarios SET ${updates.join(', ')}, ultimo_acesso = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount}`,
      values
    );
    
    const perfilAtualizado = await obterPerfilCompleto(id);
    
    res.json({
      message: 'Perfil atualizado com sucesso! ✨',
      usuario: perfilAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// POST /api/auth/registro-acao - Registrar ações do usuário
router.post('/auth/registro-acao', async (req, res) => {
  try {
    const { usuarioId, tipo, dados } = req.body;
    
    if (!usuarioId || !tipo) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    let mensagem = 'Ação registrada!';
    
    switch (tipo) {
      case 'especie_vista':
        await registrarEspecieVista(usuarioId, dados.especieId);
        mensagem = 'Espécie adicionada ao seu diário! 📖';
        break;
        
      case 'ameaca_vista':
        await registrarAmeacaVista(usuarioId, dados.ameacaId);
        mensagem = 'Você aprendeu sobre uma nova ameaça! 🛡️';
        break;
        
      case 'jogo_completado':
        await registrarJogoCompletado(
          usuarioId,
          dados.tipoJogo,
          dados.dificuldade,
          dados.pontuacao
        );
        mensagem = 'Jogo registrado! Continue assim! 🎮';
        break;
        
      case 'acao_ameaca':
        await registrarAcaoAmeaca(usuarioId, dados.ameacaId, dados.acaoIndex);
        mensagem = 'Ação heroica completa! Você está ajudando os mangues! 💚';
        break;
        
      default:
        return res.status(400).json({ error: 'Tipo de ação inválido' });
    }
    
    const perfilAtualizado = await obterPerfilCompleto(usuarioId);
    
    res.json({
      message: mensagem,
      usuario: perfilAtualizado
    });
  } catch (error) {
    console.error('Erro ao registrar ação:', error);
    res.status(500).json({ error: 'Erro ao registrar ação' });
  }
});

// GET /api/auth/conquistas - Listar todas as conquistas
router.get('/auth/conquistas', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM conquistas ORDER BY pontos DESC');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

// GET /api/auth/avatars - Listar avatares disponíveis
router.get('/auth/avatars', (req, res) => {
  try {
    res.json(avatarsDisponiveis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar avatares' });
  }
});

// GET /api/auth/ranking - Ranking de usuários
router.get('/auth/ranking', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    
    const resultado = await query(
      `SELECT 
        id, nome, apelido, avatar, total_pontos,
        (SELECT COUNT(*) FROM usuario_conquistas WHERE usuario_id = usuarios.id) as total_conquistas,
        (SELECT COUNT(*) FROM estatisticas_jogos WHERE usuario_id = usuarios.id) as total_jogos
       FROM usuarios
       ORDER BY total_pontos DESC, total_conquistas DESC
       LIMIT $1`,
      [limite]
    );
    
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// === FUNÇÕES AUXILIARES ===

// Obter perfil completo com estatísticas
async function obterPerfilCompleto(usuarioId) {
  const usuario = await query(
    'SELECT id, nome, apelido, avatar, data_criacao, ultimo_acesso, total_pontos, visitas FROM usuarios WHERE id = $1',
    [usuarioId]
  );
  
  if (usuario.rows.length === 0) return null;
  
  // Buscar conquistas
  const conquistas = await query(
    `SELECT c.* FROM conquistas c
     INNER JOIN usuario_conquistas uc ON c.id = uc.conquista_id
     WHERE uc.usuario_id = $1
     ORDER BY uc.data_conquista DESC`,
    [usuarioId]
  );
  
  // Buscar espécies visualizadas
  const especies = await query(
    'SELECT especie_id FROM especies_visualizadas WHERE usuario_id = $1',
    [usuarioId]
  );
  
  // Buscar ameaças visualizadas
  const ameacas = await query(
    'SELECT ameaca_id FROM ameacas_visualizadas WHERE usuario_id = $1',
    [usuarioId]
  );
  
  // Buscar estatísticas de jogos
  const jogosMemoria = await query(
    `SELECT dificuldade, MAX(pontuacao) as melhor_pontuacao, COUNT(*) as jogos_completos
     FROM estatisticas_jogos
     WHERE usuario_id = $1 AND tipo_jogo = 'memoria' AND completado = TRUE
     GROUP BY dificuldade`,
    [usuarioId]
  );
  
  const jogosConexoes = await query(
    `SELECT MAX(pontuacao) as melhor_pontuacao, COUNT(*) as jogos_completos
     FROM estatisticas_jogos
     WHERE usuario_id = $1 AND tipo_jogo = 'conexoes' AND completado = TRUE`,
    [usuarioId]
  );
  
  // Buscar ações de ameaças completadas
  const acoesAmeacas = await query(
    'SELECT ameaca_id, acao_index FROM acoes_ameacas WHERE usuario_id = $1',
    [usuarioId]
  );
  
  // Montar estatísticas de memória
  const memoriaStats = {
    facil: { melhor_pontuacao: 0, jogos_completos: 0 },
    medio: { melhor_pontuacao: 0, jogos_completos: 0 },
    dificil: { melhor_pontuacao: 0, jogos_completos: 0 }
  };
  
  jogosMemoria.rows.forEach(row => {
    memoriaStats[row.dificuldade] = {
      melhor_pontuacao: row.melhor_pontuacao,
      jogos_completos: parseInt(row.jogos_completos)
    };
  });
  
  return {
    ...usuario.rows[0],
    conquistas: conquistas.rows,
    estatisticas: {
      especies_visualizadas: especies.rows.map(r => r.especie_id),
      ameacas_visualizadas: ameacas.rows.map(r => r.ameaca_id),
      acoes_ameacas: acoesAmeacas.rows,
      jogos: {
        memoria: memoriaStats,
        conexoes: {
          melhor_pontuacao: jogosConexoes.rows[0]?.melhor_pontuacao || 0,
          jogos_completos: parseInt(jogosConexoes.rows[0]?.jogos_completos || 0)
        }
      }
    }
  };
}

// Verificar e adicionar conquista
async function verificarEAdicionarConquista(usuarioId, conquistaId) {
  try {
    // Verificar se já tem a conquista
    const jaTemConquista = await query(
      'SELECT id FROM usuario_conquistas WHERE usuario_id = $1 AND conquista_id = $2',
      [usuarioId, conquistaId]
    );
    
    if (jaTemConquista.rows.length > 0) {
      return false;
    }
    
    // Buscar pontos da conquista
    const conquista = await query(
      'SELECT pontos FROM conquistas WHERE id = $1',
      [conquistaId]
    );
    
    if (conquista.rows.length === 0) {
      return false;
    }
    
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Adicionar conquista
      await client.query(
        'INSERT INTO usuario_conquistas (usuario_id, conquista_id) VALUES ($1, $2)',
        [usuarioId, conquistaId]
      );
      
      // Atualizar pontos
      await client.query(
        'UPDATE usuarios SET total_pontos = total_pontos + $1 WHERE id = $2',
        [conquista.rows[0].pontos, usuarioId]
      );
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao adicionar conquista:', error);
    return false;
  }
}

// Registrar espécie visualizada
async function registrarEspecieVista(usuarioId, especieId) {
  try {
    await query(
      'INSERT INTO especies_visualizadas (usuario_id, especie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [usuarioId, especieId]
    );
    
    const total = await query(
      'SELECT COUNT(*) as total FROM especies_visualizadas WHERE usuario_id = $1',
      [usuarioId]
    );
    
    const totalEspecies = parseInt(total.rows[0].total);
    
    if (totalEspecies === 1) {
      await verificarEAdicionarConquista(usuarioId, 'primeira_especie');
    } else if (totalEspecies >= 15) {
      await verificarEAdicionarConquista(usuarioId, 'todas_especies');
    }
  } catch (error) {
    console.error('Erro ao registrar espécie:', error);
  }
}

// Registrar ameaça visualizada
async function registrarAmeacaVista(usuarioId, ameacaId) {
  try {
    await query(
      'INSERT INTO ameacas_visualizadas (usuario_id, ameaca_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [usuarioId, ameacaId]
    );
    
    const total = await query(
      'SELECT COUNT(*) as total FROM ameacas_visualizadas WHERE usuario_id = $1',
      [usuarioId]
    );
    
    if (parseInt(total.rows[0].total) >= 8) {
      await verificarEAdicionarConquista(usuarioId, 'todas_ameacas');
    }
  } catch (error) {
    console.error('Erro ao registrar ameaça:', error);
  }
}

// Registrar jogo completado
async function registrarJogoCompletado(usuarioId, tipoJogo, dificuldade, pontuacao) {
  try {
    await query(
      'INSERT INTO estatisticas_jogos (usuario_id, tipo_jogo, dificuldade, pontuacao) VALUES ($1, $2, $3, $4)',
      [usuarioId, tipoJogo, dificuldade, pontuacao]
    );
    
    // Verificar conquistas
    if (tipoJogo === 'memoria') {
      const jogos = await query(
        'SELECT COUNT(*) as total FROM estatisticas_jogos WHERE usuario_id = $1 AND tipo_jogo = $2 AND dificuldade = $3',
        [usuarioId, 'memoria', dificuldade]
      );
      
      if (parseInt(jogos.rows[0].total) === 1) {
        if (dificuldade === 'facil') await verificarEAdicionarConquista(usuarioId, 'memoria_facil');
        if (dificuldade === 'medio') await verificarEAdicionarConquista(usuarioId, 'memoria_medio');
        if (dificuldade === 'dificil') await verificarEAdicionarConquista(usuarioId, 'memoria_dificil');
      }
    } else if (tipoJogo === 'conexoes') {
      if (pontuacao >= 600) {
        await verificarEAdicionarConquista(usuarioId, 'conexoes_completas');
      }
    }
    
    // Conquista de jogo perfeito
    if (pontuacao >= 1000) {
      await verificarEAdicionarConquista(usuarioId, 'jogo_perfeito');
    }
    
    // Conquista de maratonista
    const totalJogos = await query(
      'SELECT COUNT(*) as total FROM estatisticas_jogos WHERE usuario_id = $1',
      [usuarioId]
    );
    
    if (parseInt(totalJogos.rows[0].total) >= 20) {
      await verificarEAdicionarConquista(usuarioId, 'maratonista');
    }
  } catch (error) {
    console.error('Erro ao registrar jogo:', error);
  }
}

// Registrar ação de ameaça completada
async function registrarAcaoAmeaca(usuarioId, ameacaId, acaoIndex) {
  try {
    await query(
      'INSERT INTO acoes_ameacas (usuario_id, ameaca_id, acao_index) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [usuarioId, ameacaId, acaoIndex]
    );
  } catch (error) {
    console.error('Erro ao registrar ação de ameaça:', error);
  }
}

export default router;