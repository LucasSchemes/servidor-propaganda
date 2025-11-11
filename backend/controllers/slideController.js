const Slide = require('../models/Slide'); 
const clients = [];

async function sendEventToAllClients() {
    try {
        const slidesValidos = await Slide.find({
            dataExpiracao: { $gt: new Date() } 
        }).sort({ createdAt: 1 }); // Ordena do mais antigo para o mais novO

        // Transforma o array de slides em uma string JSON para envio via SSE
        const data = `data: ${JSON.stringify(slidesValidos)}\n\n`;

        console.log(`\nEnviando atualização. Slides válidos: ${slidesValidos.length}. Clientes conectados: ${clients.length}`);

        
        clients.forEach(client => {
            try {
                client.res.write(data);
            } catch (error) {
                console.error('Erro ao escrever para o cliente (conexão perdida):', error.message);
                client.res.end(); 
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar ou enviar slides para clientes SSE:', error.message);
    }
}

//Envia um evento "ping" a cada 15 segundos para manter as conexões SSE ativas

const startHeartbeat = () => {
    const HEARTBEAT_INTERVAL = 15000; // 15 segundos
    
    setInterval(() => {
        const ping = 'event: ping\ndata: \n\n';
        clients.forEach(client => {
            try {
                client.res.write(ping);
            } catch (error) {
                // Erro ao enviar ping, a conexão provavelmente será fechada no 'close'
            }
        });
    }, HEARTBEAT_INTERVAL);
};


// CONTROLADORES DA API (CRUD)

// CREATE-POST /api/slides
const createSlide = async (req, res) => {
  try {
    const { titulo, duracao, conteudoHTML, dataExpiracao } = req.body;
    if (!titulo || !duracao || !conteudoHTML || !dataExpiracao) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    
    const novoSlide = new Slide({
      titulo,
      duracao,
      conteudoHTML,
      dataExpiracao: new Date(dataExpiracao)
    });
    await novoSlide.save();
    
    res.status(201).json(novoSlide);

    sendEventToAllClients(); 
    
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar slide', error: error.message });
  }
};

// READ-GET /api/slides (Para o Admin)
const getAllSlides = async (req, res) => {
  try {
    // Busca todos, ordenados do mais recente para o mais antigo (melhor para o admin)
    const slides = await Slide.find().sort({ createdAt: -1 });
    res.status(200).json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar slides', error: error.message });
  }
};

// PUT-UPDATE /api/slides/:id
const updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        const slideAtualizado = await Slide.findByIdAndUpdate(id, dadosAtualizados, { new: true });

        if (!slideAtualizado) {
            return res.status(404).json({ message: 'Slide não encontrado.' });
        }

        res.status(200).json(slideAtualizado);
        
        sendEventToAllClients(); 

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar slide', error: error.message });
    }
};

// DELETE /api/slides/:id
const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;

        const slideDeletado = await Slide.findByIdAndDelete(id);

        if (!slideDeletado) {
            return res.status(404).json({ message: 'Slide não encontrado.' });
        }
        
        res.status(204).send(); 
        
        sendEventToAllClients(); 

    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar slide', error: error.message });
    }
};



// CONTROLADOR DO TOTEM (SSE)

// GET /api/events
const connectTotem = async (req, res) => {
  
  // Configuração dos Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 
  
  // Armazena a Conexão
  const clientId = Date.now();
  const newClient = {
      id: clientId,
      res // Armazena o objeto de resposta
  };
  clients.push(newClient);
  
  console.log(`\n Novo cliente (totem) conectado. Total: ${clients.length}`);

  // Envio Inicial de slides
  await sendEventToAllClients();

  // fechamento da conexão
  req.on('close', () => {
    console.log(`\n Cliente (totem) ID ${clientId} desconectado.`);
    // Remove o cliente do array quando a conexão é fechada
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        clients.splice(index, 1);
    }
    console.log(`Clientes ativos: ${clients.length}`);
  });
};

module.exports = {
    createSlide,
    getAllSlides,
    updateSlide,
    deleteSlide,
    connectTotem,
    startHeartbeat
};