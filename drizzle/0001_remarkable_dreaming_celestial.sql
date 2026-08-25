ALTER TABLE "pages" RENAME TO "PageContent";--> statement-breakpoint
ALTER TABLE "PageContent" DROP CONSTRAINT "pages_page_name_unique";--> statement-breakpoint
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_page_name_unique" UNIQUE("page_name");