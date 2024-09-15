import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1726373328025 implements MigrationInterface {
  name = 'Migrations1726373328025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`provincies\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_b9b5e6eb174ca5a8d9e5ed04d0\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`subdistricts\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`city_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_6b8edc4fb44648164d0d1635c5\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cities\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`province_id\` varchar(255) NOT NULL, \`region_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_4762ffb6e5d198cfec5606bc11\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`regions\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`region_code\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_4fcd12ed6a046276e2deb08801\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`type\` varchar(255) NOT NULL, \`hash\` varchar(255) NULL, \`school_id\` int NULL, \`region_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), UNIQUE INDEX \`IDX_f1a9842e79756a9f25ba8dbe46\` (\`hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payment_gateways\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`provider\` varchar(255) NOT NULL, \`group\` varchar(255) NOT NULL, \`logo\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`fee_flat\` int UNSIGNED NOT NULL, \`fee_percentage\` int UNSIGNED NOT NULL, \`min_amount\` int UNSIGNED NOT NULL, \`max_amount\` int UNSIGNED NOT NULL, \`is_active\` tinyint UNSIGNED NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_7df2b87fd46ab82914464b9587\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`invoice\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`action\` json NULL, \`callback\` json NULL, \`participant_amounts\` int UNSIGNED NOT NULL, \`fee\` int UNSIGNED NOT NULL, \`amount\` int UNSIGNED NOT NULL, \`total_amount\` int UNSIGNED NOT NULL, \`expired_at\` datetime NOT NULL, \`status\` enum ('pending', 'paid', 'expired', 'refund') NOT NULL DEFAULT 'pending', \`user_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_a288a55870307f7ee073dc831c\` (\`invoice\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`participants\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`gender\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`birth\` varchar(255) NOT NULL, \`img\` varchar(255) NOT NULL, \`attachment\` varchar(255) NOT NULL, \`status\` enum ('active', 'pending', 'cancel') NOT NULL DEFAULT 'pending', \`payment_id\` int NOT NULL, \`school_id\` int NOT NULL, \`user_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_1cda06c31eec1c95b3365a0283\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`degree\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`register_price\` int UNSIGNED NOT NULL, UNIQUE INDEX \`IDX_98a6bfd72670bddb790a13cbca\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`schools\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`whatsapp\` varchar(255) NULL, \`status\` enum ('emas', 'putih', 'hitam') NOT NULL DEFAULT 'hitam', \`is_accept\` tinyint NOT NULL DEFAULT 0, \`province_id\` varchar(255) NOT NULL, \`degree_id\` varchar(255) NOT NULL, \`city_id\` varchar(255) NOT NULL, \`subdistrict_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`setting\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`value\` longtext NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_1c4c95d773004250c157a744d6\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`event_settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`shortname\` varchar(255) NOT NULL, \`copyright\` varchar(255) NOT NULL, \`tagline\` varchar(255) NOT NULL, \`start\` timestamp(6) NOT NULL, \`end\` timestamp(6) NOT NULL, \`amount\` int UNSIGNED NOT NULL, \`free\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`admin_role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`permissions\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`admins\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role_id\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NULL DEFAULT 'System', \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` timestamp NULL, UNIQUE INDEX \`IDX_051db7d37d478a69a7432df147\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subdistricts\` ADD CONSTRAINT \`FK_bd1910ffb32bd4e8cac5a34b625\` FOREIGN KEY (\`city_id\`) REFERENCES \`cities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cities\` ADD CONSTRAINT \`FK_52af18d505515614479e5c9f5e9\` FOREIGN KEY (\`province_id\`) REFERENCES \`provincies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cities\` ADD CONSTRAINT \`FK_42a294591feef6af3d96d60132a\` FOREIGN KEY (\`region_id\`) REFERENCES \`regions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_25e1cf8f41bae2f3d11f3c2a028\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_1901e9aae03c8897b7dd460c27f\` FOREIGN KEY (\`region_id\`) REFERENCES \`regions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_2b3c754ea3bf83cab000b8ed3d4\` FOREIGN KEY (\`code\`) REFERENCES \`payment_gateways\`(\`code\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_427785468fb7d2733f59e7d7d39\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` ADD CONSTRAINT \`FK_0405e491d80bf2ee0db1166d203\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` ADD CONSTRAINT \`FK_c782e6d3294427d395137de3778\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` ADD CONSTRAINT \`FK_1427a77e06023c250ed3794a1ba\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` ADD CONSTRAINT \`FK_8d27a0fa9ccde6952aa719e374a\` FOREIGN KEY (\`province_id\`) REFERENCES \`provincies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` ADD CONSTRAINT \`FK_289b8fdbd507a2d32115f4e65af\` FOREIGN KEY (\`degree_id\`) REFERENCES \`degree\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` ADD CONSTRAINT \`FK_d92181684e73f7533e903e1acfd\` FOREIGN KEY (\`city_id\`) REFERENCES \`cities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` ADD CONSTRAINT \`FK_feaef04da6b374c39efc59b1266\` FOREIGN KEY (\`subdistrict_id\`) REFERENCES \`subdistricts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`admins\` ADD CONSTRAINT \`FK_5733c73cd81c566a90cc4802f96\` FOREIGN KEY (\`role_id\`) REFERENCES \`admin_role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admins\` DROP FOREIGN KEY \`FK_5733c73cd81c566a90cc4802f96\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` DROP FOREIGN KEY \`FK_feaef04da6b374c39efc59b1266\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` DROP FOREIGN KEY \`FK_d92181684e73f7533e903e1acfd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` DROP FOREIGN KEY \`FK_289b8fdbd507a2d32115f4e65af\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`schools\` DROP FOREIGN KEY \`FK_8d27a0fa9ccde6952aa719e374a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` DROP FOREIGN KEY \`FK_1427a77e06023c250ed3794a1ba\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` DROP FOREIGN KEY \`FK_c782e6d3294427d395137de3778\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`participants\` DROP FOREIGN KEY \`FK_0405e491d80bf2ee0db1166d203\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_427785468fb7d2733f59e7d7d39\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_2b3c754ea3bf83cab000b8ed3d4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_1901e9aae03c8897b7dd460c27f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_25e1cf8f41bae2f3d11f3c2a028\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cities\` DROP FOREIGN KEY \`FK_42a294591feef6af3d96d60132a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cities\` DROP FOREIGN KEY \`FK_52af18d505515614479e5c9f5e9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`subdistricts\` DROP FOREIGN KEY \`FK_bd1910ffb32bd4e8cac5a34b625\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_051db7d37d478a69a7432df147\` ON \`admins\``,
    );
    await queryRunner.query(`DROP TABLE \`admins\``);
    await queryRunner.query(`DROP TABLE \`admin_role\``);
    await queryRunner.query(`DROP TABLE \`event_settings\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_1c4c95d773004250c157a744d6\` ON \`setting\``,
    );
    await queryRunner.query(`DROP TABLE \`setting\``);
    await queryRunner.query(`DROP TABLE \`schools\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_98a6bfd72670bddb790a13cbca\` ON \`degree\``,
    );
    await queryRunner.query(`DROP TABLE \`degree\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_1cda06c31eec1c95b3365a0283\` ON \`participants\``,
    );
    await queryRunner.query(`DROP TABLE \`participants\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a288a55870307f7ee073dc831c\` ON \`payments\``,
    );
    await queryRunner.query(`DROP TABLE \`payments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7df2b87fd46ab82914464b9587\` ON \`payment_gateways\``,
    );
    await queryRunner.query(`DROP TABLE \`payment_gateways\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f1a9842e79756a9f25ba8dbe46\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4fcd12ed6a046276e2deb08801\` ON \`regions\``,
    );
    await queryRunner.query(`DROP TABLE \`regions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4762ffb6e5d198cfec5606bc11\` ON \`cities\``,
    );
    await queryRunner.query(`DROP TABLE \`cities\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6b8edc4fb44648164d0d1635c5\` ON \`subdistricts\``,
    );
    await queryRunner.query(`DROP TABLE \`subdistricts\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b9b5e6eb174ca5a8d9e5ed04d0\` ON \`provincies\``,
    );
    await queryRunner.query(`DROP TABLE \`provincies\``);
  }
}
