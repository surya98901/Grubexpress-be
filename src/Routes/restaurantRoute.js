const express = require("express");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const userAuth = require("../middlewares/auth");
const isRestaurant = require("../middlewares/isRestaurant");
const { handleError } = require("../utils/helperfunctions");
const mongoose = require("mongoose");
const {
  restaurantsAllowedFields,
  menuAllowedEditFields,
} = require("../utils/constants");
const router = express.Router();

router.get("/api/restaurants", userAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const skip = (page - 1) * limit;
    const { cusine, minRating } = req.query;
    const filter = {
      status: "open",
    };
    if (cusine) {
      filter.Cusine = {
        $regex: new RegExp(cusine.trim(), "i"),
      };
    }
    if (minRating && !isNaN(minRating)) {
      filter.rating = {
        $gte: Number(minRating),
      };
    }
    const totalRestaurants = await Restaurants.countDocuments(filter);
    const restaurantsList = await Restaurants.find(filter)
      .select(restaurantsAllowedFields)
      .skip(skip)
      .limit(limit);
    return res.status(200).json({
      message: "Recommendations fetched successfully",
      data: restaurantsList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRestaurants / limit),
        openItems: restaurantsList.length,
        totalItems: totalRestaurants,
        limit,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/api/restaurants/create", userAuth, async (req, res) => {
  try {
    const { Name, Description, Cusine, FSSAIID, status, address } = req.body;
    if (req.user.role != "admin") {
      throw new Error("Please login as a restaurant admin");
    }
    const updateFields = Object.keys(req.body).every((item) =>
      restaurantsAllowedFields.includes(item),
    );
    if (!updateFields) {
      throw new Error("Invalid field");
    }
    const restaurant = new Restaurants({
      Name,
      Description,
      Cusine,
      FSSAIID,
      status,
      address,
      AdminId: req.user._id,
    });
    await restaurant.save();
    return res.status(201).json({
      message: `${req.user.firstName}, you have successfully created your restaurant.`,
      data: restaurant,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/api/restaurants/:id", userAuth, isRestaurant, async (req, res) => {
  try {
    return res.status(200).json({
      message: `${req.user.firstName}, the restaurant details`,
      data: req.restaurant,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.patch(
  "/api/restaurants/:id/edit",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const restaurant = req.restaurant;
      const data = req.body;

      if (restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this restaurant");
      }

      const updateFields = Object.keys(req.body).every(
        (item) => restaurantsAllowedFields.includes(item) && item != "status",
      );

      if (!updateFields) {
        throw new Error("Invalid field");
      }

      Object.keys(data).forEach((item) => {
        restaurant[item] = data[item];
      });

      await restaurant.save();

      return res.status(200).json({
        message: `${req.user.firstName}, your restaurant has been updated successfully`,
        data: restaurant,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.patch(
  "/api/restaurants/:id/status",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const setStatus = req.body.status;
      const restaurant = req.restaurant;

      if (restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this restaurant");
      }

      if (!["open", "close"].includes(setStatus)) {
        throw new Error("Invalid status. It can be either open or close");
      }

      if (restaurant.status.toLowerCase() === setStatus.toLowerCase()) {
        return res.status(200).json({
          message: `${req.user.firstName}, your restaurant is already ${setStatus}`,
          data: restaurant.status,
        });
      }

      restaurant.status = setStatus;

      await restaurant.save();

      return res.status(200).json({
        message: `${req.user.firstName}, your restaurant has been ${setStatus}ed successfully`,
        data: restaurant.status,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.patch(
  "/api/restaurants/:id/active",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const status = req.body.Active;

      if (typeof status !== "boolean") {
        throw new Error("Active must be boolean");
      }

      const restaurant = req.restaurant;

      if (restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this restaurant");
      }

      if (restaurant.Active === status) {
        return res.status(200).json({
          message: `${req.user.firstName}, your restaurant is already ${status ? "active" : "inactive"}`,
          data: restaurant.Active,
        });
      }

      restaurant.Active = status;

      // If restaurant is deactivated,
      // automatically close it.
      if (restaurant.Active === false) {
        restaurant.status = "close";
      }

      await restaurant.save();

      return res.status(200).json({
        message: `${req.user.firstName}, your restaurant active status has been changed successfully`,
        data: restaurant.Active,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.get(
  "/api/restaurants/:id/menu",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const {vegOnly, category} = req.query;
      const filter = {restaurantId: req.params.id,}
      if(vegOnly){
        filter.type = "veg";
      }
      if(category){
        filter.category = category;
      }
      const menuList = await MenuItem.find(
        filter
      );
      return res.status(200).json({
        message: "Menu fetched successfully",
        data: menuList,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.post(
  "/api/restaurants/:id/menu/add",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      if (req.user.role != "admin") {
        return res.status(401).json({
          message: "Unauthorized account. You must be a restaurant admin",
        });
      }

      const restaurant = req.restaurant;

      if (restaurant.AdminId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to modify this restaurant",
        });
      }

      const {
        name,
        description,
        serves,
        price,
        cusine,
        rating,
        category,
        type,
      } = req.body;

      const menuItem = new MenuItem({
        restaurantId: req.params.id,
        name,
        description,
        serves,
        price,
        cusine,
        rating,
        category,
        type,
      });

      await menuItem.save();

      const menuList = await MenuItem.find({
        restaurantId: req.params.id,
      });

      return res.status(201).json({
        message: `${req.user.firstName}, you have successfully added ${menuItem.name} to the menu.`,
        data: menuList,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.patch(
  "/api/restaurants/:id/menu/:menuItemId/edit",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const data = req.body;
      const restaurant = req.restaurant;
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      if (restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this menu");
      }

      const updateFields = Object.keys(req.body).every((item) =>
        menuAllowedEditFields.includes(item),
      );

      if (!updateFields) {
        throw new Error("Invalid field");
      }
      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });
      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }
      Object.keys(data).forEach((item) => {
        menuItem[item] = data[item];
      });

      await menuItem.save();
      return res.status(200).json({
        message: "Menu fetched successfully",
        data: menuItem,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);
router.patch(
  "/api/restaurants/:id/menu/:menuItemId/available",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }
      if (typeof req.body.available !== "boolean") {
        throw new Error("Active must be boolean");
      }
      if (req.restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this menu");
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });
      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }
      if (menuItem.available == req.body.available) {
        return res.status(200).json({
          message: "no changes made ",
          data: menuItem,
        });
      }
      menuItem.available = req.body.available;

      await menuItem.save();
      return res.status(200).json({
        message: "changed the availabilty of the item",
        data: menuItem,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);
router.delete(
  "/api/restaurants/:id/menu/:menuItemId",
  userAuth,
  isRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }
      if (req.restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this menu");
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });
      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found",
        });
      }
      await menuItem.deleteOne();
      return res.status(200).json({
        message: "done deletion",
        data: menuItem,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

module.exports = router;
