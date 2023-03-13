import { RequestHandler } from "express";
import { AppDataSource } from "../../config/data-source"
import { Album } from "./Album"
import { Photo } from "./Photo"

//Now let's insert albums and photos to our database:
// create a few albums

const createAlbumsPhotos: RequestHandler = async (req, res) => {
  const album1 = new Album();
  album1.name = "Bears";
  await AppDataSource.manager.save(album1);

  const album2 = new Album();
  album2.name = "Me";
  await AppDataSource.manager.save(album2);

  // create a few photos
  const photo = new Photo();
  photo.name = "Me and Bears";
  photo.description = "I am near polar bears";
  photo.filename = "photo-with-bears.jpg";
  photo.views = 1;
  photo.isPublished = true;
  photo.albums = [album1, album2];
  await AppDataSource.manager.save(photo);

  res.json({message: "created"})
};