const CategoryMaster = require('../../../model/modules/support/categorymaster');
const Raiseproblem = require('../../../model/modules/support/raiseproblem');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');

// get all categorymaster => /api/categorymaster

exports.getAllCategoryMaster = catchAsyncErrors(async (req, res, next) => {
    let categorymaster
    try {
        categorymaster = await CategoryMaster.find()
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!categorymaster) {
        return next(new ErrorHandler('category not found', 404));
    }
    // Add serial numbers to the doccategory
    const allcategorymaster = categorymaster.map((data, index) => ({
        serialNumber: index + 1,
        ...data.toObject()
    }));

    return res.status(200).json({
        categorymaster: allcategorymaster
    });

})


exports.addCategoryMaster = catchAsyncErrors(async (req, res, next) => {
    await CategoryMaster.create(req.body);
    return res.status(200).json({
        message: 'Successfully added'
    })
})

exports.getSingleCategoryMaster = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let scategorymaster = await CategoryMaster.findById(id);
    if (!scategorymaster) {
        return next(new ErrorHandler('Data not found'));

    }
    return res.status(200).json({
        scategorymaster
    });

});


exports.updateCategoryMaster = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;

    let ucategorymaster = await CategoryMaster.findByIdAndUpdate(id, req.body);

    if (!ucategorymaster) {
        return next(new ErrorHandler('Data not found'));
    }

    const prevCatSubCatObject = req.body.prevcatsubcat;

    const updatedCategory = prevCatSubCatObject.categoryname;
    // const subcategoryArray = prevCatSubCatObject.subcategoryname;


    const raiseproblemsToUpdate = await Raiseproblem.find({
        category: updatedCategory,
    });

    for (const raiseproblem of raiseproblemsToUpdate) {
        raiseproblem.category = req.body.categoryname;
        // raiseproblem.subcategory = req.body.subcategoryname[subcatIndexChange];
        await raiseproblem.save();
    }

    return res.status(200).json({
        message: 'Update Successfully',
        ucategorymaster
    });
});



//delete ujobopening by id => /api/categorymaster/:id
exports.deleteCategoryMaster = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let dcategorymaster = await CategoryMaster.findByIdAndRemove(id);
    if (!dcategorymaster) {
        return next(new ErrorHandler('Data not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.getOverAllEditDocuments = catchAsyncErrors(async (req, res, next) => {
    let documentsall, query, documents, docindex
    try {

        documentsall = await Document.find(query, {});

        documents = documentsall.filter(item => item.categoryname == req.body.oldname && req.body.oldnamesub.includes(item.subcategoryname))

        docindex = documentsall.findIndex(item => req.body.oldnamesub.includes(item.subcategoryname));

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }


    return res.status(200).json({
        count: documents.length,

        documents, docindex
    });
});

exports.CategoryMasterOverallCategory = catchAsyncErrors(async (req, res, next) => {
    let visitorType;
    try {

        visitorType = await Raiseproblem.find({
            category: req.body.oldname,
            subcategory: { $in: req.body.oldpurpose }
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    return res.status(200).json({
        count: visitorType?.length,
        visitorType,

    });
});


exports.CategoryMasterOverallCategoryBulkdelete = catchAsyncErrors(
    async (req, res, next) => {
        let managety,
            raiseproblem,
            result,
            count;
        let id = req.body.id;
        try {
            managety = await CategoryMaster.find();

            const answerBothtypegroup = managety?.filter((data) =>
                id?.includes(data._id?.toString())
            );

            [
                raiseproblem,
            ] = await Promise.all([
                Raiseproblem.find(),
            ]);

            const visitorType = answerBothtypegroup
                .filter((answers) =>
                    raiseproblem.some(
                        (sub) =>
                            sub.category === answers.categoryname &&
                            answers.subcategoryname?.includes(sub.subcategory)
                    )
                )
                ?.map((data) => data._id?.toString());


            const duplicateId = [
                ...visitorType,
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

