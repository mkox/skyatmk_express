const { BskyAgent } = require("@atproto/api");
require('dotenv').config({ path: ['.env.local', '.env'] });
const { format } = require('date-fns');
const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");


const agent = new BskyAgent({ service: "https://bsky.social" });
agent.login({
  identifier: process.env.ATPROT_AGENT_IDENTIFIER,
  password: process.env.ATPROT_AGENT_PASSWORD,
});
// console.log('agent: ');
// console.log(agent);

exports.getAllFollowers = async function (actorId) {
  //  await exports.getFollowedActor(actorId);

    const fs = require('fs');
    let filePathRoot = "data/" + format(new Date(), 'yyyyMMdd-HHmm') + "-vda-followers";
    let filePath = filePathRoot + ".json";
    let filePathFormated = filePathRoot + "_FORMATED.json";


    let allFollowers = [];
    let cursor = null;
    let count = 0;
    let bulk;
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
    //} while (cursor !== null);
    //} while (count < 100);





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
                // $addToSet: { followedIds: idOfFollowedUser } 
              },
              upsert: true
            }
          }
        );
      }
      var bulkRes = await AtpActor.bulkWrite(bulk);
      console.log('bulkRes.upsertedCount: ' + bulkRes.upsertedCount);
      console.log('bulkRes.modifiedCount: ' + bulkRes.modifiedCount);

      // /* Only for 'standardFollower.isFollowing' */
      // bulk2 = [];
      // for (let i = 0; i < users.length; i++) {
      //   //let bulkItem = {updateOne: {}};
      //   bulk2.push(
      //     {
      //       updateOne: {
      //         filter: { twUserId: users[i].id, 'standardFollower.isFollowing': {$exists : false} },
      //         update: { $set: {'standardFollower.isFollowing': 0 } }
      //       }
      //     }
      //   );
      // }
      // var bulkRes2 = await this.options.Model.bulkWrite(bulk2);
      // console.log('bulkRes2.upsertedCount: ' + bulkRes2.upsertedCount);
      // console.log('bulkRes2.modifiedCount: ' + bulkRes2.modifiedCount);
              

    } else {
      console.log('No result (actor)');
      return { message: 'No result for this actor.' }
    }
  // } while (newPage == 1);






      } while (typeof cursor != "undefined");







    // var content = JSON.stringify(allFollowers);
    // console.log('allFollowers.length: ', allFollowers.length);
    // fs.writeFile(filePath, content, function(err) {
    //   if (err) {
    //       return console.log(err);
    //   }
  
    //   console.log("Der Inhalt (Followers) wurde erfolgreich in die Datei geschrieben.");
    // });
    // var contentFormated = JSON.stringify(allFollowers, null, 4);
    // fs.writeFile(filePathFormated, contentFormated, function(err) {
    //   if (err) {
    //       return console.log(err);
    //   }
  
    //   console.log("Der Inhalt (Followers) wurde erfolgreich in die Datei geschrieben.");
    // });

    // await exports.getFollowedActor(actorId);
    return allFollowers;
  }

  exports.getFollowedActor = async function (actorId) {
    const fs = require('fs');
    let filePathRoot = "data/" + format(new Date(), 'yyyyMMdd-HHmm') + "-vda-followed";
    let filePath = filePathRoot + ".json";
    let filePathFormated = filePathRoot + "_FORMATED.json";


    let allFollowers = [];
    let cursor = null;
    let count = 0;
    // const agent = new BskyAgent({ service: "https://bsky.social" });
    // await agent.login({
    //   identifier: process.env.ATPROT_AGENT_IDENTIFIER,
    //   password: process.env.ATPROT_AGENT_PASSWORD,
    // });
    // console.log('agent: ');
    // console.log(agent);
    const result = await agent.getProfile({ actor: actorId });
    // console.log('result getProfile: ', result);
    var content = JSON.stringify(result.data);


    // fs.writeFile(filePath, content, function(err) {
    //   if (err) {
    //       return console.log(err);
    //   }
  
    //   console.log("Der Inhalt (followed actor) wurde erfolgreich in die Datei geschrieben.");
    // });
    // var contentFormated = JSON.stringify(result.data, null, 4);
    // fs.writeFile(filePathFormated, contentFormated, function(err) {
    //   if (err) {
    //       return console.log(err);
    //   }
  
    //   console.log("Der Inhalt (followed actor) wurde erfolgreich in die Datei geschrieben.");
    // });


    

    try {   
      await FollowedAtpActor.findOneAndUpdate(
        { did: result.data.did },
        { did: result.data.did, displayName: result.data.displayName, actor: result.data },
        { upsert: true }
      );    

    } catch (err) {
      console.error(err.message);
    }

    return allFollowers;
  }