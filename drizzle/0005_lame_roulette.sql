ALTER TABLE "Games" RENAME COLUMN "time" TO "start_time";--> statement-breakpoint
ALTER TABLE "Games" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Games" ALTER COLUMN "field_id" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "Substitutes" ALTER COLUMN "from_team_id" DROP NOT NULL;