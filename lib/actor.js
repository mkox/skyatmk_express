const { BskyAgent } = require("@atproto/api");
require('dotenv').config({ path: ['.env.local', '.env'] });
const { format } = require('date-fns');
const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");
const { updateOpenDate2 } = require("../lib/actor-from-mongodb");


const agent = new BskyAgent({ service: "https://bsky.social" });
agent.login({
  identifier: process.env.ATPROT_AGENT_IDENTIFIER,
  password: process.env.ATPROT_AGENT_PASSWORD,
});
// console.log('agent: ');
// console.log(agent);

exports.getAllFollowers = async function (actorId, didOfFollowedActor) {
  //  await exports.getFollowedActor(actorId);

  const fs = require('fs');
  let filePathRoot = "data/" + format(new Date(), 'yyyyMMdd-HHmm') + "-vda-followers";
  let filePath = filePathRoot + ".json";
  let filePathFormated = filePathRoot + "_FORMATED.json";


  let allFollowers = [];
  let cursor = null;
  let count = 0;
  let bulk;
  let bulk2;
  do {
    //const { followers, nextCursor } = await agent.getFollowers({actor: actorId,  cursor: cursor, limit: 100 });
    const result = await agent.getFollowers({ actor: actorId,  cursor: cursor, limit: 100 });
    //console.log('result: ');
    //console.log(result);
    let followers = result.data.followers;
    let nextCursor = result.data.cursor;
    allFollowers = allFollowers.concat(followers);
    cursor = nextCursor;
    console.log('cursor: ', cursor);
    count++;
    console.log('count: ', count);
    //console.log('followers: ', followers);


    if (typeof followers !== 'undefined') {
      bulk = [];
      for (let i = 0; i < followers.length; i++) {
        bulk.push(
          {
            updateOne: {
              filter: { did: followers[i].did },
              update: { 
                did: followers[i].did, 
                actor: followers[i], 
                $addToSet: { followedDids: didOfFollowedActor } 
              },
              upsert: true
            }
          }
        );
      }
      var bulkRes = await AtpActor.bulkWrite(bulk);
      console.log('bulkRes.upsertedCount: ' + bulkRes.upsertedCount);
      console.log('bulkRes.modifiedCount: ' + bulkRes.modifiedCount);
      console.log('allFollowers.length: ', allFollowers.length);

      /* Only for 'standardFollower.isFollowing' */
      bulk2 = [];
      for (let i = 0; i < followers.length; i++) {
        //let bulkItem = {updateOne: {}};
        bulk2.push(
          {
            updateOne: {
              filter: { actor: followers[i], 'standardFollower.isFollowing': {$exists : false} },
              update: { $set: {'standardFollower.isFollowing': 0 } }
            }
          }
        );
      }
      var bulkRes2 = await AtpActor.bulkWrite(bulk2);
      console.log('bulkRes2.upsertedCount: ' + bulkRes2.upsertedCount);
      console.log('bulkRes2.modifiedCount: ' + bulkRes2.modifiedCount);
              

    } else {
      console.log('No result (actor)');
      return { message: 'No result for this actor.' }
    }

  } while (typeof cursor != "undefined");

  return allFollowers;
}

exports.getFollowedActor = async function (actorId) {
  // console.log('agent: ', agent);
  const result = await agent.getProfile({ actor: actorId });
  // console.log('result getProfile: ', result);
  var content = JSON.stringify(result.data);
  
  try {   
    await FollowedAtpActor.findOneAndUpdate(
      { did: result.data.did },
      { did: result.data.did, displayName: result.data.displayName, actor: result.data },
      { upsert: true }
    );    

  } catch (err) {
    console.error(err.message);
  }

  return result.data.did;
}

exports.getAndStoreFollowedByStandardActor = async function () {
  const STANDARD_FOLLOWER_DID = process.env.STANDARD_FOLLOWER_DID;
  if (!STANDARD_FOLLOWER_DID) {
    throw new Error(
      "Please define the STANDARD_FOLLOWER_DID environment variable inside .env.local",
    );
  }

  let allFollows = [];
  let cursor = null;
  let count = 0;
  let bulk = [];
  var bulkRemoveFollowing = [];
  var existingActor;

  const date = new Date();
  let isoDate = date.toISOString();

  // var actorsFollowingBeforeUpdate = await AtpActor.find({ 'standardFollower.isFollowing': 1 }); // Does not work.
  // var actorsFollowingBeforeUpdate = await AtpActor.find({ query: { 'standardFollower.isFollowing' : { $eq: 1 }} }); // Does not work.
  var actorsFollowingBeforeUpdate = await AtpActor.aggregate([
    { $match : { 'standardFollower.isFollowing': 1} },
  ])
  // console.log('actorsFollowingBeforeUpdate.length:', actorsFollowingBeforeUpdate.length);

  do {
    const result = await agent.getFollows({ actor: STANDARD_FOLLOWER_DID,  cursor: cursor, limit: 100 });
    let follows = result.data.follows;
    console.log('follows for getFollows: ', follows.length);
    let nextCursor = result.data.cursor;
    allFollows = allFollows.concat(follows);
    cursor = nextCursor;
    console.log('cursor: ', cursor);
    count++;
    console.log('count: ', count);
    //console.log('follows: ', follows);


    if (typeof follows !== 'undefined') {
      bulk = [];
      for (let i = 0; i < follows.length; i++) {
        let isoDateFinal = isoDate;
        existingActor = actorsFollowingBeforeUpdate.find(obj => obj.did === STANDARD_FOLLOWER_DID);

        if(typeof existingActor != 'undefined'){
          
          if(existingActor.standardFollower.followOnOrBefore.length == 24){
            
            isoDateFinal = existingActor.standardFollower.followOnOrBefore;
          }
        } 

        bulk.push(
          {
            updateOne: {
              filter: { did: follows[i].did },
              update: { 
                did: follows[i].did, 
                actor: follows[i], 
                'standardFollower.followOnOrBefore': isoDateFinal,
                'standardFollower.isFollowing': 1,
                // $set: {'standardFollower.isFollowing': 1,
                // $addToSet: { followedDids: STANDARD_FOLLOWER_DID },
              },
              upsert: true
            }
          }
        );
      }
      var bulkRes = await AtpActor.bulkWrite(bulk);
      console.log('bulkRes.upsertedCount: ' + bulkRes.upsertedCount);
      console.log('bulkRes.modifiedCount: ' + bulkRes.modifiedCount);
      console.log('allFollows.length: ', allFollows.length);

    } else {
      console.log('No result (actor)');
      return { message: 'No result for this actor.' }
    }

  } while (typeof cursor != "undefined");

  // bulkRemoveFollowing
  for (let i = 0; i < actorsFollowingBeforeUpdate.length; i++) {
    existingActor = allFollows.find(o => o.did === actorsFollowingBeforeUpdate[i].did);

    if(typeof existingActor == 'undefined'){
      bulkRemoveFollowing.push(
        {
          updateOne: {
            filter: { did: actorsFollowingBeforeUpdate[i].did },
            update: { 'standardFollower.isFollowing': 0, 'standardFollower.unfollowOnOrBefore': isoDate  }
          }
        }
      );
    }
  }
  if(bulkRemoveFollowing.length > 0){
    var bulkRemoveFollowingRes = await AtpActor.bulkWrite(bulkRemoveFollowing);
    console.log('bulkRemoveFollowingRes.upsertedCount: ' + bulkRemoveFollowingRes.upsertedCount);
    console.log('bulkRemoveFollowingRes.modifiedCount: ' + bulkRemoveFollowingRes.modifiedCount);
  }

  // For follows for which the actor page was not opened by this app:
  var body = { 
    selectedActors: allFollows,
    isoDate: isoDate
  }
  await updateOpenDate2(body);

  return;
}