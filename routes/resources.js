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
      res.redirect("/")
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



  router.get("/", (req, res) => {
    console.log(req.session.user_id);
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      }
      res.render("1_homepage_nl",templateVars);
    } else {
      req.session.user_id = req.params.id;
      const id = req.params.id;
        const query = {
          text: `SELECT DISTINCT resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username, likes.active AS like
          FROM resources
          JOIN users ON resources.user_id = users.id
          JOIN likes ON likes.user_id = users.id
          WHERE likes.active = TRUE OR resources.user_id = $1
          GROUP BY resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username, likes.active`,
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
