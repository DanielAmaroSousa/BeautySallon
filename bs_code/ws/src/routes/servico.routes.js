const express = require('express');
const router = express.Router();
//const busboy = require('busboy');
const aws = require('../services/aws');
const Salao = require('../models/salao');
const Arquivo = require('../models/arquivo');
const Servico = require('../models/servico');
const multer = require('multer')




//ROTA RECEBE FORMDATA
/*
router.post('/', async (req, res) =>{

    let bb = busboy({ headers: req.headers});
    

    bb.on('finish', async () =>{
        try {
            const { salaoId, servico } = req.body;
            let errors = [];
            let arquivos = [];

            if (req.files && Object.keys(req.files).lenght > 0) {
                for (let key of Object.keys(req.files)) {
                    const file = req.files[key];

                    const nameParts = file.name.split('.');
                    const fileName = `${new Date().getTime()}.${nameParts[nameParts.lenght -1]}}`;
                    const path = `servicos/${salaoId}/${fileName}`;

                    const response = await aws.uploadToS3(file, path);

                    if (response.error) {
                        errors.push({ error: true, message: response.message});
                    } else {
                        arquivos.push(path);
                    }
                };
            };

            if (errors.length > 0) {
                res.json(errors[0]);
                return false;
            };

            //CRIAR SERVIÇO
            let jsonServico = JSON.parse(req.body);
            const servicoCadastrado = await Servico(jsonServico).save();
        
            //CRIAR ARQUIVO
            arquivos = arquivos.map((arquivo) => ({
                referenciaID: servicoCadastrado._id,
                model: 'Servico',
                caminho: arquivo,
            }));

            await Arquivo.insertMany(arquivos);

            res.json({ servico: servicoCadastrado, arquivos}); 


        } catch (err){
            res.json({error: true, message: err.message});
        };


                
    });

    req.pipe(bb);

});       
*/

/*
router.post('/', async(req,res) =>{
    try {
        const servico = await new Servico(req.body).save();
        res.json({servico});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});
*/

const upload = multer();

router.post('/', upload.any(), async(req,res, next) =>{
    try {
        const { salaoId, servico } = req.body;
        let errors = [];
        let arquivos = [];

        if (req.files) {
            for (let key of Object.keys(req.files)) {
                const file = req.files[key];
                console.log(file);
                const nameParts = file.originalname.split('.');
                const fileName = `${new Date().getTime()}.${nameParts[nameParts.length -1]}`;
                const path = `servicos/${salaoId}/${fileName}`;
                console.log(path);
                
                const response = await aws.uploadToS3(file.buffer, path);

                if (response.error) {
                    errors.push({ error: true, message: response.message});
                } else {
                    arquivos.push(path);
                }
            };
        };

        if (errors.length > 0) {
            res.json(errors[0]);
            return false;
        };

        //CRIAR SERVIÇO
        let jsonServico = JSON.parse(servico);
        const servicoCadastrado = await Servico(jsonServico).save();
    
        //CRIAR ARQUIVO
        arquivos = arquivos.map((arquivo) => ({
            referenciaID: servicoCadastrado._id,
            modelo: 'Servico',
            caminho: arquivo,
        }));

        await Arquivo.insertMany(arquivos);

        res.json({ servico: servicoCadastrado, arquivos}); 

    } catch (err){
        res.json({error: true, message: err.message});
    }
});


router.put('/:id', upload.any(), async(req,res, next) =>{
    try {
        const { salaoId, servico } = req.body;
        let errors = [];
        let arquivos = [];

        if (req.files) {
            for (let key of Object.keys(req.files)) {
                const file = req.files[key];
                console.log(file);
                const nameParts = file.originalname.split('.');
                const fileName = `${new Date().getTime()}.${nameParts[nameParts.length -1]}`;
                const path = `servicos/${salaoId}/${fileName}`;
                console.log(path);
                
                const response = await aws.uploadToS3(file.buffer, path);

                if (response.error) {
                    errors.push({ error: true, message: response.message});
                } else {
                    arquivos.push(path);
                }
            };
        };

        if (errors.length > 0) {
            res.json(errors[0]);
            return false;
        };

        //ALTERAR SERVIÇO
        let jsonServico = JSON.parse(servico);
        await Servico.findByIdAndUpdate(req.params.id, jsonServico);
    
        //CRIAR ARQUIVO
        arquivos = arquivos.map((arquivo) => ({
            referenciaID: req.params.id,
            modelo: 'Servico',
            caminho: arquivo,
        }));

        await Arquivo.insertMany(arquivos);

        res.json({ error: false}); 

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.post('/delete-arquivo', async (req, res) => {
    try {
        const { id } = req.body;
        
        await aws.deleteFileS3(id);
        await Arquivo.findOneAndDelete({caminho: id});

        res.json({error: false});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.delete('/:id', async (req, res) => {
    try {

        //ALTERAR SERVIÇO
        const { id } = req.params;
        await Servico.findByIdAndUpdate( id , {status: 'E'});

        res.json({error: false});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        let servicosSalao = [];
        const servicos = await Servico.find({
            salaoId: req.params.salaoId,
            status: { $ne: 'E'}
        });

        for (let servico of servicos) {
            const arquivos = await Arquivo.find({
                model: 'Servico',
                referenciaId: servico._id
            });
            servicosSalao.push({ ... servico._doc, arquivos })

        }

        res.json({
            servicos: servicosSalao,
        });
        
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

module.exports = router;