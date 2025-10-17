// ====================================================================================
//                  ROTA DA API DE AMEAÇAS - (DATABASE-DRIVEN)
// ====================================================================================
// Responsável: Jules (Engenheiro de Software AI)
// Data: 2025-10-17
// Descrição: Esta rota agora busca dados sobre ameaças ambientais diretamente do
// banco de dados, usando a view 'v_ameacas_completas'.
// ====================================================================================

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @route   GET /api/ameacas
 * @desc    Obtém a lista de todas as ameaças com suas soluções.
 * @access  Public
 */
router.get('/ameacas', async (req, res) => {
  console.log('Recebida requisição para GET /api/ameacas');
  try {
    const { rows } = await query('SELECT * FROM v_ameacas_completas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível buscar as ameaças.'
    });
  }
});

/**
 * @route   GET /api/ameacas/:id
 * @desc    Obtém os detalhes de uma ameaça específica.
 * @access  Public
 */
router.get('/ameacas/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebida requisição para GET /api/ameacas/${id}`);

  try {
    const { rows, rowCount } = await query('SELECT * FROM v_ameacas_completas WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ameaça não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      error: 'Erro Interno do Servidor',
      message: 'Não foi possível buscar a ameaça.'
    });
  }
});

export default router;