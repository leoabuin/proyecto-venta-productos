import { BaseEntity } from "../shared/baseEntity.entity.js"
import { Product } from "./product.entity.js"
import { Entity, PrimaryKey,Property,ManyToOne,Rel  } from "@mikro-orm/core"


@Entity()
export class Price extends BaseEntity {
    @PrimaryKey()
    id?: number

    @Property({nullable: false})
    dateFrom!: Date

    @Property()
    dateUntil!: Date

    @Property({nullable: true})
    cost!: number

    @ManyToOne(()=> Product, {nullable:false} )
    product!: Rel<Product>
}