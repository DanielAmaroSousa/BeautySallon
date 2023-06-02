const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cliente = new Schema({
    nome: {
        type: String,
        required: true,
    },
    foto: String,
    email: {
        type: String,
        required: true,
    },
    senha: {
        type: String,
        default: null,
    },
    telefone: {
        type: String,
        required: true,
    },
    dataNascimento: {
        type: String,
        required: true,
    }, // YYYY-MM-DD
    sexo: {
        type: String,
        enum: ['M','F','O'], //O omisso não referido
        default: 'O',
    },
    status: {
        type: String,
        enum: ['A','I'],
        required: true,
        default: 'A',
    },
    endereco: {
        cidade: String,
        cp: String,
        rua: String,
        porta: String,
        pais: String,
    },
    nif: Number,
    dataCadastro: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Cliente', cliente);