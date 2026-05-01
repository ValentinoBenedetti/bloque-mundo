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
  
  // 1. Desvincular usuarios temporalmente
  await dataSource.query('UPDATE usuarios SET "idNivel" = NULL');
  
  // 2. Limpiar niveles actuales
  await dataSource.query('DELETE FROM niveles_usuario');
  
  // 3. Crear los 5 niveles
  const niveles = [
    { nombre: 'Aprendiz', beneficio: 'Sin beneficios extra', montoMinimo: 0, porcentajeDescuento: 0 },
    { nombre: 'Constructor', beneficio: '3% de descuento', montoMinimo: 30000, porcentajeDescuento: 3 },
    { nombre: 'Arquitecto', beneficio: '5% de descuento', montoMinimo: 80000, porcentajeDescuento: 5 },
    { nombre: 'Experto', beneficio: '8% de descuento + Regalo sorpresa', montoMinimo: 150000, porcentajeDescuento: 8 },
    { nombre: 'Maestro', beneficio: '12% de descuento + Envío gratis', montoMinimo: 300000, porcentajeDescuento: 12 },
  ];

  for (const nivel of niveles) {
    await dataSource.query(
      'INSERT INTO niveles_usuario ("nombre", "beneficio", "montoMinimo", "porcentajeDescuento") VALUES ($1, $2, $3, $4)',
      [nivel.nombre, nivel.beneficio, nivel.montoMinimo, nivel.porcentajeDescuento]
    );
  }

  // 4. Re-vincular a todos al nivel 1 (idNivel 1 es el primero insertado)
  // Nota: Al ser SERIAL, el primer insertado deberia ser 1 o el siguiente disponible. 
  // Mejor buscamos el id del nivel 'Aprendiz'
  const result = await dataSource.query("SELECT \"idNivel\" FROM niveles_usuario WHERE nombre = 'Aprendiz' LIMIT 1");
  const defaultNivelId = result[0].idNivel;
  
  await dataSource.query('UPDATE usuarios SET "idNivel" = $1', [defaultNivelId]);

  console.log('5 Niveles de usuario creados y usuarios vinculados al nivel Aprendiz.');
  await dataSource.destroy();
}
run().catch(err => console.error(err));
