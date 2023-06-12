const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

//configure env
dotenv.config();

//database configue
connectDB();

//rest obj
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));

//routes
//auth route
app.use("/api/v1/auth", require("./routes/authRoute"));
//category routes
app.use("/api/v1/category", require("./routes/CategoryRoutes"));
//product routes
app.use("/api/v1/product", require("./routes/productRoute"));

//rest api
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

//port
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white
  );
});
