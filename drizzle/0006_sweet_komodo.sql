ALTER TABLE "Batting" DROP COLUMN "second_base";--> statement-breakpoint
ALTER TABLE "Batting" ADD CONSTRAINT "Batting_game_id_player_id_unique" UNIQUE("game_id","player_id");