const express = require('express');
const router = express.Router();
const controller = require('../controllers/garageProfileController');
const multer = require('multer');

// Configure image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Create or update (POST: upsert)
router.post('/', upload.single('logo'), controller.saveGarageProfile);

// Get profile
router.get('/:userId', controller.getGarageProfile);

// Update profile
router.put('/:userId', upload.single('logo'), controller.updateGarageProfile);

// Delete profile
router.delete('/:userId', controller.deleteGarageProfile);

module.exports = router;
