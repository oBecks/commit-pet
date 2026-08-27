CREATE TABLE "mcp_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" bigint NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "mcp_tokens_repo_id_unique" UNIQUE("repo_id"),
	CONSTRAINT "mcp_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "mcp_tokens" ADD CONSTRAINT "mcp_tokens_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE no action ON UPDATE no action;