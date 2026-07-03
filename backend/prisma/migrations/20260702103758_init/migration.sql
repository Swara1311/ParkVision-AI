-- CreateTable
CREATE TABLE "ParkingLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "isEvCharging" BOOLEAN NOT NULL DEFAULT false,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "openNow" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT NOT NULL DEFAULT '06:00',
    "closeTime" TEXT NOT NULL DEFAULT '23:00',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OccupancySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkingLocationId" TEXT NOT NULL,
    "availableSlots" INTEGER NOT NULL,
    "occupiedSlots" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    CONSTRAINT "OccupancySnapshot_parkingLocationId_fkey" FOREIGN KEY ("parkingLocationId") REFERENCES "ParkingLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkingLocationId" TEXT,
    "city" TEXT NOT NULL,
    "query" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchLog_parkingLocationId_fkey" FOREIGN KEY ("parkingLocationId") REFERENCES "ParkingLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PredictionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkingLocationId" TEXT NOT NULL,
    "predictedAvailable" INTEGER NOT NULL,
    "successProbability" REAL NOT NULL,
    "estimatedSearchTime" INTEGER NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingLocation_placeId_key" ON "ParkingLocation"("placeId");

-- CreateIndex
CREATE INDEX "ParkingLocation_city_idx" ON "ParkingLocation"("city");

-- CreateIndex
CREATE INDEX "OccupancySnapshot_parkingLocationId_recordedAt_idx" ON "OccupancySnapshot"("parkingLocationId", "recordedAt");
