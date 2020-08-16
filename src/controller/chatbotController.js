const clasedialog = require('../models/dialogflow');
const tokens = require("../config/config");
const jwt = require("jsonwebtoken");
const { response } = require('express');

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
			res.json({
				token: "Token Invalido"
			})
		}

	}

};


module.exports = {
	getChatbot,
}
