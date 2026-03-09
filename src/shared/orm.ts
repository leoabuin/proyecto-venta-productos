import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

console.log('Intentando conectar a:', process.env.MYSQLHOST); // <-- Agregá esto para debuguear

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    type: 'mysql',
    host: process.env.MYSQLHOST || '127.0.0.1',
    port: Number(process.env.MYSQLPORT) || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'root',
    // IMPORTANTE: Si MYSQLDATABASE está vacío, que NO use ventaProductos, sino railway
    dbName: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway', 
    debug: true,
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