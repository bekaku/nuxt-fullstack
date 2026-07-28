CREATE TYPE "public"."permission_type_enum" AS ENUM('CRUD', 'REPORT', 'OTHER', 'FEATURE');--> statement-breakpoint
ALTER TABLE "permission" DROP CONSTRAINT "permission_operation_type_check";--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "permission_type" "permission_type_enum";--> statement-breakpoint
ALTER TABLE "file_manager" ADD CONSTRAINT "file_manager_owner_app_user_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_manager" ADD CONSTRAINT "file_manager_thumbnail_file_file_manager_id_fk" FOREIGN KEY ("thumbnail_file") REFERENCES "public"."file_manager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission" DROP COLUMN "operation_type";--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_operation_type_check" CHECK ("permission"."permission_type" >= 0 AND "permission"."permission_type" <= 2);