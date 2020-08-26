const jwt = require('../services/jwt');

const connection = require('../connection/db-Paciente');

const {
    ObjectID
} = require('mongodb');

async function signin(req, res) {
    let correo = req.body.correo;
    let contrasenia = req.body.contrasenia;
    const db = await connection();

    const access = await db.collection('paciente').find({
        "correo": correo,
        "contrasenia": contrasenia
    }).toArray(function (err, user) {
        if (!user[0]) {
            return res.status(400).json({
                message: 'EL USUARIO NO EXISTE'
            });
        } else {
            let perfil = {
                token: jwt.createUserToken(user[0]),
                /*token: jwt.createUserToken({
                    nombre: user.nombre,
                    apellidoPaterno: user.apellidoPaterno,
                    apellidoMaterno: user.apellidoMaterno,
                    dni: user.dni,
                    edad: user.edad,
                    fechaNacimiento: user.fechaNacimiento,
                    estadoCivil: user.estadoCivil,
                    numeroHistorial: user.numeroHistorial,
                    duracionTratamiento: user.duracionTratamiento,
                    periodo: user.periodo,
                    date: user.date,
                    idMedicoCabecera: user.idMedicoCabecera,
                    idReceta: user.idReceta,
                    correo: user.correo,
                    contrasenia: user.contrasenia,
                    rol: user.rol,
                    fechaRegistro: new Date()
                }),*/
                user: user[0]
            }
             res.status(200).json(perfil);
        }
       
      /*  if (err) throw err;
        console.log("datos obtenidos");
        res.json(access);*/
    });
}

async function logout(req, res) {

};

/*
module.exports ={login} ;

async function signin(req, res) {

    const user = await User.findOne({
        email: req.body.email
    })

    if (!user) {
        return res.status(404).send("The email doesn't exists")
    }

    const validPassword = await user.comparePassword(req.body.password, user.password);

    if (!true) {
        return res.status(401).send({
            auth: false,
            token: null
        });
    }
    const token = jwt.sign({
        id: user._id
    }, config.secret, {
        expiresIn: 60 * 60 * 24
    });
    console.log(token)
    res.status(200).json({
        auth: true,
        token
    });
}
async function signup(req, res) {

    try {
        // Receiving Data
        const {
            name,
            lastName,
            motherSurname,
            dni,
            age,
            specialty,
            role,
            date,
            email,
            password
        } = req.body;
        // Creating a new User
        const user = new User({
            name,
            lastName,
            motherSurname,
            dni,
            age,
            specialty,
            role,
            date,
            email,
            password
        });
        user.password = await user.encryptPassword(password);
        await user.save();
        // Create a Token
        const token = jwt.sign({
            id: user.id
        }, config.secret, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });

        res.json({
            auth: true,
            token
        });

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem registering your user');
    }
}
*/
module.exports = {
    signin,
    logout
}