const Userdocumentupload = require('../../model/modules/userdocumentupload');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const moment = require('moment');
// multer concepts
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// //get All Userdocumentupload =>/api/Userdocumentupload
exports.getAllUserdocumentupload = catchAsyncErrors(async (req, res, next) => {
  let userdocumentuploads;
  try {
    // userdocumentuploads = await Userdocumentupload.find().lean();
    userdocumentuploads = await Userdocumentupload.find({}).lean();
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!userdocumentuploads) {
    return next(new ErrorHandler('Userdocumentupload not found!', 404));
  }
  return res.status(200).json({
    userdocumentuploads,
  });
});

// Get Documents for User From the User Upload Documents page
exports.getUserUploadDocumentsForRemote = catchAsyncErrors(async (req, res, next) => {
  let userdocumentuploads;
  const { company, branch, unit, team, companyname } = req?.body?.user
  try {
    userdocumentuploads = await Userdocumentupload.find({ company, branch, unit, team, employeename: companyname }).lean();
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler('Records not found!', 404));
  }

  return res.status(200).json({
    userdocumentuploads,
  });
});

//create new Userdocumentupload => /api/Userdocumentupload/new
exports.addUserdocumentupload = catchAsyncErrors(async (req, res, next) => {
  let aUserdocumentupload = await Userdocumentupload.create(req.body);
  return res.status(200).json({
    message: 'Successfully added!',
  });
});

// get Single Userdocumentupload => /api/Userdocumentupload/:id
exports.getSingleUserdocumentupload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let suserdocumentupload = await Userdocumentupload.findById(id);
  if (!suserdocumentupload) {
    return next(new ErrorHandler('Userdocumentupload not found', 404));
  }
  return res.status(200).json({
    suserdocumentupload,
  });
});
//update Userdocumentupload by id => /api/Userdocumentupload/:id
exports.updateUserdocumentupload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let uuserdocumentupload = await Userdocumentupload.findByIdAndUpdate(id, req.body);
  if (!uuserdocumentupload) {
    return next(new ErrorHandler('Userdocumentupload not found', 404));
  }

  return res.status(200).json({ message: 'Updated successfully' });
});
//delete Userdocumentupload by id => /api/Userdocumentupload/:id

exports.deleteUserdocumentupload = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  let duserdocumentuploadbulk = await Userdocumentupload.findById(id);
  if (duserdocumentuploadbulk) {
    let ans = duserdocumentuploadbulk.files.map((d) => `${duserdocumentuploadbulk.uniqueId}$userdocuments$${d}`);
    const result = deleteUserDocumentFiles(ans);
  }
  let duserdocumentupload = await Userdocumentupload.findByIdAndRemove(id);
  if (!duserdocumentupload) {
    return next(new ErrorHandler('Userdocumentupload not found', 404));
  }

  return res.status(200).json({ message: 'Deleted successfully' });
});

function deleteUserDocumentFiles(filenames) {
  const deletedFiles = [];
  const notFoundFiles = [];

  // Asynchronously delete associated files
  filenames.forEach((file) => {
    const baseDir = path.join(process.cwd(), 'userdocuments_files'); // Assumes you run from backend
    const filePath = path.join(baseDir, file);

    // Ensure the file exists before deleting
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Failed to delete file: ${filePath}`, unlinkErr);
          }
        });
      }
    });
  });

  return {
    message: 'Deletion process completed.',
    deletedFiles,
    notFoundFiles,
  };
}

//multer upload

const mergeChunksUserdocuments = async (fileName, totalChunks) => {
  const parentDir = path.join(__dirname, '..'); // C:/Users/backend
  const chunkDir = path.join(parentDir, '..', 'mergeChunks');
  const mergedFilePath = path.join(parentDir, '..', 'userdocuments_files');

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
};

exports.uploadChunkUserdocuments = [
  upload.single('file'),
  catchAsyncErrors(async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const chunk = req.file.buffer;
    const chunkNumber = Number(req.body.chunkNumber);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname;
    const parentDir = path.join(__dirname, '..'); // C:/Users/backend
    const chunkDir = path.join(parentDir, '..', 'mergeChunks');
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }

    const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

    try {
      await fs.promises.writeFile(chunkFilePath, chunk);

      if (chunkNumber === totalChunks - 1) {
        await mergeChunksUserdocuments(fileName, totalChunks);
      }

      res.status(200).json({ message: 'Chunk uploaded successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error saving chunk' });
    }
  }),
];

exports.getAllUserdocumentsDelete = catchAsyncErrors(async (req, res, next) => {
  const { filenames } = req.body;

  try {
    let deletedFiles = [];
    let notFoundFiles = [];

    filenames.forEach((file) => {
      const parentDir = path.join(__dirname, '..'); // C:/Users/backend
      const filePath = path.join(parentDir, '..', 'userdocuments_files', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
        deletedFiles.push(file);
      } else {
        notFoundFiles.push(file);
      }
    });

    res.json({
      message: 'Deletion process completed.',
      deletedFiles,
      notFoundFiles,
    });
  } catch (err) { }
});

exports.getAllUserdocumentsEditFetch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { filename } = req.body;
    console.log(filename, "filename")
    const parentDir = path.join(__dirname, '..'); // C:/Users/backend
    const filePath = path.join(parentDir, '..', 'userdocuments_files', filename);

    if (!fs.existsSync(filePath)) {
      //  return res.status(404).json({ message: "File not found" });
    }

    res.setHeader('Content-Type', mime.lookup(filename));
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    fs.createReadStream(filePath).pipe(res);
  } catch (err) { console.log(err, 'err') }
});

exports.getAllUserdocumentsDeleteBulk = catchAsyncErrors(async (req, res, next) => {
  const { filenames } = req.body; // ["uniqueId$userdocuments$filename1.jpg", ...]

  const deletedFiles = [];
  const notFoundFiles = [];

  filenames.forEach((combinedPath) => {
    const parts = combinedPath.split('$');
    if (parts.length !== 3) return;

    const [uniqueId, folder, filename] = parts;
    const baseDir = path.join(__dirname, '..', '..', 'userdocuments_files');
    const fullPath = path.join(baseDir, folder, filename); // example: event_files/events/abc.jpg

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      deletedFiles.push(`${folder}/${filename}`);
    } else {
      notFoundFiles.push(`${folder}/${filename}`);
    }
  });

  res.status(200).json({
    message: 'Bulk file deletion completed.',
    deletedFiles,
    notFoundFiles,
  });
});

// user document upload filter functionality
exports.getUserdocumentuploadListFilter = catchAsyncErrors(async (req, res, next) => {
  let userdocumentuploads;
  const { type, company, branch, unit, team, employee, fromdate, todate, date, assignbranch } = req.body;
  let query = {
    company: { $in: company },
  };

  const accessquery = {
    $or: assignbranch.map((item) => ({
      company: item.company,
      branch: item.branch,
      unit: item.unit,
    })),
  };

  try {
    switch (type) {
      case 'Individual':
        query = {
          branch: { $in: branch },
          unit: { $in: unit },
          team: { $in: team },
          employeename: { $in: employee },

          date: {
            $gte: fromdate,
            $lte: todate,
          },
        };
        break;

      case 'Company':
        query = {
          date: {
            $gte: fromdate,
            $lte: todate,
          },
        };
        break;

      case 'Branch':
        query = {
          branch: { $in: branch },
          date: {
            $gte: fromdate,
            $lte: todate,
          },
        };
        break;

      case 'Unit':
        query = {
          branch: { $in: branch },
          unit: { $in: unit },
          date: {
            $gte: fromdate,
            $lte: todate,
          },
        };
        break;

      case 'Team':
        query = {
          branch: { $in: branch },
          unit: { $in: unit },
          team: { $in: team },
          date: {
            $gte: fromdate,
            $lte: todate,
          },
        };
        break;

      default:
        return next(new ErrorHandler('Invalid filter type provided', 400));
    }

    const combinedQuery = {
      $and: [query, accessquery],
    };

    userdocumentuploads = await Userdocumentupload.find(combinedQuery, {}).lean();
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  if (!userdocumentuploads) {
    return next(new ErrorHandler('Userdocumentupload not found!', 404));
  }
  return res.status(200).json({ userdocumentuploads });
});

exports.getFilteredUserdocumentuploads = catchAsyncErrors(async (req, res, next) => {
  try {
    const { modulename, submodulename, mainpagename, subpagename, subsubpagename, employeename } = req.body;

    const today = moment();
    const pastThreeDays = [today.format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD')];

    const query = {
      modulename,
      submodulename,
      mainpagename,
      subpagename,
      subsubpagename,
      employeename,
      // date: { $in: pastThreeDays },
    };
    if (subsubpagename !== 'Notice Period Apply') {
      query.date = { $in: pastThreeDays };
    }

    const userdocumentuploads = await Userdocumentupload.find(query).lean();

    if (!userdocumentuploads || userdocumentuploads.length === 0) {
      return res.status(200).json({
        success: false,
        userdocumentuploads: [],
      });
    }

    return res.status(200).json({
      success: true,
      userdocumentuploads,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler('Error fetching records', 500));
  }
});

exports.getFilteredUserdocumentuploadsForLeave = catchAsyncErrors(async (req, res, next) => {
  try {
    const { dateArray, employee } = req.body;
    const formattedDates = dateArray?.map((d) => moment(d, 'DD/MM/YYYY').format('YYYY-MM-DD'));

    const userdocumentuploads = await Userdocumentupload.find(
      { modulename: 'Leave&Permission', submodulename: 'Leave', mainpagename: 'Apply Leave', employeename: { $eq: employee }, date: { $in: formattedDates } },
      {
        company: 1,
        branch: 1,
        unit: 1,
        team: 1,
        employeename: 1,
        date: 1,
        files: 1,
        uniqueId: 1,
      }
    ).lean();

    if (!userdocumentuploads || userdocumentuploads.length === 0) {
      return res.status(200).json({
        success: false,
        userdocumentuploads: [],
      });
    }

    return res.status(200).json({
      success: true,
      userdocumentuploads,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler('Error fetching records', 500));
  }
});

exports.getFilteredUserdocumentuploadsForPermission = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, employee } = req.body;
    console.log(date, employee);
    const userdocumentuploads = await Userdocumentupload.find(
      { modulename: 'Leave&Permission', submodulename: 'Permission', mainpagename: 'Apply Permission', employeename: { $eq: employee }, date: { $eq: date } },
      {
        company: 1,
        branch: 1,
        unit: 1,
        team: 1,
        employeename: 1,
        date: 1,
        files: 1,
        uniqueId: 1,
      }
    ).lean();
    console.log(userdocumentuploads, ';');
    if (!userdocumentuploads || userdocumentuploads.length === 0) {
      return res.status(200).json({
        success: false,
        userdocumentuploads: [],
      });
    }

    return res.status(200).json({
      success: true,
      userdocumentuploads,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler('Error fetching records', 500));
  }
});
