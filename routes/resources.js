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
    console.log('req.paras',req.params)
    console.log('req.session',req.session)
    const id = req.params.id;
    if (!req.session.user_id) {
      const templateVars = {
        user: req.session.user_id
      }
      res.render("1_homepage_nl",templateVars);
    } else {
      const query = {
        text: `SELECT * FROM resources WHERE id = $1`,
        values: [id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          user: req.session.user_id,
          resource: result.rows[0]
        }
        res.render("5_url_desc", templateVars);
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

  return router;
};


//router.post("resources/id") -> add comment, cateory, //
// //const promises = [];
// if (conditionOne) {
//   promises.push(promiseOne);
// }
// if (conditionTwo) {
//   promises.push(promiseTwo);
// }
// if (conditionThree) {
//   promises.push(promiseThree);
// }
// Promise.all(promises).then(() => console.log('all done'));
// ONE BUTTON DIRECTING TO SOMEWHERE

