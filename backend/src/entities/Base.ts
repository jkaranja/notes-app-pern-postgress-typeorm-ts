import {
  BaseEntity,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

//this is a class (call it it Base or Common or any name) that contain common cols in our entities
//can be multiple as needed//helps reduce duplication
//use abstract or add the @Entity() decorator
//note: a class can only extend/inherit only one class
//so extend BaseEntity here if using active record and it will be inherited by all classes extending common
export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") //a string id//inserted auto //with @PrimaryColumn() you will add id manually on save
  @Index() //don't use @Index({ unique: true }) here//just @Index()//indexing//help retrieve records first
  _id: string;

  @CreateDateColumn() //set auto on save/create
  createdAt: Date;

  @UpdateDateColumn() //set auto on save+update
  updatedAt: Date;
}
