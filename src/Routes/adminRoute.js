

const express = require("express");
const isRestaurant = require("../middlewares/isRestaurant");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel")
const { adminAuth} = require("../middlewares/auth");
const { handleError, sanitizeUser } = require("../utils/helperfunctions");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const {

  menuAllowedEditFields,
  orderAllowedEditFields,
  allowedTransitions,
} = require("../utils/constants");


const router = express.Router();


router.get("/api/admin/restaurants", adminAuth, async (req, res) => {
  try{
    const user= req.user;
    if(user.role !== "admin"){
      return res.status(403).json({
        message: "Access denied. Only admins can access this route.",
      });
    }
    const restaurants = await Restaurants.find({AdminId : user._id});
    return res.status(200).json({
      message: "List of restaurants",
      data: restaurants,
    });
  }catch(err){
    return handleError(res, err);
  }
});

router.post(
  "/api/admin/restaurants/:id/menu/add",
  adminAuth,
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
  "/api/admin/restaurants/:id/menu/:menuItemId/edit",
  adminAuth,
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
        throw new Error("Invalid field", updateFields);
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
  "/api/admin/restaurants/:id/menu/:menuItemId/available",
  adminAuth,
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
  "/api/admin/restaurants/:id/menu/:menuItemId",
  adminAuth,
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
router.get(
  "/api/admin/restaurants/:id/orders",
  adminAuth,
  isRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }
      if (req.restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to veiw orders");
      }
      const orders = await Order.find({
        restaurantId: req.params.id,
        orderStatus: "PLACED",
      });
      if (!orders) {
        return res.status(404).json({
          message: "No order list empty order",
        });
      }
      return res.status(200).json({
        message: "the oders",
        data: orders,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.patch(
  "/api/admin/restaurants/:id/orders/:Oid",
  adminAuth,
  isRestaurant,
  async (req, res) => {
    try {
      const status = req.body.status;
      if (
        !mongoose.Types.ObjectId.isValid(req.params.id) ||
        !mongoose.Types.ObjectId.isValid(req.params.Oid)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }
      if (req.restaurant.AdminId.toString() != req.user._id.toString()) {
        throw new Error("You are not authorized to modify this orders");
      }
      if (!orderAllowedEditFields.includes(status)) {
        throw new Error("You are not authorized to modify this menu");
      }
      const orders = await Order.findOne({
        _id: req.params.Oid,
        restaurantId: req.params.id,
        paymentStatus: "PAID",
      });

      if (!orders || orders.length === 0) {
        return res.status(403).json({
          message: "No order list empty order",
        });
      }
      if (!allowedTransitions[orders.orderStatus].includes(status)) {
        return res.status(400).json({
          message: `Cannot change order from ${orders.orderStatus} to ${status}`,
        });
      }
      orders.orderStatus = status;
      await orders.save();
      return res.status(200).json({
        message: "the oders",
        data: orders.orderStatus,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);


module.exports = router;