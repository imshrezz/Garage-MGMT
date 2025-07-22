// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnect = require("./config/database");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const sendReminders = require("./cron/sendReminder");
const expenseRoutes = require("./routes/expenseRoutes");
const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes");
const jobCardRoutes = require("./routes/jobCardRoutes");
const mechanicRoutes = require("./routes/mechanicRoutes");
const nonGstBillRoutes = require("./routes/nonGstBillRoutes");
const gstBillRoutes = require("./routes/gstBillRoutes");
const itemRoutes = require("./routes/itemRoutes");
const garageRoutes = require("./routes/garageRoutes");
const garageUserRoutes = require("./routes/userRoutes");
const mailRoutes = require("./routes/mailRoutes");
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(
  cors({
    origin: "http://localhost:5173", //  Your frontend origin
    credentials: true, //  Allow credentials
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(express.json());
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// DB Connection
dbConnect();
cron.schedule("0 9 * * *", () => {
  sendReminders(); // every day at 9:00 AM
});
// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/jobcards", jobCardRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/nongstbills", nonGstBillRoutes);
app.use("/api/gstbills", gstBillRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/garage", garageRoutes);
app.use("/api/garage-users", garageUserRoutes);
app.use("/api/mail", mailRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
