const express = require("express");
const  mongoose = require("mongoose");
const Restaurents = require("../models/restaurantModel");
const MenuItem = require("../models/menuModel")
const userAuth = require("../middlewares/auth");
const { handleError } = require("../utils/helperfunctions");
const router = express.Router();


