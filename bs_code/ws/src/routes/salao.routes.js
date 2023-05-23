const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servicos = require('../models/servico');
const turf = require('@turf/turf');

router.post('/', async(req,res) =>{
    try {
        const salao = await new Salao(req.body).save();
        res.json({salao});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/servicos/:salaoId', async(req,res) =>{
    try {
        const {salaoId} = req.params;
        const servicos = await Servicos.find({
            salaoId,
            status: 'A'
        }).select('_id titulo');

        /* [{ label: 'Servico', value: '12232323'}] */
        res.json({
            servicos: servicos.map((s) => (
                {label: s.titulo, value: s._id}
            ))
        });
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/:id', async(req,res) =>{
    try {
        const dadosSalao = await Salao.findById(req.params.id).select(
            'nome capa endereco.cidade geo.coordinates telefone');

        //DISTANCIA COM TURF
        const distance = turf.distance(
            turf.point(dadosSalao.geo.coordinates),
            turf.point([38.71074419869367, -9.245677539351096])
        );

        res.json({error: false, dadosSalao, distance});
        }
    catch (err){
        res.json({error: true, message: err.message});
    }
});

module.exports = router;