var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas os anos letivos */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM AnoLetivo ORDER BY id');
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


/* POST - Criar novo ano letivo */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { ano} = req.body;
    
    // Validação básica
    if (!ano ) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Ano letivo é obrigatórios'
      });
    }
    
    // Verificar se o ano existe 
    const existingUser = await pool.query('SELECT id FROM AnoLetivo WHERE Ano = $1 ' , [ano]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ano letivo já está em uso'
      });
    }
    //Insert
    const result = await pool.query(
      'INSERT INTO AnoLetivo (ano) VALUES ($1) RETURNING id, ano',
      [ano]
    );
    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Ano letivo criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar ano letivo:', error);
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
    const { ano } = req.body;
    
    // Validação básica
    if (!ano) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Ano letivo é obrigatórios'
      });
    }
    
    // Verificar se a ano letivo existe
    const userExists = await pool.query('SELECT id FROM AnoLetivo WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Ano letivo não encontrado'
      });
    }
    
    
    let query, params;    
    query = 'UPDATE AnoLetivo SET Ano = $1,  WHERE id = $2 RETURNING id,  Ano';
    params = [ ano, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Ano letivo atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar ano letivo:', error);
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

/* DELETE - Remover ano letivo */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM AnoLetivo WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Ano letivo não encontrado'
      });
    }
    
    await pool.query('DELETE FROM AnoLetivo WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Ano letivo deletado com sucesso'
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
