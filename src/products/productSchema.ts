import {z} from 'zod'

const productSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }), // Validar que sea string y no esté vacío
    description: z.string().optional(), // Es opcional, pero si está presente, debe ser un string
    waist: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { message: "La talla debe ser una de las siguientes: S, M, L, XL, XXL" }), // Validar valores permitidos para la talla
    stock: z.number().int().nonnegative({ message: "El stock debe ser un número entero no negativo" }), // Validar que sea un entero no negativo
    imagen: z.string().url({ message: "Debe ser una URL válida para la imagen" }) // Validar que sea una URL
})


const productSchemaPatch = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }).optional(), 
    description: z.string().optional(), 
    waist: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { message: "La talla debe ser una de las siguientes: S, M, L, XL, XXL" }).optional(), 
    stock: z.number().int().nonnegative({ message: "El stock debe ser un número entero no negativo" }).optional(), 
    imagen: z.string().url({ message: "Debe ser una URL válida para la imagen" }).optional()
})

function validateProduct(object: any){
    return productSchema.safeParse(object)
}
function validateProductPatch(object: any){
    return productSchemaPatch.safeParse(object)
}

export {validateProduct, validateProductPatch}
  