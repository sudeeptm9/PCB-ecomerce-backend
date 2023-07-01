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
  const { catid, title, slug } = req.body;
  try {
    const data = await client.query(`SELECT * FROM category WHERE catid= $1;`, [
      catid,
    ]); //Checking if user already exists
    const arr = data.rows;
    if (arr.length != 0) {
      return res.status(400).json({
        error: "Product  already there, No need to add again.",
      });
    }
    const category = {
      catid,
      title,
      slug,
    };
    client.query(
      `INSERT INTO category (catid,title,slug) VALUES ($1,$2,$3);`,
      [category.catid, category.title, category.slug],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(400).json({
            error: "Database error",
          });
        } else {
          res.status(200).send({ message: "category added to database" });
        }
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
});
router.get("/", async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM category;`); //Checking if user already exists
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(400).json({
        error: "categories are empty.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:catid", async (req, res) => {
  id = parseInt(req.params.catid);
  try {
    const data = await client.query(`SELECT * FROM category WHERE catid =$1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "category not found.",
      });
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:catid", async (req, res) => {
  id = parseInt(req.params.catid);
  try {
    const data = await client.query(`SELECT * FROM category WHERE catid =$1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "category not found.",
      });
    } else {
      const { title, slug } = req.body;
      client.query(
        "UPDATE category SET title = $1, slug = $2 WHERE catid = $3",
        [title, slug, id],
        (error, results) => {
          if (error) {
            return res.status(400).send(error);
          }
          res.status(200).send(`category modified with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

router.delete("/find/:catid", async (req, res) => {
  id = parseInt(req.params.catid);
  try {
    const data = await client.query(`SELECT * FROM category WHERE catid =$1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "category not found.",
      });
    } else {
      client.query(
        "DELETE FROM category WHERE catid = $1",
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

module.exports = router;
