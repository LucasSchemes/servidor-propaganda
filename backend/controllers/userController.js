const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', 
  });
};

// registra um novo usuário
const registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
    }

    // primeiro usuário que se registrar será o Administrador (role: 1)
    const count = await User.countDocuments({});
    const role = count === 0 ? 1 : 0; 
    const user = await User.create({
      username,
      passwordHash: password, 
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


// autentica o usuário
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const user = await User.findOne({ username });

    // verifica se o usuário existe e se a senha digitada é válida
    if (user && (await user.matchPassword(password))) {
      
      // gera o token
      const token = generateToken(user._id);

      // salva o token em um cookie HTTP-only
      res.cookie('token', token, {
        httpOnly: true, // não acessível via JavaScript do lado do cliente
        secure: process.env.NODE_ENV === 'production', // usado apenas em conexões HTTPS em produção
        sameSite: 'strict', // protege contra CSRF
        maxAge: 3600000 // 1 hora
      });
      
      // loga o usuário
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        message: 'Login bem-sucedido'
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