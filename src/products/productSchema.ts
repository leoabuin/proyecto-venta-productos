import {z} from 'zod'

const productSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    description: z.string().optional(),
    waist: z.string().min(1, { message: "La talla es obligatoria" }), // Acepta cualquier formato: S, M, 40, 42, etc.
    stock: z.number().int().nonnegative({ message: "El stock debe ser un número entero no negativo" }),
    imagen: z.string().min(1, { message: "La imagen es obligatoria" }),
    isOffer: z.boolean(),
    isContinued: z.boolean().optional().default(true)
})


const productSchemaPatch = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }).optional(), 
    description: z.string().optional(), 
    waist: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { message: "La talla debe ser una de las siguientes: S, M, L, XL, XXL" }).optional(), 
    stock: z.number().int().nonnegative({ message: "El stock debe ser un número entero no negativo" }).optional(), 
    imagen: z.string().url({ message: "Debe ser una URL válida para la imagen" }).optional(),
    isOffer: z.boolean().optional().default(false),
    isContinued: z.boolean().optional().default(true)
})

function validateProduct(object: any){
    return productSchema.safeParse(object)
}
function validateProductPatch(object: any){
    return productSchemaPatch.safeParse(object)
}

export {validateProduct, validateProductPatch}
  