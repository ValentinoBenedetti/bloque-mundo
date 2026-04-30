const fetch = require('node-fetch');

async function debugCart() {
    const userId = '72142'; // El usuario del problema
    const token = '...'; // Necesitara un token real pero puedo probar sin auth si desactivo el guard temporalmente o uso los datos de la DB
    
    // Mejor consulto directamente la DB para ver cmo estn las relaciones
    console.log("Revisando base de datos...");
}

// En lugar de fetch, usar el comando psql para ver los datos reales
