var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todos os estudantes */
router.get('/', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT estudante.id, estudante.nome, estudante.nomeSocial, estudante.matricula, estudante.foto, Turmas.Nome AS Turma, Turmas.serie AS serie FROM estudante JOIN TurmaEstudante ON estudante.id = TurmaEstudante.estudante_id JOIN Turmas ON Turmas.id = TurmaEstudante.turma_id ORDER BY estudante.id');
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

/* GET  - Buscar notas de todos os estudante em todas as matérias  */
router.get('/notas', verifyToken, async function(req, res) {
  try {
    const result = await pool.query('SELECT notas.id, notas.cert1, notas.apoio1, notas.cert2, notas.apoio2, notas.pfv, Estudante.nome AS estudante, Estudante.matricula As matricula, Materia.nome AS materia FROM notas JOIN Materia ON Materia.id = notas.materia_id JOIN Estudante ON Estudante.id = notas.estudante_id  ORDER BY notas.id;');

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Notas dos estudantes não encontradas'
      });
    }
    
    res.json({
      success: true,
      data: result.rows
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

/* GET parametrizado - Buscar notas do estudante em todas as matérias  */
router.get('/notas/estudante/:nome', verifyToken, async function(req, res) {
  try {
    const { nome } = req.params;
    const result = await pool.query('SELECT notas.id, notas.cert1, notas.apoio1, notas.cert2, notas.apoio2, notas.pfv, Estudante.nome AS estudante, Estudante.matricula As matricula, Materia.nome AS materia FROM notas JOIN Materia ON Materia.id = notas.materia_id JOIN Estudante ON Estudante.id = notas.estudante_id WHERE Estudante.nome = $1 ORDER BY notas.id;', [nome]);

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
    console.error('Erro ao buscar as notas do estudante:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* GET parametrizado - Buscar estudante por ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM estudante WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Estudante não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estudante:', error);
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
    const { nome, nomeSocial, matricula, foto, turma_id } = req.body;
    
    // Validação básica
    if (!nome  || !matricula  || !foto  || !turma_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, matrícula, série e foto são obrigatórios'
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

    // Insert
    const query = `WITH novo_estudante AS ( INSERT INTO estudante (nome, nomeSocial, matricula, foto) VALUES ($1, $2, $3, $4) RETURNING id), INSERT INTO TurmaEstudante (estudante_id, turma_id) SELECT id, $5 FROM novo_estudante;`

    const result = await pool.query(query, [nome, nomeSocial, matricula, foto, turma_id]);

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Estudante cadastrado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar estudante:', error);
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
    const { nome, nomeSocial, matricula, foto, turma_id } = req.body;
    
    // Validação básica
    if (!nome  || !matricula  || !foto  || !turma_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Nome, matrícula e foto são obrigatórios'
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
    query = 'UPDATE estudante SET nome = $1, nomeSocial = $2, matricula = $3, foto = $4 WHERE id = $5 RETURNING id,  nome, nomeSocial, matricula, foto';
    params = [ nome, nomeSocial, matricula, foto, id];    
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

/* DELETE - Remover nota especifica*/
router.delete('/nota/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Notas WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Nota não encontrada'
      });
    }
    
    await pool.query('DELETE FROM Notas WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Nota deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* DELETE - Remover nota especifica*/
router.delete('/notas/:matricula', verifyToken, isAdmin, async function(req, res) {
  try {
    const { matricula } = req.params;
    
    // Verificar se o usuário existe
    const estudante = await pool.query('SELECT id FROM estudante WHERE matricula = $1', [matricula]);

    if (estudante.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Estudante não encontrada'
      });
    }

    const userExists = await pool.query('SELECT id FROM Notas WHERE estudante_id = $1', [estudante.rows[0].id]);

    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Notas não encontradas'
      });
    }
    
    await pool.query('DELETE FROM Notas WHERE estudante_id = $1', [estudante.rows[0].id]);
    
    res.status(200).json({
      success: true,
      message: 'Notas deletadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar notas:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});


module.exports = router;
