const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectURI = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connectURI.connection.host}`);
    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;