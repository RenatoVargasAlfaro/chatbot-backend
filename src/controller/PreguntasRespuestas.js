//importamos la conexion
const connection = require('../connection/db-PreguntasRespuestas');
const assert = require('assert');
const { ObjectID } = require('mongodb');

module.exports = {
    getQuestion: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('PregRpta').find().toArray();
        //res.json(docs);
        await db.collection('PregRpta').find().toArray(function(err, result) {
            if (err) throw err;
            console.log("datos obtenidos");
            res.json(result);
        });
    },
    addQuestion: async (req, res) => {
        const cultura = req.body; //creamos una nueva tarea
        const db = await connection(); // obtenemos la conexión
        //await db.collection('cultura').save(cultura);
        //await db.collection('PregRpta').insertOne(cultura);
        //await db.collection('cultura').insertMany(cultura);
        //console.log("dato agregado");
        await db.collection('PregRpta').insertOne(cultura, function(err, res) {
            if (err) throw err;
            console.log("dato agregado");
        });
    },
    deleteQuestion: async (req, res) => {
        const dato = req.params.id;
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('cultura').remove({
            _id: id
        });*/
        /*await db.collection('PregRpta').deleteOne({
            _id: ObjectID(dato)
        });
        console.log("Dato borrado");*/
        await db.collection('PregRpta').deleteOne({
            _id: ObjectID(dato)
        }, function(err, obj) {
            if (err) throw err;
            console.log("Dato borrado");
        });
    },
    updateQuestion: async (req, res) => {
        const dato = req.params.id;
        //obtiene los datos a actualizar
        //const nuevoDato = req.body;
        const nuevoDato = { $set: req.body };
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('PregRpta').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato);
        console.log("Dato actualizado");*/
        await db.collection('PregRpta').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato, function(err, res) {
            if (err) throw err;
            console.log("Dato actualizado");
        });
    },
    getQuestionbyId: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        const dato = req.params.id; 
        //const cultura = await db.collection('PregRpta').find({_id: ObjectID(dato)}).toArray();
        //res.json(cultura);
        //console.log("Dato por id obtenido");
        await db.collection('PregRpta').find({_id: ObjectID(dato)}).toArray(function(err, result) {
            if (err) throw err;
            console.log("Dato por id obtenido");
            res.json(result);
        });
    }
}