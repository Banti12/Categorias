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
			res.json(await si(pasadoIntent,informapasado));
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
			pasadoIntent = req.body.request.intent.name;
			informapasado = [req.body.request.intent.slots.area.value, req.body.request.intent.slots.programa.value, req.body.request.intent.slots.categoria.value, quetrimestre(req.body.request.intent.slots.trimestre.value), req.body.request.intent.slots.anno.value - 1];
			break;
			case 'palmas' :
			var informa = [req.body.request.intent.slots.anno_p.value, req.body.request.intent.slots.area_p.value, quetrimestre(req.body.request.intent.slots.programa_p.value), req.body.request.intent.slots.categorias_p.value];
			res.json(await pal(informa));
			break;
			case 'avance' :
			var informa = [req.body.request.intent.slots.categorias_a.value, req.body.request.intent.slots.area_a.value, quetrimestre(req.body.request.intent.slots.trimestre_a.value), req.body.request.intent.slots.anno_a.value];
			pasadoIntent = req.body.request.intent.name;
			informapasado = [req.body.request.intent.slots.categorias_a.value, req.body.request.intent.slots.area_a.value, quetrimestre(req.body.request.intent.slots.trimestre_a.value), req.body.request.intent.slots.anno_a.value - 1];
			res.json(await avan(informa));
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
  let string =  " ";
  let select =  " ";
  let tipo = " ";
  string = 'Lo siento, no pude encontrar la información solicitado. Revisa bien los datos solicitados' + hablaEnrique +  ' Si persiste el problema por favor de ponerse en contacto con Alfonso ' + cerrarEnrique + '¿En qué otra cosa te puedo ayudar?' ;
  var sqlanno;
  var sqlarea;
  var sqlprog;
  var sqlcat;
  let respuesta;
  var indicador = 1;
  if(informa[0] == undefined  || informa[0] == null ){
    sqlanno = fecha.getFullYear();
  } else{
    sqlanno = informa[0];
  }

  if(informa[1] != undefined  || informa[1] != null ){
    select = "select DISTINCT(mt12),p_nombre,unidad,programa,numero FROM datos where anno = '"+sqlanno+"' and siglas ilike '"+informa[1]+"' ORDER BY mt12 DESC;";
    console.log("Base de datos"+ select);
    respuesta = await conectar.qryCompletopalmas1(select);
    tipo = 'El área que se lleva el';
    indicador = 1;
  }

  if(informa[2] != undefined  || informa[2] != null ){
    select = "select DISTINCT(mt12),p_nombre,unidad,siglas,numero FROM datos where anno = '"+sqlanno+"' and programa ilike '"+informa[2]+"' ORDER BY mt12 DESC;";
    console.log(select)
    respuesta = await conectar.qryCompletopalmas2(select);
    tipo = 'El programa que se lleva el';
    indicador = 2;
  }

  if(informa[3] != undefined  || informa[3] != null ){
    select = "select DISTINCT(mt12),p_nombre,unidad,siglas,programa FROM datos where anno = '"+sqlanno+"' and numero ilike '"+informa[3]+"' ORDER BY mt12 DESC;";
    console.log(select)
    respuesta = await conectar.qryCompletopalmas3(select);
    tipo = 'La categoría que se lleva el';
    indicador = 3;
  }

  if(respuesta != null){
            switch (respuesta.length){
              case 3:
		if( indicador == 1){
			string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el programa ' + respuesta[0].programa + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el programa ' + respuesta[1].programa + ' y categoría ' + respuesta[1].categoria   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad  + ' . ' + tipo + ' tercer lugar es ' +  respuesta[2].p_nombre + ' con el programa ' + respuesta[2].programa + ' y categoría  ' + respuesta[2].categoria   + ' que realizo ' + respuesta[2].mt12 + ' ' + respuesta[2].unidad + ' en el año ' + sqlanno;
		}else if (indicador == 2){
			string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el área ' + respuesta[1].siglas + ' y categoría ' + respuesta[1].categoria   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad  + ' . ' + tipo + ' tercer lugar es ' +  respuesta[2].p_nombre + ' con el área ' + respuesta[2].siglas + ' y categoría  ' + respuesta[2].categoria   + ' que realizo ' + respuesta[2].mt12 + ' ' + respuesta[2].unidad + ' en el año ' + sqlanno;
		}else{
                string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y programa  ' + respuesta[0].programa   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el área ' + respuesta[1].siglas + ' y programa ' + respuesta[1].programa   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad  + ' . ' + tipo + ' tercer lugar es ' +  respuesta[2].p_nombre + ' con el área ' + respuesta[2].siglas + ' y programas  ' + respuesta[2].programa   + ' que realizo ' + respuesta[2].mt12 + ' ' + respuesta[2].unidad + ' en el año ' + sqlanno;
              	}
		break;
              case 2:
                if( indicador == 1){
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el programa ' + respuesta[0].programa + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el programa ' + respuesta[1].programa + ' y categoría ' + respuesta[1].categoria   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad + ' en el año ' + sqlanno;
}else if (indicador == 2){
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el área ' + respuesta[1].siglas + ' y categoría ' + respuesta[1].categoria   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad  + ' en el año ' + sqlanno;
}else{
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y programa  ' + respuesta[0].programa   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + tipo + ' segundo lugar es ' +  respuesta[1].p_nombre + ' con el área ' + respuesta[1].siglas + ' y programa ' + respuesta[1].programa   + ' que realizo ' + respuesta[1].mt12 + ' ' + respuesta[1].unidad + ' en el año ' + sqlanno;
		}
              break;
              case 1:
                if( indicador == 1){
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el programa ' + respuesta[0].programa + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause + ' en el año ' + sqlanno;
}else if (indicador == 2){
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y categoría  ' + respuesta[0].categoria   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + ' en el año ' + sqlanno;
}else{
        		string = tipo + ' primer lugar es ' +  respuesta[0].p_nombre + ' con el área ' + respuesta[0].siglas + ' y programa  ' + respuesta[0].programa   + ' que realizo ' + respuesta[0].mt12  +' ' +  respuesta[0].unidad + '. '+ pause  + ' en el año ' + sqlanno;
		}
              break;
            }
    } else {
            string = 'Lo siento, no pude encontrar la informacion solicitado, Revisa bien los datos solicitados';
    }  
  return string;
}

async function queryavan (informa){
  var sqlcat = informa[0];
  let numC = parseInt(sqlcat);
  let string =  " ";
  if(informa[3] > 2017)
  {
  	if((numC == 13) || (numC == 19) || (numC == 21) || (numC == 23) || (numC == 38) || (numC == 39) ||(numC == 116) || (numC == 117) ||(numC == 122) ){
		string = 'Lo siento, no pude encontrar la información solicitado. Revisa bien los datos solicitados' + '¿En qué otra cosa te puedo ayudar?' ; 	
  	}else{
  		let select =  " ";
  		var sqltri;
  		var sqlanno;
  		var sqlarea = informa[1];
  		var sqlmt;
  		var sqlat;
  		let respuesta;
  		var promedio;
  		if(informa[3] == undefined  || informa[3] == null ){
    			sqlanno = fecha.getFullYear();
  		} else{
    			sqlanno = informa[3];
  		}
  		if(informa[2] == undefined || informa[2] == null ){
      			sqltri =quetrimestreN ( fecha.getMonth()+1);
      			sqlmt = quetrimestreMes (fecha.getMonth()+1);
 		}else{
      			sqltri = quetrimestreN (informa[2]);
      			sqlmt = informa [2];
  		}
  		select = "select sum(at" + sqlmt +" ) as at , sum(mt" + sqlmt +") as mt , sum(mt12) as mt12 from datos1 where anno = '"+sqlanno+"' and categoria = '"+sqlcat+"' and area ilike '"+sqlarea+"' ;";
  		console.log(select);
		respuesta = await conectar.qryCompletoavan(select,sqlmt);
  		promedio = prom(respuesta[0].mt12,respuesta[0].atN);
  		select = "select categoria from catalogo_categorias where id = '"+numC+"'";
  		let sqlnombre = await conectar.qryCompletonombre(select);
  		string = sqlnombre + ' en el ' + sqlarea + ' realizo ' + respuesta[0].atN + ' de ' + respuesta[0].mtN + 'unidades, que se programaron en el ' + sqltri + ', con lo que alcanzo un ' +  promedio + ' de la meta programada en el año ' + informa[3] + '. Te gustaría saber, ¿Cómo es que iban en el año pasado?';
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

async function si(pasado,informa){
  var jsonObj;
  if(pasado =='AMAZON.HelpIntent'){
      const tempOutput = 'Existen 3 formas de preguntar' + pause + 'La primera consiste en decir categorias' + pause + ', ¿En que te puedo ayudar?' + pause;
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
