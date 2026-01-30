-- Create enums
CREATE TYPE "AccountType" AS ENUM ('SCRAPE', 'POST', 'BOTH');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "IntentType" AS ENUM ('REQUESTING_SERVICE', 'OFFERING_SERVICE', 'IRRELEVANT');
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'VERIFIED', 'QUEUED', 'DRAFTED', 'POSTED', 'REJECTED');
CREATE TYPE "DraftStatus" AS ENUM ('PENDING', 'POSTED', 'REJECTED');
CREATE TYPE "ErrorSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create accounts table
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActive" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- Create sessions table
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "cookies" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "renewalAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create keywords table
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "baseTerm" TEXT NOT NULL,
    "variants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "keywords" ADD CONSTRAINT "keywords_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create content table
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "redditId" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "author" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mediaPresent" BOOLEAN NOT NULL DEFAULT false,
    "intentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intentType" "IntentType",
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_redditId_key" ON "content"("redditId");
CREATE INDEX "content_accountId_idx" ON "content"("accountId");
CREATE INDEX "content_status_idx" ON "content"("status");
CREATE INDEX "content_intentType_idx" ON "content"("intentType");
CREATE INDEX "content_createdAt_idx" ON "content"("createdAt");

ALTER TABLE "content" ADD CONSTRAINT "content_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create content_keywords table
CREATE TABLE "content_keywords" (
    "contentId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "content_keywords_pkey" PRIMARY KEY ("contentId", "keywordId")
);

ALTER TABLE "content_keywords" ADD CONSTRAINT "content_keywords_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_keywords" ADD CONSTRAINT "content_keywords_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create drafts table
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "llmOutput" TEXT NOT NULL,
    "reviewer" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "status" "DraftStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "drafts_accountId_idx" ON "drafts"("accountId");
CREATE INDEX "drafts_approved_idx" ON "drafts"("approved");
CREATE INDEX "drafts_status_idx" ON "drafts"("status");

ALTER TABLE "drafts" ADD CONSTRAINT "drafts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create posts table
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "draftId" TEXT,
    "contentId" TEXT,
    "redditId" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "posts_accountId_idx" ON "posts"("accountId");
CREATE INDEX "posts_postedAt_idx" ON "posts"("postedAt");

ALTER TABLE "posts" ADD CONSTRAINT "posts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "drafts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create events table
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "contentId" TEXT,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "events_accountId_idx" ON "events"("accountId");
CREATE INDEX "events_type_idx" ON "events"("type");
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

ALTER TABLE "events" ADD CONSTRAINT "events_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create errors table
CREATE TABLE "errors" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "severity" "ErrorSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "errors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "errors_service_idx" ON "errors"("service");
CREATE INDEX "errors_severity_idx" ON "errors"("severity");
CREATE INDEX "errors_createdAt_idx" ON "errors"("createdAt");
