const handleError = (res, err, status = 400) => {
  return res.status(status).json({ message: err.message || "Something went wrong" });
};
const sanitizeUser = (user) => {
  const userData = user.toObject();
  delete userData.password;
  return userData;
};

module.exports = {handleError,sanitizeUser};