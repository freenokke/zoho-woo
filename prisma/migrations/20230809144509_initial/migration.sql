-- CreateTable
CREATE TABLE "User" (
    "accountId" INTEGER NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");
