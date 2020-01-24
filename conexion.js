let {Pool} = require('pg');


async function qryCompleto(string,num){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })
  
let resultado = [] ;
  await con.query(string, (err, res) => {
	if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
    for(i=0;i<res.rowCount;i++){
      var json={}
      if(num == 3){
	json.mtN=res.rows[i].mt3;
	json.atN=res.rows[i].at3;
	}
	if(num == 6){
        json.mtN=res.rows[i].mt6;
        json.atN=res.rows[i].at6;
        }
	if(num == 9){
        json.mtN=res.rows[i].mt9;
        json.atN=res.rows[i].at9;
        }
	if(num == 12){
        json.mtN=res.rows[i].mt12;
        json.atN=res.rows[i].at12;
        }
	json.mt12=res.rows[i].mt12;	
	json.p_nombre=res.rows[i].p_nombre;
	json.laccion=res.rows[i].unidad;
	resultado.push(json);
      }  
    }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletoPalmas(string){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
      if(res.rowCount>=3){
            for(i=0;i<3;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.area = res.rows[i].area;
              resultado.push(json);
            }
          }else{
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.area = res.rows[i].area;
              resultado.push(json);
            }
        }
  }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletopalmas1(string){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
      if(res.rowCount>=3){
            for(i=0;i<3;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
              json.programa = res.rows[i].programa;
              json.categoria = res.rows[i].numero;
              resultado.push(json);
            }  
          }else{
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
              json.programa = res.rows[i].programa;
              json.categoria = res.rows[i].numero;
              resultado.push(json);
            }
	} 
  }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletopalmas2(string){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
      if(res.rowCount>=3){
            for(i=0;i<3;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
              json.siglas = res.rows[i].siglas;
              json.categoria = res.rows[i].numero;
              resultado.push(json);
            }
          }else{
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
              json.siglas = res.rows[i].siglas;
              json.categoria = res.rows[i].numero;
              resultado.push(json);
            }
        }
  }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletopalmas3(string){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
 	console.log(err.stack)     
  }else if(res != undefined || res != null || res.rowCount>0){
      if(res.rowCount>=3){
            for(i=0;i<3;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
	      json.siglas = res.rows[i].siglas;
              json.programa = res.rows[i].programa;
              resultado.push(json);
            }
          }else{
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.mt12 = res.rows[i].mt12;
              json.p_nombre = res.rows[i].p_nombre;
              json.unidad = res.rows[i].unidad;
	      json.siglas = res.rows[i].siglas;
              json.programa = res.rows[i].programa;
              resultado.push(json);
            }
        }
  }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletoavan(string,num){
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
    for(i=0;i<res.rowCount;i++){
      var json={}
      json.mtN =res.rows[i].mt;
      json.atN = res.rows[i].at;
      json.mt12 =res.rows[i].mt12;
      resultado.push(json);
     }
    }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;
}

async function qryCompletonombre(string){ 
  let con = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'categorias',
      password: 'postgres',
      port: 5432,
  })

let resultado = [] ;
  await con.query(string, (err, res) => {
        if (err) {
      console.log(err.stack)
  }else if(res != undefined || res != null || res.rowCount>0){
    	resultado.push(res.rows[0].categoria);
    }else{
      resultado=null;
    }
  })
  await con.end();
  return resultado;

}
  
exports.qryCompleto=qryCompleto;
exports.qryCompletoPalmas = qryCompletoPalmas;
exports.qryCompletopalmas2 = qryCompletopalmas2;
exports.qryCompletopalmas3 = qryCompletopalmas3;
exports.qryCompletoavan = qryCompletoavan;
exports.qryCompletonombre = qryCompletonombre;
