DROP DATABASE IF EXISTS categorias;
CREATE DATABASE categorias;

\c categorias;

CREATE TABLE datos(
id SERIAL PRIMARY KEY,
anno varchar(5),
meta_sid varchar(50),
siglas varchar(50),
p_no TEXT,
p_nombre TEXT,
adesc TEXT,
unidad varchar(100),
indi NUMERIC,
objetivo NUMERIC,
estrategia NUMERIC,
laccion integer,
visible varchar(50),
at3 integer,
at6 integer,
at9 integer,
at12 integer,
mt3 integer,
mt6 integer,
mt9 integer,
mt12 integer,
acomulado integer,
avance NUMERIC,
porcentaje varchar(50),
diferencia NUMERIC
);
