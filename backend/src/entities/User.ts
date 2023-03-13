import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { Base } from "./Base";

import {
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min, //number
  Max, //number
  MaxLength,
} from "class-validator";
import { AppDataSource } from "../config/data-source";

//https:www.npmjs.com/package/class-validator
//https://typeorm.io/validation

export type UserRoleType = "admin" | "editor" | "ghost";

//Column types in the database are inferred from the property types you used, e.g. number will be converted into integer, string into varchar, boolean into bool, etc.

//tip: don't use { unique: true } if you already have a primary key = unique
@Entity()
//@Index(["firstName", "lastName"])//index multiple columns//add on the entity itself
export class User extends Base {
  @Column("varchar") //default length of varchar is 80
  username: string;

  @Column("citext") //type will be inferred from property type(eg string as varchar)
  @IsEmail()
  email: string;

  @Column({ type: "varchar", length: 400, select: false })
  @MaxLength(400, {
    message: "Password is too long",
  })
  password: string;

  @Column({ nullable: true }) //type will be inferred from property type(eg string as varchar)
  phoneNumber: string;

  @Column({ nullable: true }) //nullable makes col optional = null//default is false = required
  profileUrl: string;
  //option 1 with enum//don't support UnionType[]
  //   @Column({
  //     type: "enum",
  //     enum: ["admin", "editor", "ghost"],
  //     default: "admin",
  //   })
  //   roles: UserRoleType; //union with string literals;//just one value//

  //option 2 with array: true//can store non-primitive values too
  // @Column("text", { array: true, default: ["admin"]})
  // roles: string[]; //["admin", "editor", "ghost"]
  //option 3 with simple-array//you pass an array, values are stored as comma separated string but will be returned back as array
  //only stores primitive values i.e non object values(not objects, arrays, or function)
  @Column("simple-array", { default: ["admin"] })
  roles: string[]; //["admin", "editor", "ghost"]

  @Column({ nullable: true })
  newEmail: string;

  @Column({ default: false })
  isVerified: boolean;
  //for you to use union for TS, you must specify a supported column type. If no col type is given, postgres infer column
  // types from field types and union or null don't fall under any supported col type
  @Column("text", { nullable: true })
  verifyEmailToken: string | null;
  //with simple json, //use only when you don't need to access it's property in query//not easy
  // @Column("simple-json", { nullable: true }) //stringifies and parses objects for you
  // resetPasswordToken: { token?: string; expiresIn?: number } | null;

  @Column("text", { nullable: true }) //stringifies and parses objects for you
  resetPasswordToken: string | null;
  //numeric or bigint (max =9223372036854775807) numeric= storage size//not limited
  @Column("numeric", { nullable: true }) //stringifies and parses objects for you
  resetPasswordTokenExpiresAt: number | null;
}

//export const userRepository = AppDataSource?.getRepository(User);

//using validate when saving
// const errors = await validate(post);
// if (errors.length > 0) {
//   throw new Error(`Validation failed!`);
// } else {
//   await dataSource.manager.save(post);
// }
