var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');


/* GET - Buscar todas as listas de saida */
router.get('/', verifyToken, async function(req, res) {
    try {
      const result = await pool.query('SELECT * FROM Saida ORDER BY id');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao buscar as listas de saida:', error);
      // http status 500 - Internal Server Error
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
/* POST - Criar nova lista de saida */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { data, estudante_id} = req.body;
    
    // Validação básica
    if (!data || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante são obrigatórios'
      });
    }
    
    // Verificar se essa lista de entrada existe 
    const existingUser = await pool.query('SELECT id FROM Saida WHERE data= $1' , [data]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Essa lista de saida já está em uso'
      });
    }

    //Insert
    const result = await pool.query(
      'INSERT INTO Saida ( data, estudante_id) VALUES ($1, $2) RETURNING id,  data, estudante_id',
      [ data, estudante_id]
    );

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Lista de saída registrada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao registrar lista de saída:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* PUT - Atualizar lista de saida */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { data, estudante_id } = req.body;
    
    // Validação básica
    if (!data || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante são obrigatórios'
      });
    }
    
    // Verificar se o email existe
    const userExists = await pool.query('SELECT id FROM Saida WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Lista de saída não encontrada'
      });
    }
    
    
    let query, params;    
    query = 'UPDATE Saida SET data = $1, estudante_id = $2  WHERE id = $3 RETURNING id, estudante_id';
    params = [ data, estudante_id, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Lista de saída atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar lista de saída:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* DELETE - Remover lista de saida*/
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Saida WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Lista de saída não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Saida WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Lista de saída deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lista de saída:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
