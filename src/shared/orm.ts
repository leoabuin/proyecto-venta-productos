import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

console.log('Intentando conectar a:', process.env.MYSQLHOST); // <-- Agregá esto para debuguear

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    type: 'mysql',
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT) || 3306,
    user: process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || 'root',
    dbName: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'ventaProductos', 
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