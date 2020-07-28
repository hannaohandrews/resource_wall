const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // CJ resource url page
  router.get("/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/1_homepage_nl",templateVars);
    } else {
      const query = {
        type: `SELECT * FROM resources WHERE id = $1`,
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

  router.get ("/new", (req, res) => {
      if (!req.session.user_id) {
        const templateVars = {
          user : req.session.user_id
        }
        res.redirect("/1_homepage_nl",templateVars);
    } else {
      res.render("7_add_new");
    }
  });

  return router;

  return db.query(`
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *`, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night * 100, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
  .then(res => res.rows[0])
  .catch('Unable to add property');
  router.post('/properties', (req, res) => {
    const userId = req.session.userId;
    database.addProperty({...req.body, owner_id: userId})
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });


};


