const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createProductController,
  getProductController,
  singleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  brainTreeController,
  brainTreePaymentsController,
} = require("../controllers/productController");
const formidable = require("express-formidable");

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//GET PRODUCTS || GET
router.get("/get-product", getProductController);

//GET SINGLE PRODUCT || GET
router.get("/single-product/:slug", singleProductController);

//GET PHOTO || GET
router.get("/product-photo/:pid", productPhotoController);

//DLEETE PRODUCT || DELETE
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFiltersController);

//product count
router.get("/product-count", productCountController);

//products per page
router.get("/product-list/:page", productListController);

//serach products
router.get("/search/:keyword", searchProductController);

//similar products
router.get("/related-product/:pid/:cid", relatedProductController);

//categorywise product
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", brainTreeController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentsController);

module.exports = router;
