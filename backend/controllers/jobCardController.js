const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const User = require("../models/User");

// Create a new JobCard
exports.createJobCard = async (req, res) => {
  try {
    const { customer, assignedMechanic } = req.body;

    // Validate customer and mechanic exist
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const mechanicExists = await User.findById(assignedMechanic);
    if (!mechanicExists) {
      return res.status(404).json({ error: "Mechanic not found" });
    }

    const jobCard = await JobCard.create(req.body);
    res.status(201).json(jobCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all JobCards
exports.getAllJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find()
      .populate("customer", "name mobile")
      .populate("assignedMechanic", "name specialty")
      .sort({ createdAt: -1 });

    res.json(jobCards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single JobCard by ID
exports.getJobCardById = async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate("customer", "name mobile")
      .populate("assignedMechanic", "name specialty");

    if (!jobCard) {
      return res.status(404).json({ error: "JobCard not found" });
    }

    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a JobCard
exports.updateJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!jobCard) {
      return res.status(404).json({ error: "JobCard not found" });
    }

    res.json(jobCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a JobCard
exports.deleteJobCard = async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndDelete(req.params.id);

    if (!jobCard) {
      return res.status(404).json({ error: "JobCard not found" });
    }

    res.json({ message: "JobCard deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update JobCard Status
exports.updateJobCardStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const jobCard = await JobCard.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!jobCard) {
      return res.status(404).json({ error: "JobCard not found" });
    }

    res.json(jobCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get JobCard by Vehicle Number
exports.getJobCardByVehicle = async (req, res) => {
  try {
    const jobCard = await JobCard.findOne({
      vehicleNumber: req.params.vehicleNumber,
      status: { $ne: "Closed" }, // Only get non-closed job cards
    })
      .populate("customer", "name mobile")
      .populate("assignedMechanic", "name specialty")
      .sort({ createdAt: -1 }); // Get the most recent one

    if (!jobCard) {
      return res
        .status(404)
        .json({ error: "No active job card found for this vehicle" });
    }

    res.json(jobCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
