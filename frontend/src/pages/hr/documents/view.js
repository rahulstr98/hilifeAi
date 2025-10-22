import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, OutlinedInput, FormControl, Grid, Button } from '@mui/material';
import { userStyle } from '../../../pageStyle';
import { SERVICE } from '../../../services/Baseservice';
import axios from '../../../axiosInstance';
import { UserRoleAccessContext } from '../../../context/Appcontext';
import { BASE_URL } from '../../../services/Authservice';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { AuthContext } from '../../../context/Appcontext';
import Headtitle from '../../../components/Headtitle';
import 'jspdf-autotable';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { handleApiError } from '../../../components/Errorhandling';
import { useNavigate, useParams } from 'react-router-dom';
import AlertDialog from '../../../components/Alert';
import MessageAlert from '../../../components/MessageAlert';
function ViewDocument() {
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    // setSubmitLoader(false);
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };

  const [fieldsShow, setFieldsShow] = useState(false);
  const [uploadShow, setUploadShow] = useState(false);
  const [textShow, setTextShow] = useState(false);
  const [documentFiles, setdocumentFiles] = useState([]);
  const [TextEditor, setTextEditor] = useState('');
  const backPage = useNavigate();
  const { isUserRoleCompare, isUserRoleAccess, listPageAccessMode, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [singleDocument, setSingleDocument] = useState({});
  const [textAreas, setTextAreas] = useState([]);
  let ids = useParams().id;
  let origin = useParams().origin;

  const renderFilePreview = async (file) => {
    const { path } = file;
    if (path) {
      const url = `${BASE_URL}/${path}`; // Construct the URL based on your server setup
      window.open(url, '_blank');
    } else {
      const pdfBlobUrl = URL.createObjectURL(file);
      window.open(pdfBlobUrl, '_blank');
    }
  };

  const getinfoCode = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.DOCUMENT_SINGLE}/${ids}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSingleDocument(res?.data?.sdocument);
      setTextEditor(res?.data?.sdocument?.documentstext);
      const answer = res?.data?.sdocument?.documentstext?.join('');
      setTextAreas(answer);
      setdocumentFiles(res?.data?.sdocument?.document);
      if (res?.data?.sdocument?.type !== 'Quickclaim Document') {
        setFieldsShow(true);
      } else {
        setFieldsShow(false);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    getinfoCode();
  }, [ids]);

  useEffect(() => {
    if (textAreas.length > 0) {
      setUploadShow(false);
    } else {
      setUploadShow(true);
    }
    if (documentFiles.length !== 0) {
      setTextShow(false);
    } else if (documentFiles.length === 0) {
      setTextShow(true);
    }
    if (fieldsShow) {
      setSingleDocument({ ...singleDocument, customer: '', queue: '', process: '', form: '' });
    }
  }, [TextEditor, documentFiles, fieldsShow, textAreas]);

  return (
    <Box>
      <Box sx={userStyle.container}>
        <Headtitle title={'View Document'} />
        <Grid container spacing={2}>
          <Grid item md={12} sm={12} xs={12}>
            <Typography sx={userStyle.HeaderText}>View Document</Typography>
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <FormControl fullWidth size="small">
              <Typography>Category Name </Typography>
              <OutlinedInput readOnly id="component-outlined" value={singleDocument?.categoryname} />
            </FormControl>
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <FormControl fullWidth size="small">
              <Typography>Sub Category Name </Typography>
              <OutlinedInput readOnly id="component-outlined" value={singleDocument?.subcategoryname} />
            </FormControl>
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <FormControl fullWidth size="small">
              <Typography>Type</Typography>
              <OutlinedInput readOnly id="component-outlined" value={singleDocument?.type} />
            </FormControl>
          </Grid>
          <Grid item md={3} sm={12} xs={12}>
            <FormControl fullWidth size="small">
              <Typography>Module</Typography>
              <OutlinedInput readOnly id="component-outlined" value={singleDocument.module} />
            </FormControl>
          </Grid>
          {/* next grdi */}

          {!fieldsShow ? (
            <>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Customer</Typography>
                  <OutlinedInput readOnly id="component-outlined" value={singleDocument.customer} />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography> Queue</Typography>
                  <OutlinedInput readOnly id="component-outlined" value={singleDocument.queue} />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Process</Typography>
                  <OutlinedInput readOnly id="component-outlined" value={singleDocument.process} />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Form</Typography>
                  <OutlinedInput readOnly id="component-outlined" type="text" value={singleDocument.form} />
                </FormControl>
              </Grid>
            </>
          ) : null}

          {textShow ? (
            <>
              <Grid item md={12} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    <b> Documents </b>
                  </Typography>
                  <ReactQuill
                    readOnly
                    style={{ height: '180px' }}
                    value={textAreas}
                    modules={{
                      toolbar: [[{ header: '1' }, { header: '2' }, { font: [] }], [{ size: [] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }], ['link', 'image', 'video'], ['clean']],
                    }}
                    formats={['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image', 'video']}
                  />
                </FormControl>
              </Grid>
            </>
          ) : null}
          {uploadShow ? (
            <>
              <Grid item md={12} sm={12} xs={12}>
                <br /> <br /> <br /> <br />
                <Typography variant="h6">Upload Document</Typography>
                <Grid item md={6} sm={6} xs={12}>
                  {documentFiles?.length > 0 &&
                    documentFiles.map((file, index) => (
                      <>
                        <Grid container spacing={1}>
                          <Grid item md={10} sm={10} xs={10}>
                            <Typography>{file.name}</Typography>
                          </Grid>
                          <Grid item md={2} sm={2} xs={2}>
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} style={{ fontsize: 'large', color: '#357AE8', cursor: 'pointer' }} onClick={() => renderFilePreview(file)} />
                          </Grid>
                        </Grid>
                      </>
                    ))}
                </Grid>
              </Grid>
            </>
          ) : null}

          <Grid item md={12} sm={12} xs={12}>
            <br />
            <br />
            <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
              {origin === 'overalldocumentlist' ? (
                <>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={() => {
                      backPage('/overalllistdocument');
                    }}
                  >
                    Back
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    sx={buttonStyles.btncancel}
                    variant="contained"
                    onClick={() => {
                      backPage('/listdocument');
                    }}
                  >
                    {' '}
                    Back
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
    </Box>
  );
}
export default ViewDocument;
