import path from "node:path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Note } from "../entities/Note";
import { NoteMetadata } from "../entities/NoteMetadata";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";

import { NoteRefactoring1678707672578 } from "../migrations/1678707672578-NoteRefactoring";

//can also use await createConnection({db options})

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string),
  username: process.env.POSTGRES_USER, //add raw user here if using command for migrations
  password: process.env.POSTGRES_PASS, //add raw pass here if using command for migrations
  database: process.env.POSTGRES_DB, //add raw db here if using command for migrations
  synchronize: process.env.NODE_ENV === "development", //ensure your entities will be synced with the database, every time you run the application.
  //synchronize in production is not recommended. After deployment, changes to db/tables should be made using migrations instead
  //However, we must use synchronize here so our tables can be created with our schema. Migrations are only meant to alter existing tables in prod
  //i.e changing column name instead of changing it directly in our entities and having synchronize update the table, use migrations

  logging: ["query", "error"],
  logger: "file", //write to ormlogs.log in project root
  maxQueryExecutionTime: 5000, //Log long-running queries//more than 5 secs
  entities: [User, Note, NoteMetadata, Profile], //load all in entities folder as // or ["../entities/*.ts"] //not working
  migrations: [NoteRefactoring1678707672578],
  subscribers: [],
  //cache: true, //enable caching//Default cache lifetime is equal to 1000 ms, i.e. 1 second
  cache: {
    duration: 60000, // 1 min//cache queries with .cache(true) || .cache(30000) to 1 min or 30 secs respectively
  },
});

//DON'T EXPORT REPOS FROM ENTITIES: ERROR: metadata for user not found
//INSIDE ENTITIES, IT WON'T WORK AS DATA SOURCE HASN'T BEING INITIALIZED YET WHEN IT IS REFERENCED
//INSIDE ENTITY//CALLING getRepository(User) on undefined won't find 'User' in the data Source
export const userRepository = AppDataSource?.getRepository(User);

export const noteRepository = AppDataSource?.getRepository(Note);
