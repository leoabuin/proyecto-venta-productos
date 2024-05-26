import crypto from 'node:crypto'

export class Brand {
  constructor(
    public name: string,
    public description: string,
    public id = crypto.randomUUID()
  ) {}
}