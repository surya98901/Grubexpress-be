const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/userModel");
const { userAuth } = require("../middlewares/auth");
const { handleError, sanitizeUser } = require("../utils/helperfunctions");
const { userAllowedFields, addressAllowedFields } = require("../utils/constants");
const {
  isValidObjectId,
  validatePasswordChange,
  validateAddressData,
} = require("../utils/validations");

const router = express.Router();

router.get("/api/user/profile", userAuth, async (req, res) => {
  try {
    const user = sanitizeUser(req.user);
    return res.status(200).json({ userData: user });
  } catch (err) {
    return handleError(res, err, 401);
  }
});

router.patch("/api/user/profile/edit", userAuth, async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
      throw new Error("No fields provided for update");
    }

    const forbiddenKeys = ["_id", "role", "password", "emailId", "createdAt", "updatedAt", "__v", "__proto__", "constructor"];
    const keys = Object.keys(data);

    for (const key of keys) {
      if (forbiddenKeys.includes(key) || !userAllowedFields.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
    }

    if (data.firstName !== undefined) {
      if (typeof data.firstName !== "string" || data.firstName.trim().length < 2 || data.firstName.trim().length > 20) {
        throw new Error("First name must be between 2 and 20 characters");
      }
      if (!validator.isAlpha(data.firstName.replace(/\s/g, ""))) {
        throw new Error("First name should only contain alphabets and spaces");
      }
      user.firstName = data.firstName.trim();
    }

    if (data.lastName !== undefined) {
      if (typeof data.lastName !== "string" || data.lastName.trim().length < 1 || data.lastName.trim().length > 20) {
        throw new Error("Last name must be between 1 and 20 characters");
      }
      if (!validator.isAlpha(data.lastName.trim())) {
        throw new Error("Last name should only contain alphabets");
      }
      user.lastName = data.lastName.trim();
    }

    if (data.userName !== undefined) {
      const cleanUserName = data.userName.trim();
      if (typeof data.userName !== "string" || cleanUserName.length < 3 || cleanUserName.length > 20) {
        throw new Error("Username must be between 3 and 20 characters");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUserName)) {
        throw new Error("Username can only contain alphanumeric characters and underscores");
      }
      const existingUser = await User.findOne({ userName: cleanUserName, _id: { $ne: user._id } });
      if (existingUser) {
        throw new Error("Username is already taken");
      }
      user.userName = cleanUserName;
    }

    if (data.phone !== undefined) {
      if (data.phone !== null && data.phone !== "") {
        if (typeof data.phone !== "string" || !validator.isMobilePhone(data.phone.trim())) {
          throw new Error("Invalid phone number format");
        }
        user.phone = data.phone.trim();
      } else {
        user.phone = undefined;
      }
    }

    if (data.addresses !== undefined) {
      if (!Array.isArray(data.addresses)) {
        throw new Error("Addresses must be an array");
      }
      if (data.addresses.length > 10) {
        throw new Error("Address limit reached (maximum 10 allowed)");
      }
      data.addresses.forEach((addr) => validateAddressData(addr));
      user.addresses = data.addresses;
    }

    await user.save();
    const userData = sanitizeUser(user);
    return res.status(200).json({
      message: `${user.firstName}, your profile has been updated successfully`,
      data: userData,
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

    validatePasswordChange(oldPassword, newPassword, confirmPassword);

    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Invalid old password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

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
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      throw new Error("Address data is required");
    }
    if (user.addresses.length >= 10) {
      throw new Error("Address limit reached (maximum 10 allowed)");
    }

    validateAddressData(data, false);

    const newAddress = {
      label: data.label || "Home",
      addressLine: data.addressLine.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      latitude: data.latitude !== undefined ? Number(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? Number(data.longitude) : undefined,
      isDefault: false,
    };

    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    } else if (data.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid address ID format",
      });
    }

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid address ID format",
      });
    }

    if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No fields provided for update",
      });
    }

    const user = req.user;
    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    validateAddressData(req.body, true);

    const { _id, isDefault, ...safeData } = req.body;
    if (safeData.addressLine) safeData.addressLine = safeData.addressLine.trim();
    if (safeData.city) safeData.city = safeData.city.trim();
    if (safeData.state) safeData.state = safeData.state.trim();
    if (safeData.pincode) safeData.pincode = safeData.pincode.trim();

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
    if (!isValidObjectId(queryId)) {
      return res.status(400).json({
        message: "Invalid address ID format",
      });
    }

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
