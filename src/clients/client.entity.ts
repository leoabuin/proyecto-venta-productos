import crypto from 'node:crypto'
import { Property,Entity, PrimaryKey,OneToMany,Cascade,Collection,Unique } from '@mikro-orm/core'
import { BaseEntity } from '../shared/baseEntity.entity.js'
import { Order } from '../orders/order.entity.js'


@Entity()
export class Client extends BaseEntity {
  
  @PrimaryKey()
  id?: number

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
  phoneNumber?: number

  @Property({nullable: false})
  @Unique()
  userName?: String

  @Property({nullable: false})
  @Unique()
  password?: String

  @OneToMany(()=> Order, order => order.client, {cascade: [Cascade.ALL]})
  orders =  new Collection<Order>(this)
  
}