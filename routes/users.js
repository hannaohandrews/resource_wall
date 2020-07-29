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
        text: `SELECT resources.id, resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username, likes.active AS like
        FROM resources
        JOIN users ON resources.user_id = users.id
        JOIN likes ON likes.user_id = users.id
        WHERE likes.active = TRUE OR resources.user_id = $1
        GROUP BY resources.id, resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username, likes.active`,
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
  });

  // LOGOUT
  router.post("/logout", (req,res) => {
    res.clearCookie("user_id",{path:"/"});
    res.redirect('/login');
  });

  // CJ profile page route to match input id - need to check if correct
  router.get("/profile/:id", (req,res) => {
    const id = req.params.id;
    console.log("id:", id)
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
    } else {
      const query = {
        text: `SELECT username, first_name, last_name, email, profile_image_url FROM users WHERE id = $1`,
        values: [id]
      };
        db
          .query(query)
          .then(result => {
            const templateVars = {
              users: result.rows[0],
              user : req.session.user_id
            }
            console.log("result" , result);
            res.render("6_profile", templateVars);
          })
          .catch(err => console.log(err))
    }
  });

  router.post("/profile/:id", (req,res) => {
    const id = req.session.user_id;
    console.log("id:" ,id)
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
      return;
    } else {
    const user = req.body
    console.log(user)
    const query= {
    text:`UPDATE users
    SET username = $1,
    first_name = $2,
    last_name = $3,
    email = $4,
    profile_image_url = $5
    WHERE id = $6
    RETURNING *`, values : [user.username, user.first_name, user.last_name, user.email, user.profile_image_url, id]
    }
    db
    .query(query)
    .then(() => {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect(`/users/login/${id}`, 200);
    })
    .catch(err => console.log(err))
    }
  });

  return router;
};


