const express = require("express");
const {isAdminRestaurant} = require("../middlewares/isRestaurant");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const { adminAuth } = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const {
  menuAllowedEditFields,
  orderAllowedStatuses,
  allowedTransitions,
} = require("../utils/constants");

const router = express.Router();

router.get("/api/admin/restaurants", adminAuth, async (req, res) => {
  try {
    const restaurants = await Restaurants.find({ AdminId: req.user._id });

    return res.status(200).json({
      success: true,
      message: "List of restaurants",
      data: restaurants,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post(
  "/api/admin/restaurants/:id/menu/add",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
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

      if (!name || !description || !serves || price === undefined || !category || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required menu item fields",
        });
      }

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
        success: true,
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
  isAdminRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID format",
        });
      }

      const updateFields = Object.keys(req.body).every((item) =>
        menuAllowedEditFields.includes(item),
      );

      if (!updateFields) {
        return res.status(400).json({
          success: false,
          message: "One or more fields cannot be updated",
        });
      }

      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields provided for update",
        });
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      Object.keys(req.body).forEach((item) => {
        menuItem[item] = req.body[item];
      });

      await menuItem.save();

      return res.status(200).json({
        success: true,
        message: "Menu item updated successfully",
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
  isAdminRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID format",
        });
      }

      if (typeof req.body.available !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Available must be a boolean",
        });
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      if (menuItem.available === req.body.available) {
        return res.status(200).json({
          success: true,
          message: "No changes made",
          data: menuItem,
        });
      }

      menuItem.available = req.body.available;

      await menuItem.save();

      return res.status(200).json({
        success: true,
        message: "Menu item availability updated successfully",
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
  isAdminRestaurant,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID format",
        });
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.menuItemId,
        restaurantId: req.params.id,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      await menuItem.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Menu item deleted successfully",
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
  isAdminRestaurant,
  async (req, res) => {
    try {
      const { status } = req.query;

      if (status && !orderAllowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const filter = {
        restaurantId: req.params.id,
      };

      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter);

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
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
  isAdminRestaurant,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(req.params.Oid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID format",
        });
      }

      if (!orderAllowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findOne({
        _id: req.params.Oid,
        restaurantId: req.params.id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const payment = await Payment.findOne({
        orderId: order._id,
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found for this order",
        });
      }

      if (payment.paymentStatus !== "PAID") {
        return res.status(400).json({
          success: false,
          message: `Order cannot be updated because payment status is ${payment.paymentStatus}`,
        });
      }

      if (!allowedTransitions[order.orderStatus]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change order from ${order.orderStatus} to ${status}`,
        });
      }

      order.orderStatus = status;

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order.orderStatus,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

module.exports = router;