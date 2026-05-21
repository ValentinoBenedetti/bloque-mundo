const { Client } = require('pg');

async function testPort(port) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'bloquemundo_db',
        password: 'adminpassword',
        port: port
    });

    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM productos');
        console.log(`Port ${port}: connected! Total products:`, res.rows[0].count);
        await client.end();
    } catch (e) {
        console.log(`Port ${port}: failed to connect.`, e.message);
    }
}

async function run() {
    await testPort(5432);
    await testPort(5433);
}

run();
