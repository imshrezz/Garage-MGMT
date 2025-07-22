const mongoose = require('mongoose');
const NonGSTBilling = require('../models/NonGSTBilling');

require('dotenv').config();

async function seedNonGSTBillings() {
  try {
    // Connect without deprecated options
    await mongoose.connect(process.env.MONGO_URI);

    const sampleData = [
      {
        user_id: new mongoose.Types.ObjectId('682ea9398b95d7fe381819c6'),
        vehicle_id: new mongoose.Types.ObjectId('682ebc885d05e3f4acfcaa43'),
        billingNumber: 'NGST-001',
        billingDate: new Date('2025-05-26'),
        total: 1700,
        additionalNotes: 'Cash payment received',
      }
    ];

    await NonGSTBilling.insertMany(sampleData);
    console.log('Non-GST Billing data seeded successfully');
  } catch (err) {
    console.error('Error seeding Non-GST Billing data:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seedNonGSTBillings();
