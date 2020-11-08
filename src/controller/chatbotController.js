const clasedialog = require('../models/dialogflow');
const tokens = require("../config/config");
const jwt = require("jsonwebtoken");
const { response } = require('express');
const stringSimilarity = require('string-similarity');

const connection = require('../connection/db-NuevasPreguntas');
const connection2 = require('../connection/db-Chatbot');
const connection3 = require('../connection/db-PreguntasRespuestas');

const { ObjectID } = require('mongodb');


async function buscarconsulta(consulta) {

	const db3 = await connection3(); // obtenemos la conexión
	const pgtas1 = await db3.collection('PregRpta').find().toArray();
	const pgtas2 = await db3.collection('temporal').find().toArray();
	var arreglo = pgtas1.concat(pgtas2);
	var temp = []
	arreglo.forEach(e => {
		temp.push(e.consulta)
	})

	var similarity2 = stringSimilarity.findBestMatch(consulta, temp);

	if (similarity2.bestMatch.rating >= 0.5) {
		return arreglo[similarity2.bestMatchIndex].respuestas;
		//console.log(arreglo[similarity2.bestMatchIndex].respuestas);
	}

}


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

			//obtengo la enfermedad del paciente
			let en = decoded.enfermedad.toUpperCase();

			//------------------MANEJO DEL HOLA, SI Y NO EN EL CHATBOT 

			var arreglo1 = ['HOLA', 'HI', 'HELLO', 'HOLAA', 'HOOLA', 'HELLOOO', 'HOL', 'HEY',
				'HEEY', 'HOLA, COMO ESTAS?', 'HIII', 'HELL', 'HEEELL', 'HEEELLO',
				'HOOOLA, COOMOOO ESTAAAS?', 'HOOOLAAAA', 'HOOLAA', 'HOLA CAUSA',
				'HOLA BATERIA', 'HOLA A LOS AÑOS', 'HOLAA CAUSAA', 'HOLAA A LOS AÑOOS', 'HOLAA BATERIA',
				'HOLA MANO', 'HOLA MANITO', 'HOLA PRRO', 'HOLA PERRO', 'HOLAA MANOO',
				'HOLAA MANITOO', 'HOOLA PRROO', 'HOLAA PERRO']
			var similarity1 = stringSimilarity.findBestMatch(textMessage.toUpperCase(), arreglo1);

			if (similarity1.bestMatch.rating >= 0.5) {
				textMessage = 'Hola ' + en
			}

			//---------------------------------------

			var arreglo2 = ['NO', 'NOT', 'NEL', 'NEL PERRO', 'NEL PRRO', 'NADA', 'NO QUIERO', 'NOOP', 'NOP', 'AEA', 'AEA MANO', 'NO PE', 'NO FASTIDIES', 'NO FRIEGUES', 'NOOO', 'NO QUIERO',
				'NOOT', 'NAADAA', 'NEGATIVO', 'NEGATIVOOOOO', 'NEEEL', 'NEEL PERRO', 'NOO QUIEROO',
				'NADAAA', 'NADA NADA', 'NOO PEEE', 'AEA MONGOL', 'AEAAAA', 'NOO FASTIDIIES',
				'NOO FRIGUES', 'NADA PAPI', 'NAADA PAPI', 'NO MANO', 'NADA MANO', 'NADA MANITO',
				'NADA PRRO', 'NADA PERRO', 'NO CAUSA', 'NADA CAUSA', 'NEL MANO', 'NEL CAUSA']
			var similarity2 = stringSimilarity.findBestMatch(textMessage.toUpperCase(), arreglo2);

			if (similarity2.bestMatch.rating >= 0.5) {
				textMessage = 'No ' + en
			}


			//---------------------------------------

			var arreglo3 = ['SI', 'YES', 'OK', 'SI PERRO', 'SI PRRO', 'OKI', 'OKI DOKI', 'SIIIIP', 'SIIP',
				'CLARO', 'CLARO MANO', 'CLARO PE MANO', 'CLARO MANITO', 'CLARO PE MANITO', 'AFIRMATIVO',
				'SI GRACIAS', 'SI POR FAVOR', 'PUEDE SER', 'SII', 'YEES', 'OOOK', 'OKIII', 'OKII DOKII',
				'CLARIN', 'CLAROOO', 'CLARINETE', 'SII PERRO', 'SII PRRO', 'CLAROO MANO', 'CLAROOO PE MANOO',
				'CLAROOO MANITO', 'CLAROO, PE MANITO', 'AFIRMATIVOOO', 'CLARIN MANO', 'CLARINETE MANITO',
				'CLARO PAPI', 'CLARIN PAPI', 'CLARINETEE PAPI', 'SII GRACIIAS', 'SII POR FAVOOR', 'PUEEDEE SER']
			var similarity3 = stringSimilarity.findBestMatch(textMessage.toUpperCase(), arreglo3);

			if (similarity3.bestMatch.rating >= 0.5) {
				textMessage = 'Si ' + en
			}


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
				console.log(respuesta[0].queryResult.intent.displayName)


				//lo comentamos un ratito
				//let en = decoded.enfermedad.toUpperCase();

				var arreglo = ["dolor en la frente", "dolor de frente", "dolor", "frente", "frente dolor", "fastidio en la frente", "fastidia la frente",
					"molestia en la frente", "molestia la frente", "duele la frente", "duele mi frente", "dolor en mi frente", "mi frente", "duele",
					"incomodidad en la frente", "molestia en la frente", "molestia en frente", "molestia frente", "ojo enrojecido", "enrojecimiento de ojo",
					"ojo rojo", "rojo", "vision borrosa", "borrosa vision", "vision algo borrosa", "borrosa", "vision", "molestia ojo", "borrosa mi vision",
					"no veo bien", "veo nublado", "no veo correctamente", "vision nublada", "molestia en el ojo", "dolor en el ojo", "dolor de ojo",
					"incomodidad en mi frente", "incomodidad en la frente", "frente con incomodidad", "incomodidad en el ojo", "ojo incomodo",
					"incomodidad en mi ojo", "malestar en mi frente", "malestar en la frente", "malestar en el ojo", "malestar en mi ojo"]
				var band = false;
				var frase = 'Discomfort Intent' + ' - ' + en
				var variable = []

				if (en == 'GLAUCOMA') {

					frase = 'Discomfort Intent'

					//para que el buscar en la bd solo funcione para la intencion de sintomas y su bucle
					if (respuesta[0].queryResult.intent.displayName != frase &&
						respuesta[0].queryResult.intent.displayName != 'Discomfort Fallback Intent') {

					} else {


						//busca en la bd la consulta del usuario
						await buscarconsulta(textMessage).then(val => {
							if (val != undefined) {
								val.forEach((e, i) => {
									variable.push(e.text)
								})
							}

						})


						//si no lo encuentra en la bd, debe ver si es pregunta nueva o basurita
						if (variable[0] == undefined) {
							
							//para obtener de la base de datos la respuesta
							/*await buscarconsulta(textMessage).then(val => {
								val.forEach((e,i) => {
									variable.push(e.text)
								})
							})*/


							//para estar seguros de que no es un sintoma, sino basurita o nueva pregunta
							if (respuesta[0].queryResult.intent.displayName == 'Discomfort Fallback Intent') {

								//if (respuesta[0].queryResult.fulfillmentText=="No comprendo lo consultado, ¿Podrías repetirlo?"){
								arreglo.forEach((e, i) => {
									console.log()
									if (request.queryInput.text.text.includes(e)) {
										respuesta[0].queryResult.fulfillmentText = "No tengo la respuesta ahora, pero indagaré para responderte luego."
										band = true
									}
								})
								if (band) {
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
										//res.json("Agregado");
									});
								} else {
									respuesta[0].queryResult.fulfillmentText = "No comprendo lo consultado, ¿Podrías repetirlo?"
								}
								//}
							}

							//frase = 'Discomfort Intent'

						} else {
							respuesta[0].queryResult.fulfillmentText = variable[0]
						}

					}

				}

				var msjuteribot = respuesta[0].queryResult.fulfillmentText

				if (respuesta[0].queryResult.intent.displayName == frase ||
					respuesta[0].queryResult.intent.displayName == 'Discomfort Fallback Intent') {
					if(respuesta[0].queryResult.fulfillmentText != "No comprendo lo consultado, ¿Podrías repetirlo?"){
						msjuteribot = respuesta[0].queryResult.fulfillmentText + ' ¿Deseas algo más?'
					}
				}

				//var msjuteribot = respuesta[0].queryResult.fulfillmentText

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
			name: agentPath + '/intents/' + id,
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



async function createIntent(req, res) {
	try {

		var enfermedad = req.body.enfermedad.toUpperCase();
		var nombre = req.body.nombre;
		var descripcion = req.body.descripcion;
		var consulta = req.body.consulta;
		var respuestas = req.body.respuestas;
		const displayName = 'Welcome Intent -' + enfermedad;
		const displayName2 = 'Discomfort Intent - ' + enfermedad;
		const displayName3 = 'Discomfort Fallback Intent - ' + enfermedad;
		const displayName4 = 'Si Intent -' + enfermedad;
		const displayName5 = 'No Intent - ' + enfermedad;
		const displayName6 = 'Yes Farewell Intent - ' + enfermedad;
		const displayName7 = 'Farewell Intent - ' + enfermedad;

		const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
		const agentPath = chatbot.intentsClient.projectAgentPath(chatbot.projectId);


		/*-------------------------------INTENCION BIENVENIDA-------------------------------------------*/

		const trainingPhrasesParts1 = ['Hola ' + enfermedad, 'Hi ' + enfermedad];
		const messageTexts1 = ['Hola soy ' + nombre + ' ¿En que puedo ayudarte?'];

		const trainingPhrases1 = [];

		trainingPhrasesParts1.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase1 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases1.push(trainingPhrase1);
		});

		const messageText1 = {
			text: messageTexts1,
		};

		const message1 = {
			text: messageText1,
		};

		const outputContexts1 = [
			{
				name: 'projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad,
				lifespanCount: 1,
			}
		]

		const intent = {
			displayName: displayName,
			trainingPhrases: trainingPhrases1,
			messages: [message1],
			outputContexts: outputContexts1
		};
		const createIntentRequest = {
			parent: agentPath,
			intent: intent,
		};


		/*-------------------------INTENCION DEL SINTOMA----------------------------*/
		const trainingPhrasesParts2 = [consulta];
		var rptas = []
		respuestas.forEach(e => {
			rptas.push(e.text)
		})
		const messageTexts2 = rptas;

		const trainingPhrases2 = [];

		trainingPhrasesParts2.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase2 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases2.push(trainingPhrase2);
		});

		const messageText2 = {
			text: messageTexts2,
		};

		const message2 = {
			text: messageText2,
		};


		const inputcontext2 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad];

		const outputContexts2 = [
			{
				name: 'projects/oftalbot-rsd9/agent/sessions/-/contexts/Final',
				lifespanCount: 1,
			}
		]

		const intent2 = {
			displayName: displayName2,
			trainingPhrases: trainingPhrases2,
			messages: [message2],
			inputContextNames: inputcontext2,
			outputContexts: outputContexts2
		};
		const createIntentRequest2 = {
			parent: agentPath,
			intent: intent2,
		};


		/*------------------------------------------INTENCION BUCLE---------------*/

		const messageTexts3 = ['No comprendo lo consultado, ¿Podrías repetirlo?'];

		const messageText3 = {
			text: messageTexts3,
		};
		const message3 = {
			text: messageText3,
		};
		const inputcontext3 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad];

		const outputContexts3 = [
			{
				name: 'projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad,
				lifespanCount: 1,
			}
		]

		const intent3 = {
			displayName: displayName3,
			isFallback: true,
			messages: [message3],
			inputContextNames: inputcontext3,
			outputContexts: outputContexts3
		};
		const createIntentRequest3 = {
			parent: agentPath,
			intent: intent3,
		};



		/*-------------------------------INTENCION SI INTENT-------------------------------------------*/

		const trainingPhrasesParts4 = ['Si ' + enfermedad, 'Yes ' + enfermedad, 'Ok ' + enfermedad,
		'Siii ' + enfermedad, 'Si gracias ' + enfermedad, 'Si por favor ' + enfermedad,
		'Puede ser ' + enfermedad, 'Claro ' + enfermedad, 'Afirmativo ' + enfermedad];
		const messageTexts4 = ['Claro, ¿Ingresa otro síntoma, por favor?'];

		const trainingPhrases4 = [];

		trainingPhrasesParts4.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase4 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases4.push(trainingPhrase4);
		});

		const messageText4 = {
			text: messageTexts4,
		};

		const message4 = {
			text: messageText4,
		};


		const inputcontext4 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad];

		const outputContexts4 = [
			{
				name: 'projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad,
				lifespanCount: 1,
			}
		]

		const intent4 = {
			displayName: displayName4,
			trainingPhrases: trainingPhrases4,
			messages: [message4],
			inputContextNames: inputcontext4,
			outputContexts: outputContexts4
		};
		const createIntentRequest4 = {
			parent: agentPath,
			intent: intent4,
		};


		/*-------------------------------INTENCION NO INTENT-------------------------------------------*/

		const trainingPhrasesParts5 = ['No ' + enfermedad, 'Not ' + enfermedad, 'Nada ' + enfermedad,
		'Nooo ' + enfermedad, 'No gracias ' + enfermedad, 'No quiero ' + enfermedad,
		'No fastidies ' + enfermedad, 'Negativo ' + enfermedad, 'Nel ' + enfermedad];
		const messageTexts5 = ['Hasta luego, vuelva pronto'];

		const trainingPhrases5 = [];

		trainingPhrasesParts5.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase5 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases5.push(trainingPhrase5);
		});

		const messageText5 = {
			text: messageTexts5,
		};

		const message5 = {
			text: messageText5,
		};


		const inputcontext5 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad];

		const intent5 = {
			displayName: displayName5,
			trainingPhrases: trainingPhrases5,
			messages: [message5],
			inputContextNames: inputcontext5
		};
		const createIntentRequest5 = {
			parent: agentPath,
			intent: intent5,
		};


		/*-------------------------------INTENCION YES FAREWELL INTENT-------------------------------------------*/

		const trainingPhrasesParts6 = ['Si ' + enfermedad, 'Yes ' + enfermedad, 'Ok ' + enfermedad,
		'Siii ' + enfermedad, 'Si gracias ' + enfermedad, 'Si por favor ' + enfermedad,
		'Puede ser ' + enfermedad, 'Claro ' + enfermedad, 'Afirmativo ' + enfermedad];
		const messageTexts6 = ['Claro, ¿Ingresa otro síntoma, por favor?'];

		const trainingPhrases6 = [];

		trainingPhrasesParts6.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase6 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases6.push(trainingPhrase6);
		});

		const messageText6 = {
			text: messageTexts6,
		};

		const message6 = {
			text: messageText6,
		};


		const inputcontext6 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Final'];

		const outputContexts6 = [
			{
				name: 'projects/oftalbot-rsd9/agent/sessions/-/contexts/Saludo' + enfermedad,
				lifespanCount: 1,
			}
		]

		const intent6 = {
			displayName: displayName6,
			trainingPhrases: trainingPhrases6,
			messages: [message6],
			inputContextNames: inputcontext6,
			outputContexts: outputContexts6
		};
		const createIntentRequest6 = {
			parent: agentPath,
			intent: intent6,
		};



		/*-------------------------------INTENCION FAREWELL INTENT-------------------------------------------*/

		const trainingPhrasesParts7 = ['No ' + enfermedad, 'Not ' + enfermedad, 'Nada ' + enfermedad,
		'Nooo ' + enfermedad, 'No gracias ' + enfermedad, 'No quiero ' + enfermedad,
		'No fastidies ' + enfermedad, 'Negativo ' + enfermedad, 'Nel ' + enfermedad];
		const messageTexts7 = ['Hasta luego, vuelva pronto'];

		const trainingPhrases7 = [];

		trainingPhrasesParts7.forEach(trainingPhrasesPart => {
			const part = {
				text: trainingPhrasesPart,
			};

			// Here we create a new training phrase for each provided part.
			const trainingPhrase7 = {
				type: 'EXAMPLE',
				parts: [part],
			};

			trainingPhrases7.push(trainingPhrase7);
		});

		const messageText7 = {
			text: messageTexts7,
		};

		const message7 = {
			text: messageText7,
		};


		const inputcontext7 = ['projects/oftalbot-rsd9/agent/sessions/-/contexts/Final'];



		const intent7 = {
			displayName: displayName7,
			trainingPhrases: trainingPhrases7,
			messages: [message7],
			inputContextNames: inputcontext7
		};
		const createIntentRequest7 = {
			parent: agentPath,
			intent: intent7,
		};












		let listaintenciones = []
		await listIntents().then(v => {
			console.log(v)
			v[0].forEach((e, i) => {
				listaintenciones.push(e.displayName)
			})
		});
		console.log("-------------------------------")
		console.log(listaintenciones)

		band = listaintenciones.find(element => element == displayName2 || element == displayName3
			|| element == displayName || element == displayName4 || element == displayName5 || element == displayName6
			|| element == displayName7);

		if (!band) {
			// Create the intent
			const [response] = await chatbot.intentsClient.createIntent(createIntentRequest);
			const [response2] = await chatbot.intentsClient.createIntent(createIntentRequest2);
			const [response3] = await chatbot.intentsClient.createIntent(createIntentRequest3);
			const [response4] = await chatbot.intentsClient.createIntent(createIntentRequest4);
			const [response5] = await chatbot.intentsClient.createIntent(createIntentRequest5);
			const [response6] = await chatbot.intentsClient.createIntent(createIntentRequest6);
			const [response7] = await chatbot.intentsClient.createIntent(createIntentRequest7);

			console.log("----------------------------------------------")
			console.log(response);
			console.log("----------------------------------------------")
			console.log(response2);
			console.log("----------------------------------------------")
			console.log(response3);
			console.log("----------------------------------------------")
			console.log(response4);
			console.log("----------------------------------------------")
			console.log(response5);
			console.log("----------------------------------------------")
			console.log(response6);
			console.log("----------------------------------------------")
			console.log(response7);

			const db = await connection2(); // obtenemos la conexión
			const newBot = {
				nombre: nombre,
				enfermedad: enfermedad,
				descripcion: descripcion,
				intencion1: displayName,
				intencion2: displayName2,
				intencion3: displayName3,
				intencion4: displayName4,
				intencion5: displayName5,
				intencion6: displayName6,
				intencion7: displayName7,
				id1: response.name,
				id2: response2.name,
				id3: response3.name,
				id4: response4.name,
				id5: response5.name,
				id6: response6.name,
				id7: response7.name,
			}
			await db.collection('chatbot').insertOne(newBot, (err, result) => {
				if (err) throw err;
				console.log("chatbot agregado");
				//res.json("Agregado");
				res.json(newBot);
			});
		} else {
			return res.status(400).json({
				message: 'NO FUNCIONO'
			});
		}

	} catch (err) {
		return new Promise((resolve, reject) => {
			reject(err)
			console.log(err)
		})
	}
}


async function listIntents() {
	// Construct request

	const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
	const agentPath = chatbot.intentsClient.projectAgentPath(chatbot.projectId);

	console.log(agentPath);

	const request = {
		parent: agentPath,
	};
	let lista = await chatbot.intentsClient.listIntents(request);
	const variable = lista;
	return variable;
}


async function deleteIntents(req, res) {

	const chatbot = new clasedialog.DialogFlow(clasedialog.projectId)
	const agentPath = chatbot.intentsClient.projectAgentPath(chatbot.projectId);
	//console.log(agentPath);

	const db = await connection2(); // obtenemos la conexión
	const dato = req.params.id;


	let bot = 1;
	await db.collection('chatbot').find({ _id: ObjectID(dato) }).toArray().then(e => bot = e);

	console.log(bot[0].nombre);
	var id1 = bot[0].id1.split('/')[4]
	var id2 = bot[0].id2.split('/')[4]
	var id3 = bot[0].id3.split('/')[4]
	var id4 = bot[0].id4.split('/')[4]
	var id5 = bot[0].id5.split('/')[4]
	var id6 = bot[0].id6.split('/')[4]
	var id7 = bot[0].id7.split('/')[4]

	const intentPath = chatbot.intentsClient.intentPath(chatbot.projectId, id1);
	const request = { name: intentPath };
	// Send the request for deleting the intent.
	const result = await chatbot.intentsClient.deleteIntent(request);
	console.log(`Intent ${intentPath} deleted`);


	const intentPath2 = chatbot.intentsClient.intentPath(chatbot.projectId, id2);
	const request2 = { name: intentPath2 };
	// Send the request for deleting the intent.
	const result2 = await chatbot.intentsClient.deleteIntent(request2);
	console.log(`Intent ${intentPath2} deleted`);


	const intentPath3 = chatbot.intentsClient.intentPath(chatbot.projectId, id3);
	const request3 = { name: intentPath3 };
	// Send the request for deleting the intent.
	const result3 = await chatbot.intentsClient.deleteIntent(request3);
	console.log(`Intent ${intentPath3} deleted`);


	const intentPath4 = chatbot.intentsClient.intentPath(chatbot.projectId, id4);
	const request4 = { name: intentPath4 };
	// Send the request for deleting the intent.
	const result4 = await chatbot.intentsClient.deleteIntent(request4);
	console.log(`Intent ${intentPath4} deleted`);


	const intentPath5 = chatbot.intentsClient.intentPath(chatbot.projectId, id5);
	const request5 = { name: intentPath5 };
	// Send the request for deleting the intent.
	const result5 = await chatbot.intentsClient.deleteIntent(request5);
	console.log(`Intent ${intentPath5} deleted`);


	const intentPath6 = chatbot.intentsClient.intentPath(chatbot.projectId, id6);
	const request6 = { name: intentPath6 };
	// Send the request for deleting the intent.
	const result6 = await chatbot.intentsClient.deleteIntent(request6);
	console.log(`Intent ${intentPath6} deleted`);


	const intentPath7 = chatbot.intentsClient.intentPath(chatbot.projectId, id7);
	const request7 = { name: intentPath7 };
	// Send the request for deleting the intent.
	const result7 = await chatbot.intentsClient.deleteIntent(request7);
	console.log(`Intent ${intentPath7} deleted`);



	await db.collection('chatbot').deleteOne({
		_id: ObjectID(dato)
	}, (err, obj) => {
		if (err) throw err;
		console.log("Dato borrado");
		res.json("Borrado");
	});

	//return result;	

}


async function getIntents(req, res) {
	const db = await connection2(); // obtenemos la conexión
	//var docs = await db.collection('cultura').find().toArray();
	//res.json(docs);
	await db.collection('chatbot').find().toArray((err, result) => {
		if (err) throw err;
		console.log("datos obtenidos");
		res.json(result);
	});
}




module.exports = {
	getChatbot,
	//addPhraTrainingPhrases,
	//addPhraTrainingResponse,
	testUpdateTraining,
	createIntent,
	deleteIntents,
	getIntents
}
