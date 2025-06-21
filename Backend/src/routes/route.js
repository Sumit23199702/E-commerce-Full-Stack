const express = require("express");
const Route = express.Router();
const {
  addUsers,
  getUsers,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

const {
  addProducts,
  getProducts,
  getProductsByQuery,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// User
Route.post("/addUser", addUsers);
Route.get("/getAllUsers", authMiddleware, getUsers);
Route.put("/updateUser/:id", authMiddleware, updateUser);
Route.delete("/deleteUser/:id", authMiddleware, deleteUser);
Route.post("/login", loginUser);

// Products
Route.post("/addProducts", addProducts);
Route.get("/getAllProducts", getProducts);
Route.get("/getProductsByQuery", getProductsByQuery);
Route.get("/getProductById/:id", getProductById);
Route.put("/updateProduct/:id", updateProduct);
Route.delete("/deleteProduct/:id", deleteProduct);

// Cart
Route.post("/addToCart", authMiddleware, addToCart);
Route.get("/getCart", authMiddleware, getCart);
Route.put("/updateCart", authMiddleware, updateCartItem);
Route.delete("/removeCart/:productId", authMiddleware, removeFromCart);
Route.delete("/clearCart", authMiddleware, clearCart);

module.exports = Route;
