const fs = require("fs");
const productModel = require("../models/ProductModel");
const categoryModel = require("../models/CategoryModel");
const slugify = require("slugify");
const braintree = require("braintree");
const orderModel = require("../models/OrderModel");

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ message: "Name is required" });

      case !description:
        return res.status(500).send({ message: "Description is required" });

      case !price:
        return res.status(500).send({ message: "Price is required" });

      case !category:
        return res.status(500).send({ message: "Catgory is required" });

      case !quantity:
        return res.status(500).send({ message: "Quantity is required" });

      case !photo && photo.size > 10000:
        return res
          .status(500)
          .send({ message: "Photo is required and should be less than 1 Mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while craating product",
    });
  }
};

//get all prpducts
const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All products are fetched",
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err: err.message,
      message: "Error while getting products",
    });
  }
};

//get single product
const singleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single product fetched",
      product,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err: err.message,
      message: "Error while getting single product",
    });
  }
};

//get photo
const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err: err.message,
      message: "Error while getting product photo",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err: err.message,
      message: "Error while deleting product",
    });
  }
};

//update prouct
const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ message: "Name is required" });

      case !description:
        return res.status(500).send({ message: "Description is required" });

      case !price:
        return res.status(500).send({ message: "Price is required" });

      case !category:
        return res.status(500).send({ message: "Catgory is required" });

      case !quantity:
        return res.status(500).send({ message: "Quantity is required" });

      case photo && photo.size > 1000000:
        // console.log("photo", photo);
        return res
          .status(500)
          .send({ message: "Photo is required and should be less than 1 Mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while updating product",
    });
  }
};

//filters
const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    // console.log("args", args);
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error while filtering product",
    });
  }
};

//product count
const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error in product count",
    });
  }
};

//product list based on list
const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error in per page ctrl",
    });
  }
};

//search product
const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error insearch product",
    });
  }
};

//similar products
const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error insearch product",
    });
  }
};

const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      success: false,
      err,
      message: "Error while getting product",
    });
  }
};

//payment gateway api || token
const brainTreeController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

//payments controller
const brainTreePaymentsController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },

      function (error, result) {
        if (result) {
          const order = orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
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
};
