CREATE TABLE "Fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" varchar
);
--> statement-breakpoint
ALTER TABLE "Batting" ADD COLUMN "per_inning" jsonb;--> statement-breakpoint
ALTER TABLE "Games" ADD COLUMN "time" time DEFAULT '09:00:00' NOT NULL;