import { MigrationInterface, QueryRunner } from "typeorm";

//option1: manually creating migration file and writing query yourself
//-create this migration file and write your query: it will update schema and table in db
// run this to create this .ts starter and edit the query in file:
//npx typeorm migration:create ./src/migrations/NoteRefactoring
//or: npx typeorm-ts-node-esm migration:create ./src/migrations/NoteRefactoring
//add this migration in data-source or ensure the migration folder is added under migration:
//finally, run this migration: will update schema/entity and table in db

//Option2: RECOMMENDED WAY OF USING MIGRATIONS//GENERATE THIS FILE WITH CORRECT QUERY AUTO
//TypeORM is able to automatically generate migration files with schema changes you made.
//--make changes in your entity//if synchronize is not true, no update in db
//THEN ADD THIS MIGRATION TO DATA SOURCE UNDER MIGRATIONS
//then run:
// npx typeorm-ts-node-esm migration:generate path/to/migrations/PostRefactoring -d path/to/datasource.ts
//eg npx typeorm-ts-node-esm migration:generate ./src/migrations/NoteRefactoring -d ./src/config/data-source.ts//only format working
//typeorm migration:generate -n PostRefactoring//not working //it will generate migration for the latest changes you made in any entity
//the file above with have query with the schema changes you made
//THEN ADD THIS MIGRATION TO DATA SOURCE UNDER MIGRATIONS
//finally, run this migration to make updates in the db:
//npx typeorm-ts-node-esm migration:run -d ./src/config/data-source
//ref: https://stackoverflow.com/questions/72682474/typeorm-migrationgenerate-failure-not-enough-non-option-arguments-got-0-need
//https://github.com/typeorm/typeorm/issues/8860
//The rule of thumb for generating migrations is that you generate them after each change you made to your models.

// https://typeorm.io/migrations
export class NoteRefactoring1678434685156 implements MigrationInterface {
  //up mtd contain the code you need to perform the migration
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note" RENAME COLUMN "title" TO "subject"`
    );
  }
  // down method is used to revert the last migration. i.e  down has to revert whatever up changed.
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note" RENAME COLUMN "title" TO "subject"`
    ); // reverts things made in "up" method
  }
}

//running your migration i.e :run & :revert(these two only works with .js files. won't work with 'typeorm' only on .ts files//use ts-node as below)
//OPTION1:Not tested: first, you will need to run tsc ./src/migrations/file.ts to compile file to .js

//then run:
//typeorm migration:run -- -d path-to-datasource-config //This command will execute all pending migrations and run them in a sequence ordered by their timestamps
//reverting your migration
//typeorm migration:revert -- -d path-to-datasource-config//This command will execute down in the latest executed migration. If you need to revert multiple migrations you must call this command multiple times.

//Option22:Recommended: using ts-node to run migration without compiling first

//npx typeorm-ts-node-esm migration:run -d ./src/config/data-source //this will with .ts files//only format working//replace path to data-source
//reverting your migration
//npx typeorm-ts-node-esm migration:revert -d ./src/config/data-source//only one working//replace path to data-source
