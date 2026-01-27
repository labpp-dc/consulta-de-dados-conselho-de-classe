var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas as turmas */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT Turmas.id, Turmas.nome, Turmas.serie, Turmas.turno FROM Turmas ORDER BY Turmas.id;');
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

/* GET parametrizado - Buscar estudantes por turma */
router.get('/:estudantes', verifyToken, async function(req, res) {
  try {
    const { nome} = req.params;
    const result = await pool.query('SELECT estudante.id, estudante.nome, estudante.nomeSocial, estudante.matricula, Turmas.nome AS turma JOIN Turmas ON Turmas.id = estudante.turma_id WHERE  Turmas.nome = $1 RETURNING * ORDER BY estudante.id;', [nome]);

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* GET parametrizado - Buscar matérias por turma */
router.get('/:materias', verifyToken, async function(req, res) {
  try {
    const { nome } = req.params;
    const result = await pool.query('SELECT materia.id, materia.nome, Turmas.nome AS turma, JOIN Turmas ON Turmas.id = materia.turma_id WHERE Turmas.nome = $1 RETURNING * ORDER BY materia.id;', [nome]);

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Matérias da Turma não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


/* GET parametrizado - Buscar notas dos estudante de uma turma em todas as matérias  */
router.get('/:notas', verifyToken, async function(req, res) {

  try {
    const { turma, filtro, materiaEscolhida } = req.params;
    
    // If para decidir se o get buscará uma matéria especifica ou todas, a variavél filtro é só um boolean.
    
    if (filtro){ 

      //Busca de notas de uma matéria espécifica

       const result = await pool.query('SELECT notas.id, notas.cert1, notas.apoio1, notas.cert2, notas.apoio2, notas.pfv, Estudante.nome AS estudante, Turmas AS turma, Materia.nome AS materia FROM notas JOIN Materia ON Materia.id = notas.materia_id JOIN Estudante ON Estudante.id = notas.estudante_id JOIN Turmas ON Turmas.id = estudante.turma_id WHERE turma = $1 AND materia = $2 ORDER BY estudante.id;', [turma, materiaEscolhida]);
    }

    else{

      //Busca de notas de todas as matérias

       const result = await pool.query('SELECT notas.id, notas.cert1, notas.apoio1, notas.cert2, notas.apoio2, notas.pfv, Estudante.nome AS estudante, Turmas AS turma, Materia.nome AS materia FROM notas JOIN Materia ON Materia.id = notas.materia_id JOIN Estudante ON Estudante.id = notas.estudante_id JOIN Turmas ON Turmas.id = estudante.turma_id WHERE turma = $1 ORDER BY estudante.id;', [turma]);

    }
    
    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Notas do estudante não encontradas'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar as notas dos estudantes:', error);
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
    const { nome, turno, serie } = req.body;
    
    // Validação básica - FIXED
    if (!nome || !turno || !serie) {
      return res.status(400).json({
        success: false,
        message: 'Nome, turno e série são obrigatórios'
      });
    }
    
    // Insert
    const result = await pool.query(
      'INSERT INTO Turmas (nome, turno, serie) VALUES ($1, $2, $3) RETURNING id, nome, turno, serie;',
      [nome, turno, serie]
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
    const { nome, turno, serie} = req.body;
    
    // Validação básica
    if (!nome || !turno || !serie) {
      return res.status(400).json({
        success: false,
        message: 'Nome, turno e série são obrigatórios'
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
    
    // Update query - FIXED
    const query = 'UPDATE Turmas SET nome = $1, turno = $2, serie = $3 WHERE id = $4 RETURNING id, nome, turno, serie;';
    const params = [nome, turno, serie, id];
    
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