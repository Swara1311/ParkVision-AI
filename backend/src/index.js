require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { SimulationEngine } = require("./simulation");
const parkingRoutes = require("./routes/parking");
const dashboardRoutes = require("./routes/dashboard");
const analyticsRoutes = require("./routes/analytics");

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] } });

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const simulation = new SimulationEngine(io);
app.set("simulation", simulation);

app.get("/health", (req, res) => res.json({ status: "ok", service: "ParkVision AI Backend" }));
app.use("/api/parking", parkingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit("parking:snapshot", { locations: simulation.getSnapshot() });
  socket.on("disconnect", () => console.log(`Client disconnected: ${socket.id}`));
});

async function bootstrap() {
  await simulation.init();
  simulation.start();
  server.listen(PORT, () => {
    console.log(`ParkVision AI backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});