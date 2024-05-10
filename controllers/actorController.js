const AtpActor = require("../models/atp-actor");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "Sky at MK - Home",
  });
});

// Display list of actors.
exports.actor_list_get = asyncHandler(async (req, res, next) => {
  // const actors = await AtpActor.find({})
  //   .exec();

  // res.render("actor_list", { title: "Actor List", actor_list: actors });
  res.render("actor_list", { title: "Actor List", actor_list: [] });
});

// Display list of actors.
exports.actor_list_post = asyncHandler(async (req, res, next) => {
  const actors = await AtpActor.find({})
    .exec();

  res.render("actor_list", { title: "Actor List", actor_list: actors });
});
