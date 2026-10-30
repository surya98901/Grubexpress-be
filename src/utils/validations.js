const validator = require("validator");
const mongoose = require("mongoose");

/**
 * Validates that an ID is a valid 24-character hex MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") {
    if (id && typeof id.toString === "function") {
      id = id.toString();
    } else {
      return false;
    }
  }
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Escapes regex special characters to prevent regex injection and ReDoS
 */
const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Validates user signup data (legacy compatible + enhanced security)
 */
const validateData = (req) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new Error("Invalid request body");
  }

  const { firstName, lastName, userName, phone, emailId, password } = req.body;

  // If this is a signup request, require all essential fields
  if (req.path && req.path.includes("signup")) {
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      throw new Error("First name is required");
    }
    if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
      throw new Error("Last name is required");
    }
    if (!userName || typeof userName !== "string" || !userName.trim()) {
      throw new Error("User name is required");
    }
    if (!emailId || typeof emailId !== "string" || !emailId.trim()) {
      throw new Error("Email is required");
    }
    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }
  }

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 20) {
      throw new Error("First name must be between 2 and 20 characters");
    }
    if (!validator.isAlpha(firstName.replace(/\s/g, ""))) {
      throw new Error("First name should only contain alphabets and spaces");
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== "string" || lastName.trim().length < 1 || lastName.trim().length > 20) {
      throw new Error("Last name must be between 1 and 20 characters");
    }
    if (!validator.isAlpha(lastName.replace(/\s/g, ""))) {
      throw new Error("Last name should only contain alphabets");
    }
  }

  if (userName !== undefined) {
    if (typeof userName !== "string" || userName.trim().length < 3 || userName.trim().length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(userName.trim())) {
      throw new Error("Username can only contain alphanumeric characters and underscores");
    }
  }

  if (phone !== undefined && phone !== null && phone !== "") {
    if (typeof phone !== "string" || !validator.isMobilePhone(phone.trim())) {
      throw new Error("Invalid phone number format");
    }
  }

  if (emailId !== undefined) {
    if (typeof emailId !== "string" || !validator.isEmail(emailId.trim())) {
      throw new Error("Invalid email format");
    }
    if (emailId.trim().length > 60) {
      throw new Error("Email must not exceed 60 characters");
    }
  }

  if (password !== undefined) {
    if (typeof password !== "string") {
      throw new Error("Password must be a valid string");
    }
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      throw new Error(
        "Password must be at least 8 characters and include at least one lowercase letter, one uppercase letter, and one number"
      );
    }
    if (password.length > 64) {
      throw new Error("Password must not exceed 64 characters");
    }
  }
};

/**
 * Validates login request body
 */
const validateLoginData = (req) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new Error("Invalid request body");
  }

  const { emailId, password } = req.body;

  if (!emailId || typeof emailId !== "string" || !emailId.trim()) {
    throw new Error("Email is required");
  }

  if (!validator.isEmail(emailId.trim())) {
    throw new Error("Invalid email format");
  }

  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  if (!req.query.role || typeof req.query.role !== "string") {
    throw new Error("Role query parameter is required");
  }

  const allowedRoles = ["customer", "admin"];
  if (!allowedRoles.includes(req.query.role)) {
    throw new Error("Invalid role sign in attempt");
  }
};

/**
 * Validates password change
 */
const validatePasswordChange = (oldPassword, newPassword, confirmPassword) => {
  if (!oldPassword || typeof oldPassword !== "string") {
    throw new Error("Old password is required");
  }

  if (!newPassword || typeof newPassword !== "string") {
    throw new Error("New password is required");
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new Error("Confirm password is required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  if (oldPassword === newPassword) {
    throw new Error("New password must be different from current password");
  }

  if (
    !validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    throw new Error(
      "New password must be at least 8 characters and include at least one lowercase letter, one uppercase letter, and one number"
    );
  }

  if (newPassword.length > 64) {
    throw new Error("Password must not exceed 64 characters");
  }
};

/**
 * Validates address fields
 */
const validateAddressData = (data, isUpdate = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Address data is required and must be an object");
  }

  const allowedLabels = ["Home", "Work", "Other", "Restaurent"];

  if (!isUpdate) {
    if (!data.addressLine || typeof data.addressLine !== "string" || !data.addressLine.trim()) {
      throw new Error("Address line is required");
    }
    if (!data.city || typeof data.city !== "string" || !data.city.trim()) {
      throw new Error("City is required");
    }
    if (!data.state || typeof data.state !== "string" || !data.state.trim()) {
      throw new Error("State is required");
    }
    if (!data.pincode || typeof data.pincode !== "string" || !data.pincode.trim()) {
      throw new Error("Pincode is required");
    }
  }

  if (data.addressLine !== undefined) {
    if (typeof data.addressLine !== "string" || data.addressLine.trim().length < 3 || data.addressLine.trim().length > 200) {
      throw new Error("Address line must be between 3 and 200 characters");
    }
  }

  if (data.city !== undefined) {
    if (typeof data.city !== "string" || data.city.trim().length < 2 || data.city.trim().length > 50) {
      throw new Error("City must be between 2 and 50 characters");
    }
  }

  if (data.state !== undefined) {
    if (typeof data.state !== "string" || data.state.trim().length < 2 || data.state.trim().length > 50) {
      throw new Error("State must be between 2 and 50 characters");
    }
  }

  if (data.pincode !== undefined) {
    if (typeof data.pincode !== "string" || !/^[0-9a-zA-Z\s-]{4,10}$/.test(data.pincode.trim())) {
      throw new Error("Invalid pincode format");
    }
  }

  if (data.label !== undefined) {
    if (!allowedLabels.includes(data.label)) {
      throw new Error(`Invalid label. Allowed values: ${allowedLabels.join(", ")}`);
    }
  }

  if (data.latitude !== undefined && data.latitude !== null) {
    const lat = Number(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error("Latitude must be a number between -90 and 90");
    }
  }

  if (data.longitude !== undefined && data.longitude !== null) {
    const lon = Number(data.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error("Longitude must be a number between -180 and 180");
    }
  }
};

/**
 * Validates restaurant creation data
 */
const validateRestaurantCreate = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Restaurant data must be an object");
  }

  const { name, description, address, cusine, FSSAID, closesAt } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Restaurant name is required");
  }
  if (name.trim().length > 50) {
    throw new Error("Restaurant name must not exceed 50 characters");
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    throw new Error("Restaurant description is required");
  }
  if (description.trim().length > 350) {
    throw new Error("Restaurant description must not exceed 350 characters");
  }

  if (!address || typeof address !== "object") {
    throw new Error("Restaurant address is required");
  }
  validateAddressData(address);

  if (cusine === undefined || cusine === null) {
    throw new Error("Cuisine is required");
  }
  if (Array.isArray(cusine)) {
    if (cusine.length === 0) throw new Error("At least one cuisine must be specified");
    cusine.forEach((c) => {
      if (typeof c !== "string" || !c.trim()) throw new Error("Each cuisine item must be a valid string");
    });
  } else if (typeof cusine !== "string" || !cusine.trim()) {
    throw new Error("Cuisine must be a valid non-empty string or array");
  }

  if (!FSSAID || typeof FSSAID !== "string" || !FSSAID.trim()) {
    throw new Error("FSSAI ID is required");
  }
  if (FSSAID.trim().length < 5 || FSSAID.trim().length > 25) {
    throw new Error("FSSAI ID must be between 5 and 25 characters");
  }

  if (!closesAt || typeof closesAt !== "string" || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(closesAt.trim())) {
    throw new Error("closesAt is required and must be in HH:mm 24-hour format (e.g. 23:00)");
  }
};

/**
 * Validates menu item creation / addition
 */
const validateMenuItemAdd = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Menu item data must be an object");
  }

  const { title, description, serves, price, cusine, category, type, foodItemId } = data;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }
  if (title.trim().length > 100) {
    throw new Error("Title must not exceed 100 characters");
  }

  if (!description || typeof description !== "string" || !description.trim()) {
    throw new Error("Description is required");
  }
  if (description.trim().length > 350) {
    throw new Error("Description must not exceed 350 characters");
  }

  if (price === undefined || price === null || typeof price !== "number" || isNaN(price) || price < 0) {
    throw new Error("Price must be a non-negative number");
  }

  if (serves !== undefined && serves !== null) {
    if (typeof serves !== "number" || !Number.isInteger(serves) || serves < 1) {
      throw new Error("Serves must be an integer greater than or equal to 1");
    }
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    throw new Error("Category is required");
  }

  if (!cusine || typeof cusine !== "string" || !cusine.trim()) {
    throw new Error("Cuisine is required");
  }

  const allowedTypes = ["veg", "non-veg", "has-egg"];
  if (!type || !allowedTypes.includes(type)) {
    throw new Error(`Type must be one of: ${allowedTypes.join(", ")}`);
  }

  if (!foodItemId || !isValidObjectId(foodItemId)) {
    throw new Error("Invalid food item ID format");
  }
};

/**
 * Validates reservation creation
 */
const validateReservationInput = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Reservation data must be an object");
  }

  const { restaurantId, headCount, time, date, note } = data;

  if (!restaurantId || !isValidObjectId(restaurantId)) {
    throw new Error("Invalid restaurant ID format");
  }

  const count = Number(headCount);
  if (!headCount || isNaN(count) || !Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error("Head count must be an integer between 1 and 50");
  }

  if (!time || typeof time !== "string" || !time.trim()) {
    throw new Error("Reservation time is required");
  }

  if (!date || typeof date !== "string" || !date.trim()) {
    throw new Error("Reservation date is required");
  }

  const reservationDate = new Date(`${date.trim()}T${time.trim()}:00`);
  if (isNaN(reservationDate.getTime())) {
    // If combined parse failed, check date independently
    const justDate = new Date(date.trim());
    if (isNaN(justDate.getTime())) {
      throw new Error("Invalid reservation date format (expected YYYY-MM-DD)");
    }
  }

  if (note !== undefined && note !== null) {
    if (typeof note !== "string" || note.length > 300) {
      throw new Error("Note must not exceed 300 characters");
    }
  }
};

/**
 * Validates safe pagination parameters
 */
const validatePagination = (query) => {
  const limit = Math.min(100, Math.max(1, parseInt(query?.limit, 10) || 10));
  const skip = Math.max(0, parseInt(query?.skip, 10) || 0);
  return { limit, skip };
};

module.exports = {
  isValidObjectId,
  escapeRegex,
  validateData,
  validateLoginData,
  validatePasswordChange,
  validateAddressData,
  validateRestaurantCreate,
  validateMenuItemAdd,
  validateReservationInput,
  validatePagination,
};