import { Property,Entity,PrimaryKey,ManyToOne } from "@mikro-orm/core";
import { Order } from "../orders/order.entity.js";
import { Product } from "../products/product.entity.js";


@Entity()
export class OrderItem {
  
    @ManyToOne(()=> Order, {primary:true})
    order!:Order

    @ManyToOne(()=> Product, {primary:true})
    product!:Product

    @Property({nullable:false})
    quantity?: number

    @Property({nullable:false})
    item_price?: number

 
}


