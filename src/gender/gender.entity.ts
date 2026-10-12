import { Property,Entity,OneToMany,ManyToOne,Collection,Unique } from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Product } from "../products/product.entity.js";


@Entity()
export class Gender extends BaseEntity {
    
    @Property({ nullable: false })
    @Unique()
    name?: string;  

    @OneToMany(() => Product, product => product.gender)
    products = new Collection<Product>(this);
}   
