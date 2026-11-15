ALTER TABLE "tracks" ADD COLUMN "parent_track_id" integer;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "playback_rate" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_parent_track_id_tracks_id_fk" FOREIGN KEY ("parent_track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;
