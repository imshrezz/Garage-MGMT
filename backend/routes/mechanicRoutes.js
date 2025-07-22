const express = require("express");
const router = express.Router();
const mechanicController = require("../controllers/mechanicController");

router.get("/", mechanicController.getAllMechanics);
router.get("/:id", mechanicController.getMechanicById);
router.post("/create", mechanicController.createMechanic);
router.put("/put/:id", mechanicController.updateMechanic);
router.delete("/delete/:id", mechanicController.deleteMechanic);

module.exports = router;
