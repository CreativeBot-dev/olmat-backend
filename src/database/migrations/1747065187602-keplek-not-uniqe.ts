import { MigrationInterface, QueryRunner } from 'typeorm';

export class KeplekNotUniqe1747065187602 implements MigrationInterface {
  name = 'KeplekNotUniqe1747065187602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_2e32f17810cbc5e21972ebd7b8\` ON \`participants\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_2e32f17810cbc5e21972ebd7b8\` ON \`participants\` (\`keplek_id\`)`,
    );
  }
}
