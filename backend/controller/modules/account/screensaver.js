const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const ErrorHandler = require('../../../utils/errorhandler');
const catchAsyncErrors = require('../../../middleware/catchAsyncError');
const { exec } = require('child_process');

const uploadDir = path.join(__dirname, '../../images');

// Multer configuration for file uploads
const upload = multer({ dest: uploadDir });
const progressStore = {};
// Function to handle screensaver creation
exports.createScreenSaver = catchAsyncErrors(async (req, res, next) => {

    const requestId = new Date().getTime(); // Generate a unique ID for this request
    progressStore[requestId] = 0; // Initialize progress
    upload.array('images')(req, res, async (uploadError) => {
        if (uploadError) {
            return next(new ErrorHandler("File upload error", 500));
        }

        try {
            const files = req.files;

            const interval = req.body.interval;

            if (!files || files.length === 0 || !interval) {
                return res.status(400).send('Images or interval missing');
            }

            // Separate images and MP3 file
            const images = files.filter(file => file.mimetype.startsWith('image'));
            const mp3File = files.find(file => file.mimetype === 'audio/mpeg');

            // 1. Save images to the 'images' folder
            const imagesFolder = path.join(__dirname, 'images');
            fs.ensureDirSync(imagesFolder); // Ensure the folder exists
            progressStore[requestId] = 20; // 20% completed

            images.forEach((image, index) => {
                const imagePath = path.join(imagesFolder, `image${index + 1}${path.extname(image.originalname)}`);
                fs.renameSync(image.path, imagePath); // Move uploaded file to images folder
            });
            const audioFolder = path.join(__dirname, 'audio');
            fs.ensureDirSync(audioFolder);
            let mp3Path = "None";
            if (mp3File) {
                mp3Path = path.join(audioFolder, mp3File.originalname);
                fs.renameSync(mp3File.path, mp3Path); // Save the MP3 file
            }



            // 2. Create a Python script dynamically using images and interval
            const pythonScript = createPythonScript(images, interval);
            progressStore[requestId] = 40; // 40% completed

            const tempFolder = path.join(__dirname, 'temp');
            fs.ensureDirSync(tempFolder); // Create the directory if it doesn't exist

            // 3. Write the Python script to a file
            const pythonScriptPath = path.join(__dirname, 'temp', 'slideshow.py');
            fs.writeFileSync(pythonScriptPath, pythonScript);
            progressStore[requestId] = 60; // 60% completed

            // 4. Use PyInstaller to create an executable
            const distFolder = path.join(__dirname, 'dist');
            const buildFolder = path.join(__dirname, 'build');
            //const pyInstallerPath = 'C:\\users\\hilifeai\\Local Settings\\Application Data\\Programs\\Python\\Python310-32\\Scripts\\pyinstaller.exe'
	    const pyInstallerPath = 'C:\\users\\ttsbs\\Local Settings\\Application Data\\Programs\\Python\\Python310-32\\Scripts\\pyinstaller.exe'
            // const pyInstallerCommand = `"${pyInstallerPath}" --onefile --distpath "${distFolder}" --workpath "${buildFolder}" --add-data "${imagesFolder};images" --add-data "${mp3Path};images" --windowed "${pythonScriptPath}"`;

            const imagesFolderWindows = imagesFolder.replace(/\\/g, '\\\\');  // Windows path escaping
            const mp3PathWindows = audioFolder.replace(/\\/g, '\\\\');  // Handle mp3 path




            const pyInstallerCommand = `wine cmd /c "${pyInstallerPath}" --onefile --distpath "${distFolder}" --workpath "${buildFolder}" --add-data "${imagesFolder}:images" --windowed "${pythonScriptPath}"`;

            exec(pyInstallerCommand, (err, stdout, stderr) => {
                if (err) {
                    return res.status(500).send('Error generating executable');
                }


                // Path to the generated executable
                const exePath = path.join(distFolder, 'slideshow.exe');
                const scrPath = path.join(distFolder, 'slideshow.scr');

                // Check if the generated file exists and rename it
                if (fs.existsSync(exePath)) {
                    fs.renameSync(exePath, scrPath);
                } else {
                    return res.status(500).send('Executable file not found');
                }

                // Log file stats for debugging
                const fileStats = fs.statSync(scrPath);

                // Read the .scr file and encode it as base64
                const file = fs.readFileSync(scrPath);
                const base64File = file.toString('base64');
                progressStore[requestId] = 100; // 100% completed
                // After sending the response, clean up temporary files
                cleanUp(imagesFolder, pythonScriptPath, exePath, scrPath, audioFolder);
                // Send the base64 file as a JSON response
                return res.json({ base64File, requestId });



            });
        } catch (err) {
            return next(new ErrorHandler("Error processing screensaver request", 500));
        }
    });
});

// Endpoint to check progress
exports.getProgress = (req, res) => {

    const { requestId } = req.params;
    const progress = progressStore[requestId] || 0;
    res.json({ progress });
};

function createPythonScript(images, interval) {
    let pythonScript = `
import os
import time
import pygame
import sys  # Import sys for _MEIPASS

# Initialize Pygame
pygame.init()

# Set the screen resolution to 1366x768
screen_width = 1366
screen_height = 768
screen = pygame.display.set_mode((screen_width, screen_height), pygame.FULLSCREEN)
pygame.display.set_caption("Image Slideshow")

# Set up the path to access bundled images
base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))

# List of image files
image_files = [
`;

    images.forEach((image, index) => {
        pythonScript += `    os.path.join(base_path, "images/image${index + 1}${image.originalname.slice(image.originalname.lastIndexOf('.'))}"),\n`;
    });

    pythonScript += `]

# Function to load images and process scaling
def load_image(image_path):
    image = pygame.image.load(image_path)
    image_width, image_height = image.get_size()

    # Case 3: If both height and width exceed screen dimensions, scale to cover both
    if image_height > screen_height and image_width > screen_width:
        scale_factor = max(screen_width / image_width, screen_height / image_height)
        new_width = int(image_width * scale_factor)
        new_height = int(image_height * scale_factor)
        image = pygame.transform.smoothscale(image, (new_width, new_height))  # Use smoothscale

        # Crop excess part to exactly match the screen size
        crop_x = max(0, (new_width - screen_width) // 2)
        crop_y = max(0, (new_height - screen_height) // 2)
        image = image.subsurface(pygame.Rect(crop_x, crop_y, screen_width, screen_height))

    # Case 1: If height exceeds screen height, scale to cover height
    elif image_height > screen_height:
        scale_factor = screen_height / image_height
        new_width = int(image_width * scale_factor)
        new_height = screen_height
        image = pygame.transform.smoothscale(image, (new_width, new_height))  # Use smoothscale

        # If scaled width exceeds screen width, crop horizontally
        if new_width > screen_width:
            crop_x = (new_width - screen_width) // 2
            image = image.subsurface(pygame.Rect(crop_x, 0, screen_width, screen_height))
    
    # Case 2: If width exceeds screen width, scale to cover width
    elif image_width > screen_width:
        scale_factor = screen_width / image_width
        new_width = screen_width
        new_height = int(image_height * scale_factor)
        image = pygame.transform.smoothscale(image, (new_width, new_height))  # Use smoothscale

        # If scaled height exceeds screen height, crop vertically
        if new_height > screen_height:
            crop_y = (new_height - screen_height) // 2
            image = image.subsurface(pygame.Rect(0, crop_y, screen_width, screen_height))
    
    # Case 4: If image is smaller, keep original size and center it
    else:
        # No scaling needed, just center the image
        pass

    return image


# Function to display images
def show_images():
    while True:
        for image_file in image_files:
            image = load_image(image_file)
            screen.fill((0, 0, 0))  # Black background

            # Get image position to center it
            image_width, image_height = image.get_size()
            x = (screen_width - image_width) // 2
            y = (screen_height - image_height) // 2

            # Display the image
            screen.blit(image, (x, y))
            pygame.display.update()
            
            start_time = time.time()
            while time.time() - start_time < ${interval}:  # Adjust delay as needed
                for event in pygame.event.get():
                    if event.type in (pygame.KEYDOWN, pygame.MOUSEBUTTONDOWN):
                        pygame.quit()
                        return

# Start the slideshow
show_images()

# Quit Pygame
pygame.quit()
    `;

    return pythonScript;
}

// Function to clean up images and generated files
function cleanUp(imagesFolder, pythonScriptPath, exePath, scrPath) {
    try {
        fs.removeSync(imagesFolder); // Remove the 'images' folder
        fs.removeSync(pythonScriptPath); // Remove the Python script
        fs.removeSync(exePath); // Remove the executable
        fs.removeSync(scrPath); // Remove the executable
    } catch (err) {
    }
}


// Function to create the Python script content dynamically
/*function createPythonScript(images, mp3Path, interval) {
    let data = mp3Path === "None" ? "None" : `"${mp3Path.replace(/\\/g, '\\\\')}"`;
    let pythonScript = `
import os
import random
import time
import pygame
import sys  # Import sys for _MEIPASS
from io import BytesIO
from PIL import Image

# Initialize Pygame
pygame.init()

# Initialize Pygame mixer for audio
pygame.mixer.init()

# Set the screen to full-screen mode
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
pygame.display.set_caption("Image Slideshow")

# Set up the path to access bundled images in PyInstaller or fallback to the correct location
base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))

# Adjust to reference the images folder explicitly based on the environment
images_folder = os.path.join(base_path, 'images') if os.path.exists(os.path.join(base_path, 'images')) else '/home/hilifeai/Documents/HRMS/backend/controller/modules/account/images'
audio_folder = os.path.join(base_path, 'audio') if os.path.exists(os.path.join(base_path, 'audio')) else '/home/hilifeai/Documents/HRMS/backend/controller/modules/account/audio'

# List of image files
image_files = [
`;

    // Correctly reference the image paths inside the 'images' folder
    images.forEach((image, index) => {
        pythonScript += `    os.path.join(images_folder, "image${index + 1}${path.extname(image.originalname)}"),\n`;
    });

    pythonScript += `]

# Function to load images into Pygame
def load_image(image_path):
    return pygame.image.load(image_path)

# Function to play the MP3 file
def play_audio(mp3_file_path):
    if not os.path.exists(mp3_file_path):
        print(f"MP3 file not found: {mp3_file_path}")
        pygame.quit()
        return
    pygame.mixer.music.load(mp3_file_path)
    pygame.mixer.music.play(-1, 0.0)  # Loop the audio indefinitely


# Shuffle images to randomize the slideshow
# random.shuffle(image_files)

# Function to display images
def show_images(mp3_file):
    if mp3_file != None:  # Check if an MP3 file is provided
        mp3_file = os.path.join(audio_folder, ${data})
        play_audio(mp3_file)  # Start playing the background music
    while True:
        for image_file in image_files:
            image = load_image(image_file)
            image = pygame.transform.scale(image, (screen.get_width(), screen.get_height()))
            screen.blit(image, (0, 0))
            pygame.display.update()

            start_time = time.time()
            while time.time() - start_time < ${interval}:  # Adjust delay as needed
                for event in pygame.event.get():
                    # Exit on any keyboard or mouse action
                    if event.type in (pygame.KEYDOWN, pygame.MOUSEBUTTONDOWN):
                        pygame.quit()
                        return

# Start the slideshow
show_images(${data})

# Quit Pygame
pygame.quit()
    `;

    return pythonScript;
}*/



