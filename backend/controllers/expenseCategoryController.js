const ExpenseCategory = require('../models/ExpenseCategory');

// Get all categories
exports.getAll = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one category by id
exports.getById = async (req, res) => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new category
exports.create = async (req, res) => {
  try {
    const { name, value, color } = req.body;
    const category = new ExpenseCategory({ name, value, color });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update category
exports.update = async (req, res) => {
  try {
    const { name, value, color } = req.body;
    const category = await ExpenseCategory.findByIdAndUpdate(
      req.params.id,
      { name, value, color },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete category
exports.delete = async (req, res) => {
  try {
    const category = await ExpenseCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
