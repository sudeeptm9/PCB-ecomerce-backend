const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv=require("dotenv");
dotenv.config();
router.post("/orders", async (req, res) => {
	try {
		const instance = new Razorpay({
			key_id: process.env.KEY_ID,
			key_secret: process.env.KEY_SECRET,
		});

		const options = {
			amount: req.body.amount * 100,
			currency: "INR",
			receipt: crypto.randomBytes(10).toString("hex"),
		};

		instance.orders.create(options, async(error, order) => {
			if (error) {
				console.log(error);
				return res.status(500).json({ message: "Something Went Wrong!" });
			}
			res.status(200).json({ data: order });
      console.log(order.id);
      var options = {
        "key_id": process.env.KEY_ID, 
        "key_secret":process.env.KEY_SECRET,
        "amount": "49900", 
        "currency": "INR",
        "name": "Dummy Academy",
        "description": "Pay & Checkout this Course, Upgrade your DSA Skill",
         "image": "",
        "order_id":order.id,  
        "handler": function (response){
            console.log(response)
            res.send("This step of Payment Succeeded");
        },
       "notes" : {
          "description":"Best Course for SDE placements",
          "language":"Available in 4 major Languages JAVA,  C/C++, Python, Javascript",
          "access":"This course have Lifetime Access"
        }, 
        "theme": {
            "color": "#2300a3"
        }
    };
    var razorpayObject =await new Razorpay(options);
    console.log(razorpayObject);
    razorpayObject.on('payment.failed', function (response){
          console.log(response);
          res.send("This step of Payment Failed");
    });
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!" });
		console.log(error);
	}
});

router.post("/verify", async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body;
		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", process.env.KEY_SECRET)
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature === expectedSign) {
			return res.status(200).json({ message: "Payment verified successfully" });
		} else {
			return res.status(400).json({ message: "Invalid signature sent!" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!" });
		console.log(error);
	}
});

module.exports = router;