/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // CJ user home page with all resources
  router.get ("/login/:id", (req, res) => {
    req.session.user_id = req.params.id;
    const id = req.params.id;

      const query = {
        text: `SELECT * FROM resources
        JOIN users ON resources.user_id = users.id
        JOIN likes ON likes.user_id = users.id
        WHERE likes.active = TRUE OR resources.user_id = $1`,
        values: [id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: result.rows
        }
        console.log(templateVars)
        res.render("4_homepage_logged", templateVars);
      })
      .catch(err => console.log(err))

  });

  router.get("/", (req, res) => {
    if (!req.session.user_id) {
      res.render("1_homepage_nl");
    } else {
      res.render("4_homepage_logged");
    }
  });

  // registration page
  router.get("/register", (req, res) => {
    if (req.session.user_id) {
      res.render("4_homepage_logged");
    } else {
      res.render("2_register");
    }
  });

  // CJ profile page route to match input id - need to check if correct
  router.get("/profile/:id", (req,res) => {
    const id = req.params.id;
    console.log("id:", id)
    if (!req.session.user_id) {
      res.redirect("1_homepage_nl");
    } else {
      const query = {
        text: `SELECT username, first_name, last_name, date_of_birth, email, profile_image_url FROM users WHERE id = $1`,
        values: [id]
      };
        db
          .query(query)
          .then(result => {
            const templateVars = {
              user: result.rows[0]
            }
            console.log("result" , result);
            res.render("6_profile", templateVars);
          })
          .catch(err => console.log(err))
    }
  });

  router.post("/profile/:id", (req,res) => {
    if (!req.session.user_id) {
      res.redirect("1_homepage_nl");
      return;
    } else {
    const user = req.body
    console.log(user)
    const query= {
    text:`INSERT INTO users (username, first_name, last_name, date_of_birth, email, password, profile_image_url)
  VALUES ($1, $2, $3,$4,$5,$6,$7)
  RETURNING *`, values : [user.username, user.first_name, user.last_name, user.date_of_birth,user.email, user.password, user.profile_image_url]
  }
  db
  .query(query)
  .then(result =>
    res.redirect("/HOMELOG")
  )
  .catch(err => console.log(err))
    }
  });

    router.post("/register", (req,res) => {
      if (req.session.user_id) {
        res.render("4_homepage_logged")
        return;
      } else {
      const user = req.body
      console.log(user)
      const query= {
      text:`INSERT INTO users (username, first_name, last_name, date_of_birth, email, password, profile_image_url)
    VALUES ($1, $2, $3,$4,$5,$6,$7)
    RETURNING *`, values : [user.username, user.first_name, user.last_name, user.date_of_birth,user.email, user.password, user.profile_image_url]
    }
    db
    .query(query)
    .then(result =>
      res.redirect("/HOMELOG")
    )
    .catch(err => console.log(err))
      }
    });

  return router;
};
