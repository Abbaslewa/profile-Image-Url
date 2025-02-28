const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

exports.registerUser = async (req, res) => {
  const { fullName, username, email, password, profileImageUrl } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const usernameRegx = /^[a-zA-Z0-9-]+$/;
  if (!usernameRegx.test(username)) {
    return res.status(400).json({
      message:
        "Invalid username. Only alphanumeric characters and hyphens are allowed. No spaces are permitted.",
    });
  }

  try {
    // Check for existing user by email and username
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username not available, try another one." });
    }

    // Hash password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword, // Save hashed password
      profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      id: user._id,
      user: {
        ...user.toObject(),
        totalPollsCreated: 0,
        totalPollsVoted: 0,
        totalPollsBookmarked: 0,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userInfo = {
      ...user.toObject(),
      totalPollsCreated: 0,
      totalPollsVoted: 0,
      totalPollsBookmarked: 0,
    };

    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user information", error: error.message });
  }
};
