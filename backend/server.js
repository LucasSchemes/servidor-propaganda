const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
const connectDB = require('./config/db'); 
const slideRoutes = require('./routes/slideRoutes'); 
const { startHeartbeat } = require('./controllers/slideController'); 


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000; 
app.use(cors());
app.use(express.json());

// --- Rotas da API ---
// Monta as rotas importadas no prefixo /api
app.use('/api', slideRoutes);

// Rota de Boas-Vindas (/)
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Servidor de Propaganda no ar!',
        admin_api: '/api/slides',
        totem_events: '/api/events'
    });
});

// Inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Inicia o ping de manutenção do SSE
  startHeartbeat();
});
