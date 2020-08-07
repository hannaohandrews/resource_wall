/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // CJ function to remove duplcates recieved back from /login/:id
  function removeDups(names) {
    let unique = {};
    names.forEach(function(i) {
      if (!unique[i.id]) {
        unique[i.id] = i;
      }
    });
    let unArr = Object.values(unique);
    return unArr;
  }

  // CJ function to get like information called in router.post("/:id/like")
  const updateLike = (res, id)=>{
    console.log(`id for update like: ${id}`);
    // req.session.user_id = req.params.id;
    // const id = req.params.id;
    const query = {
      text: `SELECT DISTINCT resources.id, resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username, likes.active AS like
      FROM resources
      JOIN users ON resources.user_id = users.id
      JOIN likes ON likes.user_id = users.id
      WHERE likes.active = TRUE OR resources.user_id = $1
      GROUP BY resources.id, resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username, likes.active`,
      values: [id]
    };
    db
      .query(query)
      .then(result => {
        let arr = removeDups(result.rows.reverse());
        const templateVars = {
          resource: [],
          user : id
        };
        //console.log("=====success update like", JSON.stringify(arr))
        res.render("4_homepage_logged", templateVars);
      })
      .catch(err => console.log(err));
  };


  // CJ user home page with all resources
  router.get("/login/:id", (req, res) => {
    console.log(req.session);
    req.session.user_id = req.params.id;
    const id = req.params.id;
    const query = {
      text: `SELECT DISTINCT resources.id, resources.title, resources.resource_url, resources.resource_image_url, ROUND(AVG(resources.rating), 1) AS rating, users.username AS username, likes.active AS like
        FROM resources
        JOIN users ON resources.user_id = users.id
        JOIN likes ON likes.user_id = users.id
        WHERE likes.active = TRUE OR resources.user_id = $1
        GROUP BY resources.id, resources.title, resources.resource_url, resources.description, resources.resource_image_url, resources.rating, resources.user_id, users.username, likes.active`,
      values: [id]
    };
    db
      .query(query)
      .then(result => {
        const templateVars = {
          resource: removeDups(result.rows),
          user : req.session.user_id
        };
        //console.log("=====", req.session.user_id);
        res.render("4_homepage_logged", templateVars);
      })
      .catch(err => console.log(err));
  });


  // HOA Logout
  router.post("/logout", (req, res) => {
    res.clearCookie("user_id", {
      path: "/"
    });
    res.redirect('/login');
  });

  // CJ profile page route to match input id (bypass login process)
  router.get("/profile/:id", (req, res) => {
    const id = req.params.id;
    console.log("id:", id);
    if (!req.session.user_id) {
      const templateVars = {
        user: req.session.user_id
      };
      res.redirect("/", templateVars);
    } else {
      const query = {
        text: `SELECT username, first_name, last_name, email, profile_image_url FROM users WHERE id = $1`,
        values: [id]
      };
      db
        .query(query)
        .then(result => {
          const templateVars = {
            users: result.rows[0],
            user: req.session.user_id
          };
          console.log("result", result);
          res.render("6_profile", templateVars);
        })
        .catch(err => console.log(err));
    }
  });

  // CJ Update profile details and re-render updated page
  router.post("/profile/:id", (req, res) => {
    const id = req.session.user_id;
    console.log("id:", id);
    if (!req.session.user_id) {
      const templateVars = {
        user: req.session.user_id
      };
      res.redirect("/", templateVars);
      return;
    } else {
      const user = req.body;
      console.log(user);
      const query = {
        text: `UPDATE users
      SET username = $1,
      first_name = $2,
      last_name = $3,
      email = $4,
      profile_image_url = $5
      WHERE id = $6
      RETURNING *`, values : [user.username, user.first_name, user.last_name, user.email, user.profile_image_url, id]
      };
      db
        .query(query)
        .then(result => {
          const templateVars = {
            users: result.rows[0],
            user: req.session.user_id
          };
          console.log("result", result);
          res.render("6_profile", templateVars);
        })
        .catch(err => console.log(err));
    }
  });

  //CJ Validate if post is already liked by user and like/unlike accordingly
  router.post("/:id/like", (req,res) => {

    console.log(req.session.user_id);
    console.log("req.params:", req.params);
    console.log("req:", req.body);

    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      };
      res.redirect(200, "/",templateVars);
      return;
    } else {
      let likeStatus = req.body.likeStatus;
      let queryText;
      console.log(`likeStatus: ${likeStatus}`);
      if (likeStatus === 'true') {
        queryText = 'UPDATE likes SET active = false WHERE user_id = $1 AND resource_id = $2 RETURNING *';
      } else {
        queryText = 'UPDATE likes SET active = true WHERE user_id = $1 AND resource_id = $2 RETURNING *';
      }
      const query = {
        text: queryText,
        values: [req.session.user_id, req.params.id]
      };
      db.query(query)
        .then(result =>
          console.log(result.rows),
        console.log("liked"),
        updateLike(res, req.session.user_id),
        )
        .catch(err => console.log(err));
    }
  });

  //CJ duplicate of homepage logged in via users/ route
  router.get("/", (req, res) => {
    console.log(req.session.user_id);
    if (!req.session.user_id) {
      const templateVars = {
        user : req.session.user_id
      };
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
      };
      db
        .query(query)
        .then(result => {
          const templateVars = {
            resource: result.rows,
            user : req.session.user_id
          };
          console.log(templateVars);
          res.render("4_homepage_logged", templateVars);
        })
        .catch(err => console.log(err));
    }
  });

  return router;
};
