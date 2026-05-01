const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'adminpassword',
  database: 'bloquemundo_db',
});

async function run() {
  await dataSource.initialize();
  
  const productos = await dataSource.query('SELECT "idProducto", "precio" FROM productos LIMIT 2');
  console.log('Productos:', productos);
  
  const usuario = await dataSource.query('SELECT "idUsuario" FROM usuarios WHERE "idUsuario" = \'45445\'');
  console.log('Usuario:', usuario);

  await dataSource.destroy();
}
run();
