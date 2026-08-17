-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('CLOUDINARY', 'GOOGLE_DRIVE', 'YOUTUBE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "source" "MediaSource" NOT NULL DEFAULT 'CLOUDINARY',
ADD COLUMN     "thumbnailUrl" TEXT,
ALTER COLUMN "publicId" DROP NOT NULL,
ALTER COLUMN "fileSize" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "media_assets_source_kind_idx" ON "media_assets"("source", "kind");
