const express = require('express');
const fs=require('fs');
const path=require('path');
const https=require('https');
const bodyParser= require('body-parser');
const Speech = require ('ssml-builder');

var isFisrtTime = true;
let nombreIntent = "" ;
let pasadoIntent = "" ;
const nombre = 'Categorias';
const mensaje = 'Bienvenido a categorías';
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
			pasadoIntent = req.body.request.intent.name;
			res.json(ayuda());
			break;
			case 'Si':
			res.json(si(pasadoIntent));
			break;
			case 'No':
                        res.json(no(pasadoIntent));
                        break;
			case 'AMAZON.StopIntent' :
			res.json(adios());
			break;
		}
	}   	
});

/* Funciones que se utilizaran para los Intent request */

function bienvenida() {
    if (!isFisrtTime) {
      mensaje = '';
    }
    const tempOutput = mensaje + pause + ', ¿En que te puedo ayudar?' + pause;
    const speechOutput = tempOutput;
    const more = 'Te puedo dar información sobre categorías';
    return buildResponseWithRepromt(speechOutput, false, 'Bienvenido a Alexa ', more);
  }

function ayuda() {
    const tempOutput = Mensajeayuda + pause + '¿Te gustaría saber cómo preguntar para obtener la información?' + pause;
    const speechOutput = tempOutput;
    const reprompt = '¿Te gustaría saber cómo preguntar para obtener la información?';
    const cardText = 'Te encuentras en el menu de ayuda';
    return buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
  }

function adios() {
    const tempOutput = 'Sigo a tus órdenes, nos vemos pronto. Adiós' + pause;
    const speechOutput = tempOutput;
    const cardText = 'Despedida';
    return buildResponse(speechOutput, true, cardText);
  }

function si(pasado){
  var jsonObj;
  if(pasado =='AMAZON.HelpIntent'){
      const tempOutput = 'Existen 3 formas de preguntar' + pause + 'La primera consiste en decir categorias' + pause + ', ¿En que te puedo ayudar?' + pause;
      const speechOutput = tempOutput;
      const reprompt = 'si quieres repetir';
      const cardText = 'Formas de preguntar';
      jsonObj = buildResponseWithRepromt(speechOutput, false, cardText , reprompt);
  }
  return jsonObj;
}

function no(pasado){
  var jsonObj;
  if(pasado =='AMAZON.HelpIntent'){
      const tempOutput = '¿En que te puedo ayudar?' + pause ;
      const speechOutput = tempOutput;
      const reprompt = 'Principal';
      const cardText = '¿En que te puedo ayudar?';
      jsonObj = buildResponseWithRepromt(speechOutput, false, cardText , reprompt);
  }
  return jsonObj;
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


//finalmente creamos el servidor httpS que usa a app
https.createServer(httpsOptions,app).listen(port,function(){
        console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);
})
