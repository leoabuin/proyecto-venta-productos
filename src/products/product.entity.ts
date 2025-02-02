import { orm } from '../shared/orm.js'
import { Entity,PrimaryKey,Property,OneToMany, Cascade, Collection, Rel, ManyToOne } from '@mikro-orm/core'
import crypto from 'node:crypto'
import { Price } from './price.entity.js'
import { BaseEntity } from '../shared/baseEntity.entity.js'
import { Brand } from '../brands/brand.entity.js'
import { Category } from '../categories/category.entity.js'
import { Distributor } from '../distributors/distributor.entity.js'
import { Comment } from '../comments/comment.entity.js'


@Entity()
export class Product extends BaseEntity {

    @PrimaryKey()
    id?: number

    @Property({nullable:false})
    name!: string

    @Property({nullable:true})
    description!: string

    @Property({nullable:true})
    waist?: string

    @Property({nullable:false})
    stock!: number

    @Property({nullable:true})
    imagen!: string

    @OneToMany(()=> Price, price => price.product, {cascade: [Cascade.ALL]})
    prices =  new Collection<Price>(this)

    @ManyToOne(()=> Brand, {nullable:false})
    brand!:Brand

    @ManyToOne(()=> Category, {nullable:false})
    category!:Category

    @ManyToOne(()=> Distributor, {nullable:false})
    distributor!:Distributor

    @OneToMany(()=> Comment, comment => comment.product, {cascade: [Cascade.ALL]})
    comments = new Collection<Comment>(this)
  
}