import { Property,Entity,PrimaryKey,ManyToOne,Rel, OneToMany,Cascade,Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { User } from "../users/user.entity.js";
import { OrderItem } from "../orderItems/orderItem.entity.js";


@Entity()
export class Order extends BaseEntity {
  
  @PrimaryKey()
  id?: number

  @Property({nullable: false})
  fecha_pedido?: Date

  @Property({nullable: false})
  total?: number

  @Property({nullable: false})  
  estado?: string
  
  @Property({nullable: false})
  metodo_pago?: string

  @ManyToOne(()=> User, {nullable:false} )
  user!: Rel<User>

  @OneToMany(()=> OrderItem, orderItem => orderItem.order, {cascade: [Cascade.ALL]})
  orderItems =  new Collection<OrderItem>(this)
 
}

