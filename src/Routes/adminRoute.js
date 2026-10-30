const express = require("express");
const { isAdminRestaurant } = require("../middlewares/isRestaurant");
const Restaurants = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const Reservation = require("../models/reservationModel");
const { adminAuth } = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const FoodItem = require("../models/FoodItem");
const {
  menuAllowedEditFields,
  orderAllowedStatuses,
  allowedTransitions,
  reservationAllowedStatuses,
} = require("../utils/constants");
const {
  isValidObjectId,
  validateRestaurantCreate,
  validateMenuItemAdd,
} = require("../utils/validations");

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

router.post("/api/admin/restaurants", adminAuth, async (req, res) => {
  try {
    validateRestaurantCreate(req.body);

    const { name, description, address, cusine, FSSAID, closesAt } = req.body;

    const restaurant = new Restaurants({
      Name: name.trim(),
      Description: description.trim(),
      address: {
        label: address.label || "Restaurent",
        addressLine: address.addressLine.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        latitude: address.latitude !== undefined ? Number(address.latitude) : undefined,
        longitude: address.longitude !== undefined ? Number(address.longitude) : undefined,
      },
      Cusine: Array.isArray(cusine) ? cusine.map((c) => c.trim()) : [cusine.trim()],
      FSSAIID: FSSAID.trim(),
      closesAt: closesAt.trim(),
      AdminId: req.user._id,
    });

    await restaurant.save();
    const restaurantData = await Restaurants.find({ AdminId: req.user._id });
    return res.status(200).json({
      success: true,
      message: "List of restaurants",
      data: restaurantData,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

router.get(
  "/api/admin/restaurant/:id/status",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
      const restaurant = await Restaurants.findOne({
        _id: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: "List of restaurants",
        data: restaurant.status,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.patch(
  "/api/admin/restaurant/:id/status",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
      if (!req.body || !["open", "close"].includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }
      const restaurant = await Restaurants.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }
      restaurant.status = req.body.status;
      await restaurant.save();
      return res.status(200).json({
        success: true,
        message: "List of restaurants",
        data: restaurant,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

router.post(
  "/api/admin/restaurants/:id/menu/add",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
      validateMenuItemAdd(req.body);

      const {
        title,
        description,
        serves,
        price,
        cusine,
        category,
        type,
        foodItemId,
        imageURL,
      } = req.body;

      const foodItem = await FoodItem.findById(foodItemId);
      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: "Referenced food item not found",
        });
      }

      const menuItem = new MenuItem({
        restaurantId: req.params.id,
        title: title.trim(),
        description: description.trim(),
        serves: serves ? Number(serves) : 1,
        price: Number(price),
        cusine: cusine.trim(),
        category: category.trim(),
        type,
        foodItemId,
        imageURL: imageURL ? imageURL.trim() : undefined,
      });

      await menuItem.save();

      const menuList = await MenuItem.find({
        restaurantId: req.params.id,
      });

      return res.status(201).json({
        success: true,
        message: `${req.user.firstName}, you have successfully added ${menuItem.title} to the menu.`,
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
      if (!isValidObjectId(req.params.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID format",
        });
      }

      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields provided for update",
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

      if (req.body.price !== undefined) {
        if (typeof req.body.price !== "number" || isNaN(req.body.price) || req.body.price < 0) {
          return res.status(400).json({
            success: false,
            message: "Price must be a non-negative number",
          });
        }
      }

      if (req.body.serves !== undefined) {
        if (typeof req.body.serves !== "number" || !Number.isInteger(req.body.serves) || req.body.serves < 1) {
          return res.status(400).json({
            success: false,
            message: "Serves must be an integer greater than or equal to 1",
          });
        }
      }

      if (req.body.type !== undefined) {
        const allowedTypes = ["veg", "non-veg", "has-egg"];
        if (!allowedTypes.includes(req.body.type)) {
          return res.status(400).json({
            success: false,
            message: `Type must be one of: ${allowedTypes.join(", ")}`,
          });
        }
      }

      if (req.body.title !== undefined) {
        if (typeof req.body.title !== "string" || !req.body.title.trim() || req.body.title.trim().length > 100) {
          return res.status(400).json({
            success: false,
            message: "Title must be between 1 and 100 characters",
          });
        }
      }

      if (req.body.description !== undefined) {
        if (typeof req.body.description !== "string" || !req.body.description.trim() || req.body.description.trim().length > 350) {
          return res.status(400).json({
            success: false,
            message: "Description must be between 1 and 350 characters",
          });
        }
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

router.get(
  "/api/admin/restaurants/:id/menu/:menuItemId/available",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.menuItemId)) {
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
      return res.status(200).json({
        success: true,
        message: "Menu item availability",
        data: menuItem.available,
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
      if (!isValidObjectId(req.params.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID format",
        });
      }

      if (typeof req.body?.available !== "boolean") {
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
          data: menuItem.available,
        });
      }

      menuItem.available = req.body.available;
      await menuItem.save();

      return res.status(200).json({
        success: true,
        message: "Menu item availability updated successfully",
        data: menuItem.available,
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
      if (!isValidObjectId(req.params.menuItemId)) {
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

      const orders = await Order.find(filter).sort({ createdAt: -1 });

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

      if (!isValidObjectId(req.params.Oid)) {
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

router.get(
  "/api/admin/restaurants/:id/reservations",
  adminAuth,
  isAdminRestaurant,
  async (req, res) => {
    try {
      const { status } = req.query;

      if (status && !reservationAllowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reservation status",
        });
      }

      const filter = {
        restaurantId: req.params.id,
      };

      if (status) {
        filter.status = status;
      }
      const reservation = await Reservation.find(filter).sort({ createdAt: -1 });

      if (reservation.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No reservation found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reservation fetched successfully",
        data: reservation,
      });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

module.exports = router;
