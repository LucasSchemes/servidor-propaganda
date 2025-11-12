const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
const pepper = process.env.PASSWORD_PEPPER || 'default-pepper-for-dev';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  hashPassword: {
    type: String,
    required: true,
  },
   createdAt: {
    type: Date,
    default: Date.now
    },
    role: {
    type: Number,
    enum: [0, 1],
    default: 0
}
});

userSchema.pre('save', async function (next) {
    // Se a senha (que agora é 'passwordHash') não foi modificada, retorna
    if (!this.isModified('hashPassword')) return next();
    
    try {
        // Usa o Argon2 com o pepper
        const password_pepper = this.passwordHash + pepper;

        this.passwordHash = await argon2.hash(password_pepper, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
        });

        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar a senha fornecida com a senha hasheada
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Adiciona o pepper à senha digitada
    const password_pepper = enteredPassword + pepper;
    // Usa o Argon2 para verificar
    return argon2.verify(this.passwordHash, password_pepper);
};

module.exports = mongoose.model('User', userSchema);