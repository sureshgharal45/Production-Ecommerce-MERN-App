const categoryModel = require("../models/CategoryModel");
const slugify = require("slugify");

const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({
        message: "name is required",
      });
    }
    const existingCatgeory = await categoryModel.findOne({ name });
    if (existingCatgeory) {
      return res.status(200).send({
        success: true,
        message: "category already exists",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error in category",
    });
  }
};

//update category
const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category updated succesfully",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while updating category",
    });
  }
};

//get all category
const getAllCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All categories lists",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while getting all categories",
    });
  }
};

//get single category
const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get single catgeory successfully",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while getting single category",
    });
  }
};

// delete category
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Catgeory deleted succesfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err,
      message: "Error while deleting the category",
    });
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  getAllCategoryController,
  singleCategoryController,
  deleteCategoryController,
};
