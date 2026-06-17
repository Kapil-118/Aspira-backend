const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");

const sendOtpEmail = async (email, otp) => {
  await sendEmail(
    email,
    "Welcome to Aspira - OTP Verification",
    `
    <div style="
      max-width:600px;
      margin:auto;
      background:#0f172a;
      padding:40px;
      border-radius:15px;
      color:white;
      font-family:Arial,sans-serif;
    ">
    
      <div style="text-align:center;">
        <h1 style="
          color:#22d3ee;
          margin-bottom:10px;
        ">
          Aspira
        </h1>

        <p style="
          color:#94a3b8;
          font-size:16px;
        ">
          Connect • Learn • Grow
        </p>
      </div>

      <hr style="
        border:none;
        border-top:1px solid #334155;
        margin:25px 0;
      ">

      <h2>Hello 👋</h2>

      <p>Please use the OTP below:</p>

      <div style="
        background:#1e293b;
        text-align:center;
        padding:25px;
        border-radius:12px;
        margin:30px 0;
      ">
        <h1 style="
          color:#22d3ee;
          letter-spacing:8px;
          font-size:42px;
          margin:0;
        ">
          ${otp}
        </h1>
      </div>

      <p>
        OTP expires in 5 minutes.
      </p>

    </div>
    `
  );
};

// REGISTER OTP
exports.sendRegisterOtp = async (req, res) => {
  try {
    let { email } = req.body;

    email = email.toLowerCase().trim();

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Account already exists with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP Sent Successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// FORGOT PASSWORD OTP
exports.sendForgotPasswordOtp =
  async (req, res) => {
    try {
      let { email } = req.body;

      email =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "No account found with this email",
        });
      }

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

      await Otp.deleteMany({
        email,
      });

      await Otp.create({
        email,
        otp,
        expiresAt: new Date(
          Date.now() +
            5 * 60 * 1000
        ),
      });

      await sendOtpEmail(
        email,
        otp
      );

      res.status(200).json({
        message:
          "OTP Sent Successfully",
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// VERIFY OTP
exports.verifyOtp = async (
  req,
  res
) => {
  try {
    let { email, otp } =
      req.body;

    email =
      email.toLowerCase().trim();

    const otpRecord =
      await Otp.findOne({
        email,
        otp,
      });

    if (!otpRecord) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    if (
      new Date() >
      otpRecord.expiresAt
    ) {
      return res.status(400).json({
        message:
          "OTP Expired",
      });
    }

    await Otp.deleteMany({
      email,
    });

    res.status(200).json({
      message:
        "OTP Verified",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};