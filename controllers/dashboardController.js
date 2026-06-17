const User = require("../models/User");
const Mentor = require("../models/Mentor");
const LostFound = require("../models/LostFound");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalMentors = await Mentor.countDocuments();

    const totalLostItems = await LostFound.countDocuments({
      type: "lost",
    });

    const totalFoundItems = await LostFound.countDocuments({
      type: "found",
    });

    res.status(200).json({
      totalUsers,
      totalMentors,
      totalLostItems,
      totalFoundItems,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};