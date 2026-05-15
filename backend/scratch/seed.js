const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'bloquemundo_db',
    password: 'adminpassword',
    port: 5433
});

const temas = [
    'Harry Potter', 'Batman', 'Technic', 'City', 'Ninjago', 
    'Creator', 'Architecture', 'Ideas', 'Friends', 'Minecraft', 
    'Speed Champions', 'Classic', 'Super Mario', 'Jurassic World', 
    'Disney', 'Avatar', 'Indiana Jones', 'Lord of the Rings', 
    'Duplo', 'Bionicle'
];

client.connect().then(async () => {
    for (const t of temas) {
        try {
            await client.query('INSERT INTO temas (nombre) VALUES ($1)', [t]);
            console.log(`Tema insertado: ${t}`);
        } catch (e) {
            console.error(`Error insertando ${t}:`, e);
        }
    }
    
    // Y para las categorías, dado que no hay tabla de categorías, vamos a crear
    // una tabla llamada "categorias" por si la quieren utilizar a futuro,
    // o simplemente creamos un archivo explicativo.
    
    client.end();
});
