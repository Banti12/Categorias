DROP DATABASE IF EXISTS categorias;
CREATE DATABASE categorias;

\c categorias;

CREATE TABLE datos(
id SERIAL PRIMARY KEY,
anno varchar(5),
meta_sid varchar(30),
siglas varchar(30),
p_no varchar(30),
p_nombre varchar(100),
adesc varchar(30),
unidad varchar(30),
indi integer,
objetivo integer,
estrategia integer,
laccion integer,
visible varchar(30),
at3 integer,
at6 integer,
at9 integer,
at12 integer,
mt3 integer,
mt6 integer,
mt9 integer,
mt12 integer
);
