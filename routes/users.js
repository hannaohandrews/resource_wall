/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // CJ profile page route to match input id - need to check if correct
  router.get("/profile/:id", (req,res) => {
    db.query(`SELECT * FROM users WHERE id = $1`, [req.params.id])
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // CJ resource url page
  router.get("/resource_url/:id", (req,res) => {
    db.query(`SELECT * FROM resources WHERE id = $1`, [req.params.id])
      .then(data => {
        const resource = data.rows;
        res.json({ resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // CJ user home page with all resources
  router.get("/home_logged_in", (req,res) => {
    db.query(`SELECT * FROM resources JOIN users ON user_id = users(id) JOIN likes ON user_id = users(id) WHERE likes_active = TRUE AND user_id = $1`, [req.params.id])
      .then(data => {
        const resource = data.rows;
        res.json({ resource });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  return router;
};
