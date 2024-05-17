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

  res.render("actor_list", { 
    title: "Actor List", 
    followed_actors: followedAtpActors, 
    actor_list: [],
    numberOfUsers: 250
  });
});

// Display list of actors.
exports.actor_list_post = asyncHandler(async (req, res, next) => {
  var keywordsearch = { did: { $exists: true } };
  if (req.body.keywords != '') {
   keywordsearch = { $text: { $search: req.body.keywords } };
  }

  var numberOfUsers = req.body.how_much_random_users;
  var sampleSize = parseInt(numberOfUsers) * 10;

  const [followedAtpActors, actors] = await Promise.all([
    FollowedAtpActor.find({})
      .sort({ displayName: 1 })
      .exec(),
    AtpActor.aggregate([
      { $match : keywordsearch }, // $text match only works, when on first place
      { $sample: { size: sampleSize } }
    ])
  ]);

  var actorsFinal = actors.slice(0, parseInt(numberOfUsers));

  res.render("actor_list", { 
    title: "Actor List", 
    followed_actors: 
    followedAtpActors, 
    actor_list: actorsFinal,
    keywords: req.body.keywords,
    numberOfUsers: req.body.how_much_random_users
  });
});