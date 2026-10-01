CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"barcode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_state" (
	"user_id" text PRIMARY KEY,
	"saved" jsonb DEFAULT '[]' NOT NULL,
	"shopping_list" jsonb DEFAULT '[]' NOT NULL,
	"preferences" jsonb DEFAULT '{"diet":"No preference","allergens":[]}' NOT NULL
);
