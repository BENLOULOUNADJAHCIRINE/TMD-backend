const express = require("express");
const router = express.Router();
const { dashboard, requests } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.get("/dashboard", protect, isAdmin, dashboard);
router.post("/requests", protect, isAdmin, requests);

module.exports = router;
