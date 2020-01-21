/*Banti Serna Brandon Aldair */

/* El módulo del sistema de archivos Node.js le permite trabajar con el sistema */
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

let informacion = '';
let nombrejson = '';
let annos = ['2018','2019','2020','2021','2022','2023','2024','2025','2026','2027'];
let categoria = [216];
let querys="";

for (let j = 1; j < 217; j++){
    if(j < 10){
        categoria[j] = '00'+j;
    }
    if(j>9 && j < 100){
        categoria[j] = '0'+j;
    }
    if(j>=100){
        categoria[j] = ''+j;
    }
    console.log(categoria[j]);
}

for (i in annos)
{
        for ( let j = 1; j < 217; j++)
        {
                let direccion = '../../jsons/salida_c'+categoria[j]+'_'+annos[i]+'.json'
                if(fs.existsSync(direccion)){
                        /*console.log('entre'+j);*/
                        var archivo = fs.readFileSync(direccion, 'utf8');
                        var infoArray = JSON.parse(archivo);
                        var numObjetos = Object.keys(infoArray).length-1;
                        for (var k=0; k<numObjetos; k++){
                                let num_categorias = j;
                                let categorias = categoria[j];
                                let area = (infoArray[k].u_siglas == null || infoArray[k].u_siglas == undefined ? "No existe" : infoArray[k].u_siglas );
                                let at3 = (infoArray[k].at3 == null || infoArray[k].at3 == undefined ? 0 : infoArray[k].at3 );
                                let at6 = (infoArray[k].at6 == null || infoArray[k].at6 == undefined ? 0 : infoArray[k].at6 );
                                let at9 = (infoArray[k].at9 == null || infoArray[k].at9 == undefined ? 0 : infoArray[k].at9 );
                                let at12 = (infoArray[k].at12 == null || infoArray[k].at12 == undefined ? 0 : infoArray[k].at12 );
                                let mt3 = (infoArray[k].mt3 == null || infoArray[k].mt3 == undefined ? 0 : infoArray[k].mt3 );
                                let mt6 = (infoArray[k].mt6 == null || infoArray[k].mt6 == undefined ? 0 : infoArray[k].mt6 );
                                let mt9 = (infoArray[k].mt9 == null || infoArray[k].mt9 == undefined ? 0 : infoArray[k].mt9 );
                                let mt12 = (infoArray[k].mt12 == null || infoArray[k].mt12 == undefined ? 0 : infoArray[k].mt12 );
                                querys += "INSERT INTO datos1 (num_categoria,categoria,area,at3,at6,at9,at12,mt3,mt6,mt9,mt12,anno) VALUES ( "+num_categorias+",'"+categorias+"','"+area+"',"+at3+","+at6+","+at9+","+at12+","+mt3+","+mt6+","+mt9+","+mt12+",'"+annos[i]+"'); \n";
                        }
                }
        }
}

con.query(querys, (err, res) => {
                    if (err) {
                        console.log(err.stack)
                    }
                    })
con.end();
