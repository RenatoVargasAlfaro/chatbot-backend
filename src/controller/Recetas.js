//importamos la conexion
const connection = require('../connection/db-Recetas');
const assert = require('assert');
const { ObjectID } = require('mongodb');

const path = require('path');
const { unlink } = require('fs-extra');

const cloudinary = require('cloudinary');
const cloud = require('../config/config')

cloudinary.config({
    cloud_name: cloud.cloud_name,
    api_key: cloud.api_key,
    api_secret: cloud.api_secret
})

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

        //guarda en cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        //console.log(result);
        //res.json("guardado")
   
        const rec = {
            titulo: receta.titulo,
            contenido: receta.contenido,
            filename : req.file.filename,
            path : '/img/uploads/' + req.file.filename,
            originalname : req.file.originalname,
            mimetype : req.file.mimetype,
            size : req.file.size,
            public_id: result.public_id,
            url: result.url          
        }
        //console.log(rec)
        //res.json("recibido")

        //borra de la carpeta public para evitar aumentar espacio
        await unlink(path.resolve('./src/public' + rec.path));

        //guarda en la bd
        await db.collection('Receta').insertOne(rec, (err, res) => {
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

        
        //permite borrarlo de cloudinary
        const receta = await db.collection('Receta').find({_id: ObjectID(dato)}).toArray();
        //await unlink(path.resolve('./src/public' + receta[0].path));
        const result = await cloudinary.v2.uploader.destroy(receta[0].public_id)
        
        //console.log(result)
        //console.log(receta)

        //lo borra de la bd
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
    },
    getRecipeString: async (req, res) => {
        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('Receta').find().toArray();
        //res.json(docs);
        var result = await db.collection('Receta').find().toArray();
        var arreglo = []

        result.forEach((elemento, index) => {
            //console.log(typeof(elemento.titulo))
            arreglo.push(elemento.titulo)
        });

        //console.log(typeof(arreglo.toString()))
        res.json(arreglo)
    },
    getRecipeTitle: async (req, res) => {
        const nombre = req.query.name;
        const tokens = nombre.split('$20')
        const frase = tokens.join(' ')

        const db = await connection(); // obtenemos la conexión
        //var docs = await db.collection('paciente').find().toArray();
        //res.json(docs);
        await db.collection('Receta').find({titulo: frase}).toArray((err, result) => {
            if (err) throw err;
            console.log("datos obtenidos");
            res.json(result);
        });
    }
}