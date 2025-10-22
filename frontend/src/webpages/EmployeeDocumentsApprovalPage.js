import React, { useState, useEffect, useRef } from "react";
import { SERVICE } from "../services/Baseservice";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import "../App.css";
import PinIcon from "@mui/icons-material/Pin";
import hilifelogo from "../login/hilifelogo.png";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DescriptionIcon from "@mui/icons-material/Description";
import { Stack } from "@mui/material";
import moment from "moment-timezone";
import { Container, Checkbox, DialogContent, Grid, Skeleton, FormControl, OutlinedInput, FormControlLabel, Button, ListItem, Typography, List, Paper, Dialog, DialogTitle, DialogActions, Box } from "@mui/material";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useParams } from "react-router-dom";
import "./documentApproval.css";
import { useNavigate } from "react-router-dom";
import { AUTH, BASE_URL } from "../services/Authservice";
import confetti from 'canvas-confetti';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import { getCurrentServerTime } from '../components/getCurrentServerTime';
function EmployeeDocumentsApprovalPage() {

    const marginValues = {
        normal: [96, 96, 96, 96],
        narrow: [48, 48, 48, 48],
        moderate: [96, 72, 96, 72],
        wide: [96, 192, 96, 192],
        mirrored: [96, 120, 96, 96],
        office2003: [96, 120, 96, 120]
    };
    const [serverTime, setServerTime] = useState(new Date());
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
    let today = new Date(serverTime);
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    let formattedDate = yyyy + "-" + mm + "-" + dd;
    //useStates
    const [date, setDate] = useState(formattedDate);
    const [qrCodeInfoDetails, setQrCodeInfoDetails] = useState([]);
    const pxToMm = (px) => px * 0.264583;
    const convertPxArrayToMm = (arr) => arr.map(pxToMm);
    const getAdjustedMargin = (selectedMargin, headImage, footImage) => {
        const base = marginValues[selectedMargin] || marginValues['narrow'];
        let [top, right, bottom, left] = base;
        const footerReservedSpace = 60;

        top += selectedMargin === 'narrow' ? 80 : 35; // increase space for header image
        bottom += selectedMargin === 'narrow' ? 80 : 35; // increase space for footer image

        return convertPxArrayToMm([top, right, (bottom + footerReservedSpace), left]);
    };
    const getPageDimensionsTable = (pagesize, pageorientation) => {
        const dimensions = {
            A4: { portrait: [210, 297], landscape: [297, 210] },
            A3: { portrait: [297, 420], landscape: [420, 297] }
        };

        return dimensions[pagesize]?.[pageorientation] || [210, 297]; // default A4
    };
    const { id } = useParams();
    const [documentData, setDocumentData] = useState({});
    const [userLoginStatus, setUserLoginStatus] = useState({});
    const [userESignature, setESignature] = useState("");
    const [templateMail, setTemplateMail] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const [signature, setSignature] = useState("");
    const [termsAndConditions, setTermsAndConditions] = useState([]);
    const [checkedConditions, setCheckedConditions] = useState({});
    const backPage = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogTermsConditions, setOpenDialogTermsConditions] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: "", description: "", key: "" });
    const [openGreetDialog, setOpenGreetDialog] = React.useState(false);
    const [acceptedConditions, setAcceptedConditions] = useState({});
    // Handle checkbox changes
    const handleCheckboxChange = (event, condition) => {
        const { name, checked } = event.target;

        if (condition.viewmore && condition.description && checked) {
            // Open dialog instead of immediately toggling checkbox
            setDialogContent({
                title: condition.details,
                description: condition.description,
                key: condition.details,
            });
            setOpenDialogTermsConditions(true);
        } else {
            // Directly toggle checkbox state if no "See More"
            setCheckedConditions((prevState) => ({
                ...prevState,
                [name]: checked,
            }));
        }
    };
    const handleAcceptDialog = () => {
        const key = dialogContent.key;
        setAcceptedConditions((prevState) => ({
            ...prevState,
            [key]: true, // Mark as accepted
        }));
        setCheckedConditions((prevState) => ({
            ...prevState,
            [key]: true, // Enable the checkbox
        }));
        setOpenDialogTermsConditions(false);
    };

    const handleDialogClose = () => {
        setOpenDialogTermsConditions(false);
    };
    const handleViewMore = (condition) => {
        setDialogContent({ title: condition.details, description: condition.description });
        setOpenDialogTermsConditions(true);
    };
    // Check if all conditions are accepted
    const allChecked = termsAndConditions.length > 0 &&
        termsAndConditions.every((condition) => checkedConditions[condition.details]);
    // Handle approve button click
    const handleApproveClick = () => {
        setOpenDialog(true);
    };

    // Handle confirmation of submission
    const handleConfirmSubmit = () => {
        setOpenDialog(false);
        const canvas = document.getElementById('confettiCanvas');
        const myConfetti = confetti.create(canvas, { resize: true });

        // Trigger the confetti effect
        myConfetti({
            particleCount: 360,
            spread: 180,
            origin: { y: 0.8 }
        });
        setOpenGreetDialog(true)
        getApprovalDocument(documentData?.data?.sdocumentPreparation);
    };
    const TemplateDropdownsValue = async () => {
        const NewDatetime = await getCurrentServerTime();
        try {
            let res = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${id}`, {
            });
            setDocumentData(res);
            TermsAndConditionsFetching(res?.data?.sdocumentPreparation?.termsAndConditons)
            if (res?.data?.sdocumentPreparation?.person) {
                let [response, userDetails, tempControl] = await Promise.all([
                    axios.post(`${SERVICE.INDIVIDUAL_USER_LOGIN_STATUS}`, {
                        companyname: res?.data?.sdocumentPreparation?.person
                    }
                    ),
                    axios.post(`${SERVICE.USER_ESIGNATURE_FILTER}`, {
                        companyname: res?.data?.sdocumentPreparation?.person
                    }
                    ),
                    axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
                        company: res.data.sdocumentPreparation?.company,
                        branch: res.data.sdocumentPreparation?.branch,
                    })])
                if (tempControl?.data?.templatecontrolpanel) {
                    const ans = tempControl?.data?.templatecontrolpanel ?
                        tempControl?.data?.templatecontrolpanel?.templatecontrolpanellog[tempControl?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : "";
                    const qrInfoDetails = ans?.qrInfo?.length > 0 ? ans?.qrInfo : []
                    console.log(qrInfoDetails, 'qrInfoDetails')
                    setQrCodeInfoDetails(qrInfoDetails?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
                        .replaceAll('$C:DATE$', date)}`))
                }
                const usersData = response?.data?.users?.loginUserStatus?.length > 0 ? response?.data?.users?.loginUserStatus?.filter(data => data?.status === "Active") : []
                const userESignature = userDetails?.data?.semployeesignature ? userDetails?.data?.semployeesignature?.signatureimage : ""
                const userMail = userDetails?.data?.tempControlPanel ? userDetails?.data?.semployeesignature?.tempControlPanel : ""
                setUserLoginStatus(usersData?.length > 0 ? usersData[0] : {})
                setESignature(userESignature ? userESignature : "")
                setTemplateMail(userMail ? userMail : "")
                await generatePdfPreview(res, userESignature);
            }



        } catch (err) { console.log(err, '39') }
    };


    const TermsAndConditionsFetching = async (selectedids) => {
        try {
            let res = await axios.get(SERVICE.ALL_TERMSANDCONDITION, {
            });
            setTermsAndConditions(res?.data?.termsandcondition?.filter(data => selectedids?.includes(data?._id)) ?? []);
        } catch (err) { console.log(err, '39') }
    };



    const generatePdfPreview = async (response, imageView) => {
        const htmlElement = document.createElement("div");
        // htmlElement.innerHTML = response.data.sdocumentPreparation.document;
        htmlElement.innerHTML = response.data.sdocumentPreparation.document.replace(/<img[^>]*>/g, '').replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
        //     .replaceAll("$EMPLOYEESIGNATURE$", imageView ? `
        //          <span style="display: inline-flex; flex-direction: column; align-items: center; text-align: center;">
        //     <img src="${imageView}" alt="Signature" style="width: 200px; height: 30px;" />
        //     <span style="font-weight: bold; margin-top: 2px;">(${response?.data?.sdocumentPreparation?.person})</span>
        // </span>
        //     ` : "")

        // setSignature(response.data.sdocumentPreparation.document?.replaceAll("$EMPLOYEESIGNATURE$", response.data.sdocumentPreparation?.person));
        setSignature(response?.data?.sdocumentPreparation?.document?.replaceAll("$EMPLOYEESIGNATURE$", imageView ? `
          <span style="display: inline-flex; flex-direction: column; align-items: center; text-align: center;">
        <img src="${imageView}" alt="Signature" style="${response?.data?.sdocumentPreparation?.pagesize === 'A3' ? 'width: 200px !important; height: 30px !important;' : 'width: 130px !important; height: 25px !important;'}"/>
    </span>
        ` : ""));
        // Add custom styles to the HTML content
        const styleElement = document.createElement("style");
        styleElement.textContent = `
           .ql-indent-1 { margin-left: 75px; }
           .ql-indent-2 { margin-left: 150px; }
           .ql-indent-3 { margin-left: 225px; }
           .ql-indent-4 { margin-left: 275px; }
           .ql-indent-5 { margin-left: 325px; }
           .ql-indent-6 { margin-left: 375px; }
           .ql-indent-7 { margin-left: 425px; }
           .ql-indent-8 { margin-left: 475px; }
           .ql-align-right { text-align: right; } 
           .ql-align-left { text-align: left; } 
           .ql-align-center { text-align: center; } 
           .ql-align-justify { text-align: justify; } 
              .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
        }
         `;
        htmlElement.appendChild(styleElement);
        const addConfidentialWatermark = (htmlString, pageCount) => {
            let watermarkTexts =
                pageCount <= 2
                    ? ["CONFIDENTIAL"]
                    :
                    pageCount > 2 && pageCount <= 5 ?
                        ["CONFIDENTIAL", "SAMPLE DRAFT"]
                        :
                        ["CONFIDENTIAL", "SAMPLE DRAFT", "UNAUTHORIZED", "SHARING IS", "STRICTLY", "PROHIBITED"];

            return `
                        <div style="position: relative;">
                          <!-- Watermark Texts -->
                          ${watermarkTexts
                    .map(
                        (text, index) => `
                                  <div style="
                                    position: absolute;
                                    top: ${pageCount <= 2 ? 40 + index * 10 + "%" : 15 + index * 10 + "%"};
                                    left: 50%;
                                    width: 100%;
                                    height: 100%;
                                    transform: translate(-50%, -50%) rotate(-20deg);
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    font-size: 8rem;
                                    font-weight: 900;
                                    color: rgba(0, 0, 0, 0.1);
                                    text-transform: uppercase;
                                    white-space: nowrap;
                                    pointer-events: none;
                                    z-index: 1;
                                  ">
                                    ${text}
                                  </div>
                                `
                    )
                    .join("")}
                          
                          ${htmlString}
                        </div>
                      `;
        };



        const getPrintPageCount = (htmlString) => {
            const pageHeight = 297 * 3.77953; // Convert A4 paper height (in mm) to pixels
            const pageWidth = 210 * 3.77953;  // Convert A4 paper width (in mm) to pixels
            const watermarkHeight = 100; // Assuming watermark height in pixels

            // Create a temporary container to simulate the print area
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.visibility = 'hidden';
            container.style.width = `${pageWidth}px`;
            container.style.height = `${pageHeight}px`;
            container.innerHTML = htmlString;

            document.body.appendChild(container);

            // Calculate content height, assuming content doesn't overflow the container
            const contentHeight = container.scrollHeight;

            document.body.removeChild(container);

            // Calculate number of pages needed
            const pagesNeeded = Math.ceil((contentHeight + watermarkHeight) / pageHeight);

            return pagesNeeded;
        };

        // Example usage
        const pageCount = getPrintPageCount(htmlElement.outerHTML);
        // Example usages
        setHtmlContent(addConfidentialWatermark(htmlElement.outerHTML, pageCount));
        // setHtmlContent(htmlElement.outerHTML)
        // return htmlElement.outerHTML;
    };


    useEffect(() => { TemplateDropdownsValue(); }, [])
    const [mobile, setMobile] = useState("");
    const [dob, setDob] = useState("");
    const [errorValidation, setErrorValidation] = useState("");
    const [openValidation, setOpenValidation] = useState(false);
    const [otp, setOtp] = useState("");
    const [openOTPView, setOpenOTPView] = useState(false);
    const [error, setError] = useState("");
    const handleViewOpenOTP = () => {
        setOpenOTPView(true);
    };
    const handlViewCloseOTP = () => {
        setOpenOTPView(false);
        setOtp("");
        setError("");
    };
    //view popup
    const [openView, setOpenView] = useState(false);
    const handleViewOpen = () => {
        setOpenView(true);
        setOtp("");
    };
    const handlViewClose = () => {
        setOpenView(false);
        setOtp("");
    };
    const handleOpenValidation = () => {
        setOpenValidation(true);
        setErrorValidation("")
    };
    const handleCloseValidation = () => {
        setOpenValidation(false);
        setErrorValidation("");
        setMobile("");
        setDob("");
        setErrorValidation("");
    };



    const handleMobileChange = (e) => {
        const enteredValue = e.target.value.replace(/\D/, ""); // Allow digits only
        if (/^\d{0,10}$/.test(enteredValue)) {
            setMobile(enteredValue);
        }
    };

    const handleDOBChange = (e) => {
        setDob(e.target.value);
    };

    const validateAndSubmit = () => {
        if (mobile.length !== 10) {
            setErrorValidation("Mobile number must be 10 digits.");
            return;
        }
        else if (dob === "") {
            setErrorValidation("Please Select DOB");
            return;
        } else {
            verifyValidation()
        }

    };





    const checkOtp = async () => {
        try {
            let response = await axios.post(`${SERVICE.VERIFYTWOFA_EMPLOYEEAPPROVAL}`, {
                otp: String(otp),
                companyname: documentData?.data?.sdocumentPreparation?.person,
            });
            if (response.data.otpneeded == true) {
                handleViewOpenOTP();
            }
            else {
                handleOpenValidation();
            }
        } catch (err) {
            console.log(err, 'err');
        }
    };
    const verifyOtp = async () => {
        try {
            if (otp != "") {
                let response = await axios.post(`${SERVICE.VERIFYTWOFA_EMPLOYEEAPPROVAL}`, {
                    otp: String(otp),
                    companyname: documentData?.data?.sdocumentPreparation?.person,
                });
                if (response?.data?.success == true) {
                    handlViewCloseOTP();
                    const canvas = document.getElementById('confettiCanvas');
                    const myConfetti = confetti.create(canvas, { resize: true });
                    // Trigger the confetti effect
                    myConfetti({
                        particleCount: 360,
                        spread: 180,
                        origin: { y: 0.8 }
                    });
                    setOpenGreetDialog(true)
                    getApprovalDocument(documentData?.data?.sdocumentPreparation);
                } else {
                    handlViewClose();
                }
                setError("");
            } else {
                setError("Please Enter OTP");
            }
        } catch (err) {
            if (!err?.response?.data?.success) {
                setError(err?.response?.data?.message)
            }

            console.log(err, 'err')
        }
    };
    const verifyValidation = async () => {
        try {
            if (dob != "" || mobile != "") {
                let response = await axios.post(`${SERVICE.VERIFYTWOFA_EMPLOYEEAPPROVAL_VALIDATION}`, {
                    dateofbirth: String(dob),
                    mobile: String(mobile),
                    companyname: documentData?.data?.sdocumentPreparation?.person,
                });
                if (response?.data?.success == true) {
                    handleCloseValidation();
                    const canvas = document.getElementById('confettiCanvas');
                    const myConfetti = confetti.create(canvas, { resize: true });
                    // Trigger the confetti effect
                    myConfetti({
                        particleCount: 360,
                        spread: 180,
                        origin: { y: 0.8 }
                    });
                    setOpenGreetDialog(true)
                    getApprovalDocument(documentData?.data?.sdocumentPreparation);
                } else {
                    handleCloseValidation();
                    setMobile("");
                    setDob("");
                    setErrorValidation("");
                }
            }
        } catch (err) {
            const error = err?.response?.data?.message
            setErrorValidation(error)
            setMobile("");
            setDob("");
        }
    };
    const getApprovalDocument = async (data) => {
        try {
            await downloadPdfTesdtTable(data, documentData, signature)


        } catch (err) { console.log(err, 'err') }
    };
    const downloadPdfTesdtTable = async (datadetails, response, documentTemp) => {
        const pdfElement = document.createElement("div");

        pdfElement.innerHTML = documentTemp.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
        // Add custom styles to the PDF content
        const styleElement = document.createElement("style");
        styleElement.textContent = `
         .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
         .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
         .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
         .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
         .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
         .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
         .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
         .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
         .ql-align-right { text-align: right; } 
         .ql-align-left { text-align: left; } 
         .ql-align-center { text-align: center; } 
         .ql-align-justify { text-align: justify; } 
            .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
        }
       `;

        pdfElement.appendChild(styleElement);

        // pdfElement.appendChild(styleElement);
        const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
            const totalPages = doc.internal.getNumberOfPages();
            const margin = 15; // Adjust as needed
            const footerHeight = 15; // Adjust as needed
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.innerHTML = pdfElement;
            document.body.appendChild(tempDiv);
            const rect = tempDiv.getBoundingClientRect();
            const reservedSealHeight = 45;
            const actualContentHeight = rect.height * (25.4 / 96);
            const pageHeight = doc.internal.pageSize.getHeight();
            // Total usable height for content
            const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
            const contentEndY = Math.min(actualContentHeight, usableContentHeight);

            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

                // Add header
                doc.setFontSize(12);
                // doc.text(convertToNumberedList(head), pageWidth / 2, 10, { align: 'center' });
                const headerImgWidth = pageWidth * 0.95; // Adjust as needed
                const headerImgHeight = pageHeight * 0.09; // Adjust as needed
                //const headerX = (pageWidth - headerImgWidth) / 2;
                // const headerY = 6; // Adjust as needed for header position
                const headerX = 5; // Start from the left
                const headerY = 3.5; // Start from the top
                if (head !== '') {
                    doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
                }
                const imgWidth = pageWidth * 0.5; // 75% of page width
                const imgHeight = pageHeight * 0.25; // 50% of page height
                const x = (pageWidth - imgWidth) / 2;
                const y = (pageHeight - imgHeight) / 2 - 20;
                doc.setFillColor(0, 0, 0, 0.1);
                doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
                // Add footer
                doc.setFontSize(10);
                // doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                // Add footer image stretched to page width
                const footerImgWidth = pageWidth * 0.95; // Stretch to full page width
                const footerImgHeight = pageHeight * 0.067; // Adjust height as needed
                const footerX = 5; // Start from the left
                const footerY = pageHeight - footerImgHeight - 5;
                if (foot !== "") {
                    doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
                }

                // ---------- SIGNATURE & SEAL ----------
                // if (response?.data?.sdocumentPreparation?.signatureneed) {
                const signatureNeed = response?.data?.sdocumentPreparation?.signatureneed; // "All Pages" or "End Page"

                if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
                    // Decide Y position right after content but above footer
                    const imageY = contentEndY;

                    // Seal on left
                    if (response?.data?.sdocumentPreparation?.signature || response?.data?.sdocumentPreparation?.seal || response?.data?.sdocumentPreparation?.usersignature) {
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();
                        const margin = 15;
                        const footerGap = 20; // space to keep above footer

                        // --- Unified Row Position ---
                        const rowYOffset = 10; // ✅ Move row slightly lower
                        const sigWidth = 40;    // reduced from 53
                        const sigHeight = 6;    // reduced from 8

                        const sealWidth = 17;   // reduced from 25/35
                        const sealHeight = 17;  // reduced from 25/35
                        const sealUpShift = 8;
                        // ✅ Make user signature a bit wider but slightly shorter
                        const userSigWidth = 47;  // increased width
                        const userSigHeight = 20; // reduced height
                        const userSigUpShift = 11;
                        let yPos;

                        if (i === totalPages) {
                            // ✅ Use available space from bottom instead of rect.height
                            yPos = response?.data?.sdocumentPreparation?.qrCodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
                        } else {
                            yPos = contentEndY + rowYOffset;
                        }

                        const topTextHeight = 6;
                        const bottomTextHeight = 6;

                        // --- Left: Main Signature ---
                        let leftX = margin;
                        if (response?.data?.sdocumentPreparation?.signature) {
                            if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.topcontent) {
                                doc.setFontSize(8);
                                doc.setFont(undefined, "bold");
                                doc.setTextColor(83, 23, 126);
                                doc.text(response?.data?.sdocumentPreparation.topcontent, leftX, yPos - topTextHeight);
                                doc.setTextColor(0, 0, 0);
                            }

                            doc.addImage(response?.data?.sdocumentPreparation.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                            if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.bottomcontent) {
                                doc.setFontSize(8);
                                doc.setFont(undefined, "bold");
                                doc.setTextColor(83, 23, 126);
                                doc.text(
                                    response?.data?.sdocumentPreparation.bottomcontent,
                                    leftX,
                                    yPos + sigHeight + bottomTextHeight
                                );
                                doc.setTextColor(0, 0, 0);
                            }
                        }

                        // --- Center: Seal (align with same yPos) ---
                        const centerX = (pageWidth / 2) - (sealWidth / 2);
                        if (response?.data?.sdocumentPreparation?.seal) {
                            doc.addImage(response?.data?.sdocumentPreparation.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
                        }

                        // --- Right: Employee Signature (aligned with row, adjusted size) ---
                        let rightX = pageWidth - userSigWidth - margin - 10;
                        if (response?.data?.sdocumentPreparation?.usersignature) {
                            doc.addImage(
                                response?.data?.sdocumentPreparation.usersignature,
                                "PNG",
                                rightX,
                                yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                                userSigWidth,
                                userSigHeight
                            );
                        }
                    }




                }
                // }
                if (response?.data?.sdocumentPreparation?.pagenumberneed === 'All Pages') {
                    const textY = footerY - 3;
                    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
                } else if (response?.data?.sdocumentPreparation?.pagenumberneed === 'End Page' && i === totalPages) {
                    const textY = footerY - 3;
                    doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
                }
                // Add QR code and statement only on the last page

                if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "End Page") {
                    if (i === totalPages) {
                        // Add QR code in the left corner
                        const qrCodeWidth = 25; // Adjust as needed
                        const qrCodeHeight = 25; // Adjust as needed
                        const qrCodeX = footerX; // Left corner
                        const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
                        doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



                        const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                            '1. Scan to verify the authenticity of this document.',
                            `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                            `3. For questions, contact us at ${templateMail}.`
                        ];

                        // starting position
                        const statementX = qrCodeX + qrCodeWidth + 10;
                        const statementY1 = qrCodeY + 10;
                        const lineGap = 5; // vertical spacing between statements

                        doc.setFontSize(12);

                        statements.forEach((text, idx) => {
                            const y = statementY1 + (idx * lineGap);
                            doc.text(text, statementX, y);
                        });

                    }
                }
                if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "All Pages") {
                    if (i === totalPages) {
                        // Add QR code in the left corner
                        const qrCodeWidth = 25; // Adjust as needed
                        const qrCodeHeight = 25; // Adjust as needed
                        const qrCodeX = footerX; // Left corner
                        const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
                        doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



                        const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                            '1. Scan to verify the authenticity of this document.',
                            `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                            `3. For questions, contact us at ${templateMail}.`
                        ];

                        // starting position
                        const statementX = qrCodeX + qrCodeWidth + 10;
                        const statementY1 = qrCodeY + 10;
                        const lineGap = 5; // vertical spacing between statements

                        doc.setFontSize(12);

                        statements.forEach((text, idx) => {
                            const y = statementY1 + (idx * lineGap);
                            doc.text(text, statementX, y);
                        });

                    }
                    else {
                        // ✅ for all other pages → add page number + small QR code on the right
                        const textY = footerY - 3;
                        // small QR code next to it (bottom-right corner)
                        const qrCodeWidth = 15;   // smaller size
                        const qrCodeHeight = 15;
                        const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
                        const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

                        doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
                    }
                }
            }
        };

        let margins = [15, 20, 15, 20];
        let { pagesize, head, foot } = response.data.sdocumentPreparation || {};

        const hasHeaderImage = head !== ""; // assuming head is a base64 src or image URL
        const hasFooterImage = foot !== "";

        const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
        const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before

        // Convert the HTML content to PDF
        html2pdf()
            .from(pdfElement)
            .set({
                margin: adjustedMargin,
                image: { type: "jpeg", quality: 0.6 },  // Reduce from 0.98
                html2canvas: { scale: 1 },
                jsPDF: {
                    unit: "mm",
                    format: pdfDimensions,
                    orientation: response.data.sdocumentPreparation?.orientationQuill
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }).toPdf().get('pdf').then((pdf) => {
                // Convert the watermark image to a base64 string
                const img = new Image();

                if (response?.data?.sdocumentPreparation?.watermark) {
                    img.src = response?.data?.sdocumentPreparation?.watermark;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.globalAlpha = 0.1;
                        ctx.drawImage(img, 0, 0);
                        const watermarkImage = canvas.toDataURL('image/png');

                        // Add QR code image
                        if (response.data.sdocumentPreparation?.qrcode !== "") {
                            const qrImg = new Image();
                            qrImg.src = response.data.sdocumentPreparation?.qrcode;

                            qrImg.onload = () => {
                                const qrCanvas = document.createElement('canvas');
                                qrCanvas.width = qrImg.width;
                                qrCanvas.height = qrImg.height;
                                const qrCtx = qrCanvas.getContext('2d');
                                qrCtx.drawImage(qrImg, 0, 0);
                                const qrCodeImage = qrCanvas.toDataURL('image/png');
                                // Add page numbers and watermark to each page
                                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                                // pdf.output('blob').then(async(pdfBlob) => {
                                // const pdfBlob = pdf.output('blob', { type: 'application/pdf' });
                                const pdfBlob = pdf.output('blob');
                                const pdfFile = new File(
                                    [pdfBlob],
                                    `${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`,
                                    { type: 'application/pdf' }
                                );
                                const formData = new FormData();
                                formData.append("pdfFile", pdfFile);
                                formData.append("documentname", response.data.sdocumentPreparation?.documentname);
                                formData.append("username", response.data.sdocumentPreparation?.person);
                                formData.append("id", response.data.sdocumentPreparation?._id);

                                axios.post(SERVICE.EMPLOYEE_APPROVAL_FORMDATA, formData, {
                                    headers: {
                                        "Content-Type": "multipart/form-data"
                                    }
                                })
                                    .then(response => {
                                        if (response.status === 200 || response.status === 201) {
                                            // Only update the document if PDF upload is successful
                                            return axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${datadetails?._id}`, {
                                                approval: "approved",
                                                approveddate: new Date(),
                                                approvedby: datadetails?.person,
                                                document: signature
                                            });
                                        } else {
                                            throw new Error("PDF upload failed with unexpected status code: " + response.status);
                                        }
                                    })
                                    .then(() => {
                                        console.log("PDF uploaded and document updated successfully");
                                        setTimeout(() => {
                                            setOpenGreetDialog(false);
                                            window.location.href = `${BASE_URL}/dashboard`;
                                        }, 3000);
                                    })
                                    .catch(error => {
                                        if (error.response) {
                                            console.error("Server responded with an error:");
                                            console.error("Status:", error.response.status);
                                            console.error("Headers:", error.response.headers);
                                            console.error("Data:", error.response.data);
                                        } else if (error.request) {
                                            console.error("No response received:");
                                            console.error("Request:", error.request);
                                        } else {
                                            console.error("Axios error message:", error.message);
                                        }
                                        console.error("Full error object:", error);
                                    });
                            };
                        }
                    };
                } else {
                    if (response.data.sdocumentPreparation?.qrcode !== "") {
                        const qrImg = new Image();
                        qrImg.src = response.data.sdocumentPreparation?.qrcode;
                        qrImg.onload = () => {
                            const qrCanvas = document.createElement('canvas');
                            qrCanvas.width = qrImg.width;
                            qrCanvas.height = qrImg.height;
                            const qrCtx = qrCanvas.getContext('2d');
                            qrCtx.drawImage(qrImg, 0, 0);
                            const qrCodeImage = qrCanvas.toDataURL('image/png');
                            // Add page numbers and watermark to each page
                            addPageNumbersAndHeadersFooters(pdf, "", qrCodeImage);
                            // pdf.output('blob').then(async(pdfBlob) => {
                            // const pdfBlob = pdf.output('blob', { type: 'application/pdf' });

                            const pdfBlob = pdf.output('blob');
                            const pdfFile = new File(
                                [pdfBlob],
                                `${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`,
                                { type: 'application/pdf' }
                            );


                            const formData = new FormData();
                            formData.append("pdfFile", pdfFile);
                            formData.append("documentname", response.data.sdocumentPreparation?.documentname);
                            formData.append("username", response.data.sdocumentPreparation?.person);
                            formData.append("id", response.data.sdocumentPreparation?._id);

                            axios.post(SERVICE.EMPLOYEE_APPROVAL_FORMDATA, formData, {
                                headers: {
                                    "Content-Type": "multipart/form-data"
                                }
                            })
                                .then(response => {
                                    if (response.status === 200 || response.status === 201) {
                                        // Only update the document if PDF upload is successful
                                        return axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${datadetails?._id}`, {
                                            approval: "approved",
                                            approveddate: new Date(),
                                            approvedby: datadetails?.person,
                                            document: signature
                                        });
                                    } else {
                                        throw new Error("PDF upload failed with unexpected status code: " + response.status);
                                    }
                                })
                                .then(() => {
                                    console.log("PDF uploaded and document updated successfully");
                                    setTimeout(() => {
                                        setOpenGreetDialog(false);
                                        window.location.href = `${BASE_URL}/dashboard`;
                                    }, 3000);
                                })
                                .catch(error => {
                                    if (error.response) {
                                        console.error("Server responded with an error:");
                                        console.error("Status:", error.response.status);
                                        console.error("Headers:", error.response.headers);
                                        console.error("Data:", error.response.data);
                                    } else if (error.request) {
                                        console.error("No response received:");
                                        console.error("Request:", error.request);
                                    } else {
                                        console.error("Axios error message:", error.message);
                                    }
                                    console.error("Full error object:", error);
                                });

                        };
                    }
                }

            });
    };


    useEffect(() => {
        // Disable right-click
        const handleRightClick = (event) => {
            event.preventDefault();
        };

        // Disable Ctrl + P (print)
        const handlePrint = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                alert('Printing is disabled on this page.');
            }
        };

        // Disable copy and paste
        const handleCopy = (event) => {
            event.preventDefault();
            alert('Copying is disabled on this page.');
        };

        const handlePaste = (event) => {
            event.preventDefault();
            alert('Pasting is disabled on this page.');
        };

        // Attach event listeners
        document.addEventListener('contextmenu', handleRightClick); // Disable right-click
        document.addEventListener('keydown', handlePrint); // Disable print (Ctrl + P)
        document.addEventListener('copy', handleCopy); // Disable copy
        document.addEventListener('paste', handlePaste); // Disable paste

        // Cleanup event listeners when the component is unmounted
        return () => {
            document.removeEventListener('contextmenu', handleRightClick);
            document.removeEventListener('keydown', handlePrint);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    return (
        <>
            <div style={{ zIndex: 20 }}>
                <div
                    style={{
                        textAlign: "center",
                        paddingTop: "50px",
                    }}
                >
                    <div
                        style={{
                            padding: "10px",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            backgroundColor: "black",
                            zIndex: 1,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                                src={hilifelogo}
                                alt="Logo"
                                style={{ height: "50px", width: "auto", marginRight: "10px" }}
                            />
                            <h2 style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
                                HIHRMS
                            </h2>
                        </div>
                    </div>

                </div>
                <div style={{ marginTop: "60px", display: "flex", justifyContent: "flex-end", padding: "10px" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.href = `${BASE_URL}/dashboard`
                        }
                    >
                        Back
                    </Button >
                </div >
                <br />

                {
                    (documentData && documentData?.data?.sdocumentPreparation) ?
                        <Box>
                            <Container
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",  // Left align content
                                    justifyContent: "center",
                                    minHeight: "90vh",
                                    padding: "40px",
                                    marginTop: "60px",
                                    marginBottom: "60px",
                                    background: "linear-gradient(135deg, #f3f3f3 0%, #e8e8e8 100%)",
                                    borderRadius: "20px",
                                    boxShadow: "0 10px 30px #336aeb",
                                    border: "2px solid rgb(14, 15, 15)",
                                    transition: "all 0.3s ease-in-out",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.3)",
                                    },
                                }}
                            >
                                <br />
                                <br />
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                {/* {console.log(htmlContent , 'htmlContent')} */}
                                <br />
                                <br />
                                {termsAndConditions?.length > 0 &&
                                    <>
                                        <Typography
                                            variant="h4"
                                            gutterBottom
                                            sx={{ textAlign: "left", fontWeight: "bold", width: "100%" }}
                                        >
                                            Terms and Conditions
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            paragraph
                                            sx={{ textAlign: "left", width: "100%", lineHeight: "0.2" }} // Set lineHeight for better control
                                        >
                                            Please read and accept the following terms and conditions to proceed.
                                        </Typography>

                                        {termsAndConditions?.map((condition) => (
                                            <FormControlLabel
                                                key={condition.details}
                                                control={
                                                    <Checkbox
                                                        checked={checkedConditions[condition.details] || false}
                                                        onChange={(event) => handleCheckboxChange(event, condition)}
                                                        name={condition.details}
                                                        disabled={condition.viewmore && condition.description && !acceptedConditions[condition.details]}
                                                    />
                                                }
                                                label={
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <Typography sx={{ lineHeight: "1.2", marginBottom: "0px" }}>
                                                            {condition.details}
                                                        </Typography>
                                                        {condition.viewmore && condition.description && (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => {
                                                                    setDialogContent({
                                                                        title: condition.details,
                                                                        description: condition.description,
                                                                        key: condition.details,
                                                                    });
                                                                    setOpenDialogTermsConditions(true);
                                                                }}
                                                                className="ui-btn"
                                                                sx={{ marginLeft: "16px" }}
                                                            >
                                                                <span>See More</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                }
                                                sx={{ display: "flex", alignItems: "center" }}
                                            />
                                        ))
                                        }
                                    </>
                                }


                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={termsAndConditions?.length > 0 ? !allChecked : false}
                                    onClick={checkOtp}
                                    fullWidth
                                    className="ui-btn"
                                >
                                    <span>Accept</span>
                                </Button>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        marginTop: "30px",
                                        textAlign: "center",
                                        fontSize: "0.85rem",
                                        fontWeight: "bold",
                                        color: "red",
                                        borderTop: "1px solid #ccc",
                                        paddingTop: "10px",
                                        width: "100%",
                                    }}
                                >
                                    ⚠️ Property of TTS Business Services. Unauthorized sharing is strictly prohibited.
                                </Typography>

                            </Container>
                            <Dialog
                                open={openDialog}
                                onClose={() => setOpenDialog(false)}
                                sx={{
                                    '& .MuiDialog-paper': {
                                        borderRadius: '20px',
                                        padding: '20px',
                                        minWidth: '400px',
                                        background: '#1E1E2E',
                                        color: '#FFFFFF',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                <DialogTitle>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <WarningAmberIcon sx={{ color: "#FAC921", fontSize: 32 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FAC921' }}>
                                            Are you sure?
                                        </Typography>
                                    </Stack>
                                </DialogTitle>

                                <DialogContent>
                                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                        This action cannot be undone. Please confirm your decision.
                                    </Typography>
                                </DialogContent>

                                <DialogActions sx={{ justifyContent: "space-between", paddingX: 3 }}>
                                    <Button
                                        onClick={() => setOpenDialog(false)}
                                        variant="contained"
                                        color="error"
                                        sx={{
                                            borderRadius: '8px',
                                            paddingX: '20px',
                                            textTransform: 'none',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        No
                                    </Button>
                                    <Button
                                        onClick={handleConfirmSubmit}
                                        variant="contained"
                                        color="primary"
                                        autoFocus
                                        sx={{
                                            borderRadius: '8px',
                                            paddingX: '20px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976D2',
                                            '&:hover': {
                                                backgroundColor: '#135BA1',
                                            }
                                        }}
                                    >
                                        Yes
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog
                                open={openGreetDialog}
                                onClose={() => setOpenGreetDialog(false)}
                                sx={{
                                    '& .MuiDialog-paper': {
                                        borderRadius: '20px',
                                        padding: '20px',
                                        minWidth: '400px',
                                        background: '#1E1E2E',
                                        color: '#FFFFFF',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                <DialogTitle>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 32 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                            Thank You!
                                        </Typography>
                                    </Stack>
                                </DialogTitle>

                                <DialogContent>
                                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                        We appreciate your approval. Your support means a lot to us!
                                    </Typography>
                                </DialogContent>
                            </Dialog>
                            <Dialog
                                open={openOTPView}
                                onClose={handlViewCloseOTP}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                                maxWidth="xs"
                                sx={{
                                    '& .MuiDialog-paper': {
                                        borderRadius: '20px',
                                        padding: '30px',
                                        minWidth: '400px',
                                        background: '#1E1E2E',
                                        color: '#FFFFFF',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                <DialogContent>
                                    <Grid container spacing={3} justifyContent="center">
                                        <Grid item xs={12} display="flex" justifyContent="center">
                                            <PinIcon
                                                sx={{
                                                    fontSize: "100px",
                                                    color: "#FAC921",
                                                    textAlign: "center",
                                                    animation: "pulse 1.5s infinite",
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} display="flex" justifyContent="center">
                                            <FormControl sx={{ width: "100%", maxWidth: "300px", textAlign: "center" }}>
                                                <Typography variant="h6" fontWeight="bold" color="#FAC921" gutterBottom>
                                                    Enter Two Factor OTP
                                                    <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <OutlinedInput
                                                    id="component-outlined"
                                                    type="text"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => {
                                                        const enteredValue = e.target.value.replace(/\D/, "");
                                                        if (/^\d{0,6}$/.test(enteredValue)) {
                                                            setOtp(enteredValue);
                                                        }
                                                    }}
                                                    inputProps={{
                                                        maxLength: 6,
                                                    }}
                                                    sx={{
                                                        borderRadius: "10px",
                                                        backgroundColor: "#fff",
                                                        "& .MuiOutlinedInput-input": {
                                                            fontSize: "15px",
                                                            textAlign: "center",
                                                            letterSpacing: "5px",
                                                        },
                                                    }}
                                                />
                                                {error && (
                                                    <Typography sx={{ color: "red", fontSize: "0.9rem", marginTop: "10px" }}>
                                                        {error}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions sx={{ backgroundColor: "#2A2A3B", borderRadius: "0 0 20px 20px" }}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            padding: "10px 30px",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                            borderRadius: "8px",
                                            backgroundColor: "#1976D2",
                                            '&:hover': {
                                                backgroundColor: "#135BA1",
                                            }
                                        }}
                                        onClick={verifyOtp}
                                    >
                                        Verify
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handlViewCloseOTP();
                                            setOtp("");
                                            setError("");
                                        }}
                                        sx={{
                                            padding: "10px 30px",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                            borderRadius: "8px",
                                            color: "#FFFFFF",
                                            border: "1px solid #FAC921",
                                            '&:hover': {
                                                backgroundColor: "#FAC921",
                                                color: "#000",
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog
                                open={openValidation}
                                onClose={handleCloseValidation}
                                maxWidth="xs"
                                sx={{
                                    '& .MuiDialog-paper': {
                                        borderRadius: "20px",
                                        padding: "30px",
                                        minWidth: "400px",
                                        background: "#1E1E2E",
                                        color: "#FFFFFF",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                    },
                                }}
                            >
                                <DialogContent>
                                    <Grid container spacing={3} justifyContent="center">
                                        <Grid item xs={12} display="flex" justifyContent="center">
                                            <ShieldIcon
                                                sx={{
                                                    fontSize: "80px",
                                                    color: "#FAC921",
                                                    animation: "pulse 1.5s infinite",
                                                }}
                                            />                                </Grid>
                                        <Grid item xs={12} display="flex" justifyContent="center">
                                            <FormControl sx={{ width: "100%", maxWidth: "300px", textAlign: "center" }}>
                                                <Typography variant="h8" fontWeight="bold" color="#FAC921" gutterBottom>
                                                    Enter Mobile Number<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <OutlinedInput
                                                    type="text"
                                                    placeholder="Enter Mobile Number"
                                                    value={mobile}
                                                    onChange={handleMobileChange}
                                                    inputProps={{
                                                        maxLength: 10,
                                                    }}
                                                    sx={{
                                                        borderRadius: "10px",
                                                        backgroundColor: "#fff",
                                                        "& .MuiOutlinedInput-input": {
                                                            fontSize: "15px",
                                                            textAlign: "center",
                                                            letterSpacing: "2px",
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} display="flex" justifyContent="center">
                                            <FormControl sx={{ width: "100%", maxWidth: "300px", textAlign: "center" }}>
                                                <Typography variant="h8" fontWeight="bold" color="#FAC921" gutterBottom>
                                                    Enter Date of Birth<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <OutlinedInput
                                                    type="date"
                                                    value={dob}
                                                    onChange={handleDOBChange}
                                                    sx={{
                                                        borderRadius: "10px",
                                                        backgroundColor: "#fff",
                                                        "& .MuiOutlinedInput-input": {
                                                            fontSize: "15px",
                                                            textAlign: "center",
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        {errorValidation && (
                                            <Typography sx={{ color: "red", fontSize: "0.9rem", marginTop: "10px" }}>
                                                {errorValidation}
                                            </Typography>
                                        )}
                                    </Grid>
                                </DialogContent>
                                <DialogActions sx={{ backgroundColor: "#2A2A3B", borderRadius: "0 0 20px 20px" }}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            padding: "10px 30px",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                            borderRadius: "8px",
                                            backgroundColor: "#1976D2",
                                            "&:hover": {
                                                backgroundColor: "#135BA1",
                                            },
                                        }}
                                        onClick={validateAndSubmit}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleCloseValidation();
                                            setMobile("");
                                            setDob("");
                                            setErrorValidation("");
                                        }}
                                        sx={{
                                            padding: "10px 30px",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                            borderRadius: "8px",
                                            color: "#FFFFFF",
                                            border: "1px solid #FAC921",
                                            "&:hover": {
                                                backgroundColor: "#FAC921",
                                                color: "#000",
                                            },
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog
                                open={openDialogTermsConditions}
                                onClose={handleDialogClose} // Do nothing on close
                                sx={{
                                    "& .MuiDialog-paper": {
                                        borderRadius: "20px",
                                        padding: "20px",
                                        minWidth: "400px",
                                        background: "#1E1E2E",
                                        color: "#FFFFFF",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                    },
                                }}
                            >
                                <DialogTitle>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <DescriptionIcon sx={{ color: "#FAC921", fontSize: 32 }} />
                                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FAC921" }}>
                                            {dialogContent.title}
                                        </Typography>
                                    </Stack>
                                </DialogTitle>

                                <DialogContent>
                                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                        {dialogContent.description}
                                    </Typography>
                                </DialogContent>
                                <DialogActions sx={{ justifyContent: "center", paddingX: 3 }}>
                                    <Button
                                        onClick={handleAcceptDialog}
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            borderRadius: "8px",
                                            paddingX: "20px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            backgroundColor: "#1976D2",
                                            "&:hover": {
                                                backgroundColor: "#135BA1",
                                            },
                                        }}
                                    >
                                        Accept
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                        :
                        <div class="progress" style={{ zIndex: 20 }}><div class="bar"></div></div>
                }

            </div >
        </>
    );
}

export default EmployeeDocumentsApprovalPage;