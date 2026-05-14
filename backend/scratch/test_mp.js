require('dotenv').config({ path: '../.env' });
const { MercadoPagoConfig, Preference } = require('mercadopago');

console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN);

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
});

async function run() {
  const preference = new Preference(client);
  try {
    const res = await preference.create({
      body: {
        items: [{
          id: 'PROD-38475',
          title: 'Auto Deportivo GT',
          quantity: 1,
          unit_price: 32000,
          currency_id: 'ARS',
        }],
        back_urls: {
          success: 'http://127.0.0.1:5173/perfil/compras?status=success',
          failure: 'http://127.0.0.1:5173/carrito?status=failure',
          pending: 'http://127.0.0.1:5173/carrito?status=pending',
        },
        external_reference: '50259', 
      }
    });
    console.log(res);
  } catch (error) {
    console.error('ERROR MP:', error.message, error.cause);
  }
}

run();
