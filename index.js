const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8080;

let cors = require("cors");
require("dotenv").config();
// const Razorpay = require('razorpay');

// const razorpayInstance = new Razorpay({

//   // Replace with your key_id
//   key_id: rzp_test_C1Oj1ATXARajxr,

//   // Replace with your key_secret
//   key_secret:uiogSGmIrlVBogtTxLUWrwPt
// });

var corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
const paymentRoute = require("./routes/payment");
const billingRoute = require("./routes/billing");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const invoiceRoute = require("./routes/invoice");
app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.use("/billing", billingRoute);
app.use("/payment", paymentRoute);
app.use("/product", productRoute);
app.use("/user", userRoute);
app.use("/order", orderRoute);
app.use("/category", categoryRoute);
app.use("/cart", cartRoute);
app.use("/invoice", invoiceRoute);
app.listen(port || process.env.PORT, () => {
  console.log(`App running on port ${port} And ${process.env.PORT}.`);
});
