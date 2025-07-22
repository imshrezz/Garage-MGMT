const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// GET all items
router.get("/", itemController.getAllItems);

// GET single item by ID
router.get("/:id", itemController.getItemById);

// POST create new item
router.post("/create", itemController.createItem);

// PUT update item
router.put("/update/:id", itemController.updateItem);

// DELETE item
router.delete("/delete/:id", itemController.deleteItem);

module.exports = router;
