import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210183215 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tax_code" drop constraint if exists "tax_code_code_unique";`);
    this.addSql(`drop index if exists "IDX_tax_code_tax_code_unique";`);

    this.addSql(`alter table if exists "tax_code" rename column "tax_code" to "code";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_code_code_unique" ON "tax_code" ("code") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_tax_code_code_unique";`);

    this.addSql(`alter table if exists "tax_code" rename column "code" to "tax_code";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_code_tax_code_unique" ON "tax_code" ("tax_code") WHERE deleted_at IS NULL;`);
  }

}
