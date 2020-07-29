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
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
    }else {
      const query = {
        type: `SELECT * FROM resources
        JOIN users ON resources.user_id = users.id
        JOIN likes ON likes.user_id = users.id
        WHERE likes.active = TRUE OR resources.user_id = $1`,
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



  // LOGOUT
  router.post("/logout", (req,res) => {
    res.clearCookie("user_id",{path:"/"});
    res.redirect('/login');
  });

  // CJ profile page route to match input id - need to check if correct
  router.get("/profile/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/1_homepage_nl",templateVars);
    } else {
      const query = {
        type: `SELECT username, first_name, last_name, date_of_birth, email, profile_image_url FROM users WHERE id = $1`,
        values: [id]
      };
        db
          .query(query)
          .then(result => {
            const templateVars = {
              resource: result.rows[0]
            }
            console.log(templateVars);
            res.render("6_profile", templateVars);
          })
          .catch(err => console.log(err))
    }
  });



  // homepage not logged in and logged in
  router.get("/", (req, res) => {
    console.log(req.session.user_id);
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/1_homepage_nl",templateVars);
    } else {
      const templateVars = {
        user : req.session.user_id
      }
      res.render("4_homepage_logged",templateVars);
    }
  });



  return router;
};


