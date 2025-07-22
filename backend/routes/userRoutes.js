const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMechanics,
} = require("../controllers/userController");

const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Multer middleware for profile pictures

// PUT: Change password
router.put("/change-password", authenticate, changePassword);
// GET: Fetch garage user profile
router.get("/users", authenticate, getUsers);
router.get("/mechanics", authenticate, getMechanics);
router.post("/create", authenticate, createUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);
router.get("/profile", authenticate, getProfile);
// PUT: Update garage user profile with optional profile picture upload
router.post(
  "/profile",
  authenticate,
  upload.single("profilePicture"),
  updateProfile
);

module.exports = router;
