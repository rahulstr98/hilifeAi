import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box, Typography, OutlinedInput, Select, Collapse,
  Divider, MenuItem, Paper, Dialog, InputLabel, TextareaAutosize, DialogContent, DialogActions, FormControl, Grid, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton
} from '@mui/material';
import { userStyle } from '../../../pageStyle';
import StyledDataGrid from '../../../components/TableStyle';
import { handleApiError } from '../../../components/Errorhandling';
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from 'react-icons/fa';
import 'jspdf-autotable';
import { AUTH, BASE_URL } from '../../../services/Authservice';
import AddIcon from "@mui/icons-material/Add";

// import axios from '../../../axiosInstance';
import axios from 'axios';
import { SERVICE } from '../../../services/Baseservice';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserRoleAccessContext, AuthContext } from '../../../context/Appcontext';
import Headtitle from '../../../components/Headtitle';
import { ThreeDots } from 'react-loader-spinner';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { saveAs } from 'file-saver';
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import LoadingButton from '@mui/lab/LoadingButton';
import ExportData from '../../../components/ExportData';
import AlertDialog from '../../../components/Alert';
import MessageAlert from '../../../components/MessageAlert';
import InfoPopup from '../../../components/InfoPopup.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../../components/DeleteConfirmation.js';
import PageHeading from '../../../components/PageHeading';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ReactDOMServer from "react-dom/server";
import ReactQuill from "react-quill";
import { v4 as uuidv4 } from "uuid";
// import { htmlToDelta } from "quilljs-parser";

const HeadingEditor = ({ headings, setHeadings, previewHtml, setPreviewHtml, numberingStyle, setNumberingStyle }) => {
  const [expanded, setExpanded] = useState({});


  // Update preview HTML if parent provided setter
  useEffect(() => {
    if (typeof setPreviewHtml === "function") {
      setPreviewHtml(renderPreview());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings, numberingStyle]);

  // ---------- Numbering helpers ----------
  const toRoman = (num) => {
    if (typeof num !== "number" || num <= 0) return num;
    const map = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let result = "";
    for (const [value, symbol] of map) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  };

  const toRomanLower = (num) => toRoman(num).toLowerCase();

  const toAlpha = (num) => String.fromCharCode(65 + num - 1);
  const toAlphaLower = (num) => String.fromCharCode(97 + num - 1);

  const formatIndex = (index) => {
    // index is zero-based
    switch (numberingStyle) {
      case "roman":
        return toRoman(index + 1);
      case "roman-lower":
        return toRomanLower(index + 1);
      case "alpha":
        return toAlpha(index + 1);
      case "alpha-lower":
        return toAlphaLower(index + 1);
      default:
        return String(index + 1);
    }
  };

  const getFormattedNumber = (i, j, k) => {
    if (k !== undefined) return `${formatIndex(i)}.${formatIndex(j)}.${formatIndex(k)}`;
    if (j !== undefined) return `${formatIndex(i)}.${formatIndex(j)}`;
    return `${formatIndex(i)}`;
  };

  // ---------- Expand/collapse ----------
  const toggleExpand = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // ---------- CRUD + INSERT functions ----------
  const addHeading = () => {
    setHeadings([
      ...headings,
      { id: uuidv4(), title: "", description: "", subHeadings: [] },
    ]);
  };

  const insertHeadingAt = (index) => {
    const newHeading = { id: uuidv4(), title: "", description: "", subHeadings: [] };
    const updated = [...headings];
    updated.splice(index, 0, newHeading);
    setHeadings(updated);
  };

  const deleteHeading = (index) => {
    setHeadings(headings.filter((_, i) => i !== index));
  };

  const updateHeading = (index, field, value) => {
    const updated = [...headings];
    updated[index][field] = value;
    setHeadings(updated);
  };

  const addSubHeading = (mainIndex) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings.push({
      id: uuidv4(),
      title: "",
      description: "",
      subSubHeadings: [],
    });
    setHeadings(updated);
    // expand the parent to show the new subheading
    setExpanded((p) => ({ ...p, [`main-${mainIndex}`]: true }));
  };

  const insertSubHeadingAt = (mainIndex, insertIndex) => {
    const updated = [...headings];
    const newSub = { id: uuidv4(), title: "", description: "", subSubHeadings: [] };
    updated[mainIndex].subHeadings.splice(insertIndex, 0, newSub);
    setHeadings(updated);
    setExpanded((p) => ({ ...p, [`main-${mainIndex}`]: true }));
  };

  const deleteSubHeading = (mainIndex, subIndex) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings = updated[mainIndex].subHeadings.filter((_, j) => j !== subIndex);
    setHeadings(updated);
  };

  const updateSubHeading = (mainIndex, subIndex, field, value) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings[subIndex][field] = value;
    setHeadings(updated);
  };

  const addSubSubHeading = (mainIndex, subIndex) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings[subIndex].subSubHeadings.push({
      id: uuidv4(),
      title: "",
      description: "",
    });
    setHeadings(updated);
    // expand parent subheading
    setExpanded((p) => ({ ...p, [`sub-${mainIndex}-${subIndex}`]: true }));
  };

  const insertSubSubHeadingAt = (mainIndex, subIndex, insertIndex) => {
    const updated = [...headings];
    const newSubSub = { id: uuidv4(), title: "", description: "" };
    updated[mainIndex].subHeadings[subIndex].subSubHeadings.splice(insertIndex, 0, newSubSub);
    setHeadings(updated);
    setExpanded((p) => ({ ...p, [`sub-${mainIndex}-${subIndex}`]: true }));
  };

  const deleteSubSubHeading = (mainIndex, subIndex, subSubIndex) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings[subIndex].subSubHeadings =
      updated[mainIndex].subHeadings[subIndex].subSubHeadings.filter((_, k) => k !== subSubIndex);
    setHeadings(updated);
  };

  const updateSubSubHeading = (mainIndex, subIndex, subSubIndex, field, value) => {
    const updated = [...headings];
    updated[mainIndex].subHeadings[subIndex].subSubHeadings[subSubIndex][field] = value;
    setHeadings(updated);
  };

  // ---------- HTML preview generator (string) ----------
  const renderPreview = () => {
    let html = '<div style="font-family: Arial, sans-serif;">';

    headings.forEach((h, i) => {
      // 🟩 Main Heading
      html += `
      <p>
        <strong style="font-size:1.1rem;">
          ${getFormattedNumber(i)} ${h.title || "Main Heading"}
        </strong>
      </p>
    `;
      if (h.description)
        html += `<p style="font-size:0.9rem;">${h.description}</p>`;

      // 🟨 SubHeading (indent level 1)
      h.subHeadings?.forEach((sh, j) => {
        html += `
        <p class="ql-indent-1">
          <strong style="font-size:1.05rem;">
            ${getFormattedNumber(i, j)} ${sh.title || "SubHeading"}
          </strong>
        </p>
      `;
        if (sh.description)
          html += `<p class="ql-indent-1" style="font-size:0.9rem;">${sh.description}</p>`;

        // 🟦 SubSubHeading (indent level 2)
        sh.subSubHeadings?.forEach((ssh, k) => {
          html += `
          <p class="ql-indent-2" style="font-size:0.9rem;font-weight:500;">
            ${getFormattedNumber(i, j, k)} ${ssh.title || "SubSubHeading"}
          </p>
        `;
          if (ssh.description)
            html += `<p class="ql-indent-2" style="font-size:0.9rem;">${ssh.description}</p>`;
        });
      });
    });

    html += "</div>";
    return html;
  };


  // ---------- React preview renderer ----------
  const renderPreviewhtml = () => (
    <Box>
      {headings.map((h, i) => (
        <Box key={h.id || i} mb={2}>
          <Typography variant="h6">
            {getFormattedNumber(i)}. {h.title || "Main Heading"}
          </Typography>
          {h.description && <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>{h.description}</Typography>}

          {h.subHeadings?.map((sh, j) => (
            <Box key={sh.id || j} ml={4} mb={1}>
              <Typography variant="subtitle1">
                {getFormattedNumber(i, j)}. {sh.title || "SubHeading"}
              </Typography>
              {sh.description && <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>{sh.description}</Typography>}

              {sh.subSubHeadings?.map((ssh, k) => (
                <Box key={ssh.id || k} ml={6} mb={1}>
                  <Typography variant="body2" fontWeight="bold">
                    {getFormattedNumber(i, j, k)}. {ssh.title || "SubSubHeading"}
                  </Typography>
                  {ssh.description && <Typography variant="body2" sx={{ ml: 2 }}>{ssh.description}</Typography>}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );

  // ---------- UI ----------
  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Document Builder</Typography>

      {/* Numbering style */}
      <FormControl sx={{ minWidth: 300, mb: 3 }}>
        <InputLabel>Numbering Style</InputLabel>
        <Select value={numberingStyle} label="Numbering Style" onChange={(e) => setNumberingStyle(e.target.value)}>
          <MenuItem value="number">1, 1.1, 1.1.1</MenuItem>
          <MenuItem value="roman">I, I.I, I.I.I</MenuItem>
          <MenuItem value="roman-lower">i, i.i, i.i.i</MenuItem>
          <MenuItem value="alpha">A, A.A, A.A.A</MenuItem>
          <MenuItem value="alpha-lower">a, a.a, a.a.a</MenuItem>
        </Select>
      </FormControl>

      {/* Main headings */}
      {headings.map((heading, i) => {
        const mainPath = `main-${i}`;
        const isMainExpanded = !!expanded[mainPath];

        return (
          <Paper key={heading.id || i} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={10} sm={9}>
                <Box display="flex" alignItems="center" gap={1}>
                  {/* Expand icon */}
                  <IconButton
                    size="small"
                    onClick={() => toggleExpand(mainPath)}
                    aria-label={isMainExpanded ? "Collapse main" : "Expand main"}
                    sx={{
                      transform: isMainExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms",
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>

                  {/* Title text - collapsed view shows only title */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {getFormattedNumber(i)}. {heading.title || "Main Heading"}
                  </Typography>
                </Box>
              </Grid>

              {/* Insert + Delete inline */}
              <Grid item xs={2} sm={3} textAlign="right">
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button size="small" variant="outlined" onClick={() => insertHeadingAt(i + 1)}>
                    Insert Below
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => deleteHeading(i)}>
                    Delete
                  </Button>
                </Box>
              </Grid>

              {/* Collapsible body (title input + description + controls + subitems) */}
              <Grid item xs={12}>
                <Collapse in={isMainExpanded}>
                  <Box mt={1} mb={1}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Main Heading Title" value={heading.title} onChange={(e) => updateHeading(i, "title", e.target.value)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {/* <TextField fullWidth
                          ="Short Description (optional)"
                          value={heading.description}
                          onChange={(e) => updateHeading(i, "description", e.target.value)}
                        /> */}

                        <TextareaAutosize
                          minRows={3}
                          placeholder="Enter description..."
                          value={heading.description}
                          onChange={(e) => updateHeading(i, "description", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            fontSize: "0.9rem",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            marginBottom: "12px",
                            resize: "vertical",
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box display="flex" gap={1} mt={1}>
                          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => insertHeadingAt(i + 1)}>Insert Below</Button>
                          <Button size="small" variant="contained"
                            color="secondary" startIcon={<AddIcon />} onClick={() => addSubHeading(i)}>Add SubHeading</Button>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* SubHeadings list (collapsible each) */}
                    {heading.subHeadings?.map((sub, j) => {
                      const subPath = `sub-${i}-${j}`;
                      const isSubExpanded = !!expanded[subPath];

                      return (
                        <Paper key={sub.id || j} elevation={0} sx={{ p: 1, mb: 1 }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item xs={10} sm={9}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleExpand(subPath)}
                                  sx={{
                                    transform: isSubExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 200ms",
                                  }}
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                                <Typography variant="body1">
                                  {getFormattedNumber(i, j)}. {sub.title || "SubHeading"}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={2} sm={3} textAlign="right">
                              <Box display="flex" justifyContent="flex-end" gap={1}>
                                <Button size="small" variant="outlined" onClick={() => insertSubHeadingAt(i, j + 1)}>Insert Below</Button>
                                <Button size="small" variant="contained" color="error" onClick={() => deleteSubHeading(i, j)}>Delete</Button>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Collapse in={isSubExpanded}>
                                <Box mt={1}>
                                  <Grid container spacing={1}>
                                    <Grid item xs={12} md={6}>
                                      <TextField fullWidth label="SubHeading Title" value={sub.title} onChange={(e) => updateSubHeading(i, j, "title", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      {/* <TextField fullWidth
                                        label="Short Description (optional)"
                                        value={sub.description}
                                        onChange={(e) => updateSubHeading(i, j, "description", e.target.value)}
                                      /> */}
                                      <TextareaAutosize
                                        minRows={3}
                                        placeholder="Enter description..."
                                        value={sub.description}
                                        onChange={(e) => updateSubHeading(i, j, "description", e.target.value)}
                                        style={{
                                          width: "100%",
                                          padding: "8px",
                                          fontSize: "0.9rem",
                                          borderRadius: "6px",
                                          border: "1px solid #ccc",
                                          marginBottom: "12px",
                                          resize: "vertical",
                                        }}
                                      />
                                    </Grid>

                                    <Grid item xs={12}>
                                      <Box display="flex" gap={1} mt={1}>
                                        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => insertSubHeadingAt(i, j + 1)}>Insert Sub Below</Button>
                                        <Button size="small" variant="outlined"
                                          sx={{ color: "#8B5CF6", borderColor: "#8B5CF6" }} startIcon={<AddIcon />} onClick={() => addSubSubHeading(i, j)}>Add SubSubHeading</Button>
                                      </Box>
                                    </Grid>
                                  </Grid>

                                  {/* SubSubHeadings */}
                                  <Box mt={1}>
                                    {sub.subSubHeadings?.map((ss, k) => {
                                      const subsubPath = `subsub-${i}-${j}-${k}`;
                                      const isSubSubExpanded = !!expanded[subsubPath];

                                      return (
                                        <Paper key={ss.id || k} elevation={0} sx={{ p: 1, mb: 1 }}>
                                          <Grid container alignItems="center" spacing={1}>
                                            <Grid item xs={10} sm={9}>
                                              <Box display="flex" alignItems="center" gap={1}>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => toggleExpand(subsubPath)}
                                                  sx={{
                                                    transform: isSubSubExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 200ms",
                                                  }}
                                                >
                                                  <ExpandMoreIcon />
                                                </IconButton>
                                                <Typography variant="body2">
                                                  {getFormattedNumber(i, j, k)}. {ss.title || "SubSubHeading"}
                                                </Typography>
                                              </Box>
                                            </Grid>

                                            <Grid item xs={2} sm={3} textAlign="right">
                                              <Box display="flex" justifyContent="flex-end" gap={1}>
                                                <Button size="small" variant="outlined" onClick={() => insertSubSubHeadingAt(i, j, k + 1)}>Insert Below</Button>
                                                <Button size="small" variant="contained" color="error" onClick={() => deleteSubSubHeading(i, j, k)}>Delete</Button>
                                              </Box>
                                            </Grid>

                                            <Grid item xs={12}>
                                              <Collapse in={isSubSubExpanded}>
                                                <Box mt={1}>
                                                  <Grid container spacing={1}>
                                                    <Grid item xs={12} md={6}>
                                                      <TextField fullWidth label="SubSubHeading Title" value={ss.title} onChange={(e) => updateSubSubHeading(i, j, k, "title", e.target.value)} />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                      {/* <TextField
                                                        fullWidth
                                                        label="Short Description (optional)"
                                                        value={ss.description}
                                                        onChange={(e) => updateSubSubHeading(i, j, k, "description", e.target.value)}
                                                      /> */}

                                                      <TextareaAutosize
                                                        minRows={3}
                                                        placeholder="Enter description..."
                                                        value={ss.description}
                                                        onChange={(e) => updateSubSubHeading(i, j, k, "description", e.target.value)}
                                                        style={{
                                                          width: "100%",
                                                          padding: "8px",
                                                          fontSize: "0.9rem",
                                                          borderRadius: "6px",
                                                          border: "1px solid #ccc",
                                                          marginBottom: "12px",
                                                          resize: "vertical",
                                                        }}
                                                      />

                                                    </Grid>
                                                  </Grid>
                                                </Box>
                                              </Collapse>
                                            </Grid>
                                          </Grid>
                                        </Paper>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              </Collapse>
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                  </Box>
                </Collapse>
              </Grid>
            </Grid>
          </Paper>
        );
      })}

      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={addHeading}>
        Add Main Heading
      </Button>

      {/* --- PREVIEW --- */}
      {headings?.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Preview</Typography>

          {/* HTML string preview (hidden by default — kept for compatibility) */}
          <Paper sx={{ p: 2, mt: 1, background: "#f9f9f9", display: "none" }} dangerouslySetInnerHTML={{ __html: renderPreview() }} />

          {/* React preview */}
          <Paper sx={{ p: 2, mt: 1, background: "#f9f9f9" }}>
            {renderPreviewhtml()}
          </Paper>
        </Box>
      )}
    </Box>
  );
};





function ManualKeyWordsPreparation() {
  const [serverTime, setServerTime] = useState(new Date());
  const [headings, setHeadings] = useState([]);
  const [numberingstyle, setNumberingStyle] = useState("number");
  const [previewHtml, setPreviewHtml] = useState("");
  const [headingsEdit, setHeadingsEdit] = useState([]);
  const [previewHtmlEdit, setPreviewHtmlEdit] = useState("");
  const [numberingstyleEdit, setNumberingStyleEdit] = useState("number");

  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Get current server time and format it
        const time = await getCurrentServerTime();
        setServerTime(time);
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };

    fetchTime();
  }, []);

  const pathname = window.location.pathname;
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupSeverity, setPopupSeverity] = useState('');
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  let exportColumnNames = ['Name', 'Keyword Name', 'Value'];
  let exportRowValues = ['keywordname', 'value', 'description'];

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Manual KeyWords Preparation'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
        },
      ],
    });
  };

  useEffect(() => {
    getapi();
  }, []);
  const [documentFiles, setdocumentFiles] = useState("");
  const [documentFilesEdit, setdocumentFilesEdit] = useState("");
  const [deleteMulterFileName, setDeleteMulterFileName] = useState("");
  const [manualkeywordspreparation, setManualKeywordsPreparation] = useState({ keywordname: '', value: '', description: '' });
  const [manualkeywordspreparationEdit, setManualKeywordsPreparationEdit] = useState({ keywordname: '', value: '', description: '' });
  const [manualkeywordspreparations, setManualKeywordsPreparations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allManualKeywordsedit, setAllManualKeywordsedit] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [btnLoad, setBtnLoad] = useState(false);
  const [manualkeywordspreparationCheck, setManualKeywordsPreparationcheck] = useState(false);
  const username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [getOverAllCountDelete, setGetOverallCountDelete] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [fileFormat, setFormat] = useState('');

  const handleResumeUpload = (event) => {
    const files = event.target.files[0]; // Convert FileList to an array
    setdocumentFiles(files); // Set the array of files in state
  };
  //Rendering File
  const renderFilePreview = async (file) => {
    const pdfBlobUrl = URL.createObjectURL(file);
    window.open(pdfBlobUrl, '_blank');
  };
  const handleFileDelete = (index) => {
    setdocumentFiles("");
  };

  const handleResumeUploadEdit = (event) => {
    const files = event.target.files[0]; // Convert FileList to an array
    setdocumentFilesEdit(files); // Set the array of files in state
  };
  //Rendering File
  const renderFilePreviewEdit = async (file) => {
    if (file?.filename) {
      const fileUrl = `${BASE_URL}/ManualDocumentPreparation/${file?.filename}`;
      window.open(fileUrl, '_blank');
    } else {
      const pdfBlobUrl = URL.createObjectURL(file);
      window.open(pdfBlobUrl, '_blank');
    }

  };
  const handleFileDeleteEdit = (index) => {
    setdocumentFilesEdit("");
  };

  // console.log(documentFiles, 'documentFiles')
  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };
  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'Manual KeyWords Preparation.png');
        });
      });
    }
  };
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // view model
  const [openview, setOpenview] = useState(false);

  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
  };

  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setBtnLoad(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  //Delete model
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };
  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

  const handleClickOpenalert = () => {
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      // getOverallEditSectionOverallDelete(selectedRows)
      setIsDeleteOpencheckbox(true);
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };

  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

  const handleClickOpencheckbox = () => {
    setIsDeleteOpencheckbox(true);
  };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };

  // Manage Columns
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage('');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    keywordname: true,
    value: true,
    description: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [deleteManualkeywords, setDeleteManualkeywords] = useState('');

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteManualkeywords(res?.data?.smanualkeywordpreparation);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let manualkeywordspreparationsid = deleteManualkeywords?._id;
  const delTaskCategory = async (e) => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${manualkeywordspreparationsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchTaskcategory();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delTaskCatecheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);
      await fetchTaskcategory();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setBtnLoad(true);
    try {
      // let subprojectscreate = await axios.post(SERVICE.CREATE_MANUAL_KEYWORDS_PREPARATION, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      //   keywordname: String(manualkeywordspreparation.keywordname),
      //   value: manualkeywordspreparation.value,
      //   description: String(manualkeywordspreparation.description),
      //   file : documentFiles,
      //   addedby: [
      //     {
      //       name: String(isUserRoleAccess.companyname),
      //     },
      //   ],
      // });


      const formData = new FormData();
      // Append simple fields
      formData.append("keywordname", String(manualkeywordspreparation.keywordname));
      formData.append("value", manualkeywordspreparation.value);
      formData.append("headings", JSON.stringify(headings));
      formData.append("previewdocument", previewHtml);
      formData.append("numberingstyle", numberingstyle);
      formData.append("description", String(manualkeywordspreparation.description));

      if (documentFiles) {
        formData.append("file", documentFiles);
      }
      formData.append(
        "addedby",
        JSON.stringify([
          {
            name: String(isUserRoleAccess.companyname),
          },
        ])
      );

      // Send as multipart/form-data
      let subprojectscreate = await axios.post(
        SERVICE.CREATE_MANUAL_KEYWORDS_PREPARATION,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
            "Content-Type": "multipart/form-data", // Let axios set proper boundaries
          },
        }
      );


      await fetchTaskcategory();
      setManualKeywordsPreparation({ ...manualkeywordspreparation, categoryname: '', description: '' });
      setdocumentFiles("")
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setHeadings([])
      setNumberingStyle("number")
      setPreviewHtml("")
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    const isNameMatch = manualkeywordspreparations.some((item) => item.keywordname.toLowerCase() === manualkeywordspreparation.keywordname.toLowerCase());
    if (manualkeywordspreparation.keywordname === '') {
      setPopupContentMalert('Please Enter keyword Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manualkeywordspreparation.description === '' && (headings?.length === 0 || headings[0]?.title === "")) {
      setPopupContentMalert('Please Enter Value/ Document Format');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (isNameMatch) {
      setPopupContentMalert('Name already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setManualKeywordsPreparation({ keywordname: '', value: '', description: '' });
    setHeadings([])
    setNumberingStyle("number")
    setPreviewHtml("")
    setdocumentFiles("")
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  //check delete model
  const [isCheckOpen, setisCheckOpen] = useState(false);
  const handleClickOpenCheck = () => {
    setisCheckOpen(true);
  };
  const handleCloseCheck = () => {
    setisCheckOpen(false);
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManualKeywordsPreparationEdit(res?.data?.smanualkeywordpreparation);
      setDeleteMulterFileName(res?.data?.smanualkeywordpreparation?.file);
      setdocumentFilesEdit(res?.data?.smanualkeywordpreparation?.file);
      setHeadingsEdit(res?.data?.smanualkeywordpreparation?.headings ?? [])
      setPreviewHtmlEdit(res?.data?.smanualkeywordpreparation?.previewdocument ?? "")
      setNumberingStyleEdit(res?.data?.smanualkeywordpreparation?.numberingstyle ?? "number")
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManualKeywordsPreparationEdit(res?.data?.smanualkeywordpreparation);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManualKeywordsPreparationEdit(res?.data?.smanualkeywordpreparation);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = manualkeywordspreparationEdit?.updatedby;
  let addedby = manualkeywordspreparationEdit?.addedby;
  let subprojectsid = manualkeywordspreparationEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      // let res = await axios.put(`${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${subprojectsid}`, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      //   keywordname: String(manualkeywordspreparationEdit.keywordname),
      //   value: String(manualkeywordspreparationEdit.value),
      //   description: String(manualkeywordspreparationEdit.description),
      //   updatedby: [
      //     ...updateby,
      //     {
      //       name: String(isUserRoleAccess.companyname),
      //     },
      //   ],
      // });

      const formData = new FormData();

      // Append normal fields
      formData.append("keywordname", String(manualkeywordspreparationEdit.keywordname));
      formData.append("value", String(manualkeywordspreparationEdit.value));
      formData.append("headings", JSON.stringify(headingsEdit));
      formData.append("previewdocument", previewHtmlEdit);
      formData.append("numberingstyle", numberingstyleEdit);
      formData.append("description", String(manualkeywordspreparationEdit.description));

      // Append updatedby as string (because backend parses JSON)
      formData.append(
        "updatedby",
        JSON.stringify([
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
          },
        ])
      );
      // Append file only if a new one is selected
      if (documentFilesEdit?.name) {
        formData.append("file", documentFilesEdit);
        formData.append("deletefileName", deleteMulterFileName?.filename);
      }
      if (!documentFilesEdit) {
        formData.append("deletefileName", deleteMulterFileName?.filename);
        formData.append("oldfile", ""); // must be a File or Blob

      }
      if (documentFilesEdit?.path) {
        formData.append("oldfile", JSON.stringify(documentFilesEdit)); // must be a File or Blob
      }

      // Send request
      let res = await axios.put(
        `${SERVICE.SINGLE_MANUAL_KEYWORDS_PREPARATION}/${subprojectsid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchTaskcategory();
      await fetchManualKeywordsPrepAll();
      handleCloseModEdit();

      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    e.preventDefault();
    fetchManualKeywordsPrepAll();
    console.log(manualkeywordspreparationEdit, documentFilesEdit)
    const isNameMatch = allManualKeywordsedit.some((item) => item.keywordname.toLowerCase() === manualkeywordspreparationEdit.keywordname.toLowerCase());
    if (manualkeywordspreparationEdit.keywordname === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manualkeywordspreparationEdit.description === '' && (headingsEdit?.length === 0 || headingsEdit[0]?.title === "")) {
      setPopupContentMalert('Please Enter Value/ Document Format');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Name already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };

  //get all Sub vendormasters.
  const fetchTaskcategory = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.MANUAL_KEYWORDS_PREPARATIONS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManualKeywordsPreparationcheck(true);
      setManualKeywordsPreparations(res_vendor?.data?.manualkeywordpreparation);
    } catch (err) {
      setManualKeywordsPreparationcheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Sub vendormasters.
  const fetchManualKeywordsPrepAll = async () => {
    setPageName(!pageName);
    try {
      let res_meet = await axios.get(SERVICE.MANUAL_KEYWORDS_PREPARATIONS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAllManualKeywordsedit(res_meet?.data?.manualkeywordpreparation?.filter((data) => data?._id !== manualkeywordspreparationEdit?._id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Manual KeyWords Preparation',
    pageStyle: 'print',
  });

  //id for login...
  let loginid = localStorage.LoginUserId;
  let authToken = localStorage.APIToken;

  useEffect(() => {
    fetchTaskcategory();
  }, []);

  useEffect(() => {
    fetchManualKeywordsPrepAll();
  }, [isEditOpen, manualkeywordspreparationEdit]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = manualkeywordspreparations?.map((item, index) => ({ ...item, serialNumber: index + 1 }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [manualkeywordspreparations]);

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
    setSelectAllChecked(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setSelectAllChecked(false);
    setPage(1);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
  });

  const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDatas.length / pageSize);
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
  const pageNumbers = [];
  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const columnDataTable = [
    {
      field: 'checkbox',
      headerName: 'Checkbox', // Default header name
      headerStyle: {
        fontWeight: 'bold', // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },
      renderHeader: (params) => (
        <CheckboxHeader
          selectAllChecked={selectAllChecked}
          onSelectAll={() => {
            if (rowDataTable.length === 0) {
              // Do not allow checking when there are no rows
              return;
            }
            if (selectAllChecked) {
              setSelectedRows([]);
            } else {
              const allRowIds = rowDataTable.map((row) => row.id);
              setSelectedRows(allRowIds);
            }
            setSelectAllChecked(!selectAllChecked);
          }}
        />
      ),

      renderCell: (params) => (
        <Checkbox
          checked={selectedRows.includes(params.row.id)}
          onChange={() => {
            let updatedSelectedRows;
            if (selectedRows.includes(params.row.id)) {
              updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.row.id);
            } else {
              updatedSelectedRows = [...selectedRows, params.row.id];
            }

            setSelectedRows(updatedSelectedRows);

            // Update the "Select All" checkbox based on whether all rows are selected
            setSelectAllChecked(updatedSelectedRows.length === filteredData.length);
          }}
        />
      ),
      sortable: false, // Optionally, you can make this column not sortable
      width: 90,

      hide: !columnVisibility.checkbox,
      headerClassName: 'bold-header',
    },
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
    },
    { field: 'keywordname', headerName: 'Name', flex: 0, width: 250, hide: !columnVisibility.keywordname, headerClassName: 'bold-header' },
    { field: 'value', headerName: 'Keyword Name', flex: 0, width: 250, hide: !columnVisibility.value, headerClassName: 'bold-header' },
    { field: 'description', headerName: 'Value', flex: 0, width: 250, hide: !columnVisibility.description, headerClassName: 'bold-header' },

    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 250,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: 'bold-header',
      renderCell: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('emanualkeywordspreparation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes('dmanualkeywordspreparation') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vmanualkeywordspreparation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('imanualkeywordspreparation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      keywordname: item.keywordname,
      value: item.value,
      description: item.description,
    };
  });

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.id),
  }));

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibility };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibility(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTable.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // JSX for the "Manage Columns" popover content
  const manageColumnsContent = (
    <Box style={{ padding: '10px', minWidth: '325px', '& .MuiDialogContent-root': { padding: '10px 0' } }}>
      <Typography variant="h6">Manage Columns</Typography>
      <IconButton
        aria-label="close"
        onClick={handleCloseManageColumns}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ position: 'relative', margin: '10px' }}>
        <TextField label="Find column" variant="standard" fullWidth value={searchQueryManage} onChange={(e) => setSearchQueryManage(e.target.value)} sx={{ marginBottom: 5, position: 'absolute' }} />
      </Box>
      <br />
      <br />
      <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
        <List sx={{ overflow: 'auto', height: '100%' }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: 'flex' }}
                primary={<Switch sx={{ marginTop: '-5px' }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />}
                secondary={column.field === 'checkbox' ? 'Checkbox' : column.headerName}
              // secondary={column.headerName }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button variant="text" sx={{ textTransform: 'none' }} onClick={() => setColumnVisibility(initialColumnVisibility)}>
              Show All
            </Button>
          </Grid>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: 'none' }}
              onClick={() => {
                const newColumnVisibility = {};
                columnDataTable.forEach((column) => {
                  newColumnVisibility[column.field] = false; // Set hide property to true
                });
                setColumnVisibility(newColumnVisibility);
              }}
            >
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );


  return (
    <Box>
      <Headtitle title={'MANUAL KEYWORDS'} />
      <PageHeading title="Manual KeyWords Preparation" modulename="Human Resources" submodulename="HR Documents" mainpagename="Documents Setup" subpagename="Manual KeyWords Preparation" subsubpagename="" />
      {isUserRoleCompare?.includes('amanualkeywordspreparation') && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Add Manual KeyWords Preparation</Typography>
                </Grid>
              </Grid>
              <br />

              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={manualkeywordspreparation.keywordname}
                      onChange={(e) => {
                        setManualKeywordsPreparation({
                          ...manualkeywordspreparation,
                          keywordname: e.target.value,
                          value: `$${e.target.value?.toUpperCase()}$`,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>keyword Name</Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Name" value={manualkeywordspreparation.value} />
                  </FormControl>
                </Grid>

                {!headings?.length > 0 &&
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Value<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <TextareaAutosize
                        aria-label="minimum height"
                        minRows={5}
                        value={manualkeywordspreparation.description}
                        onChange={(e) => {
                          setManualKeywordsPreparation({ ...manualkeywordspreparation, description: e.target.value });
                          setHeadings([]);
                          setPreviewHtml("")
                          setNumberingStyle("number")
                        }}
                      />
                    </FormControl>
                  </Grid>}

                {/* {!manualkeywordspreparation.description && */}
                <Grid item md={12} sm={12} xs={12}>
                  <br /> <br /> <br /> <br />
                  <Typography variant="h6">Upload Image</Typography>
                  <Grid marginTop={2}>
                    <Button variant="contained" size="small" component="label" sx={{ ...buttonStyles.buttonsubmit, '@media only screen and (max-width:550px)': { marginY: '5px' } }}>
                      Upload
                      <input
                        type="file"
                        id="resume"
                        accept=".png , .jpg , .jpeg"
                        name="file"
                        hidden
                        // multiple
                        onChange={(e) => {
                          handleResumeUpload(e);
                        }}
                      />
                    </Button>
                    <br />
                    <br />
                    {documentFiles && documentFiles?.name &&
                      <Grid container spacing={2}>
                        {' '}
                        {/* Use key prop for each item */}
                        <Grid item lg={3} md={3} sm={6} xs={6}>
                          <Typography>{documentFiles?.name}</Typography> {/* Display the file name */}
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={1}>
                          <Button sx={{ ...buttonStyles.buttonview, cursor: 'pointer', fontSize: 'large', marginTop: '-5px' }} onClick={() => renderFilePreview(documentFiles)}>
                            <VisibilityOutlinedIcon />
                          </Button>
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={1}>
                          <Button sx={{ ...buttonStyles.buttondelete, cursor: 'pointer', fontSize: 'large', marginTop: '-5px' }} onClick={() => handleFileDelete(documentFiles)}>
                            <DeleteIcon />
                          </Button>
                        </Grid>
                      </Grid>
                    }
                  </Grid>
                </Grid>
                {/* } */}
                <br />
                {!manualkeywordspreparation.description &&
                  <Grid item md={12} sm={12} xs={12}>
                    <HeadingEditor headings={headings} setHeadings={setHeadings} previewHtml={previewHtml} setPreviewHtml={setPreviewHtml} numberingStyle={numberingstyle} setNumberingStyle={setNumberingStyle} />
                  </Grid>
                }
                <br />
                <Grid item md={4} xs={12} sm={12} marginTop={5}>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12} sm={6}>
                      <LoadingButton loading={btnLoad} variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                        Submit
                      </LoadingButton>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </>
          </Box>
        </>
      )}
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth={true} maxWidth="md" sx={{ marginTop: '47px' }}>
          <Box sx={{ padding: '20px' }}>
            <>
              <form onSubmit={editSubmit}>
                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>Edit Manual KeyWords Preparation</Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Please Enter Name"
                        value={manualkeywordspreparationEdit.keywordname}
                        onChange={(e) => {
                          setManualKeywordsPreparationEdit({ ...manualkeywordspreparationEdit, keywordname: e.target.value, value: `$${e.target.value?.toUpperCase()}$` });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>keyword Name</Typography>
                      <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Name" value={manualkeywordspreparationEdit.value} />
                    </FormControl>
                  </Grid>
                  {!headingsEdit?.length > 0 &&
                    <Grid item md={6} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Value<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={5}
                          value={manualkeywordspreparationEdit.description}
                          onChange={(e) => {
                            setManualKeywordsPreparationEdit({ ...manualkeywordspreparationEdit, description: e.target.value });
                            setHeadingsEdit([]);
                            setPreviewHtmlEdit("")
                            setNumberingStyleEdit("number")
                          }}
                        />
                      </FormControl>
                    </Grid>
                  }


                  {/* {!manualkeywordspreparationEdit.description && */}
                  <Grid item md={12} sm={12} xs={12}>
                    <br /> <br /> <br /> <br />
                    <Typography variant="h6">Upload Image</Typography>
                    <Grid marginTop={2}>
                      <Button variant="contained" size="small" component="label" sx={{ ...buttonStyles.buttonsubmit, '@media only screen and (max-width:550px)': { marginY: '5px' } }}>
                        Upload
                        <input
                          type="file"
                          id="resume"
                          accept=".png , .jpg , .jpeg"
                          name="file"
                          hidden
                          // multiple
                          onChange={(e) => {
                            handleResumeUploadEdit(e);
                          }}
                        />
                      </Button>
                      <br />
                      <br />
                      {documentFilesEdit && (documentFilesEdit?.name || documentFilesEdit?.filename) &&
                        <Grid container spacing={2}>
                          {' '}
                          {/* Use key prop for each item */}
                          <Grid item lg={3} md={3} sm={6} xs={6}>
                            <Typography>{documentFilesEdit?.name || documentFilesEdit?.filename}</Typography> {/* Display the file name */}
                          </Grid>
                          <Grid item lg={1} md={1} sm={1} xs={1}>
                            <Button sx={{ ...buttonStyles.buttonview, cursor: 'pointer', fontSize: 'large', marginTop: '-5px' }} onClick={() => renderFilePreviewEdit(documentFilesEdit)}>
                              <VisibilityOutlinedIcon />
                            </Button>
                          </Grid>
                          <Grid item lg={1} md={1} sm={1} xs={1}>
                            <Button sx={{ ...buttonStyles.buttondelete, cursor: 'pointer', fontSize: 'large', marginTop: '-5px' }} onClick={() => handleFileDeleteEdit(documentFilesEdit)}>
                              <DeleteIcon />
                            </Button>
                          </Grid>
                        </Grid>
                      }
                    </Grid>
                  </Grid>
                  {/* } */}
                </Grid>
                <br />
                {!manualkeywordspreparationEdit.description &&
                  <Grid item md={12} sm={12} xs={12}>
                    <HeadingEditor headings={headingsEdit} setHeadings={setHeadingsEdit} previewHtml={previewHtmlEdit} setPreviewHtml={setPreviewHtmlEdit} numberingStyle={numberingstyleEdit} setNumberingStyle={setNumberingStyleEdit} />
                  </Grid>
                }
                <br />
                <br />

                <Grid container spacing={2}>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} type="submit">
                      Update
                    </Button>
                  </Grid>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
                {/* </DialogContent> */}
              </form>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lmanualkeywordspreparation') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Manual KeyWords Preparation List</Typography>
            </Grid>
            <br />
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSize}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 180,
                          width: 80,
                        },
                      },
                    }}
                    onChange={handlePageSizeChange}
                    sx={{ width: '77px' }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    {/* <MenuItem value={(manualkeywordspreparations?.length)}>All</MenuItem> */}
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                  {isUserRoleCompare?.includes('excelmanualkeywordspreparation') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat('xl');
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('csvmanualkeywordspreparation') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat('csv');
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('printmanualkeywordspreparation') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfmanualkeywordspreparation') && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true);
                        }}
                      >
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('imagemanualkeywordspreparation') && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {' '}
                      <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                <Box>
                  <FormControl fullWidth size="small">
                    <Typography>Search</Typography>
                    <OutlinedInput id="component-outlined" type="text" value={searchQuery} onChange={handleSearchChange} />
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
            <br />
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
              Show All Columns
            </Button>
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
              Manage Columns
            </Button>
            &ensp;
            {isUserRoleCompare?.includes('bdmanualkeywordspreparation') && (
              <Button variant="contained" sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )}
            <br />
            {!manualkeywordspreparationCheck ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
                <Box
                  style={{
                    width: '100%',
                    overflowY: 'hidden', // Hide the y-axis scrollbar
                  }}
                >
                  <StyledDataGrid
                    rows={rowsWithCheckboxes}
                    columns={columnDataTable.filter((column) => columnVisibility[column.field])}
                    onSelectionModelChange={handleSelectionChange}
                    selectionModel={selectedRows}
                    autoHeight={true}
                    ref={gridRef}
                    density="compact"
                    hideFooter
                    getRowClassName={getRowClassName}
                    disableRowSelectionOnClick
                  />
                </Box>
                <Box style={userStyle.dataTablestyle}>
                  <Box>
                    Showing {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredDatas.length)} of {filteredDatas.length} entries
                  </Box>
                  <Box>
                    <Button onClick={() => setPage(1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <FirstPageIcon />
                    </Button>
                    <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <NavigateBeforeIcon />
                    </Button>
                    {pageNumbers?.map((pageNumber) => (
                      <Button key={pageNumber} sx={userStyle.paginationbtn} onClick={() => handlePageChange(pageNumber)} className={page === pageNumber ? 'active' : ''} disabled={page === pageNumber}>
                        {pageNumber}
                      </Button>
                    ))}
                    {lastVisiblePage < totalPages && <span>...</span>}
                    <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <NavigateNextIcon />
                    </Button>
                    <Button onClick={() => setPage(totalPages)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <LastPageIcon />
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
      {/* Manage Column */}
      <Popover
        id={id}
        open={isManageColumnsOpen}
        anchorEl={anchorEl}
        onClose={handleCloseManageColumns}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {manageColumnsContent}
      </Popover>

      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description"
        maxWidth="lg" sx={{ marginTop: '47px' }}>
        <Box sx={{ padding: '20px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Manual KeyWords Preparation</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{manualkeywordspreparationEdit.keywordname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Keyword Name</Typography>
                  <Typography>{manualkeywordspreparationEdit.value}</Typography>
                </FormControl>
              </Grid>
              {manualkeywordspreparationEdit?.description &&
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Value</Typography>
                    <Typography
                      sx={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {manualkeywordspreparationEdit.description}
                    </Typography>
                  </FormControl>
                </Grid>}
              {manualkeywordspreparationEdit && (manualkeywordspreparationEdit?.file?.filename) &&
                <Grid item md={6} xs={12} sm={12}>
                  {' '}
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Image</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{manualkeywordspreparationEdit?.file?.filename}</Typography>
                      <Button sx={{ ...buttonStyles.buttonview, cursor: 'pointer', fontSize: 'large', marginTop: '-5px' }} onClick={() => renderFilePreviewEdit(manualkeywordspreparationEdit?.file)}>
                        <VisibilityOutlinedIcon />
                      </Button>
                    </Box>
                  </FormControl>
                </Grid>
              }

              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Keyword Name</Typography>
                  <ReactQuill
                    style={{ height: "max-content", minHeight: "150px" }}
                    value={manualkeywordspreparationEdit?.previewdocument}
                    readOnly={true}
                    modules={{
                      toolbar: [[{ header: "1" }, { header: "2" },
                      { font: [] }], ["tab"], [{ size: [] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ align: [] }],
                      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                      ["link", "image", "video"], ["clean"]]
                    }}
                    formats={["header", "font", "size", "bold", "italic", "underline", "strike", "align", "blockquote", "list", "bullet", "indent", "link", "image", "video"]}
                  />
                  {/* <Typography
                    component="div"
                    dangerouslySetInnerHTML={{ __html: manualkeywordspreparationEdit?.previewdocument }}
                  /> */}
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button variant="contained" sx={buttonStyles.btncancel} onClick={handleCloseview}>
                {' '}
                Back{' '}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* Check delete Modal */}
      <Box>
        <>
          <Box>
            {/* ALERT DIALOG */}
            <Dialog open={isCheckOpen} onClose={handleCloseCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogContent
                sx={{
                  width: '350px',
                  textAlign: 'center',
                  alignItems: 'center',
                }}
              >
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
                <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
                  {getOverAllCountDelete}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCheck} autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit}>
                  {' '}
                  OK{' '}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </>
      </Box>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{ padding: '7px 13px', color: 'white', background: 'rgb(25, 118, 210)' }}
              sx={buttonStyles.buttonsubmit}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button
              style={{
                backgroundColor: '#f4f4f4',
                color: '#444',
                boxShadow: 'none',
                borderRadius: '3px',
                padding: '7px 13px',
                border: '1px solid #0000006b',
                '&:hover': {
                  '& .css-bluauu-MuiButtonBase-root-MuiButton-root': {
                    backgroundColor: '#f4f4f4',
                  },
                },
              }}
              onClick={handleCloseerrpop}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
              Are you sure?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModcheckbox} sx={userStyle.btncancel}>
              Cancel
            </Button>
            <Button autoFocus variant="contained" color="error" onClick={(e) => delTaskCatecheckbox(e)}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isDeleteOpenalert} onClose={handleCloseModalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '70px', color: 'orange' }} />
            <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
              Please Select any Row
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={handleCloseModalert}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* EXTERNAL COMPONENTS -------------- START */}
      {/* VALIDATION */}
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      {/* PRINT PDF EXCEL CSV */}
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={items ?? []}
        filename={'Manual KeyWords Preparation'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Manual KeyWords Preparation Info" addedby={addedby} updateby={updateby} />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delTaskCategory} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      {/* EXTERNAL COMPONENTS -------------- END */}
      <br />
    </Box>
  );
}

export default ManualKeyWordsPreparation;