const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'bloquemundo_db',
  password: 'adminpassword',
  port: 5433,
});

async function main() {
  await client.connect();
  const emails = [
    'bloquemundoo@gmail.com',
    'valentinobenedetti9@gmail.com',
    'juannsaenzz17@gmail.com',
    'juannievas15@gmail.com'
  ];
  
  for (const email of emails) {
    const res = await client.query('UPDATE usuarios SET "esAdmin" = true WHERE email = $1', [email]);
    console.log(`Updated ${email}: ${res.rowCount} rows affected`);
  }
  
  await client.end();
}

main().catch(console.error);
