import { object, z as zod } from 'zod';


// Esquema de la marca (brand)
const brandSchema = zod.object({
  name: zod.string(),
  description: zod.string(),
  website: zod.string().url({
    message: 'la website debe ser una url',
  }),
  countryOfOrigin: zod.enum([
    'Argentina', 'Brasil', 'China', 'Uruguay', 'Taiwan', 'EEUU', 'Sudafrica', 'Colombia',
  ])
});


const brandToPatch = zod.object({
  name: zod.string().optional(),
  description: zod.string().optional(),
  website: zod.string().url({
    message: 'la website debe ser una url',
  }).optional(),
  countryOfOrigin: zod.enum([
    'Argentina', 'Brasil', 'China', 'Uruguay', 'Taiwan', 'EEUU', 'Sudafrica', 'Colombia',
  ]).optional()

})

// Inferir el tipo desde el esquema de Zod
type Brand = zod.infer<typeof brandSchema>;

// Función de validación con el tipo especificado
function validateBrand(input: Brand) {
  return brandSchema.safeParse(input);
}

// para el update
function validateBrandPatch(object: any){
  return brandToPatch.parse(object)
}

export { validateBrand, validateBrandPatch};