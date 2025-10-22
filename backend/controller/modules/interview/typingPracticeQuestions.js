const PracticeQuestions = require('../../../model/modules/interview/typingPracticeQuestions');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');


// get All PracticeQuestions=> /api/allpracticequestions
exports.getAllPracticeQuestions = catchAsyncErrors(async (req, res, next) => {
    let allPracticeQuestions;
    try {

        allPracticeQuestions = await PracticeQuestions.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!allPracticeQuestions) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        allPracticeQuestions,
    });
});

// Create new PracticeQuestions=> /api/practicequestions/new
exports.addPracticeQuestions = catchAsyncErrors(async (req, res, next) => {


    await PracticeQuestions.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle PracticeQuestions => /api/singlepracticequestions/:id
exports.getSinglePracticeQuestions = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let singlePracticeQuestions = await PracticeQuestions.findById(id);

    if (!singlePracticeQuestions) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        singlePracticeQuestions,
    });
});

// update PracticeQuestions by id => /api/singlepracticequestions/:id
exports.updatePracticeQuestions = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let updatePracticeQuestions = await PracticeQuestions.findByIdAndUpdate(id, req.body);
    if (!updatePracticeQuestions) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete PracticeQuestions by id => /api/singlepracticequestions/:id
exports.deletePracticeQuestions = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let deletePracticeQuestions = await PracticeQuestions.findByIdAndRemove(id);

    if (!deletePracticeQuestions) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});



// //overall delete questions  => /api/overalldelete/interviewquestions
// exports.overallDeletePracticeQuestions = catchAsyncErrors(
//     async (req, res, next) => {
//         const { mode, category, subcategory, question } = req.body;
//         let questiongrouping, questionorder;
//         function checkPageUsage(
//             questiongrouping,
//             questionorder
//         ) {
//             let usedPages = "";

//             if (questiongrouping || questionorder) {
//                 if (questiongrouping) usedPages += "Question Grouping, ";
//                 if (questionorder) usedPages += "Question Order, ";
//             }

//             return usedPages.trim();
//         }

//         [questiongrouping, questionorder] =
//             await Promise.all([

//                 InterviewQuestionGrouping.countDocuments({
//                     mode,
//                     category,
//                     subcategory,
//                     question: { $in: question },
//                 }),
//                 InterviewQuestionsOrder.countDocuments({
//                     category,
//                     subcategory,
//                     question: { $in: question },
//                 }),
//             ]);

//         const usedPages = checkPageUsage(
//             questiongrouping,
//             questionorder
//         );

//         if (usedPages) {
//             return next(
//                 new ErrorHandler(
//                     `This Question Datas already used in ${usedPages} Pages`,
//                     404
//                 )
//             );
//         }

//         return res.status(200).json({ mayidelete: true });
//     }
// );

// //overall bulk delete questions  => /api/overallbulkdelete/interviewquestions
// exports.overallBulkDeletePracticeQuestions = catchAsyncErrors(
//     async (req, res, next) => {
//         let practicequestions, result, count;
//         let id = req.body.id;
//         try {
//             practicequestions = await PracticeQuestions.find();
//             const answer = practicequestions?.filter((data) =>
//                 id?.includes(data._id?.toString())
//             );

//             [questiongrouping, statuquestionorder] =
//                 await Promise.all([
//                     InterviewQuestionGrouping.find(),
//                     InterviewQuestionsOrder.find(),
//                 ]);



//             const unmatchedQuestionGrouping = answer
//                 .filter((answers) =>
//                     questiongrouping.some(
//                         (sub) =>
//                             sub.mode === answers.mode &&
//                             sub.category === answers.category &&
//                             sub.subcategory === answers.subcategory &&
//                             sub?.question?.includes(answers?.question)
//                     )
//                 )
//                 ?.map((data) => data._id?.toString());

//             const unmatchedQuestionOrder = answer
//                 .filter((answers) =>
//                     statuquestionorder.some(
//                         (sub) =>
//                             sub.category === answers.category &&
//                             sub.subcategory === answers.subcategory &&
//                             sub?.question?.includes(answers?.question)
//                     )
//                 )
//                 ?.map((data) => data._id?.toString()); //questions

//             const duplicateId = [
//                 ...unmatchedQuestionGrouping,
//                 ...unmatchedQuestionOrder,
//             ];
//             result = id?.filter((data) => !duplicateId?.includes(data));
//             count = id?.filter((data) => duplicateId?.includes(data))?.length;
//         } catch (err) {
//             return next(new ErrorHandler("Records not found!", 404));
//         }

//         return res.status(200).json({
//             count: count,
//             result,
//         });
//     }
// );

// //overall edit questions  => /api/overalledit/interviewquestions
// exports.overallEditPracticeQuestions = catchAsyncErrors(
//     async (req, res, next) => {
//         const {
//             oldcategory,
//             newcategory,
//             oldsubcategory,
//             newsubcategory,
//             oldquestion,
//             newquestion,
//             oldsubquestion,
//             newsubquestion,
//             mode,
//         } = req.body;
//         try {
//             await Promise.all([

//                 InterviewQuestionGrouping.updateMany(
//                     {
//                         $and: [
//                             { category: oldcategory },
//                             { subcategory: oldsubcategory },
//                             { question: oldquestion },
//                             { mode: mode },
//                             { "interviewForm.question": oldquestion },
//                         ],
//                     },
//                     {
//                         $set: {
//                             category: newcategory,
//                             subcategory: newsubcategory,
//                             "question.$[elem]": newquestion,
//                             "interviewForm.$[formElem].question": newquestion,
//                         },
//                     },
//                     {
//                         arrayFilters: [
//                             { elem: oldquestion },
//                             { "formElem.question": oldquestion },
//                         ],
//                     }
//                 ),
//                 InterviewQuestionsOrder.updateMany(
//                     {
//                         $and: [
//                             { category: oldcategory },
//                             { subcategory: oldsubcategory },
//                             { question: oldquestion },
//                             { "interviewForm.question": oldquestion },
//                         ],
//                     },
//                     {
//                         $set: {
//                             category: newcategory,
//                             subcategory: newsubcategory,
//                             "question.$[elem]": newquestion,
//                             "interviewForm.$[formElem].question": newquestion,
//                         },
//                     },
//                     {
//                         arrayFilters: [
//                             { elem: oldquestion },
//                             { "formElem.question": oldquestion },
//                         ],
//                     }
//                 ),
//             ]);
//         } catch (err) {
//             return next(new ErrorHandler("Records not found!", 404));
//         }

//         return res.status(200).json({ updated: true });
//     }
// );