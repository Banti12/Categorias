const express = require('express');
const fs=require('fs');
const path=require('path');
const https=require('https');
const bodyParser= require('body-parser');
const Speech = require ('ssml-builder');
let conectar=require('./conexion');

var isFisrtTime = true;
let nombreIntent = "" ;
let pasadoIntent = "" ;
const nombre = 'Categorias';
const mensaje = 'Bienvenido a categorías';
const pause = '<break time="0.3s" />';
const saber_mas = '¿Quieres saber más?';
const Mensajeayuda = 'Hola mi nombre es Alexa, soy una herramienta que te podrá ayudar para la obtención de los datos de categorías.';

/*Efectos de alexa*/
const susurroA = '<amazon:effect name = "whispered">';
const susurroC = '</amazon:effect>';
const desepcionada = '<amazon:emotion name="disappointed" intensity="high">';
const emocionado = '<amazon:emotion name="excited" intensity="medium">';
const cerraremotion = '</amazon:emotion>';
const hablaEnrique = '<voice name="Enrique"><lang xml:lang="en-ES">';
const cerrarEnrique = '</lang></voice>';

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
app.get('/', function(req,res)
{
        res.send('hello Wordl!, soy banti ya entre:');
});
//aplicaciones para convertir a json y ssml
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
//app escucha en otro puerto
app.listen(8080);
// crea otra direccion que el cliente solicita en este caso, /categorias
app.post('/categorias' ,async function (req, res,next) {
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
			case 'informacion':
			var informa = [req.body.request.intent.slots.area.value, req.body.request.intent.slots.programa.value, req.body.request.intent.slots.categoria.value, quetrimestre(req.body.request.intent.slots.trimestre.value), req.body.request.intent.slots.anno.value];
			res.json(await info(informa));
			console.log("Sali");
			break;
		}
	}   	
});

/*Funcion para usar en los query's*/

async function queryprincipal (informa){
	let select = "select mt12,mt" + informa[3] + ",at" + informa[3] + ",p_nombre,unidad from datos where anno = '"+informa[4]+"' and siglas ilike '"+informa[0]+"' and programa ilike '"+informa[1]+"' and numero = '"+informa[2]+"' ; ";
        var respuestatrimestre = quetrimestreN(informa[3]);
        let respuesta = await conectar.qryCompleto(select,informa[3]);
        var promedio = prom(respuesta[0].mt12,respuesta[0].atN);
        let string = "" ;
	if(respuesta != null){
                string = respuesta[0].p_nombre + ' realizo ' + respuesta[0].atN + ' de ' + respuesta[0].mtN + ' ' + respuesta[0].laccion + ' que se programaron en el ' + respuestatrimestre + ', con lo que alcanzo un ' +  promedio + ' de la meta programada en el año ' + informa[4];
        }else{
                string = 'Lo siento, no pude encontrar la informacion solicitado, Revisa bien los datos solicitados';
        }
	return string;
}

/* Funciones que se utilizaran para los Intent request */

async function info(informa){
	let mensaje = await queryprincipal(informa);
	console.log(mensaje);
	const tempOutput = mensaje + pause ;
	const speechOutput = tempOutput;
	console.log("salli");
	console.log(speechOutput);
	const reprompt = 'En que otra cosa te puedo ayudar';
	const cardText = 'Informando';
	console.log("antes del return");
	return await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
}

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

/*Funciones especiicas */
function formatearNumero (num)
  {
    var respuesta;
    if(num < 10){
       respuesta = '00'+ num;
    }
    if(num>9 && j < 100){
        respuesta = '0'+ num;
    }
    if(num>=100){
        respuesta = ''+ num;
    }
    return respuesta;
  }

function quetrimestre (num)
{
   var respuesta;
    if(num == 1){
       respuesta = 3;
    }
    if(num == 2){
        respuesta = 6;
    }
    if(num == 3){
        respuesta = 9;
    }
    if(num == 4){
        respuesta = 12;
    }
    return respuesta;
}

function quetrimestreN (num)
{
   var respuesta;
    if(num == 3){
       respuesta = 'primer trimestre';
    }
    if(num == 6){
        respuesta = 'segundo trimestre';
    }
    if(num == 9){
        respuesta = 'tercer trimestre';
    }
    if(num == 12){
        respuesta = 'cuarto trimestre';
    }
    return respuesta;
} 

function prom(num,num1){
    var n = ((num1 * 100) / num).toFixed(2);
    var respu = n + '%';
    return respu;
}

/*finalmente creamos el servidor httpS que usa a app*/
https.createServer(httpsOptions,app).listen(port,function(){
        console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);
})
