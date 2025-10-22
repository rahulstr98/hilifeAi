const Interviewroundorder = require("../../../model/modules/interview/interviewroundorder");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const AssignInterviewer = require("../../../model/modules/interview/assigninterviewer");
const Addcandidate = require("../../../model/modules/recruitment/addcandidate");

// i have a collection named Addcandidate give me a aggregation pipeline to filter the candidate data, the filter conditions are finalstatus === "" or finalstatus is undefined and screencandidate === "Screened" and overallstatus !== "Applied" candidatestatus === "" or undefined , interviewrounds array length is greater than 0 and interviewrounds last object's roundanswerstatus !== "Rejected" 

//get All Interviewroundorder =>/api/interviewroundorders
exports.getAllInterviewroundorder = catchAsyncErrors(async (req, res, next) => {
  let interviewroundorders;
  try {
    interviewroundorders = await Interviewroundorder.find();
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
  if (!interviewroundorders) {
    return next(new ErrorHandler("Interviewroundorder not found!", 404));
  }
  return res.status(200).json({
    interviewroundorders,
  });
});

//create new Interviewroundorder => /api/Interviewroundorder/new
exports.addInterviewroundorder = catchAsyncErrors(async (req, res, next) => {
  let ainterviewroundorder = await Interviewroundorder.create(req.body);
  return res.status(200).json({
    message: "Successfully added!",
  });
});

// get Single Interviewroundorder => /api/Interviewroundorder/:id
exports.getSingleInterviewroundorder = catchAsyncErrors(
  async (req, res, next) => {
    const id = req.params.id;
    let sinterviewroundorder = await Interviewroundorder.findById(id);
    if (!sinterviewroundorder) {
      return next(new ErrorHandler("Interviewroundorder not found", 404));
    }
    return res.status(200).json({
      sinterviewroundorder,
    });
  }
);

//update Interviewroundorder by id => /api/Interviewroundorder/:id
exports.updateInterviewroundorder = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uinterviewroundorder = await Interviewroundorder.findByIdAndUpdate(
    id,
    req.body
  );
  if (!uinterviewroundorder) {
    return next(new ErrorHandler("Interviewroundorder not found", 404));
  }

  return res.status(200).json({ message: "Updated successfully" });
});

//delete Interviewroundorder by id => /api/Interviewroundorder/:id
exports.deleteInterviewroundorder = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let dinterviewroundorder = await Interviewroundorder.findByIdAndRemove(id);
  if (!dinterviewroundorder) {
    return next(new ErrorHandler("Interviewroundorder not found", 404));
  }

  return res.status(200).json({ message: "Deleted successfully" });
});

//overall delete round order  => /api/overalldelete/interviewroundorder
exports.overallDeleteInterviewRoundOrder = catchAsyncErrors(
  async (req, res, next) => {
    const { designation, round } = req.body;
    let assigninterviewer;

    assigninterviewer = await AssignInterviewer.countDocuments({
      round: { $elemMatch: { $in: round } },
      designation,
      type: "Interviewer",
    });

    if (assigninterviewer) {
      return next(
        new ErrorHandler(
          `This Data already used in Assign Interviewer Page`,
          404
        )
      );
    }

    return res.status(200).json({ mayidelete: true });
  }
);

//overall bulk delete round order  => /api/overallbulkdelete/interviewroundorder
exports.overallBulkDeleteInterviewRoundOrder = catchAsyncErrors(
  async (req, res, next) => {
    let roundorder, assigninterviewer, result, count;
    let id = req.body.id;
    try {
      roundorder = await Interviewroundorder.find();
      const answer = roundorder?.filter((data) =>
        id?.includes(data._id?.toString())
      );

      assigninterviewer = await AssignInterviewer.find();

      const unmatchedAssignInterviewer = answer
        .filter((answers) =>
          assigninterviewer.some(
            (sub) =>
              sub.type === "Interviewer" &&
              answers.designation === sub?.designation &&
              answers?.round?.some((data) => sub.round?.includes(data))
          )
        )
        ?.map((data) => data._id?.toString());

      const duplicateId = [...unmatchedAssignInterviewer];
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


//to get the candidates who all are currently in interviewround  => /api/overallbulkdelete/interviewroundorder
exports.candidatesHistory = catchAsyncErrors(
  async (req, res, next) => {
    try {
      console.log(req.body)
      //withoun round count
      // const pipeline = [
      //   {
      //     $lookup: {
      //       from: "jobopenings",
      //       let: { candidateJobOpeningId: "$jobopeningsid" },
      //       pipeline: [
      //         {
      //           $match: {
      //             $and: [
      //               { designation: req.body.designation },
      //               { status: "OnProgress" },
      //             ],
      //           },
      //         },
      //         {
      //           $project: {
      //             _id: 1,
      //             designation: 1,
      //             company: 1,
      //             branch: 1,
      //             floor: 1,
      //             area: 1,
      //           },
      //         },
      //       ],
      //       as: "matchedJobOpenings",
      //     },
      //   },
      //   {
      //     $unwind: "$matchedJobOpenings",
      //   },
      //   {
      //     $addFields: {
      //       jobOpeningIdString: { $toString: "$matchedJobOpenings._id" },
      //     },
      //   },
      //   {
      //     $match: {
      //       $and: [
      //         {
      //           $or: [
      //             { finalstatus: "" },
      //             { finalstatus: { $exists: false } },
      //           ],
      //         },
      //         { screencandidate: "Screened" },
      //         { overallstatus: { $ne: "Applied" } },
      //         {
      //           $or: [
      //             { candidatestatus: "" },
      //             { candidatestatus: { $exists: false } },
      //           ],
      //         },
      //         {
      //           $expr: {
      //             $gt: [{ $size: { $ifNull: ["$interviewrounds", []] } }, 0], // Ensure interviewrounds is an array
      //           },
      //         },
      //         {
      //           $expr: {
      //             $ne: [
      //               {
      //                 $arrayElemAt: [
      //                   { $ifNull: ["$interviewrounds", []] }, // Ensure interviewrounds is an array
      //                   -1,
      //                 ],
      //               },
      //               "Rejected", // Check last object's roundanswerstatus !== "Rejected"
      //             ],
      //           },
      //         },
      //         {
      //           $expr: {
      //             $eq: ["$jobopeningsid", "$jobOpeningIdString"],
      //           },
      //         },
      //       ],
      //     },
      //   }
      //   ,
      //   {
      //     $project: {
      //       _id: 1,
      //       name: 1,
      //       designation: 1,
      //       screencandidate: 1,
      //       overallstatus: 1,
      //       candidatestatus: 1,
      //       interviewrounds: 1,
      //       finalstatus: 1,
      //       jobopeningsid: 1,
      //       company: "$matchedJobOpenings.company",
      //       branch: "$matchedJobOpenings.branch",
      //       floor: "$matchedJobOpenings.floor",
      //       area: "$matchedJobOpenings.area",
      //     },
      //   },
      // ];

      // candidates by round

      // const pipeline = [
      //   {
      //     $lookup: {
      //       from: "jobopenings",
      //       let: { candidateJobOpeningId: "$jobopeningsid" },
      //       pipeline: [
      //         {
      //           $match: {
      //             $and: [
      //               { designation: req.body.designation },
      //               { status: "OnProgress" },
      //             ],
      //           },
      //         },
      //         {
      //           $project: {
      //             _id: 1,
      //             designation: 1,
      //             company: 1,
      //             branch: 1,
      //             floor: 1,
      //             area: 1,
      //           },
      //         },
      //       ],
      //       as: "matchedJobOpenings",
      //     },
      //   },
      //   {
      //     $unwind: "$matchedJobOpenings",
      //   },
      //   {
      //     $addFields: {
      //       jobOpeningIdString: { $toString: "$matchedJobOpenings._id" },
      //     },
      //   },
      //   {
      //     $match: {
      //       $and: [
      //         {
      //           $or: [
      //             { finalstatus: "" },
      //             { finalstatus: { $exists: false } },
      //           ],
      //         },
      //         {
      //           $or: [
      //             { roleback: false },
      //             { roleback: { $exists: false } },
      //           ],
      //         },
      //         { screencandidate: "Screened" },
      //         { overallstatus: { $ne: "Applied" } },
      //         {
      //           $or: [
      //             { candidatestatus: "" },
      //             { candidatestatus: { $exists: false } },
      //           ],
      //         },
      //         {
      //           $expr: {
      //             $gt: [{ $size: { $ifNull: ["$interviewrounds", []] } }, 0],
      //           },
      //         },
      //         {
      //           $expr: {
      //             $eq: ["$jobopeningsid", "$jobOpeningIdString"],
      //           },
      //         },
      //       ],
      //     },
      //   },
      //   {
      //     $facet: {
      //       allCandidates: [
      //         {
      //           $project: {
      //             _id: 1,
      //             role: 1,
      //             fullname: 1,
      //             email: 1,
      //             mobile: 1,
      //             jobopeningsid: 1,
      //             skill: 1,
      //             experience: 1,
      //             qualification: 1,
      //             screencandidate: 1,
      //             overallstatus: 1,
      //             candidatestatus: 1,
      //             interviewrounds: 1,
      //             company: "$matchedJobOpenings.company",
      //             branch: "$matchedJobOpenings.branch",
      //             floor: "$matchedJobOpenings.floor",
      //             area: "$matchedJobOpenings.area",
      //           },
      //         },
      //       ],
      //       candidatesByRound: [
      //         { $unwind: "$interviewrounds" },
      //         {
      //           $group: {
      //             _id: "$interviewrounds.roundname",
      //             candidates: {
      //               $push: {
      //                 _id: "$_id",
      //                 fullname: "$fullname",
      //                 email: "$email",
      //                 mobile: "$mobile",
      //                 skill: "$skill",
      //                 experience: "$experience",
      //                 qualification: "$qualification",
      //                 interviewround: "$interviewrounds",
      //               },
      //             },
      //           },
      //         },
      //         {
      //           $project: {
      //             roundname: "$_id",
      //             candidates: 1,
      //             _id: 0,
      //           },
      //         },
      //       ],
      //     },
      //   },
      // ];

      const pipeline = [
        {
          $lookup: {
            from: "jobopenings",
            let: { candidateJobOpeningId: "$jobopeningsid" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { designation: req.body.designation },
                    { status: "OnProgress" },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  designation: 1,
                  company: 1,
                  branch: 1,
                  floor: 1,
                  area: 1,
                },
              },
            ],
            as: "matchedJobOpenings",
          },
        },
        {
          $unwind: "$matchedJobOpenings",
        },
        {
          $addFields: {
            jobOpeningIdString: { $toString: "$matchedJobOpenings._id" },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { finalstatus: "" },
                  { finalstatus: "Hold" },
                  { finalstatus: { $exists: false } },
                ],
              },


              {
                $or: [
                  { roleback: false },
                  { roleback: { $exists: false } },
                ],
              },
              { screencandidate: "Screened" },
              { overallstatus: { $nin: ["Applied", "First No Response", "Second No Response", "No Response", "Not Interested", "Got Other Job"] } },
              {
                $or: [
                  { candidatestatus: "" },
                  { candidatestatus: { $exists: false } },
                ],
              },
              {
                $expr: {
                  $gt: [{ $size: { $ifNull: ["$interviewrounds", []] } }, 0], // Ensure interviewrounds is an array
                },
              },
              {
                $expr: {
                  $ne: [
                    {
                      $arrayElemAt: [
                        { $ifNull: ["$interviewrounds.roundanswerstatus", []] },
                        { $subtract: [{ $size: "$interviewrounds.roundanswerstatus" }, 1] } // Get the last element
                      ],
                    },
                    "Rejected", // Exclude if the last roundanswerstatus is "Rejected"
                  ],
                },
              },
              {
                $expr: {
                  $eq: ["$jobopeningsid", "$jobOpeningIdString"],
                },
              },
            ],
          },
        },
        {
          $facet: {
            candidates: [
              {
                $project: {
                  _id: 1,
                  role: 1,
                  prefix: 1,
                  firstname: 1,
                  lastname: 1,
                  fullname: 1,
                  email: 1,
                  mobile: 1,
                  whatsapp: 1,
                  adharnumber: 1,
                  jobopeningsid: 1,
                  dateofbirth: 1,
                  skill: 1,
                  city: 1,
                  experience: 1,
                  qualification: 1,
                  expectedsalary: 1,
                  educationdetails: 1,
                  joiningindays: 1,
                  noticeperiod: 1,
                  certification: 1,
                  gender: 1,
                  interviewrounds: 1,
                  screencandidate: 1,
                  username: 1,
                  password: 1,
                  overallstatus: 1,
                  roleback: 1,
                  rolebackto: 1,
                  status: 1,
                  candidatestatus: 1,
                  finalstatus: 1,
                  company: "$matchedJobOpenings.company",
                  branch: "$matchedJobOpenings.branch",
                  floor: "$matchedJobOpenings.floor",
                  area: "$matchedJobOpenings.area",
                },
              },
            ],
            roundCandidatesCount: [
              {
                $unwind: "$interviewrounds",
              },
              {
                $match: {
                  "interviewrounds.nextround": false,
                  $or: [
                    { "interviewrounds.rounduserstatus": { $exists: false } },
                    { "interviewrounds.rounduserstatus": "" },
                  ],
                  "interviewrounds.roundstatus": {
                    $in: [
                      "Interview Scheduled",
                      "On Progress",
                      "Hr Completed",
                      "Candidate Completed",
                      "Completed",
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$interviewrounds.roundname",
                  candidatecount: { $sum: 1 },
                },
              },
              {
                $match: {
                  _id: { $in: req.body.rounds },
                },
              },
              {
                $project: {
                  roundname: "$_id",
                  candidatecount: { $toString: "$candidatecount" },
                  _id: 0,
                },
              },
            ],
          },
        },
      ];

      let candidateHistory = await Addcandidate.aggregate(pipeline);
      return res.status(200).json({
        candidateHistory,
        totalcandidates: candidateHistory?.length > 0 ? candidateHistory[0]?.roundCandidatesCount?.reduce((acc, data) => acc + parseInt(data.candidatecount || "0"), 0) : 0,
      });
    } catch (err) {
      console.log(err)
      return next(new ErrorHandler("Error Getting Candidates History!", 404));
    }

  }
);