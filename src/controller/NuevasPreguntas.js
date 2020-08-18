//importamos la conexion
const connection = require('../connection/db-NuevasPreguntas');
const connection2 = require('../connection/db-PreguntasRespuestas');
const assert = require('assert');
const { ObjectID } = require('mongodb');

module.exports = {
    getNewQuestion: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('nuevaspreguntas').find().toArray();
        //res.json(docs);
        await db.collection('nuevaspreguntas').find().toArray((err, result) => {
            if (err) throw err;
            console.log("datos obtenidos");
            res.json(result);
        });
    },
    //agrega la pregunta nueva a la bd de nuevas preguntas
    addNewQuestion: async (req, res) => {
        const npregunta = req.body; //creamos una nueva tarea
        const db = await connection(); // obtenemos la conexión
        //await db.collection('cultura').save(cultura);
        //await db.collection('nuevaspreguntas').insertOne(cultura);
        //await db.collection('cultura').insertMany(cultura);
        //console.log("dato agregado");
        await db.collection('nuevaspreguntas').insertOne(npregunta, (err, res) => {
            if (err) throw err;
            console.log("dato agregado");
        });
    },
    //agrega las preguntas ya resueltas a la bd de datos de preguntas-respuestas y la elimina de nuevas-preguntas
   addQuestions: async (req, res) => {

        const db = await connection(); // obtenemos la conexión de nuevas preguntas
        const db2 = await connection2(); // obtenemos la conexión de preguntas respuestas
        const respuestas = Array.from(req.body); //obtenemos las preguntas resueltas enviadas

        //OJOOOOOO: Para colocar un id incremental
        var result = await db2.collection('PregRpta').find().limit(1).sort({id:-1}).toArray(); 
        let n=0;

        if(result[0]!=null){
            console.log("se hace el proceso");
            n = result[0].id+1;
        }

        respuestas.forEach((elemento, index) => {
            elemento.id=index+n;
        });


        //obtenemos las preguntas respondidas y luego lo guardo en la bd de preguntas respuestas
            //await db2.collection('PregRpta').insertMany(respuestas); 
        await db2.collection('PregRpta').insertMany(respuestas,(err, res) => {
            if (err) throw err;
            console.log("Datos insertados");
        }); 


        //elimino todo el contenido de la bd nuevas preguntas
            //await db.collection('nuevaspreguntas').deleteMany(); 
        await db.collection('nuevaspreguntas').deleteMany((err, obj) => {
            if (err) throw err;
            console.log("Datos borrados")
        });
        console.log("datos respondidos y eliminados");
    },
    deleteNewQuestion: async (req, res) => {
        const dato = req.params.id;
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('cultura').remove({
            _id: id
        });*/
        /*await db.collection('nuevaspreguntas').deleteOne({
            _id: ObjectID(dato)
        });
        console.log("Dato borrado");*/
        await db.collection('nuevaspreguntas').deleteOne({
            _id: ObjectID(dato)
        }, (err, obj) => {
            if (err) throw err;
            console.log("Dato borrado");
        });
    },
    updateNewQuestion: async (req, res) => {
        const dato = req.params.id;
        //obtiene los datos a actualizar
        //const nuevoDato = req.body;
        const nuevoDato = { $set: req.body };
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('nuevaspreguntas').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato);
        console.log("Dato actualizado");*/
        await db.collection('nuevaspreguntas').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato, (err, res) => {
            if (err) throw err;
            console.log("Dato actualizado");
        });
    },
    getNewQuestionbyId: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        const dato = req.params.id; 
        //const cultura = await db.collection('nuevaspreguntas').find({_id: ObjectID(dato)}).toArray();
        //res.json(cultura);
        //console.log("Dato por id obtenido");
        await db.collection('nuevaspreguntas').find({_id: ObjectID(dato)}).toArray((err, result) => {
            if (err) throw err;
            console.log("Dato por id obtenido");
            res.json(result);
        });
    }
}