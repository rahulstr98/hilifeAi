const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const axios = require("axios");

exports.getAllMikroTikInterfaces = catchAsyncErrors(async (req, res, next) => {
    try {
        const { url, username, password } = req.body;
        const auth = Buffer.from(
            `${username}:${password}`
        ).toString("base64");
        const response = await axios.get(
            `${url}/rest/interface`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return res.status(200).json({
            allmikrotikinterface: response.data,
        });
    } catch (error) {
        if (error.response) {
            return next(
                new ErrorHandler(
                    error.response.data.message || "An error occurred",
                    error.response.status || 500
                )
            );
        } else if (error.request) {
            return next(new ErrorHandler("No response received from server", 500));
        } else {
            return next(new ErrorHandler("Error Fetching Datas!", 500));
        }
    }
});