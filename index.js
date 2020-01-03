const express = require('express');
const fs=require('fs');
const path=require('path');
const https=require('https');
const bodyParser= require('body-parser');
const Speech = require ('ssml-builder');

const mensaje = 'Bienvenido a categorias';
const reprompt = '¿En qué puedo ayudarte?';
const pause = '<break time="0.3s" />';
const saber_mas = '¿Quieres saber más?';

//@param app es lo que va a ejecutar la app
const app=express();
const directoryToServe='client'
//Puerto 443 especificado super importante
const port=443;
const httpsOptions =
{
	cert:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/fullchain.pem"),
	key:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/privkey.pem")
}
//Que hace en la raiz
app.get('/',function(req,res)
{
        res.send('hello Wordl!, soy banti ya entre:');
});
//aplicaciones para convertir a json y ssml
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
//app escucha en otro puerto
app.listen(8080);
// crea otra direccion que el cliente solicita en este caso, /categorias
app.post('/categorias' , (req, res,next) => {
	if (req.body.request.type === 'LaunchRequest') {
    		res.json(bienvenida());
	}    	
});

function bienvenida() {
    const tempOutput = mensaje + pause;
    const speechOutput = tempOutput;
    const more = 'Te puedo dar información sobre categorías';
console.log("hola1");
    return buildResponsebienvenida(speechOutput, false, more); 
  }

function buildResponsebienvenida (speechText, shouldEndSession, cardText) {
  
    const mensaje = "<speak>" + speechText + "</speak>"
console.log("entre");
    var jsonObj = {
        "version": "1.0",
        "response": {
	    "shoulEndSession": shouldEndSession,
            "outputSpeech": {
            "type": "SSML",
            "ssml": mensaje
            },
            "card": {
            "type": "Simple",
            "title": "Bienvenida",
            "content": cardText
            },
            "reprompt": {
            "outputSpeech": {
                "type": "SSML",
                "ssml": cardText
            }
            },
            //"shouldEndSession": shouldEndSession
        }
    }
    console.log("hola2!");
    return jsonObj
}

//finalmente creamos el servidor httpS que usa a app
https.createServer(httpsOptions,app).listen(port,function(){
        console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);
})
