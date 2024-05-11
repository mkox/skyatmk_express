const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FollowedAtpActorSchema = new Schema({
  did: { 
      type: String, 
      required: true, 
      index: true, 
      unique: true 
  },
  displayName: { 
      type: String, 
      required: true 
  },
  actor: {},
}, {
    timestamps: true,
    collection: 'followed_atp_actors'
  }
);

// // Virtual for this book instance URL.
// BookSchema.virtual("url").get(function () {
//   return "/catalog/book/" + this._id;
// });

// Export model.
module.exports = mongoose.model("FollowedAtpActor", FollowedAtpActorSchema);
