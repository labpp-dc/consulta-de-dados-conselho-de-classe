var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* GET - Buscar todos os usuários */
// requer usuário autenticado como admin
router.get('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const result = await pool.query('SELECT id, login, role FROM Funcionario ORDER BY id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET parametrizado - Buscar funcionário autenticado 
router.get('/me', verifyToken, async function(req, res) {
  try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT * FROM Funcionario WHERE id = $1', [id]);

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


/* GET parametrizado - Buscar usuário por ID */
router.get('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, login, role FROM Funcionario WHERE id = $1', [id]);

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

/* POST - Criar novo usuário */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { login, senha, role} = req.body;
    
    // Validação básica
    if (!login || !senha ) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Login e senha são obrigatórios'
      });
    }
    
    // Verificar se o login já existe
    const existingUser = await pool.query('SELECT id FROM Funcionario WHERE login = $1', [login]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Login já está em uso'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12);
    
    //Insert
    const result = await pool.query(
      'INSERT INTO Funcionario (login, senha, role) VALUES ($1, $2, $3) RETURNING id, login, role',
      [login, hashedPassword, role]
    );

    // http status 201 - Created
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
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


/* POST - Autenticar usuário */
router.post('/login', async function(req, res) {
  try {
    const { login, password } = req.body;
    // obtém o usuário do banco de dados
    const result = await pool.query(`SELECT 
      id, login, senha as passwordHash, role
      FROM Funcionario 
      WHERE login = $1`, [login]);

    /*
     tratar login inválido igual senha incorreta
     confere maior segurança por não expor indiretamente
     se existe uma conta com aquele login 
    */
    if (result.rows.length === 0) {
      // https status 401 - unauthorized
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Objeto de usuário
    const user = result.rows[0];

    /*
     verifica a senha passando senha do forntend e hash armazenada
     a partir da hash não se pode descobrir a senha
     mas fornecendo a senha dá para aplicar a hash e ver coincidem
    */
    
    bcrypt.compare(password, user.passwordhash, (err, isMatch) => {
      if (err) {
        console.error('Erro no bcrypt:', err);
        // https status 500 - internal server error
        return res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
      
      if (!isMatch) {
        // https status 401 - unauthorized
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Cria o token com as informações do usuário logado e sua chave pública
      const token = jwt.sign(
        { 
          id: user.id, 
          login: user.login,
          // tipo do usuário, que vem do banco
          role: user.role 
          // a senha não entra no token para não ser exposta
        }, 
        process.env.JWT_SECRET, //chave secreta, nunca exponha!! >>> PERIGO <<<
        { expiresIn: '1h' } 
      );

      // O token contém as informções do usuário com a chave para posterior validação
      return res.status(200).json({
        success: true,
        token: token,
        message: 'Autenticado com sucesso!'
      });
    });

  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
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
    const { login, senha, role } = req.body;
    
    // Validação básica
    if (!login || !role) {
      // http status 400 - Bad Request
      return res.status(400).json({
        success: false,
        message: 'Login e role são obrigatórios'
      });
    }
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Funcionario WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o login já está em uso por outro usuário
    const existingUser = await pool.query('SELECT id FROM Funcionario WHERE login = $1 AND id != $2', [login, id]);
    if (existingUser.rows.length > 0) {
      // https status 409 - Conflict
      return res.status(409).json({
        success: false,
        message: 'Login já está em uso por outro usuário'
      });
    }
    
    let query, params;
    
    if (senha && senha.trim() !== '') {
      // Atualizar com nova senha
      const hashedPassword = await bcrypt.hash(senha, 12);
      query = 'UPDATE Funcionario SET login = $1, senha = $2, role = $3 WHERE id = $4 RETURNING id, login, role';
      params = [login, hashedPassword, role, id];
    } else {
      // Atualizar sem alterar senha
      query = 'UPDATE Funcionario SET login = $1, role = $2 WHERE id = $3 RETURNING id, login, role';
      params = [login, role, id];
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
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

/* DELETE - Remover usuário */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM Funcionario WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      // http status 404 - Not Found
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    await pool.query('DELETE FROM Funcionario WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    // http status 500 - Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
