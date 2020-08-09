//importamos la conexion
const connection = require('../connection/db-Recetas');
const assert = require('assert');
const { ObjectID } = require('mongodb');

module.exports = {
    getRecipe: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('Receta').find().toArray();
        //res.json(docs);
        await db.collection('Receta').find().toArray((err, result) => {
            if (err) throw err;
            console.log("datos obtenidos");
            res.json(result);
        });
    },
    addRecipe: async (req, res) => {
        const receta = req.body; //creamos una nueva tarea
        const db = await connection(); // obtenemos la conexión
        //await db.collection('cultura').save(cultura);
        //await db.collection('Receta').insertOne(cultura);
        //await db.collection('cultura').insertMany(cultura);
        //console.log("dato agregado");
        await db.collection('Receta').insertOne(receta, (err, res) => {
            if (err) throw err;
            console.log("dato agregado");
        });
    },
    deleteRecipe: async (req, res) => {
        const dato = req.params.id;
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('cultura').remove({
            _id: id
        });*/
        /*await db.collection('Receta').deleteOne({
            _id: ObjectID(dato)
        });
        console.log("Dato borrado");*/
        await db.collection('Receta').deleteOne({
            _id: ObjectID(dato)
        }, (err, obj) => {
            if (err) throw err;
            console.log("Dato borrado");
        });
    },
    updateRecipe: async (req, res) => {
        const dato = req.params.id;
        //obtiene los datos a actualizar
        //const nuevoDato = req.body;
        const nuevoDato = { $set: req.body };
        const db = await connection(); // obtenemos la conexión
        /*await db.collection('Receta').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato);
        console.log("Dato actualizado");*/
        await db.collection('Receta').updateOne({
            _id: ObjectID(dato)
        }, nuevoDato, (err, res) => {
            if (err) throw err;
            console.log("Dato actualizado");
        });
    },
    getRecipebyId: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        const dato = req.params.id; 
        //const cultura = await db.collection('Receta').find({_id: ObjectID(dato)}).toArray();
        //res.json(cultura);
        //console.log("Dato por id obtenido");
        await db.collection('Receta').find({_id: ObjectID(dato)}).toArray((err, result) => {
            if (err) throw err;
            console.log("Dato por id obtenido");
            res.json(result);
        });
    }
}