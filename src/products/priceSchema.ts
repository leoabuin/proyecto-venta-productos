import {object, z} from 'Zod';

const priceSchema = z.object({
    dateFrom: z.coerce.date().refine(date => !isNaN(date.getTime()), {
        message: "dateFrom debe ser una fecha válida"
    }),
    dateUntil: z.coerce.date().refine(date => !isNaN(date.getTime()), {
        message: "dateUntil debe ser una fecha válida"
    }),
    cost: z.number().positive({ message: "cost debe ser un número positivo" }) // cost debe ser un número positivo
})


function validatePrice(object:any) {
    return priceSchema.safeParse(object);
}


export {validatePrice}