import { Entity,Property,OneToMany, Collection, Unique } from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Product } from "../products/product.entity.js";


@Entity()
export class Brand extends BaseEntity{


    @Property({nullable:false})
    @Unique()
    name!: string

    @Property({nullable:true})
    description!: string

    @Property({nullable:true})
    website!: string

    @Property({nullable:true})
    countryOfOrigin!: string

    @Property({ columnType: 'longtext', nullable: true })
    logo?: string

    @OneToMany(()=>Product,product => product.brand)
    products = new Collection <Product>(this)
}