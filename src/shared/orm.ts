import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

console.log('Intentando conectar a:', process.env.MYSQLHOST); // <-- Agregá esto para debuguear

export const orm = await MikroORM.init({
    entities: [
        'dist/src/brands/brand.entity.js',
        'dist/src/categories/category.entity.js',
        'dist/src/comments/comment.entity.js',
        'dist/src/distributors/distributor.entity.js',
        'dist/src/gender/gender.entity.js',
        'dist/src/orders/order.entity.js',
        'dist/src/orderItems/orderItem.entity.js',
        'dist/src/products/product.entity.js',
        'dist/src/products/price.entity.js',
        'dist/src/shared/baseEntity.entity.js',
        'dist/src/users/user.entity.js',
    ],
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