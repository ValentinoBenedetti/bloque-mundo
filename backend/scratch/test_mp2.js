require('dotenv').config({ path: '../.env' });
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
});

async function run() {
  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }],
        back_urls: {
          success: 'https://httpbin.org/redirect-to?url=http%3A%2F%2Flocalhost%3A5173%2Fperfil%2Fcompras%3Fstatus%3Dsuccess',
          failure: 'https://httpbin.org/redirect-to?url=http%3A%2F%2Flocalhost%3A5173%2Fcarrito%3Fstatus%3Dfailure',
          pending: 'https://httpbin.org/redirect-to?url=http%3A%2F%2Flocalhost%3A5173%2Fcarrito%3Fstatus%3Dpending',
        },
        auto_return: 'approved'
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error('ERROR MP:', error.message);
  }
}

run();
