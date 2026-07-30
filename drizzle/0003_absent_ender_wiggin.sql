CREATE TYPE "public"."permission_type_enum" AS ENUM('CRUD', 'REPORT', 'OTHER', 'FEATURE');--> statement-breakpoint
ALTER TABLE "permission" DROP CONSTRAINT "permission_operation_type_check";--> statement-breakpoint
ALTER TABLE "ai_document_meta" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_role" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "district" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "file_manager" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "permission" ALTER COLUMN "operation_type" SET DATA TYPE "public"."permission_type_enum" USING "operation_type"::"public"."permission_type_enum";--> statement-breakpoint
ALTER TABLE "province" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "sub_district" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "api_client" ADD COLUMN "deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "api_client_ip" ADD COLUMN "deleted" boolean DEFAULT false;