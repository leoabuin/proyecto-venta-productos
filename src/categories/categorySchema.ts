import {z} from 'zod';

const categorySchema = z.object({
    name: z.string({
      message:'La categoria debe ser un string'
    }),
    description: z.string().optional()
})

// Inferir el tipo desde el esquema de categoría
type Category = z.infer<typeof categorySchema>;

// Función de validación con tipo explícito
function validateCategory(input: Category) {
  return categorySchema.safeParse(input);
}

export { validateCategory };