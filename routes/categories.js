const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/:id", (req, res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      res.redirect("/home_login_register");
    } else {
      const query = {
        type: `SELECT * FROM resources JOIN resource_categories ON resource_ud = resources(id) JOIN categories ON category_id = categories(id) WHERE category_id = $1`,
        values: [id]
      };
        db
          .query(query)
          .then(result => {
            const templateVars = {
              resource: result.rows
            }
            res.render("8_categories", templateVars);
          })
          .catch(err => console.log(err))
    }
  });
  return router;
};




