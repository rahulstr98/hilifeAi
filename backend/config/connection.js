const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();
 mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Main MongoDB connected successfully.");

    // mongoose.hihrmstesting = mongoose.createConnection(process.env.MONGO_URI1, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

module.exports = mongoose;
