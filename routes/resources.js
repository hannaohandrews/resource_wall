const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // CJ Making a new resource  GET
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

 // CJ Making a new resource POST
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


  // CJ resource url page GET
  router.get("/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
    } else {
      const query = {
        text: `
        SELECT resources.id,resources.title, resources.resource_url, resources.description, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, resources.user_id AS user_id
        FROM resources WHERE id = $1
        GROUP BY resources.id,resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id`,
        values: [id]
      }
      db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: result.rows[0],
          user : req.session.user_id,
          id : req.params.id
        }
        res.render("5_url_desc", templateVars);
      })
      .catch(err => console.log(err))
    }
  });

  // HOA resource url page POST
  router.post("/:id", (req,res) => {
    console.log('hello')
    if (!req.session.user_id) {
      console.log('user not logged in')
      const templateVars = {
        user : req.session.user_id
      }
      res.redirect("/",templateVars);
      return;

    } else {
    const promises = [];
    const resource_id = req.params.id;
    const user_id = req.session.user_id;

    const category = req.body.category;
    const rating = req.body.rating;
    const comment = req.body.comment

    const promiseOne = db.query (
      'INSERT INTO resource_categories(category_id, resource_id) VALUES ($1,$2)',
      [category,resource_id]);

     const promiseTwo = db.query (
     'INSERT INTO ratings(rating, user_id, resource_id) VALUES ($1,$2,$3)',
     [rating, user_id,resource_id]);

     const promiseThree = db.query (
      'INSERT INTO comments (comment_text, user_id, resource_id) VALUES ($1,$2,$3)',
      [comment,user_id,resource_id]);

    if (req.body.categories){
      promises.push(promiseOne);
    }
    if (req.body.rating){
      promises.push(promiseTwo);
    }
      if (req.body.comment){
      promises.push(promiseThree);
    }

    Promise.all(promises)

    .then(result =>{

    res.redirect('users/login/:id')
    console.log('redirected')
    })
    .catch(err => console.log(err))
    }
  });



  return router;
};
