ALTER TABLE "mcp_tokens" DROP CONSTRAINT "mcp_tokens_repo_id_repos_id_fk";
--> statement-breakpoint
ALTER TABLE "mcp_tokens" ADD CONSTRAINT "mcp_tokens_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;