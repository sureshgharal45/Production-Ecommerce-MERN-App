const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");

//protected route token base
const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    console.log("decode", decode);
    next();
  } catch (err) {
    console.log(err);
  }
};

// /admin access
const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized access",
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send({
      success: false,
      err,
      message: "Error in admin middleware",
    });
  }
};

module.exports = { requireSignIn, isAdmin };
