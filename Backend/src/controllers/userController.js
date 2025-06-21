const userModel = require("../models/userModel");
const {
  isValid,
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidPassword,
} = require("./validator");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Add Users
const addUsers = async (req, res) => {
  try {
    let userData = req.body;
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({ msg: "Bad Request, No Data Provided" });
    }

    let { name, email, contact, password, address, gender, age } = userData;

    // Name Validation
    if (!isValid(name)) {
      return res.status(400).json({ msg: "Name is Required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ msg: "Invalid Name" });
    }

    // UserEmail Validation
    if (!isValid(email)) {
      return res.status(400).json({ msg: "Email is Required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    let duplicateEmail = await userModel.findOne({ email });
    if (duplicateEmail) {
      return res.status(400).json({ msg: "Email Already Exists" });
    }

    // User Contact Validation
    if (!isValid(contact)) {
      return res.status(400).json({ msg: "Contact is Required" });
    }
    if (!isValidPhone(contact)) {
      return res.status(400).json({ msg: "Invalid Contact" });
    }

    let duplicateContact = await userModel.findOne({ contact });
    if (duplicateContact) {
      return res.status(400).json({ msg: "Contact Already Exists" });
    }

    // Address Validation
    if (!isValid(address)) {
      return res.status(400).json({ msg: "Address is Required" });
    }

    // Gender Validation
    if (!isValid(gender)) {
      return res.status(400).json({ msg: "Gender is Required" });
    }

    let validGenders = ["male", "female", "others"];
    if (!validGenders.includes(gender.trim().toLowerCase())) {
      return res
        .status(400)
        .json({ msg: "Gender must be 'male', 'female' and 'Others'" });
    }

    // Password Validation
    if (!isValid(password)) {
      return res.status(400).json({ msg: "Password is Required" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        msg: "Password must be contain 6-20 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Age Validation
    if (!isValid(age)) {
      return res.status(400).json({ msg: "Age is Required" });
    }

    let user = await userModel.create({
      name,
      email,
      contact,
      password: hashedPassword,
      address,
      gender,
      age,
    });
    return res.status(201).json({ msg: "User Added Successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    let userData = await userModel.find();
    if (userData.length === 0) {
      return res.status(404).json({ msg: "No User Found" });
    }
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update User Data
const updateUser = async (req, res) => {
  try {
    let userId = req.params.id;
    let data = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    let loggedInUserId = req.user.userId;
    if (userId !== loggedInUserId) {
      return res
        .status(403)
        .json({ msg: "Bad Authorisation!!! Invalid Token!" });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request, No Data Provided" });
    }

    let { name, email, contact, password, address, gender, age } = data;

    // Validate userName
    if (name !== undefined) {
      if (!isValid(name)) {
        return res.status(400).json({ msg: "Name is Required" });
      }

      if (!isValidName(name)) {
        return res.status(400).json({ msg: "Invalid Name" });
      }
    }

    // Validate User Email

    if (email !== undefined) {
      if (!isValid(email)) {
        return res.status(400).json({ msg: "Email is Required" });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ msg: "Invalid Email" });
      }

      let duplicateEmail = await userModel.findOne({ email });
      if (duplicateEmail) {
        return res.status(400).json({ msg: "Email Already Exists" });
      }
    }

    // Validate user Contact

    if (contact !== undefined) {
      if (!isValid(contact)) {
        return res.status(400).json({ msg: "Contact is Required" });
      }

      if (!isValidPhone(contact)) {
        return res.status(400).json({ msg: "Invalid Contact" });
      }

      let duplicateContact = await userModel.findOne({ contact });
      if (duplicateContact) {
        return res.status(400).json({ msg: "Contact Already Exists" });
      }
    }

    // Password Validation
    let salt;
    let hashedPassword;
    if (password !== undefined) {
      if (!isValid(password)) {
        return res.status(400).json({ msg: "Password is Required" });
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({
          msg: "Password must be contain 6-20 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
        });
      }

      salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Validate user Address
    if (address !== undefined && !isValid(address)) {
      return res.status(400).json({ msg: "Address is Required" });
    }

    // validate Gender
    if (gender !== undefined) {
      if (!isValid(gender)) {
        return res.status(400).json({ msg: "Gender is Required" });
      }

      let validGenders = ["male", "female", "others"];
      if (!validGenders.includes(gender.trim().toLowerCase())) {
        return res
          .status(400)
          .json({ msg: "Gender must be 'male', 'female' and 'Others'" });
      }
    }

    // validate Age
    if (age !== undefined && !isValid(age)) {
      return res.status(400).json({ msg: "Age is Required" });
    }

    let update = await userModel.findByIdAndUpdate(
      userId,
      { name, email, contact, password: hashedPassword, address, gender, age },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({ msg: "No User Found" });
    }
    return res
      .status(200)
      .json({ msg: "User Data Updated Successfully", update });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    let loggedInUserId = req.user.userId;
    if (userId !== loggedInUserId) {
      return res
        .status(403)
        .json({ msg: "Bad Authorisation!!! Invalid Token!" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ mag: "User Not Found" });
    }

    await userModel.findByIdAndDelete(userId);
    return res.status(200).json({ msg: "User Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Bad Request, No Data Found" });
    }

    let { email, password } = req.body;

    if (!isValid(email)) {
      return res.status(400).json({ msg: "Email is required" });
    }

    if (!isValid(password)) {
      return res.status(400).json({ msg: "Password is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not Found with this email" });
    }

    const matchUser = await bcrypt.compare(password, user.password);
    if (!matchUser) {
      return res.status(401).json({ msg: "Incorrect Password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "my-secret-key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ msg: "Login Successfull", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { addUsers, getUsers, updateUser, deleteUser, loginUser };
