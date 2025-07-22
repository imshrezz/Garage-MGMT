const Mechanic = require("../models/Mechanic");
const mongoose = require("mongoose");
// Get all mechanics
exports.getAllMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find().sort({ createdAt: -1 });
    res.json(mechanics);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch mechanics", error: err.message });
  }
};

exports.getMechanicById = async (req, res) => {
  try {
    const { id } = req.params;
    const mechanic = await Mechanic.findById(id);
    if (!mechanic) {
      return res.status(404).json({ message: "Mechanic not found" });
    }
    res.json(mechanic);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch mechanic", error: err.message });
  }
};

// Add new mechanic
exports.createMechanic = async (req, res) => {
  try {
    const { name, specialty } = req.body;
    const newMechanic = await Mechanic.create({ name, specialty });
    res.status(201).json(newMechanic);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create mechanic", error: err.message });
  }
};

// Delete mechanic
exports.deleteMechanic = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid mechanic ID format" });
  }

  try {
    const deleted = await Mechanic.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Mechanic not found" });
    }
    res.json({ message: "Mechanic deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete mechanic", error: err.message });
  }
};

// Update mechanic
exports.updateMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Mechanic.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Mechanic not found" });
    }
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update mechanic", error: err.message });
  }
};
