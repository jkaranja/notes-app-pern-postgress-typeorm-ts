import { MaxLength } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  JoinColumn,
  OneToOne,
  Relation,
  ManyToOne,
} from "typeorm";
import { AppDataSource } from "../config/data-source";
import { INoteFile } from "../types/note";
import { Base } from "./Base";
import { NoteMetadata } from "./NoteMetadata";
import { User } from "./User";

@Entity()
//@Index(["firstName", "lastName"])//index multiple columns//add on the entity itself
//entity must have at least one primary col(either PrimaryGeneratedColumn, PrimaryColumn)
//you can extend BaseEntity to access db within model i.e active record eg Note.findBy()
export class Note extends Base {
  @PrimaryGeneratedColumn() //auto-increment int value
  @Index({ unique: true }) //or just @Index()
  noteId: number;
  //   or if string
  //   @Column()
  //   @Generated("uuid")//or "increment" for inc numbers
  //   uuid: string
  //case-insensitive character string//match string regardless of case when querying//like text//length of up to 1gb
  //can also use: .select('DISTINCT ON (LOWER(names.name)) names.name') with query builder when querying//better
  @Column("citext")
  @MaxLength(1, {
    message: "title is too long",
  })
  title: string;

  @Column("text")
  content: string;

  @Column()
  deadline: string;
  //if this fails/ use json//stringify and parse the files array
  @Column("jsonb", { nullable: true })
  files: INoteFile[]; //[{...file},]

  @Column() //makes field optional = null//default is false = required
  userId: string;

  //one2one: unidirectional//store user//from req.user
  //won't work: "duplicate key value violates unique constraint \
  //since you're adding the same user object multiple times//just rely on userId above to fetch user
  //eager will load user auto without using relations//don't work with query builder(disabled) user joins
  // @OneToOne(() => User, {
  //   eager: true,
  // }) //or type => User
  // @JoinColumn() //must be set on only one side of the relation//this side will own the relationship
  // userInfo: User; //contain an uuid relation id//foreign key//will be userInfo_id

  //optional//store any additional note info
  //eager will load user auto without using relations//don't work with query builder(disabled) user joins
  @OneToOne(() => NoteMetadata, {
    eager: true,
  }) //
  @JoinColumn()
  noteMeta: NoteMetadata; //has int(11) id// noteMetaId
}
