const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationships/salaoCliente');


router.post('/', async(req,res) =>{
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction(); //uma sessão pode ter várias transações


    try {
        const { cliente, salaoId} = req.body;
        let newCliente = null;

        //VERIFICAR SE CLIENTE EXISTE
        const existenteCliente = await Cliente.findOne({
            $or: [{ email: cliente.email}, { telefone: cliente.telefone}]
        });

        //SE NÃO EXISTE CLIENTE
        if (!existenteCliente) {

            //CRIAR CLIENTE

            newCliente = await Cliente({... cliente}).save( {session} );
            }


            //RELACIONAMENTO COM SALÃO

            const clienteId = existenteCliente ? existenteCliente._id : newCliente._id;

            //VERIFICAR SE EXISTE RELACIONAMENTO COM O SALÃO

            const existenteRelationship = await SalaoCliente.findOne({ salaoId, clienteId, status: { $ne: 'I'}});

            //NOVO RELACIONAMENTO

            if (!existenteRelationship) {
                await new SalaoCliente({ salaoId, clienteId, status: cliente.vinculo}).save({ session });
            }

            //ATUALIZAR RELACIONAMENTO
            if (existenteRelationship) {
                await SalaoCliente.findOneAndUpdate(
                    { 
                        salaoId, 
                        clienteId,
                    },
                    { status: cliente.vinculo},
                    { session }
                );
            }

           
            await session.commitTransaction();
            session.endSession();
        
        if (existenteCliente && existenteRelationship) {
            res.json({ error: true, message: 'Cliente já cadastrado'})
        } else {
            res.json({ error: false})
        }
 
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.put('/:clienteId', async(req,res) =>{
    try {
        const { vinculo, vinculoId} = req.body;
        const { colaboradorId } = req.params;

        //VINCULO SALAO
        await SalaoCliente.findByIdAndUpdate( vinculoId, { status: vinculo });

        res.json({error: false});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.delete('/vinculo/:id', async(req,res) =>{
    try {
        //VINCULO SALAO
        await SalaoCliente.findByIdAndUpdate( req.params.id, { status: 'I' });

        res.json({error: false});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.post('/filter', async(req,res) =>{
    try {
        const clientes = await Cliente.find( req.body.filters);
        //body: { "filters": {"sexo": "F"}}

        res.json({error: false, clientes});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/salao/:salaoId', async(req,res) =>{
    try {

        const salaoId = req.params.salaoId;
        let listaClientes = [];

        const salaoClientes = await SalaoCliente.find({salaoId, status: {$ne: 'I'}})
            .populate({path: 'clienteId', select: '-senha'})
            .select('clienteId dataCadastro status')
        ;
        
        for (let c of salaoClientes) {
            listaClientes.push({
                ...c._doc,
            })

        }

        res.json({error: false, listaClientes

            /*
            Clientes: listaClientes.map((c) => ({
                ...c.clienteId,
                vinculoId: c._id,
                vinculo: c.status,
                dataCadastro: c.dataCadastro, */
            

        });

    } catch (err){
        res.json({error: true, message: err.message});
    }
});



module.exports = router;