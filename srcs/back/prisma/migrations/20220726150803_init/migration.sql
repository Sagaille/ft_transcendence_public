/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pseudo` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ingame_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatar` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingame_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ladder_lvl` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `losses` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `two_factor` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wins` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "pseudo",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "friends" TEXT[],
ADD COLUMN     "ingame_name" TEXT NOT NULL,
ADD COLUMN     "ladder_lvl" INTEGER NOT NULL,
ADD COLUMN     "losses" INTEGER NOT NULL,
ADD COLUMN     "match_history" INTEGER[],
ADD COLUMN     "two_factor" BOOLEAN NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "wins" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT E'public',
    "password" TEXT NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinedRoom" (
    "id" SERIAL NOT NULL,
    "socket_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "JoinedRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedUser" (
    "id" SERIAL NOT NULL,
    "socket_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ConnectedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Users" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Users_AB_unique" ON "_Users"("A", "B");

-- CreateIndex
CREATE INDEX "_Users_B_index" ON "_Users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminUsers_AB_unique" ON "_AdminUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminUsers_B_index" ON "_AdminUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_ingame_name_key" ON "User"("ingame_name");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedRoom" ADD CONSTRAINT "JoinedRoom_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedRoom" ADD CONSTRAINT "JoinedRoom_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedUser" ADD CONSTRAINT "ConnectedUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users" ADD CONSTRAINT "_Users_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users" ADD CONSTRAINT "_Users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminUsers" ADD CONSTRAINT "_AdminUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminUsers" ADD CONSTRAINT "_AdminUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
