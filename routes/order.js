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

function id_generator() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
router.post("/", async (req, res) => {
  const oid = id_generator();
  var goldfingersB=req.body
  const {
    orderid,
    uuid,
    base_material,
    layers,
    dimensions,
    dimensionheight,
    dimensionwidth,
    quantity,
    product_type,
    different_design,
    delivery_format,
    pcb_thickness,
    pcb_color,
    silkscreen,
    surface_finish,
    outercopperweight,
    goldfingers,
    confirmproductionfile,
    castellatedHoles,
    flyingprobetest,
    removeordernumber,
    email,
    total,
    filelocation,
  } = req.body;
  let bgoldfingers = goldfingers?"yes":"no";
  let bconfirmproductionfile = confirmproductionfile?"yes":"no";
  let bcastellatedHoles = castellatedHoles?"yes":"no";
  let bremoveordernumber = removeordernumber?"yes":"no";
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]);
    const arr = data.rows;
    if (arr.length != 0) {
      const order = {
        orderid,
        base_material,
        layers,
        dimensions,
        dimensionheight,
        dimensionwidth,
        quantity,
        product_type,
        different_design,
        delivery_format,
        pcb_thickness,
        pcb_color,
        silkscreen,
        surface_finish,
        outercopperweight,
        bgoldfingers,
        bconfirmproductionfile,
        bcastellatedHoles,
        flyingprobetest,
        bremoveordernumber,
        email,
        total,
        filelocation,
      };
      client.query(
        `INSERT INTO orders (  base_material,
            layers,
            dimensions,
            dimensionheight,
            dimensionwidth,
            quantity,
            product_type,
            different_design,
            delivery_format,
            pcb_thickness,
            pcb_color,
            silkscreen,
            surface_finish,
            outercopperweight,
            goldfingers,
            confirmproductionfile,
            castellatedholes,
            flyingprobetest,
            removeordernumber,
            email,orderid,uuid,total,filelocation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24);`,
        [
          order.base_material,
          order.layers,
          order.dimensions,
          order.dimensionheight,
          order.dimensionwidth,
          order.quantity,
          order.product_type,
          order.different_design,
          order.delivery_format,
          order.pcb_thickness,
          order.pcb_color,
          order.silkscreen,
          order.surface_finish,
          order.outercopperweight,
          order.bgoldfingers,
          order.bconfirmproductionfile,
          order.bcastellatedHoles,
          order.flyingprobetest,
          order.bremoveordernumber,
          order.email,
          order.orderid,
          oid,
          order.total,
          order.filelocation,
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(400).json({
              error: "Database error",
            });
          } else {
            res
              .status(200)
              .send({ oid: oid, message: "order added to database" });
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

router.get("/", async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM orders;`);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(200).json({
        error: "Products are empty.",
      });
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
    const data = await client.query(`SELECT * FROM orders WHERE uuid =$1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "order not found.",
      });
    } else {
      // const {
      //   orderid,
      //   Base_material,
      //   Layers,
      //   Dimensions,
      //   Quantity,
      //   product_type,
      //   Different_Design,
      //   delivery_format,
      //   pcb_thickness,
      //   pcb_color,
      //   silkscreen,
      //   surface_finish,
      //   outercopperweight,
      //   goldfingers,
      //   ConfirmProductionFile,
      //   castellatedHoles,
      //   flyingProbeTest,
      //   RemoveOrderNumber,
      //   total,
      //   dimensionheight,
      //   dimensionwidth,
      // } = req.body;
      oid = req.body.oid;
      client.query(
        "UPDATE orders SET orderid=$1 WHERE uuid = $2",
        [oid, id],
        (error, results) => {
          if (error) {
            console.log(error);
            return res.status(400).send(error);
          }
          res.status(200).send(`order item modified with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    console.log("err");
    return res.status(400).json(err);
  }
});

router.delete("/:orderid", async (req, res) => {
  id = req.params.orderid;
  try {
    const data = await client.query(`SELECT * FROM orders WHERE orderid =$1;`, [
      id,
    ]);
    const arr = data.rows;
    if (arr.length === 0) {
      return res.status(404).json({
        error: "product not found.",
      });
    } else {
      client.query(
        "DELETE FROM orders WHERE orderid = $1",
        [id],
        (error, results) => {
          if (error) {
            return res.status(400).send(error);
          }
          res.status(200).send(`order deleted with ID: ${id}`);
        }
      );
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

module.exports = router;
