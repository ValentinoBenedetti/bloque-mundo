const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'bloquemundo_db',
    password: 'adminpassword',
    port: 5433
});

const categorias = [
    'Vehículos', 'Edificios', 'Minifiguras', 'Sets de Colección', 'Animales',
    'Espacio', 'Mecanismos', 'Castillos', 'Películas y TV', 'Videojuegos',
    'Superhéroes', 'Trenes', 'Construcción Básica', 'Robótica', 'Botánica'
];

client.connect().then(async () => {
    // Obtener un tema cualquiera para asociar a los productos dummy
    const res = await client.query('SELECT "idTema" FROM temas LIMIT 1');
    if (res.rows.length === 0) {
        console.log("No hay temas en la base de datos para asociar a los productos");
        client.end();
        return;
    }
    const idTema = res.rows[0].idTema;

    for (let i = 0; i < categorias.length; i++) {
        const cat = categorias[i];
        const idProducto = Math.floor(100000 + Math.random() * 900000);
        const codigo = `DUMMY-${i}-${idProducto}`;
        
        try {
            await client.query(`
                INSERT INTO productos 
                ("idProducto", "codigoProducto", "titulo", precio, categoria, estado, "idTema") 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                idProducto, 
                codigo, 
                `Dummy para categoría ${cat}`, 
                0, 
                cat, 
                'NoPublicado', 
                idTema
            ]);
            console.log(`Categoría agregada vía producto dummy: ${cat}`);
        } catch (e) {
            console.error(`Error insertando categoría ${cat}:`, e.message);
        }
    }
    
    console.log("15 Categorías insertadas!");
    client.end();
});
