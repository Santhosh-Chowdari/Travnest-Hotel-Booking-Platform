const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const WrapAsync = require("../utils/wrapAsync.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const { isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get(wrapAsync(listingController.index))
.post(validateListing,isLoggedIn,upload.single('listing[image]'),WrapAsync(listingController.createListing));
router.get("/search",wrapAsync(listingController.searchlisting));
router.get("/category/:categoryName", wrapAsync(listingController.getListingsByCategory));
router.get("/new",isLoggedIn,listingController.renderNewForm);
router.route("/:id")
.get(listingController.showListing)
.put(validateListing,isLoggedIn,isOwner,upload.single('listing[image]'),listingController.updateListing)
.delete(isLoggedIn,isOwner,listingController.destroyListing);
router.get("/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm));
router.route("*")
.get(wrapAsync(listingController.index))
module.exports= router;