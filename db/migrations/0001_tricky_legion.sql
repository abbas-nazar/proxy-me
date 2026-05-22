CREATE TABLE "visitor_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "personality" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suggested_questions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "contact_collection" jsonb DEFAULT '{"enabled":false,"requireName":false,"requireEmail":false}'::jsonb;--> statement-breakpoint
ALTER TABLE "visitor_contacts" ADD CONSTRAINT "visitor_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;