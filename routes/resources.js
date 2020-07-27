const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // CJ resource url page
  router.get("/:id", (req,res) => {
    const id = req.params.id;
    if (!req.session.user_id) {
      res.redirect("/1_homepage_nl");
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
      res.redirect("/1_homepage_nl");
    } else {
      res.render("7_add_new");
    }
  });

  return router;
};



// const express = require('express');
// const router = express.Router();
// ​
// module.exports = (db) => {
// ​
// ​
//   // direct to resource page
//   router.get("/:id", (req, res) => {
// ​
//     // get the id
//     const id = req.params.id;
// ​
//     if (!req.session.user_id) {
//       res.redirect("/home_login_register");
//     } else {
// ​
//       // data
//       // do sql here
// ​
//       const query = {
//         type: `SELECT * FROM resources WHERE id = $1`,
//         values: [id]
//       };
// ​
//       db
//         .query(query)
//         .then(result => {
// ​
//           const templateVars = {
//             resource: result.rows[0]
//           }
// ​
//           res.render("resource_url", templateVars);
// ​
//         })
//         .catch(err => console.log(err))
// ​
// ​
//     }
//   });
// ​
//   // direct to add new resource page(will need page name checking)
//   router.get("/new", (req, res) => {
//     // display the form to create a new resource
//     if (!req.session.user_id) {
//       res.redirect("/home_login_register");
//     } else {
//       res.render("resource_new");
//     }
//   });
// ​
// ​
// ​
//   return router;
// };


// // direct to resource page


// // direct to add new resource page (will need page name checking)
// app.get ("/resource_new", (req, res) => {
//   if (!req.session.user_id) {
//     res.redirect("/1_homepage_nl");
//   } else {
//     res.render("7_add_new");
//   }
// });

// //Direct to logged in home page
// router.get ("/home_logged_in", (req, res) => {
//   if (!req.session.user_id) {
//     res.redirect("/1_homepage_nl");
//   } else {
//     const query = {
//       type: `SELECT * FROM resources JOIN users ON user_id = users(id) JOIN likes ON user_id = users(id) WHERE likes_active = TRUE OR user_id = $1`,
//       values: [id]
//     }
//     db
//     .query(query)
//     .then(result => {
//       const templateVars = {
//         resource: result.rows
//       }
//       res.render("homepage_logged", templateVars);
//     })
//     .catch(err => console.log(err))
// }
// });

// router.get("/:id", (req, res) => {
//   const id = req.params.id;
//   if (!req.session.user_id) {
//     res.redirect("/home_login_register");
//   } else {
//     const query = {
//       type: `SELECT * FROM resources JOIN resource_categories ON resource_ud = resources(id) JOIN categories ON category_id = categories(id) WHERE category_id = $1`,
//       values: [id]
//     };
//       db
//         .query(query)
//         .then(result => {
//           const templateVars = {
//             resource: result.rows
//           }
//           res.render("8_categories", templateVars);
//         })
//         .catch(err => console.log(err))
//   }
// return router;
// });
