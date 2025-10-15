/*
  Warnings:

  - You are about to alter the column `totalGuest` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `totalGuest` INTEGER NOT NULL;
