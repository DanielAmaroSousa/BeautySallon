import { all, takeLatest, call } from 'redux-saga/effects';
import api from '../services/api';
import consts from '../../consts';

export function* filterAgendamento({ start, end }) {
    try {
        const res = yield call(api.post, '/agendamento/filter', {

        })
    }
    catch {
    }
}


export default all([
    takeLatest('@agendamento/FILTER', filterAgendamento)
]);