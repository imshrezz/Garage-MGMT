const express = require("express");
const router = express.Router();
const {
  createGstBill,
  getAllGstBills,
  getGstBillById,
  updateGstBill,
  deleteGstBill,
  calculateGstBillTotal,
  generateGstBillPDF,
  getAllGstBillsCount,
} = require("../controllers/gstBillController");

router.post("/create", createGstBill);
router.get("/", getAllGstBills);
router.get("/count", getAllGstBillsCount);
router.get("/:id", getGstBillById);
router.put("/update/:id", updateGstBill);
router.delete("/delete/:id", deleteGstBill);
router.get("/:id/total", calculateGstBillTotal);
router.get("/:id/pdf", generateGstBillPDF);

module.exports = router;
