const Companydomain = require('../../model/modules/companydomain');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const User = require("../../model/login/auth");

exports.getOverallCompanydomain = catchAsyncErrors(async (req, res, next) => {
    let companydomainn;
    try {
        companydomainn = await Companydomain.find();
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
    if (!companydomainn) {
        return next(new ErrorHandler('companydomain not found!', 404));
    }
    return res.status(200).json({
        companydomainn
    });
})


// Create new assignedby => /api/Assignedby/new
exports.addCompanydomain = catchAsyncErrors(async (req, res, next) => {
    try {
        let aCompanydomain = await Companydomain.create(req.body);

        const assignedName = req.body.assignedname.replace(/\s/g, '').toLowerCase();

        let users = await User.find({ company: req.body.company });

        let updatePromises = users.map(async (user) => {
            const username = user.username.replace(/\s/g, '').toLowerCase();
            const newEmail = `${username}@${assignedName}`;

            if (user.companyemail) {
                if (!user.companyemail.includes(newEmail)) {
                    user.companyemail = `${user.companyemail},${newEmail}`;
                }
            } else {
                user.companyemail = newEmail;
            }

            return await user.save();
        });

        await Promise.all(updatePromises);

        return res.status(200).json({
            message: 'Successfully added and users updated!',
        });
    } catch (error) {
        return next(new ErrorHandler("Unable to add company domain or update users", 500));
    }
});

// get Single Assignedby => /api/Assignedby/:id
exports.getSingleCompanydomain = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let companydomainn = await Companydomain.findById(id);
    if (!companydomainn) {
        return next(new ErrorHandler('companydomain not found', 404));
    }
    return res.status(200).json({
        companydomainn
    })
})

//update Assignedby by id => /api/Assignedby/:id
exports.updateCompanydomain = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let companydomainn = await Companydomain.findByIdAndUpdate(id, req.body);
    if (!companydomainn) {
        return next(new ErrorHandler('companydomain not found', 404));
    }

    return res.status(200).json({ message: 'Updated successfully' });
})

//delete Assignedby by id => /api/Assignedby/:id
exports.deleteCompanydomain = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    let companydomainn = await Companydomain.findByIdAndRemove(id);
    if (!companydomainn) {
        return next(new ErrorHandler('companydomain not found', 404));
    }

    return res.status(200).json({ message: 'Deleted successfully' });
})

exports.getAllCompanydomain = catchAsyncErrors(async (req, res, next) => {
    let companydomainn;
    try {
        const { assignbranch } = req.body;

        let filterQuery = {};

        // Check if assignbranch is defined and not empty
        if (Array.isArray(assignbranch) && assignbranch.length > 0) {
            // Construct the filter query based on the assignbranch array
            const branchFilter = assignbranch.map((branchObj) => ({
                company: branchObj.company,
            }));

            // Use $or to filter incomes that match any of the company criteria
            filterQuery = { $or: branchFilter };
        }

        // Fetch the company domain data based on the filterQuery
        companydomainn = await Companydomain.find(filterQuery);
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }

    if (!companydomainn) {
        return next(new ErrorHandler("companydomain not found!", 404));
    }

    return res.status(200).json({
        companydomainn,
    });
});


// Check for all users matching the company and company email before delete/edit
exports.getAllCompanydomainUserCheck = catchAsyncErrors(async (req, res, next) => {
    try {

        let query = {
            company: req.body.checkcompany,
            companyemail: new RegExp(req.body.checkassignedname, 'i'),
        };

        const users = await User.find(query);

        if (users.length > 0) {
            return res.status(200).json({
                message: "Users found matching the criteria",
                users: users,
            });
        } else {

            return res.status(200).json({
                message: "No users found matching the criteria",
                users: [],
            });
        }
    } catch (err) {
        return next(new ErrorHandler("Records not found!", 500));
    }
});

exports.getOverAllEditComanydomainUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { oldname } = req.body;

        const users = await User.find({ company: oldname }, { _id: 1, username: 1, companyemail: 1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (err) {
        return next(new ErrorHandler("Records not found!", 404));
    }
});
