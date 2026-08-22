require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const userAuth = require("./src/middlewares/auth");
const authRoutes = require("./src/Routes/authRoute");



const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use("/", authRoutes);
app.get("/", userAuth, (req, res) => {
  res.json({ message: "Hello, World!" });
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit process with failure
  });
