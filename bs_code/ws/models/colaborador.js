const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const colaborador = new Schema({
    nome: {
        type: String,
        required: true,
    },
    foto: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    senha: {
        type: String,
        required: true,
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
        enum: ['M','F'],
        required: true,
    },
    status: {
        type: String,
        enum: ['A','I'],
        required: true,
        default: 'A',
    },
    contaBancaria: {
        titular: {
            type: String,
            required: true,
        },
        banco: {
            type: String,
            required: true,
        },
        iban: {
            type: String,
            required: true,
        },
    },
    recepientId: {
        type: String,
        required: true,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Colaborador', colaborador);