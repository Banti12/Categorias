/*Banti Serna Brandon Aldair */

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
let annos = ['2018','2019','2020','2021','2022'];
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
}

for (i in annos)
{
	for ( j in categoria)
	{
		let direccion = '../../jsons/salida_c'+categoria[j]+'_'+annos[i]+'.json'
		if(fs.existsSync(direccion)){
			/*console.log('entre'+j);*/
			var archivo = fs.readFileSync(direccion, 'utf8');
			var infoArray = JSON.parse(archivo);
			var numObjetos = Object.keys(infoArray).length-1;
			for (var k=0; k<numObjetos; k++){
				let meta = (infoArray[k].meta_sid == null || infoArray[k].meta_sid == undefined ? "No existe_No existe_No existe" : infoArray[k].meta_sid );
				let siglas = (infoArray[k].u_siglas == null || infoArray[k].u_siglas == undefined ? "No existe" : infoArray[k].u_siglas );
				var arregloMeta = meta.split("_");
				let programa = arregloMeta[1];
				let numero = arregloMeta[0];
				let p_no = (infoArray[k].p_no == null || infoArray[k].p_no == undefined ? "No existe" : infoArray[k].p_no );
				let p_nombre = (infoArray[k].p_nombre == null || infoArray[k].p_nombre == undefined ? "No existe" : infoArray[k].p_nombre );
				let adesc = (infoArray[k].adesc == null || infoArray[k].adesc == undefined ? "No existe" : infoArray[k].adesc );
				let unidadm = (infoArray[k].unidadm == null || infoArray[k].unidadm == undefined ? "No existe" : infoArray[k].unidadm );
				let indi = (infoArray[k].indi== null || infoArray[k].indi == undefined ? 0 : infoArray[k].indi.toFixed(2) );
				let objetivo = (infoArray[k].objetivo == null || infoArray[k].objetivo == undefined ? 0 : infoArray[k].objetivo);
				let estrategia = (infoArray[k].estrategia == null || infoArray[k].estrategia == undefined ? 0 : infoArray[k].estrategia );
				let laccion = (infoArray[k].laccion == null || infoArray[k].laccion == undefined ? 0 : infoArray[k].laccion);
				let visible = (infoArray[k].visible == null || infoArray[k].visible == undefined ? "No esxiste" : (infoArray[k].visible ? "Esta activo" : "Esta inactivo"));
				let at3 = (infoArray[k].at3 == null || infoArray[k].at3 == undefined ? 0 : infoArray[k].at3 );
				let at6 = (infoArray[k].at6 == null || infoArray[k].at6 == undefined ? 0 : infoArray[k].at6 );
				let at9 = (infoArray[k].at9 == null || infoArray[k].at9 == undefined ? 0 : infoArray[k].at9 );
				let at12 = (infoArray[k].at12 == null || infoArray[k].at12 == undefined ? 0 : infoArray[k].at12 );
				let mt3 = (infoArray[k].mt3 == null || infoArray[k].mt3 == undefined ? 0 : infoArray[k].mt3 );
				let mt6 = (infoArray[k].mt6 == null || infoArray[k].mt6 == undefined ? 0 : infoArray[k].mt6 );
				let mt9 = (infoArray[k].mt9 == null || infoArray[k].mt9 == undefined ? 0 : infoArray[k].mt9 );
				let mt12 = (infoArray[k].mt12 == null || infoArray[k].mt12 == undefined ? 0 : infoArray[k].mt12 );
				let acomulado = at3 + at6 + at9 + at12;
				let avance = (mt3 + mt6 + mt9 + mt12).toFixed(2);
				let porcentaje = (acomulado == 0 || avance == 0 ? "0%": ((avance * 100) / acomulado).toFixed(2) + "%");
				let diferencia = (acomulado - avance).toFixed(2);
				/*console.log(meta + " " + siglas + " " + p_no + " " + p_nombre + " " + adesc + " " + unidadm + " " + indi + " " + objetivo + " " + estrategia + " " + laccion + " " + visible + " " + at3 + " " + at6 + " " + at9 + " " + at12 + " " + mt3 + " " + mt6 + " " + mt9 + " " + mt12 + " " + acomulado + " " + avance + " " + porcentaje + " " + diferencia );*/
				querys += "INSERT INTO datos (anno,meta_sid,siglas,programa,numero,p_no,p_nombre,adesc,unidad,indi,objetivo,estrategia,laccion,visible,at3,at6,at9,at12,mt3,mt6,mt9,mt12,acomulado,avance,porcentaje,diferencia) VALUES ( '"+annos[i]+"','"+meta+"','"+siglas+"','"+programa+"','"+numero+"','"+p_no+"','"+p_nombre+"','"+adesc+"','"+unidadm+"',"+indi+","+objetivo+","+estrategia+","+laccion+",'"+visible+"',"+at3+","+at6+","+at9+","+at12+","+mt3+","+mt6+","+mt9+","+mt12+","+acomulado+","+avance+",'"+porcentaje+"',"+diferencia+"); \n";
								
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
