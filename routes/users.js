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
      res.redirect("/1_homepage_nl");
    } else {
      const query = {
        type: `SELECT * FROM resources JOIN users ON user_id = users(id) JOIN likes ON user_id = users(id) WHERE likes_active = TRUE OR user_id = $1`,
        values: [user_id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: result.rows
        }
        res.render("4_homepage_logged", templateVars);
      })
      .catch(err => console.log(err))
    }
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
      res.redirect("4_homepage_logged_in");
    } else {
      res.render("2_register");
    }
  });

  // CJ profile page route to match input id - need to check if correct
  router.get("/profile/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      res.redirect("1_homepage_nl");
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
            res.render("6_profile", templateVars);
          })
          .catch(err => console.log(err))
    }
  });

  return router;
};


// app.get('/login/:id', (req, res) => {
//   req.session.user_id = req.params.id;
//   res.redirect('/');
// });



// router.get("/login/:id", (req, res) => {
//   req.session.user_id = req.params.id;
//   const id = req.params.id;
//   if (!req.session.user_id) {
//     res.redirect("/home_login_register");
//   } else {
//     const query = {
//       type: `SELECT * FROM users WHERE id = $1`,
//       values: [id]
//     };
//       db
//         .query(query)
//         .then(result => {
//           const templateVars = {
//             resource: result.rows
//           }
//           res.render("6_profile", templateVars);
//         })
//         .catch(err => console.log(err))
//   }
// return router;
// });
