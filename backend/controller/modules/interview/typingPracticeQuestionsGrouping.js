const PracticeQuestions = require('../../../model/modules/interview/typingPracticeQuestions');
const PracticeQuestionsResponse = require('../../../model/modules/interview/typingPracticeresponse');
const PracticeQuestionsGrouping = require('../../../model/modules/interview/typingPracticeQuestionsGrouping');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');


// get All PracticeQuestionsGrouping=> /api/allpracticequestionsgrouping
exports.getAllPracticeQuestionsGrouping = catchAsyncErrors(async (req, res, next) => {
    let allPracticeQuestionsGrouping;
    try {


        const pipeline = [
            {
                $lookup: {
                    from: "typingpracticeresponses", // Make sure this matches your collection name in MongoDB
                    let: { groupingId: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$groupingid", "$$groupingId"] // Only check for groupingid
                                }
                            }
                        },
                        { $limit: 1 } // If there's at least one match, it's sufficient
                    ],
                    as: "response"
                }
            },
            {
                $addFields: {
                    responseexist: { $gt: [{ $size: "$response" }, 0] } // If response array is non-empty, set to true
                }
            },
            {
                $project: {
                    response: 0 // Remove lookup response array to keep response clean
                }
            }
        ];

        allPracticeQuestionsGrouping = await PracticeQuestionsGrouping.aggregate(pipeline);


    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!allPracticeQuestionsGrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        allPracticeQuestionsGrouping,
    });
});

// Create new PracticeQuestionsGrouping=> /api/practicequestionsgrouping/new
exports.addPracticeQuestionsGrouping = catchAsyncErrors(async (req, res, next) => {


    await PracticeQuestionsGrouping.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle PracticeQuestionsGrouping => /api/singlepracticequestions/:id
exports.getSinglePracticeQuestionsGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let singlePracticeQuestionsGrouping = await PracticeQuestionsGrouping.findById(id);

    if (!singlePracticeQuestionsGrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        singlePracticeQuestionsGrouping,
    });
});


// update PracticeQuestionsGrouping by id => /api/singlepracticequestions/:id
exports.updatePracticeQuestionsGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let updatePracticeQuestionsGrouping = await PracticeQuestionsGrouping.findByIdAndUpdate(id, req.body);
    if (!updatePracticeQuestionsGrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete PracticeQuestionsGrouping by id => /api/singlepracticequestions/:id
exports.deletePracticeQuestionsGrouping = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let deletePracticeQuestionsGrouping = await PracticeQuestionsGrouping.findByIdAndRemove(id);

    if (!deletePracticeQuestionsGrouping) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});



// get All PracticeQuestionsGrouping=> /api/allpracticequestionsgrouping
exports.getIndividualPracticeSession = catchAsyncErrors(async (req, res, next) => {
    let individualPracticeSession;
    try {
        const { company, branch, unit, team, department, designation, companyname, employeeid } = req.body;


        const pipeline = [
            {
                $match: {
                    $or: [
                        { type: "Company", company: { $in: [company] } },
                        { type: "Branch", company: { $in: [company] }, branch: { $in: [branch] } },
                        { type: "Unit", company: { $in: [company] }, branch: { $in: [branch] }, unit: { $in: [unit] } },
                        { type: "Team", company: { $in: [company] }, branch: { $in: [branch] }, unit: { $in: [unit] }, team: { $in: [team] } },
                        { type: "Department", company: { $in: [company] }, branch: { $in: [branch] }, unit: { $in: [unit] }, department: { $in: [department] } },
                        { type: "Designation", company: { $in: [company] }, branch: { $in: [branch] }, unit: { $in: [unit] }, designation: { $in: [designation] } },
                        { type: "Individual", company: { $in: [company] }, branch: { $in: [branch] }, unit: { $in: [unit] }, team: { $in: [team] }, employeename: { $in: [companyname] } },
                    ],
                },
            },
            // Lookup from PracticeQuestionsResponse collection
            {
                $lookup: {
                    from: "typingpracticeresponses", // Make sure this matches your collection name in MongoDB
                    let: { groupingId: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$groupingid", "$$groupingId"] },
                                        { $eq: ["$employeedbid", employeeid] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 } // If there's at least one match, it's sufficient
                    ],
                    as: "response"
                }
            },
            {
                $addFields: {
                    responseexist: { $gt: [{ $size: "$response" }, 0] } // If response array is non-empty, set to true
                }
            },
            {
                $project: {
                    response: 0 // Remove lookup response array to keep response clean
                }
            }
        ];

        individualPracticeSession = await PracticeQuestionsGrouping.aggregate(pipeline);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!individualPracticeSession) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    return res.status(200).json({
        individualPracticeSession,
    });
});

exports.getPracticeSessionQuestions = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    // Fetch the PracticeQuestionsGrouping by ID
    let practiceSessionQuestions = await PracticeQuestionsGrouping.findById(id);

    if (!practiceSessionQuestions) {
        return next(new ErrorHandler("Data not found!", 404));
    }

    // Extract question IDs from the grouping
    const questionIds = practiceSessionQuestions.questionsid;

    // Fetch practice questions matching the IDs
    const practiceQuestions = await PracticeQuestions.find({ _id: { $in: questionIds } });

    // Attach the questions to the object
    let allPracticeSessionQuestions = {
        ...practiceSessionQuestions.toObject(),
        practiceQuestions,
    };

    console.log(allPracticeSessionQuestions)

    return res.status(200).json({
        allPracticeSessionQuestions,
    });
});


exports.getDynamicPracticeSesionResponse = catchAsyncErrors(async (req, res, next) => {

    const { pipeline } = req.body;
    // Fetch the PracticeQuestionsGrouping by ID
    let preacticeResponse = await PracticeQuestionsResponse.aggregate(pipeline);

    if (!preacticeResponse) {
        return next(new ErrorHandler("Data not found!", 404));
    }


    return res.status(200).json({
        preacticeResponse,
    });
});


exports.getSinglePracticeQuestionResponse = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let singlePracticeQuestionResponse = await PracticeQuestionsResponse.findById(id);

    if (!singlePracticeQuestionResponse) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        singlePracticeQuestionResponse,
    });
});

exports.addPracticeQuestionResponse = catchAsyncErrors(async (req, res, next) => {


    let createdData = await PracticeQuestionsResponse.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
        createdData
    });
});




exports.getPracticeQuestionIds = catchAsyncErrors(async (req, res, next) => {
    const { questionsid } = req.body; // Array of question IDs from request body

    // Find all questions stored in PracticeQuestionsGrouping
    const practiceQuestions = await PracticeQuestionsGrouping.find({}, { questionsid: 1 });

    // Extract all question IDs from the database
    const existingQuestionIds = new Set(practiceQuestions.flatMap(doc => doc.questionsid));

    // Find IDs that are not present in the database
    const notPresentIds = questionsid.filter(id => !existingQuestionIds.has(id));
    const presentIds = questionsid.filter(id => existingQuestionIds.has(id));

    return res.status(200).json({
        notPresentIds,
        presentIds,
    });
});



// //overall delete questions  => /api/overalldelete/interviewquestions
// exports.overallDeletePracticeQuestionsGrouping = catchAsyncErrors(
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
// exports.overallBulkDeletePracticeQuestionsGrouping = catchAsyncErrors(
//     async (req, res, next) => {
//         let practicequestionsgrouping, result, count;
//         let id = req.body.id;
//         try {
//             practicequestionsgrouping = await PracticeQuestionsGrouping.find();
//             const answer = practicequestionsgrouping?.filter((data) =>
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
// exports.overallEditPracticeQuestionsGrouping = catchAsyncErrors(
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