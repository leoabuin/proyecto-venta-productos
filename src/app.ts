import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import { productRouter } from './products/product.routes.js'
import { priceRouter } from './products/price.routes.js'
import { brandRouter } from './brands/brand.routes.js'
import { orderRouter } from './orders/order.routes.js'
import { categoryRouter } from './categories/category.routes.js'
import { userRouter } from './users/user.routes.js'
import { distributorRouter } from './distributors/distributors.routes.js'
import { orm, syncSchema } from './shared/orm.js'
import { RequestContext } from '@mikro-orm/core'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { commentRouter } from './comments/comment.routes.js'
import { genderRouter } from './gender/gender.routes.js'
import { errorHandler } from './shared/errorHandler.middleware.js'

const app = express()

const allowedOrigins = [
  'http://localhost:4200', 
  'https://proyecto-venta-productos-front-end-production.up.railway.app',
  'https://proyecto-venta-productos-front-end-production.up.railway.app/' // Versión con barra
];

app.use(cors({
  origin: (origin, callback) => {
    // Esto permite peticiones sin origin (como herramientas de test) o las de la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS: Origen no permitido'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// 2. COOKIE PARSER ANTES QUE EXPRESS.JSON (Orden crítico para cookies)
app.use(cookieParser())
app.use(express.json())

// 3. CONTEXTO DEL ORM
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// 4. RUTAS DE LA API
app.use('/api/products', productRouter)
app.use('/api/products/prices', priceRouter)
app.use('/api/prices', priceRouter)
app.use('/api/brands', brandRouter)
app.use('/api/users', userRouter)
app.use('/api/orders', orderRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/distributors', distributorRouter)
app.use('/api/comments', commentRouter)
app.use('/api/genders', genderRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

// 6. MANEJO GLOBAL DE ERRORES
app.use(errorHandler)

// SYNC SCHEMA (Solo para la primera vez o cambios de entidad)
await syncSchema() 

// SEED DE PUBLICO (GENDERS)
try {
  const em = orm.em.fork();
  const genders = ['Hombre', 'Mujer', 'Unisex'];
  for (const g of genders) {
    const rows = await em.getConnection().execute('SELECT id FROM gender WHERE name = ?', [g]);
    if (rows.length === 0) {
      await em.getConnection().execute('INSERT INTO gender (name) VALUES (?)', [g]);
      console.log(`✅ Público insertado automáticamente: ${g}`);
    }
  }
} catch (e) {
  console.error('Error seeding genders:', e);
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and accepting connections from 0.0.0.0`);
});