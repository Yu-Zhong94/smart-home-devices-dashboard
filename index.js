// var http = require("http");

// http
//   .createServer(function(req, res) {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.write("Welcome to the mid-term application! \n\n");
//     res.write("This application must run on PORT 8089");
//     res.end();
//   })
//   .listen(8089, function() {
//     console.log("Node server is running...");
//   });
  const express = require ("express");
  const session = require('express-session');
  const flash = require('connect-flash');
  const bodyParser = require ("body-parser");
  const app = express();
  const mysql = require("mysql");
  const port = 8089;

  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
  }));
  app.use(express.static(__dirname + '/views'));
  app.use(flash());
  const db = mysql.createConnection ({
   host: "localhost",
   user: "root",
   password: "current password",
   database: "mySmartHome" });
  // connect to database
  db.connect((err) => {
   if (err) {
   throw err;
   }
   console.log("Connected to database");
  });
  global.db = db;
  require("./routes/main")(app);
  app.set("views",__dirname + "/views");
  app.set("view engine", "ejs");
  app.engine("html", require("ejs").renderFile);
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));