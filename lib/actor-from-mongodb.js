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
  // console.log('body.remove_followed_by_standard_follower: ' + body.remove_followed_by_standard_follower);
  if(body.remove_followed_by_standard_follower != 'on'){
    isFollowingIds = [0,1];
    // console.log('find - x125');
    if(STANDARD_FOLLOWER_DID == body.followed_for_random_actors) {
      // console.log('find - x126');
      excludedFollowerId = '0'; // so not removed through match $nin
      //console.log('excludedFollowerId: ' + excludedFollowerId);
    }
  } else {
    console.log('find - x128');
    isFollowingIds = [0]; // so matched are only the not followed by standardFollower
  }
  
  var keywordsearch = { did: { $exists: true } };
  if (body.keywords != '') {
    keywordsearch = { $text: { $search: body.keywords } };
  }

  // var allOrOneFollowedId = { twUserId: { $exists: true } };
  // if (body.all_followed_for_random_actors !== true) {
  //   allOrOneFollowedId = { followedIds: { $in: [ body.followed_for_random_actors ] } };
  // }

//   console.log('body: ', body);
  var numberOfActors = body.how_much_random_actors;
  var sampleSize = parseInt(numberOfActors) * 10;

  const [followedAtpActors, actors] = await Promise.all([
    FollowedAtpActor.find({})
      .sort({ displayName: 1 })
      .exec(),
    AtpActor.aggregate([
      { $match : keywordsearch }, // $text match only works, when on first place
      // { $match : allOrOneFollowedId },
      { $match : { 'standardFollower.isFollowing': { $in: isFollowingIds }} },
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