const express = require('express');
const router = express.Router();
const controller = require('../controllers/nonGSTBillingController');

router.post('/', controller.createBilling);
router.get('/', controller.getBillings);
router.put('/:id', controller.updateBilling);     // Update billing by ID
router.delete('/:id', controller.deleteBilling); // Delete billing by ID

module.exports = router;
