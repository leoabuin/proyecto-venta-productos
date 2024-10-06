import { orm } from "../shared/orm.js";
import { Entity,Property,PrimaryKey,OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Product } from "../products/product.entity.js";


@Entity()
export class Brand extends BaseEntity{
    @PrimaryKey()
    id?: number

    @Property({nullable:false})
    name!: string

    @Property({nullable:true})
    description!: string

    @Property({nullable:true})
    website!: string

    @Property({nullable:true})
    countryOfOrigin!: string

    @Property()
    logo?: string

    @OneToMany(()=>Product,product => product.brand)
    products = new Collection <Product>(this)
}