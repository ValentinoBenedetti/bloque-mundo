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
        const res = await client.query("DELETE FROM productos WHERE \"codigoProducto\" LIKE 'TEST-PROD-%'");
        console.log(`Deleted ${res.rowCount} dummy products!`);
    } catch (e) {
        console.error('Error deleting dummy products:', e);
    }
    client.end();
});
