const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  
  // ✅ Store Cloudinary Photo URL + public_id
  Photo: { type: String },
  Photo_public_id: { type: String },

  // ✅ Store Cloudinary Rule PDF URL + public_id
  Rule_pdf: { type: String },
  Rule_pdf_public_id: { type: String },

  description: { type: String }
});

// Example: cascade delete favorites (if needed later)
// homeSchema.pre("findOneAndDelete", async function (next) {
//   console.log("came in pre hook while deleting a home");
//   const homeId = this.getQuery()._id;
//   await favorite.deleteMany({ id: homeId });
//   next();
// });

module.exports = mongoose.model("Home", homeSchema);
