const express = require("express");
const router = express.Router();

// Require our controllers.
const actor_controller = require("../controllers/actorController");


/// ACTOR ROUTES ///

// GET catalog home page.
router.get("/", actor_controller.index);

// GET request for list of list of actors.
router.get("/actors", actor_controller.actor_list_get);

// GET request for list of list of actors.
router.post("/actors", actor_controller.actor_list_post);

module.exports = router;
