var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas as turmas */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT Turmas.id, Turmas.nome, Turmas.serie, Turmas.turno, AnoLetivo.Ano, Cursos.Nome AS Curso FROM Turmas JOIN AnoLetivo ON AnoLetivo.id = Turmas.anoLetivo_id JOIN Cursos ON Cursos.id = Turmas.curso_id ORDER BY Turmas.id;');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar as turmas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* POST - Criar nova turma */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { nome, turno, serie, curso_id, anoLetivo_id } = req.body;
    
    // Validação básica - FIXED
    if (!nome || !turno || !serie || !curso_id || !anoLetivo_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome, turno, serie, curso e anoLetivo são obrigatórios'
      });
    }
    
    // Verificar se o curso indicado existe - FIXED
    const existingCurso = await pool.query('SELECT id FROM Cursos WHERE id = $1', [curso_id]);
    if (existingCurso.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'Curso escolhido não existente'
      });
    }
    
    // Verificar se o nome já existe naquele anoLetivo - FIXED
    const existingTurma = await pool.query(
      'SELECT id FROM Turmas WHERE nome = $1 AND anoLetivo_id = $2', 
      [nome, anoLetivo_id]
    );
    if (existingTurma.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nome de turma já está em uso em outra turma deste ano'
      });
    }
    
    // Insert
    const result = await pool.query(
      'INSERT INTO Turmas (nome, turno, serie, curso_id, anoLetivo_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, turno, serie, curso_id, anoLetivo_id',
      [nome, turno, serie, curso_id, anoLetivo_id]
    );

    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }
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
    const { nome, turno, serie, curso_id, anoLetivo_id } = req.body;
    
    // Validação básica
    if (!nome || !turno || !serie || !curso_id || !anoLetivo_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome, turno, serie, curso e ano letivo são obrigatórios'
      });
    }
    
    // Verificar se a turma existe
    const userExists = await pool.query('SELECT id FROM Turmas WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Verificar se o nome da turma já está em uso no mesmo ano - FIXED
    const existingTurma = await pool.query(
      'SELECT id FROM Turmas WHERE nome = $1 AND anoLetivo_id = $2 AND id != $3',
      [nome, anoLetivo_id, id]
    );
    if (existingTurma.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nome de turma já está em uso por outra turma neste ano'
      });
    }
    
    // Update query - FIXED
    const query = 'UPDATE Turmas SET nome = $1, turno = $2, serie = $3, curso_id = $4, anoLetivo_id = $5 WHERE id = $6 RETURNING id, nome, turno, serie, curso_id, anoLetivo_id';
    const params = [nome, turno, serie, curso_id, anoLetivo_id, id];
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }
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
    
    const userExists = await pool.query('SELECT id FROM Turmas WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Turmas WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Turma deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;