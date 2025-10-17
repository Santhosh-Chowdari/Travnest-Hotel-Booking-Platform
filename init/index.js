const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
main().then(res=>{
    console.log("MongoDB connection successful")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Travnest');
}
const initDB = async ()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj, owner:"68a9d612306416b42f382c91"}));
    await Listing.insertMany(initdata.data);
    console.log("data is inserted");
}
initDB();