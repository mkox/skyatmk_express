const AtpActor = require("../models/atp-actor");
const FollowedAtpActor = require("../models/followed-atp-actor");

exports.getActorLists = async function (body) {
    var keywordsearch = { did: { $exists: true } };
    if (body.keywords != '') {
     keywordsearch = { $text: { $search: body.keywords } };
    }
//   console.log('body: ', body);
    var numberOfActors = body.how_much_random_actors;
    var sampleSize = parseInt(numberOfActors) * 10;
  
    const [followedAtpActors, actors] = await Promise.all([
      FollowedAtpActor.find({})
        .sort({ displayName: 1 })
        .exec(),
      AtpActor.aggregate([
        { $match : keywordsearch }, // $text match only works, when on first place
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