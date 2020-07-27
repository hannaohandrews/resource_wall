// load .env data into process.env
require('dotenv').config({silent: true});

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ['thisismysuperlongstringtouseforcookiesessions', 'thisisasecondlongstring']
}));
// add req.session.user_id = user.id; to app.post login route

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const resourcesRoutes = require("./routes/resources");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/resources", resourcesRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

//CJ updated to render login page or main logged in page
app.get("/", (req, res) => {
  // if (!req.session.user_id) {
  //   res.redirect("/home_login_register");
  // } else {
    res.render("1_homepage_nl");
  // }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


//CJ Routes to be moved elsewhere(?)


// registration page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/4_homepage_logged_in");
  } else {
    res.render("2_register");
  }
});

// direct to resource page
app.get("/resource/:id", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/1_homepage_nl");
  } else {
    res.render("5_url_desc");
  }
});

// direct to add new resource page (will need page name checking)
app.get ("/resource_new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/1_homepage_nl");
  } else {
    res.render("7_add_new");
  }
});

//Direct to logged in home page
app.get ("/home_logged_in", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/1_homepage_nl");
  } else {
    res.render("4_homepage_logged_in");
  }
});

//Direct to categories page
app.get ("/category/:id", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/1_homepage_nl");
  } else {
    res.render("8_categories");
  }
});
