const INITIAL_STATE = {
    agendamentos: [],
};

//ESTRUTURA DE UM ESTADO

function agendamento(state = INITIAL_STATE, action) {
    switch (action.type) {
        case '@agendamento/ALL' : {

        } break

        default: return state;
    }
}

export default agendamento;