CREATE TYPE "public"."ai_role_enum" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "ai_chat" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"pin" boolean DEFAULT false,
	"deleted" boolean DEFAULT false,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" bigint PRIMARY KEY NOT NULL,
	"role" "ai_role_enum" NOT NULL,
	"ai_chat" bigint NOT NULL,
	"content" text NOT NULL,
	"created_date" timestamp (6)
);
--> statement-breakpoint
CREATE TABLE "ai_document_metadata" (
	"document_id" bigint NOT NULL,
	"meta_key" varchar(255) NOT NULL,
	"meta_value" text,
	CONSTRAINT "ai_document_metadata_document_id_meta_key_pk" PRIMARY KEY("document_id","meta_key")
);
--> statement-breakpoint
CREATE TABLE "app_user_test" (
	"id" integer PRIMARY KEY NOT NULL,
	"login_name" varchar(20) NOT NULL,
	"password" varchar(50) NOT NULL,
	"salt" varchar(128),
	"req_token" varchar(125),
	"req_token_expire" timestamp,
	"last_login" date,
	"teacher" integer,
	"establishment" integer,
	"department_group" integer,
	"college_official" boolean NOT NULL,
	"active" boolean NOT NULL,
	"poll_data" text,
	"image_name" varchar(100),
	"use_mobile_app" boolean NOT NULL,
	"use_manager_app" boolean DEFAULT false NOT NULL,
	"created_user" integer,
	"created_date" timestamp NOT NULL,
	"updated_user" integer,
	"updated_date" timestamp NOT NULL,
	CONSTRAINT "app_user_test_login_name_unique" UNIQUE("login_name")
);
--> statement-breakpoint
ALTER TABLE "ai_document_meta" DROP CONSTRAINT "ai_document_meta_document_type_check";--> statement-breakpoint
ALTER TABLE "ai_document_meta" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'ai_document_vector_ids'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "ai_document_vector_ids" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "ai_document_vector_ids" ALTER COLUMN "vector_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "api_client" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "api_client_ip" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "app_role" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "district" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "file_manager" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "files_directory" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "province" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sub_district" ALTER COLUMN "created_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ai_document_vector_ids" ADD CONSTRAINT "ai_document_vector_ids_document_id_vector_id_pk" PRIMARY KEY("document_id","vector_id");--> statement-breakpoint
ALTER TABLE "ai_document_meta" ADD COLUMN "active" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_document_meta" ADD COLUMN "file_mime" bigint;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_ai_chat_ai_chat_id_fk" FOREIGN KEY ("ai_chat") REFERENCES "public"."ai_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_metadata" ADD CONSTRAINT "ai_document_metadata_document_id_ai_document_meta_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."ai_document_meta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_chat_created_user" ON "ai_chat" USING btree ("created_user");--> statement-breakpoint
ALTER TABLE "ai_document_meta" ADD CONSTRAINT "ai_document_meta_file_mime_file_mime_id_fk" FOREIGN KEY ("file_mime") REFERENCES "public"."file_mime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_meta" DROP COLUMN "document_type";--> statement-breakpoint
ALTER TABLE "ai_document_meta" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_username_unique" UNIQUE("username");