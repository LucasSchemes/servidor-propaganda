const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // Usaremos 7 dias para a sessão administrativa, mais seguro que 30d
    expiresIn: '7d', 
  });
};

// [POST] /api/auth/register - Registra um novo usuário
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  // 1. Validação de campos
  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    // 2. Verifica se o usuário já existe
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
    }

    // O primeiro usuário que se registrar será o Administrador (role: 1)
    const count = await User.countDocuments({});
    const role = count === 0 ? 1 : 0; 
    
    // 4. Cria o novo usuário
    // Passamos a senha para 'passwordHash' (que será hasheada pelo Model) e definimos o role.
    const user = await User.create({
      username,
      hashPassword: password, 
      role: role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
        message: role === 1 ? 'Primeiro Administrador criado com sucesso!' : 'Usuário Leitor criado com sucesso!'
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos.' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário.', error: error.message });
  }
};


// [POST] /api/auth/login - Autentica o usuário
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const user = await User.findOne({ username });

    // Verifica se o usuário existe E se a senha digitada é válida
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Nome de usuário ou senha inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser, 
};