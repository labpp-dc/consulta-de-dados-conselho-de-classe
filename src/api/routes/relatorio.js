var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');


/* GET - Buscar todas os relatórios */
router.get('/', verifyToken, async function(req, res) {
    try {
      const result = await pool.query('SELECT * FROM Relatorio ORDER BY id');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao buscar os relatórios:', error);
      // http status 500 - Internal Server Error
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
/* POST - Criar nova lista de relatórios */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { relato, data, estudante_id} = req.body;
    
    // Validação básica
    if (!data || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante é obrigatório'
      });
    }
    
    // Verificar se essa lista de relatórios já existe
    const existingUser = await pool.query('SELECT id FROM Relatorio WHERE data= $1' , [data]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Essa lista de relatórios já está em uso'
      });
    }
    // Insert
    const result = await pool.query(
      'INSERT INTO Relatorio (relato, data, estudante_id) VALUES ($1, $2, $3) RETURNING id, relato, data, estudante_id',
      [relato, data, estudante_id]
    );
    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Lista de relatórios registrada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao registrar lista de relatórios:', error);
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

/* PUT - Atualizar lista de Relatorio */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { relato, data, estudante_id } = req.body;
    
    // Validação básica
    if (!data || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante são obrigatórios'
      });
    }
    
    let query, params;    
    query = 'UPDATE Relatorio SET relato= $1, data= $2, estudante_id = $3  WHERE id = $4 RETURNING id, relato, data, estudante_id';
    params = [ relato, data, estudante_id, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Lista de relatórios atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar lista de relatórios:', error);
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

/* DELETE - Remover lista de relatórios*/
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Relatorio WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Lista de relatórios não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Relatorio WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Lista de relatórios deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lista de relatórios:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
