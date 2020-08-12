const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
//const bodyParser= require('body-parser')
const app = express();

/*
//----------------------------------------//
//requerimos el modulo de mongoose
const mongoose = require('mongoose');
//conectamos a la bd
mongoose.connect('mongodb://localhost/Pacientes')
    .then(db => console.log('bd conectada')) //se usa una promesa para ver si se conecto
    .catch(err => console.log(err));
//----------------------------------------//
*/
    
//settings
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); //permite entender los datos que se envia desde un formulario html
//app.use(bodyParser.urlencoded({ extended: true }));

//routes
const authRouter = require('./routes/AuthRouter');
const route = require('./routes/Pacientes');
const route2 = require('./routes/Cultura');
const route3 = require('./routes/PreguntasRespuestas');
const route4 = require('./routes/NuevasPreguntas');
const route5 = require('./routes/Recetas');
app.use('/auth', authRouter);
app.use('/Paciente', route);
app.use('/Cultura', route2);
app.use('/Pregunta', route3);
app.use('/NPregunta', route4);
app.use('/Receta', route5);


app.listen(app.get('port'), () => {
    console.log('Servidor funcionando');
});