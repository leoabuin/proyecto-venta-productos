import { Property, Entity, PrimaryKey, OneToMany, Cascade, Collection, Unique, ManyToOne,Rel} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { User } from "../users/user.entity.js";
import { Product } from "../products/product.entity.js";



@Entity()
export class Comment extends BaseEntity{

    
@Property({nullable: false})
comment?: string

@Property({ defaultRaw: "CURRENT_TIMESTAMP" })
date?: Date

@ManyToOne(()=> User, {nullable:false, onDelete:'CASCADE'} )
user!: Rel<User>

@ManyToOne(()=> Product , {nullable:false, onDelete:'CASCADE'} )
product!: Rel<Product>

}