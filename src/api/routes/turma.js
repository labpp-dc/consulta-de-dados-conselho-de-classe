var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas ss turmas */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM Turmas ORDER BY id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar as turmas:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


/* POST - Criar nova turma */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { nome, turno, serie, curso, anoLetivo} = req.body;
    
    // Validação básica
    if (!turno  || !serie  || !curso  || !anoLetivo) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, turno, serie, curso, anoLetivo são obrigatórios'
      });
    }
    
    // Verificar se o nome já existe naquele anoLetivo
    const existingUser = await pool.query('SELECT id FROM Turmas INNER JOIN AnoLetivo WHERE nome = $1 AND Ano= $2' , [nome, anoLetivo]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nome de turma já está em uso em outra turma deste ano'
      });
    }
    //Insert
    const result = await pool.query(
      'INSERT INTO Turmas (nome, turno, serie, curso, anoLetivo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nome, turno, serie, curso, anoLetivo',
      [nome, turno, serie, curso, anoLetivo]
    );

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Turma criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
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

/* PUT - Atualizar turma */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome, turno, serie, curso, anoLetivo } = req.body;
    
    // Validação básica
    if (!nome  || !turno  || !serie  || !curso || !anoLetivo) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, turno, serie, curso e ano letivo são obrigatórios'
      });
    }
    
    // Verificar se a turma existe
    const userExists = await pool.query('SELECT id FROM Turma WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrado'
      });
    }
    
    // Verificar se o nome da turma já está em uso no mesmo ano
    const existingUser = await pool.query('SELECT id FROM Turmas INNER JOIN AnoLetivo WHERE nome = $1 AND Ano= $2' , [nome, anoLetivo]);
    if (existingUser.rows.length > 0) {
      // https status 409 - Conflict
      return res.status(409).json({
        success: false,
        message: 'Nome de turma já está em uso por outra turma neste ano'
      });
    }
    
    let query, params;    
    query = 'UPDATE Turma SET nome = $1, turno = $2, serie = $3, curso = $4, anoLetivo = $5 WHERE id = $7 RETURNING id,  nome, nomeSocial, matricula, suspenso, foto, turma';
    params = [ nome, turno, serie, curso, anoLetivo, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
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

/* DELETE - Remover turma */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Turma WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Turma WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Turma deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
