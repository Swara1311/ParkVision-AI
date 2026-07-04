const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function targetOccupancyRatio(hour) {
  const curve = {
    0: 0.05, 1: 0.03, 2: 0.02, 3: 0.02, 4: 0.03, 5: 0.05,
    6: 0.10, 7: 0.18, 8: 0.30, 9: 0.42, 10: 0.55, 11: 0.65,
    12: 0.72, 13: 0.75, 14: 0.70, 15: 0.68, 16: 0.72, 17: 0.80,
    18: 0.88, 19: 0.92, 20: 0.90, 21: 0.78, 22: 0.55, 23: 0.25,
  };
  return curve[hour] ?? 0.5;
}

class SimulationEngine {
  constructor(io) {
    this.io = io;
    this.state = new Map();
    this.intervalMs = 5000;
    this.timer = null;
  }

  async init() {
    const locations = await prisma.parkingLocation.findMany();
    const now = new Date();
    const ratio = targetOccupancyRatio(now.getHours());

    for (const loc of locations) {
      const occupied = Math.round(loc.totalSlots * ratio);
      this.state.set(loc.id, {
        id: loc.id,
        name: loc.name,
        city: loc.city,
        totalSlots: loc.totalSlots,
        availableSlots: loc.totalSlots - occupied,
        occupiedSlots: occupied,
      });
    }
    console.log(`Simulation engine initialized with ${locations.length} locations.`);
  }

  tick() {
    const now = new Date();
    const ratio = targetOccupancyRatio(now.getHours());
    const updates = [];

    for (const [id, loc] of this.state.entries()) {
      const targetOccupied = loc.totalSlots * ratio;
      const currentOccupied = loc.occupiedSlots;
      const pull = (targetOccupied - currentOccupied) * 0.15;
      const noise = (Math.random() - 0.5) * loc.totalSlots * 0.08;
      let newOccupied = Math.round(currentOccupied + pull + noise);
      newOccupied = Math.max(0, Math.min(loc.totalSlots, newOccupied));

      loc.occupiedSlots = newOccupied;
      loc.availableSlots = loc.totalSlots - newOccupied;
      updates.push({ ...loc });
    }

    this.io.emit("parking:update", { timestamp: now.toISOString(), locations: updates });
    return updates;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    console.log(`Simulation engine running (interval: ${this.intervalMs}ms).`);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getSnapshot() {
    return Array.from(this.state.values());
  }

  getLocation(id) {
    return this.state.get(id) || null;
  }
}

module.exports = { SimulationEngine, targetOccupancyRatio };