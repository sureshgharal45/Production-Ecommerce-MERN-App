const express = require("express");
const {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileContoller,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} = require("../controllers/authController");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routing
//REGISTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

// FORGOT PASSWORD || POST
router.post("/forgot-password", forgotPasswordController);

//test || get
router.get("/test", requireSignIn, isAdmin, testController);

//protected user routes
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin routes
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileContoller);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController,
);

module.exports = router;
