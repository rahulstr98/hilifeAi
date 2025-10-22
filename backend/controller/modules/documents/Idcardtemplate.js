const Cardpreparation = require("../../../model/modules/documents/Idcardtemplate");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

// get All Cardpreparation  => /api/CardPreparations
exports.getAllCardPreparation = catchAsyncErrors(async (req, res, next) => {
  let cardpreparation;
  try {
    cardpreparation = await Cardpreparation.find({}, { company: 1, branch: 1, unit: 1, team: 1, person: 1, _id: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!cardpreparation) {
    return next(new ErrorHandler("Card Preparation not 123found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    cardpreparation,
  });
});
exports.getAssignBranchIdCardPreparation = catchAsyncErrors(async (req, res, next) => {
  const { assignbranch } = req.body;
  let cardpreparation, overallList

  const query = {
    $or: assignbranch.map(item => ({
      company: item.company,
      branch: item.branch,
      $or: [
        { unit: item.unit },  // Match the specific unit
        { unit: 'ALL' }       // Or allow 'All' units
      ]
    }))
  };

  
  try {
    cardpreparation = await Cardpreparation.find(query, { company: 1, branch: 1, unit: 1, team: 1, person: 1, _id: 1 });
    overallList = await Cardpreparation.find({}, { company: 1, branch: 1, unit: 1, team: 1, person: 1, _id: 1 });
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!cardpreparation && !overallList) {
    return next(new ErrorHandler("Card Preparation not 123found!", 404));
  }
  return res.status(200).json({
    // count: products.length,
    cardpreparation, overallList
  });
});

// Create new Cardpreparation=> /api/Cardpreparation/new
exports.addCardPreparation = catchAsyncErrors(async (req, res, next) => {
  let aCardPreparation = await Cardpreparation.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Signle Cardpreparation => /api/cardpreparation/:id
exports.getSingleCardPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let scardPreparation = await Cardpreparation.findById(id);

  if (!scardPreparation) {
    return next(new ErrorHandler("Card Preparation 111111not found!", 404));
  }
  return res.status(200).json({
    scardPreparation,
  });
});

// update Cardpreparation by id => /api/cardpreparation/:id
exports.updateCardPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let ucardPreparation = await Cardpreparation.findByIdAndUpdate(id, req.body);
  if (!ucardPreparation) {
    return next(new ErrorHandler("Cardpreparation not1111 found!", 404));
  }
  return res.status(200).json({ message: "Updated successfully" });
});

// delete Cardpreparation by id => /api/cardpreparation/:id
exports.deleteCardPreparation = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dCardPreparation = await Cardpreparation.findByIdAndRemove(id);

  if (!dCardPreparation) {
    return next(new ErrorHandler("Card Preparation 11not found!", 404));
  }
  return res.status(200).json({ message: "Deleted successfully" });
});