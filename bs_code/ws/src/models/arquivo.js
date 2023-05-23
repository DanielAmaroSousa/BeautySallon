const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const arquivo = new Schema({
    refId: {
        type: Schema.Types.ObjectId,
        refPath: 'modelo', //referenciação dinâmica
    },
    modelo: {
        type: String,
        required: true,
        enum: ['Servico','Salao'],
    },
    caminho: {
        type: String,
        required: true,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Arquivo', arquivo);

//modules para upload de arquivo: connect-busboy busboy-body-parser aws-sdk
//arquivos não são enviados por json mas por formdata