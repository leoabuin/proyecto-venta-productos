import { orm } from './dist/src/shared/orm.js';

async function seed() {
  try {
    const em = orm.em.fork();
    
    // Insert using raw SQL to bypass circular dependency during entity reflection
    const gendersToInsert = ['Hombre', 'Mujer', 'Unisex'];
    for (const g of gendersToInsert) {
      const rows = await em.getConnection().execute('SELECT * FROM gender WHERE name = ?', [g]);
      if (rows.length === 0) {
        await em.getConnection().execute('INSERT INTO gender (name) VALUES (?)', [g]);
        console.log(`Público cargado: ${g}`);
      } else {
        console.log(`Público ${g} ya existía.`);
      }
    }
  } catch (error) {
    console.error('Error seeding genders:', error);
  } finally {
    process.exit(0);
  }
}

seed();
