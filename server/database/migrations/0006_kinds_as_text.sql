ALTER TABLE "tracks" ALTER COLUMN "category" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "category" TYPE text USING "category"::text;--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "category" SET DEFAULT 'hymn';--> statement-breakpoint
ALTER TABLE "service_type_items" ALTER COLUMN "kind" TYPE text USING "kind"::text;--> statement-breakpoint
ALTER TABLE "service_items" ALTER COLUMN "kind" TYPE text USING "kind"::text;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."track_category";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."item_kind";
