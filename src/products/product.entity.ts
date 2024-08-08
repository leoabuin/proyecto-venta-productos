import { orm } from '../shared/orm.js'
import { Entity,PrimaryKey,Property,OneToMany, Cascade, Collection, Rel } from '@mikro-orm/core'
import crypto from 'node:crypto'
import { Price } from './price.entity.js'
import { BaseEntity } from '../shared/baseEntity.entity.js'


@Entity()
export class Product extends BaseEntity {

    @PrimaryKey()
    id?: number

    @Property({nullable:false})
    name!: string

    @Property({nullable:true})
    description!: string

    @Property({nullable:false})
    waist !: number

    @Property({nullable:true})
    calification!: number

    @Property({nullable:false})
    stock!: number

    @Property({nullable:true})
    imagen!: number

    @OneToMany(()=> Price, price => price.product, {cascade: [Cascade.ALL]})
    prices =  new Collection<Price>(this)
  
}