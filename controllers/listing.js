const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async (req, res) => {
    let allListings = await Listing.find();
    res.render("./listing/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
    res.render("./listing/newlisting.ejs");
};
module.exports.searchlisting = async(req,res)=>{
    const country = req.query.search;
    console.log(country);
    const allListings = await Listing.find({country: `${country}`});
    res.render("./listing/index", { allListings });
}
module.exports.getListingsByCategory = async (req, res) => {
    try {
        const cat = req.params.categoryName;
        const allListings = await Listing.find({ category: `${cat}` });
        res.render("./listing/index", { allListings });
    } catch (err) {
        console.log(err);
        req.flash("error", "Cannot fetch listings");
        res.redirect("/listing");
    }
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let showlist = await Listing.find({ _id: id }).populate({ path: 'reviews', populate: { path: 'author' } }).populate("owner");
    // console.log(showlist);
    res.render("./listing/showlist.ejs", { showlist });
};
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send();
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    const category = req.body.listing.category;
    const listingData = req.body.listing;
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };
    newListing.geometry = response.body.features[0].geometry;
    newListing.category = category;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let showlist = await Listing.find({ _id: id });
    if (!showlist) {
        req.flash("errpr", "Listing you are trying to access does not exist");
        res.redirect("/listing");
    }
    let originalurl = showlist[0].image.url;
    originalurl = originalurl.replace("/upload", "/upload/w_250");
    res.render("./listing/editlisting.ejs", { showlist, originalurl });
};
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    let { title, description, price, location, country } = req.body;
    let listing = await Listing.findByIdAndUpdate(`${id}`, { title: `${title}`, description: `${description}`, price: `${price}`, location: `${location}`, country: `${country}` })
    // console.log(location);
    if (typeof req.file !== "undefined") {
        url = req.file.path;
        filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listing/${id}`);
};
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
};