const MentorApplication = require("../models/MentorApplication");
const Mentor = require("../models/Mentor");
const User = require("../models/User");

// Student applies for mentor
exports.applyMentor = async (req, res) => {
  try {
    const existingApplication =
      await MentorApplication.findOne({
        userId: req.user.id,
        status: "pending",
      });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "You already have a pending application",
      });
    }

    const application =
      await MentorApplication.create({
        userId: req.user.id,
        name: req.body.name,
        department: req.body.department,
        year: req.body.year,
        skills: req.body.skills,
        bio: req.body.bio,
      });

    res.status(201).json(application);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin View Applications
exports.getApplications =
  async (req, res) => {
    try {
      const applications =
        await MentorApplication.find()
          .sort({
            createdAt: -1,
          });

      res.status(200).json(
        applications
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

// Approve Mentor
exports.approveMentor =
  async (req, res) => {
    try {
      const application =
        await MentorApplication.findById(
          req.params.id
        );

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found",
        });
      }

      application.status =
        "approved";

      await application.save();

      await User.findByIdAndUpdate(
        application.userId,
        {
          role: "mentor",
        }
      );

      const mentorExists =
        await Mentor.findOne({
          userId:
            application.userId,
        });

      if (!mentorExists) {
        await Mentor.create({
          userId:
            application.userId,
          name:
            application.name,
          skills:
            application.skills,
          year:
            application.year,
          bio:
            application.bio,
        });
      }

      res.status(200).json({
        message:
          "Mentor Approved Successfully",
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

// Reject Mentor
exports.rejectMentor =
  async (req, res) => {
    try {
      const application =
        await MentorApplication.findByIdAndUpdate(
          req.params.id,
          {
            status:
              "rejected",
          },
          {
            new: true,
          }
        );

      res.status(200).json(
        application
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };