import {object, z} from 'zod';

const distributorSchema = z.object({
    CUIL: z.number()
    .int({ message: 'El CUIL debe ser un número entero' })
    .positive({ message: 'El CUIL debe ser un número positivo' })
    .refine((val) => val.toString().length === 10, {
      message: 'El CUIL debe tener exactamente 11 dígitos',
    }),
    name: z.string()
     .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
     .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo debe contener letras',
    }),
    surname: z.string()
     .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
     .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo debe contener letras',
  }),
    email: z.string().email({
      message: 'Debe proporcionar un correo electrónico válido',
    }),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'El número de teléfono debe ser válido',
    }),
    address: z.string().min(5, {
      message: 'La dirección debe tener al menos 5 caracteres',
    }),
  });

// Inferir el tipo desde el esquema de categoría
type Distributor = z.infer<typeof distributorSchema>;




const distributorToPatch = z.object({
  name: z.string()
     .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
     .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo debe contener letras',
    }).optional(),
    surname: z.string()
     .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
     .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo debe contener letras',
  }).optional(),
    email: z.string().email({
      message: 'Debe proporcionar un correo electrónico válido',
    }).optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'El número de teléfono debe ser válido',
    }).optional(),
    address: z.string().min(5, {
      message: 'La dirección debe tener al menos 5 caracteres',
    }).optional(),
});


// para el update
function validateDistributorPatch(object: any){
  return distributorToPatch.safeParse(object)
}



// Función de validación con tipo explícito
function validateDistributor(input: Distributor) {
  return distributorSchema.safeParse(input);
}



export { validateDistributor, validateDistributorPatch };