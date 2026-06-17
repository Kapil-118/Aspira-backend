const Mentor = require("../models/Mentor");

exports.createMentor = async (req, res) => {
  try {
    const mentor = await Mentor.create({
      userId: req.user.id,
      name: req.body.name,
      skills: req.body.skills,
      year: req.body.year,
      bio: req.body.bio,
    });

    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().populate({
      path: "userId",
      select: "profilePhoto email department linkedin github year bio",
    });

    res.json(mentors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.searchMentors = async (req, res) => {
  try {
    const skill = req.query.skill;

    const mentors = await Mentor.find({
      skills: skill,
    }).populate({
      path: "userId",
      select: "profilePhoto email department linkedin github year bio",
    });

    res.json(mentors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
