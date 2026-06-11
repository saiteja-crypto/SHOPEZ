const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail, sendOTPEmail } = require("../utils/sendEmail");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: "Email already registered" });
    const user = await User.create({ name, email, password });
    sendWelcomeEmail(user).catch(err => console.error("Welcome email failed:", err.message));
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name)    user.name    = req.body.name;
    if (req.body.phone)   user.phone   = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      success: true,
      user: {
        _id: updated._id, name: updated.name, email: updated.email,
        role: updated.role, phone: updated.phone, address: updated.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "No account with that email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP     = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Non-blocking — respond immediately, send email in background
    sendOTPEmail(user, otp).catch(err => console.error("OTP email failed:", err.message));

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP:     otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.password             = newPassword;
    user.resetPasswordOTP     = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully! Please login." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };