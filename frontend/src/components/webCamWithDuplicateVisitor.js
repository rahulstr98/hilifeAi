import React, { useCallback, useContext, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Dialog, Grid, Typography } from '@mui/material';
import axios from '../axiosInstance';
import * as faceapi from 'face-api.js';
import 'jspdf-autotable';
import MessageAlert from './MessageAlert';
import { AuthContext, UserRoleAccessContext } from '../context/Appcontext';
import { SERVICE } from '../services/Baseservice';
import { userStyle } from '../pageStyle';
import ExistingProfileVisitor from '../pages/interactors/visitors/ExistingProfileVisitorWebCam';
import LoadingButton from '@mui/lab/LoadingButton';
function WebCamWithDuplicateVisitor({
  getImg,
  setGetImg,
  valNum,
  setValNum,
  capturedImages,
  setCapturedImages,
  name,

getImgedit,
  setGetImgedit,
  valNumedit,
  setValNumedit,
  capturedImagesedit,
  setCapturedImagesedit,
  setVendor,
  vendor,
  fromEmployee,
  handleCloseModEdit,
  webcamCloseedit,
  setNewimage,
  overallsettings
}) {
  const resizeImageKeepFormat = (base64, targetWidth, targetHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const width = targetWidth || img.width;
      const height = targetHeight || img.height;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const scale = Math.min(width / img.width, height / img.height);
      const x = width / 2 - (img.width * scale) / 2;
      const y = height / 2 - (img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // keep original mime type
      const mimeType = base64.substring(
        base64.indexOf(":") + 1,
        base64.indexOf(";")
      );

      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, mimeType);
    };
    img.onerror = () => reject(new Error("Invalid image file"));
    img.src = base64;
  });
};
  const { auth } = useContext(AuthContext);
  const { buttonStyles } = useContext(UserRoleAccessContext);

  const webcamRef = useRef(null);
  const [isFlip, setIsFlip] = useState(false);
  const videoConstraints = {
    // width: 1280,
    // height: 720,
    // facingMode: { exact: "facing-Out" }
    facingMode: isFlip ? { exact: 'environment' } : 'user',
  };

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };

  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState([]);
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };
  const handleCloseerrpopCopy = (e) => {
    setIsErrorOpenpop(false);
    handleCloseModEdit(e);
    // webcamCloseedit();
  };

  const [uploadwithDupImage, setUploadwithDupImage] = useState([]);
  const [faceDeseptorDup, setFaceDeseptorDup] = useState([]);

  // Image Upload
  const [btnUpload, setBtnUpload] = useState(false);
  const capture = useCallback(() => {
  setBtnUpload(true);
  const imageSrc = webcamRef.current.getScreenshot();

  const image = new Image();
  image.src = imageSrc;

  image.onload = async () => {
    try {
      // ✅ Resize if settings available
      let finalBase64 = imageSrc;
      if (overallsettings?.dimensionswidth || overallsettings?.height) {
        finalBase64 = await resizeImageKeepFormat(
          imageSrc,
          overallsettings?.dimensionswidth || image.width,
          overallsettings?.height || image.height
        );
      }

      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        const faceDescriptor = detections[0].descriptor;

        const response = await axios.post(
          `${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            faceDescriptor: Array.from(faceDescriptor),
          }
        );

        if (response?.data?.matchfound) {
          setUploadwithDupImage(finalBase64);
          setFaceDeseptorDup(faceDescriptor);
          setShowAlertpop(response?.data?.matchedData);
          handleClickOpenerrpop();
        }

        setGetImg(finalBase64);

        if (Array.isArray(capturedImages)) {
          let newSelectedFiles = [...capturedImages];
          newSelectedFiles.push({
            name: `capture.img (${valNum})`,
            size: "",
            type: "image/jpeg",
            preview: finalBase64,
            base64: finalBase64.split(",")[1],
          });
          setValNum(valNum + 1);
          setCapturedImages(newSelectedFiles);
          setVendor({
            ...vendor,
            faceDescriptor: Array.from(faceDescriptor),
          });
        }

        setBtnUpload(false);
      } else {
        setPopupContentMalert("No face detected.");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
        setBtnUpload(false);
      }
    } catch (error) {
      setPopupContentMalert("Error in face detection.");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } finally {
      setBtnUpload(false);
    }
  };

  image.onerror = () => {
    setPopupContentMalert("Error loading image.");
    setPopupSeverityMalert("info");
    handleClickOpenPopupMalert();
    setBtnUpload(false);
  };
}, [webcamRef, capturedImages, valNum, vendor]);

  // const capture = useCallback(() => {
  //   setBtnUpload(true);
  //   const imageSrc = webcamRef.current.getScreenshot();
  //   const image = new Image();
  //   image.src = imageSrc;

  //   const newImage = [];
  //   newImage.push({
  //     name: `capture.img (${valNum})`,
  //     size: '',
  //     type: 'image/jpeg',
  //     preview: imageSrc,
  //     base64: imageSrc?.split(',')[1],
  //   });

  //   setNewimage(newImage);

  //   image.onload = async () => {
  //     try {
  //       const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

  //       if (detections.length > 0) {
  //         const faceDescriptor = detections[0].descriptor;

  //         const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`, {
  //           headers: {
  //             Authorization: `Bearer ${auth.APIToken}`,
  //           },
  //           faceDescriptor: Array.from(faceDescriptor),
  //         });

  //         if (response?.data?.matchfound) {
  //           // setIsLoading(false);
  //           setUploadwithDupImage(imageSrc);
  //           setFaceDeseptorDup(faceDescriptor);
  //           setShowAlertpop(response?.data?.matchedData);
  //           handleClickOpenerrpop();
  //         }
  //         //  else {
  //         setGetImg(imageSrc);

  //         if (Array.isArray(capturedImages)) {
  //           let newSelectedFiles = [...capturedImages];
  //           newSelectedFiles.push({
  //             name: `capture.img (${valNum})`,
  //             size: '',
  //             type: 'image/jpeg',
  //             preview: imageSrc,
  //             base64: imageSrc?.split(',')[1],
  //           });
  //           setValNum(valNum + 1);
  //           setCapturedImages(newSelectedFiles);
  //           setVendor({
  //             ...vendor,
  //             faceDescriptor: Array.from(faceDescriptor),
  //           });

  //           setBtnUpload(false);
  //           setBtnUpload(false);
  //         }
  //         // }
  //       } else {
  //         setPopupContentMalert('No face detected.');
  //         setPopupSeverityMalert('info');
  //         handleClickOpenPopupMalert();
  //         setBtnUpload(false);
  //       }
  //     } catch (error) {
  //       setPopupContentMalert('Error in face detection.');
  //       setPopupSeverityMalert('info');
  //       handleClickOpenPopupMalert();
  //     } finally {
  //       setBtnUpload(false); // Disable loader when done
  //     }
  //   };

  //   image.onerror = (err) => {
  //     setPopupContentMalert('Error loading image.');
  //     setPopupSeverityMalert('info');
  //     handleClickOpenPopupMalert();
  //     setBtnUpload(false); // Disable loader in case of error
  //   };
  // }, [webcamRef, capturedImages, valNum]);

  const captureedit = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setGetImgedit(imageSrc);

    if (Array.isArray(capturedImagesedit)) {
      let newSelectedFiles = [...capturedImagesedit];
      newSelectedFiles.push({
        name: `capture.img (${valNumedit})`,
        size: '',
        type: 'image/jpeg',
        preview: imageSrc,
        base64: imageSrc?.split(',')[1],
      });
      setValNumedit(valNumedit + 1);
      setCapturedImagesedit(newSelectedFiles);
    } else {
    }
  }, [webcamRef, capturedImagesedit, setValNumedit]);

  const retake = useCallback(() => {
    setGetImg(null);
    setCapturedImages([]);
  }, [webcamRef]);

  const retakeedit = useCallback(() => {
    setGetImgedit(null);
    setCapturedImagesedit([]);
  }, [webcamRef]);

  const UploadWithDuplicate = (imageSrc, faceCal) => {
    setGetImg(imageSrc);

    setVendor({
      ...vendor,
      faceDescriptor: Array.from(faceCal),
    });
    if (Array.isArray(capturedImages)) {
      let newSelectedFiles = [...capturedImages];
      newSelectedFiles.push({
        name: `capture.img (${valNum})`,
        size: '',
        type: 'image/jpeg',
        preview: imageSrc,
        base64: imageSrc?.split(',')[1],
      });
      setValNum(valNum + 1);
      setCapturedImages(newSelectedFiles);

      handleCloseerrpop();
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 'sm' }}>
        <Typography
          sx={{
            '@media only screen and (minWidth: 500px)': {
              fontSize: '15px',

              // padding: '1px',
            },
          }}
        >
          <b>Web camera capture image!</b>
        </Typography>
        <br />
        <Grid container>
          <Grid item lg={6} md={6} sm={12} xs={12} sx={{ justifyContent: 'center', textAlign: 'center' }}>
            <Webcam audio={false} height={200} ref={webcamRef} screenshotFormat="image/jpeg" width={500} videoConstraints={videoConstraints} />
          </Grid>
        </Grid>

        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
          {name == 'edit' && (
            <LoadingButton
              variant="contained"
              loading={btnUpload}
              onClick={() => {
                captureedit();
              }}
            >
              Capture
            </LoadingButton>
          )}
          {name == 'create' && (
            <LoadingButton
              onClick={() => {
                capture();
              }}
              variant="contained"
              loading={btnUpload}
            >
              Capture
            </LoadingButton>
          )}
          {name == 'edit' && (
            <Button
              variant="contained"
              onClick={() => {
                retakeedit();
              }}
            >
              Retake
            </Button>
          )}
          {name == 'create' && (
            <Button
              variant="contained"
              onClick={() => {
                retake();
              }}
            >
              Retake
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => {
              setIsFlip(!isFlip);
            }}
          >
            Flip
          </Button>
        </Grid>
        <br />
        <Box>
          {name == 'edit' && <img src={getImgedit} id="productimage" width="100" height="100" />}
          {name == 'create' && <img src={getImg} id="productimage" width="100" height="100" />}
        </Box>
        {/* ALERT DIALOG */}
        <Box>
          {/* Edit DIALOG */}
          <Dialog
            open={isErrorOpenpop}
            onClose={(event, reason) => {
              if (reason === 'backdropClick') {
                // Ignore backdrop clicks
                return;
              }
              handleCloseerrpop(); // Handle other close actions
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="lg"
            fullWidth={true}
            sx={{ marginTop: '80px' }}
          >
            <Box sx={userStyle.dialogbox}>
              <>
                <Typography sx={userStyle.HeaderText}>
                  {' '}
                  <b>Existing Profile List</b>
                </Typography>
                <Grid item md={6} sm={12} xs={12}>
                  {showAlertpop && showAlertpop.length > 0 ? (
                    <ExistingProfileVisitor ExistingProfileVisitors={showAlertpop} handleCloseerrpopCopy={handleCloseerrpopCopy} />
                  ) : (
                    <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: 'flex', justifyContent: 'center' }}>There is No Profile</Typography>
                  )}
                </Grid>
                <br />
                <Grid item md={12} sm={12} xs={12}>
                  <Grid
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '15px',
                    }}
                  >
                    {/* <Tooltip
                                            title={
                                                (showAlertpop?.some(data => data?.modelName === "Employee") && fromEmployee)
                                                    ? "Cannot upload duplicate images for Employee."
                                                    : ""
                                            }
                                            placement="top"
                                            arrow
                                        >
                                            <span>
                                                <Button
                                                    style={{
                                                        padding: "7px 13px",
                                                        color: "white",
                                                        background: "rgb(25, 118, 210)",
                                                        ...buttonStyles?.buttonsubmit,
                                                    }}
                                                    disabled={showAlertpop?.some(data => data?.modelName === "Employee") && fromEmployee}
                                                    onClick={() => {
                                                        UploadWithDuplicate(uploadwithDupImage, faceDeseptorDup)
                                                    }}
                                                >
                                                    Upload With Duplicate
                                                </Button>
                                            </span>
                                        </Tooltip> */}
                    <Button
                      sx={buttonStyles.btncancel}
                      onClick={() => {
                        handleCloseerrpop();
                        setCapturedImages([]);
                        setGetImg(null);
                        // setGetImgedit(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </>
            </Box>
          </Dialog>
        </Box>
        <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      </Box>
    </>
  );
}

export default WebCamWithDuplicateVisitor;
