var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas os cursos */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM Cursos ORDER BY id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar os ano letivos:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


/* POST - Criar novo curso */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { nome} = req.body;
    
    // Validação básica
    if (!nome ) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatórios'
      });
    }
    
    // Verificar se o ano existe 
    const existingUser = await pool.query('SELECT id FROM Cursos WHERE Nome = $1 ' , [nome]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nome já está em uso'
      });
    }
    //Insert
    const result = await pool.query(
      'INSERT INTO Cursos (nome) VALUES ($1) RETURNING id, nome',
      [nome]
    );
    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar curso:', error);
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

/* PUT - Atualizar ano letivo */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    // Validação básica
    if (!nome) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatórios'
      });
    }
    
    // Verificar se a ano letivo existe
    const userExists = await pool.query('SELECT id FROM Cursos WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    
    let query, params;    
    query = 'UPDATE Cursos SET Nome = $1,  WHERE id = $2 RETURNING id,  Nome';
    params = [ nome, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Curso atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
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

/* DELETE - Remover curso*/
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Cursos WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    await pool.query('DELETE FROM Cursos WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Curso deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar ano letivo:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
