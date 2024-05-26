import express from 'express'
import { productRouter } from './products/product.routes.js'

const app = express()
app.use(express.json())

app.use('/api/products', productRouter)
app.use('/api/clients', clientRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/brands', brandRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
