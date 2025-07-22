// seeders/garageProfileSeeder.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const GarageProfile = require("../models/GarageProfile");
const { ObjectId } = mongoose.Types;
// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function seedGarageProfiles() {
  try {
    // Clear existing data (optional)
    await GarageProfile.deleteMany();

    // Sample seed data
    const seedData = [
      {
        logo: "https://example.com/logo1.png",
        garageName: "Harry Auto Garage",
        phone: "9876543210",
        email: "harrygarage@example.com",
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        footerMessage: "Thank you for choosing us!",
        enableGST: true,
        gstNumber: "27ABCDE1234F2Z5",
        gstRate: 18,
        userId: new ObjectId("6849626614ebb8efdc227c8b"), // Use ObjectId
      },
    ];

    await GarageProfile.insertMany(seedData);
    console.log("🚗 Garage profiles seeded successfully.");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedGarageProfiles();
