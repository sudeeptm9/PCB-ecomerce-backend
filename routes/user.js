const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();
const Client = require("pg").Pool;

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "propcbs",
  password: "123",
  port: 5432,

});

const jwt = require("jsonwebtoken");

//Registration Function
router.post("/register", async (req, res) => {
  console.log("Received");
  const { email, username, passwords } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Checking if user already exists
    const arr = data.rows;
    if (arr.length != 0) {
      return res.status(400).json({
        error: "Email already there, No need to register again.",
      });
    } else {
      bcrypt.hash(passwords, 10, (err, hash) => {
        if (err)
          res.status(err).json({
            error: "Server error",
          });
        const user = {
          email,
          username,
          passwords: hash,
        };
        var flag = 1;

        //Inserting data into the database
        console.log(req.body);
        client.query(
          `INSERT INTO users (email,username,passwords) VALUES ($1,$2,$3);`,
          [user.email, user.username, user.passwords],
          (err) => {
            if (err) {
              flag = 0; //If user is not inserted is not inserted to database assigning flag as 0/false.
              console.error(err);
              return res.status(400).json({
                error: "Database error",
              });
            } else {
              flag = 1;
              res
                .status(200)
                .send({ message: "User added to database, not verified" });
            }
          }
        );
        if (flag) {
          const token = jwt.sign(
            //Signing a jwt token
            {
              email: user.email,
            },
            "hey this is test"
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: "Database error while registring user!", //Database connection error
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, passwords } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      res.status(400).json({
        error: "User is not registered, Sign Up first",
      });
    } else {
      bcrypt.compare(passwords, user[0].passwords, (err, result) => {
        if (err) {
          res.status(500).json({
            error: "Server error",
          });
        } else if (result === true) {
          const token = jwt.sign(
            {
              email: email,
            },
            "hey this is test"
          );
          res.status(200).json({
            message: "User signed in!",
            token: token,
          });
        } else {
          if (result != true)
            res.status(400).json({
              error: "Enter correct password!",
            });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Database error occurred while signing in!",
    });
  }
});

router.get("/orders/:email", async (req, res) => {
  id = req.params.email;
  try {
    const data = await client.query(
      `select * from PCB_model where email = (select email from users where email=$1);`,
      [id]
    );
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "no orders found.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
