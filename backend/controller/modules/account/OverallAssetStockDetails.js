const Assetdetail = require('../../../model/modules/account/assetdetails');
const Assetmaterial = require('../../../model/modules/account/assetmaterial');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Managestockitems = require("../../../model/modules/stockpurchase/managestockitems");
const Stocks = require("../../../model/modules/stockpurchase/stock");
const Manualstocks = require("../../../model/modules/stockpurchase/manualstockentry");

const mongoose = require("mongoose");
exports.getAssetMaterialCount = catchAsyncErrors(async (req, res, next) => {
    try {
        const { countof, accessbranch } = req.body
        const branchFilter = accessbranch?.map((branchObj) => ({
            branch: branchObj.branch,
            company: branchObj.company,
            unit: branchObj.unit,
        }));
        const filterQuery = { $or: branchFilter };
        if (countof === "asset") {

            const counts = await Assetmaterial.aggregate([
                {
                    $lookup: {
                        from: "assetdetails",
                        let: { materialName: "$name" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$material", "$$materialName"] } } },
                            { $match: filterQuery }, // Apply branchFilter here
                        ],
                        as: "assetDetails",
                    },
                },
                {
                    $addFields: {
                        totalCount: { $size: "$assetDetails" },
                        distributedCount: {
                            $size: {
                                $filter: {
                                    input: "$assetDetails",
                                    as: "detail",
                                    cond: { $eq: ["$$detail.distributed", true] },
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        balanceCount: { $subtract: ["$totalCount", "$distributedCount"] },
                    },
                },
                {
                    $match: { totalCount: { $gt: 0 } }, // Exclude materials with zero count
                },
                {
                    $project: {
                        name: 1,
                        materialcode: 1,
                        totalCount: 1,
                        distributedCount: 1,
                        balanceCount: 1,
                    },
                },
            ]);

            return res.status(200).json({
                success: true,
                countdata: counts, // Respond with name, total count, distributed count, and balance count
            });
        } else if (countof === "stock") {

            // Combine stocks and manualstocks collections into one for aggregation
            // const allStocks = await db.collection("stocks").aggregate([
            //     { $match: { requestmode: "Stock Material" } },
            //     {
            //       $unionWith: {
            //         coll: "manualstocks",
            //         pipeline: [{ $match: { requestmode: "Stock Material" } }],
            //       },
            //     },
            //   ]).toArray();

            // Perform the aggregation
            const counts = await Managestockitems.aggregate([
                {
                    $lookup: {
                        from: "stocks", // Join with stocks collection
                        let: { itemName: "$itemname" },
                        pipeline: [
                            { $match: { requestmode: "Stock Material" } },
                            { $match: filterQuery }, // Apply branch filter
                            {
                                $project: {
                                    stockmaterialarray: 1,
                                    status: 1,
                                },
                            },
                            {
                                $unwind: "$stockmaterialarray", // Flatten the stockmaterialarray
                            },
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$stockmaterialarray.materialnew", "$$itemName"], // Match materialnew with itemname
                                    },
                                },
                            },
                            {
                                $addFields: {
                                    quantity: { $toInt: "$stockmaterialarray.quantitynew" }, // Convert quantitynew to integer
                                },
                            },
                        ],
                        as: "stockData",
                    },
                },
                {
                    $lookup: {
                        from: "manualstocks", // Join with manualstocks collection
                        let: { itemName: "$itemname" },
                        pipeline: [
                            { $match: { requestmode: "Stock Material" } },
                            { $match: filterQuery }, // Apply branch filter
                            {
                                $project: {
                                    stockmaterialarray: 1,
                                    status: 1,
                                },
                            },
                            {
                                $unwind: "$stockmaterialarray", // Flatten the stockmaterialarray
                            },
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$stockmaterialarray.materialnew", "$$itemName"], // Match materialnew with itemname
                                    },
                                },
                            },
                            {
                                $addFields: {
                                    quantity: { $toInt: "$stockmaterialarray.quantitynew" }, // Convert quantitynew to integer
                                },
                            },
                        ],
                        as: "manualStockData",
                    },
                },
                {
                    $addFields: {
                        totalCount: {
                            $sum: [
                                { $sum: "$stockData.quantity" },
                                { $sum: "$manualStockData.quantity" },
                            ],
                        },
                        transferedCount: {
                            $sum: [
                                {
                                    $sum: {
                                        $map: {
                                            input: "$stockData",
                                            as: "stock",
                                            in: { $cond: [{ $eq: ["$$stock.status", "Transfer"] }, "$$stock.quantity", 0] },
                                        },
                                    },
                                },
                                {
                                    $sum: {
                                        $map: {
                                            input: "$manualStockData",
                                            as: "manualStock",
                                            in: { $cond: [{ $eq: ["$$manualStock.status", "Transfer"] }, "$$manualStock.quantity", 0] },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        balanceCount: { $subtract: ["$totalCount", "$transferedCount"] }, // Calculate balanceCount
                    },
                },
                {
                    $match: { totalCount: { $gt: 0 } },
                },
                {
                    $project: {
                        itemname: 1,
                        totalCount: 1,
                        transferedCount: 1,
                        balanceCount: 1,
                    },
                },
            ]);

            return res.status(200).json({
                success: true,
                countdata: counts,
            });
        }
        else {
            return res.status(200).json({
                success: false,
                message: "Invalid Count Of"
                // countdata: counts,
            });
        }

    } catch (err) {
        return next(new ErrorHandler("Error Getting Count!", 500));
    }
});
exports.getAssetDetailDatasByMaterialname = catchAsyncErrors(async (req, res, next) => {
    try {
        const { view, materialid, accessbranch } = req.body
        const branchFilter = accessbranch.map((branchObj) => ({
            branch: branchObj.branch,
            company: branchObj.company,
            unit: branchObj.unit,
        }));
        const filterQuery = { $or: branchFilter };
        if (view === "asset") {

            const objectId = new mongoose.Types.ObjectId(materialid);
            const returnmaterialData = await Assetmaterial.findById(objectId);
            const returndata = await Assetdetail.find({ material: returnmaterialData?.name, ...filterQuery });

            return res.status(200).json({
                success: true,
                returndata,
                returnmaterialData// Respond with name, total count, distributed count, and balance count
            });
        } else if (view === "stock") {

            const objectId = new mongoose.Types.ObjectId(materialid);
            const returnmanagestockitemsData = await Managestockitems.findById(objectId);
            const itemName = returnmanagestockitemsData.itemname;

            // Query stocks collection
            const stockData = await Stocks.aggregate([
                { $match: { requestmode: "Stock Material" } },
                { $match: filterQuery }, // Apply branch filter
                { $unwind: "$stockmaterialarray" }, // Flatten stockmaterialarray
                {
                    $match: {
                        "stockmaterialarray.materialnew": itemName, // Match materialnew
                    },
                },
                {
                    $addFields: {
                        dbname: "stocks", // Add dbname field
                    },
                },
                {
                    $project: {
                        files: 0, // Exclude the files array
                    },
                },
            ]);

            // Query manualstocks collection
            const manualStockData = await Manualstocks.aggregate([
                { $match: { requestmode: "Stock Material" } },
                { $match: filterQuery }, // Apply branch filter
                { $unwind: "$stockmaterialarray" }, // Flatten stockmaterialarray
                {
                    $match: {
                        "stockmaterialarray.materialnew": itemName, // Match materialnew
                    },
                },
                {
                    $addFields: {
                        dbname: "manualstocks", // Add dbname field
                    },
                },
                {
                    $project: {
                        files: 0, // Exclude the files array
                    },
                },
            ]);

            // Combine results
            const returndata = [...stockData, ...manualStockData];
            return res.status(200).json({
                success: true,
                returndata,
                returnmanagestockitemsData// Respond with name, total count, distributed count, and balance count
            });
        } else {
            return res.status(200).json({
                success: false,
            });
        }

    } catch (err) {
        return next(new ErrorHandler("Error Getting Details!", 500));
    }
});

