const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "Sky at MK - Home",
  });
});

// Display list of actors.
exports.actor_list_get = asyncHandler(async (req, res, next) => {
  const followedAtpActors = await FollowedAtpActor.find({})
    .sort({ displayName: 1 })
    .exec();

  res.render("actor_list", { title: "Actor List", followed_actors: followedAtpActors, actor_list: [] });
});

// Display list of actors.
exports.actor_list_post = asyncHandler(async (req, res, next) => {
  const [followedAtpActors, actors] = await Promise.all([
    FollowedAtpActor.find({})
      .sort({ displayName: 1 })
      .exec(),
    AtpActor.find({}).exec(),
  ]);

  res.render("actor_list", { title: "Actor List", followed_actors: followedAtpActors, actor_list: actors });
});
