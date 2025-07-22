const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemNonGstController');

// Bulk create items
router.post('/', controller.createItems);

// Get items by Non-GST billing ID
router.get('/:billingId', controller.getItemsByBilling);

// Optional: delete all items by billing ID
router.delete('/:billingId', controller.deleteItemsByBilling);

module.exports = router;
