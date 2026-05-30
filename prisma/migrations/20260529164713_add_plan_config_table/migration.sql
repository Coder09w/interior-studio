-- CreateTable
CREATE TABLE "PlanConfig" (
    "id" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceId" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "cta" TEXT NOT NULL DEFAULT '',
    "maxProjects" INTEGER,
    "maxRoomsPerProject" INTEGER,
    "maxFurniturePerRoom" INTEGER,
    "features" TEXT NOT NULL DEFAULT '{}',
    "freeRoomTypes" TEXT NOT NULL DEFAULT '[]',
    "freeLightingMoods" TEXT NOT NULL DEFAULT '[]',
    "allRoomTypes" TEXT NOT NULL DEFAULT '[]',
    "allLightingMoods" TEXT NOT NULL DEFAULT '[]',
    "featureComparison" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_planKey_key" ON "PlanConfig"("planKey");
