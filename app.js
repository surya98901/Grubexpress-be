require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./src/Routes/authRoute");
const userRoutes = require("./src/Routes/userRoute");
const restaurantRoutes = require("./src/Routes/restaurantRoute");
const cartRoutes = require("./src/Routes/cart.Route");
const  orderRoutes = require("./src/Routes/orderRoute");
const itemsRoutes = require("./src/Routes/itemsRoute")



const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/",restaurantRoutes );
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", itemsRoutes);



connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); 
  });
