ALTER TABLE "Games" ADD COLUMN "field_id" integer NOT NULL SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "Games" ADD CONSTRAINT "Games_field_id_Fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."Fields"("id") ON DELETE no action ON UPDATE no action;
