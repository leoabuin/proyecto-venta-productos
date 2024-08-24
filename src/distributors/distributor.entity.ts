import { Product } from "../products/product.entity";
import { BaseEntity } from "../shared/baseEntity.entity";
import { Entity, PrimaryKey, Property, OneToMany, Cascade, Collection } from "@mikro-orm/core";

@Entity()
export class Distributor extends BaseEntity {

    @PrimaryKey()
    id?: number

    @Property({nullable:false})
    cuil!: string

    @Property({nullable:false})
    fistName!: string

    @Property({nullable:false})
    lastName!: string

    @Property({nullable:false})
    mail!: string

    @Property({nullable:true})
    telephone!: number

    @Property({nullable:false})
    adress!: number

    @OneToMany(()=> Product, product => product.distributor, {cascade: [Cascade.ALL]})
    products =  new Collection<Product>(this)


}



