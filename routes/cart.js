const { json } = require("body-parser");
const { Router } = require("express");
const express = require("express");
const middleware = require("../middleware/index");
const router = express.Router();
const Client = require("pg").Pool;

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "propcbs",
  password: "123",
  port: 5432,

});

function id_generator() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

router.post("/", middleware, async (req, res) => {
  console.log(req.body);
  // return;
  const {
    Base_material,
    Layers,
    Dimensions,
    dimensionheight,
    dimensionwidth,
    Quantity,
    product_type,
    Different_Design,
    delivery_format,
    pcb_thickness,
    pcb_color,
    silkscreen,
    surface_finish,
    outercopperweight,
    goldfingers,
    ConfirmProductionFile,
    castellatedHoles,
    flyingProbeTest,
    RemoveOrderNumber,
    email,
    total,
    filelocation,
  } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]);
    const arr = data.rows;
    if (arr.length != 0) {
      const cart = {
        Base_material,
        Layers,
        Dimensions,
        dimensionheight,
        dimensionwidth,
        Quantity,
        product_type,
        Different_Design,
        delivery_format,
        pcb_thickness,
        pcb_color,
        silkscreen,
        surface_finish,
        outercopperweight,
        goldfingers,
        ConfirmProductionFile,
        castellatedHoles,
        flyingProbeTest,
        RemoveOrderNumber,
        email,
        total,
        filelocation,
      };
      client.query(
        `INSERT INTO cart (  Base_material,
            Layers,
            Dimensions,
            dimensionheight,
            dimensionwidth,
            Quantity,
            product_type,
            Different_Design,
            delivery_format,
            pcb_thickness,
            pcb_color,
            silkscreen,
            surface_finish,
            outercopperweight,
            goldfingers,
            ConfirmProductionFile,
            castellatedHoles,
            flyingProbeTest,
            RemoveOrderNumber,
            email,uuid,total,filelocation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23);`,
        [
          cart.Base_material,
          cart.Layers,
          cart.Dimensions,
          cart.dimensionheight,
          cart.dimensionwidth,
          cart.Quantity,
          cart.product_type,
          cart.Different_Design,
          cart.delivery_format,
          cart.pcb_thickness,
          cart.pcb_color,
          cart.silkscreen,
          cart.surface_finish,
          cart.outercopperweight,
          cart.goldfingers,
          cart.ConfirmProductionFile,
          cart.castellatedHoles,
          cart.flyingProbeTest,
          cart.RemoveOrderNumber,
          cart.email,
          id_generator(),
          cart.total,
          cart.filelocation,
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(400).json({
              error: "Database error",
            });
          } else {
            console.log("Added")
            res.status(200).send({ message: "cart added to database" });
          }
        }
      );
    } else {
      return res.status(404).json({
        error: "user does not exists",
      });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", middleware, async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM cart;`);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(200).json([]);
    } else {
      return res.status(200).json({ arr });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res) => {
  id = req.params.id;
  try {
    const data = await client.query(`SELECT * FROM cart WHERE uuid =$1;`, [id]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      const {
        Base_material,
        Layers,
        Dimensions,
        Quantity,
        product_type,
        Different_Design,
        delivery_format,
        pcb_thickness,
        pcb_color,
        silkscreen,
        surface_finish,
        outercopperweight,
        goldfingers,
        ConfirmProductionFile,
        castellatedHoles,
        flyingProbeTest,
        RemoveOrderNumber,
        total,
        dimensionheight,
        dimensionwidth,
      } = req.body;
      client.query(
        "UPDATE cart SET Base_material= $1,Layers=$2,Dimensions=$3,Quantity=$4,product_type=$5,Different_Design=$6,delivery_format=$7, pcb_thickness=$8,pcb_color=$9,silkscreen=$10,surface_finish=$11,outercopperweight=$12,goldfingers=$13,ConfirmProductionFile=$14,castellatedHoles=$15,flyingProbeTest=$16, RemoveOrderNumber=$17, total=$18,dimensionheight=$19,dimensionwidth=$20 WHERE uuid = $21",
        [
          Base_material,
          Layers,
          Dimensions,
          Quantity,
          product_type,
          Different_Design,
          delivery_format,
          pcb_thickness,
          pcb_color,
          silkscreen,
          surface_finish,
          outercopperweight,
          goldfingers,
          ConfirmProductionFile,
          castellatedHoles,
          flyingProbeTest,
          RemoveOrderNumber,
          total,
          dimensionheight,
          dimensionwidth,
          id,
        ],
        (error, results) => {
          if (error) {
            return res.status(400).send(error);
          }
          res.status(200).send(`cart item modified with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    console.log("err");
    return res.status(400).json(err);
  }
});

router.delete("/", middleware, async (req, res) => {
  const { id, email } = req.body;
  if (id === "all") {
    try {
      const userdata = await client.query(
        `select * from users where email = $1;`,
        [email]
      );
      const userarr = userdata.rows;
      if (userarr.length != 0) {
        const data = await client.query(
          `select * from cart where email = (select email from users where email=$1);`,
          [email]
        );
        const arr = data.rows;
        if (arr.length === 0) {
          return res.status(200).json({
            message: "cart is empty.",
            arr: [],
          });
        } else {
          client.query(
            "DELETE FROM cart WHERE email =(SELECT email from users where email=$1)",
            [email],
            (error, results) => {
              if (error) {
                return res.status(400).send(error);
              }
              res.status(200).send(`cart item deleted with ID: ${email}`);
            }
          );
        }
      } else {
        return res.status(400).json({
          message: "no user found.",
        });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    try {
      const data = await client.query(`SELECT * FROM cart WHERE uuid =$1;`, [
        id,
      ]);
      const arr = data.rows;
      if (arr.length === 0) {
        return res.status(404).json({
          error: "product not found.",
        });
      } else {
        client.query(
          "DELETE FROM cart WHERE uuid = $1",
          [id],
          (error, results) => {
            if (error) {
              return res.status(400).send(error);
            }
            res.status(200).send(`cart item deleted with ID: ${id}`);
          }
        );
      }
    } catch (err) {
      return res.status(400).json(err);
    }
  }
});

router.get("/:email", async (req, res) => {
  id = req.params.email;
  try {
    const userdata = await client.query(
      `select * from users where email = $1;`,
      [id]
    );
    const userarr = userdata.rows;
    if (userarr != 0) {
      const data = await client.query(
        `select * from cart where email = (select email from users where email=$1);`,
        [id]
      );
      const arr = data.rows;
      if (arr.length === 0) {
        return res.status(200).json({
          message: "no cart found.",
        });
      } else {
        return res.status(200).json({ arr });
      }
    } else {
      return res.status(400).json({
        message: "no user found.",
      });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
