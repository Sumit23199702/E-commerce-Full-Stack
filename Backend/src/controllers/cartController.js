const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { isValid } = require("./validator");

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!isValid(productId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Valid productId is required" });
    }

    if (!isValid(quantity) || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      cart = await cartModel.create({
        userId,
        items: [{ productId, quantity }],
        totalItems: 1,
        totalPrice: product.price * quantity,
      });
    } else {
      let found = false;
      cart.items = cart.items.map((item) => {
        if (item.productId.toString() === productId) {
          found = true;
          item.quantity += quantity;
        }
        return item;
      });

      if (!found) cart.items.push({ productId, quantity });

      cart.totalItems = cart.items.length;

      const populated = await cart.populate("items.productId", "price");
      cart.totalPrice = populated.items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      );
    }

    await cart.save();
    return res.status(200).json({ msg: "Item added to cart", cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Get Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartModel
      .findOne({ userId })
      .populate("items.productId", "productName price productImage");

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    return res.status(200).json({ msg: "Cart fetched successfully", cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Update Cart Item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!isValid(productId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Valid productId is required" });
    }

    if (!isValid(quantity) || typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ msg: "Product not found in cart" });
    }

    if (quantity === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    cart.totalItems = cart.items.length;

    const populated = await cart.populate("items.productId", "price");
    cart.totalPrice = populated.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json({ msg: "Cart updated", cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!isValid(productId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Valid productId is required" });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    const filteredItems = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (filteredItems.length === cart.items.length) {
      return res.status(404).json({ msg: "Product not found in cart" });
    }

    cart.items = filteredItems;
    cart.totalItems = cart.items.length;

    const populated = await cart.populate("items.productId", "price");
    cart.totalPrice = populated.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json({ msg: "Product removed", cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

//  Clear Cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();
    return res.status(200).json({ msg: "Cart cleared successfully", cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
