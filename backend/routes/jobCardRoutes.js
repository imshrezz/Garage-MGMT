
const express = require("express");
const router = express.Router();
const jobCardController = require("../controllers/jobCardController");

// POST /api/jobcards - Create a job card
router.post("/create", jobCardController.createJobCard);

// GET /api/jobcards - Get all job cards
router.get("/", jobCardController.getAllJobCards);

// GET /api/jobcards/:id - Get single job card
router.get("/:id", jobCardController.getJobCardById);

// PUT /api/jobcards/:id - Update job card
router.put("/update/:id", jobCardController.updateJobCard);

// PUT /api/jobcards/update-status/:id - Update job card status
router.put("/update-status/:id", jobCardController.updateJobCardStatus);

// DELETE /api/jobcards/:id - Delete job card
router.delete("/delete/:id", jobCardController.deleteJobCard);

// GET /api/jobcards/by-vehicle/:vehicleNumber - Get job card by vehicle number
router.get("/by-vehicle/:vehicleNumber", jobCardController.getJobCardByVehicle);

module.exports = router;
