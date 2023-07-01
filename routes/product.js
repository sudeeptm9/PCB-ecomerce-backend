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
  const {
    productcode,
    title,
    imagepath,
    description,
    price,
    manufacturer,
    available,
    catid,
  } = req.body;
  try {
    const data = await client.query(`SELECT * FROM category WHERE catid= $1;`, [
      catid,
    ]);
    const arr = data.rows;
    if (arr.length != 0) {
      const Productdata = await client.query(
        `SELECT * FROM product WHERE productcode= $1;`,
        [productcode]
      );
      const productarr = Productdata.rows;
      if (productarr.length === 0) {
        const product = {
          productcode,
          title,
          imagepath,
          description,
          price,
          manufacturer,
          available,
          catid,
        };
        client.query(
          `INSERT INTO product (productcode,title,imagepath,description,price,manufacturer,available,catid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`,
          [
            product.productcode,
            product.title,
            product.imagepath,
            product.description,
            product.price,
            product.manufacturer,
            product.available,
            product.catid,
          ],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(400).json({
                error: "Database error",
              });
            } else {
              res.status(200).send({ message: "product added to database" });
            }
          }
        );
      } else {
        return res.status(404).json({
          error: "Product already exists",
        });
      }
    } else {
      return res.status(404).json({
        error: "category  not found",
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
