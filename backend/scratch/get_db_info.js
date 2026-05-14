const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
});

async function run() {
  await dataSource.initialize();
  
  const products = await dataSource.query(`SELECT "idProducto" FROM productos LIMIT 1;`);
  console.log('Products:', products);

  await dataSource.destroy();
}
run();
