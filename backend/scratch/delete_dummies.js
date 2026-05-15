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
        const res = await client.query("DELETE FROM productos WHERE \"codigoProducto\" LIKE 'DUMMY-%'");
        console.log('Productos dummy eliminados:', res.rowCount);
    } catch(e) {
        console.error('Error:', e.message);
    }
    client.end();
});
