const PayrunList = require("../../../model/modules/production/payrunlist");
const ErrorHandler = require("../../../utils/errorhandler");
const DayPointsUploadTemp = require('../../../model/modules/production/daypointsuploadtemp');
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const DayPointsUpload = require("../../../model/modules/production/dayPointsUpload");
const ProductionDayTemp = require("../../../model/modules/production/productiondaytemp");
const ProductionDay = require("../../../model/modules/production/productionday");
const User = require('../../../model/login/auth');
// get All payrunlist => /api/payrunlist
exports.getAllPayrunList = catchAsyncErrors(async (req, res, next) => {
    let payrunlists;
    try {
        payrunlists = await PayrunList.find({}, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlists) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payrunlists,
    });
});

exports.getYearMonthPayrunList = catchAsyncErrors(async (req, res, next) => {
    let payrunlists = [];
    try {
        payrunlists = await PayrunList.find({year:req.body.year, month:req.body.month}, { department: 1, month: 1, year: 1,});
   
        if (!payrunlists) {
            return next(new ErrorHandler("Data not found!", 404));
        }
        return res.status(200).json({
            // count: products.length,
            payrunlists,
        });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
   
});

// get All payrunlist => /api/payrunlist
exports.getAllPayrunListLimited = catchAsyncErrors(async (req, res, next) => {
    let payrunlists;
    try {
        // payrunlist = await PayrunList.find({}, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });

        payrunlists = await PayrunList.aggregate([
            {
                $project: {
                    department: 1,
                    empcount: 1,
                    generatedon: 1,
                    month: 1,
                    year: 1,
                    from: 1,
                    to: 1,
                    data: {
                        ctc: 1,
                        fixedctc: 1,
                        prodctc: 1,
                        salarytype: 1,
                        deductiontype: 1,
                        pfdeduction: 1,
                        esideduction: 1,
                        fixedemppf: 1,

                        professionaltax: 1,
                        fixedempptax: 1,
                        prodempptax: 1,

                        fixedempesi: 1,
                        prodemppf: 1,
                        prodempesi: 1

                    }
                }
            }
        ]);
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlists) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payrunlists,
    });
});


// Create new payrunlist=> /api/payrunlist/new
exports.addPayrunList = catchAsyncErrors(async (req, res, next) => {
   
    let apayrunlist = await PayrunList.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle payrunlist => /api/payrunlist/:id
exports.getSinglePayrunList = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let spayrunlist = await PayrunList.findById(id);

    if (!spayrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
        spayrunlist,
    });
});

// update payrunlist by id => /api/payrunlist/:id
exports.updatePayrunList = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let upayrunlist = await PayrunList.findByIdAndUpdate(id, req.body);
    if (!upayrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete payrunlist by id => /api/payrunlist/:id
exports.deletePayrunList = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dpayrunlist = await PayrunList.findByIdAndRemove(id);

    if (!dpayrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});

// update ProductionUpload by id => /api/productionupload/:id
exports.updatePayrunListInnerData = catchAsyncErrors(async (req, res, next) => {

    const { inid, outerId, month, value, year, date, fieldName } = req.body; // Extract the inner ID, month, value, year, date, and dynamic field name from the request body

    // Construct the dynamic field path
    const fieldPath = `data.$[outerElem].${fieldName}`;
    const update = {
        $push: {
            [fieldPath]: { month, value, year, date }
        }
    };


    const options = {
        arrayFilters: [
            { "outerElem._id": inid } // Filter for the correct inner ID
        ],
        new: true
    };


    let upayrunlist = await PayrunList.findOneAndUpdate(
        { _id: outerId },
        update,
        options
    );


    if (!upayrunlist) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully", upayrunlist });
});

exports.undoPayrunListInnerData = catchAsyncErrors(async (req, res, next) => {

    const { inid, outerId, fieldName } = req.body; // Extract the inner ID, month, value, year, date, and dynamic field name from the request body

    // Construct the dynamic field path
    const fieldPath = `data.$[outerElem].${fieldName}`;

    const update = {
        $set: {
            [fieldPath]: []
        }
    };


    const options = {
        arrayFilters: [
            { "outerElem._id": inid } // Filter for the correct inner ID
        ],
        new: true
    };


    let upayrunlist = await PayrunList.findOneAndUpdate(
        { _id: outerId },
        update,
        options
    );


    if (!upayrunlist) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully", data: upayrunlist });
});
exports.checkPayRunIsCreated = catchAsyncErrors(async (req, res, next) => {

    let payrunlist;
    try {
        const { department, month, year } = req.body
        payrunlist = await PayrunList.find({ department: department, month: month, year: year }, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payrunlist,
    });
});


exports.updateInnerDataSingleUserRerun = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, updateData } = req.body;

    // Update the nested array element using array filters
    let user = await PayrunList.findOneAndUpdate(
        { _id: outerId, "data._id": innerId }, // Find the document with outerId and where data._id matches innerId
        { $set: { "data.$": updateData } }, // Set the matched array element to updateData
        { new: true } // Return the updated document
    );

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});


exports.updateInnerDataSingleUserWaiver = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, waiver, lossdeductionfinal, otherdeduction, lossdeductionischanged, salarytypefinal, deductiontypefinal } = req.body;
   

    // Update the nested array element using array filters
    let user = await PayrunList.findOneAndUpdate(
        { _id: outerId, "data._id": innerId }, // Find the document with outerId and where data._id matches innerId
        {
            $set: {
                "data.$.waiver": waiver,
                "data.$.salarytypefinal": salarytypefinal,
                "data.$.deductiontypefinal": deductiontypefinal,
                "data.$.lossdeductionischanged": "Yes",
                "data.$.lossdeductionfinal": lossdeductionfinal,
                "data.$.otherdeduction": otherdeduction,
            }
        }, // Set the matched array element to updateData
        { new: true } // Return the updated document
    );

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});

exports.payRunListSentSalaryFixDate = catchAsyncErrors(async (req, res, next) => {
    const { outerId } = req.body;

    // Update the nested array element using array filters
    let user = await PayrunList.findOneAndUpdate(
        { _id: outerId },
        {
            $set: {
                "data.$[].sentfixsalary": "Yes"

            }
        }, // Set the matched array element to updateData
        { new: true } // Return the updated document
    );

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});


// get All payrunlist => /api/payrunlist
exports.fetchPayRunListDataMonthwise = catchAsyncErrors(async (req, res, next) => {
    let payrunlists;
    try {
        const { month, year } = req.body
        payrunlists = await PayrunList.find({ month: month, year: year }, { data: 1 });
    } catch (err) {
        return next(new ErrorHandler('Data not found!', 404));
    }
    if (!payrunlists) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payrunlists,
    });
});

exports.confirmFixSalaryDate = catchAsyncErrors(async (req, res, next) => {
    // const { outerId, innerId, updatedpaidstatus, updatechangedate, updatedholdpercent, paydate, updatedreason, payonsalarytype, finalusersalary } = req.body;
    const { outerId, innerId, logdata } = req.body;
    let user;
    try {
        // Update the nested array element using array filters
        user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId }, // Find the document with outerId and where data._id matches innerId
            {

                $set: {
                    "data.$.logdata": logdata,
                    "data.$.fixsalarydateconfirm": "Yes",
                }
            }, // Set the matched array element to updateData
            { new: true } // Return the updated document
        );
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});

exports.confirmFixHoldSalaryDate = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logdata, logid } = req.body;

    let user = await PayrunList.findOneAndUpdate(
        { _id: outerId, "data._id": innerId },
        {
            $set: {

                "data.$.fixholdsalarydateconfirm": "Yes",
            },
            $push: {
                "data.$.logdata": { $each: logdata }
            }
        },
        { new: true } // Return the updated document
    );
    let userUpdate = await PayrunList.findOneAndUpdate(
        { _id: outerId, "data._id": innerId, "data.logdata._id": logid },
        {
            $set: {
                "data.$[innerElem].logdata.$[logElem].holdsalaryconfirm": "Confirmed",
            },
        },
        {
            arrayFilters: [
                { "innerElem._id": innerId },
                { "logElem._id": logid }
            ],
            new: true // Return the updated document
        }
    );

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});

exports.confirmFixHoldSalaryLogUpdate = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logid, holdsalaryconfirm } = req.body;

    try {
        let user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, "data.logdata._id": logid },
            {
                $set: {
                    "data.$[innerElem].logdata.$[logElem].holdsalaryconfirm": holdsalaryconfirm,
                },
            },
            {
                arrayFilters: [
                    { "innerElem._id": innerId },
                    { "logElem._id": logid }
                ],
                new: true // Return the updated document
            }
        );

        if (!user) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});




exports.undoFieldNameConfirmListFix = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId } = req.body;
    let user = await PayrunList.findOneAndUpdate(
        { _id: outerId, "data._id": innerId },
        {
            $unset: {
                "data.$.logdata": "",
                "data.$.fixsalarydateconfirm": "",
                "data.$.fixholdsalarydateconfirm": "",
            }
        },

    );

    if (!user) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({ message: "Updated successfully" });
});


exports.fixHoldSalaryReject = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logid, rejectreason } = req.body;
    let user;
    try {
        user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, "data.logdata._id": logid },
            {
                $set: {
                    "data.$[innerElem].logdata.$[logElem].holdreleaseconfirm": "Rejected",
                    "data.$[innerElem].logdata.$[logElem].rejectreason": rejectreason,
                },
            },
            {
                arrayFilters: [
                    { "innerElem._id": innerId },
                    { "logElem._id": logid }
                ],
                new: true // Return the updated document
            }
        );

        if (!user) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateRemoveReject = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logid, matchid } = req.body;
    let user;
    try {
        user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, },
            {
                $pull: {
                    "data.$.logdata": { _id: logid }
                }
            },
            {

                new: true // Return the updated document
            }
        );
        let userUpdate = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, "data.logdata._id": matchid },
            {
                $set: {
                    "data.$[innerElem].logdata.$[logElem].holdreleaseconfirm": "",
                    "data.$[innerElem].logdata.$[logElem].holdsalaryconfirm": "No",
                },
            },
            {
                arrayFilters: [
                    { "innerElem._id": innerId },
                    { "logElem._id": matchid }
                ],
                new: true // Return the updated document
            }
        );

        if (!user) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.confirmHoldReleaseSave = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logid, logdata, } = req.body;
    let user;
    try {
        user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, "data.logdata._id": logid },
            {
                $set: {
                    "data.$[innerElem].logdata.$[logElem].holdreleaseconfirm": "Approved",
                    "data.$[innerElem].logdata.$[logElem].holdsalaryconfirm": "Yes",
                    "data.$[innerElem].logdata.$[logElem].rejectreason": "",
                },
            },
            {
                arrayFilters: [
                    { "innerElem._id": innerId },
                    { "logElem._id": logid }
                ],
                new: true // Return the updated document
            }
        );

        let userNew = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId },
            {

                $push: {
                    "data.$.logdata": { $each: logdata }
                }
            },
            { new: true } // Return the updated document
        );

        if (!user) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



exports.confirmConsolidatedReleaseSave = catchAsyncErrors(async (req, res, next) => {
    const { outerId, innerId, logid } = req.body;

    let user;
    try {
        user = await PayrunList.findOneAndUpdate(
            { _id: outerId, "data._id": innerId, "data.logdata._id": logid },
            {
                $set: {
                    "data.$[innerElem].logdata.$[logElem].bankreleasestatus": "closed",
                },
            },
            {
                arrayFilters: [
                    { "innerElem._id": innerId },
                    { "logElem._id": logid }
                ],
                new: true
            }
        );

        if (!user) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.getBankReleasePayrunListMonthwise = catchAsyncErrors(async (req, res, next) => {
    const { month, year } = req.body;
    let payrunlists;
    try {
        let query = {
            month: month,
            year: year
        }

        payrunlists = await PayrunList.find(query, { data: 1 });

        return res.status(200).json({ payrunlists });
    }

    catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
});


exports.updateBankReleaseClose = catchAsyncErrors(async (req, res, next) => {
    const { ids, bankstatus, status } = req.body;

    const filter = {
        $or: ids.map(id => ({
            _id: id.outerId,
            "data._id": id.innerId,
            "data.logdata._id": id.logid
        }))
    };

    const update = {
        $set: {
            "data.$[innerElem].logdata.$[logElem].bankreleasestatus": bankstatus,
            "data.$[innerElem].logdata.$[logElem].bankclose": status
        }
    };

    const arrayFilters = [
        { "innerElem._id": { $in: ids.map(id => id.innerId) } },
        { "logElem._id": { $in: ids.map(id => id.logid) } }
    ];

    try {
        await PayrunList.updateMany(filter, update, { arrayFilters });
        return res.status(200).json({ msg: "Success" });
    } catch (error) {
        return next(new ErrorHandler('Data not found!', 404));
    }

});


// get All payruncontrol => /api/payruncontrol
exports.deletePayrunBulkData = catchAsyncErrors(async (req, res, next) => {
    let payruncontrol;
    try {
        payruncontrol = await PayrunList.deleteMany({ _id: { $in: req.body.ids } });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!payruncontrol) {
        return next(new ErrorHandler("Payruncontrol not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payruncontrol,
    });
});

// get All payruncontrol => /api/payruncontrol
exports.getPayrunBulkDataExcel = catchAsyncErrors(async (req, res, next) => {
    let payruncontrol;
    try {
        payruncontrol = await PayrunList.find({ _id: { $in: req.body.ids } }, { data: 1, month: 1, year: 1 });
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!payruncontrol) {
        return next(new ErrorHandler("Payruncontrol not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        payruncontrol,
    });
});

// get All payrunlist => /api/payrunlist
exports.getAllPayrunListLimitedFiltered = catchAsyncErrors(async (req, res, next) => {
    let payrunlists;
    try {
      // payrunlist = await PayrunList.find({}, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
      const { department, month, year } = req.body;
  
      payrunlists = await PayrunList.aggregate([
        {
          $match: {
            department: { $in: department },
            month: month,
            year: String(year),
          },
        },
        {
          $project: {
            department: 1,
            empcount: 1,
            generatedon: 1,
            month: 1,
            year: 1,
            from: 1,
            to: 1,
            data: {
              ctc: 1,
              fixedctc: 1,
              prodctc: 1,
              salarytype: 1,
              deductiontype: 1,
              pfdeduction: 1,
              esideduction: 1,
              fixedemppf: 1,
  
              professionaltax: 1,
              fixedempptax: 1,
              prodempptax: 1,
  
              fixedempesi: 1,
              prodemppf: 1,
              prodempesi: 1,
            },
          },
        },
      ]);
    } catch (err) {
        return next(new ErrorHandler('Data not found!', 404));
    }
    if (!payrunlists) {
      return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      payrunlists,
    });
  });

  exports.payrunListDupeCheck = catchAsyncErrors(async (req, res, next) => {
    let payruncontrol;
    try {
      const { department, month, year } = req.body;
  
      payruncontrol = await PayrunList.find({ department: { $in: department }, month: month, year: year }, { department: 1 });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    // if (!payruncontrol) {
    //   return next(new ErrorHandler("Payruncontrol not found!", 404));
    // }
    return res.status(200).json({
      payruncontrol,
    });
  });


  exports.payrunListSingleUserLastThreeMonths = catchAsyncErrors(async (req, res, next) => {
    let payruncontrol;
    try {
      function getLastThreeMonths() {
        const lastThreeMonths = [];
        const currentDate = new Date();
  
        for (let i = 0; i < 3; i++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthName = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
  
          lastThreeMonths.push({ month: monthName, year: String(year) });
        }
  
        return lastThreeMonths;
      }
  
      const lastThreeMonths = getLastThreeMonths();
      const { companyname, department } = req.body;  
      payruncontrol = await PayrunList.aggregate([
        {
          $match: {
            department: department,
            $or: lastThreeMonths,
            "data.companyname": companyname,
          },
        },
        {
          $project: {
            department: 1,
            // empcount: 1,
            // generatedon: 1,
            month: 1,
            year: 1,
            from: 1,
            to: 1,
            data: 1,
          },
        },
      ]);
  
  
      // payruncontrol = await PayrunList.deleteMany({ _id: { $in: req.body.ids } });
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    // if (!payruncontrol) {
    //   return next(new ErrorHandler("Payruncontrol not found!", 404));
    // }
    return res.status(200).json({
      payruncontrol,
    });
  });

  exports.checkIsPayRunGenerated = catchAsyncErrors(async (req, res, next) => {
    let payruncontrol;
    try {
      const {date } = req.body;
      // console.log(date,'date')
      payruncontrol = await PayrunList.countDocuments({ from:{$lte:date}, to:{$gte:date }});
      // console.log(payruncontrol)
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    // if (!payruncontrol) {
    //   return next(new ErrorHandler("Payruncontrol not found!", 404));
    // }
    return res.status(200).json({
      payruncontrol,
    });
  });

  // check payrun is generated or not for attendance clockin and clockout time edit
exports.checkPayRunIsCreatedForAttendance = catchAsyncErrors(async (req, res, next) => {
    let payrunlist;
    try {
        const { department, date } = req.body;
        payrunlist = await PayrunList.find({ department: department, from: { $lte: date }, to: { $gte: date } }, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({ payrunlist });
});

exports.getAllPayrunListConsolidatedDate = catchAsyncErrors(async (req, res, next) => {
    let payrunlists, daypoints, productionday, count;
    try {

        const query = {
            from: { $lte: req.body.to }, // Start date of the range is before or equal to the end date of the query
            to: { $gte: req.body.from }  // End date of the range is after or equal to the start date of the query
        };
        console.log(query, "po");
        const productiondayquery = {
            date: { $gte: req.body.from, $lte: req.body.to },
        }

        payrunlists = await PayrunList.countDocuments(query);
        productionday = await ProductionDay.countDocuments(productiondayquery);
        daypoints = await DayPointsUpload.countDocuments(productiondayquery);


        count = payrunlists + productionday + daypoints

        // console.log(payrunlists, "payrunlists")
    } catch (err) {
        console.log(err);
    }
    // if (!payrunlists) {
    //     return next(new ErrorHandler("PayrunList not found!", 404));
    // }
    return res.status(200).json({
        // count: products.length,


        count,
        payrunlists,
        productionday,
        daypoints


    });
});


exports.getAllPayrunListConsolidatedDateTemp = catchAsyncErrors(async (req, res, next) => {
    let payrunlists, daypoints, productionday, count;
    try {

        const query = {
            from: { $lte: req.body.to }, // Start date of the range is before or equal to the end date of the query
            to: { $gte: req.body.from }  // End date of the range is after or equal to the start date of the query
        };
        console.log(query, "po");
        const productiondayquery = {
            date: { $gte: req.body.from, $lte: req.body.to },
        }

        payrunlists = await PayrunList.countDocuments(query);
        productionday = await ProductionDayTemp.countDocuments(productiondayquery);
        daypoints = await DaypointsUploadTemp.countDocuments(productiondayquery);


        count = payrunlists + productionday + daypoints

        // console.log(payrunlists, "payrunlists")
    } catch (err) {
        console.log(err);
    }
    // if (!payrunlists) {
    //     return next(new ErrorHandler("PayrunList not found!", 404));
    // }
    return res.status(200).json({
        // count: products.length,


        count,
        payrunlists,
        productionday,
        daypoints


    });
});

// check payrun is generated or not for penalty day upload
exports.checkPayRunIsCreatedForPenaltyDayUpload = catchAsyncErrors(async (req, res, next) => {
    let payrunlist;
    try {
        const { date } = req.body;
        payrunlist = await PayrunList.find({ from: { $lte: date }, to: { $gte: date } }, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({ payrunlist });
});

exports.payrunBulkUpdateUsingFileUpload = catchAsyncErrors(async (req, res, next) => {
    const { multiUsers } = req.body;
  
    try {
      const bulkUpdates = multiUsers.map((user) => {
        const update = {
          $push: {},
        };
  
        // Build the $push object dynamically for this user
        for (const [key, value] of Object.entries(user)) {
          if (key.endsWith('log')) {
            update.$push[key] = {
              month: user.month,
              year: user.year,
              companyname: user.name,
              value: value,
              date: new Date(),
            };
          }
        }
  
        return {
          updateMany: {
            filter: { companyname: user.name }, // Filter by the user's company name
            update: update,
          },
        };
      });
  
      // Execute all update operations in bulk
      const result = await User.bulkWrite(bulkUpdates);
  
      return res.status(200).json({ message: 'Updated successfully', result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error occurred', error: err.message });
    }
  });

  
exports.payrunBulkUndo = catchAsyncErrors(async (req, res, next) => {
    const { selectedRows } = req.body;
  
    const fieldNames = ['totalabsentlog', 'totalpaiddayslog', 'targetpointlog', 'acheivedpointlog', 'penaltylog', 'nightshiftallowlog', 'noshiftlog', 'shiftallowtargetlog', 'shiftallowancelog', 'currmonthattlog', 'currmonthavglog'];
  
    // Using the $pull operator to remove an object from the array based on month and year
  
    const update = {
      $pull: {},
    };
  
    fieldNames.forEach((fieldName) => {
      update.$pull[fieldName] = { month: selectedRows[0].month, year: selectedRows[0].year };
    });
  
    const options = {
      new: true,
    };
  
    let upayrunlist = await User.updateMany({ _id: { $in: selectedRows.map((d) => d.id) } }, update, options);
  
    if (!upayrunlist) {
      return next(new ErrorHandler('Data not found!', 404));
    }
  
    return res.status(200).json({ message: 'Updated successfully', upayrunlist });
  });

  
exports.getAllPayrunListLimitedFilteredLossPayrun = catchAsyncErrors(async (req, res, next) => {
    let payrunlists;
    try {
      // payrunlist = await PayrunList.find({}, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1 });
      const { department, month, year } = req.body;
  
      payrunlists = await PayrunList.aggregate([
        {
          $match: {
            department: { $in: department },
            month: month,
            year: String(year),
          },
        },
        {
          $project: {
            department: 1,
            empcount: 1,
            generatedon: 1,
            month: 1,
            year: 1,
            from: 1,
            to: 1,
            data: {
              ctc: 1,
              fixedctc: 1,
              prodctc: 1,
              salarytype: 1,
              deductiontype: 1,
              pfdeduction: 1,
              esideduction: 1,
              fixedemppf: 1,
              sentfixsalary: 1,
  
              professionaltax: 1,
              fixedempptax: 1,
              prodempptax: 1,
  
              fixedempesi: 1,
              prodemppf: 1,
              prodempesi: 1,
            },
          },
        },
      ]);
    } catch (err) {
      console.log(err.message);
    }
    if (!payrunlists) {
      return next(new ErrorHandler('PayrunList not found!', 404));
    }
    return res.status(200).json({
      // count: products.length,
      payrunlists,
    });
  });

  // check payrun is generated or not for attendance clockin and clockout time edit
exports.checkPayRunIsCreatedForAttendanceBulkUpdate = catchAsyncErrors(async (req, res, next) => {
    let payrunlist;
    try {
        const { department, fromdate, todate } = req.body;
        payrunlist = await PayrunList.find({ department: department, from: { $lte: fromdate }, to: { $gte: todate } }, { department: 1, empcount: 1, generatedon: 1, month: 1, year: 1, from: 1, to: 1, data: 1 });
    } catch (err) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    if (!payrunlist) {
        return next(new ErrorHandler("PayrunList not found!", 404));
    }
    return res.status(200).json({ payrunlist });
});
