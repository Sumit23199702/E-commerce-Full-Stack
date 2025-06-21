const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route");

const app = express();

// const middleware1 = (req, res, next) => {
//   console.log("This is Middleware 1");
//   let randomNo = Math.floor(Math.random() * 10);
//   if (randomNo < 3) {
//     res.json({ msg: "This is Middleware1" });
//     console.log(randomNo);
//   } else {
//     console.log(randomNo);
//     next();
//   }
// };

// const middleware2 = (req, res, next) => {
//   console.log("This is Middleware 2");
//   let randomNo2 = Math.floor(Math.random() * 20);
//   if (randomNo2 < 6) {
//     res.json({ msg: "This is Middleware2" });
//     console.log(randomNo2);
//   } else {
//     console.log(randomNo2);
//     next();
//   }
// };

// app.use(middleware1);
// app.use(middleware2);

app.use(express.json()); // Middleware
app.use("/", route); // Middleware

// Database Connection
mongoose
  .connect(
    "mongodb+srv://sumitcoc2nd:4quZ8SugiidZQdGC@cluster0.rv1ki7n.mongodb.net/E-Commerce"
  )
  .then(() => console.log("MongoDb is Connected"))
  .catch(() => console.log("DB Connection Failed"));

// Server Creation
app.get("/", (req, res) => {
  res.send("Hello From Express Js");
});

const PORT = 4000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is Running At Port ${PORT}`);
  }
});
