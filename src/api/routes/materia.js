var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todas as matérias */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT materia.id, materia.nome, materia.turma_id, Turmas.Nome AS Turma, Turmas.serie AS serie FROM materia JOIN Turmas ON Turmas.id = materia.turma_id ORDER BY materia.id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar as matérias:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


/* GET parametrizado - Buscar matéria por ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Materia WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Matéria não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


/* POST - Criar nova matéria */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { nome, turma_id } = req.body;
    
    // Validação básica
    if (!nome  || !turma_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome e turma são obrigatórios'
      });
    }

    // Insert
    const result = await pool.query(
      'INSERT INTO Materia (nome, turma_id) VALUES ($1, $2) RETURNING id, nome, turma_id',
      [nome, turma_id]
    );

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Matéria cadastrada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar matéria:', error);
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

/* PUT - Atualizar Matéria */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome, turma_id } = req.body;
    
    // Validação básica
    if (!nome  || !turma_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome e turma são obrigatórios'
      });
    }
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Materia WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Matéria não encontrada'
      });
    }
    
    let query, params;    
    query = 'UPDATE Materia SET nome = $1, turma_id = $2 WHERE id = $3 RETURNING id, nome, turma_id';
    params = [nome, turma_id, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Matéria atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
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

/* DELETE - Remover Materia */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Materia WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Materia não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Materia WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Materia deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar materia:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
