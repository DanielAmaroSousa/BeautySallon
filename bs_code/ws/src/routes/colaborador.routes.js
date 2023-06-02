const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Colaborador = require('../models/colaborador');
const SalaoColaborador = require('../models/relationships/salaoColaborador');
const ColaboradorServico = require('../models/relationships/colaboradorServico');



router.post('/', async(req,res) =>{
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction(); //uma sessão pode ter várias transações


    try {
        const { colaborador, salaoId} = req.body;
        let newColaborador = null;

        //VERIFICAR SE COLABORADOR EXISTE
        const existenteColaborador = await Colaborador.findOne({
            $or: [{ email: colaborador.email}, { telefone: colaborador.telefone}]
        });

        //SE NÃO EXISTE COLABORADOR
        if (!existenteColaborador) {

            //CRIAR CONTA BANCÁRIA (pagarme)
            //CRIAR RECEBEDOR (pagarme)
            //CRIAR COLABORADOR

            newColaborador = await Colaborador({... colaborador}).save( {session} );
            }


            //RELACIONAMENTO COM SALÃO

            const colaboradorId = existenteColaborador ? existenteColaborador._id : newColaborador._id;

            //VERIFICAR SE EXISTE RELACIONAMENTO COM O SALÃO

            const existenteRelationship = await SalaoColaborador.findOne({ salaoId, colaboradorId, status: { $ne: 'I'}});

            //NOVO RELACIONAMENTO

            if (!existenteRelationship) {
                await new SalaoColaborador({ salaoId, colaboradorId, status: colaborador.vinculo}).save({ session });
            }

            //ATUALIZAR RELACIONAMENTO
            if (existenteRelationship) {
                await SalaoColaborador.findOneAndUpdate(
                    { 
                        salaoId, 
                        colaboradorId,
                    },
                    { status: colaborador.vinculo},
                    { session }
                );
            }

            //RELACIONAMENTO COM ESPECIALIDADES 
 
            await ColaboradorServico.insertMany(
                colaborador.servicos.map((servicoId) =>     
                    ({
                        servicoId,
                        colaboradorId,
                    }),
                    { session }
                )
            );

            await session.commitTransaction();
            session.endSession();
        
        if (existenteColaborador && existenteRelationship) {
            res.json({ error: true, message: 'Colaborador já cadastrado'})
        } else {
            res.json({ error: false})
        }
 
    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.put('/:colaboradorId', async(req,res) =>{
    try {
        const { vinculo, vinculoId, servicos} = req.body;
        const { colaboradorId } = req.params;

        //VINCULO SALAO
        await SalaoColaborador.findByIdAndUpdate( vinculoId, { status: vinculo });

        //SERVICOS
        await ColaboradorServico.deleteMany(
            {colaboradorId}
        )

        await ColaboradorServico.insertMany(
            servicos.map((servicoId) =>     
                ({
                    servicoId,
                    colaboradorId,
                })
            )
        );

        res.json({error: false});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.delete('/vinculo/:id', async(req,res) =>{
    try {
        //VINCULO SALAO
        await SalaoColaborador.findByIdAndUpdate( req.params.id, { status: 'I' });

        res.json({error: false});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.post('/filter', async(req,res) =>{
    try {
        const colaboradores = await Colaborador.find( req.body.filters);
        //body: { "filters": {"sexo": "F"}}

        res.json({error: false, colaboradores});

    } catch (err){
        res.json({error: true, message: err.message});
    }
});

router.get('/salao/:salaoId', async(req,res) =>{
    try {

        const salaoId = req.params.salaoId;
        let listaColaboradores = [];

        const salaoColaboradores = await SalaoColaborador.find({salaoId, status: {$ne: 'I'}})
            .populate({path: 'colaboradorId', select: '-senha'})
            .select('colaboradorId dataCadastro status')
        ;
        
        for (let c of salaoColaboradores) {
            const servicos = await ColaboradorServico.find({
                colaboradorId: c.colaboradorId
            });

            listaColaboradores.push({
                ...c._doc,
                servicos,
            })

        }

        res.json({error: false, 
            Colaboradores: listaColaboradores.map((c) => ({
                ...c.colaboradorId,
                vinculoId: c._id,
                vinculo: c.status,
                servicos: c.servicos,
                dataCadastro: c.dataCadastro,
            }))
            //listaColaboradores
        });

    } catch (err){
        res.json({error: true, message: err.message});
    }
});



module.exports = router;