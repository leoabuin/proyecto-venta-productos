import { BaseEntity } from "../shared/baseEntity.entity.js"
import { Product } from "./product.entity.js"
import { Entity, Property,ManyToOne,Rel  } from "@mikro-orm/core"


@Entity()
export class Price extends BaseEntity {

    @Property({nullable: false})
    dateFrom!: Date

    @Property()
    dateUntil!: Date

    @Property({nullable: true})
    cost!: number

    @ManyToOne(()=> Product, {nullable:false, onDelete:'CASCADE'} )
    product!: Rel<Product>
}