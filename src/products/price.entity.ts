import { BaseEntity } from "../shared/baseEntity.entity.js"
import { Product } from "./product.entity.js"
import { Entity, PrimaryKey,Property,ManyToOne,Rel  } from "@mikro-orm/core"


@Entity()
export class Price extends BaseEntity {
    @PrimaryKey()
    id?: number

    @Property({nullable: false})
    dateFrom!: String

    @Property()
    deteUntil!: String

    @Property({nullable: false})
    cost!: number

    @ManyToOne(()=> Product, {nullable:true} )
    product!: Product
}