const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getGarage,
  createGarage,
  updateGarage,
} = require("../controllers/garageController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const { authorize, authenticate } = require("../middleware/authMiddleware");

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

router.get("/", authenticate, getGarage);
router.post("/create", authenticate, authorize, createGarage);
router.put("/update", upload.single("logo"), updateGarage);

module.exports = router;
