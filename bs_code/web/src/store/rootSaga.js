import { all } from "redux-saga/effects";

import agendamento from "./modules/agendamento/sagas";

export default function* rootSaga() { 
    //*function é chamado generator function equivale a uma função assincrona (assync em que yield equivale a await)
    return yield all([agendamento]);
}