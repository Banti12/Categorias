/*Banti Serna Brandon Aldair */

/* El módulo del sistema de archivos Node.js le permite*/
var fs = require('fs');

/* Este cliente nos permitira realizar nuestra conexión y hacer las consultas a la base de datos y como siguiente paso vamos a realizar la configuración de nuestra conexión */
let {Pool} = require('pg');
let con = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'categorias',
  password: 'postgres',
  port: 5432,
})

let direccion = 'jsoncategorias.json';
let informacion = '';
let querys="";
var archivo = fs.readFileSync(direccion, 'utf8');
var infoArray = JSON.parse(archivo);
var no = "No existe";
let k = 0;
for ( let j = 0; j < 216; j++)
{
    if((j== 12) || (j== 18) || (j== 20) || (j== 22) || (j== 37) || (j== 38) || (j== 115) || (j== 116) || (j== 121) ){             
	querys += "INSERT INTO catalogo_categorias (categoria) VALUES ( '"+no+"' ); \n";
    }else{
	let categor = (infoArray[k].categoria == null || infoArray[k].categoria == undefined ? "No existe" : infoArray[k].categoria );
        querys += "INSERT INTO catalogo_categorias (categoria) VALUES ('"+categor+"' ); \n";
	k++;
    }
}


con.query(querys, (err, res) => {
                    if (err) {
                        console.log(err.stack)
                    }
                    })
con.end();
