require('dotenv').config({ path: require('path').resolve(__dirname, '../../backend/.env') });
const { Client } = require('pg');

async function fixDates() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query(`UPDATE correo_argentino SET "fechaEntrega" = CURRENT_TIMESTAMP WHERE estado = 'Entregado' AND "fechaEntrega" IS NULL`);
    console.log('Filas actualizadas:', res.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixDates();
