const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Não autorizado, token ausente.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error.message);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 1) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Requer permissão de administrador.' });
  }
};

module.exports = { protect, admin };
