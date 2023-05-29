import express from "express";
import xmlbuilder from "xmlbuilder";
import BodyParser from "body-parser";
import bodyParserXml from "body-parser-xml";
import { config } from "./config.js";
import { pool } from "./db.js";

const app = express();

bodyParserXml(BodyParser);
app.use(
  BodyParser.xml({
    xmlParseOptions: {
      normalize: true,
      normalizeTags: true,
      explicitArray: false,
    },
  })
);

//? Token verification
const verifyToken = (req, res, next) => {
  const token = req.params.token;
  if (token != "URB_ c0s18fd185") {
    const xml = xmlbuilder
      .create("error")
      .ele("message", "Invalid Token")
      .end({ pretty: true });

    res.status(401).send(xml);
  }
  next();
};

//? Generate ticket for payment
const generateTicket = () => {
  const ticket = Math.floor(Math.random() * 1000000000);
  return ticket.toString();
};

//? Post petition
app.post("/service/:token/pay", [verifyToken], async (req, res) => {
  const token = req.params.token;
  const { client, amount } = req.body.osl;
  const ticket = generateTicket();
  pool
    .query(
      "INSERT INTO payments (client, ticket, amount) VALUES ($1, $2, $3)",
      [client, ticket, amount]
    )
    .then(async () => {
      const insertedPayment = await pool.query(
        "SELECT client, ticket, TO_CHAR(trandate, 'YYYYMMDDHH24MISS') AS tranDate, amount FROM payments WHERE ticket = $1",
        [ticket]
      );

      const xml = xmlbuilder
        .create("OSL", { version: "1.0", encoding: "UTF-8" })
        .att("version", "1.0")
        .ele("token", token)
        .up()
        .ele("client", insertedPayment.rows[0].client)
        .up()
        .ele("ticket", insertedPayment.rows[0].ticket)
        .up()
        .ele("tranDate", insertedPayment.rows[0].trandate)
        .up()
        .ele("amount", insertedPayment.rows[0].amount)
        .up()
        .end({ pretty: true });

      res.status(200).send(xml);
    })
    .catch((err) => {
      const xml = xmlbuilder
        .create("error")
        .ele("message", "Database error")
        .up()
        .ele("error", err.message)
        .up()
        .end({ pretty: true });

      res.status(500).send(xml);
    });
});

//? Get petition
app.get("/service/:token/consulta", [verifyToken], async (req, res) => {
  const token = req.params.token;
  const client = req.query.client;

  pool
    .query(
      "SELECT client, ticket, TO_CHAR(trandate, 'YYYYMMDDHH24MISS') AS tranDate, amount FROM payments WHERE client = $1 ORDER BY trandate DESC",
      [client]
    )
    .then((result) => {
      const xml = xmlbuilder
        .create("OLS", { version: "1.0", encoding: "UTF-8" })
        .att("version", "1.0")
        .ele("token", token)
        .up()
        .ele("client", client)
        .up();

      const concepts = xml.ele("concepts");
      result.rows.forEach((row) => {
        concepts
          .ele("concept")
          .ele("tranDate", row.trandate)
          .up()
          .ele("ticket", row.ticket)
          .up()
          .ele("amount", row.amount)
          .up()
          .ele("message", "TRANSACCIÓN COMPLETADA")
          .up()
          .up();
      });

      const finalXml = xml.end({ pretty: true });
      res.status(200).send(finalXml);
    })
    .catch((err) => {
      const xml = xmlbuilder
        .create("error")
        .ele("message", err.message)
        .end({ pretty: true });

      res.status(404).send(xml);
    });
});

app.listen(config.PORT);
console.log(`Server on port ${config.PORT}`);
