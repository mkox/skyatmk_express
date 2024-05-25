const express = require("express");
const router = express.Router();

// Require our controllers.
const actor_controller = require("../controllers/actorController");


/// ACTOR ROUTES ///

// GET catalog home page.
router.get("/", actor_controller.index);

// GET request for list of actors.
router.get("/actors", actor_controller.actor_list_get);

// POST request for list of actors.
router.post("/actors", actor_controller.actor_list_post);

// GET request for form to store followers of an actor.
router.get("/followers-of-actor", actor_controller.followers_of_actor_get);

// POST request for form to store followers of an actor.
router.post("/followers-of-actor", actor_controller.followers_of_actor_post);

module.exports = router;
