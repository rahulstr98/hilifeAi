const Assignedby = require('../../../model/modules/othertask/assignedby');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Manageothertask = require('../../../model/modules/othertask/othertask');

//get All Source =>/api/assignedby
exports.getAllAssignedBy = catchAsyncErrors(async (req, res, next) => {
    let assignedby;
    try {
        assignedby = await Assignedby.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!assignedby) {
        return next(new ErrorHandler('Assignedby not found!', 404));
    }
    return res.status(200).json({
        assignedby
    });
})


//create new assignedby => /api/Assignedby/new
exports.addAssignedby = catchAsyncErrors(async (req, res, next) => {
    // let checkmain = await Addexists.findOne({ name: req.body.name });
    // if (checkmain) {
    //     return next(new ErrorHandler('Name already exist!', 400));
    // }

    let aAssignedby = await Assignedby.create(req.body);
    return res.status(200).json({
        message: 'Successfully added!'
    });
})

// get Single Assignedby => /api/Assignedby/:id
exports.getSingleAssignedby = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let assignedby = await Assignedby.findById(id);
    if (!assignedby) {
        return next(new ErrorHandler('Assignedby not found', 404));
    }
    return res.status(200).json({
        assignedby
    })
})

//update Assignedby by id => /api/Assignedby/:id
exports.updateAssignedby = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let assignedby = await Assignedby.findByIdAndUpdate(id, req.body);
    if (!assignedby) {
        return next(new ErrorHandler('Assigned not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Assignedby by id => /api/Assignedby/:id
exports.deleteAssignedby = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let assignedby = await Assignedby.findByIdAndRemove(id);
    if (!assignedby) {
        return next(new ErrorHandler('Assignedby not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})
exports.getOverallAssignedBySort = catchAsyncErrors(async (req, res, next) => {
    let totalProjects, result, totalPages, currentPage;

    const { page, pageSize } = req.body;
    try {

        totalProjects = await Assignedby.countDocuments();

        result = await Assignedby.find()
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize));

    } catch (err) {
        return next(new ErrorHandler("Data not found", 404));
    }

    return res.status(200).json({
        totalProjects,
        result,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / pageSize),
    });
});

exports.getOverallAssignedByupdate = catchAsyncErrors(async (req, res, next) => {
    let manageothertask;
    try {
        manageothertask = await Manageothertask.find({ assignedby: req.body.oldname });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        count: manageothertask?.length,
        manageothertask,
    });
});

exports.overallBulkDeleteAssignedby = catchAsyncErrors(
    async (req, res, next) => {
        let answerallot,
            result,
            count;
        let id = req.body.id;
        try {
            interviewcategory = await Assignedby.find();

            const answerBoth = interviewcategory?.filter((data) =>
                id?.includes(data._id?.toString())
            );

            [
                answerallot,
            ] = await Promise.all([
                Manageothertask.find(),
            ]);

            const unmatchedAnswerAllot = answerBoth
                .filter((answers) =>
                    answerallot.some(
                        (sub) =>
                            sub.assignedby === answers.assignedname
                    )
                )
                ?.map((data) => data._id?.toString());

            const duplicateId = [
                ...unmatchedAnswerAllot,
            ];
            result = id?.filter((data) => !duplicateId?.includes(data));
            count = id?.filter((data) => !duplicateId?.includes(data))?.length;
        } catch (err) {
            return next(new ErrorHandler("Data not found", 404));
        }

        return res.status(200).json({
            count: count,
            result,
        });
    }
);