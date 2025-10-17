const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
// main().then(res=>{
//     console.log("MongoDB connection successful")
// }).catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/Travnest');
// }
const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    description:{
        type:String,
    },
    image:{
        filename: String,
        url: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2016/07/21/10/27/maldives-1532172_1280.jpg"
        }
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:  {
        type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
        },
        coordinates: {
        type: [Number],
        required: true
        }
    },
    category:{
        type: String,
        enum: ["Trending","Rooms","Iconic cities","Mountains","Castles","Amazingpools","Camping","Farms","Arctic","Domes","Boats","Beach"]
    }
});
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;