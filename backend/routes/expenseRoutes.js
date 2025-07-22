const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/create', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/update/:id', expenseController.updateExpense);
router.delete('/delete/:id', expenseController.deleteExpense);

module.exports = router;
