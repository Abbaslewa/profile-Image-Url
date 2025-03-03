const mongoose = require("mongoose");

const ContentDB = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL, {}) ;
       console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error(("error is runing to MongoDB", error));
        process.exit(1);
    };
};
module.exports = ContentDB;