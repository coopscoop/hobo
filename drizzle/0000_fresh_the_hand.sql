CREATE TABLE "Admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"content" text,
	"type" text DEFAULT 'news' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Batting" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"at_bat" integer DEFAULT 0,
	"run" integer DEFAULT 0,
	"walk" integer DEFAULT 0,
	"strikeout" integer DEFAULT 0,
	"hit_by_pitch" integer DEFAULT 0,
	"stolen_base" integer DEFAULT 0,
	"runs_batted_in" integer DEFAULT 0,
	"sacrifice" integer DEFAULT 0,
	"single_hit" integer DEFAULT 0,
	"double_hit" integer DEFAULT 0,
	"triple_hit" integer DEFAULT 0,
	"home_run" integer DEFAULT 0,
	"roe" integer DEFAULT 0,
	"per_inning" jsonb,
	CONSTRAINT "Batting_game_id_player_id_unique" UNIQUE("game_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "Executives" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(64),
	"last_name" varchar(64),
	"position" varchar(32),
	"year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" varchar
);
--> statement-breakpoint
CREATE TABLE "Games" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"location" text NOT NULL,
	"field_id" integer DEFAULT 1 NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"league_id" integer NOT NULL,
	"is_playoff" boolean DEFAULT false NOT NULL,
	"notes" text,
	"home_score" integer,
	"away_score" integer,
	"start_time" time DEFAULT '09:00:00' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Innings" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"inning" integer NOT NULL,
	"home_runs" integer DEFAULT 0 NOT NULL,
	"away_runs" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "Innings_game_id_inning_unique" UNIQUE("game_id","inning")
);
--> statement-breakpoint
CREATE TABLE "Leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"league_name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PageContent" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_name" varchar(255) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	CONSTRAINT "PageContent_page_name_unique" UNIQUE("page_name")
);
--> statement-breakpoint
CREATE TABLE "Pitching" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"innings_pitched" integer
);
--> statement-breakpoint
CREATE TABLE "Players" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(64),
	"last_name" varchar(64),
	"current_team" integer
);
--> statement-breakpoint
CREATE TABLE "Rosters" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"active_period" daterange NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Substitutes" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"from_team_id" integer,
	"new_team_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Batting" ADD CONSTRAINT "Batting_game_id_Games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."Games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Batting" ADD CONSTRAINT "Batting_player_id_Players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."Players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "Games_field_id_Fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."Fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "Games_home_team_id_Teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "Games_away_team_id_Teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "Games_league_id_Leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."Leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_game_id_Games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."Games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Pitching" ADD CONSTRAINT "Pitching_game_id_Games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."Games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Pitching" ADD CONSTRAINT "Pitching_player_id_Players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."Players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Players" ADD CONSTRAINT "Players_current_team_Teams_id_fk" FOREIGN KEY ("current_team") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Rosters" ADD CONSTRAINT "Rosters_team_id_Teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Rosters" ADD CONSTRAINT "Rosters_player_id_Players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."Players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Substitutes" ADD CONSTRAINT "Substitutes_game_id_Games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."Games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Substitutes" ADD CONSTRAINT "Substitutes_player_id_Players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."Players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Substitutes" ADD CONSTRAINT "Substitutes_from_team_id_Teams_id_fk" FOREIGN KEY ("from_team_id") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Substitutes" ADD CONSTRAINT "Substitutes_new_team_id_Teams_id_fk" FOREIGN KEY ("new_team_id") REFERENCES "public"."Teams"("id") ON DELETE no action ON UPDATE no action;