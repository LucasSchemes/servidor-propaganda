const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', 
  });
};

// [POST] /api/auth/register - Registra um novo usuário
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

    // O primeiro usuário que se registrar será o Administrador (role: 1)
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
      
      // 1. Gera o token
      const token = generateToken(user._id);

      // 2. SALVA O TOKEN NO COOKIE
      res.cookie('token', token, {
        httpOnly: true, // O cookie não pode ser acessado por JS no frontend
        secure: process.env.NODE_ENV === 'production', // Apenas em HTTPS no ambiente de produção
        sameSite: 'strict', // Proteção contra ataques CSRF
        maxAge: 3600000 // 1 hora (deve ser igual ao 'expiresIn' do token)
      });
      
      // 3. Envia a resposta de sucesso
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