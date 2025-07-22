const ItemNonGST = require('../models/ItemNonGST');

// Create items (bulk) for Non-GST billing
exports.createItems = async (req, res) => {
  try {
    const { nonGstBillingId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const itemsToCreate = items.map(item => ({
      ...item,
      nonGstBillingId
    }));

    const createdItems = await ItemNonGST.insertMany(itemsToCreate);
    res.status(201).json(createdItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create items' });
  }
};

// Get all items by Non-GST billing ID
exports.getItemsByBilling = async (req, res) => {
  try {
    const { billingId } = req.params;
    const items = await ItemNonGST.find({ nonGstBillingId: billingId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Optional: delete items for a billing
exports.deleteItemsByBilling = async (req, res) => {
  try {
    const { billingId } = req.params;
    await ItemNonGST.deleteMany({ nonGstBillingId: billingId });
    res.json({ message: 'Items deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete items' });
  }
};
