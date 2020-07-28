const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/new", (req, res) => {
    if (!req.session.user_id) {
      res.render("/users/");
    } else {
      res.render("7_add_new");
    }
  });



  // CJ resource url page
  router.get("/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      res.redirect("/1_homepage_nl");
    } else {
      const query = {
        text: `SELECT * FROM resources WHERE id = $1`,
        values: [id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: result.rows[0]
        }
        res.render("5_url_desc", templateVars);
      })
      .catch(err => console.log(err))
    }
  });



  return router;
};
