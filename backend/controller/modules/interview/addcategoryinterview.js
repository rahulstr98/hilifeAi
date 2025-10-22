const InterviewCategory = require("../../../model/modules/interview/addcategoryinterview");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");

const VerificationMaster = require("../../../model/modules/interview/interviewVerification");
const ExitInterviewTestmaster = require("../../../model/modules/interview/exitinterviewtestmaster");
const ExitInterviewQuestionmaster = require("../../../model/modules/interview/exitquestionmaster");
const InterviewTypeMaster = require("../../../model/modules/interview/interviewtypemaster");
const InterviewTestMaster = require("../../../model/modules/interview/interviewtestmaster");
const InterviewQuestions = require("../../../model/modules/interview/interviewquestions");
const InterviewAnswerAllot = require("../../../model/modules/interview/InterviewQuestionAnswerAllot");
const InterviewStatusAllot = require("../../../model/modules/interview/interviewformdesign");
const InterviewQuestionGrouping = require("../../../model/modules/interview/interviewquestiongrouping");
const InterviewQuestionsOrder = require("../../../model/modules/interview/InterviewQuestionsOrderModel");
const OnlineTestQuestion = require("../../../model/modules/interview/onlinetestquestions");
const OnlineTestMaster = require("../../../model/modules/interview/onlinetestmaster");
const TrainingDetails = require("../../../model/modules/task/trainingdetails");
const PracticeQuestions = require('../../../model/modules/interview/typingPracticeQuestions');
const PracticeQuestionsGrouping = require('../../../model/modules/interview/typingPracticeQuestionsGrouping');

// get all interviewscategory => /api/documencategories

exports.getAllInterviewCategory = catchAsyncErrors(async (req, res, next) => {
  let interviewcategory;
  try {
    interviewcategory = await InterviewCategory.find();
  } catch (err) {
    return next(new ErrorHandler("Records Not Found", 500));
  }
  if (!interviewcategory) {
    return next(new ErrorHandler("category not found", 404));
  }
  // Add serial numbers to the ticketcategory
  const alldoccategory = interviewcategory.map((data, index) => ({
    serialNumber: index + 1,
    ...data.toObject(),
  }));

  return res.status(200).json({
    interviewcategory: alldoccategory,
  });
});

exports.addInterviewCategory = catchAsyncErrors(async (req, res, next) => {
  await InterviewCategory.create(req.body);
  return res.status(200).json({
    message: "Successfully added",
  });
});

exports.getSingleInterviewCategory = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    let sinterviewcategory = await InterviewCategory.findById(id);
    if (!sinterviewcategory) {
      return next(new ErrorHandler("tickets not found"));
    }
    return res.status(200).json({
      sinterviewcategory,
    });
  }
);

exports.updateInterviewCategory = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let uinterviewcategory = await InterviewCategory.findByIdAndUpdate(
    id,
    req.body
  );

  if (!uinterviewcategory) {
    return next(new ErrorHandler("ticket not found"));
  }
  return res.status(200).json({
    message: "Update Successfully",
    uinterviewcategory,
  });
});

//delete interviewcategory by id => /api/delinterviewcateg/:id
exports.deleteInterviewCategory = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dinterviewcategory = await InterviewCategory.findByIdAndRemove(id);
  if (!dinterviewcategory) {
    return next(new ErrorHandler("interview not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

//overall delete category  => /api/overalldelete/interviewcategory
exports.overallDeleteInterviewCategory = catchAsyncErrors(
  async (req, res, next) => {
    const { mode, category, subcategory } = req.body;

    let trainingDetails = await TrainingDetails.find();

    let resulttraining = trainingDetails?.filter((data) => {
      const match = data.testnames?.split("-(")[1];
      return match?.split("-")[0] == category;
    });
    let typemaster,
      testmaster,
      questions,
      answerallot,
      statusallot,
      questiongrouping,
      questionorder,
      onlinetestquestion,
      statuquestionorder,
      exitinterviewquestionmaster,
      exitinterviewtestmaster,
      onlinetestmaster,
      verificationmaster,
      practicequestions,
      practicequestionsgrouping;

    function checkPageUsage(
      typemaster,
      testmaster,
      questions,
      answerallot,
      statusallot,
      questiongrouping,
      questionorder,
      onlinetestmaster,
      onlinetestquestion,
      resulttraining,
      exitinterviewquestionmaster,
      exitinterviewtestmaster,
      verificationmaster,
      practicequestions,
      practicequestionsgrouping,
    ) {
      let usedPages = "";

      if (
        typemaster ||
        testmaster ||
        questions ||
        answerallot ||
        statusallot ||
        questiongrouping ||
        questionorder ||
        onlinetestmaster ||
        onlinetestquestion ||
        resulttraining ||
        exitinterviewquestionmaster ||
        exitinterviewtestmaster ||
        verificationmaster ||
        practicequestions ||
        practicequestionsgrouping
      ) {
        if (typemaster) usedPages += "Type Master, ";
        if (testmaster) usedPages += "Test Master, ";
        if (questions) usedPages += "Questions, ";
        if (answerallot) usedPages += "Answer Allot, ";
        if (statusallot) usedPages += "Status Allot, ";
        if (questiongrouping) usedPages += "Question Grouping, ";
        if (questionorder) usedPages += "Question Order, ";
        if (onlinetestquestion) usedPages += "Online Test Question, ";
        if (onlinetestmaster) usedPages += "Online Test Master, ";
        if (resulttraining) usedPages += "Training Details, ";
        if (exitinterviewquestionmaster)
          usedPages += "Exit Interview Question Master, ";
        if (exitinterviewtestmaster)
          usedPages += "Exit Interview Test Master, ";
        if (verificationmaster)
          usedPages += "Verification Master, ";
        if (practicequestions)
          usedPages += "Typing Practice Questions, ";
        if (practicequestionsgrouping)
          usedPages += "Typing Practice Questions Grouping, ";
      }

      return usedPages.trim();
    }

    if (mode === "Questions" || mode === "Typing Test") {
      [
        practicequestions,
        practicequestionsgrouping,
        typemaster,
        questions,
        answerallot,
        statusallot,
        questiongrouping,
        questionorder,
      ] = await Promise.all([
        PracticeQuestions.countDocuments({
          category,
        }),
        PracticeQuestionsGrouping.countDocuments({
          $and: [{ category: { $in: category } }],
        }),
        InterviewTypeMaster.countDocuments({
          $and: [{ mode }, { categorytype: { $in: category } }],
        }),
        InterviewQuestions.countDocuments({ category }),
        InterviewAnswerAllot.countDocuments({
          mode: { $in: ["Questions", "Typing Test"] },
          category,
        }),
        InterviewStatusAllot.countDocuments({
          mode: { $in: ["Questions", "Typing Test"] },
          category,
        }),
        InterviewQuestionGrouping.countDocuments({
          mode: { $in: ["Questions", "Typing Test"] },
          category,
        }),
        InterviewQuestionsOrder.countDocuments({ category }),
      ]);
    } else
      if (mode === "Verification/Administrative") {
        [

          verificationmaster,
          questiongrouping,
          questionorder,
        ] = await Promise.all([

          VerificationMaster.countDocuments({
            mode: { $in: ["Verification/Administrative"] },
            category,
          }),
          InterviewQuestionGrouping.countDocuments({
            mode: { $in: ["Verification/Administrative"] },
            category,
          }),
          InterviewQuestionsOrder.countDocuments({ category }),
        ]);
      } else if (mode === "Exit Interview") {
        [exitinterviewtestmaster, exitinterviewquestionmaster] =
          await Promise.all([
            ExitInterviewTestmaster.countDocuments({
              category,
            }),
            ExitInterviewQuestionmaster.countDocuments({
              category,
            }),
          ]);
      } else {
        [testmaster, questiongrouping, onlinetestmaster, onlinetestquestion] =
          await Promise.all([
            InterviewTestMaster.countDocuments({ category }),
            InterviewQuestionGrouping.countDocuments({
              mode: "Online or Interview Test",
              category,
            }),
            OnlineTestMaster.countDocuments({ category }),
            OnlineTestQuestion.countDocuments({ category }),
          ]);
      }

    const usedPages = checkPageUsage(
      typemaster,
      testmaster,
      questions,
      answerallot,
      statusallot,
      questiongrouping,
      questionorder,
      onlinetestmaster,
      onlinetestquestion,
      resulttraining?.length > 0,
      exitinterviewquestionmaster,
      exitinterviewtestmaster,
      verificationmaster,
      practicequestions,
      practicequestionsgrouping,
    );

    if (usedPages !== "") {
      return next(
        new ErrorHandler(
          `This Category and Sub Category already used in ${usedPages} Pages`,
          404
        )
      );
    }

    return res.status(200).json({ mayidelete: true });
  }
);

//overall bulk delete category  => /api/overallbulkdelete/interviewcategory
exports.overallBulkDeleteInterviewCategory = catchAsyncErrors(
  async (req, res, next) => {
    let typemaster,
      testmaster,
      statusallot,
      answerallot,
      questions,
      interviewcategory,
      onlinetestquestion,
      onlinetestmaster,
      result,
      exitinterviewquestionmaster,
      exitinterviewtestmaster,
      verificationmaster,
      practicequestions,
      practicequestionsgrouping,
      count;
    let id = req.body.id;
    try {
      interviewcategory = await InterviewCategory.find();
      const answerQuestion = interviewcategory?.filter(
        (data) =>
          id?.includes(data._id?.toString()) && data?.mode === "Questions"
      );
      const exitQuestion = interviewcategory?.filter(
        (data) =>
          id?.includes(data._id?.toString()) && data?.mode === "Exit Interview"
      );
      const answerTypingQuestion = interviewcategory?.filter(
        (data) =>
          id?.includes(data._id?.toString()) && data?.mode === "Typing Test"
      );
      const answerTest = interviewcategory?.filter(
        (data) =>
          id?.includes(data._id?.toString()) &&
          data?.mode === "Online or Interview Test"
      );
      const answerVerificationMaster = interviewcategory?.filter(
        (data) =>
          id?.includes(data._id?.toString()) &&
          data?.mode === "Verification/Administrative"
      );

      const answerBoth = interviewcategory?.filter((data) =>
        id?.includes(data._id?.toString())
      );

      [
        typemaster,
        testmaster,
        questions,
        answerallot,
        statusallot,
        questiongrouping,
        questionorder,
        onlinetestquestion,
        onlinetestmaster,
        exitinterviewquestionmaster,
        exitinterviewtestmaster,
        verificationmaster,
        practicequestions,
        practicequestionsgrouping
      ] = await Promise.all([
        InterviewTypeMaster.find(),
        InterviewTestMaster.find(),
        InterviewQuestions.find(),
        InterviewAnswerAllot.find(),
        InterviewStatusAllot.find(),
        InterviewQuestionGrouping.find(),
        InterviewQuestionsOrder.find(),
        OnlineTestQuestion.find(),
        OnlineTestMaster.find(),
        ExitInterviewQuestionmaster.find(),
        ExitInterviewTestmaster.find(),
        VerificationMaster.find(),
        PracticeQuestions.find(),
        PracticeQuestionsGrouping.find(),
      ]);

      const unmatchedExitInteriewQuestionMaster = exitQuestion
        .filter((answers) =>
          exitinterviewquestionmaster.some(
            (sub) => sub.category === answers.categoryname
          )
        )
        ?.map((data) => data._id?.toString());
      const unmatchedExitInteriewTestMaster = exitQuestion
        .filter((answers) =>
          exitinterviewtestmaster.some(
            (sub) => sub.category === answers.categoryname
          )
        )
        ?.map((data) => data._id?.toString());
      const unmatchedVerificationMaster = answerVerificationMaster
        .filter((answers) =>
          verificationmaster.some(
            (sub) => sub.category === answers.categoryname
          )
        )
        ?.map((data) => data._id?.toString());

      const unmatchedTypeMaster = answerQuestion
        .filter((answers) =>
          typemaster.some(
            (sub) =>
              sub.categorytype.includes(answers.categoryname) &&
              sub.mode === "Questions"
          )
        )
        ?.map((data) => data._id?.toString()); //questions

      const unmatchedOnlineTestQuestion = answerTest
        .filter((answers) =>
          onlinetestquestion.some(
            (sub) => sub.category === answers.categoryname
          )
        )
        ?.map((data) => data._id?.toString());
      const unmatchedOnlineTestmaster = answerTest
        .filter((answers) =>
          onlinetestmaster.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());

      const unmatchedQuestions = answerQuestion
        .filter((answers) =>
          questions.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());
      const unmatchedTypingQuestions = answerTypingQuestion
        .filter((answers) =>
          questions.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());
      const unmatchedTypingPracticeQuestions = answerTypingQuestion
        .filter((answers) =>
          practicequestions.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());
      const unmatchedTypingPracticeQuestionsGrouping = answerTypingQuestion
        .filter((answers) =>
          practicequestionsgrouping.some((sub) => sub.category?.includes(answers.categoryname))
        )
        ?.map((data) => data._id?.toString());
      const unmatchedAnswerAllot = answerBoth
        .filter((answers) =>
          answerallot.some(
            (sub) =>
              sub.category === answers.categoryname && sub.mode === answers.mode
          )
        )
        ?.map((data) => data._id?.toString());
      const unmatchedStatusAllot = answerBoth
        .filter((answers) =>
          statusallot.some(
            (sub) =>
              sub.category === answers.categoryname && sub.mode === answers.mode
          )
        )
        ?.map((data) => data._id?.toString());

      const unmatchedQuestionOrder = answerQuestion
        .filter((answers) =>
          questionorder.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());

      const unmatchedTestMaster = answerTest
        .filter((answers) =>
          testmaster.some((sub) => sub.category === answers.categoryname)
        )
        ?.map((data) => data._id?.toString());
      const unmatchedQuestionGrouping = answerBoth
        .filter((answers) =>
          questiongrouping.some(
            (sub) =>
              sub.category === answers.categoryname && sub.mode === answers.mode
          )
        )
        ?.map((data) => data._id?.toString());
      const unmatchedQuestionOrderVerification = answerVerificationMaster
        .filter((answers) =>
          questionorder.some(
            (sub) =>
              sub.category === answers.categoryname
          )
        )
        ?.map((data) => data._id?.toString());

      const duplicateId = [
        ...unmatchedTypingPracticeQuestions,
        ...unmatchedTypingPracticeQuestionsGrouping,
        ...unmatchedVerificationMaster,
        ...unmatchedQuestionOrderVerification,
        ...unmatchedTestMaster,
        ...unmatchedTypeMaster,
        ...unmatchedQuestions,
        ...unmatchedTypingQuestions,
        ...unmatchedAnswerAllot,
        ...unmatchedStatusAllot,
        ...unmatchedQuestionGrouping,
        ...unmatchedQuestionOrder,
        ...unmatchedOnlineTestQuestion,
        ...unmatchedOnlineTestmaster,
        ...unmatchedExitInteriewQuestionMaster,
        ...unmatchedExitInteriewTestMaster,
      ];
      result = id?.filter((data) => !duplicateId?.includes(data));
      count = id?.filter((data) => duplicateId?.includes(data))?.length;
    } catch (err) {
      return next(new ErrorHandler("Records Not Found", 500));
    }

    return res.status(200).json({
      count: count,
      result,
    });
  }
);

//overall edit category  => /api/overalledit/interviewcategory
exports.overallEditInterviewCategory = catchAsyncErrors(
  async (req, res, next) => {
    const { mode, oldcategory, newcategory } = req.body;
    let resulttraining;
    const trainingDetails = await TrainingDetails.find();
    resulttraining = trainingDetails?.filter((data) => {
      const match = data.testnames?.split("-(")[1];
      return match?.split("-")[0] == oldcategory;
    });

    // resulttraining =
    if (mode === "Questions" || mode === "Typing Test") {
      await Promise.all([
        PracticeQuestions.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        PracticeQuestionsGrouping.updateMany(
          {
            category: { $elemMatch: { $in: oldcategory } },
          },
          {
            $set: { "category.$": newcategory },
          }
        ),
        InterviewTypeMaster.updateMany(
          {
            mode: "Questions",
            categorytype: { $elemMatch: { $in: oldcategory } },
          },
          {
            $set: { "categorytype.$": newcategory },
          }
        ),
        InterviewQuestions.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        InterviewAnswerAllot.updateMany(
          {
            category: oldcategory,
            mode: { $in: ["Questions", "Typing Test"] },
          },
          {
            $set: { category: newcategory },
          }
        ),
        InterviewStatusAllot.updateMany(
          {
            category: oldcategory,
            mode: { $in: ["Questions", "Typing Test"] },
          },
          {
            $set: { category: newcategory },
          }
        ),
        InterviewQuestionGrouping.updateMany(
          {
            category: oldcategory,
            mode: { $in: ["Questions", "Typing Test"] },
          },
          { $set: { category: newcategory } }
        ),
        InterviewQuestionsOrder.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
      ]);
    }
    if (mode === "Verification/Administrative") {
      await Promise.all([

        VerificationMaster.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),


        InterviewQuestionGrouping.updateMany(
          {
            category: oldcategory,
            mode: { $in: ["Verification/Administrative"] },
          },
          { $set: { category: newcategory } }
        ),
        InterviewQuestionsOrder.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
      ]);
    }
    if (mode === "Exit Interview") {
      await Promise.all([
        ExitInterviewQuestionmaster.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        ExitInterviewTestmaster.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
      ]);
    } else {
      await Promise.all([
        InterviewTestMaster.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        OnlineTestQuestion.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        OnlineTestMaster.updateMany(
          { category: oldcategory },
          { $set: { category: newcategory } }
        ),
        InterviewQuestionGrouping.updateMany(
          { category: oldcategory, mode: "Online or Interview Test" },
          { $set: { category: newcategory } }
        ),
      ]);
    }

    return res.status(200).json({ updated: true, resulttraining });
  }
);
