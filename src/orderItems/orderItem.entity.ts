import { Property,Entity,PrimaryKey,ManyToOne,Rel } from "@mikro-orm/core";
import { Order } from "../orders/order.entity.js";
import { Product } from "../products/product.entity.js";


@Entity()
export class OrderItem {
  
    @ManyToOne(()=> Order,{nullable:false,primary:true })
    order!:Rel<Order>

    @ManyToOne(()=> Product, {nullable:false,primary:true})
    product!:Rel<Product>

    @Property({nullable:false})
    quantity!: number

    @Property({nullable:false})
    item_price?: number

 
}


