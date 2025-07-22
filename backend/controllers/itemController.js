const Item = require("../models/Item");

// Get all items
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ description: 1 });
    res.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, item });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { description, hsnCode, rate } = req.body;

    // Validate required fields
    if (!description || !hsnCode || !rate) {
      return res.status(400).json({
        success: false,
        message: "Description, HSN code, and rate are required",
      });
    }

    // Check for existing item with same description and HSN code
    const existingItem = await Item.findOne({
      $or: [
        { description: { $regex: new RegExp(`^${description}$`, 'i') } },
        { hsnCode: { $regex: new RegExp(`^${hsnCode}$`, 'i') } }
      ]
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "An item with this description or HSN code already exists",
      });
    }

    const item = new Item({
      description,
      hsnCode,
      rate,
      quantity: 1, // Default quantity
    });

    const savedItem = await item.save();
    res.status(201).json({ success: true, item: savedItem });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { description, hsnCode, rate } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { description, hsnCode, rate },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
