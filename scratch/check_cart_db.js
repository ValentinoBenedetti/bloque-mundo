const { Client } = require('pg');

async function checkCart() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'bloquemundo_db',
        password: 'admin', // Probablemente sea 'admin' o similar
        port: 5433,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT lc.*, p.titulo, p.precio 
            FROM lineas_carrito lc 
            JOIN carritos c ON lc."idCarrito" = c."idCarrito" 
            JOIN productos p ON lc."idProducto" = p."idProducto" 
            WHERE c."idUsuario" = '72142';
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkCart();
