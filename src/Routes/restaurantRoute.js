const express = require("express");
const mongoose = require("mongoose");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const { isRestaurant } = require("../middlewares/isRestaurant");
const { handleError } = require("../utils/helperfunctions");
const { restaurantsAllowedFields } = require("../utils/constants");
const {
  isValidObjectId,
  escapeRegex,
  validatePagination,
} = require("../utils/validations");

const router = express.Router();

router.get("/api/restaurants", async (req, res) => {
  try {
    const { limit, skip } = validatePagination(req.query);
    const { cusine, minRating, city, item } = req.query;

    const filter = {
      status: "open",
    };

    if (cusine && typeof cusine === "string" && cusine.trim()) {
      filter.Cusine = {
        $regex: new RegExp(escapeRegex(cusine.trim()), "i"),
      };
    }

    if (city && typeof city === "string" && city.trim()) {
      filter["address.city"] = {
        $regex: new RegExp(`^${escapeRegex(city.trim())}$`, "i"),
      };
    }

    if (minRating !== undefined && minRating !== null && minRating !== "") {
      const parsedRating = Number(minRating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return res.status(400).json({
          message: "minRating must be a number between 0 and 5",
        });
      }
      filter.rating = {
        $gte: parsedRating,
      };
    }

    if (item) {
      if (!isValidObjectId(item)) {
        return res.status(400).json({
          message: "Invalid food item ID",
        });
      }

      const restaurantIds = await MenuItem.distinct("restaurantId", {
        foodItemId: new mongoose.Types.ObjectId(item),
        available: true,
      });

      filter._id = {
        $in: restaurantIds,
      };
    }

    const totalRestaurants = await Restaurants.countDocuments(filter);

    const restaurantsList = await Restaurants.find(filter)
      .select(restaurantsAllowedFields)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Restaurants fetched successfully",
      restaurants: restaurantsList,
      pagination: {
        skip,
        openItems: restaurantsList.length,
        totalItems: totalRestaurants,
        limit,
        hasMore: skip + restaurantsList.length < totalRestaurants,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/api/restaurants/:id", isRestaurant, async (req, res) => {
  try {
    return res.status(200).json({
      message: ` the restaurant details`,
      restaurant: req.restaurant,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/api/restaurants/:id/menu", isRestaurant, async (req, res) => {
  try {
    const { vegOnly, category } = req.query;
    const filter = { restaurantId: req.params.id };

    if (vegOnly === "true" || vegOnly === true || vegOnly === "1") {
      filter.type = "veg";
    }

    if (category && typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }

    const menuList = await MenuItem.find(filter);
    return res.status(200).json({
      message: "Menu fetched successfully",
      data: menuList,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

module.exports = router;
