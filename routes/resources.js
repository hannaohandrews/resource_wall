const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/new", (req, res) => {
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
    } else {
      const templateVars = {
        user : req.session.user_id
      }
      res.render("7_add_new", templateVars);
    }
  });

  // CJ resource url page
  router.get("/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
    } else {
      const promiseOne = db.query('SELECT resources.id, resources.title, resources.resource_url, resources.description, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username      FROM resources JOIN users ON resources.user_id = users.id WHERE resources.id = $1 GROUP BY resources.id, resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username', [id]);

      const promiseTwo = db.query('SELECT categories.title AS category FROM categories JOIN resource_categories ON category_id = categories.id JOIN resources ON resource_id = resources.id WHERE resources.id = $1', [id]);

      const promiseThree = db.query('SELECT comment_text AS comments FROM comments JOIN users ON user_id = users.id JOIN resources ON resource_id = resources.id WHERE resources.id = $1', [id]);

      const promises = [promiseOne, promiseTwo, promiseThree];
      Promise.all(promises)
      // .then(() => console.log('all done'));
      // db
      // .query(query)
      .then(result => {
        const templateVars = {
          resource: result[0].rows[0],
          categories: result[1].rows,
          comments: result[2].rows,
          user : req.session.user_id
        }
        console.log(templateVars)
        res.render("5_url_desc", templateVars);
        //console.log("result:", result)
      })
      .catch(err => console.log(err))
    }
  });

  router.post("/new", (req,res) => {
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
      return;
    } else {
    const resource = req.body
    const user = req.session.user_id
    console.log(resource)
    const query= {
    text:`INSERT INTO resources (title, resource_url, description, resource_image_url, rating, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`, values : [resource.title, resource.url, resource.description, resource.resource_image_url,resource.rating, user]
    }
    db
    .query(query)
    .then(result =>
      res.redirect("/4_homepage_logged")
    )
    .catch(err => console.log(err))
      }
    });

  router.post("/:id/like", (res,req) => {
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
      return;
    } else {
      const likeStatus = req.body.likeStatus;
      let queryText;
      if (likeStatus === true) {
        queryText = 'UPDATE likes SET active = false WHERE user_id = $1 AND resource_id = $2';
      } else {
        queryText = 'UPDATE likes SET active = true WHERE user_id = $1 AND resource_id = $2';
      }
      const query = {
        text: queryText,
        values: [req.session.user_id, req.params]
      }
      db.query(query)
      .then(() => res.send(200) )
      .catch(err => console.log(err))
    }
  });

  return router;
};
