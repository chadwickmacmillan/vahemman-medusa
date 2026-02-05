import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260205234949 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tax_code" drop constraint if exists "tax_code_tax_code_unique";`);
    this.addSql(`create table if not exists "tax_code" ("id" text not null, "name" text not null default '', "description" text not null default '', "tax_code" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tax_code_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_code_tax_code_unique" ON "tax_code" ("tax_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tax_code_deleted_at" ON "tax_code" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tax_code" cascade;`);
  }

}
