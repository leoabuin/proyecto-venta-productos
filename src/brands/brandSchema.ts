import { object, z as zod } from 'zod';


// Esquema de la marca (brand)
const brandSchema = zod.object({
  name: zod.string().min(1, { message: "El nombre es obligatorio" }),
  description: zod.string(),
  website: zod.string().url({
    message: 'la website debe ser una url',
  }),
  countryOfOrigin: zod.enum([
    'Argentina', 'Brasil', 'China', 'Uruguay', 'Taiwan', 'EEUU', 'Sudafrica', 'Colombia',
  ]),
  logo: zod.string().url({
    message: 'No es una URL valida'
  })
});


const brandToPatch = zod.object({
  name: zod.string().optional(),
  description: zod.string().optional(),
  website: zod.string().url({
    message: 'la website debe ser una url',
  }).optional(),
  countryOfOrigin: zod.enum([
    'Argentina', 'Brasil', 'China', 'Uruguay', 'Taiwan', 'EEUU', 'Sudafrica', 'Colombia',
  ]).optional(),
  logo: zod.string().url({
    message: 'No es una URL valida'
  }).optional()

})

// Inferir el tipo desde el esquema de Zod
type Brand = zod.infer<typeof brandSchema>;

// Función de validación con el tipo especificado
function validateBrand(input: Brand) {
  return brandSchema.safeParse(input);
}

// para el update
function validateBrandPatch(object: any){
  return brandToPatch.safeParse(object)
}

export { validateBrand, validateBrandPatch};