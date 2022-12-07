-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pseudo" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
