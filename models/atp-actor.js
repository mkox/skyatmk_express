const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AtpActorSchema = new Schema({
  did: { 
      type: String, 
      required: true, 
      index: true, 
      unique: true
  },
  actor: {},
  followedDids: [String],
  baseActors: [],
  open: {},
}, {
    timestamps: true,
    collection: 'atp_actors'
  }
);

// // Virtual for this book instance URL.
// BookSchema.virtual("url").get(function () {
//   return "/catalog/book/" + this._id;
// });

// Export model.
module.exports = mongoose.model("AtpActor", AtpActorSchema);
