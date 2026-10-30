
const handleError = (res, err, defaultStatus = 500) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors || {}).map((error) => error.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${err.path}'`,
    });
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with the provided ${duplicateField} already exists`,
    });
  }

  const statusCode = typeof defaultStatus === "number" ? defaultStatus : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
const sanitizeUser = (user) => {
  const userData = user.toObject();
  delete userData.password;
  return userData;
};
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});
};
module.exports = {handleError,sanitizeUser,setAuthCookie};