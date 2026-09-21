CREATE TABLE "away_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Games" DROP COLUMN "location";