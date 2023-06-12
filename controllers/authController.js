const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
const orderModel = require("../models/OrderModel");
const JWT = require("jsonwebtoken");

//post register
const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validation
    if (!name) {
      return res.send({
        message: "name is required",
      });
    }

    if (!email) {
      return res.send({
        message: "email is required",
      });
    }

    if (!password) {
      return res.send({
        message: "password is required",
      });
    }

    if (!phone) {
      return res.send({
        message: "phone is required",
      });
    }

    if (!address) {
      return res.send({
        error: "address is required",
      });
    }

    if (!answer) {
      return res.send({
        error: "answer is required",
      });
    }
    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "User regitser successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in registeration",
      err,
    });
  }
};

//post login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or pasword",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //generate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in login",
      err,
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Email is required",
      });
    }

    if (!answer) {
      res.status(400).send({
        message: "Answer is required",
      });
    }

    if (!newPassword) {
      res.status(400).send({
        message: "New Password is required",
      });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      res.status(404).send({
        success: false,
        message: "Wrong Email or answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      err,
    });
  }
};

const testController = async (req, res) => {
  res.send("protected routes");
};

//update profile ctrl
const updateProfileContoller = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and must be 6 character long",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in updating User profile",
      err,
    });
  }
};

//oreders
const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      err,
    });
  }
};

//all orders on admin page
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      err,
    });
  }
};

//order status strl
const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while Updating order",
      err,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileContoller,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
};
