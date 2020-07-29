const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/:id", (req, res) => {
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
        JOIN resource_categories ON resource_categories.resource_id = resources.id JOIN categories ON category_id = categories.id
        WHERE category_id = $1
        GROUP BY resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username`,
        values: [id]
      };
        db
          .query(query)
          .then(result => {
            const templateVars = {
              resource: result.rows,
              user : req.session.user_id
            }
            res.render("8_categories", templateVars);
          })
          .catch(err => console.log(err))
    }
  });
  return router;
};




