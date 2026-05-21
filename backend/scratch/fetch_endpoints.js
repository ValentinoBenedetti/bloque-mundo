async function run() {
    try {
        const response = await fetch('http://localhost:3000/productos');
        const productos = await response.json();
        console.log('Returned products from endpoint:', productos.length);

        const combosRes = await fetch('http://localhost:3000/combos');
        const combos = await combosRes.json();
        console.log('Returned combos from endpoint:', combos.length);
    } catch (e) {
        console.error('Error fetching endpoints:', e);
    }
}
run();
