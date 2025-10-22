
const PenaltyClientError = require('../../../model/modules/penalty/penaltyclienterror');
const ProductionClientRate = require('../../../model/modules/production/productionclientrate');
const ClientUserID = require("../../../model/modules/production/ClientUserIDModel");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

exports.getAllPenaltyClientError = catchAsyncErrors(async (req, res, next) => {
    const { assignbranch } = req.body;
    const query = {
        $or: assignbranch.map(item => ({
            company: item.company,
            branch: item.branch,
            unit: item.unit
        }))
    };
    let penaltyclienterror;
    try {
        penaltyclienterror = await PenaltyClientError.find(query);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!penaltyclienterror) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        penaltyclienterror,
    });
});

// Create new penaltyclienterror=> /api/penaltyclienterror/new
exports.addPenaltyClientError = catchAsyncErrors(async (req, res, next) => {

    const { project, category, subcategory, loginid, company, branch, unit, team, employeename, date, line, errorvalue, correctvalue, clienterror } = req.body;

    let filteredData = await PenaltyClientError.findOne({ project, category, subcategory, loginid, company, branch, unit, team, employeename, date, line: { $regex: `\\b${line}\\b`, $options: 'i' }, errorvalue, correctvalue, clienterror: { $regex: `\\b${clienterror}\\b`, $options: 'i' } });



    if (!filteredData) {
        let apenaltyerrorcontrol = await PenaltyClientError.create(req.body);

        return res.status(200).json({
            message: "Successfully added!",
        });
    }

    return next(new ErrorHandler("Data Already Exist!", 404));

});

// get Signle PenaltyClientError => /api/penaltyclienterror/:id
exports.getSinglePenaltyClientError = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let spenaltyclienterror = await PenaltyClientError.findById(id);

    if (!spenaltyclienterror) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        spenaltyclienterror,
    });
});

// update PenaltyClientError by id => /api/penaltyclienterror/:id
exports.updatePenaltyClientError = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    const { project, category, subcategory, loginid, company, branch, unit, team, employeename, date, line, errorvalue, correctvalue, clienterror } = req.body;

    // let filteredData = await PenaltyClientError.findOne({ _id: { $ne: id }, projectvendor,process ,mode: { $regex: `\\b${mode}\\b`, $options: 'i' } , rate: rate , islock: { $regex: `\\b${islock}\\b`, $options: 'i' } });

    let filteredData = await PenaltyClientError.findOne({ _id: { $ne: id }, project, category, subcategory, loginid, company, branch, unit, team, employeename, date, line: { $regex: `\\b${line}\\b`, $options: 'i' }, errorvalue, correctvalue, clienterror: { $regex: `\\b${clienterror}\\b`, $options: 'i' } });

    if (!filteredData) {
        let upenaltyerrorcontrol = await PenaltyClientError.findByIdAndUpdate(id, req.body);
        if (!upenaltyerrorcontrol) {
            return next(new ErrorHandler("Data not found!", 404));
        }
        return res.status(200).json({ message: "Updated successfully" });
    }
    return next(new ErrorHandler("Data Already Exist!", 404));

});

// delete PenaltyClientError by id => /api/penaltyclienterror/:id
exports.deletePenaltyClientError = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let dpenaltyerrorcontrol = await PenaltyClientError.findByIdAndRemove(id);

    if (!dpenaltyerrorcontrol) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});

// date filter with assign branch
exports.getAllPenaltyClientErrorForDateFilterWithAsgnBranch = catchAsyncErrors(async (req, res, next) => {
    const { assignbranch, fromdate, todate } = req.body;

    const query = {
        $and: [
            {
                $or: assignbranch.map(item => ({
                    company: item.company,
                    branch: item.branch,
                    unit: item.unit
                }))
            },
            { date: { $gte: fromdate, $lte: todate } }
        ]
    };

    let penaltyclienterror;
    try {
        penaltyclienterror = await PenaltyClientError.find(query);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!penaltyclienterror) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({
        penaltyclienterror,
    });
});

// date filter only
exports.getAllPenaltyClientErrorForDateFilter = catchAsyncErrors(async (req, res, next) => {
    const { fromdate, todate, companyname } = req.body;

    let penaltyclienterror;
    let approvedpenaltyclienterror;
    let rejectedpenaltyclienterror;
    let penaltyclienterrorrate;
    let clientuserid;
    let filteredData;
    let finalData;

    if (companyname) {
        try {
            penaltyclienterrorrate = await ProductionClientRate.find({}, { project: 1, category: 1, subcategory: 1, rate: 1 });
            approvedpenaltyclienterror = await PenaltyClientError.find({ date: { $gte: fromdate, $lte: todate }, errorstatus: { $eq: "Approved" }, employeename: { $eq: companyname } });
            clientuserid = await ClientUserID.find(
                { loginallotlog: { $exists: true, $ne: [] } },
                { empname: 1, userid: 1, loginallotlog: 1, projectvendor: 1 }
            ).lean();

            // compare with penaltyrate and get matched data's client rate
            filteredData = penaltyclienterrorrate.flatMap((rateData) => {
                // Find all matching approved penalty client errors
                const matchedItems = approvedpenaltyclienterror.filter((item) =>
                    rateData.project === item.project &&
                    rateData.category === item.category &&
                    rateData.subcategory === item.subcategory
                );

                // Map each matched item to include the client amount
                return matchedItems.map((matchedItem) => ({
                    _id: matchedItem?._id,
                    project: matchedItem?.project,
                    category: matchedItem?.category,
                    subcategory: matchedItem?.subcategory,
                    loginid: matchedItem?.loginid,
                    vendor: matchedItem?.vendor,
                    company: matchedItem?.company,
                    branch: matchedItem?.branch,
                    unit: matchedItem?.unit,
                    team: matchedItem?.team,
                    employeename: matchedItem?.employeename,
                    employeeid: matchedItem?.employeeid,
                    date: matchedItem?.date,
                    documentnumber: matchedItem?.documentnumber,
                    documentlink: matchedItem?.documentlink,
                    fieldname: matchedItem?.fieldname,
                    line: matchedItem?.line,
                    errorvalue: matchedItem?.errorvalue,
                    correctvalue: matchedItem?.correctvalue,
                    clienterror: matchedItem?.clienterror,
                    errorstatus: matchedItem?.errorstatus,
                    clientamount: rateData.rate
                }));
            });

            finalData = filteredData?.map((item) => {
                let concatProjectVendor = `${item.project}-${item.vendor}`;

                const loginInfo = clientuserid.filter((d) => d.userid == item.loginid && d.projectvendor == concatProjectVendor);

                let loginallot = loginInfo.length > 0 ? loginInfo.map(d => d.loginallotlog).flat() : [];

                let filteredDataDateTime = null;
                if (loginallot.length > 0) {
                    const groupedByDateTime = {};

                    // Group items by date and time
                    loginallot.forEach((item) => {
                        const dateTime = item.date + " " + item.time;
                        if (!groupedByDateTime[dateTime]) {
                            groupedByDateTime[dateTime] = [];
                        }
                        groupedByDateTime[dateTime].push(item);
                    });

                    // Extract the last item of each group
                    const lastItemsForEachDateTime = Object.values(groupedByDateTime).map(
                        (group) => group[group.length - 1]
                    );

                    // Sort the last items by date and time
                    lastItemsForEachDateTime.sort((a, b) => {
                        return (
                            new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
                        );
                    });

                    // Find the first item in the sorted array that meets the criteria

                    for (let i = 0; i < lastItemsForEachDateTime.length; i++) {
                        const dateTime =
                            lastItemsForEachDateTime[i].date + " " + lastItemsForEachDateTime[i].time;
                        // let datevalsplit = item.mode === "Manual" ? "" : upload.dateval.split(" IST");
                        let datevalsplitfinal = item.date;

                        if (new Date(dateTime) <= new Date(datevalsplitfinal)) {
                            filteredDataDateTime = lastItemsForEachDateTime[i];
                        } else {
                            break;
                        }
                    }
                }

                return {
                    ...item._doc,
                    _id: item?._id,
                    project: item?.project,
                    category: item?.category,
                    subcategory: item?.subcategory,
                    loginid: item?.loginid,
                    vendor: item?.vendor,
                    company: item?.company,
                    branch: item?.branch,
                    unit: item?.unit,
                    team: item?.team,
                    employeename: item?.employeename,
                    employeeid: item?.employeeid,
                    date: item?.date,
                    documentnumber: item?.documentnumber,
                    documentlink: item?.documentlink,
                    fieldname: item?.fieldname,
                    line: item?.line,
                    errorvalue: item?.errorvalue,
                    correctvalue: item?.correctvalue,
                    clienterror: item?.clienterror,
                    errorstatus: item?.errorstatus,
                    clientamount: item?.clientamount,
                    companyname: item?.employeename,
                    percentage: item?.percentage,
                    amount: item?.amount ? item?.amount : 0,
                    history: item?.history,
                };
            });
        } catch (err) {
            return next(new ErrorHandler("Records not found!", 404));
        }
        if (!finalData) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({
            finalData
        });

    } else {
        try {
            penaltyclienterror = await PenaltyClientError.find({ date: { $gte: fromdate, $lte: todate }, errorstatus: { $ne: "Rejected" } });
            rejectedpenaltyclienterror = await PenaltyClientError.find({ date: { $gte: fromdate, $lte: todate }, errorstatus: { $eq: "Rejected" } });
        } catch (err) {
            return next(new ErrorHandler("Records not found!", 404));
        }
        if (!penaltyclienterror) {
            return next(new ErrorHandler("Data not found!", 404));
        }

        return res.status(200).json({
            penaltyclienterror, rejectedpenaltyclienterror
        });
    }
});