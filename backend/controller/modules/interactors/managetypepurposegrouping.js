const ManageTypePG = require("../../../model/modules/interactors/managetypepurposegrouping");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const VisitorType = require("../../../model/modules/interactors/visitor");

// get All ManageTypePG type Name => /api/manageTypepg
exports.getAllManageTypePG = catchAsyncErrors(async (req, res, next) => {
  let manageTypePG;
  try {
    manageTypePG = await ManageTypePG.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!manageTypePG) {
    return next(new ErrorHandler("ManageTypePG type Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    manageTypePG,
  });
});

// Create new Connectivity=> /api/manageTypepg/new
exports.addManageTypePG = catchAsyncErrors(async (req, res, next) => {

  let aInteractorType = await ManageTypePG.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single interactortype => /api/manageTypepg/:id
exports.getSingleManageTypePG = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let manageTypePG = await ManageTypePG.findById(id);

  if (!manageTypePG) {
    return next(new ErrorHandler("ManageTypePG Type Name not found!", 404));
  }
  return res.status(200).json({
    manageTypePG,
  });
});

// update Interactor Type by id => /api/manageTypepg/:id
exports.updateManageTypePG = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let manageTypePG = await ManageTypePG.findByIdAndUpdate(id, req.body);
  if (!manageTypePG) {
    return next(new ErrorHandler("ManageTypePG Type Name not found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete interactor type by id => /api/manageTypepg/:id
exports.deleteManageTypePG = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let manageTypePG = await ManageTypePG.findByIdAndRemove(id);

  if (!manageTypePG) {
    return next(new ErrorHandler("ManageTypePG Type Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.addManageTypePGOverall = catchAsyncErrors(async (req, res, next) => {
  let visitorType;
  try {

    visitorType = await VisitorType.find({
      visitortype: req.body.oldname,
      visitorpurpose: { $in: req.body.oldpurpose }
    });

    visitorTypefollowarray = await VisitorType.find({
      followuparray: {
        $elemMatch: {
          visitortype: req.body.oldname,
          visitorpurpose: { $in: req.body.oldpurpose }
        }
      }
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: visitorType?.length,
    visitorType,

  });
});

exports.managetypepgoverallmanagetypegbulkdelete = catchAsyncErrors(
  async (req, res, next) => {
    let managety,
      visitortype,
      visitortypefollowuparr,
      result,
      count;
    let id = req.body.id;
    try {
      managety = await ManageTypePG.find();

      const answerBothtypegroup = managety?.filter((data) =>
        id?.includes(data._id?.toString())
      );

      [
        visitortype,
        visitortypefollowuparr,
      ] = await Promise.all([
        VisitorType.find(),
        VisitorType.find(),
      ]);


      const visitorType = answerBothtypegroup
        .filter((answers) =>
          visitortype.some(
            (sub) =>
              sub.visitortype === answers.interactorstype && answers.interactorspurpose?.includes(sub.visitorpurpose)
          )
        )
        ?.map((data) => data._id?.toString());

      const visitorTypeFollowupArray = answerBothtypegroup
        .filter((answers) =>
          visitortypefollowuparr.some((sub) =>
            sub.followuparray?.some((itm) =>
              itm.visitortype === answers.interactorstype && answers.interactorspurpose?.includes(itm.visitorpurpose)
            )
          )
        )
        .map((data) => data._id?.toString());

      const duplicateId = [
        ...visitorType,
        ...visitorTypeFollowupArray
      ];
      result = id?.filter((data) => !duplicateId?.includes(data));
      count = id?.filter((data) => !duplicateId?.includes(data))?.length;

    } catch (err) {
      return next(new ErrorHandler("Records Not Found", 500));
    }

    return res.status(200).json({
      count: count,
      result,
    });
  }
);



