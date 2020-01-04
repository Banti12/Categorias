const express = require('express');
const fs=require('fs');
const path=require('path');
const https=require('https');
const bodyParser= require('body-parser');
const Speech = require ('ssml-builder');

var isFisrtTime = true;
let nombreIntent = "" ;
const nombre = 'Categorias';
const mensaje = 'Bienvenido a categorías';
const reprompt = '¿En qué puedo ayudarte?';
const pause = '<break time="0.3s" />';
const saber_mas = '¿Quieres saber más?';
const Mensajeayuda = 'Hola mi nombre es Alexa, soy una herramienta que te podrá ayudar para la obtención de los datos de categorías.';

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
		isFisrtTime = false;
	}else if (req.body.request.type === 'IntentRequest') { 
		switch (req.body.request.intent.name) {
			case 'AMAZON.HelpIntent':
			res.json(ayuda());
			break;
			case 'Si':
			nombreIntent = req.body.request.intent.name;
			console.log(nombreIntent);
			let resultado = si();
			res.json(resultado);
			break;
		}
	}   	
});

/* Funciones que se utilizaran para los Intent request */

function bienvenida() {
    if (!isFisrtTime) {
      mensaje = '';
    }
    const tempOutput = mensaje + pause;
    const speechOutput = tempOutput;
    const more = 'Te puedo dar información sobre categorías';
    return buildResponseWithRepromt(speechOutput, false, 'Bienvenido a Alexa ', more);
  }

function ayuda() {
    const tempOutput = Mensajeayuda + pause;
    const speechOutput = tempOutput;
    const reprompt = '¿Te gustaría saber cómo preguntar para obtener la información?';
    const cardText = 'Te encuentras en el menu de ayuda';
    return buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
  }

async function si(){
  var jsonObj;
  const speechOutput = "";
  const reprompt = "";
  if(nombreIntent =='AMAZON.HelpIntent'){
      speechOutput = "Existen 3 formas de preguntar" + pause + "La primera consiste en decir categorias " + pause ;
      reprompt = '';
      const cardText = 'Formas de preguntar';
      jsonObj = buildResponseWithRepromt(speechOutput, false, cardText , reprompt);
  }
  return await jsonObj;
}

/* Funciones build response: ayudaran a formatear la salida a tipo alexa */

function buildResponse(speechText, shouldEndSession, cardText) {
    const speechOutput = "<speak>" + speechText + "</speak>"
    var jsonObj = {
      "version": "1.0",
      "response": {
        "shouldEndSession": shouldEndSession,
        "outputSpeech": {
          "type": "SSML",
          "ssml": speechOutput
        },
        "card": {
          "type": "Simple",
          "title": nombre,
          "content": cardText,
          "text": cardText
        }
      }
    }
    return jsonObj
  }

function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) { 
    const speechOutput = "<speak>" + speechText + "</speak>"
    var jsonObj = {
       "version": "1.0",
       "response": {
        "shouldEndSession": shouldEndSession,
         "outputSpeech": {
           "type": "SSML",
           "ssml": speechOutput
         },
       "card": {
         "type": "Simple",
         "title": nombre,
         "content": cardText,
         "text": cardText
       },
       "reprompt": {
         "outputSpeech": {
           "type": "PlainText",
           "text": reprompt,
           "ssml": reprompt
         }
       }
     }
   }
    return jsonObj
  }

function buildResponsebienvenida (speechText, shouldEndSession, cardText) {
    const mensaje = "<speak>" + speechText + "</speak>"
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
            }
        }
    }
    return jsonObj
}

//finalmente creamos el servidor httpS que usa a app
https.createServer(httpsOptions,app).listen(port,function(){
        console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);
})
