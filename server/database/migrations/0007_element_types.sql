CREATE TABLE IF NOT EXISTS "element_types" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"default_label" text NOT NULL,
	"fixed" boolean DEFAULT false NOT NULL,
	"color" text DEFAULT 'neutral' NOT NULL,
	"icon" text DEFAULT 'i-lucide-music' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"builtin" boolean DEFAULT false NOT NULL
);--> statement-breakpoint
INSERT INTO "element_types" ("key", "label", "default_label", "fixed", "color", "icon", "sort_order", "builtin") VALUES
	('songSlot', 'Lied', 'Lied', false, 'primary', 'i-lucide-music', 0, true),
	('liturgy', 'Liturgie', 'Liturgieelement', true, 'secondary', 'i-lucide-lock', 1, true),
	('voluntary', 'Ein-/Ausgang', 'Eingangsmusik', false, 'neutral', 'i-lucide-door-open', 2, false),
	('communion', 'Abendmahl-Musik', 'Musik zum Abendmahl', false, 'neutral', 'i-lucide-wine', 3, false)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
UPDATE "tracks" SET "category" = 'songSlot' WHERE "category" = 'hymn';--> statement-breakpoint
ALTER TABLE "tracks" ALTER COLUMN "category" SET DEFAULT 'songSlot';
