/*
  Warnings:

  - Added the required column `roomId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `roomId` INTEGER NOT NULL;
