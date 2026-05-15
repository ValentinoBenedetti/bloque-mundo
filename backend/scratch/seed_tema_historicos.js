const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'bloquemundo_db',
    password: 'adminpassword',
    port: 5433
});

client.connect().then(async () => {
    const tema = 'Personajes historicos';
    try {
        await client.query('INSERT INTO temas (nombre) VALUES ($1)', [tema]);
        console.log(`Tema insertado exitosamente: ${tema}`);
    } catch (e) {
        console.error(`Error insertando el tema ${tema}:`, e.message);
    }
    client.end();
});
