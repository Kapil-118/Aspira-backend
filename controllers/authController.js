const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// REGISTER
exports.register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name.trim();
    email = email.toLowerCase().trim();

    if (name.length < 3) {
      return res.status(400).json({
        message: "Name must be at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration Successful",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// PROFILE
exports.getProfile = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const {
      department = "",
      year = "",
      bio = "",
      linkedin = "",
      github = "",
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        department,
        year,
        bio,
        linkedin,
        github,
      },
      {
        new: true,
      },
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPLOAD PROFILE PHOTO
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profilePhoto = req.file.path;

    await user.save();

    res.status(200).json({
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
