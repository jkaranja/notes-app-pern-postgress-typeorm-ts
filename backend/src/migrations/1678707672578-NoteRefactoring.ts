import { MigrationInterface, QueryRunner } from "typeorm";

export class NoteRefactoring1678707672578 implements MigrationInterface {
    name = 'NoteRefactoring1678707672578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "phonex"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" ADD "phonex" character varying`);
    }

}
