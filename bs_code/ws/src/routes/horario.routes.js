const express = require('express');
const router = express.Router();
const Horario = require('../models/horario')

router.post('/', async(req,res) =>{
    try {
        const horario = await new Horario(req.body).save();
        res.json({horario});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/:salaoId', async(req,res) =>{
    try {
        const salaoId = req.params.salaoId;
        
        const salaoHorario = await Horario.find({ salaoId: salaoId});
        res.json({salaoHorario});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.put('/:horarioId', async(req,res) =>{
    try {
        const {horarioId} = req.params;
        const horario = req.body; 
        
        await Horario.findByIdAndUpdate( horarioId, horario);
        res.json({error: false});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.delete('/:horarioId', async(req,res) =>{
    try {
        const {horarioId} = req.params;
        
        await Horario.findByIdAndDelete( horarioId);
        res.json({error: false});
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

module.exports = router;