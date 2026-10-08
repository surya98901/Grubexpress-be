
const handleError = (res, err) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with the provided value already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
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