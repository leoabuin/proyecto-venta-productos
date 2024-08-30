import 'reflect-metadata'
import express from 'express'
import { productRouter } from './products/product.routes.js'
import { priceRouter } from './products/price.routes.js'
//import { categoryRouter } from './categories/category.routes.js'
//import { clientRouter } from './clients/client.routes.js'
//import {distributorRouter} from './distributors/distributors.routes.js'
import { orm,syncSchema } from './shared/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express()
app.use(express.json())

//luego de los middleares base 

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

//antes de las rutas y middlewares de nuestro negocio

app.use('/api/products', productRouter)
app.use('/api/products/prices', priceRouter)
app.use('/api/prices',priceRouter)
app.use('/api/brands',brandRouter)
//app.use('/api/clients', clientRouter)
//app.use('/api/categories', categoryRouter)
//app.use('/api/distributors', distributorRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

await syncSchema()  //nunca en produccion

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
