var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todos os estudantes */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM estudante ORDER BY id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar os estudantes:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/
/* GET parametrizado - Buscar usuário por ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM usuario WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* POST - Criar novo estudante */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { nome, nomeSocial, matricula, suspenso, foto, turma } = req.body;
    
    // Validação básica
    if (!nome  || !matricula  || !foto  || !turma) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, matricula, seríe, foto são obrigatórios'
      });
    }
    
    // Verificar se a matricula já existe
    const existingUser = await pool.query('SELECT id FROM estudante WHERE matricula = $1', [matricula]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Matrícula já está em uso'
      });
    }

    // Hash da senha
    const result = await pool.query(
      'INSERT INTO usuario (nome, nomeSocial, matricula, suspenso, foto, turma) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nome, nomeSocial, matricula, suspenso, foto, turma',
      [nome, nomeSocial, matricula, suspenso, , foto, turma]
    );

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Estudante criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar estudante:', error);
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

/* PUT - Atualizar usuário */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome, nomeSocial, matricula, suspenso, foto, turma } = req.body;
    
    // Validação básica
    if (!nome  || !matricula  || !foto  || !turma) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, matricula, foto são obrigatórios'
      });
    }
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM estudante WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Estudante não encontrado'
      });
    }
    
    // Verificar se a matrícula já está em uso por outro usuário
    const existingUser = await pool.query('SELECT id FROM estudante WHERE matricula = $1 AND id != $2', [matricula, id]);
    if (existingUser.rows.length > 0) {
      // https status 409 - Conflict
      return res.status(409).json({
        success: false,
        message: 'Matrícula já está em uso por outro usuário'
      });
    }
    
    let query, params;
    
    if (senha && senha.trim() !== '') {
      // Atualizar com nova senha
      const hashedPassword = await bcrypt.hash(senha, 12);
      query = 'UPDATE estudante SET nome = $1, nomeSocial = $2, matricula = $3, suspenso = $4, foto = $5, turma = $6 WHERE id = $7 RETURNING id,  nome, nomeSocial, matricula, suspenso, foto, turma';
      params = [ nome, nomeSocial, matricula, suspenso, foto, turma, id];
    } else {
      // Atualizar sem alterar senha
      query = 'UPDATE estudante SET login = $1, email = $2, role = $3 WHERE id = $4 RETURNING id,  nome, nomeSocial, matricula, suspenso, foto, turma';
      params = [ nome, nomeSocial, matricula, suspenso, foto, turma, id];
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Estudante atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar estudante:', error);
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

/* DELETE - Remover estudante */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM estudante WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Estudante não encontrado'
      });
    }
    
    await pool.query('DELETE FROM estudante WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Estudante deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar estudante:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
