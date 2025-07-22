const express = require("express");
const router = express.Router();
const {
  createNonGstBill,
  getAllNonGstBills,
  getNonGstBillById,
  updateNonGstBill,
  deleteNonGstBill,
  calculateNonGstBillTotal,
  generateNonGstBillPDF,
  getAllNonGstBillsCount,
} = require("../controllers/nonGstBillController");

// Create a new non-GST bill
router.post("/", createNonGstBill);

// Get all non-GST bills
router.get("/", getAllNonGstBills);

// Get count of non-GST bills
router.get("/count", getAllNonGstBillsCount);

// Get a single non-GST bill by ID
router.get("/:id", getNonGstBillById);

// Update a non-GST bill
router.put("/:id", updateNonGstBill);

// Delete a non-GST bill
router.delete("/:id", deleteNonGstBill);

// Calculate total amount for a non-GST bill
router.get("/:id/total", calculateNonGstBillTotal);

// Generate PDF for a non-GST bill
router.get("/:id/pdf", generateNonGstBillPDF);

module.exports = router;
