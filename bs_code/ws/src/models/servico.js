const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const servico = new Schema({
    salaoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Salao',
        required: true,
    },
    titulo: {
        type: String,
        required: true,
    },
    foto: {
        type: String,
    },
    preco: {
        type: Number,
        required: true,
    },
    comissao: {
        type: Number, //% de sobre o preço
        required: true,
    },
    duracao: {
        type: Number, //minutos
        required: true,
    },
    recorrencia: {
        type: Number, //periodo aconselhado para refazer o servico
        required: true,
    },
    descricao: {
        type: String,
    },
    status: {
        type: String,
        enum: ['A','I','E'], //ativo, inativo, excluido
        required: true,
        default: 'A',
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Servico', servico);