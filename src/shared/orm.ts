import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    // Railway proporciona la URL completa, así que priorizamos process.env.MYSQL_URL
    clientUrl: process.env.MYSQL_URL || 'mysql://root:root@localhost:3306/ventaProductos',
    type: 'mysql',
    // En producción (Railway), debug suele desactivarse para no llenar los logs, pero podés dejarlo en true para el primer deploy
    debug: process.env.NODE_ENV !== 'production', 
    highlighter: new SqlHighlighter(),
    schemaGenerator: {
      disableForeignKeys: true,
      createForeignKeyConstraints: true,
      ignoreSchema: [],
    },
})

export const syncSchema = async () => {
    const generator = orm.getSchemaGenerator()
    // En producción, MikroORM recomienda usar Migraciones, 
    // pero para tu entrega, updateSchema() funcionará bien en Railway para crear las tablas al inicio.
    await generator.updateSchema()
}