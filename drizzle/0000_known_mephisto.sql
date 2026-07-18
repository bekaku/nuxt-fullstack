CREATE TABLE "access_token" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_date" timestamp (6),
	"expires_at" timestamp (6),
	"fcm_enable" boolean,
	"fcm_token" varchar(255),
	"lastest_active" timestamp (6),
	"logouted_date" timestamp (6),
	"revoked" boolean DEFAULT false NOT NULL,
	"service" smallint DEFAULT 0 NOT NULL,
	"token" varchar(100),
	"api_client" bigint,
	"app_user" bigint,
	"login_log" bigint,
	CONSTRAINT "access_token_service_check" CHECK ("access_token"."service" >= 0 AND "access_token"."service" <= 1)
);
--> statement-breakpoint
CREATE TABLE "ai_document_meta" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"document_type" varchar(255),
	"file_name" varchar(255),
	"is_active" boolean NOT NULL,
	CONSTRAINT "ai_document_meta_document_type_check" CHECK ("ai_document_meta"."document_type" IN ('GENERAL', 'FAQ', 'USER_GUIDE', 'WI'))
);
--> statement-breakpoint
CREATE TABLE "ai_document_vector_ids" (
	"document_id" bigint PRIMARY KEY NOT NULL,
	"vector_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "api_client" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"api_name" varchar(100) NOT NULL,
	"api_token" varchar(255),
	"by_pass" boolean,
	"status" boolean
);
--> statement-breakpoint
CREATE TABLE "api_client_ip" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"ip_address" varchar(50),
	"status" boolean,
	"api_client" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_role" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"active" boolean,
	"name" varchar(125) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"active" boolean DEFAULT true NOT NULL,
	"default_locale" smallint,
	"email" varchar(125) NOT NULL,
	"password" varchar(255),
	"salt" varchar(255),
	"username" varchar(100),
	"avatar_file_id" bigint,
	"cover_file_id" bigint,
	CONSTRAINT "app_user_default_locale_check" CHECK ("app_user"."default_locale" >= 0 AND "app_user"."default_locale" <= 1)
);
--> statement-breakpoint
CREATE TABLE "app_user_role" (
	"app_user" bigint NOT NULL,
	"app_role" bigint NOT NULL,
	CONSTRAINT "app_user_role_app_user_app_role_pk" PRIMARY KEY("app_user","app_role")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigint PRIMARY KEY NOT NULL,
	"action" varchar(255),
	"details" text,
	"entity_id" bigint,
	"entity_name" varchar(255),
	"ip_address" varchar(255),
	"timestamp" timestamp (6),
	"username" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "district" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"province" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_menu" (
	"id" bigint PRIMARY KEY NOT NULL,
	"url" varchar(255),
	"app_user" bigint
);
--> statement-breakpoint
CREATE TABLE "file_manager" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"file_name" varchar(255),
	"file_path" varchar(255),
	"file_size" bigint,
	"hidden" boolean NOT NULL,
	"locked" boolean NOT NULL,
	"original_file_name" varchar(125),
	"readable" boolean NOT NULL,
	"writeable" boolean NOT NULL,
	"file_mime_id" bigint,
	"files_directory_id" bigint,
	"owner" bigint,
	"description" text,
	"duration" integer DEFAULT 0,
	"title" varchar(125),
	"thumbnail_file" bigint,
	"use_thumbnail" boolean DEFAULT false,
	"updated_date" timestamp (6),
	"updated_user" bigint
);
--> statement-breakpoint
CREATE TABLE "file_mime" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(125)
);
--> statement-breakpoint
CREATE TABLE "files_directory" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"active" boolean NOT NULL,
	"name" varchar(125),
	"files_directory_parent" bigint,
	"file_size" bigint DEFAULT 0 NOT NULL,
	"latest_updated" timestamp (6),
	"owner" bigint,
	"file_count" bigint DEFAULT 0 NOT NULL,
	"deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "files_directory_path" (
	"files_directory" bigint NOT NULL,
	"files_directory_parent" bigint NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT "files_directory_path_files_directory_files_directory_parent_pk" PRIMARY KEY("files_directory","files_directory_parent")
);
--> statement-breakpoint
CREATE TABLE "login_log" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp (6),
	"device_id" varchar(125),
	"host_name" varchar(100),
	"ip" varchar(50),
	"login_from" smallint,
	"app_user" bigint,
	"user_agent" bigint,
	CONSTRAINT "login_log_login_from_check" CHECK ("login_log"."login_from" >= 0 AND "login_log"."login_from" <= 2)
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" bigint PRIMARY KEY NOT NULL,
	"code" varchar(125) NOT NULL,
	"operation_type" smallint,
	"module" varchar(255),
	"description" text,
	CONSTRAINT "permission_operation_type_check" CHECK ("permission"."operation_type" >= 0 AND "permission"."operation_type" <= 2)
);
--> statement-breakpoint
CREATE TABLE "province" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"name" varchar(255),
	"name_en" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"app_role" bigint NOT NULL,
	"permission" bigint NOT NULL,
	CONSTRAINT "role_permission_app_role_permission_pk" PRIMARY KEY("app_role","permission")
);
--> statement-breakpoint
CREATE TABLE "sub_district" (
	"id" bigint PRIMARY KEY NOT NULL,
	"deleted" boolean,
	"created_date" timestamp (6),
	"created_user" bigint,
	"updated_date" timestamp (6),
	"updated_user" bigint,
	"latitude" double precision,
	"longitude" double precision,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"zip_code" integer,
	"district" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_activity_logs" (
	"id" bigint PRIMARY KEY NOT NULL,
	"action_date_time" timestamp (6),
	"description" varchar(255),
	"user_id" bigint
);
--> statement-breakpoint
CREATE TABLE "user_agent" (
	"id" bigint PRIMARY KEY NOT NULL,
	"agent" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_token" ADD CONSTRAINT "access_token_api_client_api_client_id_fk" FOREIGN KEY ("api_client") REFERENCES "public"."api_client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_token" ADD CONSTRAINT "access_token_app_user_app_user_id_fk" FOREIGN KEY ("app_user") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_token" ADD CONSTRAINT "access_token_login_log_login_log_id_fk" FOREIGN KEY ("login_log") REFERENCES "public"."login_log"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_vector_ids" ADD CONSTRAINT "ai_document_vector_ids_document_id_ai_document_meta_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."ai_document_meta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_client_ip" ADD CONSTRAINT "api_client_ip_api_client_api_client_id_fk" FOREIGN KEY ("api_client") REFERENCES "public"."api_client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_avatar_file_id_file_manager_id_fk" FOREIGN KEY ("avatar_file_id") REFERENCES "public"."file_manager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_cover_file_id_file_manager_id_fk" FOREIGN KEY ("cover_file_id") REFERENCES "public"."file_manager"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_role" ADD CONSTRAINT "app_user_role_app_user_app_user_id_fk" FOREIGN KEY ("app_user") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user_role" ADD CONSTRAINT "app_user_role_app_role_app_role_id_fk" FOREIGN KEY ("app_role") REFERENCES "public"."app_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "district" ADD CONSTRAINT "district_province_province_id_fk" FOREIGN KEY ("province") REFERENCES "public"."province"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_menu" ADD CONSTRAINT "favorite_menu_app_user_app_user_id_fk" FOREIGN KEY ("app_user") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_manager" ADD CONSTRAINT "file_manager_file_mime_id_file_mime_id_fk" FOREIGN KEY ("file_mime_id") REFERENCES "public"."file_mime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_manager" ADD CONSTRAINT "file_manager_files_directory_id_files_directory_id_fk" FOREIGN KEY ("files_directory_id") REFERENCES "public"."files_directory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_log" ADD CONSTRAINT "login_log_app_user_app_user_id_fk" FOREIGN KEY ("app_user") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_log" ADD CONSTRAINT "login_log_user_agent_user_agent_id_fk" FOREIGN KEY ("user_agent") REFERENCES "public"."user_agent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_app_role_app_role_id_fk" FOREIGN KEY ("app_role") REFERENCES "public"."app_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_permission_id_fk" FOREIGN KEY ("permission") REFERENCES "public"."permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_district" ADD CONSTRAINT "sub_district_district_district_id_fk" FOREIGN KEY ("district") REFERENCES "public"."district"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_activity_logs" ADD CONSTRAINT "system_activity_logs_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_access_token_fcm_token" ON "access_token" USING btree ("fcm_token");--> statement-breakpoint
CREATE INDEX "idx_access_token_revoked" ON "access_token" USING btree ("revoked");--> statement-breakpoint
CREATE INDEX "idx_access_token_lastest_active" ON "access_token" USING btree ("lastest_active");--> statement-breakpoint
CREATE INDEX "idx_access_token_token" ON "access_token" USING btree ("token");