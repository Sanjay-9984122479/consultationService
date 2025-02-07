const User = require("../models/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  
  try {
    const {  email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.body.id).select("-password")
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update User Profile
const updateUser = async (req, res) => {
  try {
    const { password, ...otherUpdates } = req.body;

    // If a new password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      otherUpdates.password = hashedPassword;
    }

    // Update the user document
    const updatedUser = await User.updateOne({id:req.body.id},
      {$set:{...otherUpdates}},
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findById(req.body.id)
    res.status(200).json({ message: 'User updated successfully', user: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { registerUser, loginUser, getUserProfile,updateUser };
