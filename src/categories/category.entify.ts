import crypto from 'node:crypto'

export class Category {
  constructor(
    public name: string,
    public description: string,
    public id = crypto.randomUUID()
  ) {}
}