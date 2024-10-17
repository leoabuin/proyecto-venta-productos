import crypto from 'node:crypto'
import { Property,Entity,PrimaryKey,OneToMany, Collection, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../shared/baseEntity.entity.js'
import { Product } from '../products/product.entity.js'


@Entity()
export class Category extends BaseEntity{

  @PrimaryKey()
  id?: number 

  @Property({nullable:false})
  @Unique()
  name?: string

  @Property({nullable:true})
  description?: string

  @OneToMany(()=>Product,product=>product.category)
  products = new Collection<Product>(this)

}