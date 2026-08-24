require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/Routes/authRoute");
const userRoutes = require("./src/Routes/userRoute")
const restaurentRoutes = require("./src/Routes/restaurentRoute")



const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/",restaurentRoutes )



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
