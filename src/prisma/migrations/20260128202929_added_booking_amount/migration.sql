/*
  Warnings:

  - You are about to drop the column `roomId` on the `booking` table. All the data in the column will be lost.
  - Added the required column `bookingAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `roomId`,
    ADD COLUMN `bookingAmount` INTEGER NOT NULL;
