import { RequestHandler } from "express";
import { AppDataSource } from "../../config/data-source";
import { Photo } from "./Photo";

const getAlbumsPhotos: RequestHandler = async (req, res) => {
  // now our photo is saved and albums are attached to it
  //option1: now lets load them with FindOptions:
  const loadedPhoto = await AppDataSource.getRepository(Photo).findOne({
    where: {
      id: 1,
    },
    relations: {
      albums: true,
    },
  });

  //option2: load using query builder
  const photo = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo")
    .leftJoinAndSelect("photo.albums", "albums")
    .getMany();

  res.json(photo);

  /*
   {
    id: 1,
    name: "Me and Bears",
    description: "I am near polar bears",
    filename: "photo-with-bears.jpg",
    albums: [{
        id: 1,
        name: "Bears"
    }, {
        id: 2,
        name: "Me"
    }]
}*/

  //You can also use QueryBuilder to build SQL queries of almost any complexity. load with query builder:
  const photos = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo") // first argument is an alias. Alias is what you are selecting - photos. You must specify it.
    .innerJoinAndSelect("photo.metadata", "metadata")
    .leftJoinAndSelect("photo.albums", "album")
    .where("photo.isPublished = true")
    .andWhere("(photo.name = :photoName OR photo.name = :bearName)")
    .orderBy("photo.id", "DESC")
    .skip(5)
    .take(10)
    .setParameters({ photoName: "My", bearName: "Mishka" })
    .getMany();

  //loaded Photo will be equal to:
};
