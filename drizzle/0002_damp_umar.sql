ALTER TABLE "permission" DROP CONSTRAINT "permission_operation_type_check";--> statement-breakpoint
ALTER TABLE "ai_document_meta" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "ai_document_meta" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_client" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_client_ip" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "app_role" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_role" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "district" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "district" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "file_manager" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "file_manager" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "files_directory" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "province" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "province" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sub_district" ALTER COLUMN "deleted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "sub_district" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_client" ADD COLUMN "deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "api_client_ip" ADD COLUMN "deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "operation_type" "permission_type_enum";--> statement-breakpoint
ALTER TABLE "permission" DROP COLUMN "permission_type";--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_operation_type_check" CHECK ("permission"."operation_type" >= 0 AND "permission"."operation_type" <= 2);