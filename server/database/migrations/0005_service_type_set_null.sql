ALTER TABLE "services" ALTER COLUMN "service_type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_service_type_id_service_types_id_fk";--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE set null ON UPDATE no action;
