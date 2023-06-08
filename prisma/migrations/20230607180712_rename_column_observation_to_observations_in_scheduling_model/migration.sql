/*
  Warnings:

  - You are about to drop the column `observation` on the `schedulings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `schedulings` DROP COLUMN `observation`,
    ADD COLUMN `observations` VARCHAR(191) NULL;
