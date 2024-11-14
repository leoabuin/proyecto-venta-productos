import 'reflect-metadata'
import express from 'express'
import { productRouter } from './products/product.routes.js'
import { priceRouter } from './products/price.routes.js'
import { brandRouter } from './brands/brand.routes.js'
import { orderRouter } from './orders/order.routes.js'
import { categoryRouter } from './categories/category.routes.js'
import { userRouter } from './users/user.routes.js'
import {distributorRouter} from './distributors/distributors.routes.js'
import { orm,syncSchema } from './shared/orm.js'
import { RequestContext } from '@mikro-orm/core'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './users/verifyToken.js'



const app = express()
app.use(cors({
  origin: 'http://localhost:4200', // Especifica el origen del frontend
  credentials: true, // Permitir que se envíen credenciales (cookies, cabeceras de autenticación)
}));
app.use(express.json())
app.use(cookieParser())

/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite todas las orígenes
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Métodos permitidos

  // Permite las solicitudes OPTIONS
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }
  
  next();
});
*/
//luego de los middleares base 

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

//antes de las rutas y middlewares de nuestro negocio

app.use('/api/products', productRouter)
app.use('/api/products/prices', priceRouter)
app.use('/api/prices',priceRouter)
app.use('/api/brands',brandRouter)
app.use('/api/users', userRouter)
app.use('/api/orders',orderRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/distributors', distributorRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})


await syncSchema()  //nunca en produccion

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
