const clasedialog = require('../models/dialogflow');
const tokens = require("../config/config");
const jwt = require("jsonwebtoken");
const { response } = require('express');

const connection = require('../connection/db-NuevasPreguntas');

async function getChatbot(req, res) {

	const bearerheader = req.headers['authorization']

	if (typeof bearerheader !== 'undefined') {
		const bearerHeader = bearerheader.split(" ")
		const token = bearerHeader[1]
		console.log(token)
		try {
			const decoded = jwt.verify(token, tokens.USER_TOKEN)
			console.log(decoded)
			//console.log(sessionId)
			var textMessage = req.body.mensaje
			const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
			// Define session path
			const sessionPath = chatbot.sessionClient.sessionPath(chatbot.projectId, token);
			// The text query request.
			const request = {
				session: sessionPath,
				queryInput: {
					text: {
						text: textMessage,
						languageCode: clasedialog.projectId
					}
				}
			}
			try {
				respuesta = await chatbot.sessionClient.detectIntent(request)
				console.log('DialogFlow.sendTextMessageToDialogFlow: Detected intent');
				console.log(respuesta[0].queryResult.fulfillmentText)

				var arreglo = ["dolor en la frente", "dolor de frente", "dolor", "frente", "enrojecimiento de ojo",
					"ojo rojo", "rojo", "vision borrosa", "borrosa", "vision"]
				
				var band = false;

				if (respuesta[0].queryResult.fulfillmentText=="No comprendo lo consultado, ¿Podrías repetirlo?"){
					arreglo.forEach((e, i) => {
						if(request.queryInput.text.text.includes(e)){
							respuesta[0].queryResult.fulfillmentText="No tengo la respuesta ahora, pero indagaré para responderte luego"
							band=true
						}
					})
					if(band){
						const npregunta = {
							"consulta": request.queryInput.text.text,
							"enfermedad": "Glaucoma",
							"intencion": "Consulta Malestares",
							"estado": "Nuevo",
							"respuestas": []
						}
						const db = await connection(); // obtenemos la conexión
						await db.collection('nuevaspreguntas').insertOne(npregunta, (err, res) => {
							if (err) throw err;
							console.log("dato agregado");
						});
					}
				}
				
				var msjuteribot = respuesta[0].queryResult.fulfillmentText
				jsonmodel = {
					mensaje: msjuteribot,
					token: "Token valido"
				}
				res.json(jsonmodel)
			}
			catch (err) {
				console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
				throw err
			}

		} catch (err) {
			console.log(err);
			res.json({
				token: "Token Invalido"
			})

		}

	}

};

/*
async function addPhraTrainingResponse(req, res) {

	const bearerheader = req.headers['authorization']
	console.log("Entro al metodo entrenamiento")
	if (typeof bearerheader !== 'undefined') {
		const bearerHeader = bearerheader.split(" ")
		const token = bearerHeader[1]
		try {
			const decoded = jwt.verify(token, tokens.USER_TOKEN)
			var idintento = req.body.id
			var textMessage = req.body.frase

			try {
				let valor = testUpdateTrainingResponse(textMessage, idintento)
				console.log("VALORRR")
				console.log(valor)
				if (valor == 1) {
					msjuteribot = "Correcto"
				} else if (valor == 2) {
					msjuteribot = "No actualizo"
				} else {
					msjuteribot = "No detecto intent"
				}
				jsonmodel = {
					//mensaje: msjuteribot,
					token: "Token valido"
				}
				res.json(jsonmodel)

			}
			catch (err) {
				console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
				console.log("No entreno")
				throw err
			}

		} catch (err) {
			res.json({
				token: "Token Invalido"
			})
		}

	}

};

async function addPhraTrainingPhrases(req, res) {

	const bearerheader = req.headers['authorization']
	if (typeof bearerheader !== 'undefined') {
		const bearerHeader = bearerheader.split(" ")
		const token = bearerHeader[1]
		try {
			const decoded = jwt.verify(token, tokens.USER_TOKEN)
			var idintento = req.body.id
			var textMessage = req.body.frase
			try {
				let valor = testUpdateTraining(textMessage, idintento)
				console.log(valor)

				if (valor == 1) {
					msjuteribot = "Correcto"
				} else if (valor == 2) {
					msjuteribot = "No actualizo"
				} else {
					msjuteribot = "No detecto intent"
				}
				jsonmodel = {
				//	mensaje: msjuteribot,
					token: "Token valido"
				}
				res.json(jsonmodel)

			}
			catch (err) {
				console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
				console.log("No entreno")
				throw err
			}

		} catch (err) {
			res.json({
				token: "Token Invalido"
			})
		}

	}

};

*/

async function getIntent(id) {
	try {

		const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
		const agentPath = chatbot.intentsClient.projectAgentPath(chatbot.projectId);
		jsonmodel = {
			name: agentPath + '/intents/'+id,
			intentView: 'INTENT_VIEW_FULL',
			languageCode: 'es'
		}

		let responses = await chatbot.intentsClient.getIntent(jsonmodel)
		let response = responses[0]
		return new Promise((resolve, reject) => {
			resolve(response)
		})
	} catch (err) {
		return new Promise((resolve, reject) => {
			reject(err)
		})
	}
};

/*
async function testUpdateTrainingResponse(mensaje, id) {
	try {
		let intent = await getIntent(id)
		intent.messages[0].text.text.push(mensaje)
		try {
			let promesa = await updateIntent(intent)
			return 1
		} catch (e) {
			console.log(e)
			console.log('failed to update the intent')
			return 0
		}
	} catch (err) {
		console.log('failed to get intent')
		return 2
	}
}
*/

async function testUpdateTraining(id, mensajeP, mensajeR) {

	try {
		let intent = await getIntent(id)

		mensajeP.forEach((e, i) => {
			let trainingPhrase = {
				parts: [{ text: e }],
				type: 'EXAMPLE'
			}
			intent.trainingPhrases.push(trainingPhrase)
		})

		mensajeR.forEach((e, i) => {
			intent.messages[0].text.text.push(e)
		})
		

		try {
			let updatedIntent = await updateIntent(intent)
			return 1
		} catch (e) {
			console.log(e)
			console.log('failed to update the intent')
			return 0
		}
	} catch (err) {
		console.log('failed to get intent')
		return 2
	}
}


async function updateIntent(intent) {
	const request = {
		intent: intent,
		intentView: 'INTENT_VIEW_FULL'
	}
	try {
		const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
		let responses = await chatbot.intentsClient.updateIntent(request)
		return new Promise((resolve, reject) => {
			resolve(responses)
		})
	} catch (err) {
		console.log(err)
		return new Promise((resolve, reject) => {
			reject(err)
		})
	}
}






module.exports = {
	getChatbot,
	//addPhraTrainingPhrases,
	//addPhraTrainingResponse,
	testUpdateTraining
}
