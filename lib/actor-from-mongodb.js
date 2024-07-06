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
    exports.getFollowedAtpActors(),
    AtpActor.aggregate([
      { $match : keywordsearch }, // $text match only works, when on first place
      { $match : allOrOneFollowedId },
      { $match : { followedDids: { $nin: [ excludedFollowerId ] } }},
      { $match : { 'standardFollower.isFollowing': { $in: isFollowingIds }} },
      { $match : {$or: [
        { 'standardFollower.unfollowOnOrBefore': { $exists: false } },
        { 'standardFollower.unfollowOnOrBefore': { $exists: (body.remove_once_followed_by_standard_follower == 'on') ? false : true } }
      ]}},
      { $match : {$or: [
        { 'open.date': { $exists: false } },
        { 'open.date': { $exists: (body.show_despite_open_date_exists == 'on') ? true : false } }
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

exports.getFollowedAtpActors = async function () {
  return FollowedAtpActor.find({})
  .sort({ displayName: 1 })
  .exec();
}

exports.getFollowedByDate = async function (body) {
      
  console.log('getFollowedByDate - body:', body);

  const STANDARD_FOLLOWER_DID = process.env.STANDARD_FOLLOWER_DID;
  if (!STANDARD_FOLLOWER_DID) {
    throw new Error(
      "Please define the STANDARD_FOLLOWER_DID environment variable inside .env.local",
    );
  }
  console.log('getFollowedByDate - x110:');

  const startDate = new Date(body.following_start_date);
  let isoStartDate = startDate.toISOString();
  console.log('isoStartDate:', isoStartDate);

  const endDate = new Date(body.following_end_date);
  let isoEndDate = endDate.toISOString();
  console.log('isoEndDate:', isoEndDate);

  const [followedAtpActors, actors] = await Promise.all([
    exports.getFollowedAtpActors(),
    AtpActor.aggregate([
      { $match : { 'standardFollower.isFollowing': 1} },
      { $match : { 'open.date': { $gte: isoStartDate }} },
      { $match : { 'open.date': { $lte: isoEndDate }} },
      { $match : { followedDids: { $nin: [ STANDARD_FOLLOWER_DID ] } }}
    ])
  ]);

  var actorLists = {
      followedAtpActors: followedAtpActors,
      actorsFinal: actors
  }
  console.log('getFollowedByDate - actorLists:', actorLists);
  return actorLists;
}

exports.updateOpenDate = async function (body) {
  try {
    var bulk = [];
    for (let i = 0; i < body.selectedActors.length; i++) {
      bulk.push(
        {
          updateOne: {
            filter: { did: body.selectedActors[i].did },
            update: { 'open.date': body.isoDate  }
          }
        }
      );
    }
    var bulkRes = await AtpActor.bulkWrite(bulk);
    console.log('bulkRes.modifiedOpenDate: ' + bulkRes.modifiedCount);
    return bulkRes;
  } catch (error) {
    console.log('+++ updateOpenDate +++ error:', error)
    return error;
  }
}

exports.updateOpenDate2 = async function (body) {
  try {
    var bulk = [];
    for (let i = 0; i < body.selectedActors.length; i++) {
      bulk.push(
        {
          updateOne: {
            filter: { 
              did: body.selectedActors[i].did,
              'open.date': { $exists: false } // is not in exports.updateOpenDate
            },
            update: { 'open.date': body.isoDate  }
          }
        }
      );
    }
    var bulkRes = await AtpActor.bulkWrite(bulk);
    console.log('bulkRes.modifiedOpenDate: ' + bulkRes.modifiedCount);
    return bulkRes;
  } catch (error) {
    console.log('+++ updateOpenDate2 +++ error:', error)
    return error;
  }
}