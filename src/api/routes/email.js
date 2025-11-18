var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');


/* POST - Criar novo email */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { endereco, estudante_id} = req.body;
    
    // Validação básica
    if (!endereco || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Endereço e estudante são obrigatórios'
      });
    }
    
    // Verificar se o email existe 
    const existingUser = await pool.query('SELECT id FROM email WHERE endereco = $1 ' , [endereco]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    //Insert
    const result = await pool.query(
      'INSERT INTO email (endereco, estudante_id) VALUES ($1, $2) RETURNING id, endereco, estudante_id',
      [endereco, estudante_id]
    );
    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Email registrado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao registrar email:', error);
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

/* PUT - Atualizar email */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { endereco, estudante_id } = req.body;
    
    // Validação básica
    if (!endereco || !estudante_id) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Endereço e estudante são obrigatórios'
      });
    }
    
    // Verificar se o email existe
    const userExists = await pool.query('SELECT id FROM email WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });
    }
    
    
    let query, params;    
    query = 'UPDATE email SET endereco = $1, estudante_id = $2  WHERE id = $3 RETURNING id,  endereco, estudante_id';
    params = [ endereco, estudante_id, id];    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Email atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar email:', error);
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

/* DELETE - Remover email*/
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM email WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });
    }
    
    await pool.query('DELETE FROM email WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Email deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar email:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
