const InterviewVerification = require('../../../model/modules/interview/interviewVerification');
const InterviewQuestionGrouping = require('../../../model/modules/interview/interviewquestiongrouping');
const InterviewQuestionsOrder = require('../../../model/modules/interview/InterviewQuestionsOrderModel');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');


// get All InterviewVerification=> /api/allinterviewverification
exports.getAllInterviewVerification = catchAsyncErrors(async (req, res, next) => {
    let allInterviewVerification;
    try {

        allInterviewVerification = await InterviewVerification.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!allInterviewVerification) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        // count: products.length,
        allInterviewVerification,
    });
});

// Create new InterviewVerification=> /api/interviewverification/new
exports.addInterviewVerification = catchAsyncErrors(async (req, res, next) => {


    await InterviewVerification.create(req.body);

    return res.status(200).json({
        message: "Successfully added!",
    });
});

// get Signle InterviewVerification => /api/singleinterviewverification/:id
exports.getSingleInterviewVerification = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let singleInterviewVerification = await InterviewVerification.findById(id);

    if (!singleInterviewVerification) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({
        singleInterviewVerification,
    });
});

// update InterviewVerification by id => /api/singleinterviewverification/:id
exports.updateInterviewVerification = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let updateInterviewVerification = await InterviewVerification.findByIdAndUpdate(id, req.body);
    if (!updateInterviewVerification) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Updated successfully" });
});

// delete InterviewVerification by id => /api/singleinterviewverification/:id
exports.deleteInterviewVerification = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let deleteInterviewVerification = await InterviewVerification.findByIdAndRemove(id);

    if (!deleteInterviewVerification) {
        return next(new ErrorHandler("Data not found!", 404));
    }
    return res.status(200).json({ message: "Deleted successfully" });
});



//overall delete questions  => /api/overalldelete/interviewquestions
exports.overallDeleteInterviewVerification = catchAsyncErrors(
    async (req, res, next) => {
        const { mode, category, subcategory, question } = req.body;
        let questiongrouping, questionorder;
        function checkPageUsage(
            questiongrouping,
            questionorder
        ) {
            let usedPages = "";

            if (questiongrouping || questionorder) {
                if (questiongrouping) usedPages += "Question Grouping, ";
                if (questionorder) usedPages += "Question Order, ";
            }

            return usedPages.trim();
        }

        [questiongrouping, questionorder] =
            await Promise.all([

                InterviewQuestionGrouping.countDocuments({
                    mode,
                    category,
                    subcategory,
                    question: { $in: question },
                }),
                InterviewQuestionsOrder.countDocuments({
                    category,
                    subcategory,
                    question: { $in: question },
                }),
            ]);

        const usedPages = checkPageUsage(
            questiongrouping,
            questionorder
        );

        if (usedPages) {
            return next(
                new ErrorHandler(
                    `This Question Datas already used in ${usedPages} Pages`,
                    404
                )
            );
        }

        return res.status(200).json({ mayidelete: true });
    }
);

//overall bulk delete questions  => /api/overallbulkdelete/interviewquestions
exports.overallBulkDeleteInterviewVerification = catchAsyncErrors(
    async (req, res, next) => {
        let interviewverification, result, count;
        let id = req.body.id;
        try {
            interviewverification = await InterviewVerification.find();
            const answer = interviewverification?.filter((data) =>
                id?.includes(data._id?.toString())
            );

            [questiongrouping, statuquestionorder] =
                await Promise.all([
                    InterviewQuestionGrouping.find(),
                    InterviewQuestionsOrder.find(),
                ]);



            const unmatchedQuestionGrouping = answer
                .filter((answers) =>
                    questiongrouping.some(
                        (sub) =>
                            sub.mode === answers.mode &&
                            sub.category === answers.category &&
                            sub.subcategory === answers.subcategory &&
                            sub?.question?.includes(answers?.question)
                    )
                )
                ?.map((data) => data._id?.toString());

            const unmatchedQuestionOrder = answer
                .filter((answers) =>
                    statuquestionorder.some(
                        (sub) =>
                            sub.category === answers.category &&
                            sub.subcategory === answers.subcategory &&
                            sub?.question?.includes(answers?.question)
                    )
                )
                ?.map((data) => data._id?.toString()); //questions

            const duplicateId = [
                ...unmatchedQuestionGrouping,
                ...unmatchedQuestionOrder,
            ];
            result = id?.filter((data) => !duplicateId?.includes(data));
            count = id?.filter((data) => duplicateId?.includes(data))?.length;
        } catch (err) {
            return next(new ErrorHandler("Records not found!", 404));
        }

        return res.status(200).json({
            count: count,
            result,
        });
    }
);

//overall edit questions  => /api/overalledit/interviewquestions
exports.overallEditInterviewVerification = catchAsyncErrors(
    async (req, res, next) => {
        const {
            oldcategory,
            newcategory,
            oldsubcategory,
            newsubcategory,
            oldquestion,
            newquestion,
            oldsubquestion,
            newsubquestion,
            optionsArray,
            mode,
        } = req.body;
        try {
            await Promise.all([

                InterviewQuestionGrouping.updateMany(
                    {
                        $and: [
                            { category: oldcategory },
                            { subcategory: oldsubcategory },
                            { question: oldquestion },
                            { mode: mode },
                            { "interviewForm.question": oldquestion },
                        ],
                    },
                    {
                        $set: {
                            category: newcategory,
                            subcategory: newsubcategory,
                            "question.$[elem]": newquestion,
                            "interviewForm.$[formElem].question": newquestion,
                            "interviewForm.$[formElem].optionArr": optionsArray,
                        },
                    },
                    {
                        arrayFilters: [
                            { elem: oldquestion },
                            { "formElem.question": oldquestion },
                        ],
                    }
                ),
                InterviewQuestionsOrder.updateMany(
                    {
                        $and: [
                            { category: oldcategory },
                            { subcategory: oldsubcategory },
                            { question: oldquestion },
                            { "interviewForm.question": oldquestion },
                        ],
                    },
                    {
                        $set: {
                            category: newcategory,
                            subcategory: newsubcategory,
                            "question.$[elem]": newquestion,
                            "interviewForm.$[formElem].question": newquestion,
                            "interviewForm.$[formElem].optionArr": optionsArray,
                        },
                    },
                    {
                        arrayFilters: [
                            { elem: oldquestion },
                            { "formElem.question": oldquestion },
                        ],
                    }
                ),
            ]);
        } catch (err) {
            return next(new ErrorHandler("Records not found!", 404));
        }

        return res.status(200).json({ updated: true });
    }
);