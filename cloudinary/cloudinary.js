const cloudinary= require("cloudinary").v2;

cloudinary.config({
    cloud_name:process.env.CLOUDENARY_CLOUD,
    api_key:   process.env.CLOUDENARY_APIKEY,
    api_secret:process.env.CLOUDENARY_API_SECRET
});

module.exports= cloudinary