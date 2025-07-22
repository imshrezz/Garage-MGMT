// seeder.js
// tested working fine
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const seedData = [
  {
    fullName: "Harish Chopkar",
    email: "harish@gmail.com",
    password: "123456",
    phone: "7387990061",
    role: "admin",
  },
  {
    fullName: "Nikhil Thakhare",
    email: "nikhl@gmail.com",
    password: "123456",
    phone: "7387990062",
    role: "user",
  },
  {
    fullName: "Ashish Thakur",
    email: "ashish@gmail.com",
    password: "123456",
    phone: "7387990063",
    role: "mechanic",
  },
];

// Connect to DB and seed
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected for seeding");

    // Clear existing data
    await User.deleteMany({});
    console.log("Old data removed");

    // Insert seed data
    await User.insertMany(seedData);
    console.log("Seeding complete");

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    mongoose.disconnect();
  });
