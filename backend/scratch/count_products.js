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
        const prodRes = await client.query('SELECT COUNT(*) FROM productos');
        console.log('Total products:', prodRes.rows[0].count);
        const comboRes = await client.query('SELECT COUNT(*) FROM combos');
        console.log('Total combos:', comboRes.rows[0].count);

        const sample = await client.query('SELECT "idProducto", titulo, estado FROM productos LIMIT 50');
        console.log('Products list:');
        sample.rows.forEach(r => {
            console.log(`- ID: ${r.idProducto}, Title: ${r.titulo}, Estado: ${r.estado}`);
        });
    } catch (e) {
        console.error('Error running count:', e);
    }
    client.end();
});
