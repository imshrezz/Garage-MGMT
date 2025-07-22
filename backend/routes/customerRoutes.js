const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerServiceHistory,
  sendServiceReminder,
  getCustomersDueForService,
  getCustomersWithJobCards
} = require("../controllers/customerController");

// Basic CRUD routes
router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/with-jobcards", getCustomersWithJobCards);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

// Service history and reminder routes
router.get("/:customerId/service-history", getCustomerServiceHistory);
router.post("/:customerId/send-reminder", sendServiceReminder);
router.get("/due-for-service", getCustomersDueForService);

module.exports = router;
