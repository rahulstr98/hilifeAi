const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const Biometric = require("../../model/login/msmodel");
const moment = require('moment-timezone');

// Controller to create a user in LDAP
exports.getBiometricAttendance = catchAsyncErrors(async (req, res, next) => {
    try {
        // Loop through each entry in req.body array
        const timeZone = 'Asia/Kolkata';

        // Function to convert '/Date(<timestamp>)/' to 'yyyy-MM-dd HH:mm:ss.SSS' and adjust to local time zone
        const convertDate = (dateStr) => {
            const timestampMatch = dateStr.match(/\/Date\((\d+)\)\//);
            if (timestampMatch) {
                const timestamp = parseInt(timestampMatch[1]);
                const date = new Date(timestamp); // This gives you a date in UTC

                // Convert to local time (Asia/Kolkata)
                const localDate = moment.utc(date).tz(timeZone);

                // Return the date in 'yyyy-MM-dd HH:mm:ss.SSS' format (local time zone)
                return localDate.format('YYYY-MM-DD HH:mm:ss.SSS');
            }
            return null;
        };

        let excludeArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13","14"];
        // Loop through each entry in req.body array
        const updatedData = req?.body?.Tran_DeviceAttRec?.filter((emp) => excludeArray?.includes(emp?.Card_Number))?.map(item => {
            let foundData = req?.body?.Employees?.find((emp) => emp?.employee_id === item?.Emp_id)
            let allData = {
                ...item,
                Punch_RawDate: convertDate(item.Punch_RawDate),
                Att_PunchRecDate: convertDate(item.Att_PunchRecDate),
                Punch_month: convertDate(item.Punch_month),
                Att_PunchDownDate: convertDate(item.Att_PunchDownDate),
                Punch_Img: null, // Add Punch_Img field (with a default value if missing)

                employee_id: foundData?.employee_id ?? "",
                employee_code: foundData?.employee_code ?? "",
                employee_fname: foundData?.employee_fname ?? "",
                employee_lname: foundData?.employee_lname ?? "",
            };

            // Update each field in the object using the convertDate function and include Punch_Img
            return allData;
        });

        await Biometric.deleteMany({});

        let pushData = await Biometric.insertMany(updatedData)

        // Log the updated data to see the output


        // You can return the updated data to the client
        res.status(200).json(updatedData);
    } catch (error) {

        res.status(500).json({ message: 'Internal Server Error' });
    }
});



exports.getAllBiometricAttendance = catchAsyncErrors(async (req, res, next) => {

    const { aggregationPipeLine } = req.body;
    try {
        let gotData = await Biometric.aggregate(aggregationPipeLine)
        res.status(200).json({
            users: gotData,
        });
    } catch (error) {
        return next(new ErrorHandler("Data found!", 404));
    }
});


