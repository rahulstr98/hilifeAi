const Managetypepg = require("../../../model/modules/interactors/managetypepurposegrouping");
const InteractorPurpose = require("../../../model/modules/interactors/interactorpurpose");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const VisitorType = require("../../../model/modules/interactors/visitor");

// get All interactor purpose Name => /api/interactorPurpose
exports.getAllInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
  let interactorPurpose;
  try {
    interactorPurpose = await InteractorPurpose.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!interactorPurpose) {
    return next(new ErrorHandler("Interactory mode Name not found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    interactorPurpose,
  });
});

// Create new interactorPurpose=> /api/interactorPurpose/new
exports.addInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
  let checkloc = await InteractorPurpose.findOne({ name: req.body.name });

  if (checkloc) {
    return next(new ErrorHandler("Interactor Purpose Name already exist!", 400));
  }

  let aInteractorPurpose = await InteractorPurpose.create(req.body);

  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single interactorPurpose => /api/interactorPurpose/:id
exports.getSingleInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let sinteractorpurpose = await InteractorPurpose.findById(id);

  if (!sinteractorpurpose) {
    return next(new ErrorHandler("Interactor Mode Purpose not found!", 404));
  }
  return res.status(200).json({
    sinteractorpurpose,
  });
});

// update Interactor Purpose by id => /api/interactorPurpose/:id
// exports.updateInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
//   const id = req.params.id;
//   let uinteractorpurpose = await InteractorPurpose.findByIdAndUpdate(id, req.body);
//   if (!uinteractorpurpose) {
//     return next(new ErrorHandler("Interactor Purpose Name not found!", 404));
//   }
//   return res.status(200).json({ message: "Updated successfully" });
// });


exports.updateInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let interactorPurpose = await InteractorPurpose.findByIdAndUpdate(id, req.body);

  if (!interactorPurpose) {
    return next(new ErrorHandler('Data not found'));
  }

  const updatedCategory = req.body.prevprojectname;

  const raiseProblemsToUpdate = await VisitorType.find({
    visitorpurpose: updatedCategory
  });

  const filteredRaiseProblems = raiseProblemsToUpdate.filter(item =>
    item.followuparray.some(followup => followup.visitorpurpose === updatedCategory)
  );

  for (const raiseProblem of filteredRaiseProblems) {
    raiseProblem.visitorpurpose = req.body.name;
    raiseProblem.followuparray = raiseProblem.followuparray.map(item => {
      if (item.visitorpurpose === updatedCategory) {
        item.visitorpurpose = req.body.name;
      }
      return item;
    });
    await raiseProblem.save();
  }

  // Updating Managetypepg collection
  const manageTypesToUpdate = await Managetypepg.find({
    interactorspurpose: { $in: [updatedCategory] },
  });

  for (const manageType of manageTypesToUpdate) {
    manageType.interactorspurpose = manageType.interactorspurpose.map(purpose =>
      purpose === updatedCategory ? req.body.name : purpose
    );
    await manageType.save();
  }

  return res.status(200).json({
    message: 'Update Successfully',
    interactorPurpose,
    updatedcount: manageTypesToUpdate.length + raiseProblemsToUpdate.length
  });
});



// delete interactor Purpose by id => /api/interactorPurpose/:id
exports.deleteInteractorPurpose = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dinteractorpurpose = await InteractorPurpose.findByIdAndRemove(id);

  if (!dinteractorpurpose) {
    return next(new ErrorHandler("Interactor Purpose Name not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});

exports.InteractorPurposeOverall = catchAsyncErrors(async (req, res, next) => {
  let visitortypeArray, visitortype, managetypePG;
  try {

    managetypePG = await Managetypepg.find({
      interactorspurpose: { $in: req.body.oldname }
    })

    visitortype = await VisitorType.find({
      visitorpurpose: req.body.oldname
    });

    visitortypeArray = await VisitorType.find({
      followuparray: {
        $elemMatch: { visitorpurpose: req.body.oldname }
      }
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }

  return res.status(200).json({
    count: visitortype?.length + visitortypeArray?.length + managetypePG?.length,
    visitortype,
    visitortypeArray,
    managetypePG,
  });
});



exports.InteractorPurposeOverallBulkdelete = catchAsyncErrors(
  async (req, res, next) => {
    let interactor,
      visitortype,
      visitortypearray,
      managetypepg,
      result,
      count;
    let id = req.body.id;
    try {
      interactor = await InteractorPurpose.find();

      const answerBoth = interactor?.filter((data) =>
        id?.includes(data._id?.toString())
      );

      [
        visitortype,
        visitortypearray,
        managetypepg,
      ] = await Promise.all([
        VisitorType.find(),
        VisitorType.find(),
        Managetypepg.find(),
      ]);


      const visitorType = answerBoth
        .filter((answers) =>
          visitortype.some(
            (sub) =>
              sub.visitorpurpose === answers.name
          )
        )
        ?.map((data) => data._id?.toString());

      const visitorTypeArray = answerBoth
        ?.filter((answers) =>
          visitortypearray.some((sub) =>
            sub.followuparray?.some((val) => val?.visitorpurpose === answers.name)
          )
        )
        .map((data) => data._id?.toString());  // Map filtered results to stringified _id

      const manageTypepg = answerBoth
        ?.filter((answers) =>
          managetypepg.some((sub) =>
            sub.interactorspurpose?.includes(answers.name)
          )
        )
        .map((data) => data._id?.toString());  // Map filtered results to stringified _id


      const duplicateId = [
        ...visitorType,
        ...visitorTypeArray,
        ...manageTypepg,
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