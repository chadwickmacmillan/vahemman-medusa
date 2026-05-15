import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260515180000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "color" ADD COLUMN IF NOT EXISTS "external_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "color" DROP COLUMN IF EXISTS "external_id";`);
  }

}
