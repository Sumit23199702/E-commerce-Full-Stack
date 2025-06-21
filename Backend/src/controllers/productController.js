const productModel = require("../models/productModel");
const { isValid, isValidURL } = require("./validator");
const mongoose = require("mongoose");

// Add Products
const addProducts = async (req, res) => {
  try {
    const data = req.body;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "No Product Data Provided" });
    }

    const {
      productImage,
      productName,
      category,
      description,
      price,
      ratings,
      isFreeDelivery,
    } = data;

    if (!isValid(productImage)) {
      return res.status(400).json({ msg: "Product Image is required" });
    }

    if (!isValidURL(productImage)) {
      return res.status(400).json({ msg: "Product Image must be a valid URL" });
    }

    if (!isValid(productName)) {
      return res.status(400).json({ msg: "Product Name is required" });
    }

    const duplicateProduct = await productModel.findOne({ productName });
    if (duplicateProduct) {
      return res.status(409).json({ msg: "Product Name already exists" });
    }

    if (!isValid(category)) {
      return res.status(400).json({ msg: "Category is required" });
    }

    const validCategories = [
      "electronics",
      "clothing",
      "food",
      "books",
      "furniture",
    ];
    if (!validCategories.includes(category.trim().toLowerCase())) {
      return res.status(400).json({ msg: "Invalid Category" });
    }

    if (!isValid(description)) {
      return res.status(400).json({ msg: "Description is required" });
    }

    if (!isValid(price) || price < 0) {
      return res.status(400).json({ msg: "Price is Required" });
    }

    if (!isValid(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ msg: "Ratings must be between 1 to 5" });
    }

    if (data.hasOwnProperty("isFreeDelivery")) {
      if (typeof isFreeDelivery !== "boolean") {
        return res.status(400).json({
          msg: "isFreeDelivery must be a boolean value",
        });
      }
    }

    const product = await productModel.create(data);
    return res.status(201).json({ msg: "Product Added Successfully", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await productModel.find();

    if (products.length === 0) {
      return res.status(404).json({ msg: "No Products Found" });
    }

    return res
      .status(200)
      .json({ msg: "Products List", count: products.length, products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get Product By Query
const getProductsByQuery = async (req, res) => {
  try {
    const {
      category,
      name,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      isFreeDelivery,
    } = req.query;

    if (Object.keys(req.query).length === 0) {
      return res
        .status(400)
        .json({ msg: "Please provide at least one query parameter" });
    }

    let filter = {};

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (name) {
      filter.productName = { $regex: name, $options: "i" };
    }

    if (typeof minPrice !== "undefined" || typeof maxPrice !== "undefined") {
      filter.price = {};
      if (typeof minPrice !== "undefined") filter.price.$gte = Number(minPrice);
      if (typeof maxPrice !== "undefined") filter.price.$lte = Number(maxPrice);
    }

    if (typeof minRating !== "undefined" || typeof maxRating !== "undefined") {
      filter.ratings = {};
      if (typeof minRating !== "undefined")
        filter.ratings.$gte = Number(minRating);
      if (typeof maxRating !== "undefined")
        filter.ratings.$lte = Number(maxRating);
    }

    if (typeof isFreeDelivery !== "undefined") {
      if (isFreeDelivery === "true") filter.isFreeDelivery = true;
      else if (isFreeDelivery === "false") filter.isFreeDelivery = false;
      else {
        return res.status(400).json({
          msg: "Invalid value for isFreeDelivery. Use 'true' or 'false'.",
        });
      }
    }

    const products = await productModel.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ msg: "No Products Match Your Query" });
    }

    return res.status(200).json({
      msg: "Filtered Products",
      count: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Product By Id
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid Product ID" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }

    return res.status(200).json({ msg: "Product Found", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid Product ID" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "No data provided for update" });
    }

    const {
      productImage,
      productName,
      category,
      description,
      price,
      ratings,
      isFreeDelivery,
    } = data;

    const updateData = {};

    if (productImage) {
      if (!isValid(productImage) || !isValidURL(productImage)) {
        return res
          .status(400)
          .json({ msg: "Product Image must be a valid URL" });
      }
      updateData.productImage = productImage.trim();
    }

    if (productName) {
      if (!isValid(productName)) {
        return res
          .status(400)
          .json({ msg: "Product Name must be a valid non-empty string" });
      }

      const duplicateProduct = await productModel.findOne({ productName });
      if (duplicateProduct) {
        return res.status(409).json({ msg: "Product Name already exists" });
      }

      updateData.productName = productName;
    }

    if (category) {
      const validCategories = [
        "electronics",
        "clothing",
        "food",
        "books",
        "furniture",
      ];
      if (!validCategories.includes(category.trim().toLowerCase())) {
        return res.status(400).json({ msg: "Invalid Category" });
      }
      updateData.category = normalizedCategory;
    }

    if (description) {
      if (!isValid(description)) {
        return res
          .status(400)
          .json({ msg: "Description must be a non-empty string" });
      }
      updateData.description = description;
    }

    if (typeof price !== "undefined") {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res
          .status(400)
          .json({ msg: "Price must be a valid number >= 0" });
      }
      updateData.price = priceNum;
    }

    if (typeof ratings !== "undefined") {
      const ratingNum = Number(ratings);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res
          .status(400)
          .json({ msg: "Ratings must be a number between 1 and 5" });
      }
      updateData.ratings = ratingNum;
    }

    if (typeof isFreeDelivery !== "undefined") {
      if (typeof isFreeDelivery !== "boolean") {
        return res
          .status(400)
          .json({ msg: "isFreeDelivery must be a boolean (true or false)" });
      }
      updateData.isFreeDelivery = isFreeDelivery;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    return res
      .status(200)
      .json({ msg: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid Product ID" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }

    await productModel.findByIdAndDelete(productId);
    return res.status(200).json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addProducts,
  getProducts,
  getProductsByQuery,
  getProductById,
  updateProduct,
  deleteProduct,
};
