const express = require("express");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/auth");
const User = require("../models/userModel");
const { validateData } = require("../utils/validations");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    validateData(req);
    const { firstName,  lastName,userName, phone, emailId, password} = req.body;
    const existinguser = await User.findOne({ emailId: emailId });

    if (existinguser) {
      throw new Error("User already exists with this email");
    }

    const haspassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, userName, phone, emailId, password: haspassword });
    await user.save();

    const token = await user.getJWT();
    res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.status(201).json({ user});
  } 
  catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/login", async (req, res) => {
    try{
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if(!user){
             throw new Error("invalid credentials");
        }
        const isMatch = await user.validatePassword(password);
        if(  isMatch){
          const token = await user.getJWT();
          res.cookie("token", token, {httpOnly: true, maxAge: 3600000});
          res.send("Login successful");
        }else{
           throw new Error("invalid credentials");
        }
    }catch(err){
        res.status(400).send("Something went wrong " + err.message);
    }
});
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.send("Logout successful");
    } catch (err) {
    res.status(400).send("Something went wrong " + err.message);
  }
});
module.exports = router;