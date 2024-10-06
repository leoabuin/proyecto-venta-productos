import {z} from 'Zod'


const orderItemSchema = z.object({

    // product: productSchema;
    quantity: z.number(
        {message: 'La cantidad debe ser un numero'}
    ).int({
        message: 'La cantidad debe ser un numero entero'
    }).positive({
        message: 'La cantidad debe ser un numero positivo'
    })
})