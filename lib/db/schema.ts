import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  bigint,
  pgEnum,
} from "drizzle-orm/pg-core";

// See docs/glossary.md and docs/adr/003-pet-lifecycle-phases.md
export const phaseEnum = pgEnum("phase", ["development", "deployed"]);

// One row per GitHub App installation. See docs/adr/008-github-app-auth.md
export const installations = pgTable("installations", {
  id: bigint("id", { mode: "number" }).primaryKey(), // GitHub installation id
  accountLogin: text("account_login").notNull(),
  accountType: text("account_type").notNull(), // "User" | "Organization"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per repo the app is installed on. See docs/adr/002-pet-scoped-per-repo.md
export const repos = pgTable("repos", {
  id: bigint("id", { mode: "number" }).primaryKey(), // GitHub repo id
  installationId: bigint("installation_id", { mode: "number" })
    .notNull()
    .references(() => installations.id),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per pet, 1:1 with repos. See docs/adr/003, 004, 005.
export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().defaultRandom(),
  repoId: bigint("repo_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => repos.id),
  phase: phaseEnum("phase").notNull().default("development"),
  // Health as of lastCommitAt; decay since then is computed on read, not stored.
  // See lib/pets/health.ts and docs/open-questions.md.
  health: integer("health").notNull().default(100),
  lastCommitAt: timestamp("last_commit_at"),
  // Growth stage (egg/hatchling/juvenile/adult) is derived from xp on read,
  // same pattern as health. See lib/pets/growth.ts and docs/open-questions.md.
  xp: integer("xp").notNull().default(0),
  openIssueCount: integer("open_issue_count").notNull().default(0),
  sick: boolean("sick").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
