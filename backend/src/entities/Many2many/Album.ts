//Let's say a photo can be in many albums, and each album can contain many photos. Let's create an Album class:

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Photo, (photo) => photo.albums)
    @JoinTable()//is required to specify that this is the owner side of the relationship.
    photos: Photo[]
}

//add/register these two entities to data source

//After you run the application, the ORM will create a album_photos_photo_albums junction table:
/** 
+-------------+--------------+----------------------------+
|                album_photos_photo_albums                |
+-------------+--------------+----------------------------+
| album_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
| photo_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
*/