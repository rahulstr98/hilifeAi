import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import ImageResize from 'quill-image-resize-module-react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { asBlob } from "html-docx-js-typescript";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    useTheme,
    Stack,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip
} from "@mui/material";
import {
    Undo as UndoIcon,
    Redo as RedoIcon,
    ContentCopy as ContentCopyIcon,
    ContentCut as ContentCutIcon,
    ContentPaste as ContentPasteIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
    Code as CodeIcon,
    Print as PrintIcon,
    FindReplace as ReplaceIcon,
} from "@mui/icons-material";
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import "react-quill/dist/quill.snow.css";
// Setup Quill extensions
import Quill from "quill";
const Parchment = Quill.import("parchment");
Quill.register('modules/imageResize', ImageResize);

const LineHeightStyle = new Parchment.Attributor.Style("lineheight", "line-height", {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["1", "1.5", "2", "2.5", "3"]
});
const VerticalAlignStyle = new Parchment.Attributor.Style("verticalalign", "vertical-align", {
    scope: Parchment.Scope.INLINE,
    whitelist: ["top", "middle", "bottom"]
});
const MarginClass = new Parchment.Attributor.Class('margin', 'ql-margin', {
    scope: Parchment.Scope.BLOCK,
});
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '24px', '32px'];

const PageSizeClass = new Parchment.Attributor.Class("pagesize", "ql-pagesize", {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["a4", "a3", "a2"]
});
const Font = Quill.import('formats/font');
Font.whitelist = [
    "arial", "arial-black", "algerian", "calibri", "cambria",
    "candara", "comic-sans-ms", "consolas", "courier-new", "georgia",
    "palatino", "segoe-ui", "tahoma", "times-new-roman", "trebuchet-ms", "verdana"
];
Quill.register(Font, true);
Quill.register(LineHeightStyle, true);
Quill.register(VerticalAlignStyle, true);
Quill.register(MarginClass, true);
Quill.register(Size, true);
Quill.register(PageSizeClass, true);


const FileNameDialog = ({ open, onClose, onSave, defaultName = "document" }) => {
    const [fileName, setFileName] = useState(defaultName);
    const theme = useTheme();

    const handleSave = () => {
        if (fileName.trim() !== "") {
            onSave(fileName.trim());
            setFileName(defaultName);
        }
    };

    const handleClose = () => {
        setFileName(defaultName);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    padding: theme.spacing(3),
                    borderRadius: '16px',
                    boxShadow: theme.shadows[8],
                    backgroundColor: theme.palette.background.paper,
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: theme.palette.primary.main,
                    textAlign: "center",
                    pb: 1,
                }}
            >
                Enter File Name
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="File Name"
                    fullWidth
                    variant="outlined"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    InputProps={{
                        style: {
                            fontSize: "1rem",
                            padding: "5px",
                            borderRadius: "8px",
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={handleClose} color="secondary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const smallSelectStyle = {
    minWidth: 120,
    '& .MuiInputBase-root': {
        padding: '2px 8px',
        fontSize: '0.75rem'
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.75rem'
    },
    '& .MuiSelect-icon': {
        fontSize: '1rem'
    }
};

const ReactQuillAdvanced = ({ agenda, setAgenda, disabled = false,
    selectedMargin, setSelectedMargin,
    pageSize, setPageSize,
    pageOrientation, setPageOrientation }) => {
    const quillRef = useRef();
    const [searchTerm, setSearchTerm] = useState("");
    const [replaceTerm, setReplaceTerm] = useState("");
    // const [selectedMargin, setSelectedMargin] = useState("normal");
    // const [pageSize, setPageSize] = useState("A4");
    // const [pageOrientation, setPageOrientation] = useState("portrait");

    const jsPDFPageDimensions = {
        A2: [420, 594],
        A3: [297, 420],
        A4: [210, 297],
        A5: [148, 210],
        Letter: [216, 279],
        Legal: [216, 356],
        Tabloid: [279, 432],
        Executive: [184, 267],
        B4: [250, 353],
        B5: [176, 250],
        Statement: [140, 216],
        Office2003: [216, 279]
    };

    function getPageSizeInPx(pageSize, orientation = "portrait") {
        const mmToPx = (mm) => (mm * 96) / 25.4; // Convert mm to px assuming 96 DPI
        let size = jsPDFPageDimensions[pageSize] || jsPDFPageDimensions["A4"];
        if (orientation === "landscape") size = [size[1], size[0]];
        return {
            width: mmToPx(size[0]),
            height: mmToPx(size[1])
        };
    }
    const { width, height } = getPageSizeInPx(pageSize, pageOrientation);
    const marginValues = {
        normal: [96, 96, 96, 96],
        narrow: [48, 48, 48, 48],
        moderate: [96, 72, 96, 72],
        wide: [96, 192, 96, 192],
        mirrored: [96, 120, 96, 96],
        office2003: [96, 120, 96, 120]
    };

    const jsPDFPageSizes = {
        A2: 'a2',
        A3: 'a3',
        A4: 'a4',
        A5: 'a5',
        Letter: 'letter',
        Legal: 'legal',
        Tabloid: 'tabloid',
        Executive: 'executive',
        B4: 'b4',
        B5: 'b5',
        Statement: [139.7, 215.9],
        Office2003: [215.9, 279.4]  // You can define as per your design
    };



    const marginOptions = [
        { label: "Normal", value: "normal", tooltip: "Top: 2.54 cm, Bottom: 2.54 cm, Left: 2.54 cm, Right: 2.54 cm" },
        { label: "Narrow", value: "narrow", tooltip: "Top: 1.27 cm, Bottom: 1.27 cm, Left: 1.27 cm, Right: 1.27 cm" },
        { label: "Moderate", value: "moderate", tooltip: "Top: 2.54 cm, Bottom: 2.54 cm, Left/Right: 1.91 cm" },
        { label: "Wide", value: "wide", tooltip: "Top: 2.54 cm, Bottom: 2.54 cm, Left/Right: 5.08 cm" },
        { label: "Mirrored", value: "mirrored", tooltip: "Top: 2.54 cm, Bottom: 2.54 cm, Inside: 3.18 cm, Outside: 2.54 cm" },
        { label: "Office 2003", value: "office2003", tooltip: "Top: 2.54 cm, Bottom: 2.54 cm, Left/Right: 3.18 cm" },
    ];


    const handleCopy = () => {
        if (disabled) return;
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();
        if (selection) {
            const text = quill.getText(selection.index, selection.length);
            navigator.clipboard.writeText(text);
        }
    };

    const handleCut = () => {
        if (disabled) return;
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();

        if (!selection || selection.length === 0) return;

        const text = quill.getText(selection.index, selection.length);

        // Try Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                quill.deleteText(selection.index, selection.length, 'user'); // 👈 Add 'user'
            }).catch((err) => {
                console.error("Clipboard API failed:", err);
                fallbackCopy(text);
                quill.deleteText(selection.index, selection.length, 'user'); // 👈 Add 'user'
            });
        } else {
            fallbackCopy(text);
            quill.deleteText(selection.index, selection.length, 'user'); // 👈 Add 'user'
        }
    };


    // Fallback for clipboard
    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // prevent scrolling to bottom of page
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            document.execCommand('copy');
            console.log('Fallback copy success');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }

        document.body.removeChild(textarea);
    };


    const handlePaste = async () => {
        if (disabled) return;
        const quill = quillRef.current.getEditor();
        const clipboardText = await navigator.clipboard.readText();
        const range = quill.getSelection(true);
        quill.insertText(range.index, clipboardText);
    };

    const handleReplace = () => {
        if (!disabled) {
            const quill = quillRef.current.getEditor();
            const content = quill.root.innerHTML;
            if (!searchTerm) return alert("Enter text to search.");

            const regex = new RegExp(searchTerm, "gi");
            const replacedContent = content.replace(regex, replaceTerm);
            quill.clipboard.dangerouslyPasteHTML(replacedContent);
            setAgenda(replacedContent);
        }

        setSearchTerm("");
        setReplaceTerm("");
    };

    const handleMarginChange = (event) => {
        if (disabled) return;
        const value = event.target.value;
        setSelectedMargin(value);
    };


    function pxToMm(px) {
        return parseFloat(px) * 0.264583;
    }

    const exportToPDF = (fileName = 'document') => {
        const elementHTML = agenda;
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(style => style.outerHTML)
            .join("\n");


        const convertPxArrayToMm = (arr) => arr.map(px => pxToMm(px));
        const selectedMarginPx = marginValues[selectedMargin] || [96, 96, 96, 96];
        const selectedMarginMm = convertPxArrayToMm(selectedMarginPx);
        const pxToIn = (px) => `${px / 96}in`;
        // Create a hidden iframe for rendering
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.open();
        doc.write(`
        <html>
            <head>
                <title>Export PDF</title>
                ${styles}
                <style>
                    @page {
                        size: ${pageSize} ${pageOrientation};
                        margin: ${pxToIn(selectedMarginPx[0])} ${pxToIn(selectedMarginPx[1])} ${pxToIn(selectedMarginPx[2])} ${pxToIn(selectedMarginPx[3])};
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        background: white;
                    }

                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .print-content {
                        width: 100%;
                        box-sizing: border-box;
                        background: white;
                    }

                    .page-footer {
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                        text-align: center;
                        font-size: 12px;
                        color: #555;
                    }

                    .page-break {
                        page-break-after: always;
                    }

                    header, footer {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="print-content">
                    ${elementHTML}
                </div>
            </body>
        </html>
    `);
        doc.close();

        const marginStr = `${pxToIn(selectedMarginPx[0])} ${pxToIn(selectedMarginPx[1])} ${pxToIn(selectedMarginPx[2])} ${pxToIn(selectedMarginPx[3])}`;
        iframe.onload = () => {
            const iframeBody = iframe.contentDocument.body;

            // Wait for a short delay to allow rendering
            setTimeout(() => {
                const contentToPrint = iframeBody.querySelector('.print-content');
                if (!contentToPrint) {
                    console.error("'.print-content' not found in iframe");
                    return;
                }

                html2pdf()
                    .set({
                        margin: selectedMarginMm,
                        filename: `${fileName}.pdf`,
                        html2canvas: {
                            scale: 2,
                            useCORS: true,
                            logging: false
                        },
                        jsPDF: {
                            unit: 'mm',
                            format: jsPDFPageSizes[pageSize],
                            orientation: pageOrientation.toLowerCase()
                        }
                    })
                    .from(contentToPrint)
                    .save()
                    .then(() => {
                        document.body.removeChild(iframe);
                    });
            }, 300); // delay to ensure iframe is fully rendered
        };

    };



    const exportToDocx = async (fileName = 'document') => {
        const content = document.querySelector(".ql-editor")?.innerHTML;
        if (!content) return;

        const convertPxArrayToMm = (arr) => arr.map(px => pxToMm(px));
        const selectedMarginPx = marginValues[selectedMargin] || [96, 96, 96, 96];
        const selectedMarginMm = convertPxArrayToMm(selectedMarginPx);
        const pxToIn = (px) => `${px / 96}in`;
        // Grab the current styles
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(style => style.outerHTML)
            .join("\n");

        const fullHTML = `
        <html>
            <head>
                <meta charset="utf-8">
                ${styles}
                <style>
                    body {
                        background: white;
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                        
                    .ql-editor {
                        padding: 20mm;
                        background: white;
                        overflow: hidden;
                        width: 100%;
                        box-sizing: border-box;
                    }
                </style>
            </head>
            <body>
                <div class="ql-editor">${content}</div>
            </body>
        </html>
    `;

        const blob = await asBlob(fullHTML, {
            orientation: pageOrientation.toLowerCase(), // "portrait" or "landscape"
            margins: selectedMarginMm,                   // in twips
        });

        saveAs(blob, `${fileName}.docx`);
    };

    const exportToJPG = (fileName = 'document') => {
        const selectedMarginPx = marginValues[selectedMargin] || [96, 96, 96, 96];
        const [top, right, bottom, left] = selectedMarginPx;

        // Create a hidden iframe for style isolation
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '1000px';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        // Collect and inject styles
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(style => style.outerHTML)
            .join('\n');

        doc.open();
        doc.write(`
    <html>
      <head>
        <title>Export to JPG</title>
        ${styles}
        <style>
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: 'Calibri', Arial, sans-serif;
          }
          .print-container {
            width: 794px; /* A4 width at 96 DPI */
            padding: ${top}px ${right}px ${bottom}px ${left}px;
            background: white;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${agenda}
        </div>
      </body>
    </html>
  `);
        doc.close();

        iframe.onload = () => {
            const contentToCapture = iframe.contentDocument.querySelector('.print-container');

            html2canvas(contentToCapture, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = `${fileName}.jpg`;
                link.href = canvas.toDataURL('image/jpeg');
                link.click();

                document.body.removeChild(iframe);
            });
        };
    };


    const exportToHTML = (fileName = 'document') => {
        const content = document.querySelector('.ql-editor').innerHTML;
        const fullHTML = `
    <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
      </head>
      <body>
        <div class="ql-editor">
          ${content}
        </div>
      </body>
    </html>`;
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const link = document.createElement('a');
        link.download = `${fileName}.html`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    const handlePrintPreview = () => {
        const printContent = agenda;

        const newWin = window.open("", "_blank");
        const pxToIn = (px) => `${px / 96}in`;
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(style => style.outerHTML)
            .join("\n");


        const margin = marginValues[selectedMargin] || [96, 96, 96, 96];

        console.log(marginValues[selectedMargin], margin, selectedMargin)

        newWin.document.write(`
            <html>
                <head>
                    <title>Print Preview</title>
                    ${styles}
                    
                    <style>
                        @media print {
                            @page {
                            size: ${pageSize} ${pageOrientation};
                           margin: ${pxToIn(margin[0])} ${pxToIn(margin[1])} ${pxToIn(margin[2])} ${pxToIn(margin[3])};
            }

                        body {
                            margin: 0;
                        padding: 0;
                        box-sizing: border-box;
            }

                        * {
                            -webkit - print - color - adjust: exact;
                            print-color-adjust: exact;
            }

                        .page-footer {
                            position: fixed;
                        bottom: 0;
                        width: 100%;
                        text-align: center;
                        font-size: 12px;
                        color: #555;
            }

                        .page-break {
                            page -break-after: always;
            }

                        header, footer {
                            display: none;
            }
          }
                        body, .print-content {
                            background: white !important;
          }
                        .print-content {
                            width: 100%;
                        box-sizing: border-box;
          }
                        
    /* Quill Indents */
    .ql-indent-1 { margin-left: 75px; }
    .ql-indent-2 { margin-left: 150px; }
    .ql-indent-3 { margin-left: 225px; }
    .ql-indent-4 { margin-left: 275px; }
    .ql-indent-5 { margin-left: 325px; }
    .ql-indent-6 { margin-left: 375px; }
    .ql-indent-7 { margin-left: 425px; }
    .ql-indent-8 { margin-left: 475px; }

    /* Quill Alignments */
    .ql-align-right { text-align: right; } 
    .ql-align-left { text-align: left; } 
    .ql-align-center { text-align: center; } 
    .ql-align-justify { text-align: justify; } 
                    </style>
                </head>
                <body>
                    <div class="print-content">
                        ${printContent}
                    </div>
                    
                    <script>
                        window.onload = function() {
                        window.print();
          };
                    </script>
                </body>
            </html>
        `);

        newWin.document.close();
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fileTypeToExport, setFileTypeToExport] = useState(null);
    const handleOpenDialog = (type) => {
        setFileTypeToExport(type); // 'pdf', 'jpg', etc.
        setIsDialogOpen(true);
    };
    const handleFileSave = (fileName) => {
        setIsDialogOpen(false);

        switch (fileTypeToExport) {
            case 'pdf':
                exportToPDF(fileName);
                break;
            case 'jpg':
                exportToJPG(fileName);
                break;
            case 'docx':
                exportToDocx(fileName);
                break;
            case 'html':
                exportToHTML(fileName);
                break;
            default:
                break;
        }
    };

    const handleInsertTab = () => {
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();

        if (range) {
            // Insert 4 spaces as a "tab" (you can replace with '\t' if preferred)
            quill.insertText(range.index, "\u00A0\u00A0\u00A0\u00A0"); // or "\t"
            quill.setSelection(range.index + 4); // Move cursor after the inserted tab
        }
    };

    const handleInsertPageBreak = () => {
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();

        if (range) {
            quill.clipboard.dangerouslyPasteHTML(
                range.index,
                `<p data-page-break="true" style="text-align: center; border-top: 1px dashed #999; margin: 20px 0; color: #999;">
                --- Page Break ---
            </p><p><br/></p>`
            );
            quill.setSelection(range.index + 1);
        }
    };

    return (
        <>
            <Grid container spacing={1} alignItems="center" sx={{
                mb: 2,
                position: "sticky",
                top: 50,
                zIndex: 1000,
                backgroundColor: "white",
                padding: "8px 12px"
            }}>
                <Grid item>
                    <Tooltip title="Undo">
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            onClick={() => quillRef.current.getEditor().history.undo()}
                            startIcon={<UndoIcon />}
                        >
                            Undo
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Redo">
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            onClick={() => quillRef.current.getEditor().history.redo()}
                            startIcon={<RedoIcon />}
                        >
                            Redo
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Copy">
                        <Button variant="contained"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            color="info" onClick={handleCopy} startIcon={<ContentCopyIcon />}>
                            Copy
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Cut">
                        <Button variant="contained"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            color="error" onClick={handleCut} startIcon={<ContentCutIcon />}>
                            Cut
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Paste">
                        <Button variant="contained"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            color="success" onClick={handlePaste} startIcon={<ContentPasteIcon />}>
                            Paste
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Export to PDF">
                        <Button variant="contained"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            color="secondary" onClick={() => handleOpenDialog('pdf')} startIcon={<PictureAsPdfIcon />}>
                            PDF
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Export to DOCX">
                        <Button variant="contained" color="primary"
                            size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }}
                            onClick={() => handleOpenDialog('docx')} startIcon={<DescriptionIcon />}>
                            DOCX
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Export to JPG">
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                bgcolor: "#f57c00",
                                color: "#fff",
                                minWidth: 'auto',
                                padding: '2px 6px',
                                fontSize: '0.65rem'
                            }}
                            onClick={() => handleOpenDialog('jpg')}
                            startIcon={<ImageIcon />}
                        >
                            JPG
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Export to HTML">
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#6d4c41", color: "#fff",
                                minWidth: 'auto',
                                padding: '2px 6px',
                                fontSize: '0.65rem'
                            }}
                            onClick={() => handleOpenDialog('html')}
                            startIcon={<CodeIcon />}
                        >
                            HTML
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Insert Tab Space">
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#f57c00", color: "#fff", minWidth: 'auto',
                                padding: '2px 6px',
                                fontSize: '0.65rem'
                            }}
                            onClick={handleInsertTab}
                            startIcon={<KeyboardTabIcon />}
                        >
                            Tab
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Insert Page Break">
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#f57c00", color: "#fff",
                                minWidth: 'auto',
                                padding: '2px 6px',
                                fontSize: '0.65rem'
                            }}
                            onClick={handleInsertPageBreak}
                            startIcon={<KeyboardTabIcon />}
                        >
                            Page Break
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <FormControl size="small" sx={smallSelectStyle}>
                        <InputLabel id="margin-label">Margin</InputLabel>
                        <Select
                            labelId="margin-label"
                            value={selectedMargin}
                            onChange={handleMarginChange}
                            label="Margin"
                            disabled={disabled}
                        >
                            {marginOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Tooltip title={option.tooltip} placement="right" arrow>
                                        <span>{option.label}</span>
                                    </Tooltip>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl size="small" sx={smallSelectStyle}>
                        <InputLabel id="orientation-label">Orientation</InputLabel>
                        <Select
                            labelId="orientation-label"
                            value={pageOrientation}
                            disabled={disabled}
                            onChange={(e) => setPageOrientation(e.target.value)}
                            label="Orientation"
                        >
                            <MenuItem value="portrait">Portrait</MenuItem>
                            <MenuItem value="landscape">Landscape</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl size="small" sx={smallSelectStyle}>
                        <InputLabel id="page-size-label">Page Size</InputLabel>
                        <Select
                            labelId="page-size-label"
                            value={pageSize}
                            disabled={disabled}
                            onChange={(e) => setPageSize(e.target.value)}
                            label="Page Size"
                        >
                            <MenuItem value="A5">A5</MenuItem>
                            <MenuItem value="A4">A4</MenuItem>
                            <MenuItem value="A3">A3</MenuItem>
                            <MenuItem value="A2">A2</MenuItem>
                            <MenuItem value="Letter">Letter</MenuItem>
                            <MenuItem value="Legal">Legal</MenuItem>
                            <MenuItem value="Statement">Statement</MenuItem>
                            <MenuItem value="Executive">Executive</MenuItem>
                            <MenuItem value="Tabloid">Tabloid</MenuItem>
                            <MenuItem value="B4">B4 (JIS)</MenuItem>
                            <MenuItem value="B5">B5 (JIS)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <TextField
                        size="small"
                        label="Search"
                        sx={{
                            minWidth: 100, // or 'auto' if you want to shrink fully
                            '& .MuiInputBase-root': {
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                height: '35px', // total height including label padding
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '0.7rem',
                                top: '-4px',
                            },
                            '& .MuiInputBase-input': {
                                padding: '4px 6px',
                                fontSize: '0.8rem',
                            }
                        }}
                        value={searchTerm}
                        disabled={disabled}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        size="small"
                        sx={{
                            minWidth: 100, // or 'auto' if you want to shrink fully
                            '& .MuiInputBase-root': {
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                height: '35px', // total height including label padding
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '0.7rem',
                                top: '-4px',
                            },
                            '& .MuiInputBase-input': {
                                padding: '4px 6px',
                                fontSize: '0.8rem',
                            }
                        }}

                        label="Replace"
                        value={replaceTerm}
                        disabled={disabled}
                        onChange={(e) => setReplaceTerm(e.target.value)}
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" size="small"
                        sx={{
                            minWidth: 'auto',     // remove default min width
                            padding: '2px 6px',   // reduce padding
                            fontSize: '0.65rem'   // smaller text
                        }} color="inherit" startIcon={<ReplaceIcon />} onClick={handleReplace}>
                        Replace
                    </Button>
                </Grid>
                <Grid item>
                    <Tooltip title="Print Preview">
                        <Button variant="outlined" size="small"
                            sx={{
                                minWidth: 'auto',     // remove default min width
                                padding: '2px 6px',   // reduce padding
                                fontSize: '0.65rem'   // smaller text
                            }} onClick={handlePrintPreview} startIcon={<PrintIcon />}>
                            Preview
                        </Button>
                    </Tooltip>
                </Grid>

            </Grid>
            <div
                className={`editor-page margin-${selectedMargin}`}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    background: "white",
                }}
            >
                <ReactQuill
                    ref={quillRef}
                    value={agenda}
                    onChange={setAgenda}
                    readOnly={disabled}
                    spellCheck={true}
                    style={{ height: "100%" }}
                    modules={{
                        toolbar: [
                            [{ header: "1" }, { header: "2" }, {
                                font: [
                                    "arial", "arial-black", "algerian", "calibri", "cambria",
                                    "candara", "comic-sans-ms", "consolas", "courier-new",
                                    "georgia", "palatino", "segoe-ui", "tahoma", "times-new-roman",
                                    "trebuchet-ms", "verdana"
                                ]
                            }],
                            [{ size: Size.whitelist }],
                            [{ lineheight: ["1", "1.5", "2", "2.5", "3"] }],
                            [{ color: [] }, { background: [] }],
                            ["bold", "italic", "underline", "strike", "blockquote"],
                            [{ script: "sub" }, { script: "super" }],
                            [{ align: [] }],
                            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                            ["link", "image", "video"],
                            ["clean"],
                            ["tab"]
                        ],
                        imageResize: {
                            parchment: Quill.import('parchment'),
                            modules: ["Resize", "DisplaySize"],
                        },

                        // keyboard: {
                        //     bindings: {
                        //         indent: {
                        //             key: 9,
                        //             handler: function (range, context) {
                        //                 const currentIndent = context.format.indent || 0;
                        //                 this.quill.format("indent", currentIndent + 1);
                        //                 return false;
                        //             },
                        //         },
                        //         outdent: {
                        //             key: 9,
                        //             shiftKey: true,
                        //             handler: function (range, context) {
                        //                 const currentIndent = context.format.indent || 0;
                        //                 if (currentIndent > 0) {
                        //                     this.quill.format("indent", currentIndent - 1);
                        //                 }
                        //                 return false;
                        //             },
                        //         },
                        //     },
                        // },
                        history: {
                            delay: 500,
                            maxStack: 100,
                            userOnly: true
                        }
                    }}
                    formats={[
                        "header", "font", "size", "lineheight", "verticalalign", "margin",
                        "pagesize", "color", "background", "bold", "italic", "underline",
                        "strike", "blockquote", "script", "align", "list", "bullet",
                        "indent", "link", "image", "video"
                    ]}
                />
            </div>
            <FileNameDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleFileSave}
            />
        </>
    );
};

export default ReactQuillAdvanced;
