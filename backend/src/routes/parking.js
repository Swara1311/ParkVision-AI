const express = require("express");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

router.get("/", async (req, res) => {
  try {
    const { city, ev, accessible, openNow, sort, lat, lng } = req.query;
    const where = {};
    if (city) where.city = { equals: city, mode: "insensitive" };
    if (ev === "true") where.isEvCharging = true;
    if (accessible === "true") where.isAccessible = true;
    if (openNow === "true") where.openNow = true;

    const locations = await prisma.parkingLocation.findMany({ where });
    const sim = req.app.get("simulation");

    let enriched = locations.map((loc) => {
      const live = sim.getLocation(loc.id) || {};
      const distanceKm = lat && lng ? haversine(lat, lng, loc.latitude, loc.longitude) : null;
      return {
        ...loc,
        availableSlots: live.availableSlots ?? loc.totalSlots,
        occupiedSlots: live.occupiedSlots ?? 0,
        distanceKm,
      };
    });

    if (sort === "nearest" && lat && lng) {
      enriched.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    } else if (sort === "most-available") {
      enriched.sort((a, b) => b.availableSlots - a.availableSlots);
    } else if (sort === "cheapest") {
      enriched.sort((a, b) => a.fee - b.fee);
    }

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch parking locations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const loc = await prisma.parkingLocation.findUnique({ where: { id: req.params.id } });
    if (!loc) return res.status(404).json({ success: false, error: "Not found" });

    const sim = req.app.get("simulation");
    const live = sim.getLocation(loc.id) || { availableSlots: loc.totalSlots, occupiedSlots: 0 };

    let prediction = null;
    try {
      const now = new Date();
      const aiRes = await axios.post(`${AI_SERVICE_URL}/predict`, {
        current_occupancy: live.occupiedSlots,
        total_slots: loc.totalSlots,
        historical_avg_occupancy: Math.round(loc.totalSlots * 0.6),
        current_hour: now.getHours(),
        current_day: now.getDay(),
        eta_minutes: 10,
      });
      prediction = aiRes.data;
    } catch (e) {
      console.warn("AI service unreachable, using fallback prediction:", e.message);
      prediction = fallbackPrediction(live, loc.totalSlots);
    }

    res.json({ success: true, data: { ...loc, ...live, prediction } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch parking detail" });
  }
});

router.post("/search-log", async (req, res) => {
  try {
    const { city, query } = req.body;
    await prisma.searchLog.create({ data: { city: city || "Unknown", query } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to log search" });
  }
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function fallbackPrediction(live, totalSlots) {
  const ratio = live.availableSlots / totalSlots;
  return {
    predicted_available_slots: live.availableSlots,
    success_probability: Math.round(ratio * 100),
    estimated_search_time_minutes: Math.max(1, Math.round((1 - ratio) * 12)),
    confidence_score: 70,
    recommendation: ratio > 0.4 ? "Good chance of finding a spot" : "Consider alternate parking",
  };
}

module.exports = router;