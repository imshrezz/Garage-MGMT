//
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the response to include the full profile picture URL
    const userData = user.toObject();
    if (userData.profilePicture) {
      userData.profilePicture = `/uploads/${path.basename(
        userData.profilePicture
      )}`;
    }

    res.json(userData);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  console.log("request", req.body);
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;

    if (req.file) {
      // Store the relative path to the file
      const relativePath = path.relative(
        path.join(__dirname, ".."),
        req.file.path
      );
      user.profilePicture = relativePath;
    }

    const updatedUser = await user.save();

    // Format the response to include the full profile picture URL
    const userData = updatedUser.toObject();
    if (userData.profilePicture) {
      userData.profilePicture = `/uploads/${path.basename(
        userData.profilePicture
      )}`;
    }

    res.json({
      id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      profilePicture: userData.profilePicture,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { currentPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
};

// Get all customers
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password"
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//getall mechanics
const getMechanics = async (req, res) => {
  try {
    const users = await User.find({ role: "mechanic" });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new customer
const createUser = async (req, res) => {
  try {
    const { fullName, phone, email, password, role } = req.body;

    const user = new User({
      fullName,
      phone,
      email,
      password,
      role,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message || "Error creating user." });
  }
};

// Update customer by ID (including vehicles)
const updateCustomer = async (req, res) => {
  try {
    const { name, mobile, alternateNumber, email, address, vehicles } =
      req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        mobile,
        alternateNumber,
        email,
        address,
        vehicles,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Update customer by ID (including vehicles)
const updateUser = async (req, res) => {
  try {
    const { fullName, phone, email, password, role } = req.body;

    const updatedCustomer = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        phone,
        email,
        password,
        role,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete customer by ID
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMechanics,
};
