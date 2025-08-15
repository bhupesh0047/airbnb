const mongoose=require('mongoose');

const homeSchema=new mongoose.Schema({
  name:{type: String, required: true },
  price:{type: Number, required: true },  
  location:{type: String, required: true },  
  rating:{type: Number, required: true },
  Photo: String,
  Rule_pdf:String,
  description: String,
})

// homeSchema.pre('findOneAndDelete', async function(next){
//   console.log("came in pre hook while deleting a home");
//   const homeId=this.getQuery()._id;
//   await favorite.deleteMany({id: homeId});
//   next();
// });

module.exports=mongoose.model('Home',homeSchema);