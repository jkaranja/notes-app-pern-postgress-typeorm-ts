import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  JoinColumn,
  Relation,
} from "typeorm";


@Entity()
//@Index(["firstName", "lastName"])//index multiple columns//add on the entity itself
export class NoteMetadata {
  @PrimaryGeneratedColumn()
  @Index({ unique: true }) //or just @Index()
  id: number;

  @Column()
  noteComments: string;

  //add other columns if necessary
}
