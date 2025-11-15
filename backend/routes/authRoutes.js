const express = require('express');
const router = express.Router();

const {
  loginUser,
  registerUser,
} = require('../controllers/userController');

const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout efetuado com sucesso.' });
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/me', (req, res) => {
  if (req.cookies && req.cookies.token) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;