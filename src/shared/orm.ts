import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    // Intentamos URL completa, si no, intentamos componentes individuales
    clientUrl: process.env.MYSQL_URL, 
    driverOptions: process.env.MYSQL_URL ? { 
        connection: { ssl: { rejectUnauthorized: false } } 
    } : {},
    // Si no hay MYSQL_URL, cae en los parámetros manuales o el localhost
    host: process.env.MYSQLHOST || 'localhost',
    port: Number(process.env.MYSQLPORT) || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'root',
    dbName: process.env.MYSQLDATABASE || 'ventaProductos',
    type: 'mysql',
    debug: true, // Dejalo en true un ratito para ver qué pasa en Railway
    highlighter: new SqlHighlighter(),
    schemaGenerator: {
      disableForeignKeys: true,
      createForeignKeyConstraints: true,
    },
})

export const syncSchema = async () => {
    const generator = orm.getSchemaGenerator()
    // En producción, MikroORM recomienda usar Migraciones, 
    // pero para tu entrega, updateSchema() funcionará bien en Railway para crear las tablas al inicio.
    await generator.updateSchema()
}