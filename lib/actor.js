const { BskyAgent } = require("@atproto/api");
require('dotenv').config({ path: ['.env.local', '.env'] });

exports.getAllFollowers = async function (actorId) {
    const fs = require('fs');
    let filePathRoot = "data/20240525-1421-vda";
    let filePath = filePathRoot + ".json";
    let filePathFormated = filePathRoot + "_FORMATED.json";


    let allFollowers = [];
    let cursor = null;
    let count = 0;
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({
      identifier: process.env.ATPROT_AGENT_IDENTIFIER,
      password: process.env.ATPROT_AGENT_PASSWORD,
    });
    console.log('agent: ');
    console.log(agent);
    do {
      //const { followers, nextCursor } = await agent.getFollowers({actor: actorId,  cursor: cursor, limit: 100 });
      const result = await agent.getFollowers({actor: actorId,  cursor: cursor, limit: 100 });
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
      } while (typeof cursor != "undefined");
    var content = JSON.stringify(allFollowers);
    fs.writeFile(filePath, content, function(err) {
      if (err) {
          return console.log(err);
      }
  
      console.log("Der Inhalt wurde erfolgreich in die Datei geschrieben.");
    });
    var contentFormated = JSON.stringify(allFollowers, null, 4);
    fs.writeFile(filePathFormated, contentFormated, function(err) {
      if (err) {
          return console.log(err);
      }
  
      console.log("Der Inhalt wurde erfolgreich in die Datei geschrieben.");
    });
    return allFollowers;
  }