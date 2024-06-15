const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const { getAllFollowers, getFollowedActor } = require("../lib/actor");
const { getActorLists } = require("../lib/actor-from-mongodb");

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
    numberOfActors: 250,
    howMuchActorSitesTogether: 20
  });
});

// Display list of actors.
exports.actor_list_post = asyncHandler(async (req, res, next) => {
  var actorLists = await getActorLists(req.body);

  res.render("actor_list", { 
    title: "Actor List", 
    followed_actors: actorLists.followedAtpActors, 
    actor_list: actorLists.actorsFinal,
    keywords: req.body.keywords,
    numberOfActors: req.body.how_much_random_actors,
    howMuchActorSitesTogether: req.body.how_much_actor_sites_together
  });
});

exports.followers_of_actor_get = asyncHandler(async (req, res, next) => {
  // const followedAtpActors = await FollowedAtpActor.find({})
  //   .sort({ displayName: 1 })
  //   .exec();

  res.render("followers_of_actor", { 
    title: "Store followers of an actor", 
    followed_actor: ''
  });
});

exports.followers_of_actor_post = asyncHandler(async (req, res, next) => {
  // const followedAtpActors = await FollowedAtpActor.find({})
  //   .sort({ displayName: 1 })
  //   .exec();

  var didOfFollowedActor = await getFollowedActor(req.body.followed_actor);
  getAllFollowers(req.body.followed_actor, didOfFollowedActor);

  res.render("followers_of_actor", { 
    title: "Store followers of an actor", 
    followed_actor: req.body.followed_actor
  });
});