import {z} from 'zod';

const userSchema = z.object({
    dni: z.number().int().gte(10000000).lte(99999999),
    name: z.string(),
    surname: z.string(),
    mail: z.string().email({
        message: 'Debe proporcionar un correo electrónico válido',
      }),
    phoneNumber: z.string().regex(/^\d{10}$/, {
        message: 'El número de teléfono debe ser un número válido',
      }),

    adress: z.string(),
    userName: z.string()
    .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    .max(20, { message: 'El nombre de usuario no puede tener más de 20 caracteres' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
    }),
    password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(20, { message: 'La contraseña no puede tener más de 20 caracteres' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })

})

// Inferir el tipo desde el esquema de categoría
type Client = z.infer<typeof userSchema>;

// Función de validación con tipo explícito
function validateUser(input: Client) {
  return userSchema.safeParse(input);
}

export { validateUser };