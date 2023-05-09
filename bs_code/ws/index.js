const dotenv = require('dotenv');

const express = require('express');
const app = express();
const morgan = require('morgan');

dotenv.config();

require('./database');

//MIDDLEWARES
app.use(morgan('dev')); //opção do morgan para ser só utilizado em ambiente de desenvolvimento


//VARIABLES
app.set('port', 8000); //react não funciona na porta 3000

app.listen(app.get('port'), () => {
    console.log(`WS Escutando na porta ${app.get('port')}`);
});