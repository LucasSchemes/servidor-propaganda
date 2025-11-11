const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    duracao: {
        type: Number, 
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
    timestamps: true 
});

module.exports = mongoose.model('Slide', slideSchema);