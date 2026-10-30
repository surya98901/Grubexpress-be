const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const { validateData, validateLoginData } = require("../utils/validations");
const { sanitizeUser, setAuthCookie } = require("../utils/helperfunctions");

const router = express.Router();

router.post("/api/auth/signup", async (req, res) => {
  try {
    validateData(req);

    const allowedRoles = ["customer", "admin"];
    const userRole = req.query.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const { firstName, lastName, userName, phone, emailId, password } = req.body;
    const cleanEmail = emailId.trim().toLowerCase();
    const cleanUserName = userName.trim();

    const existingUser = await User.findOne({ emailId: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const existingUserName = await User.findOne({ userName: cleanUserName });
    if (existingUserName) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: cleanUserName,
      phone: phone ? phone.trim() : undefined,
      emailId: cleanEmail,
      password: hashpassword,
      role: userRole,
    });
    await user.save();

    const token = await user.getJWT();
    setAuthCookie(res, token);
    const userData = sanitizeUser(user);
    res.status(201).json({ userData });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    validateLoginData(req);

    const { emailId, password } = req.body;
    const cleanEmail = emailId.trim().toLowerCase();

    const user = await User.findOne({ emailId: cleanEmail });
    if (!user) {
      throw new Error("invalid credentials");
    }
    if (user.role !== req.query.role) {
      throw new Error("invalid role sign in attempt");
    }
    const isMatch = await user.validatePassword(password);
    if (isMatch) {
      const token = await user.getJWT();
      setAuthCookie(res, token);
      const userData = sanitizeUser(user);
      res.status(200).json({ message: "sign successfull", userData: userData });
    } else {
      throw new Error("invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/api/auth/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    res.send("Logout successful");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
