let {Pool} = require('pg');

let us = 'postgres';
let hos = '127.0.0.1';
let bd = 'categorias';
let pas = 'postgres';
let por = 5432;

async function qryCompleto(string,mt,at){
    let pool = new Pool({
      user: us,
      host: hos,
      database: bd,
      password: pas,
      port: por,
    })
    let respuesta=[];
    await pool.query(string, (err, res) => {
	if (err) {
           console.log(err.stack)
        }else if(res != undefined && res != null && res.rowCount>0){
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.mtN=res.rows[i].mt;
              json.atN=res.rows[i].at;
              json.porcentaje=res.rows[i].porcentaje;
              json.diferencia=res.rows[i].diferencia;
              json.p_nombre=res.rows[i].p_nombre;
              json.laccion=res.rows[i].laccion;
              respuesta.push(json);
            }  
        }else{
          respuesta=null;
        }
        })
    await pool.end();
    return respuesta;
  }

  exports.qryCompleto=qryCompleto;
