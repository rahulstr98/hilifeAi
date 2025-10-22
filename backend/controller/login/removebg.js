const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique file names


// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.getRemoveBG = catchAsyncErrors(async (req, res, next) => {
    upload.single('image')(req, res, async (uploadError) => {
        if (uploadError) {
            return next(new ErrorHandler("File upload error", 500));
        }

        try {
            const { color } = req.body;
            if (!color) {
                return res.status(400).json({ error: "Color is required" });
            }

            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            // Generate unique file paths
            const uniqueId = uuidv4();
            const inputImage = req.file.buffer;
            const tempInputImagePath = path.join(__dirname, `temp_input_image_${uniqueId}.jpg`);
            const tempOutputImagePath = path.join(__dirname, `temp_output_image_${uniqueId}.png`);

            // Save the uploaded image temporarily
            fs.writeFileSync(tempInputImagePath, inputImage);

            // Call the Python script to remove the background and add the color
            const pythonScript = path.join(__dirname, 'removebg.py'); // Adjust the path as necessary
            const command = `python3 "${pythonScript}" "${tempInputImagePath}" "${tempOutputImagePath}" "${color}"`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    return next(new ErrorHandler("Error processing image", 500));
                }

                // Read the output image and send it as base64
                const outputImage = fs.readFileSync(tempOutputImagePath);

                const base64Image = outputImage.toString('base64');

                // Delete temporary files
                fs.unlinkSync(tempInputImagePath);
                fs.unlinkSync(tempOutputImagePath);

                res.json({ image: `data:image/png;base64,${base64Image}` });
            });
        } catch (err) {
            return next(new ErrorHandler("Error processing image", 500));
        }
    });
});