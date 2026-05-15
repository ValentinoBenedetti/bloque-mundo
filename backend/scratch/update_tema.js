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
        await client.query('UPDATE temas SET nombre = $1 WHERE nombre = $2', ['Personajes Historicos', 'personajes historicos']);
        console.log('Tema actualizado a Personajes Historicos');
    } catch (e) {
        console.error('Error actualizando:', e.message);
    }
    client.end();
});
