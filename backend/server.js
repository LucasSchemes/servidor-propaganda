const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');
const argon2 = require('argon2');
const Slide = require('./models/Slide');
const slideRoutes = require('./routes/slideRoutes');
const authRoutes = require('./routes/authRoutes');
const { startHeartbeat } = require('./controllers/slideController');
const { protect, admin } = require('./middlewares/authMiddleware');
const { connectTotem } = require('./controllers/slideController');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

setInterval(async () => {
  try {
    const result = await Slide.deleteMany({ dataExpiracao: { $lt: new Date() } });
    if (result.deletedCount > 0) console.log(`${result.deletedCount} slide(s) expirado(s) removido(s).`);
  } catch (error) {
    console.error('Erro ao remover slides expirados:', error);
  }
}, 3600000);

app.use('/api/auth', authRoutes);
app.use('/api/slides', protect, admin, slideRoutes);
app.get('/api/events', connectTotem);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Servidor de Propaganda no ar!',
    login: '/api/auth/login',
    admin_api: '/api/slides',
    totem_events: '/api/events'
  });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startHeartbeat();
});
