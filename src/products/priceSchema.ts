import { z } from 'zod'; // 1. Cambiado a 'zod' en minúscula

const priceSchema = z.object({
    // 2. Agregamos (date: Date) para que TypeScript esté feliz
    dateFrom: z.coerce.date().refine((date: Date) => !isNaN(date.getTime()), {
        message: "dateFrom debe ser una fecha válida"
    }),
    dateUntil: z.coerce.date().refine((date: Date) => !isNaN(date.getTime()), {
        message: "dateUntil debe ser una fecha válida"
    }),
    cost: z.number().positive({ message: "cost debe ser un número positivo" })
})

function validatePrice(object: any) {
    return priceSchema.safeParse(object);
}

export { validatePrice }