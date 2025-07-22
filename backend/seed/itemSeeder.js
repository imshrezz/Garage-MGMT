//Item seeder Tested
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Item = require("./models/Item");

dotenv.config();

// Sample items
const items = [
  {
    description: "Wheel Alignment",
    hsnCode: "998729",
    quantity: 1,
    rate: 800,
    gstPercent: 18,
  },
  {
    description: "Oil Filter",
    hsnCode: "84212300",
    quantity: 1,
    rate: 350,
    gstPercent: 12,
  },
  {
    description: "Car Interior Cleaning",
    hsnCode: "999799",
    quantity: 1,
    rate: 600,
    gstPercent: 5,
  },
  {
    description: "Headlight Bulb Replacement",
    hsnCode: "85392910",
    quantity: 1,
    rate: 150,
    gstPercent: 18,
  },
  {
    description: "Coolant Top-Up",
    hsnCode: "38200000",
    quantity: 1,
    rate: 250,
    gstPercent: 18,
  },
];

// Seed function
const seedItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Item.deleteMany();
    console.log("🗑️ Cleared existing items");

    const createdItems = await Item.insertMany(items);
    console.log(`🌱 Seeded ${createdItems.length} items`);
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding items:", err);
    process.exit(1);
  }
};

seedItems();
