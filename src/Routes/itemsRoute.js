const express = require("express");
const { handleError } = require("../utils/helperfunctions");
const FoodItem = require("../models/FoodItem");
const { escapeRegex } = require("../utils/validations");

const router = express.Router();

router.get("/api/itemsList", async (req, res) => {
  try {
    const list = await FoodItem.find({}).sort({ title: 1 });
    return res.json({ list });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/api/itemsList", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        message: "Invalid request body",
      });
    }

    const { name, image } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Item name is required",
      });
    }

    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({
        message: "Item name must be between 2 and 50 characters",
      });
    }

    if (image !== undefined && image !== null) {
      if (typeof image !== "string" || image.length > 500) {
        return res.status(400).json({
          message: "Invalid image URL format",
        });
      }
    }

    const existing = await FoodItem.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(cleanName)}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        message: "Food item with this title already exists",
      });
    }

    const item = new FoodItem({
      title: cleanName,
      ImageURL: image ? image.trim() : undefined,
    });
    await item.save();

    return res.status(201).json({ item });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;