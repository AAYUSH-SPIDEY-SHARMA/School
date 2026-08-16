-- =============================================================================
-- Database-level invariants.
--
-- "Application validation is user experience. Database constraints are the
-- guarantee." (BLUEPRINT/17_DATABASE_SCHEMA)
--
-- Everything here enforces a rule that must hold regardless of which code path
-- writes the row — including a migration, a psql session, or a future feature
-- that forgets. Prisma's schema language cannot express CHECK constraints or
-- triggers, so they live in migration SQL.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. An event cannot end before it starts.
-- -----------------------------------------------------------------------------
ALTER TABLE "events"
  ADD CONSTRAINT "events_enddate_after_startdate"
  CHECK ("endDate" IS NULL OR "endDate" >= "startDate");


-- -----------------------------------------------------------------------------
-- 2. Published content must carry a publication timestamp.
--
-- Without this, a row can be PUBLISHED with publishedAt NULL, which sorts
-- unpredictably in every "most recent first" listing on the public site and is
-- tedious to diagnose after the fact.
-- -----------------------------------------------------------------------------
ALTER TABLE "news"
  ADD CONSTRAINT "news_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "events"
  ADD CONSTRAINT "events_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "notices"
  ADD CONSTRAINT "notices_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "gallery_albums"
  ADD CONSTRAINT "gallery_albums_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "achievements"
  ADD CONSTRAINT "achievements_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "testimonials"
  ADD CONSTRAINT "testimonials_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);

ALTER TABLE "faculty"
  ADD CONSTRAINT "faculty_published_has_date"
  CHECK ("status" <> 'PUBLISHED' OR "publishedAt" IS NOT NULL);


-- -----------------------------------------------------------------------------
-- 3. A notice must not expire before it is published.
--
-- The direct answer to the six-year-stale notice found in reference research
-- (45_RESEARCH_SOURCES F-3) is query-time expiry filtering; this stops the
-- inverse mistake, an expiry date set in the past at publication, which would
-- make a notice invisible the moment it went live.
-- -----------------------------------------------------------------------------
ALTER TABLE "notices"
  ADD CONSTRAINT "notices_expiry_after_publish"
  CHECK ("expiresAt" IS NULL OR "publishedAt" IS NULL OR "expiresAt" > "publishedAt");


-- -----------------------------------------------------------------------------
-- 4. Non-negative sizes and counts.
-- -----------------------------------------------------------------------------
ALTER TABLE "media_assets"
  ADD CONSTRAINT "media_assets_filesize_positive" CHECK ("fileSize" >= 0);

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_filesize_positive" CHECK ("fileSize" >= 0);

ALTER TABLE "faculty"
  ADD CONSTRAINT "faculty_experience_sane"
  CHECK ("experienceYears" IS NULL OR ("experienceYears" >= 0 AND "experienceYears" <= 70));


-- -----------------------------------------------------------------------------
-- 5. Enquiry consent is mandatory and cannot be dated in the future.
--
-- An enquiry record without a consent timestamp is personal data held with no
-- recorded basis. The column is already NOT NULL; this stops a nonsensical
-- value being written.
-- -----------------------------------------------------------------------------
ALTER TABLE "admission_enquiries"
  ADD CONSTRAINT "enquiry_consent_not_future"
  CHECK ("consentAt" <= now() + interval '1 minute');

-- Contact details cannot be blank. A "required" field enforced only by Zod is
-- one direct insert away from an enquiry nobody can respond to.
ALTER TABLE "admission_enquiries"
  ADD CONSTRAINT "enquiry_contactable"
  CHECK (length(btrim("phone")) > 0 AND length(btrim("email")) > 0);


-- -----------------------------------------------------------------------------
-- 6. AuditLog is APPEND-ONLY — enforced by the database, not by convention.
--
-- An audit log that the application can rewrite is not an audit log. Blocking
-- UPDATE and DELETE at the database means even a compromised or buggy code path
-- cannot quietly edit history.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only; % is not permitted',
    TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION prevent_mutation();


-- -----------------------------------------------------------------------------
-- 7. SlugHistory is APPEND-ONLY.
--
-- Editing this table would silently break a 301 that an old link depends on —
-- a link possibly shared in a parent WhatsApp group months earlier (NFR-028).
--
-- DELETE is permitted, unlike audit_logs: a slug may legitimately be reclaimed
-- when a new entity takes an old slug, and the row must then be removed to
-- avoid a redirect loop. UPDATE is never legitimate.
-- -----------------------------------------------------------------------------
CREATE TRIGGER slug_history_no_update
  BEFORE UPDATE ON "slug_history"
  FOR EACH ROW EXECUTE FUNCTION prevent_mutation();


-- -----------------------------------------------------------------------------
-- 8. Partial indexes for the public read path.
--
-- Every public listing filters to PUBLISHED and not-soft-deleted. Partial
-- indexes keep drafts and deleted rows out of the index entirely, so the index
-- stays small and matches the query shape exactly.
-- -----------------------------------------------------------------------------
CREATE INDEX "news_public_idx"
  ON "news" ("publishedAt" DESC)
  WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;

CREATE INDEX "events_public_idx"
  ON "events" ("startDate" DESC)
  WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;

CREATE INDEX "notices_public_idx"
  ON "notices" ("pinned" DESC, "publishedAt" DESC)
  WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;

CREATE INDEX "gallery_albums_public_idx"
  ON "gallery_albums" ("publishedAt" DESC)
  WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;

CREATE INDEX "faculty_public_idx"
  ON "faculty" ("displayOrder")
  WHERE "status" = 'PUBLISHED' AND "deletedAt" IS NULL;


-- -----------------------------------------------------------------------------
-- 9. Slug uniqueness must ignore soft-deleted rows.
--
-- Prisma's @unique on slug is absolute, which would mean deleting an article
-- permanently reserves its slug. These partial unique indexes scope uniqueness
-- to live rows so a slug becomes reusable after deletion.
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS "news_slug_key";
CREATE UNIQUE INDEX "news_slug_key" ON "news" ("slug") WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "events_slug_key";
CREATE UNIQUE INDEX "events_slug_key" ON "events" ("slug") WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "gallery_albums_slug_key";
CREATE UNIQUE INDEX "gallery_albums_slug_key" ON "gallery_albums" ("slug") WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "faculty_slug_key";
CREATE UNIQUE INDEX "faculty_slug_key" ON "faculty" ("slug") WHERE "deletedAt" IS NULL;

DROP INDEX IF EXISTS "facilities_slug_key";
CREATE UNIQUE INDEX "facilities_slug_key" ON "facilities" ("slug") WHERE "deletedAt" IS NULL;
