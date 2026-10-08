const express = require("express");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const { isRestaurant } = require("../middlewares/isRestaurant");
const { handleError } = require("../utils/helperfunctions");

const { restaurantsAllowedFields } = require("../utils/constants");
const router = express.Router();

router.get("/api/restaurants", async (req, res) => {
  try {
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    const { cusine, minRating, city, item } = req.query;

    const filter = {
      status: "open",
    };

    if (cusine) {
      filter.Cusine = {
        $regex: new RegExp(cusine.trim(), "i"),
      };
    }

    if (city) {
      filter["address.city"] = city.trim();
    }

    if (minRating && !isNaN(minRating)) {
      filter.rating = {
        $gte: Number(minRating),
      };
    }

    let restaurantsList;
    let totalRestaurants;

    if (item) {
      if (!mongoose.Types.ObjectId.isValid(item)) {
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

    totalRestaurants = await Restaurants.countDocuments(filter);

    restaurantsList = await Restaurants.find(filter)
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
    if (vegOnly) {
      filter.type = "veg";
    }
    if (category) {
      filter.category = category;
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
