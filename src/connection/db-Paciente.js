const { MongoClient } = require('mongodb');

// Nombre de bd
const dbName = 'Pacienteeeee';
// Conexión URL (estas corriendo en local :D)
//const url = 'mongodb://localhost:27017';

const config = require('../config/config');

let calendarioClient = null

const getPacienteClient = async () => {
  try {
    if(calendarioClient) return calendarioClient
    calendarioClient = await MongoClient.connect(config.URL, {
      useUnifiedTopology: true,
    });
    // const db = calendarioClient.db(dbName);
    return calendarioClient
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  getPacienteClient,
  dbName
}