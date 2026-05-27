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
        const sample = await client.query('SELECT "idProducto", titulo, stock, "esNovedad", "esDestacado", estado FROM productos ORDER BY "idProducto" ASC');
        console.log('Products database list:');
        sample.rows.forEach(r => {
            console.log(`- ID: ${r.idProducto}, Title: ${r.titulo}, Stock: ${r.stock}, Novedad: ${r.esNovedad}, Destacado: ${r.esDestacado}, Estado: ${r.estado}`);
        });
    } catch (e) {
        console.error('Error running query:', e);
    }
    client.end();
});
