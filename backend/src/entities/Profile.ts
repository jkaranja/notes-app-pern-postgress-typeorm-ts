import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gender: string;

  @Column()
  photo: string;

  //one2one unidirectional
  //relation decorator not needed on this side on non-owner

  //one2one bidirectional//non owning side//inverse side//when I query profile, i can have it show the user object as well
  @OneToOne(() => User, (user) => user.profile) // specify inverse side as a second parameter
  user: User;

  ///Many-to-one / one-to-many relations//where A contains multiple instances of B, but B contains only one instance of A
  //User can have multiple profile records, but each profile is owned by only one single user.
  //In many-to-one / one-to-many relation, the owner side is always many-to-one.
  //adding @JoinColumn in this relation is not needed//don't add
  //this side will store the id  oif user object
  //this can exist without one2one inverse side//remove the second callback below
  @ManyToOne(() => User, (user) => user.profiles)
  currentUser: User; //this will be currentUserId//used currentUser to avoid duplicate with example one2one relation
}
