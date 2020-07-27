const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // CJ resource url page
  router.get("/5_url_desc/:id", (req,res) => {
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
  router.get("/4_homepage_logged_in", (req,res) => {
    db.query(`SELECT * FROM resources JOIN users ON user_id = users(id) JOIN likes ON user_id = users(id) WHERE likes_active = TRUE OR user_id = $1`, [req.params.id])
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

    // CJ user category page with all matching resources
    router.get("/category/:id", (req,res) => {
      db.query(`SELECT * FROM resources JOIN resource_categories ON resource_ud = resources(id) JOIN categories ON category_id = categories(id) WHERE category_id = $1`, [req.params.id])
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
