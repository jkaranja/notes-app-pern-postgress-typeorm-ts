//Now let's add the inverse side of our relation to the Photo class:

import { Column, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Album } from "./Album";

export class Photo {
  @PrimaryGeneratedColumn() 
  @Index() 
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  filename: string;

  @Column()
  views: number;

  @Column()
  isPublished: boolean;

  @ManyToMany(() => Album, (album) => album.photos)
  albums: Album[];
}