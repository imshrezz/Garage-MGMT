const Permission = require('../models/Permission');

// Create a new permission
exports.createPermission = async (req, res) => {
  try {
    const { name, is_active, description } = req.body;
    const permission = new Permission({ name, is_active, description });
    await permission.save();
    res.status(201).json(permission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all permissions
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get permission by ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json(permission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a permission
exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json(permission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a permission
exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json({ message: 'Permission deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
