/*
  Warnings:

  - Added the required column `address` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyLocation` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "propertyLocation" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "zip" TEXT NOT NULL;
