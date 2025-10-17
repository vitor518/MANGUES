// ====================================================================================
//          ROTA DE AUTENTICAÇÃO E PERFIL - (FINAL, SECURE & FULL-FEATURED)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Versão final que integra `bcrypt` e `jsonwebtoken` na lógica
// de gamificação completa original do usuário, mantendo todas as features.
// ====================================================================================

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../config/database.js';

const router = express.Router();
const saltRounds = 10;
const avatarsDisponiveis = ['🦀', '🦢', '🌳', '🐋', '🦩', '🐦', '🦪', '🦐', '🌿', '🐬', '🐤', '🐙', '🐊', '🦋', '🐟'];

// --- Middleware de Verificação de Token ---
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.usuario = decoded; // Salva { id, apelido }
    next();
  });
};

// --- Rotas de Autenticação (Públicas) ---

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, apelido, senha, avatar } = req.body;
    if (!nome || !apelido || !senha) return res.status(400).json({ error: 'Nome, apelido e senha são obrigatórios.' });
    if (senha.length < 4) return res.status(400).json({ error: 'Senha deve ter no mínimo 4 caracteres.' });

    const usuarioExistente = await query('SELECT id FROM usuarios WHERE LOWER(apelido) = LOWER($1)', [apelido.trim()]);
    if (usuarioExistente.rowCount > 0) return res.status(409).json({ error: 'Este apelido já está em uso.' });

    const senhaHash = await bcrypt.hash(senha, saltRounds);
    const resultado = await query(
      'INSERT INTO usuarios (nome, apelido, senha, avatar) VALUES ($1, $2, $3, $4) RETURNING id, nome, apelido, avatar',
      [nome.trim(), apelido.trim(), senhaHash, avatar || '🦀']
    );
    const novoUsuario = resultado.rows[0];
    const token = jwt.sign({ id: novoUsuario.id, apelido: novoUsuario.apelido }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Conta criada com sucesso!', token, usuario: novoUsuario });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao criar conta.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { apelido, senha } = req.body;
    if (!apelido || !senha) return res.status(400).json({ error: 'Apelido e senha são obrigatórios.' });

    const resultado = await query('SELECT * FROM usuarios WHERE LOWER(apelido) = LOWER($1)', [apelido]);
    if (resultado.rowCount === 0) return res.status(401).json({ error: 'Apelido ou senha incorretos.' });

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Apelido ou senha incorretos.' });

    await query('UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP, visitas = visitas + 1 WHERE id = $1', [usuario.id]);
    await verificarEAdicionarConquista(usuario.id, 'visitante_frequente', { visitas: usuario.visitas + 1 });

    const token = jwt.sign({ id: usuario.id, apelido: usuario.apelido }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const perfil = await obterPerfilCompleto(usuario.id);

    res.json({ message: `Bem-vindo de volta, ${usuario.apelido}!`, token, usuario: perfil });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// --- Rotas de Perfil e Ações (Protegidas) ---

router.get('/perfil/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const perfil = await obterPerfilCompleto(id);
    if (!perfil) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(perfil);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

router.put('/perfil/:id', verificarToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Garante que o usuário só pode editar o próprio perfil
        if (id !== req.usuario.id) return res.status(403).json({ error: 'Acesso negado.'});

        const { nome, avatar } = req.body;
        if (!nome || !avatar || !avatarsDisponiveis.includes(avatar)) {
            return res.status(400).json({ error: 'Dados inválidos.' });
        }
        await query('UPDATE usuarios SET nome = $1, avatar = $2 WHERE id = $3', [nome.trim(), avatar, id]);
        const perfilAtualizado = await obterPerfilCompleto(id);
        res.json({ message: 'Perfil atualizado!', usuario: perfilAtualizado });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

router.post('/registro-acao', verificarToken, async (req, res) => {
  try {
    const { tipo, dados } = req.body;
    const usuarioId = req.usuario.id;
    let mensagem = 'Ação registrada!';

    switch (tipo) {
      case 'especie_vista':
        await registrarEspecieVista(usuarioId, dados.especieId);
        break;
      case 'ameaca_vista':
        await registrarAmeacaVista(usuarioId, dados.ameacaId);
        break;
      case 'jogo_completado':
        await registrarJogoCompletado(usuarioId, dados.tipoJogo, dados.dificuldade, dados.pontuacao);
        break;
      case 'acao_ameaca':
        await registrarAcaoAmeaca(usuarioId, dados.ameacaId, dados.acaoIndex);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de ação inválido' });
    }
    const perfilAtualizado = await obterPerfilCompleto(usuarioId);
    res.json({ message: mensagem, usuario: perfilAtualizado });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar ação.' });
  }
});


// --- Rotas Públicas (Gamificação e Outros) ---

router.get('/conquistas', async (req, res) => {
  const result = await query('SELECT * FROM conquistas ORDER BY pontos DESC');
  res.json(result.rows);
});
router.get('/avatars', (req, res) => res.json(avatarsDisponiveis));
router.get('/ranking', async (req, res) => {
  const result = await query(`
    SELECT id, nome, apelido, avatar, total_pontos,
    (SELECT COUNT(*) FROM usuario_conquistas WHERE usuario_id = usuarios.id) as total_conquistas,
    (SELECT COUNT(*) FROM estatisticas_jogos WHERE usuario_id = usuarios.id) as total_jogos
    FROM usuarios ORDER BY total_pontos DESC, total_conquistas DESC LIMIT 10`);
  res.json(result.rows);
});

// --- Funções Auxiliares de Gamificação ---
async function obterPerfilCompleto(usuarioId) {
    const usuarioRes = await query('SELECT id, nome, apelido, avatar, data_criacao, ultimo_acesso, total_pontos, visitas FROM usuarios WHERE id = $1', [usuarioId]);
    if (usuarioRes.rowCount === 0) return null;
    const conquistasRes = await query('SELECT c.* FROM conquistas c JOIN usuario_conquistas uc ON c.id = uc.conquista_id WHERE uc.usuario_id = $1 ORDER BY uc.data_conquista DESC', [usuarioId]);
    const especiesRes = await query('SELECT especie_id FROM especies_visualizadas WHERE usuario_id = $1', [usuarioId]);
    const ameacasRes = await query('SELECT ameaca_id FROM ameacas_visualizadas WHERE usuario_id = $1', [usuarioId]);
    const acoesRes = await query('SELECT ameaca_id, acao_index FROM acoes_ameacas WHERE usuario_id = $1', [usuarioId]);

    const perfil = usuarioRes.rows[0];
    perfil.conquistas = conquistasRes.rows;
    perfil.estatisticas = {
        especies_visualizadas: especiesRes.rows.map(r => r.especie_id),
        ameacas_visualizadas: ameacasRes.rows.map(r => r.ameaca_id),
        acoes_ameacas: acoesRes.rows,
    };
    return perfil;
}

async function verificarEAdicionarConquista(usuarioId, conquistaId) {
  const jaTem = await query('SELECT id FROM usuario_conquistas WHERE usuario_id = $1 AND conquista_id = $2', [usuarioId, conquistaId]);
  if (jaTem.rowCount > 0) return;
  const conquista = await query('SELECT pontos FROM conquistas WHERE id = $1', [conquistaId]);
  if (conquista.rowCount > 0) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO usuario_conquistas (usuario_id, conquista_id) VALUES ($1, $2)', [usuarioId, conquistaId]);
      await client.query('UPDATE usuarios SET total_pontos = total_pontos + $1 WHERE id = $2', [conquista.rows[0].pontos, usuarioId]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}
async function registrarEspecieVista(usuarioId, especieId) {
    await query('INSERT INTO especies_visualizadas (usuario_id, especie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [usuarioId, especieId]);
    const total = await query('SELECT COUNT(*) as total FROM especies_visualizadas WHERE usuario_id = $1', [usuarioId]);
    if (parseInt(total.rows[0].total) === 1) await verificarEAdicionarConquista(usuarioId, 'primeira_especie');
}
async function registrarAmeacaVista(usuarioId, ameacaId) {
    await query('INSERT INTO ameacas_visualizadas (usuario_id, ameaca_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [usuarioId, ameacaId]);
}
async function registrarJogoCompletado(usuarioId, tipoJogo, dificuldade, pontuacao) {
    await query('INSERT INTO estatisticas_jogos (usuario_id, tipo_jogo, dificuldade, pontuacao) VALUES ($1, $2, $3, $4)', [usuarioId, tipoJogo, dificuldade, pontuacao]);
}
async function registrarAcaoAmeaca(usuarioId, ameacaId, acaoIndex) {
    await query('INSERT INTO acoes_ameacas (usuario_id, ameaca_id, acao_index) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [usuarioId, ameacaId, acaoIndex]);
}

export default router;