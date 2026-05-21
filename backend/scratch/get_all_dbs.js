const { Client } = require('pg');

async function run() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'adminpassword',
        port: 5433
    });

    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database');
        console.log('Databases on 5433:', res.rows.map(r => r.datname));
        await client.end();
    } catch (e) {
        console.log('Error listing dbs on 5433:', e.message);
    }
}

run();
