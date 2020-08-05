//importamos la conexion
const connection = require('../connection/db-Paciente');
const assert = require('assert');
const { ObjectID } = require('mongodb');

module.exports = {
    getPacients: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('paciente').find().toArray();
        //res.json(docs);
        await db.collection('paciente').find().toArray(function(err, result) {
            if (err) throw err;
            console.log("datos obtenidos");
            res.json(result);
        });
    },
    addPacients: async (req, res) => {
        const cultura = req.body; //creamos una nueva tarea
        const db = await connection(); // obtenemos la conexión
        //await db.collection('cultura').save(cultura);
        //await db.collection('paciente').insertOne(cultura);
        //await db.collection('cultura').insertMany(cultura);
        //console.log("dato agregado");
        await db.collection('paciente').insertOne(cultura, function(err, res) {
            if (err) throw err;
            console.log("dato agregado");
        });
    },
    deletePacients: async (req, res) => {
        const dato = req.params.id;
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('cultura').remove({
            _id: id
        });*/
        /*await db.collection('paciente').deleteOne({
            _id: ObjectID(dato)
        });
        console.log("Dato borrado");*/
        await db.collection('paciente').deleteOne({
            _id: ObjectID(dato)
        }, function(err, obj) {
            if (err) throw err;
            console.log("Dato borrado");
        });
    },
    updatePacients: async (req, res) => {
        const dato = req.params.id;
        //obtiene los datos a actualizar
        //const nuevoDato = req.body;
        const nuevoDato = { $set: req.body };
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('paciente').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato);
        console.log("Dato actualizado");*/
        await db.collection('paciente').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato, function(err, res) {
            if (err) throw err;
            console.log("Dato actualizado");
        });
    },
    getPacientsbyId: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        const dato = req.params.id; 
        //const cultura = await db.collection('paciente').find({_id: ObjectID(dato)}).toArray();
        //res.json(cultura);
        //console.log("Dato por id obtenido");
        await db.collection('paciente').find({_id: ObjectID(dato)}).toArray(function(err, result) {
            if (err) throw err;
            console.log("Dato por id obtenido");
            res.json(result);
        });
    }
}