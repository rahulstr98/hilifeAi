import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Button, Card, Grid, CardContent, Container, IconButton,
    CircularProgress, Slider, Select, MenuItem, FormControl, InputLabel,
    Paper, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip,
    Typography, TextField, FormControlLabel, Switch, Badge, DialogContentText
} from '@mui/material';
import { jsPDF } from 'jspdf';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
    CameraAlt as CameraAltIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Adjust as AdjustIcon,
    FilterBAndW as FilterBAndWIcon,
    Image as ImageIcon,
    RotateRight as RotateIcon,
    Crop as CropIcon,
    Flip as FlipIcon,
    PhotoCamera as PhotoCameraIcon,
    InsertDriveFile as InsertDriveFileIcon,
    PictureAsPdf as PdfIcon,
    Image as JpgIcon,
    Collections as PngIcon,
    AutoFixHigh as MagicIcon,
    FlashOn as FlashOnIcon,
    FlashOff as FlashOffIcon,
    Check as CheckIcon,
    CloudUpload as UploadIcon,
    FlipCameraAndroid as FlipCameraIcon
} from '@mui/icons-material';

const DocumentScannerComponent = ({ showCamera, setShowCamera, onSendFile, handleCloseCamera }) => {
    // State variables
    const [image, setImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [filter, setFilter] = useState('none');
    const [rotation, setRotation] = useState(0);
    const [flipHorizontal, setFlipHorizontal] = useState(false);
    const [flipVertical, setFlipVertical] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [openCrop, setOpenCrop] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    // const [showCamera, setShowCamera] = useState(false);
    const [fileName, setFileName] = useState('document');
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [edgeDetection, setEdgeDetection] = useState(false);
    const [autoEnhance, setAutoEnhance] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [cameraFacingMode, setCameraFacingMode] = useState('environment');
    const [mirrorPreview, setMirrorPreview] = useState(false);

    // Refs
    const fileInputRef = useRef(null);
    const cameraVideoRef = useRef(null);
    const cropperRef = useRef(null);
    const canvasRef = useRef(null);

    // Initialize camera
    useEffect(() => {
        if (showCamera) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [showCamera, flashOn, cameraFacingMode]);

    // const startCamera = async () => {
    //     try {
    //         const constraints = {
    //             video: {
    //                 facingMode: cameraFacingMode,
    //                 width: { ideal: 1920 },
    //                 height: { ideal: 1080 }
    //             }
    //         };

    //         if (flashOn && cameraFacingMode === 'environment' && 'torch' in MediaTrackCapabilities.prototype) {
    //             constraints.video.torch = true;
    //         }

    //         const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //         setCameraStream(stream);

    //         if (cameraVideoRef.current) {
    //             cameraVideoRef.current.srcObject = stream;
    //         }

    //         // Set mirror preview only for front camera
    //         setMirrorPreview(cameraFacingMode === 'user');
    //     } catch (err) {
    //         console.error("Camera error:", err);
    //         alert("Camera access failed. Please check permissions.");
    //     }
    // };

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: cameraFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);

            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }

            const track = stream.getVideoTracks()[0];

            // Torch support check and apply only for environment camera
            if (flashOn && cameraFacingMode === 'environment') {
                const capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    await track.applyConstraints({
                        advanced: [{ torch: true }]
                    });
                }
            }

            // Set mirror preview only for front camera
            setMirrorPreview(cameraFacingMode === 'user');

        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access failed. Please check permissions.");
        }
    };



    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            setCameraStream(null);
        }
    };

    const toggleCamera = () => {
        setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setFlashOn(false); // Flash only works with rear camera
    };

    const captureImage = () => {
        if (cameraVideoRef.current) {
            const video = cameraVideoRef.current;
            const canvas = canvasRef.current;

            if (!canvas) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            // Apply mirror effect for front camera when capturing
            if (cameraFacingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Reset transformation
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImages(prev => [...prev, imageData]);

            // Flash effect
            setIsProcessing(true);
            setTimeout(() => setIsProcessing(false), 200);
        }
    };

    const toggleFlash = () => {
        if (cameraFacingMode === 'environment') {
            setFlashOn(!flashOn);
        } else {
            alert("Flash is only available with rear camera");
        }
    };

    const confirmSelection = () => {
        if (capturedImages.length > 0) {
            setImage(capturedImages[capturedImages.length - 1]);
            setShowGallery(false);
            setShowCamera(false);
        }
    };

    const retakePhoto = () => {
        setCapturedImages([]);
        setShowGallery(false);
        setShowCamera(true);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target.result);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            resetAdjustments();
        };
        reader.readAsDataURL(file);
    };

    const resetAdjustments = () => {
        setBrightness(100);
        setContrast(100);
        setFilter('none');
        setRotation(0);
        setFlipHorizontal(false);
        setFlipVertical(false);
        setEdgeDetection(false);
        setAutoEnhance(false);
    };

    const handleCrop = () => {
        if (cropperRef.current) {
            const cropper = cropperRef.current.cropper;
            setImage(cropper.getCroppedCanvas().toDataURL());
            setOpenCrop(false);
        }
    };

    const applyFilters = () => {
        setIsProcessing(true);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = image;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (rotation % 180 === 90) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(
                flipHorizontal ? -1 : 1,
                flipVertical ? -1 : 1
            );

            let filterString = `
        brightness(${brightness}%) 
        contrast(${contrast}%)
        ${filter === 'grayscale' ? 'grayscale(1)' : ''}
        ${filter === 'blackwhite' ? 'contrast(2) grayscale(1) brightness(1.2)' : ''}
      `;

            if (autoEnhance) {
                filterString += ' contrast(1.2) brightness(1.1) saturate(1.1)';
            }

            ctx.filter = filterString;
            ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

            if (edgeDetection) {
                applyEdgeDetection(canvas);
            }

            setProcessedImage(canvas.toDataURL('image/jpeg', 0.9));
            setIsProcessing(false);
        };
    };

    const applyEdgeDetection = (canvas) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(canvas, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }

        tempCtx.putImageData(imageData, 0, 0);

        const ctx = canvas.getContext('2d');
        ctx.filter = 'brightness(1.2) contrast(1.5)';
        ctx.drawImage(tempCanvas, 0, 0);
    };

    const prepareDownload = (format) => {
        setSelectedFormat(format);
        setOpenSaveDialog(true);
    };

    const handleDownload = () => {
        if (!processedImage) return;

        setIsProcessing(true);
        const img = new Image();
        img.src = processedImage;

        img.onload = () => {
            if (selectedFormat === 'pdf') {
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'mm'
                });

                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (img.height * imgWidth) / img.width;

                pdf.addImage(processedImage, 'JPEG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${fileName}.pdf`);
            } else {
                const link = document.createElement('a');
                link.href = processedImage;
                link.download = `${fileName}.${selectedFormat}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            setIsProcessing(false);
            setOpenSaveDialog(false);
        };
    };

    const handleUpload = () => {
        // alert(`File ${fileName}.${selectedFormat} would be uploaded to your server`);
        if (!processedImage) return;

        setIsProcessing(true);
        const img = new Image();
        img.src = processedImage;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            if (selectedFormat === 'pdf') {
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'mm',
                });

                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (img.height * imgWidth) / img.width;

                pdf.addImage(processedImage, 'JPEG', 0, 0, imgWidth, imgHeight);

                const pdfBlob = pdf.output('blob');
                const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

                // Send to parent
                if (onSendFile) {
                    onSendFile(pdfFile);
                }
            } else {
                // For image formats (jpg/png)
                const mimeType = selectedFormat === 'png' ? 'image/png' : 'image/jpeg';
                canvas.toBlob((blob) => {
                    const imageFile = new File([blob], `${fileName}.${selectedFormat}`, { type: mimeType });

                    // Send to parent
                    if (onSendFile) {
                        onSendFile(imageFile);
                    }
                }, mimeType);
            }

            setIsProcessing(false);
            setOpenSaveDialog(false);
            setShowCamera(false);
            handleCloseCamera()
        };
    };

    const rotateImage = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const toggleFlipHorizontal = () => {
        setFlipHorizontal(!flipHorizontal);
    };

    const toggleFlipVertical = () => {
        setFlipVertical(!flipVertical);
    };

    const applyAutoEnhance = () => {
        setAutoEnhance(true);
        setBrightness(110);
        setContrast(120);
    };

    useEffect(() => {
        if (image) {
            applyFilters();
        }
    }, [image, brightness, contrast, filter, rotation, flipHorizontal, flipVertical, edgeDetection, autoEnhance]);

    return (
        <>
            {/* <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        Document Scanner
                    </Typography> */}
            <>
                {/* <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                /> */}

                {!image && !showCamera && !showGallery ? (
                    <>
                        {/* <Button
                                variant="contained"
                                color="primary"
                                onClick={() => fileInputRef.current.click()}
                                startIcon={<InsertDriveFileIcon />}
                                size="large"
                                sx={{ mr: 2 }}
                            >
                                Upload Document
                            </Button> */}
                        {/* <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setShowCamera(true)}
                            startIcon={<PhotoCameraIcon />}
                            size="small"
                        >
                            Scan with Camera
                        </Button> */}

                    </>
                ) : showCamera ? (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{
                            border: '2px solid #eee',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#000',
                            height: '500px'
                        }}>
                            <video
                                ref={cameraVideoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transform: mirrorPreview ? 'scaleX(-1)' : 'none'
                                }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 2,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                borderRadius: 4,
                                p: 1
                            }}>
                                <Tooltip title={flashOn ? "Turn off flash" : "Turn on flash"}>
                                    <IconButton
                                        onClick={toggleFlash}
                                        sx={{
                                            color: flashOn ? 'yellow' : 'white',
                                            opacity: cameraFacingMode === 'user' ? 0.5 : 1
                                        }}
                                        disabled={cameraFacingMode === 'user'}
                                    >
                                        {flashOn ? <FlashOnIcon /> : <FlashOffIcon />}
                                    </IconButton>
                                </Tooltip>

                                <IconButton
                                    onClick={captureImage}
                                    sx={{
                                        backgroundColor: 'white',
                                        width: 56,
                                        height: 56,
                                        '&:hover': { backgroundColor: '#f5f5f5' }
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <CircularProgress size={24} /> : <CameraAltIcon sx={{ color: 'black' }} />}
                                </IconButton>

                                <Tooltip title="Switch Camera">
                                    <IconButton
                                        onClick={toggleCamera}
                                        sx={{
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        <FlipCameraIcon />
                                    </IconButton>
                                </Tooltip>

                                {capturedImages.length > 0 && (
                                    <Button
                                        onClick={() => setShowGallery(true)}
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            minWidth: 'auto',
                                            borderRadius: '50%',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        {capturedImages.length}
                                    </Button>
                                )}
                            </Box>
                            <IconButton
                                onClick={() => {
                                    if (capturedImages.length == 0) {

                                        handleCloseCamera()
                                    } else {

                                        setShowCamera(false)
                                    }
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white'
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                ) : showGallery ? (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Select a Scan ({capturedImages.length})
                        </Typography>
                        <Grid container spacing={2} sx={{ maxHeight: '400px', overflow: 'auto', mb: 2 }}>
                            {capturedImages.map((img, index) => (
                                <Grid item xs={6} md={4} key={index}>
                                    <Box
                                        onClick={() => {
                                            setImage(img);
                                            setShowGallery(false);
                                            setShowCamera(false);
                                        }}
                                        sx={{
                                            border: '2px solid',
                                            borderColor: image === img ? 'primary.main' : 'divider',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Scan ${index + 1}`}
                                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        />
                                        <Typography variant="caption" sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            textAlign: 'center',
                                            p: 0.5
                                        }}>
                                            Page {index + 1}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={retakePhoto}
                            >
                                Retake All
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={confirmSelection}
                                startIcon={<CheckIcon />}
                            >
                                Use Selected
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 3,
                                border: '1px solid #eee',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative',
                                minHeight: '300px',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <img
                                    src={processedImage || image}
                                    alt="Processed document"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain'
                                    }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 16,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 1,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: 4,
                                    p: 1
                                }}>
                                    <Tooltip title="Rotate 90°">
                                        <IconButton onClick={rotateImage} sx={{ color: 'white' }}>
                                            <RotateIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Crop">
                                        <IconButton onClick={() => setOpenCrop(true)} sx={{ color: 'white' }}>
                                            <CropIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Flip Horizontal">
                                        <IconButton onClick={toggleFlipHorizontal} sx={{ color: 'white' }}>
                                            <FlipIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Flip Vertical">
                                        <IconButton onClick={toggleFlipVertical} sx={{ color: 'white' }}>
                                            <FlipIcon sx={{ transform: 'scaleY(-1)' }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Auto Enhance">
                                        <IconButton onClick={applyAutoEnhance} sx={{ color: 'white' }}>
                                            <MagicIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Image Adjustments
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography gutterBottom>Brightness: {brightness}%</Typography>
                                            <Slider
                                                value={brightness}
                                                onChange={(e, newValue) => setBrightness(newValue)}
                                                min={50}
                                                max={150}
                                                step={1}
                                                valueLabelDisplay="auto"
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography gutterBottom>Contrast: {contrast}%</Typography>
                                            <Slider
                                                value={contrast}
                                                onChange={(e, newValue) => setContrast(newValue)}
                                                min={50}
                                                max={150}
                                                step={1}
                                                valueLabelDisplay="auto"
                                            />
                                        </Box>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={autoEnhance}
                                                    onChange={(e) => setAutoEnhance(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Auto Enhance"
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Document Mode
                                        </Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Document Mode</InputLabel>
                                            <Select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                label="Document Mode"
                                            >
                                                <MenuItem value="none">
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <ImageIcon sx={{ mr: 1 }} /> Original Color
                                                    </Box>
                                                </MenuItem>
                                                <MenuItem value="grayscale">
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <FilterBAndWIcon sx={{ mr: 1 }} /> Grayscale
                                                    </Box>
                                                </MenuItem>
                                                <MenuItem value="blackwhite">
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <AdjustIcon sx={{ mr: 1 }} /> Black & White
                                                    </Box>
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={edgeDetection}
                                                    onChange={(e) => setEdgeDetection(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Edge Detection"
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                        setImage(null);
                                        // handleCloseCamera();
                                        setShowCamera(true);
                                        setCapturedImages([]);
                                    }}
                                    startIcon={<CloseIcon />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => prepareDownload('pdf')}
                                    disabled={isProcessing}
                                    startIcon={<PdfIcon />}
                                >
                                    Save as PDF
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => prepareDownload('jpg')}
                                    disabled={isProcessing}
                                    startIcon={<JpgIcon />}
                                >
                                    Save as JPG
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => prepareDownload('png')}
                                    disabled={isProcessing}
                                    startIcon={<PngIcon />}
                                    sx={{ backgroundColor: '#ff5252', '&:hover': { backgroundColor: '#ff0000' } }}
                                >
                                    Save as PNG
                                </Button>
                            </Box>
                        </Paper>
                    </>
                )}
            </>
            {/* </CardContent>
            </Card> */}

            {/* Crop Dialog */}
            <Dialog open={openCrop} onClose={() => setOpenCrop(false)} maxWidth="md" fullWidth>
                <DialogTitle>Crop Document</DialogTitle>
                <DialogContent dividers>
                    <Cropper
                        src={image}
                        style={{ height: 400, width: '100%' }}
                        aspectRatio={NaN}
                        guides={true}
                        ref={cropperRef}
                        viewMode={1}
                        autoCropArea={1}
                        background={false}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCrop(false)}>Cancel</Button>
                    <Button onClick={handleCrop} color="primary">Apply Crop</Button>
                </DialogActions>
            </Dialog>

            {/* Save Dialog */}
            <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
                <DialogTitle>Save Document</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Choose options for your {selectedFormat.toUpperCase()} file:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Filename"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {selectedFormat === 'pdf' && <PdfIcon color="primary" sx={{ mr: 1 }} />}
                        {selectedFormat === 'jpg' && <JpgIcon color="secondary" sx={{ mr: 1 }} />}
                        {selectedFormat === 'png' && <PngIcon color="error" sx={{ mr: 1 }} />}
                        <Typography variant="body2" color="text.secondary">
                            File will be saved as {fileName}.{selectedFormat}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleDownload}
                        color="primary"
                        startIcon={<DownloadIcon />}
                    >
                        Download
                    </Button>
                    <Button
                        onClick={handleUpload}
                        color="secondary"
                        startIcon={<UploadIcon />}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
            {/* </Container> */}
        </>
    );
};

export default DocumentScannerComponent;
