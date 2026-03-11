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
import { authenticateToken } from './users/verifyToken.js'
import { commentRouter } from './comments/comment.routes.js'
import { genderRouter } from './gender/gender.routes.js'

const app = express()

// MODIFICACIÓN CORS: Permitimos localhost para desarrollo y la URL de Railway para producción
const allowedOrigins = ['http://localhost:4200', 'https://proyecto-venta-productos-front-end-production.up.railway.app']
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

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

// IMPORTANTE: En Railway, la base de datos se crea con la URL, pero syncSchema puede ser peligroso.
// Si querés que Railway cree las tablas la primera vez, dejalo, pero recordá quitarlo después.
await syncSchema() 

// MODIFICACIÓN PUERTO: Railway inyecta la variable PORT automáticamente
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and accepting connections from 0.0.0.0`);
});