// ====================================================================================
//                  ROTA DA API DE ESPÉCIES - (DATABASE-DRIVEN)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Esta rota agora busca dados diretamente do banco de dados PostgreSQL,
// utilizando a view 'v_especies_completas' para retornar dados ricos.
// ====================================================================================

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route   GET /api/especies
 * @desc    Obtém a lista de todas as espécies com suas adaptações.
 * @access  Public
 */
router.get('/especies', async (req, res) => {
  console.log('Recebida requisição para GET /api/especies');
  try {
    const { rows } = await query('SELECT * FROM v_especies_completas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível buscar as espécies.'
    });
  }
});

/**
 * @route   GET /api/especies/:id
 * @desc    Obtém os detalhes de uma espécie específica.
 * @access  Public
 */
router.get('/especies/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebida requisição para GET /api/especies/${id}`);

  try {
    const { rows, rowCount } = await query('SELECT * FROM v_especies_completas WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Espécie não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível buscar a espécie.'
    });
  }
});

export default router;