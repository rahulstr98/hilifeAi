const Visitorinformationmaster = require('../../../model/modules/interactors/visitorinformationmaster');
const Visitors = require('../../../model/modules/interactors/visitor');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const Addcandidate = require('../../../model/modules/recruitment/addcandidate');
const User = require('../../../model/login/auth');
const faceapi = require('face-api.js');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
// get All visitors => /api/allvisitors

exports.getExistingVisitorInformation = catchAsyncErrors(async (req, res, next) => {
  try {
    const { assignbranch, visitornameexists } = req.body;

    const visitornameCondition = visitornameexists
      ? { visitorname: { $regex: `^${visitornameexists}`, $options: 'i' } } // Match from start
      : {};

    const branchFilter = Array.isArray(assignbranch)
      ? assignbranch.map((branchObj) => ({
          branch: branchObj.branch,
          company: branchObj.company,
          unit: branchObj.unit,
          interactorstatus: { $in: ['visitorinformation'] },
        }))
      : [];

    const visitorQuery = branchFilter?.length > 0 ? { $or: branchFilter.map((filter) => ({ ...filter, ...visitornameCondition })) } : visitornameCondition;

    const visitorsinformation = await Visitorinformationmaster.aggregate([{ $match: visitorQuery }, { $addFields: { modelName: 'Visitorinformation' } }]);

    const visitors = await Visitors.aggregate([{ $match: visitorQuery }, { $addFields: { modelName: 'Visitor' } }]);

    const users = await User.aggregate([
      {
        $match: visitornameexists ? { companyname: { $regex: `^${visitornameexists}`, $options: 'i' } } : {},
      },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          companyname: 1,
          companyemail: 1,
          contactpersonal: 1,
        },
      },
      { $addFields: { modelName: 'Employee' } },
    ]);

    const candidates = await Addcandidate.aggregate([
      {
        $match: { fullname: { $regex: visitornameexists, $options: 'i' } },
      },
      {
        $project: {
          fullname: 1,
          mobile: 1,
          email: 1,
          uploadedimage: 1,
          uploadedimagename: 1,
          interviewrounds: 1,
          overallstatus: 1,
          jobopeningsid: 1,
          finalstatus: 1,
        },
      },
      {
        $addFields: {
          modelName: 'Candidate',
          uploadedimage: {
            $cond: {
              if: { $isArray: '$uploadedimage' },
              then: {
                $map: {
                  input: '$uploadedimage',
                  as: 'img',
                  in: {
                    data: '$$img',
                    name: '$uploadedimagename',
                    preview: '$$img',
                    type: '$$img',
                    remark: '',
                  },
                },
              },
              else: {
                $cond: {
                  if: { $gt: [{ $type: '$uploadedimage' }, 'missing'] },
                  then: [
                    {
                      data: '$uploadedimage',
                      name: '$uploadedimagename',
                      preview: '$uploadedimage',
                      type: '$uploadedimage',
                      remark: '',
                    },
                  ],
                  else: [], // Ensures `uploadedimage` is always an array
                },
              },
            },
          },
          // Ensure interviewrounds is an array before using $size
          interviewrounds: {
            $cond: {
              if: { $gt: [{ $type: '$interviewrounds' }, 'missing'] },
              then: { $ifNull: ['$interviewrounds', []] },
              else: [],
            },
          },
          lastInterviewRound: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$interviewrounds', []] } }, 0] }, // Safe check for array
              then: {
                roundstatus: { $arrayElemAt: ['$interviewrounds.roundstatus', -1] },
                roundname: { $arrayElemAt: ['$interviewrounds.roundname', -1] },
              },
              else: null,
            },
          },
        },
      },
    ]);

    const allVisitors = [...visitorsinformation, ...visitors, ...users, ...candidates];

    return res.status(200).json({
      visitors: allVisitors?.length > 0 ? allVisitors : [], // Return empty array instead of error
    });
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
});

// visitor branch forward list
exports.visitorInformationBranchforwardlist = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator = 'AND', todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Early return if no branches are assigned
    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }['visitorinformation']

    // Base query with interactorstatus condition
    let query = {
      interactorstatus: { $in:['visitorinformation'] },
    };

    // Date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Helper function to add array filters
    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) {
        query[key] = { $in: value };
      } else if (value) {
        query[key] = value;
      }
    };

    // Apply filters
    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // // Process advanced filters
    let conditions = [];
    if (Array.isArray(allFilters)) {
      conditions = allFilters
        .map(({ column, condition, value }) => {
          if (column && condition && (value || ['Blank', 'Not Blank'].includes(condition))) {
            return createFilterCondition(column, condition, value);
          }
          return null;
        })
        .filter(Boolean);
    }

    if (conditions?.length > 0) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // Apply search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [
                    { company: new RegExp(term, 'i') },
                    { branch: new RegExp(term, 'i') },
                    { unit: new RegExp(term, 'i') },
                    { date: new RegExp(term, 'i') },
                    { visitorid: new RegExp(term, 'i') },
                    { visitorname: new RegExp(term, 'i') },
                    { visitortype: new RegExp(term, 'i') },
                    { visitormode: new RegExp(term, 'i') },
                    { visitorpurpose: new RegExp(term, 'i') },
                    { visitorcontactnumber: new RegExp(term, 'i') },
                    { intime: new RegExp(term, 'i') },
                    { outtime: new RegExp(term, 'i') },
                  ],
                };
              } catch (err) {
                // Handle invalid regular expression by skipping this search term
                console.error('Invalid regular expression:', term, err);
                return null; // Skip this term
              }
            })
            .filter(Boolean); // Remove null values from the conditions

          // Combine with existing query
          if (Object.keys(query)?.length > 0 || conditions?.length > 0) {
            query = {
              $and: [...(Object.keys(query)?.length > 0 ? [query] : []), ...(regexConditions?.length > 0 ? [regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions }] : [])].filter(Boolean),
            };
          } else {
            query = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };
          }
        }
      }
    } catch (err) {
      // Return a response with an empty result if there's an error
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Branch filter - must be applied last as it uses $or
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    if (query.$or) {
      // If there's already an $or condition, we need to nest it properly
      query = {
        $and: [{ $or: branchConditions }, query],
      };
    } else {
      query.$or = branchConditions;
    }

    // Aggregate Query with Pagination & Count
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (page - 1) * pageSize },
            { $limit: parseInt(pageSize) },
            {
              $project: {
                company: 1,
                category: 1,
                branch: 1,
                unit: 1,
                date: 1,
                visitorid: 1,
                prefix: 1,
                visitorname: 1,
                visitoremail: 1,
                visitortype: 1,
                visitormode: 1,
                visitorpurpose: 1,
                visitorcontactnumber: 1,
                intime: 1,
                outtime: 1,
                interactorstatus: 1,
                isBtnEnable: 1,
                addvisitorin: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
                enquirystatusforinteractorstatus: 1,
                followuparray: {
                  $let: {
                    vars: { lastFollowUp: { $arrayElemAt: ['$followuparray', -1] } },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$followuparray' }, 0] },
                        then: {
                          visitortype: '$$lastFollowUp.visitortype',
                          visitormode: '$$lastFollowUp.visitormode',
                          visitorpurpose: '$$lastFollowUp.visitorpurpose',
                          intime: '$$lastFollowUp.intime',
                          outtime: '$$lastFollowUp.outtime',
                        },
                        else: null,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProjects / parseInt(pageSize)),
    });
  } catch (err) {
    console.error('Error in skippedVisitors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    const { assignbranch } = req.body;

    if (assignbranch && assignbranch?.length > 0) {
      // Construct the filter query based on the assignbranch array
      const branchFilter = assignbranch.map((branchObj) => ({
        branch: branchObj.branch,
        company: branchObj.company,
        unit: branchObj.unit,
      }));

      // Use $or to filter incomes that match any of the branch, company, and unit combinations
      const filterQuery = { $or: branchFilter };
      visitors = await Visitorinformationmaster.find(filterQuery);
    } else if (Array.isArray(assignbranch) && assignbranch?.length === 0) {
      visitors = [];
    } else if (!assignbranch) {
      visitors = await Visitorinformationmaster.find({});
    }
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!visitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({
    // count: products?.length,
    visitors,
  });
});

exports.getAllVisitorInformationsRegister = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitorinformationmaster.find();
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!visitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    // count: products?.length,
    visitors,
  });
});

//visitor scan
exports.getAllVisitorInformationsCheckout = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitorinformationmaster.find({ checkout: false, company: req.body.company, branch: req.body.branch }, { visitorname: 1, date: 1, intime: 1 });
    if (!visitors) {
      return next(new ErrorHandler('Data not found!', 404));
    }
    return res.status(200).json({
      // count: products?.length,
      visitors,
    });
  } catch (err) {
    return next(new ErrorHandler('Data not found', 404));
  }
});

exports.getAllVisitorInformationsFilteredId = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitorinformationmaster.find({}, { _id: 0, visitorid: 1 });
    if (!visitors) {
      return next(new ErrorHandler('Data not found!', 404));
    }
    return res.status(200).json({
      // count: products?.length,
      visitors,
    });
  } catch (err) {
    return next(new ErrorHandler('Data not found', 404));
  }
});

exports.getAllVisitorInformationUpdateId = catchAsyncErrors(async (req, res, next) => {
  const { outerId, outtime } = req.body;

  // Update the nested array element using array filters
  let user = await Visitorinformationmaster.findOneAndUpdate(
    { _id: outerId },
    {
      $set: {
        outtime: outtime,
        checkout: true,
        'followuparray.$[].outtime': outtime,
      },
    }, // Set the matched array element to updateData
    { new: true } // Return the updated document
  );

  if (!user) {
    return next(new ErrorHandler('Data not found!', 404));
  }

  return res.status(200).json({ message: 'Updated successfully' });
});

exports.getLastIndexVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  let visitor;
  try {
    visitor = await Visitorinformationmaster.findOne().sort({ _id: -1 });
    if (!visitor) {
      return res.status(200).json({
        visitor: {},
      });
    }
    return res.status(200).json({
      visitor,
    });
  } catch (err) {
    return next(new ErrorHandler('Record not found!', 500));
  }
});

exports.addVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  try {
    let visitorFiles = [];
    let requestFiles = [];
    // Handle first upload button files (e.g., invoices)

    if (req.files['visitordocument']) {
      visitorFiles = req.files['visitordocument'].map((file) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
      }));
    }

    if (req.files['requestdocument']) {
      const remarks = req.body.remarks || []; // Get remarks array from the request body

      requestFiles = req.files['requestdocument'].map((file, index) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
        remark: remarks[index] || '', // Assign the corresponding remark (fallback to empty string)
      }));
    }

    // Parse JSON data from req.body.jsonData
    let otherJsonData = {};
    if (req.body.jsonData) {
      try {
        otherJsonData = JSON.parse(req.body.jsonData);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON format', error });
      }
    }

    // Create expense entry with file data
    let newVisitor = await Visitorinformationmaster.create({
      ...otherJsonData, // Include other request data
      visitordocument: otherJsonData.visitorExistiongDocument?.length > 0 ? otherJsonData.visitorExistiongDocument : visitorFiles,
      requestdocument: otherJsonData.visitorExistiongRequestDocument?.length > 0 ? otherJsonData.visitorExistiongRequestDocument : requestFiles,
      followuparray: otherJsonData.followuparray?.map((followup) => ({
        ...followup,
        visitordocument: otherJsonData.visitorExistiongDocument?.length > 0 ? otherJsonData.visitorExistiongDocument : visitorFiles,
        requestdocument: otherJsonData.visitorExistiongRequestDocument?.length > 0 ? otherJsonData.visitorExistiongRequestDocument : requestFiles,
      })),
    });

    return res.status(200).json({
      message: 'Successfully added!',
      // otherpayments: newVisitor,
      newVisitor,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error adding Visitor', err });
  }
});

// get Single interactortype => /api/visitors/:id
exports.getSingleVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let svisitors = await Visitorinformationmaster.findById(id);

  if (!svisitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    svisitors,
  });
});

// update Interactor Type by id => /api/visitors/:id
exports.updateVisitorInformationsForStatus = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uvisitors = await Visitorinformationmaster.findByIdAndUpdate(id, req.body);
  if (!uvisitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({ message: 'Updated successfully' });
});

exports.updateVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid visitor ID' });
    }

    // Handle file uploads
    let visitorFiles = [];
    let requestFiles = [];

    if (req.files?.['visitordocument']) {
      visitorFiles = req.files['visitordocument'].map((file) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
      }));
    }

    if (req.files && req.files['requestdocument']) {
      const remarks = req.body.remarks || [];

      requestFiles = req.files['requestdocument'].map((file, index) => ({
        name: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        filesize: file.size,
        remark: remarks[index] || '',
      }));
    }

    // Handle file deletions and renames
    let deletedBillFiles = [];
    let deletedRequestdocFiles = [];
    let fileUpdatePromises = [];

    if (req.body.deletedvisitorFiles) {
      try {
        deletedBillFiles = JSON.parse(req.body.deletedvisitorFiles);

        for (const file of deletedBillFiles) {
          const oldFilePath = path.join(__dirname, '../../../visitorModule', file.filename);
          const newFilename = `${uuidv4()}.pdf`;
          const newFilePath = path.join(__dirname, '../../../visitorModule', newFilename);

          const renamePromise = new Promise((resolve) => {
            fs.access(oldFilePath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.rename(oldFilePath, newFilePath, (renameErr) => {
                  if (renameErr) {
                    console.error(`Failed to rename file: ${oldFilePath}`, renameErr);
                    resolve(null);
                  } else {
                    console.log(`File renamed: ${oldFilePath} -> ${newFilename}`);
                    resolve({
                      oldFilename: file.filename,
                      newFilename,
                      field: 'visitordocument',
                    });
                  }
                });
              } else {
                console.error(`File not found: ${oldFilePath}`);
                resolve(null);
              }
            });
          });
          fileUpdatePromises.push(renamePromise);
        }
      } catch (error) {
        console.error('Error processing deleted visitor files:', error);
        return res.status(400).json({
          message: 'Invalid deletedvisitorFiles format',
          error: error.message,
        });
      }
    }

    if (req.body.deletedrequestdocumentFiles) {
      try {
        deletedRequestdocFiles = JSON.parse(req.body.deletedrequestdocumentFiles);

        for (const file of deletedRequestdocFiles) {
          const oldFilePath = path.join(__dirname, '../../../visitorModule', file.filename);
          const newFilename = `${uuidv4()}.pdf`;
          const newFilePath = path.join(__dirname, '../../../visitorModule', newFilename);

          const renamePromise = new Promise((resolve) => {
            fs.access(oldFilePath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.rename(oldFilePath, newFilePath, (renameErr) => {
                  if (renameErr) {
                    console.error(`Failed to rename file: ${oldFilePath}`, renameErr);
                    resolve(null);
                  } else {
                    console.log(`File renamed: ${oldFilePath} -> ${newFilename}`);
                    resolve({
                      oldFilename: file.filename,
                      newFilename,
                      field: 'requestdocument',
                    });
                  }
                });
              } else {
                console.error(`File not found: ${oldFilePath}`);
                resolve(null);
              }
            });
          });
          fileUpdatePromises.push(renamePromise);
        }
      } catch (error) {
        console.error('Error processing deleted request files:', error);
        return res.status(400).json({
          message: 'Invalid deletedrequestdocumentFiles format',
          error: error.message,
        });
      }
    }

    // Wait for all file operations to complete
    const fileUpdates = await Promise.all(fileUpdatePromises);
    const validUpdates = fileUpdates.filter((update) => update !== null);

    // Handle JSON data
    let otherJsonData = {};
    if (req.body.jsonData) {
      try {
        otherJsonData = JSON.parse(req.body.jsonData);
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        return res.status(400).json({
          message: 'Invalid JSON format',
          error: error.message,
        });
      }
    }

    // Get current visitor data
    const suvisitors = await Visitorinformationmaster.findById(id);
    if (!suvisitors) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    // Prepare files to delete
    const deletedFilesBase64Bills = suvisitors.visitordocument?.filter((data) => !data?.filename) || [];
    const deletedRequestDocBase64Bills = suvisitors.requestdocument?.filter((data) => !data?.filename) || [];

    const finalDelete = [...deletedFilesBase64Bills, ...deletedBillFiles];
    const requestDocDelete = [...deletedRequestDocBase64Bills, ...deletedRequestdocFiles];

    try {
      // Delete files from database
      if (finalDelete?.length > 0 || requestDocDelete?.length > 0) {
        const updateObj = {};

        if (finalDelete?.length > 0) {
          updateObj.$pull = {
            visitordocument: {
              _id: {
                $in: finalDelete.map((f) => (f._id ? new mongoose.Types.ObjectId(f._id) : null)).filter(Boolean),
              },
            },
          };
        }

        if (requestDocDelete?.length > 0) {
          updateObj.$pull = updateObj.$pull || {};
          updateObj.$pull.requestdocument = {
            _id: {
              $in: requestDocDelete.map((f) => (f._id ? new mongoose.Types.ObjectId(f._id) : null)).filter(Boolean),
            },
          };
        }

        await Visitorinformationmaster.findByIdAndUpdate(id, updateObj);
      }

      if (visitorFiles?.length > 0 || requestFiles?.length > 0) {
        const updateObj = {};
        const lastIndex = otherJsonData?.followuparray ? otherJsonData.followuparray?.length - 1 : -1;
        // const lastIndexobject = otherJsonData?.followuparray[otherJsonData?.followuparray?.length - 2] || otherJsonData?.followuparray[otherJsonData?.followuparray?.length - 1];

        let lastIndexobject = null;
        if (otherJsonData?.followuparray?.length >= 2) {
          lastIndexobject = otherJsonData.followuparray[otherJsonData.followuparray.length - 2];
        } else if (otherJsonData?.followuparray?.length === 1) {
          lastIndexobject = otherJsonData.followuparray[0];
        } else {
          lastIndexobject = null;
        }

        // 1. Push new files to root-level arrays (still using MongoDB operators)
        if (visitorFiles?.length > 0) {
          updateObj.$push = {
            ...(updateObj.$push || {}),
            visitordocument: { $each: visitorFiles },
          };
        }

        if (requestFiles?.length > 0) {
          updateObj.$push = {
            ...(updateObj.$push || {}),
            requestdocument: { $each: requestFiles },
          };
        }

        // 2. DIRECTLY update the last object in followuparray
        if (lastIndex >= 0) {
          // Ensure the followuparray exists in otherJsonData
          if (!otherJsonData.followuparray) {
            otherJsonData.followuparray = [];
          }

          // Ensure the last followup object exists
          if (!otherJsonData.followuparray[lastIndex]) {
            otherJsonData.followuparray[lastIndex] = {};
          }

          // Initialize arrays if they don't exist
          if (!otherJsonData.followuparray[lastIndex].visitordocument) {
            otherJsonData.followuparray[lastIndex].visitordocument = [];
          }
          if (!otherJsonData.followuparray[lastIndex].requestdocument) {
            otherJsonData.followuparray[lastIndex].requestdocument = [];
          }

          if (visitorFiles?.length > 0 || requestFiles?.length > 0 || otherJsonData.followuparray[lastIndex]?.visitordocument?.length > 0) {
            // Ensure the array exists
            if (!otherJsonData.followuparray[lastIndex].visitordocument) {
              otherJsonData.followuparray[lastIndex].visitordocument = [];
            }

            const visitor = await Visitorinformationmaster.findById(id);

            if (!visitor) {
              throw new Error('Visitor not found');
            }

            // Create copies of documents without _id
            const visitorDocsWithoutIds = visitor.visitordocument.map((doc) => {
              const plainDoc = doc.toObject ? doc.toObject() : doc;
              const { _id, ...rest } = plainDoc;
              return rest;
            });

            // Use visitorFiles if available, otherwise use existing files
            const filesToAdd = visitorFiles?.length > 0 ? visitorFiles : visitorDocsWithoutIds;

            // Prepend the files
            otherJsonData.followuparray[lastIndex].visitordocument.unshift(...filesToAdd);
          }

          // Same logic for requestFiles
          if (requestFiles?.length > 0 || visitorFiles?.length > 0 || otherJsonData.followuparray[lastIndex]?.requestdocument?.length > 0) {
            if (!otherJsonData.followuparray[lastIndex].requestdocument) {
              otherJsonData.followuparray[lastIndex].requestdocument = [];
            }

            const visitor = await Visitorinformationmaster.findById(id);

            if (!visitor) {
              throw new Error('Visitor not found');
            }

            const requestDocsWithoutIds = visitor.requestdocument.map((doc) => {
              const plainDoc = doc.toObject ? doc.toObject() : doc;
              const { _id, ...rest } = plainDoc;
              return rest;
            });

            const filesToAdd = requestFiles?.length > 0 ? requestFiles : requestDocsWithoutIds;

            otherJsonData.followuparray[lastIndex].requestdocument.unshift(...filesToAdd);
          }
        } else if (visitorFiles?.length > 0 || requestFiles?.length > 0) {
          // If no followup exists but we have files, create a new followup entry
          otherJsonData.followuparray = otherJsonData.followuparray || [];
          otherJsonData.followuparray.push({
            visitordocument: visitorFiles,
            requestdocument: requestFiles,
            // Include other required followup fields here
            followupdate: new Date().toISOString(),
          });
        }

        // 3. Combine all updates (both direct modifications and MongoDB operators)
        const finalUpdate = {
          ...updateObj,
          $set: {
            ...(otherJsonData || {}),
            updatedAt: new Date(),
          },
        };

        // 4. Execute the update
        const result = await Visitorinformationmaster.findByIdAndUpdate(id, finalUpdate, { new: true });

        if (!result) {
          throw new Error('Update failed: Document not found.');
        }
      } else {
        // Case 2: When no new files - update last followup with existing documents
        const visitor = await Visitorinformationmaster.findById(id);

        if (!visitor) {
          throw new Error('Visitor not found');
        }

        // Create copies of documents without _id
        const visitorDocsWithoutIds = visitor.visitordocument.map((doc) => {
          const plainDoc = doc.toObject ? doc.toObject() : doc;
          const { _id, ...rest } = plainDoc;
          return rest;
        });

        const requestDocsWithoutIds = visitor.requestdocument.map((doc) => {
          const plainDoc = doc.toObject ? doc.toObject() : doc;
          const { _id, ...rest } = plainDoc;
          return rest;
        });

        if (otherJsonData.followuparray?.length > 0) {
          // Modify the otherJsonData's followuparray (last entry)
          const lastIndex = otherJsonData.followuparray?.length - 1;
          otherJsonData.followuparray[lastIndex].visitordocument = visitorDocsWithoutIds;
          otherJsonData.followuparray[lastIndex].requestdocument = requestDocsWithoutIds;
        }
        // Now update the entire document with the modified otherJsonData
        await Visitorinformationmaster.findByIdAndUpdate(id, { $set: otherJsonData });
      }

      if (Object.keys(otherJsonData)?.length > 0 || validUpdates?.length > 0) {
        // First update the JSON data
        if (Object.keys(otherJsonData)?.length > 0) {
          await Visitorinformationmaster.findByIdAndUpdate(id, { $set: otherJsonData });
        }
        const bulkOps = validUpdates.map((update) => ({
          updateMany: {
            filter: { [`followuparray.${update.field}.filename`]: update.oldFilename },
            update: {
              $set: { [`followuparray.$[outer].${update.field}.$[inner].filename`]: update.newFilename },
            },
            arrayFilters: [{ [`outer.${update.field}.filename`]: update.oldFilename }, { 'inner.filename': update.oldFilename }],
          },
        }));

        if (bulkOps?.length > 0) {
          await Visitorinformationmaster.bulkWrite(bulkOps);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Visitor updated successfully',
      });
    } catch (error) {
      console.error('Update operation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to perform update operations',
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Error in updateVisitors:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

//patching the visitors
exports.updatePatchVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uvisitors = await Visitorinformationmaster.findByIdAndUpdate(id, req.body);
  if (!uvisitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({ message: 'Updated successfully' });
});

// delete interactor type by id => /api/visitors/:id
exports.deleteVisitorInformations = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  let dvisitors = await Visitorinformationmaster.findByIdAndRemove(id);

  if (!dvisitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({ message: 'Deleted successfully' });
});

exports.duplicateCandidateFaceDetectorVisitorInformationForInterview = catchAsyncErrors(async (req, res, next) => {
  try {
    const { faceDescriptor, id } = req.body;

    // Ensure faceDescriptor is an array of numbers
    if (!Array.isArray(faceDescriptor) || !faceDescriptor.every((num) => typeof num === 'number')) {
      throw new Error('Invalid face descriptor format.');
    }

    // Fetch all user face descriptors from MongoDB
    const query = id ? { _id: { $ne: id } } : {};

    const [allcandidates, allUsers, visitorcheck] = await Promise.all([
      Addcandidate.aggregate([
        { $match: query },
        {
          $project: {
            faceDescriptor: 1,
            'experiencedetails.company': 1,
            fullname: 1,
            email: 1,
            mobile: 1,
            //uploadedimage: 1,
            uploadedimagename: 1,
            interviewrounds: 1,
            overallstatus: 1,
            jobopeningsid: 1,
            finalstatus: 1,
          },
        },
        {
          $addFields: {
            modelName: 'Candidate',
            uploadedimage: {
              $cond: {
                if: { $isArray: '$uploadedimage' }, // Check if uploadedimage is an array
                then: {
                  $map: {
                    input: '$uploadedimage',
                    as: 'img',
                    in: {
                      data: '$$img',
                      name: '$uploadedimagename',
                      preview: '$$img',
                      type: '$$img',
                      remark: '',
                    },
                  },
                },
                else: [
                  {
                    data: '$uploadedimage',
                    name: '$uploadedimagename',
                    preview: '$uploadedimage',
                    type: '$uploadedimage',
                    remark: '',
                  },
                ],
              },
            },
            lastInterviewRound: {
              $cond: {
                if: { $gt: [{ $size: { $ifNull: ['$interviewrounds', []] } }, 0] }, // Ensure interviewrounds is an array
                then: {
                  roundstatus: { $arrayElemAt: ['$interviewrounds.roundstatus', -1] }, // Get last roundstatus
                  roundname: { $arrayElemAt: ['$interviewrounds.roundname', -1] }, // Get last roundname
                },
                else: null, // If empty, return null
              },
            },
          },
        },
      ]),

      User.aggregate([
        { $match: query },
        {
          $project: {
            faceDescriptor: 1,
            company: 1,
            branch: 1,
            unit: 1,
            companyname: 1,
            email: 1,
            mobile: '$contactpersonal',
          },
        },
        { $addFields: { modelName: 'Employee' } },
      ]),
      Visitorinformationmaster.aggregate([{ $match: query }, { $addFields: { modelName: 'Visitor' } }]),
    ]);

    let authenticated = false;
    const matchedData = [];
    const allData = [...allcandidates, ...allUsers, ...visitorcheck];

    // Compare face descriptors
    for (const data of allData) {
      const storedDescriptor = data?.faceDescriptor;

      if (!Array.isArray(storedDescriptor) || storedDescriptor?.length !== faceDescriptor?.length) {
        continue; // Skip mismatched descriptors
      }

      const distance = faceapi.euclideanDistance(faceDescriptor, storedDescriptor);

      if (distance < 0.4) {
        authenticated = true;
        matchedData.push({
          ...data,
          distance,
        });
      }
    }

    return res.status(200).json({ matchfound: authenticated, matchedData });
  } catch (err) {
    console.error('Error:', err);
    return next(new ErrorHandler('Records not found!', 404));
  }
});

exports.skippedBranchVisitorInformations = async (req, res) => {
  try {
    const { assignbranch, fromdate, todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    let query = {
      branchforwardlog: { $ne: [] },
      company: { $in: company },
      branch: { $in: branch },
      unit: { $in: unit },
      visitortype: { $in: visitortype },
      visitormode: { $in: visitormode },
      visitorpurpose: { $in: visitorpurpose },
    };
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    const resdata = await Visitorinformationmaster.find(query);

    return res.status(200).json({
      result: resdata,
    });
  } catch (err) {
    console.error('Error in skippedBranchVisitors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.skippedVisitorInformationsExports = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator, todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    let query = {
      interactorstatus: { $in: ['visitorinformation'] },
    };

    if (fromdate && todate) query.date = { $gte: fromdate, $lte: todate };

    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) query[key] = { $in: value };
    };

    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // 🔹 Apply advanced search filters
    const conditions = allFilters?.map(({ column, condition, value }) => (column && condition && (value || ['Blank', 'Not Blank'].includes(condition)) ? createFilterCondition(column, condition, value) : null)).filter(Boolean);

    if (conditions?.length) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // 🔹 Handle search query
    if (searchQuery) {
      const regex = new RegExp(searchQuery.split(' ').join('|'), 'i');
      query.$or = (query.$or || []).concat(['company', 'branch', 'unit', 'date', 'visitorid', 'visitorname', 'visitortype', 'visitormode', 'visitorpurpose', 'visitorcontactnumber', 'intime', 'outtime'].map((field) => ({ [field]: regex })));
    }

    // 🔹 Apply assignbranch filter
    query.$or = (query.$or || []).concat(
      assignbranch.map(({ company, branch, unit }) => ({
        company,
        branch,
        unit,
      }))
    );

    // 🔹 Get total count separately
    const totalRecords = await Visitorinformationmaster.countDocuments(query);

    // 🔹 Fetch paginated data
    const visitors = await Visitorinformationmaster.find(query)
      .sort({ _id: 1 })
      .select({
        company: 1,
        category: 1,
        branch: 1,
        unit: 1,
        date: 1,
        visitorid: 1,
        prefix: 1,
        visitorname: 1,
        visitoremail: 1,
        visitortype: 1,
        visitormode: 1,
        visitorpurpose: 1,
        visitorcontactnumber: 1,
        intime: 1,
        outtime: 1,
        interactorstatus: 1,
        isBtnEnable: 1,
        addvisitorin: 1,
        enquirystatusforinteractorstatus: 1,
        ticketid: 1,
        ticketstatus: 1,
        ticketprepared: 1,
        tickethandledby: 1,
        requestvisitorfollowupstatus: 1,
        files: 1, // Fetch actual files instead of counting
        followuparray: { $slice: -1 }, // Only fetch the latest follow-up
      });

    return res.status(200).json({
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / pageSize),
      result: visitors,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.skippedVisitorInformationsExportsAll = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator, todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    let query = {};
    if (fromdate && todate) query.date = { $gte: fromdate, $lte: todate };

    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) query[key] = { $in: value };
    };

    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // 🔹 Apply advanced search filters
    const conditions = allFilters?.map(({ column, condition, value }) => (column && condition && (value || ['Blank', 'Not Blank'].includes(condition)) ? createFilterCondition(column, condition, value) : null)).filter(Boolean);

    if (conditions?.length) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // 🔹 Handle search query
    if (searchQuery) {
      const regex = new RegExp(searchQuery.split(' ').join('|'), 'i');
      query.$or = (query.$or || []).concat(['company', 'branch', 'unit', 'date', 'visitorid', 'visitorname', 'visitortype', 'visitormode', 'visitorpurpose', 'visitorcontactnumber', 'intime', 'outtime'].map((field) => ({ [field]: regex })));
    }

    // 🔹 Apply assignbranch filter
    query.$or = (query.$or || []).concat(
      assignbranch.map(({ company, branch, unit }) => ({
        company,
        branch,
        unit,
      }))
    );

    // 🔹 Get total count separately
    const totalRecords = await Visitorinformationmaster.countDocuments(query);

    // 🔹 Fetch paginated data
    const visitors = await Visitorinformationmaster.find(query)
      .sort({ _id: 1 })
      .select({
        company: 1,
        category: 1,
        branch: 1,
        unit: 1,
        date: 1,
        visitorid: 1,
        prefix: 1,
        visitorname: 1,
        visitoremail: 1,
        visitortype: 1,
        visitormode: 1,
        visitorpurpose: 1,
        visitorcontactnumber: 1,
        intime: 1,
        outtime: 1,
        interactorstatus: 1,
        isBtnEnable: 1,
        addvisitorin: 1,
        ticketid: 1,
        ticketstatus: 1,
        ticketprepared: 1,
        tickethandledby: 1,
        enquirystatusforinteractorstatus: 1,
        requestvisitorfollowupstatus: 1,
        files: 1, // Fetch actual files instead of counting
        followuparray: { $slice: -1 }, // Only fetch the latest follow-up
      });

    return res.status(200).json({
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / pageSize),
      result: visitors,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllVisitorInformationsForCandidate = catchAsyncErrors(async (req, res, next) => {
  let visitors;
  try {
    visitors = await Visitorinformationmaster.find({}, { visitorname: 1 });
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!visitors) {
    return next(new ErrorHandler('Data not found!', 404));
  }
  return res.status(200).json({
    // count: products?.length,
    visitors,
  });
});

exports.duplicateCandidateFaceDetectorVisitorInformation = catchAsyncErrors(async (req, res, next) => {
  try {
    const { faceDescriptor, id } = req.body;

    // Ensure faceDescriptor is an array of numbers
    if (!Array.isArray(faceDescriptor) || !faceDescriptor.every((num) => typeof num === 'number')) {
      throw new Error('Invalid face descriptor format.');
    }

    // Fetch all user face descriptors from MongoDB
    const query = id ? { _id: { $ne: id } } : {};

    const [allcandidates, allUsers, visitorcheck] = await Promise.all([
      Addcandidate.aggregate([
        { $match: query },
        {
          $project: {
            faceDescriptor: 1,
            'experiencedetails.company': 1,
            fullname: 1,
            email: 1,
            mobile: 1,
          },
        },
        { $addFields: { modelName: 'Candidate' } },
      ]),
      User.aggregate([
        { $match: query },
        {
          $project: {
            faceDescriptor: 1,
            company: 1,
            branch: 1,
            unit: 1,
            companyname: 1,
            email: 1,
            mobile: '$contactpersonal',
          },
        },
        { $addFields: { modelName: 'Employee' } },
      ]),
      Visitorinformationmaster.aggregate([
        { $match: query },
        // {
        //   $project: {
        //     faceDescriptor: 1,
        //     visitorname: 1,
        //     company: 1,
        //     branch: 1,
        //     unit: 1,
        //   }
        // },
        { $addFields: { modelName: 'Visitor' } },
      ]),
    ]);

    let authenticated = false;
    const matchedData = [];
    const allData = [...allcandidates, ...allUsers, ...visitorcheck];

    // Compare face descriptors
    for (const data of allData) {
      const storedDescriptor = data?.faceDescriptor;

      if (!Array.isArray(storedDescriptor) || storedDescriptor?.length !== faceDescriptor?.length) {
        continue; // Skip mismatched descriptors
      }

      const distance = faceapi.euclideanDistance(faceDescriptor, storedDescriptor);

      if (distance < 0.4) {
        authenticated = true;
        matchedData.push({
          ...data,
          distance,
        });
      }
    }

    return res.status(200).json({ matchfound: authenticated, matchedData });
  } catch (err) {
    console.error('Error:', err);
    return next(new ErrorHandler('Records not found!', 404));
  }
});

exports.AddVisitorInformationInList = async (req, res) => {
  try {
    let totalProjects, totalProjectsAllData, result;
    const { page, pageSize, assignbranch, fromdate, searchQuery, allFilters, logicOperator, todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Return an empty response if assignbranch is not provided or empty
    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        totalProjectsAllData: [],
        currentPage: page,
        totalPages: 0,
      });
    }

    let query = {};

    // Add date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Add other filters
    if (Array.isArray(company) && company?.length > 0) {
      query.company = { $in: company };
    }
    if (Array.isArray(branch) && branch?.length > 0) {
      query.branch = { $in: branch };
    }
    if (Array.isArray(unit) && unit?.length > 0) {
      query.unit = { $in: unit };
    }
    if (Array.isArray(visitortype) && visitortype?.length > 0) {
      query.visitortype = { $in: visitortype };
    }
    if (Array.isArray(visitormode) && visitormode?.length > 0) {
      query.visitormode = { $in: visitormode };
    }
    if (Array.isArray(visitorpurpose) && visitorpurpose?.length > 0) {
      query.visitorpurpose = { $in: visitorpurpose };
    }

    // Advanced search filter
    const conditions = [];
    if (allFilters && allFilters?.length > 0) {
      allFilters.forEach((filter) => {
        if (filter.column && filter.condition && (filter.value || ['Blank', 'Not Blank'].includes(filter.condition))) {
          conditions.push(createFilterCondition(filter.column, filter.condition, filter.value));
        }
      });
    }

    // Add search query filter
    if (searchQuery && searchQuery !== undefined) {
      const searchTermsArray = searchQuery.split(' ');
      const regexTerms = searchTermsArray.map((term) => new RegExp(term, 'i'));

      const orConditions = regexTerms.map((regex) => ({
        $or: [{ company: regex }, { branch: regex }, { unit: regex }, { date: regex }, { visitorid: regex }, { visitorname: regex }, { visitortype: regex }, { visitormode: regex }, { visitorpurpose: regex }, { visitorcontactnumber: regex }, { intime: regex }, { outtime: regex }],
      }));
      query = {
        $and: [
          query,
          // {
          //     $or: assignbranch.map(item => ({
          //         company: item.company,
          //         branch: item.branch,
          //     }))
          // },
          ...orConditions,
        ],
      };
      // conditions.push(...orConditions);
    }

    // Apply logicOperator to combine conditions
    if (conditions?.length > 0) {
      if (logicOperator === 'AND') {
        query.$and = conditions;
      } else if (logicOperator === 'OR') {
        query.$or = conditions;
      }
    }

    // Add conditions based on each branchObj in assignbranch
    const branchFilters = assignbranch.map((branchObj) => ({
      company: branchObj.company,
      branch: branchObj.branch,
      unit: branchObj.unit,
      addvisitorin: true,
    }));

    // Combine all filters into $and
    const combinedFilter = {
      $and: [query, { $or: branchFilters }],
    };

    // Query the database based on combined filters
    totalProjectsAllData = await Visitorinformationmaster.find(combinedFilter);
    totalProjects = await Visitorinformationmaster.countDocuments(combinedFilter);
    result = await Visitorinformationmaster.find(combinedFilter)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    return res.status(200).json({
      result,
      totalProjects,
      totalProjectsAllData,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / pageSize),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.skippedAllVisitorInformations = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters = [], logicOperator = 'AND', todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Validate assignbranch
    if (!Array.isArray(assignbranch)) {
      return res.status(400).json({ error: 'assignbranch must be an array' });
    }

    if (assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Initialize query object
    let query = {};

    // Date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    } else if (fromdate) {
      query.date = { $gte: fromdate };
    } else if (todate) {
      query.date = { $lte: todate };
    }

    // Helper function to add array filters
    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length > 0) {
        query[key] = { $in: value };
      } else if (value && !Array.isArray(value)) {
        query[key] = value;
      }
    };

    // Apply basic filters
    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // Process advanced filters
    const conditions = allFilters
      .map(({ column, condition, value }) => {
        if (!column || !condition) return null;
        return createFilterCondition(column, condition, value);
      })
      .filter(Boolean);

    if (conditions?.length > 0) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // Handle search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [
                    { company: new RegExp(term, 'i') },
                    { branch: new RegExp(term, 'i') },
                    { unit: new RegExp(term, 'i') },
                    { date: new RegExp(term, 'i') },
                    { visitorid: new RegExp(term, 'i') },
                    { visitorname: new RegExp(term, 'i') },
                    { visitortype: new RegExp(term, 'i') },
                    { visitormode: new RegExp(term, 'i') },
                    { visitorpurpose: new RegExp(term, 'i') },
                    { visitorcontactnumber: new RegExp(term, 'i') },
                    { intime: new RegExp(term, 'i') },
                    { outtime: new RegExp(term, 'i') },
                  ],
                };
              } catch (err) {
                // Handle invalid regular expression by skipping this search term
                console.error('Invalid regular expression:', term, err);
                return null; // Skip this term
              }
            })
            .filter(Boolean); // Remove null values from the conditions

          // Combine with existing query
          if (Object.keys(query)?.length > 0 || conditions?.length > 0) {
            query = {
              $and: [...(Object.keys(query)?.length > 0 ? [query] : []), ...(regexConditions?.length > 0 ? [regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions }] : [])].filter(Boolean),
            };
          } else {
            query = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };
          }
        }
      }
    } catch (err) {
      // Return a response with an empty result if there's an error
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Add branch filter
    query.$or = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    // Validate pagination parameters
    const parsedPage = Math.max(1, parseInt(page));
    const parsedPageSize = Math.max(1, parseInt(pageSize));

    // Aggregate query
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (parsedPage - 1) * parsedPageSize },
            { $limit: parsedPageSize },
            {
              $project: {
                company: 1,
                category: 1,
                branch: 1,
                unit: 1,
                date: 1,
                visitorid: 1,
                prefix: 1,
                visitorname: 1,
                visitoremail: 1,
                visitortype: 1,
                visitormode: 1,
                visitorpurpose: 1,
                visitorcontactnumber: 1,
                intime: 1,
                outtime: 1,
                interactorstatus: 1,
                isBtnEnable: 1,
                addvisitorin: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
                enquirystatusforinteractorstatus: 1,
                requestvisitorfollowupstatus: 1,
                followuparray: {
                  $let: {
                    vars: { lastFollowUp: { $arrayElemAt: ['$followuparray', -1] } },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$followuparray' }, 0] },
                        then: {
                          visitortype: '$$lastFollowUp.visitortype',
                          visitormode: '$$lastFollowUp.visitormode',
                          visitorpurpose: '$$lastFollowUp.visitorpurpose',
                          intime: '$$lastFollowUp.intime',
                          outtime: '$$lastFollowUp.outtime',
                        },
                        else: null,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    const totalPages = Math.ceil(totalProjects / parsedPageSize);

    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parsedPage,
      totalPages,
    });
  } catch (err) {
    // console.error("Error:", err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

exports.skippedVisitorInformations = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator = 'AND', todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Early return if no branches are assigned
    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Base query with interactorstatus condition
    let query = {
      interactorstatus: { $in: ['visitorinformation'] },
    };

    // Date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Helper function to add array filters
    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) {
        query[key] = { $in: value };
      } else if (value) {
        query[key] = value;
      }
    };

    // Apply filters
    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // // Process advanced filters
    let conditions = [];
    if (Array.isArray(allFilters)) {
      conditions = allFilters
        .map(({ column, condition, value }) => {
          if (column && condition && (value || ['Blank', 'Not Blank'].includes(condition))) {
            return createFilterCondition(column, condition, value);
          }
          return null;
        })
        .filter(Boolean);
    }

    if (conditions?.length > 0) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // Apply search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [
                    { company: new RegExp(term, 'i') },
                    { branch: new RegExp(term, 'i') },
                    { unit: new RegExp(term, 'i') },
                    { date: new RegExp(term, 'i') },
                    { visitorid: new RegExp(term, 'i') },
                    { visitorname: new RegExp(term, 'i') },
                    { visitortype: new RegExp(term, 'i') },
                    { visitormode: new RegExp(term, 'i') },
                    { visitorpurpose: new RegExp(term, 'i') },
                    { visitorcontactnumber: new RegExp(term, 'i') },
                    { intime: new RegExp(term, 'i') },
                    { outtime: new RegExp(term, 'i') },
                  ],
                };
              } catch (err) {
                // Handle invalid regular expression by skipping this search term
                console.error('Invalid regular expression:', term, err);
                return null; // Skip this term
              }
            })
            .filter(Boolean); // Remove null values from the conditions

          // Combine with existing query
          if (Object.keys(query)?.length > 0 || conditions?.length > 0) {
            query = {
              $and: [...(Object.keys(query)?.length > 0 ? [query] : []), ...(regexConditions?.length > 0 ? [regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions }] : [])].filter(Boolean),
            };
          } else {
            query = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };
          }
        }
      }
    } catch (err) {
      // Return a response with an empty result if there's an error
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Branch filter - must be applied last as it uses $or
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    if (query.$or) {
      // If there's already an $or condition, we need to nest it properly
      query = {
        $and: [{ $or: branchConditions }, query],
      };
    } else {
      query.$or = branchConditions;
    }

    // Aggregate Query with Pagination & Count
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (page - 1) * pageSize },
            { $limit: parseInt(pageSize) },
            {
              $project: {
                company: 1,
                category: 1,
                branch: 1,
                unit: 1,
                date: 1,
                visitorid: 1,
                prefix: 1,
                visitorname: 1,
                visitoremail: 1,
                visitortype: 1,
                visitormode: 1,
                visitorpurpose: 1,
                visitorcontactnumber: 1,
                intime: 1,
                outtime: 1,
                interactorstatus: 1,
                isBtnEnable: 1,
                addvisitorin: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
                branchforwardlog: 1,
                enquirystatusforinteractorstatus: 1,
                followuparray: {
                  $let: {
                    vars: { lastFollowUp: { $arrayElemAt: ['$followuparray', -1] } },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$followuparray' }, 0] },
                        then: {
                          visitortype: '$$lastFollowUp.visitortype',
                          visitormode: '$$lastFollowUp.visitormode',
                          visitorpurpose: '$$lastFollowUp.visitorpurpose',
                          intime: '$$lastFollowUp.intime',
                          outtime: '$$lastFollowUp.outtime',
                        },
                        else: null,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProjects / parseInt(pageSize)),
    });
  } catch (err) {
    console.error('Error in skippedVisitors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.skippedAllVisitorInformationsDetailslog = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      assignbranch,
      searchQuery,
      allFilters = [],
      logicOperator = 'AND',

      company = [],
      branch = [],
      unit = [],
      visitorname = [],
      visitorpurpose = [],
      visitortype = [],
    } = req.body;

    // Validate assignbranch
    if (!Array.isArray(assignbranch)) {
      return res.status(400).json({ error: 'assignbranch must be an array' });
    }

    if (assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Initialize query object with branch filter first
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    let query = { $or: branchConditions };

    // Process advanced filters
    const conditions = allFilters
      .map(({ column, condition, value }) => {
        if (!column || !condition) return null;
        return createFilterCondition(column, condition, value);
      })
      .filter(Boolean);

    if (conditions?.length > 0) {
      query = {
        $and: [
          query, // This includes the branch conditions
          { [logicOperator === 'AND' ? '$and' : '$or']: conditions },
        ],
      };
    }

    // Add array-based filters if provided
    const arrayFilters = [];
    if (company.length > 0) arrayFilters.push({ company: { $in: company } });
    if (branch.length > 0) arrayFilters.push({ branch: { $in: branch } });
    if (unit.length > 0) arrayFilters.push({ unit: { $in: unit } });
    if (visitorname.length > 0) arrayFilters.push({ visitorname: { $in: visitorname } });
    if (visitorpurpose.length > 0) arrayFilters.push({ visitorpurpose: { $in: visitorpurpose } });
    if (visitortype.length > 0) arrayFilters.push({ visitortype: { $in: visitortype } });

    if (arrayFilters.length > 0) {
      query = { $and: [query, ...arrayFilters] };
    }

    // Handle search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [{ company: new RegExp(term, 'i') }, { branch: new RegExp(term, 'i') }, { unit: new RegExp(term, 'i') }, { visitorid: new RegExp(term, 'i') }, { visitorname: new RegExp(term, 'i') }, { visitoremail: new RegExp(term, 'i') }, { visitorcontactnumber: new RegExp(term, 'i') }],
                };
              } catch (err) {
                console.error('Invalid regular expression:', term, err);
                return null;
              }
            })
            .filter(Boolean);

          if (regexConditions?.length > 0) {
            const searchCondition = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };

            query = {
              $and: [
                query, // This includes all previous conditions (branch + filters)
                searchCondition,
              ],
            };
          }
        }
      }
    } catch (err) {
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Validate pagination parameters
    const parsedPage = Math.max(1, parseInt(page));
    const parsedPageSize = Math.max(1, parseInt(pageSize));

    // Aggregate query
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (parsedPage - 1) * parsedPageSize },
            { $limit: parsedPageSize },
            {
              $project: {
                company: 1,
                branch: 1,
                unit: 1,
                visitorid: 1,
                visitorname: 1,
                visitoremail: 1,
                visitorcontactnumber: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    const totalPages = Math.ceil(totalProjects / parsedPageSize);

    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parsedPage,
      totalPages,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

exports.skippedAllVisitorInformationsDetailslogExports = async (req, res) => {
  try {
    const { assignbranch, company = [], branch = [], unit = [], visitorname = [], visitorpurpose = [], visitortype = [] } = req.body;

    // Validate assignbranch
    if (!Array.isArray(assignbranch)) {
      return res.status(400).json({ error: 'assignbranch must be an array' });
    }

    if (assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Initialize query object with branch filter first
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    let query = { $or: branchConditions };

    const arrayFilters = [];
    if (company.length > 0) arrayFilters.push({ company: { $in: company } });
    if (branch.length > 0) arrayFilters.push({ branch: { $in: branch } });
    if (unit.length > 0) arrayFilters.push({ unit: { $in: unit } });
    if (visitorname.length > 0) arrayFilters.push({ visitorname: { $in: visitorname } });
    if (visitorpurpose.length > 0) arrayFilters.push({ visitorpurpose: { $in: visitorpurpose } });
    if (visitortype.length > 0) arrayFilters.push({ visitortype: { $in: visitortype } });

    if (arrayFilters.length > 0) {
      query = { $and: [query, ...arrayFilters] };
    }

    // Aggregate query
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            {
              $project: {
                company: 1,
                branch: 1,
                unit: 1,
                visitorid: 1,
                visitorname: 1,
                visitoremail: 1,
                visitorcontactnumber: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;

    return res.status(200).json({
      result: data.result || [],
      totalProjects,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

function createFilterCondition(column, condition, value) {
  switch (condition) {
    case 'Contains':
      return { [column]: new RegExp(value, 'i') };
    case 'Does Not Contain':
      return { [column]: { $not: new RegExp(value, 'i') } };
    case 'Equals':
      return { [column]: value };
    case 'Does Not Equal':
      return { [column]: { $ne: value } };
    case 'Begins With':
      return { [column]: new RegExp(`^${value}`, 'i') };
    case 'Ends With':
      return { [column]: new RegExp(`${value}$`, 'i') };
    case 'Blank':
      return { [column]: { $exists: false } };
    case 'Not Blank':
      return { [column]: { $exists: true } };
    default:
      return {};
  }
}

// branch forwarded list filter functionality
exports.skippedVisitorInformationsBranchforwarded = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator = 'AND', todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Early return if no branches are assigned
    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Base query with interactorstatus condition
    let query = {
      interactorstatus: { $in: ['visitorinformation'] },
    };

    // Date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Helper function to add array filters
    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) {
        query[key] = { $in: value };
      } else if (value) {
        query[key] = value;
      }
    };

    // Apply filters
    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // // Process advanced filters
    let conditions = [];
    if (Array.isArray(allFilters)) {
      conditions = allFilters
        .map(({ column, condition, value }) => {
          if (column && condition && (value || ['Blank', 'Not Blank'].includes(condition))) {
            return createFilterCondition(column, condition, value);
          }
          return null;
        })
        .filter(Boolean);
    }

    if (conditions?.length > 0) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // Apply search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [
                    { company: new RegExp(term, 'i') },
                    { branch: new RegExp(term, 'i') },
                    { unit: new RegExp(term, 'i') },
                    { date: new RegExp(term, 'i') },
                    { visitorid: new RegExp(term, 'i') },
                    { visitorname: new RegExp(term, 'i') },
                    { visitortype: new RegExp(term, 'i') },
                    { visitormode: new RegExp(term, 'i') },
                    { visitorpurpose: new RegExp(term, 'i') },
                    { visitorcontactnumber: new RegExp(term, 'i') },
                    { intime: new RegExp(term, 'i') },
                    { outtime: new RegExp(term, 'i') },
                  ],
                };
              } catch (err) {
                // Handle invalid regular expression by skipping this search term
                console.error('Invalid regular expression:', term, err);
                return null; // Skip this term
              }
            })
            .filter(Boolean); // Remove null values from the conditions

          // Combine with existing query
          if (Object.keys(query)?.length > 0 || conditions?.length > 0) {
            query = {
              $and: [...(Object.keys(query)?.length > 0 ? [query] : []), ...(regexConditions?.length > 0 ? [regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions }] : [])].filter(Boolean),
            };
          } else {
            query = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };
          }
        }
      }
    } catch (err) {
      // Return a response with an empty result if there's an error
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Branch filter - must be applied last as it uses $or
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    if (query.$or) {
      // If there's already an $or condition, we need to nest it properly
      query = {
        $and: [{ $or: branchConditions }, query],
      };
    } else {
      query.$or = branchConditions;
    }

    // Aggregate Query with Pagination & Count
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (page - 1) * pageSize },
            { $limit: parseInt(pageSize) },
            {
              $project: {
                company: 1,
                category: 1,
                branch: 1,
                unit: 1,
                date: 1,
                visitorid: 1,
                prefix: 1,
                visitorname: 1,
                visitoremail: 1,
                visitortype: 1,
                visitormode: 1,
                visitorpurpose: 1,
                visitorcontactnumber: 1,
                intime: 1,
                outtime: 1,
                interactorstatus: 1,
                isBtnEnable: 1,
                addvisitorin: 1,
                ticketid: 1,
                ticketstatus: 1,
                ticketprepared: 1,
                tickethandledby: 1,
                branchforwardlog: 1,
                enquirystatusforinteractorstatus: 1,
                followuparray: {
                  $let: {
                    vars: { lastFollowUp: { $arrayElemAt: ['$followuparray', -1] } },
                    in: {
                      $cond: {
                        if: { $gt: [{ $size: '$followuparray' }, 0] },
                        then: {
                          visitortype: '$$lastFollowUp.visitortype',
                          visitormode: '$$lastFollowUp.visitormode',
                          visitorpurpose: '$$lastFollowUp.visitorpurpose',
                          intime: '$$lastFollowUp.intime',
                          outtime: '$$lastFollowUp.outtime',
                        },
                        else: null,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProjects / parseInt(pageSize)),
    });
  } catch (err) {
    console.error('Error in skippedVisitors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// overall data list
//get All Visitorinformationmaster =>/api/Visitorinformationmaster
exports.getAllVisitorinformationmaster = catchAsyncErrors(async (req, res, next) => {
  const { assignbranch } = req.body;

  // Create a query array for company and branch
  const query = {
    $or: assignbranch.map((item) => ({
      company: item.company,
      branch: item.branch,
      unit: item.unit,
    })),
  };

  let visitors;

  try {
    visitors = await Visitorinformationmaster.find(query);
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }

  if (!visitors) {
    return next(new ErrorHandler('Visitorinformationmaster details not found', 404));
  }

  return res.status(200).json({
    // count: visitors.length,
    visitors,
  });
});

// Visitor Information approca list filter functionality
exports.skippedVisitorInformationsApproval = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, assignbranch, fromdate, searchQuery, allFilters, logicOperator = 'AND', todate, company, branch, unit, visitortype, visitormode, visitorpurpose } = req.body;

    // Early return if no branches are assigned
    if (!Array.isArray(assignbranch) || assignbranch?.length === 0) {
      return res.status(200).json({
        result: [],
        totalProjects: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Base query with interactorstatus condition
    let query = {
      interactorstatus: { $in: ['visitorinformation']},
    };

    // Date range filter
    if (fromdate && todate) {
      query.date = { $gte: fromdate, $lte: todate };
    }

    // Helper function to add array filters
    const addFilter = (key, value) => {
      if (Array.isArray(value) && value?.length) {
        query[key] = { $in: value };
      } else if (value) {
        query[key] = value;
      }
    };

    // Apply filters
    addFilter('company', company);
    addFilter('branch', branch);
    addFilter('unit', unit);
    addFilter('visitortype', visitortype);
    addFilter('visitormode', visitormode);
    addFilter('visitorpurpose', visitorpurpose);

    // // Process advanced filters
    let conditions = [];
    if (Array.isArray(allFilters)) {
      conditions = allFilters
        .map(({ column, condition, value }) => {
          if (column && condition && (value || ['Blank', 'Not Blank'].includes(condition))) {
            return createFilterCondition(column, condition, value);
          }
          return null;
        })
        .filter(Boolean);
    }

    if (conditions?.length > 0) {
      query[logicOperator === 'AND' ? '$and' : '$or'] = conditions;
    }

    // Apply search query
    try {
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms =
          typeof searchQuery === 'string'
            ? searchQuery
                .toLowerCase()
                .split(' ')
                .filter((term) => term.trim() !== '')
            : Array.isArray(searchQuery)
            ? searchQuery
            : [];

        if (searchTerms?.length > 0) {
          const regexConditions = searchTerms
            .map((term) => {
              try {
                return {
                  $or: [
                    { company: new RegExp(term, 'i') },
                    { branch: new RegExp(term, 'i') },
                    { unit: new RegExp(term, 'i') },
                    { date: new RegExp(term, 'i') },
                    { visitorid: new RegExp(term, 'i') },
                    { visitorname: new RegExp(term, 'i') },
                    { visitortype: new RegExp(term, 'i') },
                    { visitormode: new RegExp(term, 'i') },
                    { visitorpurpose: new RegExp(term, 'i') },
                    { visitorcontactnumber: new RegExp(term, 'i') },
                    { intime: new RegExp(term, 'i') },
                    { outtime: new RegExp(term, 'i') },
                  ],
                };
              } catch (err) {
                // Handle invalid regular expression by skipping this search term
                console.error('Invalid regular expression:', term, err);
                return null; // Skip this term
              }
            })
            .filter(Boolean); // Remove null values from the conditions

          // Combine with existing query
          if (Object.keys(query)?.length > 0 || conditions?.length > 0) {
            query = {
              $and: [...(Object.keys(query)?.length > 0 ? [query] : []), ...(regexConditions?.length > 0 ? [regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions }] : [])].filter(Boolean),
            };
          } else {
            query = regexConditions?.length === 1 ? regexConditions[0] : { $and: regexConditions };
          }
        }
      }
    } catch (err) {
      // Return a response with an empty result if there's an error
      return res.status(400).json({ result: [], totalProjects: 0, currentPage: page, totalPages: 0 });
    }

    // Branch filter - must be applied last as it uses $or
    const branchConditions = assignbranch.map(({ company, branch, unit }) => ({
      company,
      branch,
      unit,
    }));

    if (query.$or) {
      // If there's already an $or condition, we need to nest it properly
      query = {
        $and: [{ $or: branchConditions }, query],
      };
    } else {
      query.$or = branchConditions;
    }

    // Aggregate Query with Pagination & Count
    const [data] = await Visitorinformationmaster.aggregate([
      { $match: query },
      { $sort: { _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          result: [
            { $skip: (page - 1) * pageSize },
            { $limit: parseInt(pageSize) },
            {
              $project: {
                company: 1,
                category: 1,
                branch: 1,
                unit: 1,
                date: 1,
                visitorid: 1,
                prefix: 1,
                visitorname: 1,
                visitoremail: 1,
                visitortype: 1,
                visitormode: 1,
                visitorpurpose: 1,
                visitorcontactnumber: 1,
                intime: 1,
                outtime: 1,
                interactorstatus: 1,
                isBtnEnable: 1,
                addvisitorin: 1,
                visitorinformationstatus: 1,
                // ticketid: 1,
                // ticketstatus: 1,
                // ticketprepared: 1,
                // tickethandledby: 1,
                // branchforwardlog: 1,
                enquirystatusforinteractorstatus: 1,
                // followuparray: {
                //     $let: {
                //         vars: { lastFollowUp: { $arrayElemAt: ['$followuparray', -1] } },
                //         in: {
                //             $cond: {
                //                 if: { $gt: [{ $size: '$followuparray' }, 0] },
                //                 then: {
                //                     visitortype: '$$lastFollowUp.visitortype',
                //                     visitormode: '$$lastFollowUp.visitormode',
                //                     visitorpurpose: '$$lastFollowUp.visitorpurpose',
                //                     intime: '$$lastFollowUp.intime',
                //                     outtime: '$$lastFollowUp.outtime',
                //                 },
                //                 else: null,
                //             },
                //         },
                //     },
                // },
              },
            },
          ],
        },
      },
    ]);

    const totalProjects = data?.total?.[0]?.count || 0;
    return res.status(200).json({
      result: data.result || [],
      totalProjects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProjects / parseInt(pageSize)),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllVisitorInformationDetailsForProfile = catchAsyncErrors(async (req, res, next) => {
  const visitorcommonid = decodeURIComponent(req.params.id);
  // Find the most recently created document where visitorcommonid matches
  const svisitors = await Visitorinformationmaster.find({ visitorcommonid });

  if (!svisitors || svisitors.length === 0) {
    return res.status(200).json({
      svisitors: [], // Return the first document in the array
    });
  }

  return res.status(200).json({
    svisitors: svisitors, // Return the first document in the array
  });
});
