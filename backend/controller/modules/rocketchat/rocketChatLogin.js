// const axios = require("axios");
// const ErrorHandler = require("../../../utils/errorhandler");
// const ChatConfiguration = require('../../../model/modules/settings/ChatConfiguration');

// //function to goin rocketchat
// const rocketChatLogin = async () => {
//     try {
//         const rocketchatCredentials = await ChatConfiguration.findOne()
//             .sort({ createdAt: -1 })
//             .select("domainurl username password");
//         if (!rocketchatCredentials?.domainurl || !rocketchatCredentials?.username || !rocketchatCredentials?.password) {
//             throw new ErrorHandler("Missing Rocketchat Credentials!", 404);
//         }
//         const loginResponse = await axios.post(
//             `${rocketchatCredentials?.domainurl}/api/v1/login`,
//             {
//                 user: rocketchatCredentials?.username,
//                 password: rocketchatCredentials?.password,
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const { authToken, userId } = loginResponse.data.data;
//         return { authToken, userId, rocketchatdomainurl: rocketchatCredentials?.domainurl }; // Return authToken and userId
//     } catch (error) {
//         console.log(error, "error logging")
//         throw new ErrorHandler(
//             error.response?.data?.message || "Login failed",
//             error.response?.status || 500
//         );
//     }
// };

// module.exports = rocketChatLogin;




const axios = require("axios");
const ErrorHandler = require("../../../utils/errorhandler");
const ChatConfiguration = require('../../../model/modules/settings/ChatConfiguration');

// Cache for token
let cachedToken = null;
let cachedUserId = null;
let tokenExpiry = null;
let cachedDomainUrl = null;
let cachedUsername = null;
let cachedPassword = null;

// Function to log in to Rocket.Chat
const rocketChatLogin = async () => {
    try {

        // Fetch credentials from the database
        const rocketchatCredentials = await ChatConfiguration.findOne()
            .sort({ createdAt: -1 })
            .select("domainurl username password");

        if (!rocketchatCredentials?.domainurl || !rocketchatCredentials?.username || !rocketchatCredentials?.password) {
            throw new ErrorHandler("Missing Rocketchat Credentials!", 404);
        }


        // Check if a valid token is already cached
        if (cachedToken && tokenExpiry > Date.now() && rocketchatCredentials?.domainurl === cachedDomainUrl && rocketchatCredentials?.username === cachedUsername && rocketchatCredentials?.password === cachedPassword) {
            return { authToken: cachedToken, userId: cachedUserId, rocketchatdomainurl: cachedDomainUrl };
        }



        // Authenticate with Rocket.Chat
        const loginResponse = await axios.post(
            `${rocketchatCredentials?.domainurl}/api/v1/login`,
            {
                user: rocketchatCredentials?.username,
                password: rocketchatCredentials?.password,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Store the token, userId, and calculate expiry
        const { authToken, userId } = loginResponse.data.data;
        cachedToken = authToken;
        cachedUserId = userId;
        cachedDomainUrl = rocketchatCredentials?.domainurl;
        cachedUsername = rocketchatCredentials?.username;
        cachedPassword = rocketchatCredentials?.password;
        tokenExpiry = Date.now() + 3600 * 1000; // Assume token is valid for 1 hour (adjust as per actual expiry)

        return { authToken, userId, rocketchatdomainurl: rocketchatCredentials?.domainurl };
    } catch (error) {
        console.log(error, "error logging");
        throw new ErrorHandler(
            error.response?.data?.message || "Login failed",
            error.response?.status || 500
        );
    }
};

module.exports = rocketChatLogin;
