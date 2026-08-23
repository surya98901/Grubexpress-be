const express = require("express");
const userAuth = require("../middlewares/auth");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validateData } = require("../utils/validations");
const { allowedFields } = require("../utils/constants");

const router = express.Router();

router.get("/api/user/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(401).send("Unauthorized, please login");
  }
});
router.patch("/api/user/profile/edit", userAuth, async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const updateFeilds = Object.keys(req.body).every((item) =>
      allowedFields.includes(item),
    );

    if (!updateFeilds) {
      throw new Error("invalid feild" );
    }
    if (data.addresses) {
      user.addresses = [...new Set([...user.addresses, ...data.addresses])];
      if (user.addresses.length > 10) {
        throw new Error("address limit reached");
      }
    }
    Object.keys(data).forEach((item) => {
      if (item !== "addresses") {
        user[item] = data[item];
      }
    });
    await user.save();
    res.send(`${user.firstName}, your profile has been updated successfully`);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
router.patch("/api/user/profile/edit/password", userAuth, async (req, res)=>{
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;
    try{
        const isMatch = await user.validatePassword(oldPassword);
        if(!isMatch){
            throw new Error("Invalid old password");
        }
        if(newPassword !== confirmPassword){
            throw new Error("New password and confirm password do not match");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.clearCookie("token");
        res.send(`${user.firstName}, your password has been updated successfully, sign in you out`);
    } catch (err) {
        res.status(400).send("Something went wrong " + err.message);
    }
})

module.exports = router;
