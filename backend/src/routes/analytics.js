const express = require("express");
const { targetOccupancyRatio } = require("../simulation");
const router = express.Router();

router.get("/hourly", (req, res) => {
  const data = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    occupancy: Math.round(targetOccupancyRatio(hour) * 100),
  }));
  res.json({ success: true, data });
});

router.get("/weekly", (req, res) => {
  const base = [58, 55, 60, 63, 70, 88, 82];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  res.json({
    success: true,
    data: days.map((day, i) => ({ day, occupancy: base[i] })),
  });
});

router.get("/peak-hours", (req, res) => {
  res.json({
    success: true,
    data: [
      { label: "Morning Rush", window: "09:00 - 11:00", occupancy: 60 },
      { label: "Lunch Peak", window: "12:00 - 14:00", occupancy: 74 },
      { label: "Evening Peak", window: "18:00 - 20:00", occupancy: 90 },
    ],
  });
});

router.get("/summary", (req, res) => {
  res.json({
    success: true,
    data: {
      averageParkingDurationMinutes: 74,
      predictionAccuracy: 91,
    },
  });
});

module.exports = router;