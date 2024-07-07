const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const { getAllFollowers, getFollowedActor, getAndStoreFollowedByStandardActor } = require("../lib/actor");
const { getActorLists, getFollowedByDate, getFollowedAtpActors, updateOpenDate } = require("../lib/actor-from-mongodb");

exports.index = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "Sky at MK - Home",
  });
});

// Display list of actors.
exports.actor_list_get = asyncHandler(async (req, res, next) => {
  const followedAtpActors = await getFollowedAtpActors();

  res.render("actor_list", { 
    title: "Actor List", 
    followed_actors: followedAtpActors, 
    actor_list: [],
    numberOfActors: 250,
    howMuchActorSitesTogether: 20,
    remove_followed_by_standard_follower_CHECKED: true,
    remove_following_standard_follower_CHECKED: true,
    remove_once_followed_by_standard_follower_CHECKED: true,
  });
});

// Display list of actors.
exports.actor_list_post = asyncHandler(async (req, res, next) => {
  const action = req.body.action;
  var actorLists = {};
  var followedAtpActors = [];
  var actorsFinal = [];
  if (action == 'mainForm') {
    actorLists = await getActorLists(req.body);
    followedAtpActors = actorLists.followedAtpActors;
    actorsFinal = actorLists.actorsFinal
  } else if (action == 'dateRange') {
    actorLists = await getFollowedByDate(req.body);
    followedAtpActors = actorLists.followedAtpActors;
    actorsFinal = actorLists.actorsFinal
  }

  res.render("actor_list", { 
    title: "Actor List", 
    followed_for_random_actors: req.body.followed_for_random_actors,
    followed_actors: followedAtpActors, 
    actor_list: actorsFinal,
    keywords: req.body.keywords,
    numberOfActors: req.body.how_much_random_actors,
    howMuchActorSitesTogether: req.body.how_much_actor_sites_together,
    all_followed_for_random_actors_CHECKED: (req.body.all_followed_for_random_actors == 'on') ? true : false,
    remove_followed_by_standard_follower_CHECKED: (req.body.remove_followed_by_standard_follower == 'on') ? true : false,
    remove_following_standard_follower_CHECKED: (req.body.remove_following_standard_follower == 'on') ? true : false,
    remove_once_followed_by_standard_follower_CHECKED: (req.body.remove_once_followed_by_standard_follower == 'on') ? true : false,
    show_despite_open_date_exists_CHECKED: (req.body.show_despite_open_date_exists == 'on') ? true : false,
    sort_by_in_how_much_selected_followed_actors_CHECKED: (req.body.sort_by_in_how_much_selected_followed_actors == 'on') ? true : false,
    following_start_date: req.body.following_start_date,
    following_end_date: req.body.following_end_date,
  });
});

exports.followers_of_actor_get = asyncHandler(async (req, res, next) => {
  // const followedAtpActors = await FollowedAtpActor.find({})
  //   .sort({ displayName: 1 })
  //   .exec();

  res.render("followers_of_actor", { 
    title: "Store followers of an actor", 
    followed_actor: process.env.STANDARD_FOLLOWER_DID
  });
});

exports.followers_of_actor_post = asyncHandler(async (req, res, next) => {
  if(req.body.followed_actor ==  process.env.STANDARD_FOLLOWER_DID) {
    await getAndStoreFollowedByStandardActor(); // before getAllFollowers because of standardFollower.isFollowing
  }
  var didOfFollowedActor = await getFollowedActor(req.body.followed_actor);
  await getAllFollowers(req.body.followed_actor, didOfFollowedActor);

  res.render("followers_of_actor", { 
    title: "Store followers of an actor", 
    followed_actor: req.body.followed_actor
  });
});

exports.update_open_date_post = asyncHandler(async (req, res, next) => {
  response = await updateOpenDate(req.body);
  res.json(response);
});