import { Request,Response,NextFunction } from "express";
import { orm } from "../shared/orm.js";
import { Gender } from "./gender.entity.js";


const em = orm.em

async function sanitizeGenderInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        name: req.body.name,
    }
    next()
}

async function findAll(req: Request, res: Response) {
    try {
        const genders = await em.find(Gender, {}, { populate: ['products'] });
        res.status(200).json({ message: 'found all genders', data: genders });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}
async function findOne(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);
        const gender = await em.findOneOrFail(Gender, { id }, { populate: ['products'] });
        res.status(200).json({ message: 'found Gender', data: gender });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

async function add(req: Request, res: Response) {
    const gender = em.create(Gender, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Gender created', data: gender });
}

async function update(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);  
        const gender = await em.findOneOrFail(Gender, { id });
        Object.assign(gender, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'Gender updated', data: gender });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const id = Number.parseInt(req.params.id);  
        const gender = await em.findOneOrFail(Gender, { id });
        await em.removeAndFlush(gender);
        res.status(200).json({ message: 'Gender removed' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }   
}

export { sanitizeGenderInput,remove,add,update,findOne,findAll };