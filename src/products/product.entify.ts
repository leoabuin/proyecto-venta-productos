import crypto from 'node:crypto'

export class Product {
  constructor(
    public name: string,
    public description: string,
    public waist : number,
    public calification: number,
    public stock: number,
    public imagen: number,
    public id = crypto.randomUUID()
  ) {}
}