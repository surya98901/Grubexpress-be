const express = require("express");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/auth");
const { handleError,sanitizeUser } = require("../utils/helperfunctions");
const { allowedFields } = require("../utils/constants");

const router = express.Router();

router.get("/api/user/profile", userAuth, async (req, res) => {
  try {
    const user = sanitizeUser(req.user)
    return res.status(200).json({ data: user });
  } catch (err) {
    return handleError(res, err, 401);
  }
});
router.patch("/api/user/profile/edit", userAuth, async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    const updateFeilds = Object.keys(req.body).every(
      (item) =>
        allowedFields.includes(item) &&
        item !== "addresses" &&
        item !== "password",
    );

    if (!updateFeilds) {
      throw new Error("invalid feild");
    }

    Object.keys(data).forEach((item) => {
      user[item] = data[item];
    });
    await user.save();
    return res.status(200).json({
      message: `${user.firstName}, your profile has been updated successfully`,
      data: user,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/user/profile/edit/password", userAuth, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = req.user;
  try {
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new Error("All password fields are required");
    }
    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Invalid old password");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirm password do not match");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    res.clearCookie("token");
    return res.status(200).json({
      message: `${user.firstName}, your password has been updated successfully. You have been signed out.`,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.get("/api/user/address", userAuth, async (req, res) => {
  try {
    return res.status(200).json({
      message: "the user address list ",
      addressData: req.user.addresses,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.post("/api/user/address", userAuth, async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Address data is required");
    }
    if (user.addresses.length >= 10) {
      throw new Error("Address limit reached (maximum 10 allowed)");
    }
    if (user.addresses.length === 0) {
      data.isDefault = true;
    } else if (data.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }
    user.addresses.push(data);
    await user.save();
    return res.status(200).json({
      message: "the user address list ",
      addressData: user.addresses,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.get("/api/user/address/:id", userAuth, async (req, res) => {
  try {
    const address = req.user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }
    return res.status(200).json({
      message: "the user address",
      address: address,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/user/address/:id/edit", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }
    const { _id, isDefault, ...safeData } = req.body;
    address.set(safeData);
    await user.save();

    return res.status(200).json({
      message: "Address updated successfully",
      data: address,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
router.patch("/api/user/address/:id/default", userAuth, async (req, res) => {
  try {
    const queryId = req.params.id;
    const user = req.user;
    const address = user.addresses.id(queryId);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }
    user.addresses.forEach((add) => {
      add.isDefault = add._id.toString() === queryId;
    });
    await user.save();
    return res.status(200).json({
      message: "Address set default",
      data: address,
    });
  } catch (err) {
    return handleError(res, err);
  }
});
module.exports = router;
