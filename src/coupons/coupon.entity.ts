import { Property, Entity } from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";

@Entity()
export class Coupon extends BaseEntity {

  @Property({ nullable: false, unique: true })
  code!: string;

  @Property({ nullable: false })
  discountPercentage!: number;

  @Property({ nullable: false })
  expirationDate!: Date;

}
