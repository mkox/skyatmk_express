const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");

exports.getActorLists = async function (body) {
  var isFollowingIds;

  const STANDARD_FOLLOWER_DID = process.env.STANDARD_FOLLOWER_DID;
  if (!STANDARD_FOLLOWER_DID) {
    throw new Error(
      "Please define the STANDARD_FOLLOWER_DID environment variable inside .env.local",
    );
  }

  excludedFollowerId = STANDARD_FOLLOWER_DID;
  if(body.remove_followed_by_standard_follower != 'on'){
    isFollowingIds = [0,1];
    if(STANDARD_FOLLOWER_DID == body.followed_for_random_actors) {
      excludedFollowerId = '0'; // so not removed through match $nin
    }
  } else {
    isFollowingIds = [0]; // so matched are only the not followed by standardFollower
  }

  if(body.remove_following_standard_follower != 'on'){
    excludedFollowerId = '0';
  } else {
    excludedFollowerId = STANDARD_FOLLOWER_DID;
  }

  var removeOnce2ndValue;
  if (body.remove_once_followed_by_standard_follower == 'on') {
    removeOnce2ndValue =  false;
  } else {
    removeOnce2ndValue =  true;
  }
  
  var keywordsearch = { did: { $exists: true } };
  if (body.keywords != '') {
    keywordsearch = { $text: { $search: body.keywords } };
  }

  var allOrOneFollowedId = { followedDids: { $exists: true } };
  if (body.all_followed_for_random_actors != 'on' && body.followed_for_random_actors != '') {
    allOrOneFollowedId = { followedDids: { $in: [ body.followed_for_random_actors ] } };
  }

  var numberOfActors = body.how_much_random_actors;
  var sampleSize = parseInt(numberOfActors) * 10;

  const [followedAtpActors, actors] = await Promise.all([
    FollowedAtpActor.find({})
      .sort({ displayName: 1 })
      .exec(),
    AtpActor.aggregate([
      { $match : keywordsearch }, // $text match only works, when on first place
      { $match : allOrOneFollowedId },
      { $match : { followedDids: { $nin: [ excludedFollowerId ] } }},
      { $match : { 'standardFollower.isFollowing': { $in: isFollowingIds }} },
      { $match : {$or: [
        { 'standardFollower.unfollowOnOrBefore': { $exists: false } },
        { 'standardFollower.unfollowOnOrBefore': { $exists: removeOnce2ndValue } }
      ]}},
      { $sample: { size: sampleSize } }
    ])
  ]);

  var actorsFinal = actors.slice(0, parseInt(numberOfActors));
  var actorLists = {
      followedAtpActors: followedAtpActors,
      actorsFinal: actorsFinal
  }
  return actorLists
}