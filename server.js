const express  = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/serverPropaganda';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const slideSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    duracao: {
        type: Number, // segundos
        required: true
    },
    conteudoHTML: {
        type: String,
        required: true
    },
    dataExpiracao: {
        type: Date,
        required: true
    }
}, { 
    timestamps: true // createdAt e updatedAt automáticos
});

const Slide = mongoose.model('Slide', slideSchema);

const clientes = [];

// Função para enviar eventos SSE para todos os clientes conectados
async function enviarEventoParaClientes(evento) {
    try {
        const slidesAtivos = await Slide.find({ dataExpiracao: { $gt: new Date() } }).sort({ createdAt: 1 });
    const dados = 'data: ${JSON.stringify(slidesAtivos)}\n\n';
    console.log ('Enviando atualizações. Slides válidos: $slidesAtivos.length. Clientes conectados: ${clientes.length}');

    clientes.forEach(cliente => {
        try {
            cliente.res.write(dados);
        }
        catch (err) {
            console.log('Erro ao enviar dados para cliente.',err.message);
            cliente.res.end();
        }
    });
}
    catch (err) {
        console.log('Erro ao enviar ou buscar slides ativos para clientes SSE.', err.message);
    }
}

app.get('/', (req, res) => {
    res.status(200).json (
        { message: 'Servidor de Propaganda Rodando',
         admin_api: '/api/slides',
         totem_events: '/api/events'
        }
    );
});

// criar novos slides
app.post('/api/slides', async (req, res) => {
    
    try {
        const { titulo, duracao, conteudoHTML, dataExpiracao } = req.body;
        if (!titulo || !duracao || !conteudoHTML || !dataExpiracao) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        const novoSlide = new Slide({ 
            titulo, 
            duracao, 
            conteudoHTML, 
            dataExpiracao 
        });
        
        await novoSlide.save();
        res.status(201).json(novoSlide);
        enviarEventoParaClientes('novo_slide'); //notificar clientes SSE
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao criar slide.', error: err.message });
    }
});

// listar slides para admin
app.get('/api/slides', async (req, res) => {
    try {
        const slides = await Slide.find.sort({ createdAt: -1 }); // mais recentes primeiro
        res.json(slides);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar slides.', error: err.message });
    }
});

app.put ('/api/slides/:id', async (req, res) => {
    try {
        const slidesId = req.params.id;
        const dadosAtualizados = req.body;
        const slideAtualizado = await Slide.findByIdAndUpdate(slidesId, dadosAtualizados, { new: true });

        if (!slideAtualizado) {
            return res.status(404).json({ message: 'Slide não encontrado.' });
        }
        res.status(200).json(slideAtualizado);
        enviarEventoParaClientes('atualizacao_slide'); //notificar clientes SSE
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar slide.', error: err.message });
    }
});

app.delete('/api/slides/:id', async (req, res) => {
    try {
        const slidesId = req.params.id;
        const slideRemovido = await Slide.findByIdAndDelete(slidesId);
        
        if (!slideRemovido) {
            return res.status(404).json({ message: 'Slide não encontrado.' });
        }
        res.status(204).send();
        enviarEventoParaClientes('remocao_slide'); //notificar clientes SSE
    }
    catch (err) {
        res.status(500).json({ message: 'Erro ao remover slide.', error: err.message });
    }
});

// Rota conexão totem (cliente)
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clienteId = Date.now();
    const novoCliente = {
        id: clienteId,
        res
    };
    clientes.push(novoCliente);
    console.log('Cliente conectado para SSE. Total de clientes: ${clientes.length}');

    enviarEventoParaClientes('conexao_cliente');

    req.on('close', () => {
        const index = clientes.findIndex(c => c.id === clienteId);
        if (index !== -1) {
            clientes.splice(index, 1);
        }
        console.log('Clientes ativos após desconexão: ${clientes.length}');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
