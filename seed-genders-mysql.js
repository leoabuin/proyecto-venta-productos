import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '***', // Replace with real pass
    database: 'railway', // As per console logs
  });

  const genders = ['Hombre', 'Mujer', 'Unisex'];
  for (const g of genders) {
    const [rows] = await connection.execute('SELECT * FROM gender WHERE name = ?', [g]);
    if (rows.length === 0) {
      await connection.execute('INSERT INTO gender (name) VALUES (?)', [g]);
      console.log(`Público cargado: ${g}`);
    } else {
      console.log(`Público ${g} ya existía.`);
    }
  }

  await connection.end();
}

seed().catch(console.error);
