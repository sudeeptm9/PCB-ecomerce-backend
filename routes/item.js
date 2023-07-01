const { json } = require("body-parser");
const { Router } = require("express");
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
router.post("/", async (req, res) => {
  const { itemid, quantity, price, productcode, email } = req.body;
  try {
    const productdata = await client.query(
      `SELECT * FROM product WHERE productcode= $1;`,
      [productcode]
    );
    const productarr = productdata.rows;
    const userdata = await client.query(`SELECT * FROM user WHERE email= $1;`, [
      email,
    ]);
    const userarr = userdata.rows;
    if (productarr.length != 0 && userarr.length != 0) {
      const itemdata = await client.query(
        `SELECT * FROM item WHERE itemid= $1;`,
        [itemid]
      );
      const itemarr = itemdata.rows;
      if (itemarr.length === 0) {
        const item = {
          itemid,
          quantity,
          price,
          productcode,
          email,
        };
        client.query(
          `INSERT INTO item (itemid,quantity,price,productcode,email) VALUES ($1,$2,$3,$4,$5);`,
          [
            item.itemid,
            item.quantity,
            item.price,
            item.productcode,
            item.email,
          ],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(400).json({
                error: "Database error",
              });
            } else {
              res.status(200).send({ message: "item added to database" });
            }
          }
        );
      } else {
        return res.status(400).json({
          error: "item already exists",
        });
      }
    } else {
      return res.status(404).json({
        error: "product  not found or user not found",
      });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM product;`);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "Products are empty.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:productcode", async (req, res) => {
  id = parseInt(req.params.productcode);
  try {
    const data = await client.query(
      `SELECT * FROM product WHERE productcode =$1;`,
      [id]
    );
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:productcode", async (req, res) => {
  id = parseInt(req.params.productcode);
  try {
    const data = await client.query(
      `SELECT * FROM product WHERE productcode =$1;`,
      [id]
    );
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      const { title, imagepath, description, price, manufacturer, available } =
        req.body;
      client.query(
        "UPDATE product SET title = $1,imagepath=$2,description=$3,price=$4,manufacturer=$5,available=$6 WHERE productcode = $7",
        [title, imagepath, description, price, manufacturer, available, id],
        (error, results) => {
          if (error) {
            return res.status(400).send(error);
          }
          res.status(200).send(`category modified with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    console.log("err");
    return res.status(400).json(err);
  }
});

router.delete("/:productcode", async (req, res) => {
  id = parseInt(req.params.productcode);
  try {
    const data = await client.query(
      `SELECT * FROM product WHERE productcode =$1;`,
      [id]
    );
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      client.query(
        "DELETE FROM product WHERE productcode = $1",
        [id],
        (error, results) => {
          if (error) {
            return res.status(400).send(error);
          }
          res.status(200).send(`category deleted with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.get("/category/:catid", async (req, res) => {
  id = parseInt(req.params.catid);
  try {
    const data = await client.query(`SELECT * FROM product WHERE catid = $1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
