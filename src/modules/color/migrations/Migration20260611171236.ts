import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260611171236 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "color" add column if not exists "media" text null;`);
    this.addSql(`alter table if exists "color" alter column "hex_code" type text using ("hex_code"::text);`);
    this.addSql(`alter table if exists "color" alter column "hex_code" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "color" drop column if exists "media";`);

    this.addSql(`alter table if exists "color" alter column "hex_code" type text using ("hex_code"::text);`);
    this.addSql(`alter table if exists "color" alter column "hex_code" set not null;`);
  }

}
