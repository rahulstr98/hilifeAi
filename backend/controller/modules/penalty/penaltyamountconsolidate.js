const PenaltyAmountConsolidate = require("../../../model/modules/penalty/penaltyamountconsolidate");
const PenaltyClientErrorUpload = require("../../../model/modules/production/penaltyclienterrorupload");
const PenaltyDayUpload = require("../../../model/modules/penalty/penaltydayupload");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All PenaltyAmountConsolidate Name => /api/allpenaltyamountconsolidate
exports.getAllPenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    let penaltyamountconsolidate;
    try {
      penaltyamountconsolidate = await PenaltyAmountConsolidate.find();
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    if (!penaltyamountconsolidate) {
      return next(new ErrorHandler("Data  not found!", 404));
    }
    return res.status(200).json({
      // count: products.length,
      penaltyamountconsolidate,
    });
  }
);

// get All PenaltyAmountConsolidate view => /api/productionconsolidateds

exports.getFilterPenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    const { assignbranch } = req.body;
    const query = {
      $or: assignbranch.map(item => ({
        company: item.company,
        branch: item.branch,
        unit: item.unit
      }))
    };

    let productionconsolidated,
      clienterrorupload,
      ans,
      penaltydayupload,
      overallData,
      finalData;
    try {
      productionconsolidated = await PenaltyAmountConsolidate.find({
        _id: req.body.id,
      });

      clienterrorupload = await PenaltyClientErrorUpload.find();
      penaltydayupload = await PenaltyDayUpload.find();

      if (!clienterrorupload && !penaltydayupload) {
        return next(new ErrorHandler("No not found!", 404));
      }

      const filteredDataClientError = clienterrorupload.filter((item) => {
        const itemFromDate = new Date(item?.fromdate);
        const itemToDate = new Date(item?.todate);
        const productionFrom = new Date(productionconsolidated[0]?.fromdate);
        const productionTo = new Date(productionconsolidated[0]?.todate);

        return (
          (productionFrom >= itemFromDate && productionFrom <= itemToDate) ||
          (productionTo >= itemFromDate && productionTo <= itemToDate)
        );
      });

      let finalclient = filteredDataClientError
        .map((data) => data.uploaddata)
        .flat();

      const filteredDataPenalty = penaltydayupload.filter((item) => {
        const itemDate = new Date(item?.date);
        const fromDate = new Date(productionconsolidated[0]?.fromdate);
        const toDate = new Date(productionconsolidated[0]?.todate);
        return itemDate >= fromDate && itemDate <= toDate;
      });

      let finalpenalty = filteredDataPenalty
        .map((data) => data.uploaddata)
        .flat();

      ans = [...finalpenalty, ...finalclient];

      finalData = ans.map((item) => {
        return {
          _id: item?._id,
          name: item?.name,
          empcode: item?.empcode,
          fromdate: productionconsolidated[0].fromdate,
          todate: productionconsolidated[0].todate,
          company: item?.company,
          branch: item?.branch,
          unit: item?.unit,
          team: item?.team,
          editedone: item?.edited1,
          editedtwo: item?.edited2,
          editedthree: item?.edited3,
          editedfour: item?.edited4,
          notapproved: 0,
          amount: item?.amount,
          clientamount: item?.clientamount,
          netamount: item?.totalamount,
        };
      }).filter(item =>
        assignbranch.some(branch =>
          branch.company === item.company &&
          branch.branch === item.branch &&
          branch.unit === item.unit
        )
      );

      overallData = ans.map((item) => {
        return {
          _id: item?._id,
          name: item?.name,
          empcode: item?.empcode,
          fromdate: productionconsolidated[0].fromdate,
          todate: productionconsolidated[0].todate,
          company: item?.company,
          branch: item?.branch,
          unit: item?.unit,
          team: item?.team,
          editedone: item?.edited1,
          editedtwo: item?.edited2,
          editedthree: item?.edited3,
          editedfour: item?.edited4,
          notapproved: 0,
          amount: item?.amount,
          clientamount: item?.clientamount,
          netamount: item?.totalamount,
        };
      })
    } catch (err) {
      return next(new ErrorHandler("Records not found!", 404));
    }
    return res.status(200).json({
      productionconsolidated,
      ans: finalData,
      overallData
    });
  }
);


// Create new PenaltyAmountConsolidate=> /api/penaltyamountconsolidate/new
exports.addPenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    let apenaltyamountconsolidate = await PenaltyAmountConsolidate.create(
      req.body
    );

    return res.status(200).json({
      message: "Successfully added!",
    });
  }
);

// get Signle PenaltyAmountConsolidate => /api/penaltyamountconsolidate/:id
exports.getSinglePenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;

    let spenaltyamountconsolidate = await PenaltyAmountConsolidate.findById(id);

    if (!spenaltyamountconsolidate) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
      spenaltyamountconsolidate,
    });
  }
);

// update PenaltyAmountConsolidate by id => /api/penaltyamountconsolidate/:id
exports.updatePenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    if (!upenaltyamountconsolidate) {
      return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
  }
);

// delete PenaltyAmountConsolidate by id => /api/penaltyamountconsolidate/:id
exports.deletePenaltyAmountConsolidated = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;

    let dpenaltyamountconsolidate =
      await PenaltyAmountConsolidate.findByIdAndRemove(id);

    if (!dpenaltyamountconsolidate) {
      return next(new ErrorHandler("Data  not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
  }
);

