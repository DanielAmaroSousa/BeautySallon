const express = require('express');
const router = express.Router();
const moment = require('moment');
const _ = require('lodash');

const Cliente = require('../models/cliente')
const Salao = require('../models/salao')
const Servico = require('../models/servico')
const Colaborador = require('../models/colaborador')
const Agendamento = require('../models/agendamento')

const Horario = require('../models/horario')
const util = require('../utils/util');
const colaborador = require('../models/colaborador');

router.post('/', async (req, res) => {
    try {
        const { clienteId, salaoId, servicoId, colaboradorId, data } = req.body;

        //CLIENTE
        const cliente = await Cliente.findById(clienteId).select('nome');

        //SALAO
        const salao = await Salao.findById(salaoId).select('nome');

        //SERVICO
        const servico = await Servico.findById(servicoId).select('titulo preco comissao duracao');

        //COLABORADOR
        const colaborador = await Colaborador.findById(colaboradorId).select('nome');

        //VERIFICAR SE EXISTE HORÁRIO DISPONIVEL


        //CRIAR AGENDAMENTO
        const agendamento = await new Agendamento({
            ...req.body,
            comissao: servico.comissao,
            valor: servico.preco,

        }).save()

        res.json({ agendamento });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


router.post('/filter', async (req, res) => {
    try {
        const { periodo, salaoId } = req.body;

        const agendamentos = await Agendamento.find({
            status: 'A',
            salaoId,
            data: {
                $gte: moment(periodo.inicio).startOf('day'),
                $lte: moment(periodo.final).endOf('day'),
            },
        });

        res.json({ agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;

        const servico = await Servico.findById(servicoId).select('duracao');

        const horarios = await Horario.find({salaoId});

        let agenda = [];
        let colaboradores = [];
        let lastDay = moment(data);
        let duracao = servico.duracao;
        

        //DURAÇÃO DO SERVIÇO - a minha duração já está em minutos e não em date
        /*
        const servicoMinutos = util.hourToMinutes(
            moment(servico.duracao).format('HH:mm')
        );
        */

        //QUANTOS SLOTS O SERVIÇO OCUPA

        const servicoSlots = util.sliceMinutes(
            servico.duracao,
            moment(servico.duracao).add(servico.duracao, 'minutes'),
            util.SLOT_DURATION
        ).length;

        for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
            const espacosValidos = horarios.filter((h) => {
                //VERIFICAR O DIA DA SEMANA
                const diaSemanaDisponivel = h.dias.includes(moment(lastDay).day());

                //VERIFICAR SERVICO DISPONIVEL
                const servicoDisponivel = h.servicos.includes(servicoId);

                return diaSemanaDisponivel && servicoDisponivel;
            });

            //VERIFICAR COLABORADORES COM SERVICO NO DIA E SEUS HORARIOS

            let todosHorariosDia = {};

            if (espacosValidos.length > 0) {

                for (let espaco of espacosValidos) {
                    for (let colaboradorId of espaco.colaboradores) {
                        if (!todosHorariosDia[colaboradorId]) {
                            todosHorariosDia[colaboradorId] = [];
                        }

                        todosHorariosDia[colaboradorId] = [
                            ...todosHorariosDia[colaboradorId],
                            ...util.sliceMinutes(
                                util.mergeDateTime(lastDay, espaco.inicio),
                                util.mergeDateTime(lastDay, espaco.fim),
                                util.SLOT_DURATION)
                        ]
                    }
                }



            }

            //OCUPACAO DE CADA COLABORADOR NO DIA
            for (let colaboradorId of Object.keys(todosHorariosDia)) {
                //RECUPERAR AGENDAMENTOS
                const agendamentos = await Agendamento.find({
                    colaboradorId,
                    data: {
                        $gte: moment(lastDay).startOf('day'),
                        $lte: moment(lastDay).endOf('day')
                    },
                }).select('data servicoId -_id').populate('servicoId', 'duracao');

                
                //RECUPERAR HORARIOS AGENDADOS

                let horariosOcupados = agendamentos.map((agendamento) => ({
                    inicio: moment(agendamento.data),
                    final: moment(agendamento.data).add(agendamento.servicoId.duracao, 'minutes'),

                }));

                //SLOTS DE HORARIO OCUPADOS PELOS AGENDAMENTOS
                horariosOcupados = horariosOcupados.map((horario) =>
                    util.sliceMinutes(horario.inicio, horario.final, util.SLOT_DURATION)).flat();


                //REMOVENDO OS SLOTS DE HORARIO OCUPADOS
                let horariosLivres = util.splitByValue(todosHorariosDia[colaboradorId].map((horarioLivre) => {
                    return horariosOcupados.includes(horarioLivre) ? '-' : horarioLivre;
                }), '-').filter((spaces) => spaces.length > 0);

                //VERIFICANDO SE EXISTE ESPACO SUFICIENTE NO SLOT
                
                horariosLivres = horariosLivres.filter(
                    (horarios) => horarios.length >= servicoSlots);

                horariosLivres = horariosLivres.map((slot) => 
                slot.filter((horario, index) => slot.length - index >= servicoSlots)).flat();

                //FORMATANDO HORARIOS DE 2 EM 2
                horariosLivres = _.chunk(horariosLivres, 2);

                //REMOVER COLABORADOR SE ESTE NÃO TIVER NENHUM ESPACO
                if (horariosLivres.length == 0) {
                    todosHorariosDia = _omit(todosHorariosDia, colaboradorId);
                } else {
                    todosHorariosDia[colaboradorId] = horariosLivres;
                };

                //VERIFICAR SE TEM ESPECIALISTA DISPONIVEL NAQUELE DIA
                const totalEspecialistas = Object.keys(todosHorariosDia).length;

                if (totalEspecialistas > 0) {
                    colaboradores.push(Object.keys(todosHorariosDia));
                    agenda.push({ [lastDay.format('YYYY-MM-DD')]: todosHorariosDia, });
                };
            }

            lastDay = lastDay.add(1, 'day');
        };


        //LISTAR OS COLABORADORES DISPONIVEIS
        colaboradores = colaboradores.flat();

        colaboradores = await colaborador.find({
            _id: { $in: colaboradores },
        }).select('nome foto');

            //SOMENTE O PRIMEIRO NOME
        colaboradores = colaboradores.map((c) =>
        ({
            ...c.doc,
            nome: c.nome.split(' ')[0],
        }));

        res.json({
            error: false,
            duracao,
            servicoSlots,
            colaboradores: _.uniq(colaboradores),
            agenda,
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/:salaoId', async (req, res) => {
    try {
        const salaoId = req.params.salaoId;

        const salaoHorario = await Horario.find({ salaoId: salaoId });
        res.json({ salaoHorario });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const horario = req.body;

        await Horario.findByIdAndUpdate(horarioId, horario);
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;

        await Horario.findByIdAndDelete(horarioId);
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;