import crypto from 'node:crypto'

export class Client {
  constructor(
    public name: string,
    public surname: string,
    public dni: number,
    public mail: string,
    public phoneNumbre: number,
    public id = crypto.randomUUID()
  ) {}
}