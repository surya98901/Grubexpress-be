const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const { validateData } = require("../utils/validations");
const { sanitizeUser,setAuthCookie } = require("../utils/helperfunctions");

const router = express.Router();

router.post("/api/auth/signup", async (req, res) => {
  try {
    validateData(req);
    const { firstName, lastName, userName, phone, emailId, password } =
      req.body;
    const existinguser = await User.findOne({ emailId: emailId });

    if (existinguser) {
      throw new Error("User already exists with this email");
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      userName,
      phone,
      emailId,
      password: hashpassword,
    });
    await user.save();

    const token = await user.getJWT();
    setAuthCookie(res, token);
    const userData = sanitizeUser(user);
    res.status(201).json({ userData });
  }catch (err) {
  res.status(400).json({ message: err.message });
}
});
router.post("/api/auth/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("invalid credentials");
    }
    const isMatch = await user.validatePassword(password);
    if (isMatch) {
      const token = await user.getJWT();
      setAuthCookie(res, token)
      const userData = sanitizeUser(user);
      res.status(200).json({ message: "sign successfull", userData: userData });
    } else {
      throw new Error("invalid credentials");
    }
  }catch (err) {
  res.status(400).json({ message: err.message });
}
});
router.post("/api/auth/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.send("Logout successful");
  }catch (err) {
  res.status(400).json({ message: err.message });
}
});
module.exports = router;
