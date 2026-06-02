--
-- PostgreSQL database dump
--

\restrict XasFZ8qgrKC9ufMdeXm5vBhDvHj0O5CElgDoD7CgW3mGsY4ry8EJPjdVv5rjHcy

-- Dumped from database version 15.17
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-01 16:40:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 861 (class 1247 OID 16390)
-- Name: productos_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.productos_estado_enum AS ENUM (
    'Publicado',
    'NoPublicado'
);


ALTER TYPE public.productos_estado_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24585)
-- Name: carritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carritos (
    "idCarrito" integer NOT NULL,
    total numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "idUsuario" character(5),
    "descuentoAplicado" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "totalConDescuento" numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.carritos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24584)
-- Name: carritos_idCarrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."carritos_idCarrito_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."carritos_idCarrito_seq" OWNER TO postgres;

--
-- TOC entry 3602 (class 0 OID 0)
-- Dependencies: 219
-- Name: carritos_idCarrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."carritos_idCarrito_seq" OWNED BY public.carritos."idCarrito";


--
-- TOC entry 238 (class 1259 OID 98306)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    "idCategoria" integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 98305)
-- Name: categorias_idCategoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."categorias_idCategoria_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."categorias_idCategoria_seq" OWNER TO postgres;

--
-- TOC entry 3603 (class 0 OID 0)
-- Dependencies: 237
-- Name: categorias_idCategoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."categorias_idCategoria_seq" OWNED BY public.categorias."idCategoria";


--
-- TOC entry 233 (class 1259 OID 74127)
-- Name: combos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combos (
    "idCombo" integer NOT NULL,
    "codigoCombo" character varying(100),
    titulo character varying(100) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "fechaInicio" date,
    "fechaFin" date,
    estado character varying(20) DEFAULT 'Publicado'::character varying NOT NULL,
    "esDestacado" boolean DEFAULT false NOT NULL,
    "esNovedad" boolean DEFAULT false NOT NULL,
    imagen character varying(255),
    "fechaCreacion" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaEdicion" timestamp without time zone DEFAULT now() NOT NULL,
    imagenes text[]
);


ALTER TABLE public.combos OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 81922)
-- Name: correo_argentino; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.correo_argentino (
    "idEnvio" integer NOT NULL,
    "codigoPostal" character varying(10) NOT NULL,
    costo numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    estado character varying(20) DEFAULT 'Pendiente'::character varying NOT NULL,
    "idPedido" integer,
    direccion character varying(255),
    "fechaEntrega" timestamp without time zone
);


ALTER TABLE public.correo_argentino OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 81921)
-- Name: correo_argentino_idEnvio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."correo_argentino_idEnvio_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."correo_argentino_idEnvio_seq" OWNER TO postgres;

--
-- TOC entry 3604 (class 0 OID 0)
-- Dependencies: 235
-- Name: correo_argentino_idEnvio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."correo_argentino_idEnvio_seq" OWNED BY public.correo_argentino."idEnvio";


--
-- TOC entry 234 (class 1259 OID 74158)
-- Name: cupones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cupones (
    codigo character varying(20) NOT NULL,
    porcentaje numeric(5,2) NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    condicion character varying(100),
    "topeUso" integer DEFAULT 0 NOT NULL,
    valido boolean DEFAULT true NOT NULL,
    "montoMinimo" numeric(10,2),
    "idTemaRequerido" integer
);


ALTER TABLE public.cupones OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 41336)
-- Name: favoritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favoritos (
    id integer NOT NULL,
    "usuarioId" character(5) NOT NULL,
    "productoId" integer,
    "fechaAgregado" timestamp without time zone DEFAULT now() NOT NULL,
    "comboId" integer
);


ALTER TABLE public.favoritos OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 41335)
-- Name: favoritos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favoritos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favoritos_id_seq OWNER TO postgres;

--
-- TOC entry 3605 (class 0 OID 0)
-- Dependencies: 228
-- Name: favoritos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favoritos_id_seq OWNED BY public.favoritos.id;


--
-- TOC entry 224 (class 1259 OID 33042)
-- Name: lineas_carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lineas_carrito (
    "idLineaCarrito" integer NOT NULL,
    cantidad integer NOT NULL,
    "precioUnitario" numeric(10,2) NOT NULL,
    "idCarrito" integer,
    "idProducto" integer,
    "idCombo" integer
);


ALTER TABLE public.lineas_carrito OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33041)
-- Name: lineas_carrito_idLineaCarrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."lineas_carrito_idLineaCarrito_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."lineas_carrito_idLineaCarrito_seq" OWNER TO postgres;

--
-- TOC entry 3606 (class 0 OID 0)
-- Dependencies: 223
-- Name: lineas_carrito_idLineaCarrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."lineas_carrito_idLineaCarrito_seq" OWNED BY public.lineas_carrito."idLineaCarrito";


--
-- TOC entry 226 (class 1259 OID 33049)
-- Name: lineas_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lineas_pedido (
    "idLineaPedido" integer NOT NULL,
    cantidad integer NOT NULL,
    "precioHistorico" numeric(10,2) NOT NULL,
    "idPedido" integer,
    "idProducto" integer,
    "idCombo" integer
);


ALTER TABLE public.lineas_pedido OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33048)
-- Name: lineas_pedido_idLineaPedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."lineas_pedido_idLineaPedido_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."lineas_pedido_idLineaPedido_seq" OWNER TO postgres;

--
-- TOC entry 3607 (class 0 OID 0)
-- Dependencies: 225
-- Name: lineas_pedido_idLineaPedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."lineas_pedido_idLineaPedido_seq" OWNED BY public.lineas_pedido."idLineaPedido";


--
-- TOC entry 217 (class 1259 OID 16422)
-- Name: niveles_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.niveles_usuario (
    "idNivel" integer NOT NULL,
    nombre character varying(30) NOT NULL,
    beneficio character varying(100),
    "montoMinimo" numeric(10,2) NOT NULL,
    "porcentajeDescuento" numeric(5,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.niveles_usuario OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16421)
-- Name: niveles_usuario_idNivel_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."niveles_usuario_idNivel_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."niveles_usuario_idNivel_seq" OWNER TO postgres;

--
-- TOC entry 3608 (class 0 OID 0)
-- Dependencies: 216
-- Name: niveles_usuario_idNivel_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."niveles_usuario_idNivel_seq" OWNED BY public.niveles_usuario."idNivel";


--
-- TOC entry 222 (class 1259 OID 24617)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    "idPedido" integer NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    "idUsuario" character(5),
    "codigoCupon" character varying(20),
    "direccionEnvio" character varying(255)
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24616)
-- Name: pedidos_idPedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."pedidos_idPedido_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."pedidos_idPedido_seq" OWNER TO postgres;

--
-- TOC entry 3609 (class 0 OID 0)
-- Dependencies: 221
-- Name: pedidos_idPedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."pedidos_idPedido_seq" OWNED BY public.pedidos."idPedido";


--
-- TOC entry 232 (class 1259 OID 65545)
-- Name: pertenece; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pertenece (
    "idCombo" integer NOT NULL,
    "idProducto" integer NOT NULL
);


ALTER TABLE public.pertenece OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 41285)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    "idProducto" integer NOT NULL,
    "codigoProducto" character varying(20) NOT NULL,
    titulo character varying(100) NOT NULL,
    "rangoEdad" character varying(20),
    "cantidadPiezas" integer,
    descripcion text,
    categoria character varying(50),
    "productoOriginal" boolean DEFAULT true NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    estado public.productos_estado_enum DEFAULT 'Publicado'::public.productos_estado_enum NOT NULL,
    "idTema" integer,
    "esDestacado" boolean DEFAULT false NOT NULL,
    "esNovedad" boolean DEFAULT false NOT NULL,
    imagen character varying(255),
    imagenes text[],
    "fechaCreacion" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaEdicion" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 49154)
-- Name: resenas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resenas (
    "idResena" integer NOT NULL,
    comentario text NOT NULL,
    "esAnonima" boolean DEFAULT true NOT NULL,
    estrellas integer NOT NULL,
    "idUsuario" character(5),
    "idProducto" integer,
    "eliminadaPorAdmin" boolean DEFAULT false NOT NULL,
    "idPedido" integer,
    CONSTRAINT "CHK_70c32155f87591f00ea7f74d78" CHECK (((estrellas >= 1) AND (estrellas <= 5)))
);


ALTER TABLE public.resenas OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 49153)
-- Name: resenas_idResena_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."resenas_idResena_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."resenas_idResena_seq" OWNER TO postgres;

--
-- TOC entry 3610 (class 0 OID 0)
-- Dependencies: 230
-- Name: resenas_idResena_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."resenas_idResena_seq" OWNED BY public.resenas."idResena";


--
-- TOC entry 215 (class 1259 OID 16410)
-- Name: temas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temas (
    "idTema" integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.temas OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16409)
-- Name: temas_idTema_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."temas_idTema_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."temas_idTema_seq" OWNER TO postgres;

--
-- TOC entry 3611 (class 0 OID 0)
-- Dependencies: 214
-- Name: temas_idTema_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."temas_idTema_seq" OWNED BY public.temas."idTema";


--
-- TOC entry 218 (class 1259 OID 16428)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    "idUsuario" character(5) NOT NULL,
    "idNivel" integer,
    password character varying,
    "fechaRegistro" timestamp without time zone DEFAULT now() NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    "esAdmin" boolean DEFAULT false NOT NULL,
    apellido character varying(100),
    direccion character varying,
    telefono character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 3333 (class 2604 OID 24588)
-- Name: carritos idCarrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos ALTER COLUMN "idCarrito" SET DEFAULT nextval('public."carritos_idCarrito_seq"'::regclass);


--
-- TOC entry 3365 (class 2604 OID 98309)
-- Name: categorias idCategoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN "idCategoria" SET DEFAULT nextval('public."categorias_idCategoria_seq"'::regclass);


--
-- TOC entry 3362 (class 2604 OID 81925)
-- Name: correo_argentino idEnvio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correo_argentino ALTER COLUMN "idEnvio" SET DEFAULT nextval('public."correo_argentino_idEnvio_seq"'::regclass);


--
-- TOC entry 3349 (class 2604 OID 41339)
-- Name: favoritos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos ALTER COLUMN id SET DEFAULT nextval('public.favoritos_id_seq'::regclass);


--
-- TOC entry 3340 (class 2604 OID 33045)
-- Name: lineas_carrito idLineaCarrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_carrito ALTER COLUMN "idLineaCarrito" SET DEFAULT nextval('public."lineas_carrito_idLineaCarrito_seq"'::regclass);


--
-- TOC entry 3341 (class 2604 OID 33052)
-- Name: lineas_pedido idLineaPedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido ALTER COLUMN "idLineaPedido" SET DEFAULT nextval('public."lineas_pedido_idLineaPedido_seq"'::regclass);


--
-- TOC entry 3329 (class 2604 OID 16425)
-- Name: niveles_usuario idNivel; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveles_usuario ALTER COLUMN "idNivel" SET DEFAULT nextval('public."niveles_usuario_idNivel_seq"'::regclass);


--
-- TOC entry 3337 (class 2604 OID 24620)
-- Name: pedidos idPedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN "idPedido" SET DEFAULT nextval('public."pedidos_idPedido_seq"'::regclass);


--
-- TOC entry 3351 (class 2604 OID 49157)
-- Name: resenas idResena; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas ALTER COLUMN "idResena" SET DEFAULT nextval('public."resenas_idResena_seq"'::regclass);


--
-- TOC entry 3328 (class 2604 OID 16413)
-- Name: temas idTema; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temas ALTER COLUMN "idTema" SET DEFAULT nextval('public."temas_idTema_seq"'::regclass);


--
-- TOC entry 3578 (class 0 OID 24585)
-- Dependencies: 220
-- Data for Name: carritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carritos ("idCarrito", total, "idUsuario", "descuentoAplicado", "totalConDescuento") FROM stdin;
9	0.00	79147	2550.00	82450.00
13	50000.00	23742	6000.00	44000.00
11	100000.00	47892	8000.00	92000.00
4	110000.00	72142	13200.00	96800.00
7	0.00	95820	0.00	1.00
8	0.00	29396	9000.00	171000.00
10	300000.00	43201	36000.00	264000.00
12	15000.00	24673	1800.00	13200.00
5	310000.00	97729	37200.00	272800.00
6	50000.00	45445	6000.00	44000.00
\.


--
-- TOC entry 3596 (class 0 OID 98306)
-- Dependencies: 238
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias ("idCategoria", nombre) FROM stdin;
2	Arquitectura
4	Castillos
5	Ciudad
8	Espacio
9	Fantasía
11	Minifiguras
12	Naves
14	Piratas
16	Series
18	Superhéroes
20	Vehículos
23	Deportes
24	Juegos
25	Películas
26	Música
\.


--
-- TOC entry 3591 (class 0 OID 74127)
-- Dependencies: 233
-- Data for Name: combos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combos ("idCombo", "codigoCombo", titulo, descripcion, precio, stock, "fechaInicio", "fechaFin", estado, "esDestacado", "esNovedad", imagen, "fechaCreacion", "fechaEdicion", imagenes) FROM stdin;
35978	CMB-1000	Tridente Vexa	Este combo contiene los 3 desarrolladores mas conocidos de la industria del Software	120000.00	0	2026-05-15	2026-05-22	Publicado	f	f	http://localhost:3000/uploads/1104d4fcd329117834dab5a0daaffb210c.png	2026-05-21 14:45:30.343882	2026-05-21 14:45:30.343882	\N
54103	CMB-1001	Combo Colapinto Lego	Este combo lego está dedicado para todos los amantes de la velocidad de la F1, en especial para los fanáticos de Franco Colapinto	60000.00	0	2026-05-22	2026-11-18	Publicado	f	f	http://localhost:3000/uploads/c5ce5ec1aca7737225fa1b610d17bfbf5.png	2026-05-21 15:57:38.781193	2026-05-21 16:16:29.60469	{http://localhost:3000/uploads/c5ce5ec1aca7737225fa1b610d17bfbf5.png,http://localhost:3000/uploads/67975702863ceb21077b53a86291788ec.png,http://localhost:3000/uploads/80e9b28610df597f75c1105e6d43243e93.png}
20058	CMB-1002	Combo Canapino Lego	Este combo lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Agustin Canapino	40000.00	0	2026-05-22	2026-12-03	Publicado	f	f	http://localhost:3000/uploads/7ebf19161242878bc19a2f3c33db9bf7.png	2026-05-21 16:16:13.031352	2026-05-21 16:16:56.273923	{http://localhost:3000/uploads/7ebf19161242878bc19a2f3c33db9bf7.png,http://localhost:3000/uploads/9dbb89488cf5dbc581f255efc8d2df94.png,http://localhost:3000/uploads/e150176fbe7cebe74542698e39621e6f.png}
30203	CMB-1010	Combo 5 Grandes Fútbol Argentino Lego		60000.00	35	2026-05-21	2027-03-11	Publicado	t	f	http://localhost:3000/uploads/355b673bf3efcb110d148cf28bbd1e35f.png	2026-05-21 17:07:54.794782	2026-05-21 17:19:26.799034	{http://localhost:3000/uploads/355b673bf3efcb110d148cf28bbd1e35f.png,http://localhost:3000/uploads/f1504287384e24728fed18950633a823.png,http://localhost:3000/uploads/e3b53602b5a4e710a110ddd1a336a241a8.png,http://localhost:3000/uploads/ec27c8af1eddef11529fb7687ea1c694.png,http://localhost:3000/uploads/51ba43e7107723eeeb88521da105c9c1058.png,http://localhost:3000/uploads/2d9baacf3e108211281bc54e210dedaf4a.png}
\.


--
-- TOC entry 3594 (class 0 OID 81922)
-- Dependencies: 236
-- Data for Name: correo_argentino; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.correo_argentino ("idEnvio", "codigoPostal", costo, estado, "idPedido", direccion, "fechaEntrega") FROM stdin;
49	0000	1500.00	Entregado	73	Estrada 638, Concepcion del Uruguay	\N
1	3260	1500.00	Pendiente	11	\N	\N
2	0000	500.00	Pendiente	12	\N	\N
3	0000	500.00	Pendiente	13	\N	\N
4	0000	500.00	Pendiente	14	\N	\N
5	0000	500.00	Pendiente	15	\N	\N
6	0000	500.00	Pendiente	16	\N	\N
7	0000	500.00	Pendiente	17	\N	\N
8	0000	500.00	Pendiente	20	\N	\N
10	0000	500.00	Pendiente	21	\N	\N
9	0000	500.00	Pendiente	23	\N	\N
11	0000	500.00	Pendiente	24	\N	\N
40	1007	1500.00	En camino	65	Suipacha 1007	\N
16	0000	500.00	Pendiente	33	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
17	0000	500.00	Pendiente	32	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
19	0000	500.00	Pendiente	30	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
22	0000	500.00	Pendiente	19	Cilindro 123	\N
23	0000	500.00	Pendiente	44	Cilindro 123	\N
24	0000	500.00	Pendiente	18	Cilindro 123	\N
25	0000	500.00	Pendiente	49	Cilindro 123	\N
26	0000	500.00	Pendiente	50	Cilindro 123	\N
27	0000	500.00	Pendiente	47	Cilindro 123	\N
28	0000	500.00	Pendiente	51	Cilindro 123	\N
29	0000	500.00	Pendiente	53	Suipacha 1007	\N
30	3260	500.00	Pendiente	54	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	\N
31	2760	500.00	Pendiente	55	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN	\N
34	3260	500.00	Pendiente	59	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	\N
43	6000	1500.00	Pendiente	69	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
44	6000	1500.00	Pendiente	29	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
12	0000	500.00	En camino	25	\N	\N
14	0000	500.00	En camino	27	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN	\N
15	0000	500.00	En camino	31	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
35	3260	500.00	En camino	60	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	\N
45	6000	1500.00	Pendiente	70	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
37	8400	2800.00	En camino	62	Avenida 12 de Octubre, Ñireco, San Carlos de Bariloche, Municipio de San Carlos de Bariloche, Departamento Bariloche, Río Negro, 8400	\N
46	6000	1500.00	Pendiente	28	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
47	6000	1500.00	Pendiente	71	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	\N
39	3260	0.00	Entregado	64	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	2026-05-27 15:26:55.11503
32	0000	500.00	Entregado	56	Suipacha 1007	2026-05-27 15:26:55.11503
38	3260	0.00	Entregado	63	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	2026-05-27 15:26:55.11503
13	0000	500.00	Entregado	26	\N	2026-05-27 15:26:55.11503
41	1007	1500.00	Entregado	66	Suipacha 1007	2026-05-27 15:26:55.11503
42	3260	0.00	Entregado	67	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	2026-05-27 15:26:55.11503
20	0000	500.00	Entregado	36	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	2026-05-27 15:26:55.11503
21	0000	500.00	Entregado	39	Cilindro 123	2026-05-27 15:26:55.11503
18	0000	500.00	Entregado	34	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	2026-05-27 15:26:55.11503
33	0000	500.00	Entregado	57	Suipacha 1007	2026-05-27 15:26:55.11503
36	3260	500.00	Entregado	61	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	2026-05-27 15:26:55.11503
48	6000	1500.00	Entregado	72	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	2026-05-27 15:26:55.11503
50	0000	1500.00	Entregado	75	Estrada 638, Concepcion del Uruguay	\N
51	0000	1500.00	Pendiente	77	Estrada 638, Concepcion del Uruguay	\N
52	2760	1500.00	Entregado	78	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN	2026-05-29 17:03:57.67
\.


--
-- TOC entry 3592 (class 0 OID 74158)
-- Dependencies: 234
-- Data for Name: cupones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cupones (codigo, porcentaje, "fechaInicio", "fechaFin", condicion, "topeUso", valido, "montoMinimo", "idTemaRequerido") FROM stdin;
JUANJONETA	15.00	2026-05-12	2026-05-23	Compra minima de 300.000	2	t	300000.00	\N
UADER	50.00	2026-05-14	2026-05-20	Black Friday!!	20	t	50000.00	\N
MUNDIAL	10.00	2026-05-21	2026-05-29	Exclusivo para los fanaticos del futbol	10	t	10000.00	33
FRANCO	10.00	2026-05-13	2026-05-26		20	t	50000.00	23
\.


--
-- TOC entry 3587 (class 0 OID 41336)
-- Dependencies: 229
-- Data for Name: favoritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favoritos (id, "usuarioId", "productoId", "fechaAgregado", "comboId") FROM stdin;
45	95820	10293	2026-04-24 20:33:07.955423	\N
46	95820	38475	2026-04-24 20:41:13.796507	\N
70	23742	64738	2026-04-25 04:35:30.384534	\N
71	23742	81923	2026-04-25 04:35:31.536353	\N
72	89207	81923	2026-04-25 04:43:14.699822	\N
74	89207	99123	2026-04-25 04:43:18.690309	\N
75	89207	10293	2026-04-25 04:43:22.734762	\N
76	89207	64738	2026-04-25 04:43:24.231987	\N
77	89207	38475	2026-04-25 04:43:25.64747	\N
78	89207	23481	2026-04-25 04:43:26.695933	\N
79	89207	74829	2026-04-25 04:43:27.423137	\N
80	89207	56102	2026-04-25 04:43:28.399134	\N
81	89207	48291	2026-04-25 04:43:30.248039	\N
82	89207	15392	2026-04-25 04:43:31.143881	\N
83	97729	64738	2026-04-30 14:14:11.538929	\N
84	97729	81923	2026-04-30 14:14:33.747764	\N
85	97729	74829	2026-04-30 14:14:36.792774	\N
87	45445	99123	2026-04-30 15:43:38.477347	\N
88	72142	74829	2026-05-01 16:57:02.797415	\N
89	95820	48291	2026-05-08 18:35:21.209229	\N
95	45445	38475	2026-05-08 20:27:12.424578	\N
96	45445	81923	2026-05-08 20:34:54.222194	\N
97	45445	82555	2026-05-08 22:56:16.150969	\N
98	97729	27599	2026-05-15 15:14:12.975528	\N
99	43201	37664	2026-05-15 17:24:07.136573	\N
100	43201	31851	2026-05-15 17:24:12.314376	\N
101	43201	27599	2026-05-15 17:24:17.431149	\N
102	97729	96498	2026-05-18 13:37:03.26138	\N
104	45445	27599	2026-05-18 14:48:25.331602	\N
105	97729	55146	2026-05-21 18:53:38.181582	\N
106	97729	80642	2026-05-21 19:12:25.520344	\N
107	47892	86057	2026-05-29 20:08:43.715836	\N
108	47892	17146	2026-05-29 20:08:44.663822	\N
109	47892	24549	2026-05-29 20:08:46.746399	\N
\.


--
-- TOC entry 3582 (class 0 OID 33042)
-- Dependencies: 224
-- Data for Name: lineas_carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lineas_carrito ("idLineaCarrito", cantidad, "precioUnitario", "idCarrito", "idProducto", "idCombo") FROM stdin;
147	1	50000.00	13	55146	\N
63	2	30000.00	4	96645	\N
64	1	50000.00	4	51442	\N
150	2	50000.00	11	55146	\N
132	1	15000.00	12	40581	\N
133	1	300000.00	5	27021	\N
134	1	10000.00	5	66099	\N
107	1	50000.00	6	86057	\N
145	1	300000.00	10	24549	\N
\.


--
-- TOC entry 3584 (class 0 OID 33049)
-- Dependencies: 226
-- Data for Name: lineas_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lineas_pedido ("idLineaPedido", cantidad, "precioHistorico", "idPedido", "idProducto", "idCombo") FROM stdin;
1	1	45000.00	4	48291	\N
2	2	32000.00	4	99123	\N
3	1	55000.00	4	15392	\N
4	1	45000.00	5	48291	\N
5	2	55000.00	6	15392	\N
6	1	45000.00	7	48291	\N
7	1	45000.00	8	48291	\N
8	2	55000.00	9	15392	\N
9	1	45000.00	10	48291	\N
10	1	25000.00	11	38475	\N
11	1	1.00	12	74829	\N
12	1	32000.00	13	99123	\N
13	1	1.00	14	74829	\N
14	2	1.00	15	74829	\N
15	5	1.00	16	74829	\N
16	1	1.00	17	74829	\N
19	2	19500.00	20	10293	\N
21	1	55000.00	22	15392	\N
22	1	26000.00	22	82555	\N
23	1	55000.00	23	15392	\N
24	5	26000.00	23	82555	\N
20	1	26000.00	21	82555	\N
25	7	32000.00	24	99123	\N
26	6	15000.00	25	56102	\N
27	3	12500.00	26	23481	\N
28	1	85000.00	27	64738	\N
35	1	50000.00	31	37664	\N
36	1	50000.00	31	27599	\N
38	1	50000.00	33	86057	\N
37	1	50000.00	32	86057	\N
39	1	30000.00	34	96498	\N
33	1	50000.00	30	37664	\N
34	1	50000.00	30	27599	\N
40	1	30000.00	35	96498	\N
41	1	30000.00	36	31851	\N
42	1	50000.00	36	86057	\N
43	1	50000.00	37	59469	\N
44	3	30000.00	38	96498	\N
45	3	30000.00	39	96498	\N
18	2	19500.00	19	10293	\N
46	2	30000.00	40	96498	\N
47	2	30000.00	41	96498	\N
48	2	30000.00	42	96498	\N
49	2	30000.00	43	96498	\N
50	2	30000.00	44	96498	\N
17	4	1.00	18	74829	\N
51	1	50000.00	45	96498	\N
52	2	30000.00	46	96645	\N
53	1	80000.00	46	96498	\N
54	1	50000.00	46	37664	\N
56	1	130000.00	48	\N	35978
57	1	130000.00	49	\N	35978
58	1	130000.00	50	\N	35978
55	2	50000.00	47	37664	\N
59	1	130000.00	51	\N	35978
60	1	30000.00	52	31851	\N
61	1	50000.00	53	86057	\N
62	1	50000.00	54	37664	\N
63	1	50000.00	55	37664	\N
64	1	50000.00	56	51442	\N
65	1	30000.00	57	96645	\N
66	2	30000.00	58	31851	\N
67	1	50000.00	59	51442	\N
68	1	50000.00	59	86057	\N
69	1	30000.00	60	31851	\N
70	1	50000.00	60	86057	\N
71	1	80000.00	61	96498	\N
72	1	50000.00	61	51442	\N
73	1	50000.00	61	86057	\N
74	1	50000.00	62	86057	\N
75	1	30000.00	62	31851	\N
76	1	50000.00	63	51442	\N
77	3	30000.00	63	31851	\N
78	1	30000.00	64	96645	\N
79	6	50000.00	64	51442	\N
80	5	30000.00	64	31851	\N
81	12	50000.00	64	59469	\N
82	2	50000.00	64	37664	\N
83	1	300000.00	65	74179	\N
84	2	300000.00	65	27021	\N
85	1	10000.00	66	43837	\N
86	1	80000.00	67	59469	\N
87	1	50000.00	67	51442	\N
88	1	50000.00	67	55146	\N
89	1	15000.00	68	40581	\N
90	1	50000.00	69	47867	\N
31	2	50000.00	29	37664	\N
32	1	50000.00	29	27599	\N
91	1	300000.00	70	27021	\N
29	2	50000.00	28	37664	\N
30	1	50000.00	28	27599	\N
92	1	50000.00	71	55146	\N
93	1	1000000.00	72	80642	\N
94	1	250000.00	73	10992	\N
95	1	250000.00	74	17971	\N
96	1	250000.00	75	17971	\N
97	1	50000.00	76	55146	\N
98	1	300000.00	77	27021	\N
99	2	300000.00	78	27021	\N
100	2	50000.00	79	55146	\N
\.


--
-- TOC entry 3575 (class 0 OID 16422)
-- Dependencies: 217
-- Data for Name: niveles_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.niveles_usuario ("idNivel", nombre, beneficio, "montoMinimo", "porcentajeDescuento") FROM stdin;
16	Aprendiz	Sin beneficios extra	0.00	0.00
17	Constructor	3% de descuento	50000.00	3.00
18	Arquitecto	5% de descuento	150000.00	5.00
19	Experto	8% de descuento	350000.00	8.00
20	Maestro	12% de descuento + Envío gratis	750000.00	12.00
\.


--
-- TOC entry 3580 (class 0 OID 24617)
-- Dependencies: 222
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos ("idPedido", fecha, total, estado, "idUsuario", "codigoCupon", "direccionEnvio") FROM stdin;
2	2026-04-08 14:44:07.648897	680000.00	PAGADO	72142	\N	\N
3	2026-04-30 15:02:44.919878	164000.00	PAGADO	72142	\N	\N
4	2026-04-30 15:03:20.119775	164000.00	PAGADO	72142	\N	\N
5	2025-09-17 14:30:00	45000.00	PAGADO	45445	\N	\N
6	2025-09-20 10:15:00	110000.00	PAGADO	45445	\N	\N
7	2026-05-01 14:21:40.7794	45000.00	PAGADO	45445	\N	\N
8	2025-09-17 14:30:00	45000.00	PAGADO	45445	\N	\N
9	2025-09-20 10:15:00	110000.00	PAGADO	45445	\N	\N
10	2026-05-01 14:59:41.976912	45000.00	PAGADO	45445	\N	\N
11	2026-05-14 16:30:01.026299	25000.00	PAGADO	50259	\N	\N
12	2026-05-14 19:46:14.004113	0.88	PAGADO	45445	\N	\N
13	2026-05-14 19:46:35.567915	28160.00	PAGADO	45445	\N	\N
14	2026-05-14 20:09:37.489037	1.00	PAGADO	95820	\N	\N
15	2026-05-14 20:26:39.612176	1.76	PAGADO	45445	\N	\N
16	2026-05-14 20:33:03.651882	4.40	PAGADO	45445	\N	\N
17	2026-05-14 20:34:33.215881	0.88	PAGADO	45445	\N	\N
20	2026-05-14 21:09:20.074424	34320.00	PAGADO	45445	\N	\N
22	2026-05-14 21:16:28.805087	71280.00	CANCELADO	45445	\N	\N
23	2026-05-14 21:19:04.525415	162800.00	PAGADO	45445	\N	\N
21	2026-05-14 21:11:57.236651	22880.00	PAGADO	45445	\N	\N
24	2026-05-14 21:26:29.182496	197120.00	PAGADO	45445	\N	\N
25	2026-05-14 21:32:20.4446	79200.00	PAGADO	45445	\N	\N
59	2026-05-19 14:43:36.645184	100000.00	PAGADO	29396	\N	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
27	2026-05-14 21:51:19.749513	82450.00	PAGADO	79147	\N	\N
31	2026-05-15 17:44:51.773207	100000.00	PAGADO	43201	\N	\N
33	2026-05-15 17:55:47.481644	47500.00	PAGADO	43201	\N	\N
32	2026-05-15 17:53:31.084283	47500.00	PAGADO	43201	\N	\N
34	2026-05-15 17:57:27.476356	27600.00	PAGADO	43201	\N	\N
35	2026-05-15 17:58:13.36017	26400.00	CANCELADO	43201	\N	\N
68	2026-05-22 21:40:25.885382	13200.00	CANCELADO	24673	\N	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
37	2026-05-15 21:12:49.48784	48500.00	CANCELADO	47892	\N	\N
38	2026-05-15 21:29:24.775765	79200.00	CANCELADO	45445	\N	\N
39	2026-05-15 21:30:05.087228	79200.00	PAGADO	45445	\N	\N
60	2026-05-19 14:58:20.663212	77600.00	PAGADO	29396	\N	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
26	2026-05-14 21:45:55.223993	36750.00	PAGADO	79147	\N	\N
30	2026-05-15 17:40:56.503467	98000.00	PAGADO	43201	\N	\N
19	2026-05-14 21:08:08.934107	33633.60	PAGADO	45445	\N	\N
40	2026-05-18 13:44:42.273544	58200.00	PENDIENTE	47892	\N	\N
41	2026-05-18 13:44:54.100619	58200.00	PENDIENTE	47892	\N	\N
42	2026-05-18 13:45:06.395718	58200.00	CANCELADO	47892	\N	\N
43	2026-05-18 13:45:49.171627	58200.00	PENDIENTE	47892	\N	\N
44	2026-05-18 13:58:24.145017	52800.00	PAGADO	45445	\N	\N
18	2026-05-14 20:47:58.909974	3.52	PAGADO	45445	\N	\N
45	2026-05-18 14:10:32.60323	44000.00	CANCELADO	45445	\N	\N
46	2026-05-18 14:13:30.080062	167200.00	CANCELADO	45445	\N	\N
48	2026-05-18 15:22:43.728359	114400.00	CANCELADO	45445	\N	\N
49	2026-05-18 15:36:12.58611	114400.00	PAGADO	45445	\N	\N
50	2026-05-18 15:43:12.050666	114400.00	PAGADO	45445	\N	\N
47	2026-05-18 14:16:13.70052	88000.00	PAGADO	45445	\N	\N
51	2026-05-18 15:44:02.405633	114400.00	PAGADO	45445	\N	\N
52	2026-05-18 16:10:21.908759	26400.00	CANCELADO	45445	\N	\N
53	2026-05-19 13:58:24.856753	50000.00	PAGADO	97729	\N	\N
54	2026-05-19 14:13:10.738554	48500.00	PAGADO	97729	\N	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
55	2026-05-19 14:24:38.878849	48500.00	PAGADO	97729	\N	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN
56	2026-05-19 14:30:30.118528	48500.00	PAGADO	97729	\N	Suipacha 1007
57	2026-05-19 14:33:54.395358	28500.00	PAGADO	97729	\N	Suipacha 1007
58	2026-05-19 14:34:24.38246	57000.00	CANCELADO	97729	\N	Suipacha 1007
61	2026-05-19 15:28:16.17365	85500.00	PAGADO	29396	UADER	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
62	2026-05-19 15:41:33.428708	82800.00	PAGADO	24673	\N	Avenida 12 de Octubre, Ñireco, San Carlos de Bariloche, Municipio de San Carlos de Bariloche, Departamento Bariloche, Río Negro, 8400
63	2026-05-19 15:48:53.767368	135800.00	PAGADO	24673	\N	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
64	2026-05-19 15:51:25.550038	1121000.00	PAGADO	24673	\N	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
65	2026-05-22 20:30:39.276353	771000.00	PAGADO	97729	MUNDIAL	Suipacha 1007
66	2026-05-22 20:31:36.711701	10300.00	PAGADO	97729	\N	Suipacha 1007
36	2026-05-15 21:07:32.662908	72000.00	PAGADO	47892	\N	\N
67	2026-05-22 21:36:16.679708	142560.00	PAGADO	24673	FRANCO	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
69	2026-05-27 14:58:51.455129	49000.00	PAGADO	43201	\N	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000
29	2026-05-15 17:38:59.117787	150000.00	PAGADO	43201	\N	\N
70	2026-05-27 15:07:09.508887	277500.00	PAGADO	43201	\N	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000
28	2026-05-15 17:38:07.766909	75000.00	PAGADO	43201	UADER	\N
71	2026-05-27 15:11:27.518567	45500.00	PAGADO	43201	\N	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000
72	2026-05-27 15:16:14.212254	881500.00	PAGADO	43201	\N	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000
73	2026-05-27 15:26:30.415225	251500.00	PAGADO	23742	\N	Estrada 638, Concepcion del Uruguay
74	2026-05-27 15:31:23.239304	239000.00	CANCELADO	23742	\N	Estrada 638, Concepcion del Uruguay
75	2026-05-27 15:32:34.770925	239000.00	PAGADO	23742	\N	Estrada 638, Concepcion del Uruguay
76	2026-05-27 15:36:18.970935	47500.00	CANCELADO	23742	\N	Estrada 638, Concepcion del Uruguay
77	2026-05-27 16:53:22.587397	277500.00	PAGADO	23742	\N	Estrada 638, Concepcion del Uruguay
78	2026-05-29 19:55:51.942425	525300.00	PAGADO	47892	MUNDIAL	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN
79	2026-05-29 20:39:21.620284	92000.00	CANCELADO	47892	\N	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD
\.


--
-- TOC entry 3590 (class 0 OID 65545)
-- Dependencies: 232
-- Data for Name: pertenece; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pertenece ("idCombo", "idProducto") FROM stdin;
35978	37664
35978	86057
35978	27599
54103	67467
54103	52087
20058	46729
20058	36996
30203	76903
30203	12214
30203	22349
30203	13449
30203	40581
\.


--
-- TOC entry 3585 (class 0 OID 41285)
-- Dependencies: 227
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos ("idProducto", "codigoProducto", titulo, "rangoEdad", "cantidadPiezas", descripcion, categoria, "productoOriginal", precio, stock, estado, "idTema", "esDestacado", "esNovedad", imagen, imagenes, "fechaCreacion", "fechaEdicion") FROM stdin;
74829	BM-1005	Guantelete del Infinito	18+	590	El poder del universo en tu mano.	Superhéroes	t	1.00	16	NoPublicado	1	f	f		\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
43837	BM-1033	De Benedictis Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Juan Bautista De Benedictis	Deportes	t	10000.00	19	Publicado	29	f	f	http://localhost:3000/uploads/fa65424e556e52d443eceebf1072cda06.png	{http://localhost:3000/uploads/fa65424e556e52d443eceebf1072cda06.png}	2026-05-21 15:47:19.276736	2026-05-22 20:32:02.663932
96645	BM-3412	Medica	9+	153	Este Lego es ideal para todos aquellos fanaticos de la medicina	Minifiguras	t	30000.00	0	Publicado	24	f	f	http://localhost:3000/uploads/fbdd2e175b96aafd8e18610b20d60aa6c.png	{http://localhost:3000/uploads/fbdd2e175b96aafd8e18610b20d60aa6c.png,http://localhost:3000/uploads/31f5bc47b1d3fa1a540f211e823d12c1.png}	2026-05-21 14:45:19.088902	2026-05-21 17:19:05.258212
59469	BM-1412	Dani Profe Lego	6+	3124	Este es el set del profesor Daniel	Minifiguras	t	50000.00	1233	Publicado	23	f	f	http://localhost:3000/uploads/b9222be1811e98a9462669158bc42a17.png	{http://localhost:3000/uploads/b9222be1811e98a9462669158bc42a17.png,http://localhost:3000/uploads/d18a6c98108c4bc77c9110ac8454fb9d35.png}	2026-05-21 14:45:19.088902	2026-05-27 13:53:12.130792
86057	BM-2002	Juanjo Lego	4+	2000	Este es el set ideal para los amantes de la musica, con un referente como es el Dj Juan Nievas	Minifiguras	t	50000.00	1	Publicado	23	t	t	http://localhost:3000/uploads/110125bbc5ca54fcd3c5ab583468cbd7e.png	{http://localhost:3000/uploads/110125bbc5ca54fcd3c5ab583468cbd7e.png,http://localhost:3000/uploads/10981cc8e7c4ab0b2727e593dc18ee655.png}	2026-05-21 14:45:19.088902	2026-05-27 13:24:54.632339
64738	BM-1010	Torre Eiffel Histórica	18+	10001	El set con más piezas jamás creado.	Arquitectura	t	85000.00	4	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
81923	BM-1008	Barco Pirata Fantasma	12+	1350	Navegá los siete mares en busca del tesoro.	Piratas	t	22000.00	10	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
99123	BM-1003	Auto Deportivo GT	9+	3778	Réplica exacta a escala para coleccionistas.	Vehículos	t	32000.00	0	NoPublicado	1	f	f	http://localhost:3000/uploads/4184d7cc8101653ca9910eacfe1de79d23.png	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
37664	BM-2003	Pipa Lego	4+	2003	Este es el lego del Pipa Benedetti	Minifiguras	t	50000.00	0	Publicado	23	t	t	http://localhost:3000/uploads/f43f65538e1d5b8116101359c10e13730.png	{http://localhost:3000/uploads/f43f65538e1d5b8116101359c10e13730.png,http://localhost:3000/uploads/d5d18619d38c93c158a10668710bdda25d.png}	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
82555	BM-1016	Vexoooo	4+	27998	Logo de la mejor empresa de la historia 	Fantasía	t	26000.00	-1	NoPublicado	1	f	f	http://localhost:3000/uploads/7b815b912107eac1098664c4b6e331a574.png	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
27599	BM-2005	Juani Lego	4+	2100	Este set es ideal para todos los programadores	Minifiguras	t	50000.00	0	Publicado	23	t	t	http://localhost:3000/uploads/3b9b8dad10333812290e8629041949c23.png	{http://localhost:3000/uploads/3b9b8dad10333812290e8629041949c23.png,http://localhost:3000/uploads/7b7f6efe67414b33391a2578798f4a8b.png}	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
96498	BM-1341	Enfermera	4+	200	Set de lego que te puede llegar a salvar la vida	Minifiguras	t	80000.00	0	Publicado	24	t	f	http://localhost:3000/uploads/4f1343463283d1aa6dfb0674abb83b8d.png	{http://localhost:3000/uploads/4f1343463283d1aa6dfb0674abb83b8d.png,http://localhost:3000/uploads/f3e957c95db1c8ff4c906595cb7c8ba0.png}	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
56102	BM-1006	Estación Espacial Internacional	16+	864	Explorá el universo desde tu habitación.	Espacio	t	15000.00	6	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
17221	BM-1032	Rossi Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Matías Rossi	Deportes	t	10000.00	30	Publicado	29	f	f	http://localhost:3000/uploads/aaf71c108ff0e1478868332b0ddb48486.png	{http://localhost:3000/uploads/aaf71c108ff0e1478868332b0ddb48486.png}	2026-05-21 15:45:56.449012	2026-05-21 15:45:56.449012
48291	BM-1001	Halcón Espacial de Combate	18+	7541	La nave más rápida de la galaxia.	Naves	t	45000.00	15	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
38475	BM-1007	Cafetería de Amigos	16+	1070	El punto de encuentro de tus personajes favoritos.	Series	t	18000.00	25	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
23481	BM-1004	Comisaría de Policía de la Ciudad	8+	894	Atrapá a los ladrones antes de que escapen.	Ciudad	t	12500.00	47	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
66099	BM-1030	Werner Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Mariano Werner	Deportes	t	10000.00	30	Publicado	29	f	f	http://localhost:3000/uploads/215eb108bae80fdb446bb78f98662baa1.png	{http://localhost:3000/uploads/215eb108bae80fdb446bb78f98662baa1.png}	2026-05-21 15:43:58.273779	2026-05-21 15:43:58.273779
15392	BM-1002	Castillo Mágico Escuela	16+	6020	Un castillo lleno de magia y misterio.	Castillos	t	55000.00	7	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
10293	BM-1009	Cabaña Alpina en el Bosque	12+	1100	Una escapada perfecta para armar en invierno.	Ciudad	t	19500.00	14	NoPublicado	\N	f	f	\N	\N	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
31851	BM-1354	Arquitecta	6+	412	Este es el set ideal para que tus construcciones sean las mejores	Minifiguras	t	30000.00	0	Publicado	24	t	f	http://localhost:3000/uploads/98bb9109e2f667ad26f910f76d7c12610c8.png	{http://localhost:3000/uploads/98bb9109e2f667ad26f910f76d7c12610c8.png,http://localhost:3000/uploads/ca5a811b6e3d1037fd11cc55ce56beace.png}	2026-05-21 14:45:19.088902	2026-05-21 14:45:19.088902
34661	BM-1034	Scialchi Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Jeremias Scialchi	Deportes	t	10000.00	20	Publicado	29	f	f	http://localhost:3000/uploads/1bf5ec68d6e4a91eeba5c610f38acf674.png	{http://localhost:3000/uploads/1bf5ec68d6e4a91eeba5c610f38acf674.png}	2026-05-21 15:48:33.356436	2026-05-21 15:48:33.356436
11304	BM-1031	Todino Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de German Todino	Deportes	t	10000.00	20	Publicado	29	f	f	http://localhost:3000/uploads/fabe0c5ca339243afd3d37fb9d6833fb.png	{http://localhost:3000/uploads/fabe0c5ca339243afd3d37fb9d6833fb.png}	2026-05-21 15:44:59.441308	2026-05-21 15:44:59.441308
67467	BM-1035	Colapinto Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad de la F1, en especial para los fanáticos de Franco Colapinto	Deportes	t	25000.00	40	Publicado	29	f	f	http://localhost:3000/uploads/2a89085f1c891d8e7ae83124010a26ec8.png	{http://localhost:3000/uploads/2a89085f1c891d8e7ae83124010a26ec8.png}	2026-05-21 15:49:43.164203	2026-05-21 15:49:43.164203
46729	BM-1036	Canapino Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Agustín Canapino	Deportes	t	10000.00	30	Publicado	29	f	f	http://localhost:3000/uploads/9197aa9ebe1d66e61f4259fa016ef925.png	{http://localhost:3000/uploads/9197aa9ebe1d66e61f4259fa016ef925.png}	2026-05-21 15:50:51.254654	2026-05-21 15:50:51.254654
85613	BM-1040	Minecraft Lego	6+	1588	Esta caja lego está dedicada para todos los amantes de Minecraft, para compartir con amigos	Juegos	t	200000.00	13	Publicado	30	f	f	http://localhost:3000/uploads/c10c8e6792125ee33cfc92e8ba3c9e9a7.png	{http://localhost:3000/uploads/c10c8e6792125ee33cfc92e8ba3c9e9a7.png}	2026-05-21 16:28:12.069838	2026-05-21 16:28:12.069838
52087	BM-1038	Auto Colapinto Lego	4+	30	Este lego está dedicado para todos los amantes de la velocidad de la F1, en especial para los fanáticos de Franco Colapinto	Deportes	t	45000.00	100	Publicado	29	f	f	http://localhost:3000/uploads/b46bc2a87bce46d3de5710110110d65c764.png	{http://localhost:3000/uploads/b46bc2a87bce46d3de5710110110d65c764.png}	2026-05-21 15:53:49.386804	2026-05-21 15:53:49.386804
36996	BM-1039	Auto Canapino Lego	4+	40	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Agustin Canapino	Deportes	t	35000.00	50	Publicado	29	f	f	http://localhost:3000/uploads/d176e54c1b1594db9c7b8448eb9741b4.png	{http://localhost:3000/uploads/d176e54c1b1594db9c7b8448eb9741b4.png}	2026-05-21 15:55:10.233097	2026-05-21 15:55:10.233097
56395	BM-1049	Coliseo Romano Lego	13+	9036	Esta caja lego está dedicada para todos los amantes de Roma y del Coliseo, para compartir con amigos	Arquitectura	t	250000.00	123	Publicado	36	f	f	http://localhost:3000/uploads/da8925cd23d44c2ec691789e9107ed1ff.png	{http://localhost:3000/uploads/da8925cd23d44c2ec691789e9107ed1ff.png}	2026-05-21 16:45:27.205421	2026-05-21 16:45:56.982937
10726	BM-1050	Cilindro Lego	6+	13894	Esta caja lego está dedicada para todos los amantes de Racing, para compartir con amigos	Deportes	t	250000.00	12	Publicado	37	f	f	http://localhost:3000/uploads/c4b23de309310101a456eff78df7de0ddc.png	{http://localhost:3000/uploads/c4b23de309310101a456eff78df7de0ddc.png}	2026-05-21 16:47:36.882194	2026-05-21 16:47:36.882194
56835	BM-1041	Estatua de la Libertad Lego	13+	10001	Esta caja lego está dedicada para todos los amantes de Nueva York y de la Estatua de la Libertad, para compartir con amigos	Arquitectura	t	250000.00	34	Publicado	31	f	f	http://localhost:3000/uploads/c284aa974c988ee41bdb4fc631b224c1.png	{http://localhost:3000/uploads/c284aa974c988ee41bdb4fc631b224c1.png}	2026-05-21 16:31:09.240027	2026-05-21 16:34:27.047146
14277	BM-1042	Cars Lego	9+	1545	Esta caja lego está dedicada para todos los amantes de Cars, para compartir con amigos	Películas	t	250000.00	23	Publicado	32	f	f	http://localhost:3000/uploads/1bc6673e394d4cd7b4efb4dda1087a3a7.png	{http://localhost:3000/uploads/1bc6673e394d4cd7b4efb4dda1087a3a7.png}	2026-05-21 16:33:54.547245	2026-05-21 16:34:53.97795
79402	BM-1056	Walter Profe Lego	4+	15	Este lego representa al profe programador Walter	Minifiguras	t	50000.00	47	Publicado	23	f	f	http://localhost:3000/uploads/6f15c369e5c8cca92d83f31a7105b18d5.png	{http://localhost:3000/uploads/6f15c369e5c8cca92d83f31a7105b18d5.png}	2026-05-21 16:58:18.260639	2026-05-22 20:51:43.870364
90065	BM-1044	El Señor de los Anillos Lego	13+	2311	Esta caja lego está dedicada para todos los amantes de El Señor de los Anillos, para compartir con amigos	Películas	t	250000.00	21	Publicado	34	f	f	http://localhost:3000/uploads/128f57984f93adb1aa7a10f58922695110.png	{http://localhost:3000/uploads/128f57984f93adb1aa7a10f58922695110.png}	2026-05-21 16:39:19.477073	2026-05-21 16:39:45.012612
79119	BM-1051	Jumanji Lego	9+	1950	Esta caja lego está dedicada para todos los amantes de Jumanji, para compartir con amigos	Películas	t	250000.00	54	Publicado	38	f	f	http://localhost:3000/uploads/38fd16e787fed5dfb5bb39a210b5ec210e.png	{http://localhost:3000/uploads/38fd16e787fed5dfb5bb39a210b5ec210e.png}	2026-05-21 16:48:59.356823	2026-05-21 16:48:59.356823
81234	BM-2465	Mickey Mouse Lego	4+	1588	Esta caja lego está dedicada para todos los amantes de Mickey Mouse, para compartir con amigos	Películas	t	250000.00	34	Publicado	35	f	f	http://localhost:3000/uploads/2a2287577ad9284dec8ec4645ae44d30.png	{http://localhost:3000/uploads/2a2287577ad9284dec8ec4645ae44d30.png}	2026-05-21 16:42:39.972474	2026-05-21 16:43:41.194216
46372	BM-1053	Selección Francia Lego	4+	3912	Esta caja lego está dedicada para todos los franceses, para compartir con amigos y alentar a la selección en el Mundial	Deportes	t	300000.00	43	Publicado	33	f	f	http://localhost:3000/uploads/bbd34e5424f9ea1272fbd21c2652b21e.png	{http://localhost:3000/uploads/bbd34e5424f9ea1272fbd21c2652b21e.png}	2026-05-21 16:53:18.607666	2026-05-22 20:45:22.592775
76903	BM-1055	Jugador Boca Lego	6+	15	Este lego está dedicada para todos los amantes de Boca	Deportes	t	15000.00	40	Publicado	37	f	f	http://localhost:3000/uploads/26d2f2b5e56ce36a97c73df5d4101e825.png	{http://localhost:3000/uploads/26d2f2b5e56ce36a97c73df5d4101e825.png}	2026-05-21 16:57:09.765536	2026-05-21 16:57:09.765536
12214	BM-1057	Jugador Independiente Lego	6+	15	Este lego está dedicada para todos los amantes de Independiente	Deportes	t	15000.00	40	Publicado	37	f	f	http://localhost:3000/uploads/494e9d3cf17e5c47c665f92ab8ad3e0c.png	{http://localhost:3000/uploads/494e9d3cf17e5c47c665f92ab8ad3e0c.png}	2026-05-21 16:59:23.862701	2026-05-21 16:59:23.862701
74179	BM-1052	Selección Uruguay Lego	4+	3912	Esta caja lego está dedicada para todos los uruguayos, para compartir con amigos y alentar a la Celeste en el Mundial	Deportes	t	300000.00	55	Publicado	33	f	f	http://localhost:3000/uploads/887cc3dd86c457e94ebfff9de8cbfd62.png	{http://localhost:3000/uploads/887cc3dd86c457e94ebfff9de8cbfd62.png}	2026-05-21 16:50:39.394448	2026-05-22 20:44:26.434474
24549	BM-1043	Mundial 2026 Lego	6+	5591	Esta caja lego está dedicada para todos los amantes del fútbol para este Mundial 2026, para compartir con amigos	Deportes	t	300000.00	68	Publicado	33	f	t	http://localhost:3000/uploads/40cb1095c4d1d0106b458d152fe35dc5ed.png	{http://localhost:3000/uploads/40cb1095c4d1d0106b458d152fe35dc5ed.png}	2026-05-21 16:37:11.413351	2026-05-21 17:19:13.956504
17146	BM-1037	Jakos Lego	4+	15	Este lego está dedicado para todos los amantes de la velocidad del TC, en especial para los fanáticos de Andy Jakos	Deportes	t	10000.00	1	Publicado	29	f	f	http://localhost:3000/uploads/3f2566c4e392bfb7883b541033cd8358.png	{http://localhost:3000/uploads/3f2566c4e392bfb7883b541033cd8358.png}	2026-05-21 15:51:47.283175	2026-05-27 13:33:45.305661
51442	BM-1234	Juli Profe Lego	4+	103	Este es el set ideal para todos aquellos profesores	Minifiguras	t	50000.00	0	Publicado	23	t	f	http://localhost:3000/uploads/b397d29101e2d5a4a15ba6833959fc81a.png	{http://localhost:3000/uploads/b397d29101e2d5a4a15ba6833959fc81a.png,http://localhost:3000/uploads/58c52a10483a5f91b3eedb960d3e2e4af.png}	2026-05-21 14:45:19.088902	2026-05-22 21:36:38.493882
27021	BM-1054	Selección Brasil Lego	4+	3912	Esta caja lego está dedicada para todos los brasileros, para compartir con amigos y alentar a la selección en el Mundial	Deportes	t	300000.00	40	Publicado	33	f	t	http://localhost:3000/uploads/cb8259d10eebef9d3c505e0f19be0c5c5.png	{http://localhost:3000/uploads/cb8259d10eebef9d3c505e0f19be0c5c5.png}	2026-05-21 16:55:31.530179	2026-05-29 19:56:34.90353
22349	BM-1062	Jugador Racing Lego	6+	15	Este lego está dedicada para todos los amantes de Racing	Deportes	t	15000.00	35	Publicado	37	f	f	http://localhost:3000/uploads/8c8b3fe8108968e421510ad10e1831a3cab.png	{http://localhost:3000/uploads/8c8b3fe8108968e421510ad10e1831a3cab.png}	2026-05-21 17:05:28.372696	2026-05-21 17:05:28.372696
55146	BM-1074	Franquito Lego	18+	15	Este set es ideal para todos los jugadores y JUGADORAS de voley	Minifiguras	t	50000.00	32	Publicado	23	t	f	http://localhost:3000/uploads/415d5ad276c605f818cd1a93be3864a1.png	{http://localhost:3000/uploads/415d5ad276c605f818cd1a93be3864a1.png}	2026-05-21 18:35:55.069556	2026-05-27 15:11:37.35486
13449	BM-1060	Jugador River Lego	6+	15	Este lego está dedicada para todos los amantes de River\n	Deportes	t	15000.00	40	Publicado	37	f	f	http://localhost:3000/uploads/bf5644d55e4c8e94d5dd1b010551097ad5.png	{http://localhost:3000/uploads/bf5644d55e4c8e94d5dd1b010551097ad5.png}	2026-05-21 17:02:54.543918	2026-05-21 17:09:50.875357
80642	BM-1070	UADER Developers Lego	18+	638	Esta caja de Lego cuenta con los 6 desarrolladores más conocidos de la industria del Software	Minifiguras	t	1000000.00	99	Publicado	23	t	t	http://localhost:3000/uploads/7a410a9a61479d63c7c1dc10db5f691c98.png	{http://localhost:3000/uploads/7a410a9a61479d63c7c1dc10db5f691c98.png}	2026-05-21 18:26:21.609238	2026-05-27 15:16:26.283229
10992	BM-1063	Indiana Jones Lego	9+	2480	Esta caja lego está dedicada para todos los amantes de Indiana Jones, para compartir con amigos	Películas	t	250000.00	33	Publicado	39	t	f	http://localhost:3000/uploads/08aa10a1902935984c62ec2db8e53423.png	{http://localhost:3000/uploads/08aa10a1902935984c62ec2db8e53423.png}	2026-05-21 17:13:41.175417	2026-05-27 15:26:40.11151
30825	BM-1064	Rodrigo Lego	6+	15	Esta lego está dedicada para todos los amantes de Rodrigo. CUARTEEEEEEEETO	Música	t	25000.00	23	Publicado	40	f	f	http://localhost:3000/uploads/ec61051079946821011f3284523106a63728.png	{http://localhost:3000/uploads/ec61051079946821011f3284523106a63728.png}	2026-05-21 17:15:48.542227	2026-05-21 17:15:48.542227
65202	BM-1066	Marvel Lego	13+	1588	Esta caja lego está dedicada para todos los amantes de Marvel, para compartir con amigos	Películas	t	250000.00	56	Publicado	41	f	f	http://localhost:3000/uploads/4bd0495f58a7ab83a22b26de910464f88.png	{http://localhost:3000/uploads/4bd0495f58a7ab83a22b26de910464f88.png}	2026-05-21 17:17:09.843596	2026-05-21 17:17:09.843596
14976	BM-1067	DC Lego	13+	1650	Esta caja lego está dedicada para todos los amantes de DC, para compartir con amigos	Películas	t	250000.00	43	Publicado	42	t	f	http://localhost:3000/uploads/b6193c31336241e10ef68100c9ef5c68f8.png	{http://localhost:3000/uploads/b6193c31336241e10ef68100c9ef5c68f8.png}	2026-05-21 17:18:41.483008	2026-05-21 17:19:22.094017
40581	BM-1061	Jugador San Lorenzo Lego	6+	15	Este lego está dedicada para todos los amantes de San Lorenzo, el club mas hermoso del mundo	Deportes	t	15000.00	40	Publicado	37	t	f	http://localhost:3000/uploads/57b73116f8f4999610c9484b17ad8e516.png	{http://localhost:3000/uploads/57b73116f8f4999610c9484b17ad8e516.png}	2026-05-21 17:04:15.694147	2026-05-21 17:19:24.908657
96996	BM-1072	Bizarrap Lego	18+	15	Este lego está dedicada para todos los amantes del Biza 😎	Música	t	250000.00	23	Publicado	40	f	f	http://localhost:3000/uploads/35f1d9270b9e9d83110a35c98bb55ecb4.png	{http://localhost:3000/uploads/35f1d9270b9e9d83110a35c98bb55ecb4.png}	2026-05-21 18:30:35.618303	2026-05-21 18:31:02.663167
17971	BM-1059	Castillo Disney Lego	9+	2855	Esta caja lego está dedicada para todos los amantes de Disney, para compartir con amigos	Películas	t	250000.00	33	Publicado	35	t	f	http://localhost:3000/uploads/737d5d76f3c241a19e81dbfa3a2b4180.png	{http://localhost:3000/uploads/737d5d76f3c241a19e81dbfa3a2b4180.png}	2026-05-21 17:00:52.636123	2026-05-27 15:32:44.590297
82119	BM-1075	Ema Ke Personajes Lego	13+	15	Este lego está dedicada para todos los amantes de Ke Personajes	Música	t	30000.00	45	Publicado	40	f	f	http://localhost:3000/uploads/7777cf5a5acb45ad5359772aa48eec88.png	{http://localhost:3000/uploads/7777cf5a5acb45ad5359772aa48eec88.png}	2026-05-21 18:45:09.623277	2026-05-21 18:45:54.724079
98783	BM-1078	Pablo Profe Lego	9+	15	Este lego representa al profe programador Pablo	Minifiguras	t	50000.00	34	Publicado	23	f	f	http://localhost:3000/uploads/315d610c2f173c5d5156105f0a824251e4.png	{http://localhost:3000/uploads/315d610c2f173c5d5156105f0a824251e4.png}	2026-05-22 20:52:46.180921	2026-05-22 20:53:09.817089
47867	BM-1073	Agus Lego	18+	20	Este set es ideal para todos los locos bien camperos	Minifiguras	t	50000.00	53	Publicado	23	t	f	http://localhost:3000/uploads/a2fd75ce6f24232d841fc10e43110778d1.png	{http://localhost:3000/uploads/a2fd75ce6f24232d841fc10e43110778d1.png}	2026-05-21 18:35:12.142565	2026-05-27 14:59:01.582705
\.


--
-- TOC entry 3589 (class 0 OID 49154)
-- Dependencies: 231
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resenas ("idResena", comentario, "esAnonima", estrellas, "idUsuario", "idProducto", "eliminadaPorAdmin", "idPedido") FROM stdin;
1	Muy buen producto, estoy muy contento y mi hijito de 9 años cada vez que mira el lego que le compre llora de la emocion por que somos humildes y ustedes tiene muy buenos precios. Mas que bien, saludos desde la republica oriental del Uruguay ta, vamo arriba	t	5	72142	48291	f	\N
2	Lamentablemente llego roto, una lastima: Entiendo que es culpa del correo, que son un desastre.	f	1	72142	99123	t	\N
3	Muy bueno bo	f	4	45445	48291	f	\N
4	EXCELENTEEEEE!!!!!!! QUE FELIZ ESTOY	t	5	45445	15392	f	\N
5	Muy buen producto	f	5	45445	48291	f	7
7	Que buen producto, mi hijo esta muy contento con esta nueva adquisición. 	f	4	45445	15392	f	6
6	mmm flojo	t	2	45445	48291	t	5
8	GRACIAS VIEJA POR HACERME HINCHA DE MERCADOPAGO	t	5	45445	10293	f	20
9	Muy buen producto	f	5	43201	37664	t	31
11	buen producto	t	4	47892	31851	f	36
10	muy buen producto	f	5	47892	86057	t	36
12	muy buena calidad	t	5	45445	96498	f	39
13	Muy buen producto	t	5	24673	37664	f	64
14	Muy buen producto	t	5	47892	27021	t	78
\.


--
-- TOC entry 3573 (class 0 OID 16410)
-- Dependencies: 215
-- Data for Name: temas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temas ("idTema", nombre) FROM stdin;
1	Star Wars
23	Personajes Historicos
24	Profesiones
29	Automovilismo
30	Minecraft
31	Monumentos
32	Cars
33	Mundial 2026
34	El Señor de los Anillos
35	Disney
36	Edificios
37	Fútbol
38	Jumanji
39	Indiana Jones
40	Cantantes
41	Marvel
42	DC
\.


--
-- TOC entry 3576 (class 0 OID 16428)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios ("idUsuario", "idNivel", password, "fechaRegistro", nombre, email, "esAdmin", apellido, direccion, telefono) FROM stdin;
23742	20	\N	2026-04-25 04:29:32.046908	Bloque	bloquemundoo@gmail.com	t	Mundo	Estrada 638, Concepcion del Uruguay	3442124518
43201	20	\N	2026-05-15 17:23:56.865929	Valentino	valenbeb@gmail.com	f	Benedetti	Estadio Eva Perón, Gandini, El Picaflor, Junín, Partido de Junín, Buenos Aires, 6000	3445456731
95820	16	$2b$10$WNwo4inMa8ajIOnhwuNJbenr54YHpPWWTAsHyGL66hvbFsNvN6FZe	2026-04-08 14:21:09.186455	Valentino	valen@bloquemundo.com	t	 Benedetti	Estrada 638	03442311247
72142	20	$2b$10$dBQ1w4l41qI3dh.7uUG7Zu0BgL.wbFHrJqRAozF09rxCtSaBK1xMy	2026-04-08 14:21:29.50471	Juan Ignacio	saenz@bloquemundo.com	t	Saenz	Estrada 638	3445539839
97729	20	$2b$10$eg7g4v/dt/RDGVqE5ETqde0/e6fpPmgWcm99L.5zO05zfvYGkX9Na	2026-04-08 14:21:21.754107	Juan José	nievas@bloquemundo.com	t	Nievas	Suipacha 1007	3442588921
50259	16	\N	2026-04-30 14:10:16.349179	Franco	francofrachiaesc@gmail.com	f	Frachia	Galarza 1001, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	3455482831
89207	16	\N	2026-04-25 04:43:10.097392	Francisco Agustin	fr.abenedetti1@gmail.com	f	Benedetti	Mitre 120	3446932345
29396	18	\N	2026-05-14 14:48:54.081627	Juan	juannsaenzz17@gmail.com	t	Saenz	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	242345555555325
79147	17	\N	2026-05-14 21:45:32.738082	Valentino	valentinobenedetti1905@gmail.com	f	Palermo	128, Ernesto Fitte, San Antonio de Areco, Partido de San Antonio de Areco, Buenos Aires, B2760ACN	34434283476
47892	19	\N	2026-05-15 21:03:24.810528	Valentino	valentinobenedetti9@gmail.com	t	Benedetti	638, Estrada, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	3442311247
24673	20	\N	2026-05-19 15:34:22.814008	Vexa	systemsvexa@gmail.com	f	Systems	Galarza, San Vicente, Concepción del Uruguay, Distrito Molino, Departamento Uruguay, Entre Ríos, E3260FTD	3442563247
45445	20	$2b$10$ZZbMbJw8ZjSTREO5ydi.oeNpZwR6QupUEp0Fd9o8kgqE06IK3Dv2W	2026-04-08 15:05:37.252218	Maravilla 	maravilla@bloquemundo.com	f	Martinez	Cilindro 123	3442469583
\.


--
-- TOC entry 3612 (class 0 OID 0)
-- Dependencies: 219
-- Name: carritos_idCarrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."carritos_idCarrito_seq"', 13, true);


--
-- TOC entry 3613 (class 0 OID 0)
-- Dependencies: 237
-- Name: categorias_idCategoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."categorias_idCategoria_seq"', 26, true);


--
-- TOC entry 3614 (class 0 OID 0)
-- Dependencies: 235
-- Name: correo_argentino_idEnvio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."correo_argentino_idEnvio_seq"', 52, true);


--
-- TOC entry 3615 (class 0 OID 0)
-- Dependencies: 228
-- Name: favoritos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favoritos_id_seq', 109, true);


--
-- TOC entry 3616 (class 0 OID 0)
-- Dependencies: 223
-- Name: lineas_carrito_idLineaCarrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."lineas_carrito_idLineaCarrito_seq"', 150, true);


--
-- TOC entry 3617 (class 0 OID 0)
-- Dependencies: 225
-- Name: lineas_pedido_idLineaPedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."lineas_pedido_idLineaPedido_seq"', 100, true);


--
-- TOC entry 3618 (class 0 OID 0)
-- Dependencies: 216
-- Name: niveles_usuario_idNivel_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."niveles_usuario_idNivel_seq"', 20, true);


--
-- TOC entry 3619 (class 0 OID 0)
-- Dependencies: 221
-- Name: pedidos_idPedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."pedidos_idPedido_seq"', 79, true);


--
-- TOC entry 3620 (class 0 OID 0)
-- Dependencies: 230
-- Name: resenas_idResena_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."resenas_idResena_seq"', 14, true);


--
-- TOC entry 3621 (class 0 OID 0)
-- Dependencies: 214
-- Name: temas_idTema_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."temas_idTema_seq"', 43, true);


--
-- TOC entry 3384 (class 2606 OID 33054)
-- Name: lineas_pedido PK_0097e5e2c47726ec271b16fcba3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido
    ADD CONSTRAINT "PK_0097e5e2c47726ec271b16fcba3" PRIMARY KEY ("idLineaPedido");


--
-- TOC entry 3398 (class 2606 OID 74137)
-- Name: combos PK_0719d9aea05f85c45f2e5cdedae; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos
    ADD CONSTRAINT "PK_0719d9aea05f85c45f2e5cdedae" PRIMARY KEY ("idCombo");


--
-- TOC entry 3396 (class 2606 OID 65549)
-- Name: pertenece PK_0c454b19edbe63115a6e48dfc1c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pertenece
    ADD CONSTRAINT "PK_0c454b19edbe63115a6e48dfc1c" PRIMARY KEY ("idCombo", "idProducto");


--
-- TOC entry 3372 (class 2606 OID 16433)
-- Name: usuarios PK_23e41f215fc91d01207123f74af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_23e41f215fc91d01207123f74af" PRIMARY KEY ("idUsuario");


--
-- TOC entry 3390 (class 2606 OID 41342)
-- Name: favoritos PK_2a6a4d0119130451dc0b644590a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT "PK_2a6a4d0119130451dc0b644590a" PRIMARY KEY (id);


--
-- TOC entry 3380 (class 2606 OID 24624)
-- Name: pedidos PK_46dbf556ac662a97b1117dc798c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "PK_46dbf556ac662a97b1117dc798c" PRIMARY KEY ("idPedido");


--
-- TOC entry 3400 (class 2606 OID 74164)
-- Name: cupones PK_5e11e0e4e948543f97ed85d457a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT "PK_5e11e0e4e948543f97ed85d457a" PRIMARY KEY (codigo);


--
-- TOC entry 3368 (class 2606 OID 16415)
-- Name: temas PK_8e5cbf5810c25b868717fc1595b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temas
    ADD CONSTRAINT "PK_8e5cbf5810c25b868717fc1595b" PRIMARY KEY ("idTema");


--
-- TOC entry 3406 (class 2606 OID 98311)
-- Name: categorias PK_96820aa72955b18d906d10270cd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT "PK_96820aa72955b18d906d10270cd" PRIMARY KEY ("idCategoria");


--
-- TOC entry 3376 (class 2606 OID 24591)
-- Name: carritos PK_adcb2eaaa036b2bf1d2acd1c23a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos
    ADD CONSTRAINT "PK_adcb2eaaa036b2bf1d2acd1c23a" PRIMARY KEY ("idCarrito");


--
-- TOC entry 3370 (class 2606 OID 16427)
-- Name: niveles_usuario PK_b09b144023d5176aa902a8f7e5d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.niveles_usuario
    ADD CONSTRAINT "PK_b09b144023d5176aa902a8f7e5d" PRIMARY KEY ("idNivel");


--
-- TOC entry 3386 (class 2606 OID 41294)
-- Name: productos PK_c2304bdf79536791a9d47f9b918; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "PK_c2304bdf79536791a9d47f9b918" PRIMARY KEY ("idProducto");


--
-- TOC entry 3402 (class 2606 OID 81933)
-- Name: correo_argentino PK_cf40d44bdd2d634851ecfa3de65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correo_argentino
    ADD CONSTRAINT "PK_cf40d44bdd2d634851ecfa3de65" PRIMARY KEY ("idEnvio");


--
-- TOC entry 3392 (class 2606 OID 49163)
-- Name: resenas PK_d41b9f5af45c8234d51eaa196e4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT "PK_d41b9f5af45c8234d51eaa196e4" PRIMARY KEY ("idResena");


--
-- TOC entry 3382 (class 2606 OID 33047)
-- Name: lineas_carrito PK_d6d88092157fa32858b0f4d61ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_carrito
    ADD CONSTRAINT "PK_d6d88092157fa32858b0f4d61ee" PRIMARY KEY ("idLineaCarrito");


--
-- TOC entry 3404 (class 2606 OID 81935)
-- Name: correo_argentino REL_1c76f554fce6825c751ea8ea81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correo_argentino
    ADD CONSTRAINT "REL_1c76f554fce6825c751ea8ea81" UNIQUE ("idPedido");


--
-- TOC entry 3378 (class 2606 OID 24593)
-- Name: carritos REL_301960e42ec46c7dafe13e63e0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos
    ADD CONSTRAINT "REL_301960e42ec46c7dafe13e63e0" UNIQUE ("idUsuario");


--
-- TOC entry 3388 (class 2606 OID 41296)
-- Name: productos UQ_1bb8c0b9724b10288db0109c411; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "UQ_1bb8c0b9724b10288db0109c411" UNIQUE ("codigoProducto");


--
-- TOC entry 3374 (class 2606 OID 24669)
-- Name: usuarios UQ_446adfc18b35418aac32ae0b7b5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE (email);


--
-- TOC entry 3408 (class 2606 OID 98313)
-- Name: categorias UQ_ccdf6cd1a34ea90a7233325063d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT "UQ_ccdf6cd1a34ea90a7233325063d" UNIQUE (nombre);


--
-- TOC entry 3393 (class 1259 OID 65550)
-- Name: IDX_4b67ff5291dcfd336770e69260; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4b67ff5291dcfd336770e69260" ON public.pertenece USING btree ("idCombo");


--
-- TOC entry 3394 (class 1259 OID 65551)
-- Name: IDX_8b11467cef13bf6155d999db09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8b11467cef13bf6155d999db09" ON public.pertenece USING btree ("idProducto");


--
-- TOC entry 3423 (class 2606 OID 49164)
-- Name: resenas FK_00d6782a3568dad984981826d03; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT "FK_00d6782a3568dad984981826d03" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario");


--
-- TOC entry 3413 (class 2606 OID 33067)
-- Name: lineas_carrito FK_1c3880e4fef53b1134d6576e11c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_carrito
    ADD CONSTRAINT "FK_1c3880e4fef53b1134d6576e11c" FOREIGN KEY ("idCarrito") REFERENCES public.carritos("idCarrito");


--
-- TOC entry 3429 (class 2606 OID 81936)
-- Name: correo_argentino FK_1c76f554fce6825c751ea8ea81e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.correo_argentino
    ADD CONSTRAINT "FK_1c76f554fce6825c751ea8ea81e" FOREIGN KEY ("idPedido") REFERENCES public.pedidos("idPedido");


--
-- TOC entry 3410 (class 2606 OID 24604)
-- Name: carritos FK_301960e42ec46c7dafe13e63e00; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos
    ADD CONSTRAINT "FK_301960e42ec46c7dafe13e63e00" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario");


--
-- TOC entry 3428 (class 2606 OID 74170)
-- Name: cupones FK_36fad54c8f02c90508bc6f4c7c4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT "FK_36fad54c8f02c90508bc6f4c7c4" FOREIGN KEY ("idTemaRequerido") REFERENCES public.temas("idTema");


--
-- TOC entry 3416 (class 2606 OID 41315)
-- Name: lineas_pedido FK_40b85fc7433e12772a1dbe3936e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido
    ADD CONSTRAINT "FK_40b85fc7433e12772a1dbe3936e" FOREIGN KEY ("idProducto") REFERENCES public.productos("idProducto");


--
-- TOC entry 3417 (class 2606 OID 33077)
-- Name: lineas_pedido FK_46154db2656a5691ff1ada5ee8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido
    ADD CONSTRAINT "FK_46154db2656a5691ff1ada5ee8f" FOREIGN KEY ("idPedido") REFERENCES public.pedidos("idPedido");


--
-- TOC entry 3426 (class 2606 OID 74153)
-- Name: pertenece FK_4b67ff5291dcfd336770e69260d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pertenece
    ADD CONSTRAINT "FK_4b67ff5291dcfd336770e69260d" FOREIGN KEY ("idCombo") REFERENCES public.combos("idCombo") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3420 (class 2606 OID 65577)
-- Name: favoritos FK_5016a933ba54d581750013649d8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT "FK_5016a933ba54d581750013649d8" FOREIGN KEY ("productoId") REFERENCES public.productos("idProducto");


--
-- TOC entry 3419 (class 2606 OID 41305)
-- Name: productos FK_6c824a2836e7e8119690b5f77d3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "FK_6c824a2836e7e8119690b5f77d3" FOREIGN KEY ("idTema") REFERENCES public.temas("idTema");


--
-- TOC entry 3411 (class 2606 OID 24635)
-- Name: pedidos FK_6cf76dbfa1799e238ff6fddce5c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "FK_6cf76dbfa1799e238ff6fddce5c" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario");


--
-- TOC entry 3409 (class 2606 OID 16436)
-- Name: usuarios FK_85bc73bf260eb4db8833fc48d11; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_85bc73bf260eb4db8833fc48d11" FOREIGN KEY ("idNivel") REFERENCES public.niveles_usuario("idNivel");


--
-- TOC entry 3427 (class 2606 OID 65557)
-- Name: pertenece FK_8b11467cef13bf6155d999db093; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pertenece
    ADD CONSTRAINT "FK_8b11467cef13bf6155d999db093" FOREIGN KEY ("idProducto") REFERENCES public.productos("idProducto") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3421 (class 2606 OID 41343)
-- Name: favoritos FK_8b1cf1079b204d9e85414db4be9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT "FK_8b1cf1079b204d9e85414db4be9" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios("idUsuario");


--
-- TOC entry 3412 (class 2606 OID 90113)
-- Name: pedidos FK_9233916792d404a8467f0f7cdbb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "FK_9233916792d404a8467f0f7cdbb" FOREIGN KEY ("codigoCupon") REFERENCES public.cupones(codigo) ON DELETE SET NULL;


--
-- TOC entry 3424 (class 2606 OID 57351)
-- Name: resenas FK_9d2413dadfa2c756a35d4e8ee81; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT "FK_9d2413dadfa2c756a35d4e8ee81" FOREIGN KEY ("idPedido") REFERENCES public.pedidos("idPedido");


--
-- TOC entry 3418 (class 2606 OID 74143)
-- Name: lineas_pedido FK_b538a3a709c8d03b7db62ac8a10; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_pedido
    ADD CONSTRAINT "FK_b538a3a709c8d03b7db62ac8a10" FOREIGN KEY ("idCombo") REFERENCES public.combos("idCombo");


--
-- TOC entry 3414 (class 2606 OID 41310)
-- Name: lineas_carrito FK_b712d5a064f3f2722856b974dfc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_carrito
    ADD CONSTRAINT "FK_b712d5a064f3f2722856b974dfc" FOREIGN KEY ("idProducto") REFERENCES public.productos("idProducto");


--
-- TOC entry 3415 (class 2606 OID 74138)
-- Name: lineas_carrito FK_c35c44c92a206177e53f56b40f7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lineas_carrito
    ADD CONSTRAINT "FK_c35c44c92a206177e53f56b40f7" FOREIGN KEY ("idCombo") REFERENCES public.combos("idCombo");


--
-- TOC entry 3425 (class 2606 OID 49169)
-- Name: resenas FK_c58359a74b2cdcc9ce7dd5af91c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT "FK_c58359a74b2cdcc9ce7dd5af91c" FOREIGN KEY ("idProducto") REFERENCES public.productos("idProducto");


--
-- TOC entry 3422 (class 2606 OID 74148)
-- Name: favoritos FK_f54055d3579c3237d8c163bb62b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT "FK_f54055d3579c3237d8c163bb62b" FOREIGN KEY ("comboId") REFERENCES public.combos("idCombo");


-- Completed on 2026-06-01 16:40:01

--
-- PostgreSQL database dump complete
--

\unrestrict XasFZ8qgrKC9ufMdeXm5vBhDvHj0O5CElgDoD7CgW3mGsY4ry8EJPjdVv5rjHcy

