const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  author: String,
  title: String,
  content: String,
  last_update: {
    type: Date,
    default: Date.now,
  },
  category: String,
  imageCID: String,
  tokenId: Number,
  approved: Boolean,
  responces: [
    {
      author: String,
      content: String,
    },
  ],
});

module.exports = mongoose.model("Posts", PostSchema);
