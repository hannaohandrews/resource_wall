// load .env data into process.env
require('dotenv').config({silent: true});

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
// const cors       = require("cors");
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
// app.use(cors);
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  cookie: {maxAge: 36000000, httpOnly: false},
  keys: ['thisismysuperlongstringtouseforcookiesessions', 'thisisasecondlongstring']
}));
// add req.session.user_id = user.id; to app.post login route

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const resourcesRoutes = require("./routes/resources");
const categoriesRoutes = require("./routes/categories");
const { Template } = require('ejs');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
app.use("/resources", resourcesRoutes(db));
app.use("/categories", categoriesRoutes(db));
// Note: mount other resources here, using the same pattern above


// GET registration page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user : req.session.user_id,
    }
    res.render("4_homepage_logged",templateVars);
  } else {
    res.render("2_register");
  }
});

    // HOA POST registration page

app.post("/register", (req,res) => {
  req.session.user_id = req.body.id
  const user = req.body

  const query= {
  text:`INSERT INTO users (username, first_name, last_name, email, password, profile_image_url)
  VALUES ($1, $2, $3,$4,$5,$6)
  RETURNING *`, values : [user.username, user.first_name, user.last_name,user.email, user.password, user.profile_image_url]
  };

   db
  .query(query)
  .then(result => {

    // console.log('result',result)

    // const templateVars = {
    //   resource : res.rows,
    //   user : req.session.user_id,
    //   id : req.params.id
    // }
    // console.log('templateVars',templateVars)
    // res.redirect("/users",templaveVars);
    res.redirect('/')

  })
  .catch(err => console.log(err))
});



// homepage not logged in and logged in
app.get("/", (req, res) => {
  console.log(req.session.user_id);
  if (!req.session.user_id) {
    const templateVars = {
      user : req.session.user_id
    }
    res.render("1_homepage_nl",templateVars);
  } else {
    req.session.user_id = req.params.id;
    const id = req.params.id;
      const query = {
        text: `SELECT DISTINCT resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username, likes.active AS like
        FROM resources
        JOIN users ON resources.user_id = users.id
        JOIN likes ON likes.user_id = users.id
        WHERE likes.active = TRUE OR resources.user_id = $1
        GROUP BY resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username, likes.active`,
        values: [id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: result.rows,
          user : req.session.user_id
        }
        console.log(templateVars)
        res.render("4_homepage_logged", templateVars);
      })
      .catch(err => console.log(err))
  }
});


// GET registration page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user : req.session.user_id
    }
    console.log(req.session.user_id)
    res.render("4_homepage_logged",templateVars);
  } else {
    res.render("2_register");
  }
});


    // HOA POST registration page
app.post("/register", (req,res) => {
  const id = req.params.id;
  req.session.user_id = req.body
  const user = req.body
  const query= {
  text:`INSERT INTO users (username, first_name, last_name, email, password, profile_image_url)
  VALUES ($1, $2, $3,$4,$5,$6)
  RETURNING *`, values : [user.username, user.first_name, user.last_name,user.email, user.password, user.profile_image_url]
  };

  db
  .query(query)
  .then(result => {
  console.log(result.rows[0].id);
    res.redirect("/")
  })
  .catch(err => console.log(err))
});

app.post("/search", (req, res) => {
  const id = req.params.id;
  if (!req.session.user_id) {
    const templateVars = {
      user : req.session.user_id
    }
    res.redirect("/",templateVars);
    return;
  } else {
    const query = {
      text: `SELECT resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username
      FROM resources
      JOIN users ON resources.user_id = users.id
      WHERE title ILIKE $1
      GROUP BY resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username`,
      values: [`%${req.body.search}%`]
    };
    console.log(req.body);
      db
        .query(query)
        .then(result => {
          const templateVars = {
            resource: result.rows,
            user : req.session.user_id
          }
          console.log(result);
          res.render("9_search_result", templateVars);
        })
        .catch(err => console.log(err))
  }
});

app.post("/logout", (req,res) => {
    req.session = null
    res.redirect('/');
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
