/**
 *  * @author Banti Serna Brandon Aldair
 *   * Programa realizado por Banti Serna Brandon Aldair
 *     El programa se conecta con Alexa mandando información que se encuentra en la base de datos categorías.
 *      */

/**
 * @param port puerto 443 pedido por Alexa
 * @param fs
 * @param path
 * @param bodyParser
 * @param Speech
 * @param httpsOptions variable que obtiene el certificado y llave del servidor
 */
const express = require('express');
const fs=require('fs');
const path=require('path');
const https=require('https');
const bodyParser= require('body-parser');
const Speech = require ('ssml-builder');
let conectar=require('./conexion');
let fecha = new Date();
var isFisrtTime = true;
let nombreIntent = "" ;
let annopasado = "";
let informapasado = "";
let informacion;
let informacionpalmas;
let repito;
/**
 * @param nombre variable que guarda el nombre de la skill
 * @param mensaje variable que tiene un mensaje de bienvenida guardado
 * @param pause variable el cual guarda una sentencia que ayuda a poner pause al la lectura de alexa
 * @param saber_mas mensaje
 * @param mensajeayuda  guarda mensaje
 */
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
      } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */ 
      log("Session End");
      req.body.session.new=true;
      }else if (req.body.request.type === 'IntentRequest') { 
		switch (req.body.request.intent.name) {
			case 'AMAZON.HelpIntent':
			pasadoIntent = req.body.request.intent.name;
			repito = ayuda();
			res.json(repito);
			break;
			case 'AMAZON.YesIntent':
			repito = await si(pasadoIntent,informapasado);
			res.json(repito);
			break;
			case 'AMAZON.NoIntent':
			repito = no(pasadoIntent);
                        res.json(repito);
                        break;
			case 'AMAZON.RepeatIntent':
			if(repito != undefined && repito != null){
          			res.json(repito);
        		}else{
          			repito=defaul();
          			res.json(repito);
        		}
			break;
			case 'AMAZON.StopIntent' :
			repito = adios();
			res.json(repito);
			break;
			case 'informacion':
			var informa = [req.body.request.intent.slots.area.value, req.body.request.intent.slots.programa.value, req.body.request.intent.slots.categoria.value, quetrimestre(req.body.request.intent.slots.trimestre.value), req.body.request.intent.slots.anno.value];
			repito = await info(informa);
			res.json(repito);
			pasadoIntent = req.body.request.intent.name;
			informapasado = [req.body.request.intent.slots.area.value, req.body.request.intent.slots.programa.value, req.body.request.intent.slots.categoria.value, quetrimestre(req.body.request.intent.slots.trimestre.value), req.body.request.intent.slots.anno.value - 1];
			break;
			case 'palmas' :
			var informa = [req.body.request.intent.slots.categorias_p.value," ", " " , req.body.request.intent.slots.anno_p.value];
			repito = await pal(informa);
			res.json(repito);
			break;
			case 'avance' :
			let annoA;  
			if( req.body.request.intent.slots.anno_a.value == undefined  || req.body.request.intent.slots.anno_a.value == null ){
    				annoA = fecha.getFullYear();
			  } else{
    				annoA = req.body.request.intent.slots.anno_a.value;
  			  }
			var informa = [req.body.request.intent.slots.categorias_a.value, req.body.request.intent.slots.area_a.value, quetrimestre(req.body.request.intent.slots.trimestre_a.value), annoA];
			pasadoIntent = req.body.request.intent.name;
			informapasado = [req.body.request.intent.slots.categorias_a.value, req.body.request.intent.slots.area_a.value, quetrimestre(req.body.request.intent.slots.trimestre_a.value), annoA - 1];
			informacion = informa;
			informacionpalmas = informa;
			repito = await avan(informa)
			res.json(repito);
			break;
			default:
			repito = defaul();
			res.json(repito);
			break;
		}
	}   	
});

/*Funcion para usar en los query's*/

async function queryprincipal (informa){
  let string =  " ";
  if(informa[4] > 2017){
    let select = "select mt12,mt" + informa[3] + ",at" + informa[3] + ",p_nombre,unidad from datos where anno = '"+informa[4]+"' and siglas ilike '"+informa[0]+"' and programa ilike '"+informa[1]+"' and numero = '"+informa[2]+"' ; ";
    var respuestatrimestre = quetrimestreN(informa[3]);
    let respuesta = await conectar.qryCompleto(select,informa[3]);
    var promedio = prom(respuesta[0].mt12,respuesta[0].atN); 
    string = 'Lo siento, no pude encontrar la información solicitado, Revisa bien los datos solicitados' + hablaEnrique +  ' Si persiste el problema por favor de ponerse en contacto con Alfonso ' + cerrarEnrique + '¿En qué otra cosa te puedo ayudar?' ;
    if(respuesta != null){
            string = respuesta[0].p_nombre + ' realizo ' + respuesta[0].atN + ' de ' + respuesta[0].mtN + ' ' + respuesta[0].laccion + ' que se programaron en el ' + respuestatrimestre + ', con lo que alcanzo un ' +  promedio + ' de la meta programada en el año ' + informa[4];
    }else {
            string = 'Lo siento, no pude encontrar la informacion solicitado, Revisa bien los datos solicitados';
    }
  }else{
    string = 'Lo siento, solo tengo información del 2018 en adelante. ¿En qué otra cosa te puedo ayudar?'
  }
  return string;
}

async function querypalmas (informa){
  let sqlcat = informa[0].replace(/ /g,'');
  let numC = parseInt(sqlcat);
  let string = 'Lo siento, no pude encontrar la información solicitado. Revisa bien los datos solicitados' + susurroA +  ' Si persiste el problema por favor de ponerse en contacto con Alfonso ' + susurroC + '¿En qué otra cosa te puedo ayudar?' ;
  var sqlanno;
  if(informa[3] == undefined  || informa[3] == null ){
    sqlanno = fecha.getFullYear();
  } else{
    sqlanno = informa[3];
  }
  let select =  " select DISTINCT(area) AS area , sum(mt12) AS mt12 from datos1 where anno = '"+sqlanno+"' and categoria = '"+sqlcat+"' group by area order by mt12 desc";
  let respuesta = await conectar.qryCompletoPalmas(select);
  select = "select categoria from catalogo_categorias where id = '"+numC+"'";
  let sqlnombre = await conectar.qryCompletonombre(select); 
  if(respuesta != null){
            switch (respuesta.length){
              case 3:
		string = 'En ' + sqlnombre + ', el primer lugar es para el área ' +  respuesta[0].area + ' que realizo ' + respuesta[0].mt12  + ' unidades. '+ pause  + 'El segundo lugar es para el área ' +  respuesta[1].area + ' que realizo ' + respuesta[1].mt12 + ' unidades. ' + 'El tercer lugar es para el área ' +  respuesta[2].area + ' que realizo ' + respuesta[2].mt12 + ' unidades, que se programarón en el ' + sqlanno;
		break;
              case 2:
		string = 'En ' + sqlnombre + ', el primer lugar es para el área ' +  respuesta[0].area + ' que realizo ' + respuesta[0].mt12  + ' unidades. '+ pause  + 'El segundo lugar es para el área ' +  respuesta[1].area + ' que realizo ' + respuesta[1].mt12 + ' unidades, que se programarón en el ' + sqlanno;
              break;
              case 1:
		string = 'En ' + sqlnombre + ', el primer lugar es para el área ' +  respuesta[0].area + ' que realizo ' + respuesta[0].mt12  + ' unidades, que se programarón en el ' + sqlanno;
              break;
            }
    } else {
            string = 'Lo siento, no pude encontrar la informacion solicitado, Revisa bien los datos solicitados';
    }  
  return string;
}

async function queryavan (informa){
  var sqlcat = informa[0].replace(/ /g,'');
  var sqlarea = informa[1].replace(/ /g,'.');
  sqlarea = sqlarea.replace(/ /g,'');
  let sqlanno = informa[3];
  let numC = parseInt(sqlcat);
  let string =  " ";
  if(sqlanno > 2017)
  {
  	if((numC == 13) || (numC == 19) || (numC == 21) || (numC == 23) || (numC == 38) || (numC == 39) ||(numC == 116) || (numC == 117) ||(numC == 122) ){
		string = 'Lo siento, no pude encontrar la información solicitado. Revisa bien los datos solicitados' + '¿En qué otra cosa te puedo ayudar?' ;  
	}else{
  		let select =  " ";
  		var sqltri;
  		var sqlmt;
  		var sqlat;
  		let respuesta;
  		var promedio;
  		if(informa[2] == undefined || informa[2] == null ){
      			sqltri =quetrimestreN ( fecha.getMonth()+1);
      			sqlmt = quetrimestreMes (fecha.getMonth()+1);
 		}else{
      			sqltri = quetrimestreN (informa[2]);
      			sqlmt = informa [2];
  		}
  		select = "select sum(at" + sqlmt +" ) as at , sum(mt" + sqlmt +") as mt , sum(mt12) as mt12 from datos1 where anno = '"+sqlanno+"' and categoria = '"+sqlcat+"' and area ilike '"+sqlarea+"' ;";
		respuesta = await conectar.qryCompletoavan(select,sqlmt);
  		promedio = prom(respuesta[0].mt12,respuesta[0].atN);
  		select = "select categoria from catalogo_categorias where id = '"+numC+"'";
  		let sqlnombre = await conectar.qryCompletonombre(select);
  		string = sqlnombre + ' en el ' + sqlarea + ' realizo ' + respuesta[0].atN + ' de ' + respuesta[0].mtN + ' unidades, que se programaron en el ' + sqltri + ', con lo que alcanzo un ' +  promedio + ' de la meta programada en el año ' + sqlanno + '. Te gustaría saber, ¿Cómo es que iban en el año pasado?';
  	}
   }else{
	string = 'Lo siento, no pude encontrar la información solicitada, los datos que tengo son a partir del 2018.' + '¿En qué otra cosa te puedo ayudar?' ;
}
  return string;
}


/* Funciones que se utilizaran para los Intent request */
async function avan(informa){
	let mensaje = await queryavan(informa);
	const tempOutput = mensaje + pause;
        const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
        return await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);

}

async function pal(informa){
        let mensaje = await querypalmas(informa);
	const tempOutput = mensaje + pause + susurroA + '.' + pause + '¿En qué otra cosa te puedo ayudar?' + susurroC  ;
	const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
        return await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
}


async function info(informa){
	let mensaje = await queryprincipal(informa);
	const tempOutput = mensaje + pause + susurroA + ' Te gustaría saber, ¿Cómo es que iban en el año pasado?' + susurroC  ;
	const speechOutput = tempOutput;
	const reprompt = 'En que otra cosa te puedo ayudar';
	const cardText = 'Informando';
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

function defaul() {
    const tempOutput = 'Lo siento no entendí, no sé qué hacer le podrías preguntar a Alfonso que te ayude a preguntar lo que deseas, o revisa como se puede preguntar diciendo la palabra AYUDA. ¿En qué otra cosa te puedo ayudar?';
    const speechOutput = tempOutput;
    const cardText = 'System 32 no responde';
    return buildResponse(speechOutput, false, cardText);
  }


async function si(pasado,informa){
  var jsonObj;
  if(pasado =='AMAZON.HelpIntent'){
      const tempOutput = 'Existen muchas formas de preguntar, en esta ayuda te recomendare con tres formas con las cuales podrás obtener la información de manera clara y fácil. Para obtener el avance tendrás que preguntar, cómo va el avance en la categoría cero cero dos en el área CCH o cómo le fue al 002 en el CCH en el segundo trimestre del dos mil diecinueve. Para saber quién se lleva las palmas' + susurroA + ' (quien trabajo más) ' + susurroC + ' la manera más eficaz de preguntar es, quien se lleva las palmas en el cero cero dos en el año dos mil diecinueve. ¿En qué te puedo ayudar?';
      const speechOutput = tempOutput;
      const reprompt = 'si quieres repetir';
      const cardText = 'Formas de preguntar';
      jsonObj = buildResponseWithRepromt(speechOutput, false, cardText , reprompt);
  }
  if(pasado == 'informacion'){
      let mensaje = await queryprincipal(informa);
      const tempOutput = mensaje + pause ;
      const speechOutput = tempOutput;
      const reprompt = '¿En qué otra cosa te puedo ayudar?';
      const cardText = 'Comparacion';
      jsonObj = await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);			
  }
  if(pasado == 'avance'){
      let mensaje = await queryavan(informa);
	const tempOutput = mensaje + pause;
        const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
	informapasado = [informa[0],informa[1],informa[2],informa[3]-1];
	pasadoIntent = 'avance';
	return await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
  }
  if(pasado == 'palmas'){
	let mensaje = await querypalmas(informacionpalmas);
        const tempOutput = mensaje + pause + ', ¿En que te puedo ayudar?';
        const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
        return await buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
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
  if(pasado == 'informacion'){
      const tempOutput = '¿En qué otra cosa te puedo ayudar?' + pause;
      const speechOutput = tempOutput;
      const reprompt = '¿En qué otra cosa te puedo ayudar?';
      const cardText = 'Comparacion';
      jsonObj = buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
  }
  if(pasado == 'avance'){
        pasadoIntent = 'palmas';
	const tempOutput = 'Te gustaría saber, ¿quién se lleva las palmas en la categoria ' + informacion[0] + ' del ' + informacion[3] + '?' + pause;
        const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
        return buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
  }
  if(pasado == 'palmas'){
        const tempOutput = 'Está bien será en otra ocasión, ¿En qué otra cosa te puedo ayudar?';
        const speechOutput = tempOutput;
        const reprompt = 'En que otra cosa te puedo ayudar';
        const cardText = 'Informando';
        pasadoIntent = 'palmas';
        return buildResponseWithRepromt(speechOutput, false, cardText, reprompt);
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
function quetrimestreMes (num)
{
   var respuesta;
    if(num <= 3){
       respuesta = 3;
    }
    if(num > 3 && num <= 6){
        respuesta = 6;
    }
    if(num > 6 && num <= 9){
        respuesta = 9;
    }
    if(num > 9 && num <=12){
        respuesta = 12;
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
    if(num <= 3){
       respuesta = 'primer trimestre';
    }
    if(num > 3 && num <= 6){
        respuesta = 'segundo trimestre';
    }
    if(num > 6 && num <= 9){
        respuesta = 'tercer trimestre';
    }
    if(num > 9 && num <= 12){
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
