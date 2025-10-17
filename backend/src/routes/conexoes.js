// ====================================================================================
//              ROTA DA API DE JOGO DE CONEXÕES - (DATABASE-DRIVEN)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Esta rota fornece dados para o Jogo de Conexões. Ela busca
// dinamicamente espécies e uma de suas adaptações (o "superpoder") no banco de dados.
// ====================================================================================

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route   GET /api/conexoes
 * @desc    Obtém uma lista de itens para o Jogo de Conexões.
 * @query   limit - O número de conexões a serem retornadas (padrão: 6).
 * @access  Public
 */
router.get('/conexoes', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 6;
  console.log(`Recebida requisição para GET /api/conexoes com limite de ${limit}.`);

  try {
    // Busca espécies que tenham pelo menos uma adaptação registrada
    const { rows } = await query(
      `SELECT e.id, e.nome, e.imagem, e.categoria, a.adaptacao AS superpoder
       FROM especies e
       JOIN adaptacoes a ON e.id = a.especie_id
       WHERE e.imagem IS NOT NULL AND e.imagem != ''
       -- Pega apenas uma adaptação por espécie para o jogo
       AND a.id IN (
         SELECT MIN(id) FROM adaptacoes GROUP BY especie_id
       )
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit]
    );

    if (rows.length < limit) {
      console.warn(`Aviso: Foram solicitadas ${limit} conexões, mas apenas ${rows.length} foram encontradas no DB.`);
    }

    console.log(`Retornando ${rows.length} itens para o Jogo de Conexões.`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível carregar os dados para o Jogo de Conexões.',
    });
  }
});

export default router;