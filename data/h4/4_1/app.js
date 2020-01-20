const express = require("express");
const helmet = require("helmet");
const xssFilters = require("xss-filters");
const mysql = require("mysql");
const app = express();
const validator = require("mysql-validator");

app.use(helmet());
app.use(express.json());

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "MyUnsafePassword",
  database: "Biota"
});

app.get("/species", (req, res) => {
  console.log(req.body);
  pool.query("SELECT * FROM Fauna", (error, results, fields) => {
    if (error) {
      console.log("ERROR: ", error);
      res.statusCode = 404;
      res.status(500).end("Error");
      return;
    }

    console.log("results = ", results);
    res.setHeader("Content-Type", "text/html");

    res.write(
      `
        <html>
        <head>
        <title>Animals in Database</title>
        </head>
        <body>
        <h1>Animals:</h1>
        <ul>
        `
    );

    results.forEach(i => {
      res.write(`
            <li>
            <p>Name = ${xssFilters.inHTMLData(i.speciesName)}</p>
            <p>Weight = ${xssFilters.inHTMLData(i.maximumWeight)}</p>
            </li>`);
    });

    res.end(`
        </ul>
        </body>
        </html>
        `);
  });
});

app.post("/species", (req, res) => {
  // Validation
  let errors = validate(req);

  if (errors.length) {
    res.status(500).end("Error in query");
    return;
  }

  pool.query("INSERT INTO Fauna SET ? ", req.body, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).end(err);
      return;
    }

    res.status(201).end();
  });
});

const validate = req => {
  let errors = [];

  const types = {
    speciesName: "varchar(20)",
    maximumWeight: "bigint"
  };

  for (let k in req.body) {
    let err = validator.check(req.body[k], types[k]);
    if (err)
      errors.push({
        name: k,
        error: err.message
      });
  }
  return errors;
};

app.get("*", (req, res) => {
  res.status(404).end("Not found");
});

app.listen(3000, () => {
  console.log("App listening on port 3000!");
});