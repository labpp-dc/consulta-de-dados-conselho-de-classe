var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');


/* GET - Buscar todas as listas de entrada */
router.get('/', verifyToken, async function(req, res) {
    try {
      const result = await pool.query('SELECT * FROM Entrada ORDER BY id');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao buscar as listas de entrada:', error);
      // http status 500 - Internal Server Error
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  });
/* POST - Criar nova lista de entrada */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { data, almoco, estudante} = req.body;
    
    // Validação básica
    if (!data || !estudante) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante são obrigatórios'
      });
    }
    
    // Verificar se essa lista de entrada existe 
    const existingUser = await pool.query('SELECT id FROM Entrada WHERE data= $1' , [data]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Essa lista de entrada já está em uso'
      });
    }

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Lista de entrada registrada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao registrar lista de entrada:', error);
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

/* PUT - Atualizar lista de entrada */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { data, estudante } = req.body;
    
    // Validação básica
    if (!data || !estudante) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Data e estudante são obrigatórios'
      });
    }
    
    // Verificar se o email existe
    const userExists = await pool.query('SELECT id FROM Entrada WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Lista de entrada não encontrada'
      });
    }
    
    
    let query, params;    
    query = 'UPDATE Entrada SET data = $1, almoco = $2, estudante= $3  WHERE id = $4 RETURNING id,  data, almoco, estudante';
    params = [ data, almoco, estudante, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Lista de entrada atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar lista de entrada:', error);
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

/* DELETE - Remover lista de entrada*/
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Entrada WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Lista de entrada não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Entrada WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Lista de entrada deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lista de entrada:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
