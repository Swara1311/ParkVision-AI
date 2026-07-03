const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const LOCATIONS = [
  { name: "Phoenix MarketCity Parking", address: "Viman Nagar, Pune", city: "Pune", latitude: 18.5622, longitude: 73.9166, totalSlots: 420, fee: 40, isEvCharging: true, isAccessible: true },
  { name: "Amanora Mall Parking", address: "Hadapsar, Pune", city: "Pune", latitude: 18.5158, longitude: 73.9385, totalSlots: 350, fee: 30, isEvCharging: true, isAccessible: true },
  { name: "Pune Station Parking Plaza", address: "Pune Railway Station", city: "Pune", latitude: 18.5286, longitude: 73.8746, totalSlots: 260, fee: 25, isEvCharging: false, isAccessible: true },
  { name: "FC Road Public Parking", address: "Fergusson College Road, Pune", city: "Pune", latitude: 18.5236, longitude: 73.8412, totalSlots: 120, fee: 15, isEvCharging: false, isAccessible: false },
  { name: "Phoenix Palladium Parking", address: "Lower Parel, Mumbai", city: "Mumbai", latitude: 19.0002, longitude: 72.8296, totalSlots: 500, fee: 60, isEvCharging: true, isAccessible: true },
  { name: "BKC Smart Parking", address: "Bandra Kurla Complex, Mumbai", city: "Mumbai", latitude: 19.0663, longitude: 72.8686, totalSlots: 300, fee: 50, isEvCharging: true, isAccessible: true },
  { name: "CST Station Parking", address: "Chhatrapati Shivaji Terminus, Mumbai", city: "Mumbai", latitude: 18.9398, longitude: 72.8355, totalSlots: 180, fee: 35, isEvCharging: false, isAccessible: true },
  { name: "Connaught Place Parking", address: "Connaught Place, New Delhi", city: "Delhi", latitude: 28.6315, longitude: 77.2167, totalSlots: 400, fee: 30, isEvCharging: true, isAccessible: true },
  { name: "Select Citywalk Parking", address: "Saket, New Delhi", city: "Delhi", latitude: 28.5286, longitude: 77.2190, totalSlots: 450, fee: 40, isEvCharging: true, isAccessible: true },
  { name: "New Delhi Railway Station Parking", address: "Paharganj, New Delhi", city: "Delhi", latitude: 28.6427, longitude: 77.2197, totalSlots: 220, fee: 25, isEvCharging: false, isAccessible: true },
  { name: "UB City Mall Parking", address: "Vittal Mallya Road, Bangalore", city: "Bangalore", latitude: 12.9718, longitude: 77.5958, totalSlots: 380, fee: 45, isEvCharging: true, isAccessible: true },
  { name: "Orion Mall Parking", address: "Rajajinagar, Bangalore", city: "Bangalore", latitude: 13.0108, longitude: 77.5551, totalSlots: 500, fee: 30, isEvCharging: true, isAccessible: true },
  { name: "MG Road Public Parking", address: "MG Road, Bangalore", city: "Bangalore", latitude: 12.9757, longitude: 77.6069, totalSlots: 150, fee: 20, isEvCharging: false, isAccessible: false },
  { name: "Inorbit Mall Parking", address: "Madhapur, Hyderabad", city: "Hyderabad", latitude: 17.4326, longitude: 78.3873, totalSlots: 400, fee: 30, isEvCharging: true, isAccessible: true },
  { name: "Hitech City Parking Complex", address: "HITEC City, Hyderabad", city: "Hyderabad", latitude: 17.4483, longitude: 78.3915, totalSlots: 320, fee: 25, isEvCharging: true, isAccessible: true },
  { name: "Charminar Public Parking", address: "Charminar, Hyderabad", city: "Hyderabad", latitude: 17.3616, longitude: 78.4747, totalSlots: 140, fee: 15, isEvCharging: false, isAccessible: false },
];

async function main() {
  console.log("Seeding ParkVision AI database...");
  await prisma.predictionLog.deleteMany();
  await prisma.searchLog.deleteMany();
  await prisma.occupancySnapshot.deleteMany();
  await prisma.parkingLocation.deleteMany();

  for (const loc of LOCATIONS) {
    const occupied = Math.floor(loc.totalSlots * (0.3 + Math.random() * 0.5));
    await prisma.parkingLocation.create({
      data: {
        ...loc,
        openNow: true,
        occupancySnapshots: {
          create: {
            availableSlots: loc.totalSlots - occupied,
            occupiedSlots: occupied,
            dayOfWeek: new Date().getDay(),
            hourOfDay: new Date().getHours(),
          },
        },
      },
    });
  }
  console.log(`Seeded ${LOCATIONS.length} parking locations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });