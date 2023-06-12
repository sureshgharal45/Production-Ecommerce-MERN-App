const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCategoryController,
  updateCategoryController,
  getAllCategoryController,
  singleCategoryController,
  deleteCategoryController,
} = require("../controllers/categoryController");

const router = express.Router();

//routes
//CREATE CATEGORY || POST
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//UPDATE CATEGORY || PUT
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//GET ALL CATEGORY || GET
router.get("/get-category", getAllCategoryController);

//GET SINGLE CATEGORY || GET
router.get("/single-category/:slug", singleCategoryController);

//DELETE CATGEORY || DELETE
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

module.exports = router;
