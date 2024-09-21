import { Entity,Property,OneToMany,Unique,Collection,Rel} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Product } from "../products/product.entity.js";



@Entity()
export class Distributor extends BaseEntity{

    @Property()
    @Unique()
    CUIL!: Number

    @Property()
    name!: String

    @Property()
    surname!: String

    @Property()
    @Unique()
    email!: String

    @Property()
    phoneNumber!: String

    @Property()
    address!: String

    @OneToMany(()=>Product,product => product.distributor)
    products = new Collection <Product>(this)
}


//NOTA: QUE PONER COMO CLAVE PRIMARIA? CUIL O ID?