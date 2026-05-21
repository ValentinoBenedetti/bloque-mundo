const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'bloquemundo_db',
    password: 'adminpassword',
    port: 5433
});

client.connect().then(async () => {
    try {
        // Get a valid theme ID
        const res = await client.query('SELECT "idTema" FROM temas LIMIT 1');
        if (res.rows.length === 0) {
            console.log("No themes available!");
            client.end();
            return;
        }
        const idTema = res.rows[0].idTema;

        // Insert 50 dummy products
        for (let i = 1; i <= 50; i++) {
            const idProducto = Math.floor(200000 + Math.random() * 800000);
            const codigo = `TEST-PROD-${i}-${idProducto}`;
            await client.query(`
                INSERT INTO productos 
                ("idProducto", "codigoProducto", "titulo", precio, categoria, estado, "idTema", stock) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                idProducto, 
                codigo, 
                `Lego Dummy Test ${i}`, 
                1500, 
                'Vehículos', 
                'Publicado', 
                idTema,
                10
            ]);
        }
        console.log("50 dummy products inserted successfully!");
    } catch (e) {
        console.error('Error inserting dummy products:', e);
    }
    client.end();
});
