import crypto from 'node:crypto'
import { Property,Entity, PrimaryKey,OneToMany,Cascade,Collection,Unique } from '@mikro-orm/core'
import { BaseEntity } from '../shared/baseEntity.entity.js'
import { Order } from '../orders/order.entity.js'


@Entity()
export class User extends BaseEntity {

  @Property({nullable: false})
  dni?: number

  @Property({nullable: false})
  name?: string

  @Property({nullable: false})  
  surname?: string
  
  @Property({nullable: false})
  @Unique()
  mail?: string

  @Property({nullable: false})
  phoneNumber?: string

  @Property({nullable: false})
  adress?: string

  @Property({nullable: false})
  rol?: string

  @Property({nullable: false})
  @Unique()
  userName?: string

  @Property({nullable: false})
  @Unique()
  password?: string

  @OneToMany(()=> Order, order => order.user, {cascade: [Cascade.ALL]})
  orders =  new Collection<Order>(this)
  
}