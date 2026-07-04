const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sim = req.app.get("simulation");
    const snapshot = sim.getSnapshot();

    const totalLocations = snapshot.length;
    const totalSlots = snapshot.reduce((s, l) => s + l.totalSlots, 0);
    const totalOccupied = snapshot.reduce((s, l) => s + l.occupiedSlots, 0);
    const avgOccupancy = totalSlots ? Math.round((totalOccupied / totalSlots) * 100) : 0;

    const todaysSearches = await prisma.searchLog.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    const trafficLevel = avgOccupancy > 75 ? "High" : avgOccupancy > 45 ? "Moderate" : "Low";

    res.json({
      success: true,
      data: {
        totalParkingLocations: totalLocations,
        nearbyParking: totalLocations,
        averageOccupancy: avgOccupancy,
        predictionAccuracy: 91,
        todaysSearches,
        trafficLevel,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;