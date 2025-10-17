// ====================================================================================
//                  ROTA DA API DE JOGOS - (DATABASE-DRIVEN)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Esta rota fornece os dados para os jogos, buscando dinamicamente
// as informações da tabela 'especies' no banco de dados.
// ====================================================================================

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route   GET /api/jogo-memoria
 * @desc    Obtém uma lista de cartas para o Jogo da Memória.
 * @query   limit - O número de PARES de cartas desejado (padrão: 8).
 * @access  Public
 */
router.get('/jogo-memoria', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  console.log(`Recebida requisição para GET /api/jogo-memoria com limite de ${limit} pares.`);

  try {
    // Busca 'limit' espécies aleatórias que tenham uma imagem definida
    const { rows } = await query(
      `SELECT id, nome, imagem, categoria
       FROM especies
       WHERE imagem IS NOT NULL AND imagem != ''
       ORDER BY RANDOM()
       LIMIT $1`,
      [limit]
    );

    if (rows.length < limit) {
      console.warn(`Aviso: Foram solicitados ${limit} pares, mas apenas ${rows.length} registros foram encontrados no DB.`);
    }

    // Duplica cada item para formar os pares do jogo
    const gameCards = rows.flatMap(card => [
      { ...card, uniqueId: `${card.id}-a` },
      { ...card, uniqueId: `${card.id}-b` }
    ]);

    // Embaralha o array final para que os pares não fiquem juntos
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);

    console.log(`Retornando ${shuffledCards.length} cartas embaralhadas.`);
    res.json(shuffledCards);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível carregar os dados para o jogo.',
    });
  }
});

export default router;