import React, { useState, useEffect, useContext, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../../../services/Authservice";
import {
  Box,
  Typography,
  OutlinedInput,
  MenuItem,
  Popover,
  Divider,
  TextareaAutosize,
  Dialog,
  FormControl,
  Grid,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormGroup,
  FormControlLabel,
  Checkbox,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { userStyle } from "../../../pageStyle";
import QRCode from "qrcode";
import { handleApiError } from "../../../components/Errorhandling";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { saveAs } from "file-saver";
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import { ThreeDots } from "react-loader-spinner";
import domtoimage from "dom-to-image";
import { useReactToPrint } from "react-to-print";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import csvIcon from "../../../components/Assets/CSV.png";
import excelIcon from "../../../components/Assets/excel-icon.png";
import fileIcon from "../../../components/Assets/file-icons.png";
import pdfIcon from "../../../components/Assets/pdf-icon.png";
import wordIcon from "../../../components/Assets/word-icon.png";
import "jspdf-autotable";
import {
  hoursTimeOpt,
  minutesTimeOpt,
} from "../../../components/Componentkeyword";
import axios from "../../../axiosInstance";
import { SERVICE } from "../../../services/Baseservice";
import { AiOutlineClose } from "react-icons/ai";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  UserRoleAccessContext,
  AuthContext,
} from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import { getCurrentServerTime } from "../../../components/getCurrentServerTime";
import moment from "moment";
import Selects from "react-select";
import Select, { components } from "react-select";
import { FixedSizeList as List } from "react-window";
import AsyncSelect from "react-select/async";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ManageColumnsContent from "../../../components/ManageColumn";
import ExportData from "../../../components/ExportData";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import AlertDialog from "../../../components/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import { MultiSelect } from "react-multi-select-component";

function ManageSalesList() {
  const {
    isUserRoleCompare,
    isUserRoleAccess,
    isAssignBranch,
    allUsersLimit,
    pageName,
    setPageName,
    buttonStyles,
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [serverTime1, setServerTime1] = useState(moment());
  const [serverTime, setServerTime] = useState(null);
  const [currentGoldRate, setCurrentGoldRate] = useState(0);
  const [currentSilverRate, setCurrentSilverRate] = useState(0);
  const [rateValue, setRateValue] = useState(0);
  const gridRefTableView = useRef(null);
  const gridRefTableImgView = useRef(null);

  const [companyOpt, setCompanyOpt] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [viewDataCount, setViewDataCount] = useState(0);
  const [branchOpt, setBranchOpt] = useState([]);
  const [prodTypeOpt, setProdTypeOpt] = useState([]);

  const [cusOptions, setCusOptions] = useState([]);
  const [branchString, setBranchString] = useState("");
  const [prodString, setProdString] = useState("");
  const [sRInvoiceOptions, setSRInvoiceOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [salesItemParticularsOpt, setSalesItemParticularsOpt] = useState([]);
  const [salesItemTypeFromParticular, setSalesItemTypeFromParticular] =
    useState("");
  const [salesItemTypeFromParticularSR, setSalesItemTypeFromParticularSR] =
    useState("");
  const [oldItemPurticularsOpt, setOldItemPurticularsOpt] = useState([]);
  const [oldItemFromItems, setOldItemFromItems] = useState([]);
  const [isSoldBillno, setIsSoldBillno] = useState([]);
  const [isSoldItems, setIsSoldItems] = useState([]);
  const [totalSalesReturnAmount, setTotalSalesReturnAmount] = useState("0.00");
  const [handlingSalesReturnAmount, setHandlingSalesReturnAmount] =
    useState("0.00");

  const [isNewCusDetails, setIsNewCusDetails] = useState({
    isNewCusValue: false,
    customername: "",
    customeraddress: "TRICHY",
    customercontactprefix: "+91",
    customercontact: "",
    bnoteprefix: "TRI/S/",
    bnoteno: "TRI/S/",
  });
  const [isNewBNote, setIsNewBNote] = useState({
    isNewValue: false,
    bnoteno: "TRI/S/",
  });
  const [isNewSReturn, setIsNewSReturn] = useState({
    isNewValue: false,
    salesreturnno: "TRI/SR/",
  });
  const [isAuto, setIsAuto] = useState(false);
  const [billNoError, setBillNoError] = useState("");
  const [allManageSales, setAllManageSales] = useState([]);
  const [isBtn, setIsBtn] = useState(false);
  const [isSalesAmt, setIsSalesAmt] = useState("0.00");
  const [isNetAmt, setIsNetAmt] = useState("0.00");

  let newval = `${branchString}/${prodString}/1`;
  const [billNoAuto, setBillNoAuto] = useState(newval);
  const [lastBillNo, setLastBillNo] = useState("");
  const [isAddNew, setIsAddNew] = useState(false);
  const [isAddNewSR, setIsAddNewSR] = useState(false);
  const [addedNewOldItem, setAddedNewOldItem] = useState([]);
  const [addedNewSRItem, setAddedNewSRItem] = useState([]);

  const [manageSalesItem, setManageSalesItem] = useState({
    productname: "Please Select Particulars",
    productcode: "",
    producttype: "",
    productsize: "",
    productgst: "",
    productitemcoderunningnumber: "",
    hsn: "",
    pieces: 1,
    weight: "",
    rate: "",
    value: "",
    makingchargemode: "",
    originalmc: "",
    mcgramamount: "0.00",
    makingcharge: "0.00",
    mc: "",
    lesstype: "Fixed",
    less: "0.00",
    grossamount: "",
    cgstper: "0.00",
    sgstper: "0.00",
    cgst: "",
    sgst: "",
    salestype: "",
    salesamount: "",
  });
  const [manageOldItem, setManageOldItem] = useState({
    productname: "Please Select Particulars",
    productcode: "",
    producttype: "",
    productsize: "",
    productgst: "",
    bnoteno: "TRI/S/",
    hsn: "",
    pieces: 1,
    originalweight: "0.000",
    stoneweight: "0.000",
    correctweight: "0.000",
    waste: "",
    olddefaultwastage: 0,
    oldminimumwastage: 0,
    oldmaximumwastage: 0,
    wastediscount: "0.00",
    actualweight: "",
    rate: "",
    value: "",
    grossamount: "",
    cgstper: "0.00",
    sgstper: "0.00",
    cgst: "",
    sgst: "",
    salestype: "",
    boughtnoteamount: "",
    status: "",
  });
  const [manageSalesReturnItem, setManageSalesReturnItem] = useState({
    productname: "Please Select Particulars",
    productcode: "",
    producttype: "",
    productsize: "",
    productgst: "",
    productitemcoderunningnumber: "",
    salesreturnno: "TRI/SR/",
    hsn: "",
    pieces: 1,
    weight: "",
    rate: "",
    value: "",
    makingchargemode: "",
    originalmc: "",
    mcgramamount: "0.00",
    makingcharge: "0.00",
    mc: "",
    lesstype: "Fixed",
    less: "0.00",
    grossamount: "",
    cgstper: "0.00",
    sgstper: "0.00",
    cgst: "",
    sgst: "",
    salestype: "",
    salesamount: "",
  });

  const [salesItemTodo, setSalesItemTodo] = useState([]);
  const [salesItemTodoProd, setSalesItemTodoProd] = useState([]);
  const [oldItemTodo, setOldItemTodo] = useState([]);
  const [salesReturnItemTodo, setSalesReturnItemTodo] = useState([]);
  const [isCusContact, setIsCusContact] = useState(false);
  const [cusOptions1, setCusOptions1] = useState([]);
  const [isCusOpeningBal, setIsCusOpeningBal] = useState([]);
  const [isAdvanceAmt, setIsAdvanceAmt] = useState("0.00");
  const [isBNoteAmount, setIsBNoteAmount] = useState("0.00");
  const [isSRAmount, setIsSRAmount] = useState("0.00");
  const [isCusOpeningBalCheck, setIsCusOpeningBalCheck] = useState(false);
  const [isCusAdvanceBalCheck, setIsCusAdvanceBalCheck] = useState(false);
  const [salesTaxGroupsArray, setSalesTaxGroupsArray] = useState([]);
  const [oldTaxGroupsArray, setOldTaxGroupsArray] = useState([]);
  const [refImageBill, setRefImageBill] = useState([]);
  const [refImageBillFileNames, setRefImageBillFileNames] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [file, setFile] = useState();

  // letter headd options
  const HeaderDropDowns = [
    { label: "With Letter Head", value: "With Letter Head" },
    { label: "Without Letter Head", value: "Without Letter Head" },
  ];
  const WithHeaderOptions = [
    { value: "With Head content", label: "With Head content" },
    { value: "With Footer content", label: "With Footer content" },
  ];
  const [pagePopeOpen, setPagePopUpOpen] = useState("");
  const [isOpenLetterHeadPopup, setIsLetterHeadPopup] = useState(false);
  const [headerOptions, setHeaderOptions] = useState(
    "Please Select Print Options"
  );
  const [HeaderOptionsButton, setHeaderOptionsButton] = useState(false);
  const [printLayout, setPrintLayout] = useState(false);
  const [selectedHeadOpt, setSelectedHeadOpt] = useState([]);
  const [personId, setPersonId] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setfooter] = useState("");

  const handlePrintingLayout = () => {
    if (headerOptions === "Please Select Print Options") {
      setPrintLayout(false);
      // setButtonLoadingPreview(false);
      setPopupContentMalert("Please Select Print Options!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      headerOptions === "With Letter Head" &&
      selectedHeadOpt?.length < 1
    ) {
      setPrintLayout(true);
      setPopupContentMalert("Please Select With Letter Head!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      // setPrintLayout(true);
      setIsLetterHeadPopup(false);
      // console.log(header, 'header', footer, 'footer');
    }
  };

  const handleHeadChangeAdd = (options) => {
    let value = options.map((a) => {
      return a.value;
    });

    if (value?.length === 1 && value?.includes("With Head content")) {
      setHeader(personId?.headerimage);
    } else if (value?.length === 1 && value?.includes("With Footer content")) {
      setfooter(personId?.footerimage);
    } else if (value?.length > 1) {
      setHeader(personId?.headerimage);
      setfooter(personId?.footerimage);
    } else {
      setHeader("");
      setfooter("");
    }
    setSelectedHeadOpt(options);
  };
  const customValueRenderHeadFromAdd = (valueCate) => {
    return valueCate.length
      ? valueCate.map(({ label }) => label).join(", ")
      : "Please Select Letter Head";
  };

  const handleClickOpenLetterHeader = (page) => {
    setPagePopUpOpen(page);
    setIsLetterHeadPopup(true);
  };
  const handleClickCloseLetterHead = () => {
    setPagePopUpOpen("");
    setIsLetterHeadPopup(false);
    setHeaderOptions("Please Select Print Options");
  };

  const [imageUrl, setImageUrl] = useState("");
  const generateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(`
      Company: ${manageSalesCommon.company}
      Branch: ${manageSalesCommon.branch}      
      Customer: ${manageSalesCommon.customername}
      Date: ${manageSalesCommon.date}
      Time: ${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${
        manageSalesCommon.time
      }
      Bill No: ${isAuto === true ? manageSalesCommon.billno : billNoAuto}
      Address: ${manageSalesCommon.customeraddress}
      Contact: ${manageSalesCommon.customercontact}
    `);
      setImageUrl(response);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };
  useEffect(() => {
    generateQrCode();
  }, []);

  async function convertFileUrlToBase64(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // This will be data:image/png;base64,xxxx
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  const getHeaderFooterImages = async (companyValue, branchValue) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: companyValue,
        branch: branchValue,
      });
      if (res?.data?.templatecontrolpanel) {
        const ans = res?.data?.templatecontrolpanel
          ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[
              res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length -
                1
            ]
          : "";
        const templateHeaderFooter = res?.data?.headerfooter;

        const headerOption = ans?.letterheadcontentheader?.find(data => data?.default === "default");
        const footerOption = ans?.letterheadcontentfooter?.find(data => data?.default === "default");
        const header = await convertFileUrlToBase64(
          `${BASE_URL}/templatecontrolpanel/${headerOption?.headerimage?.name}`
        );
        const footer = await convertFileUrlToBase64(
          `${BASE_URL}/templatecontrolpanel/${footerOption?.footerimage?.name}`
        );
        // const backgroundimage = await convertFileUrlToBase64(
        //   `${BASE_URL}/templatecontrolpanel/${ans?.letterheadbodycontent?.name}`
        // );
        const headerFooterBase64 = {
          ...ans,
          headerimage: header,
          footerimage: footer,
          // backgroundimage: backgroundimage,
        };
        setPersonId(headerFooterBase64);
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const [gstnValue, setGstnValue] = useState("");
  const [discriptionValue, setDiscriptionValue] = useState([]);
  const [contentValue, setContentValue] = useState([]);
  const getGSTN = async (companyValue, branchValue, prodtype) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.PRODUCTCONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      if (res?.data?.productcontrolpanels.length > 0) {
        // setDiscriptionValue(res?.data?.productcontrolpanels[0]?.contentdetail);
        const todoData = res?.data?.productcontrolpanels?.flatMap(
          (data) => data.todos
        );
        const filteredTodoData = todoData?.filter(
          (data) => data.producttype === prodtype
        );
        setDiscriptionValue(filteredTodoData);
        setContentValue(
          res?.data?.productcontrolpanels?.flatMap((data) => data.todossales)
        );
        const data = todoData?.filter(
          (data) =>
            companyValue?.includes(data.company) &&
            branchValue?.includes(data.branch)
        );
        setGstnValue(data[0]?.gstinnumber);
      }
    } catch (err) {
      console.log(err);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  // const generatePDF = async (mode) => {
  //   const input = document.getElementById('bill-layout-container');
  //   if (!input) return;

  //   // Use html2canvas to capture the DOM
  //   const canvas = await html2canvas(input, {
  //     scale: 2, // better resolution
  //     useCORS: true, // allow cross-origin images
  //     backgroundColor: '#fff',
  //   });

  //   const imgData = canvas.toDataURL('image/png');
  //   const pdf = new jsPDF('p', 'mm', 'a4');

  //   // Calculate image dimensions to fit A4 exactly
  //   const pdfWidth = 210;
  //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  //   if (mode === 'download') {
  //     pdf.save(`Invoice_${manageSalesCommon.billno || 'Bill'}.pdf`);
  //   } else if (mode === 'preview') {
  //     const pdfBlob = pdf.output('blob');
  //     const pdfUrl = URL.createObjectURL(pdfBlob);
  //     window.open(pdfUrl, '_blank');
  //   }
  // };

  // const generatePDF = async (mode) => {
  //   const input = document.getElementById('bill-layout-container');
  //   if (!input) return;

  //   // Capture the element as canvas
  //   const canvas = await html2canvas(input, {
  //     scale: 3, // higher scale = sharper output
  //     useCORS: true,
  //     backgroundColor: '#ffffff',
  //     scrollY: -window.scrollY, // ensure full capture from top
  //   });

  //   const imgData = canvas.toDataURL('image/png');

  //   // A4 size in mm
  //   const pdfWidth = 210;
  //   const pdfHeight = 297;

  //   // Convert canvas height to PDF mm scale
  //   const pageHeight = (canvas.height * pdfWidth) / canvas.width;
  //   let heightLeft = pageHeight;
  //   let position = 0;

  //   const pdf = new jsPDF('p', 'mm', 'a4');

  //   // Add first page
  //   pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
  //   heightLeft -= pdfHeight;

  //   // If content exceeds one page, add more pages
  //   while (heightLeft > 0) {
  //     position = heightLeft - pageHeight;
  //     pdf.addPage();
  //     pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
  //     heightLeft -= pdfHeight;
  //   }

  //   if (mode === 'download') {
  //     pdf.save(`Invoice_${manageSalesCommon.billno || 'Bill'}.pdf`);
  //   } else if (mode === 'preview') {
  //     const pdfBlob = pdf.output('blob');
  //     const pdfUrl = URL.createObjectURL(pdfBlob);
  //     window.open(pdfUrl, '_blank');
  //   }
  // };

  const generatePDF1 = async (mode) => {
    const input = document.getElementById("bill-layout-container");
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Add Page Numbers
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(8);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica");
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdf.internal.pageSize.getWidth() - 110,
        pdf.internal.pageSize.getHeight() - 27
      );
    }

    if (mode === "download") {
      pdf.save(`Invoice_${manageSalesCommon.billno || "Bill"}.pdf`);
    } else if (mode === "preview") {
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  const generatePDF2 = async (mode) => {
    const input = document.getElementById("bill-layout-container");
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Convert canvas height to PDF scale
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add the rest of the pages
    while (heightLeft > 1) {
      // use > 1 to prevent rounding-based blank page
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Add page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 27, {
        align: "center",
      });
    }

    if (mode === "download") {
      pdf.save(`Invoice_${manageSalesCommon.billno || "Bill"}.pdf`);
    } else if (mode === "preview") {
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  // const generatePDFerr = async (mode) => {
  //   const header = document.getElementById('pdf-header-section');
  //   const content = document.getElementById('pdf-content-section');
  //   const footer = document.getElementById('pdf-footer-section');

  //   if (!header || !content || !footer) {
  //     console.error('Missing header, content, or footer section');
  //     return;
  //   }

  //   // Wait for all images to finish loading
  //   const waitForImages = async (element) => {
  //     const imgs = element.querySelectorAll('img');
  //     await Promise.all(
  //       Array.from(imgs).map(
  //         (img) =>
  //           new Promise((resolve) => {
  //             if (img.complete) resolve();
  //             else {
  //               img.onload = resolve;
  //               img.onerror = resolve;
  //             }
  //           })
  //       )
  //     );
  //   };

  //   await Promise.all([waitForImages(header), waitForImages(content), waitForImages(footer)]);

  //   // Capture sections as canvases
  //   const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
  //     html2canvas(header, { scale: 2, useCORS: true, backgroundColor: '#fff' }),
  //     html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#fff' }),
  //     html2canvas(footer, { scale: 2, useCORS: true, backgroundColor: '#fff' }),
  //   ]);

  //   const headerImg = headerCanvas.toDataURL('image/png');
  //   const contentImg = contentCanvas.toDataURL('image/png');
  //   const footerImg = footerCanvas.toDataURL('image/png');

  //   // Validate image data
  //   if (!headerImg || !contentImg || !footerImg) {
  //     console.error('One or more section images are empty or corrupted.');
  //     return;
  //   }

  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pdfWidth = 210;
  //   const pdfHeight = 297;

  //   const headerHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
  //   const contentHeight = (contentCanvas.height * pdfWidth) / contentCanvas.width;
  //   const footerHeight = (footerCanvas.height * pdfWidth) / footerCanvas.width;

  //   let heightLeft = contentHeight;
  //   let position = 0;
  //   let page = 1;

  //   while (heightLeft > 0) {
  //     if (page > 1) pdf.addPage();

  //     pdf.addImage(headerImg, 'PNG', 0, 0, pdfWidth, headerHeight);

  //     const contentY = -(pdfHeight - headerHeight - footerHeight) * (page - 1);
  //     pdf.addImage(contentImg, 'PNG', 0, headerHeight + contentY, pdfWidth, contentHeight);

  //     pdf.addImage(footerImg, 'PNG', 0, pdfHeight - footerHeight, pdfWidth, footerHeight);

  //     heightLeft -= pdfHeight - headerHeight - footerHeight;
  //     page++;
  //   }

  //   // Add Page Numbers
  //   const totalPages = pdf.internal.getNumberOfPages();
  //   pdf.setFontSize(9);
  //   for (let i = 1; i <= totalPages; i++) {
  //     pdf.setPage(i);
  //     pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 5, { align: 'center' });
  //   }

  //   // Save or Preview
  //   if (mode === 'download') {
  //     pdf.save(`Invoice_${manageSalesCommon.billno || 'Bill'}.pdf`);
  //   } else {
  //     const pdfBlob = pdf.output('blob');
  //     const pdfUrl = URL.createObjectURL(pdfBlob);
  //     window.open(pdfUrl, '_blank');
  //   }
  // };

  const generatePDFveeee = async (mode, headerOptions) => {
    const header = document.getElementById("pdf-header-section");
    const content = document.getElementById("pdf-content-section");
    const footer = document.getElementById("pdf-footer-section");

    if (!header || !content || !footer) return;

    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([
      waitForImages(header),
      waitForImages(content),
      waitForImages(footer),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 500)); // ensure layout stable

    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, { scale: 2, useCORS: true, backgroundColor: "#fff" }),
      html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(footer, { scale: 2, useCORS: true, backgroundColor: "#fff" }),
    ]);

    const headerImg = headerCanvas.toDataURL("image/png");
    const contentImg = contentCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const isValidBase64Image = (imgData) =>
      imgData &&
      imgData.startsWith("data:image/png;base64,") &&
      imgData.length > 10000;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;

    const headerHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
    const contentHeight =
      (contentCanvas.height * pdfWidth) / contentCanvas.width;
    const footerHeight = (footerCanvas.height * pdfWidth) / footerCanvas.width;

    let heightLeft = contentHeight;
    let position = 0;
    let page = 1;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerImgWidth = pageWidth * 0.95; // Adjust as needed
    const headerImgHeight = pageHeight * 0.09; // Adjust as needed
    const headerX = 5; // Start from the left
    const headerY = 3.5; // Start from the top

    while (heightLeft > 0) {
      if (page > 1) pdf.addPage();

      if (headerOptions === "With Letter Head") {
        if (isValidBase64Image(headerImg))
          pdf.addImage(
            headerImg,
            "PNG",
            headerX,
            headerY,
            headerImgWidth,
            headerImgHeight,
            "",
            "FAST",
            0.1
          );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(headerX, headerY, headerImgWidth, headerImgHeight, "F"); // "F" = filled rectangle
      }

      // if (isValidBase64Image(headerImg)) pdf.addImage(headerImg, 'PNG', 0, 0, pdfWidth, headerHeight);

      const contentY = -(pdfHeight - headerHeight - footerHeight) * (page - 1);
      if (isValidBase64Image(contentImg))
        pdf.addImage(
          contentImg,
          "PNG",
          0,
          headerHeight + contentY,
          pdfWidth,
          contentHeight
        );

      // Add footer
      pdf.setFontSize(10);
      // Add footer image stretched to page width
      const footerImgWidth = pageWidth * 0.95; // Stretch to full page width
      const footerImgHeight = pageHeight * 0.067; // Adjust height as needed
      const footerX = 5; // Start from the left

      const footerY = pageHeight - footerImgHeight - 5;
      if (headerOptions === "With Letter Head") {
        if (isValidBase64Image(footerImg))
          pdf.addImage(
            footerImg,
            "PNG",
            footerX,
            footerY,
            footerImgWidth,
            footerImgHeight,
            "",
            "FAST",
            0.1
          );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(footerX, footerY, footerImgWidth, footerImgHeight, "F");
      }

      // if (isValidBase64Image(footerImg)) pdf.addImage(footerImg, 'PNG', 0, pdfHeight - footerHeight, pdfWidth, footerHeight);

      heightLeft -= pdfHeight - headerHeight - footerHeight;
      page++;
    }

    // Add page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 27,
        { align: "center" }
      );
    }

    if (mode === "download") {
      pdf.save(`Invoice_${manageSalesCommon.billno || "Bill"}.pdf`);
    } else {
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  const generatePDFworking = async (mode, headerOptions) => {
    const header = document.getElementById("pdf-header-section");
    const content = document.getElementById("pdf-content-section");
    const footer = document.getElementById("pdf-footer-section");

    if (!header || !content || !footer) return;

    // ✅ Wait for all images in header/content/footer
    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([
      waitForImages(header),
      waitForImages(content),
      waitForImages(footer),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // ✅ Convert all to canvas
    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, { scale: 2, useCORS: true, backgroundColor: "#fff" }),
      html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(footer, { scale: 2, useCORS: true, backgroundColor: "#fff" }),
    ]);

    const headerImg = headerCanvas.toDataURL("image/png");
    const contentImg = contentCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const isValidBase64Image = (imgData) =>
      imgData &&
      imgData.startsWith("data:image/png;base64,") &&
      imgData.length > 10000;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ✅ Fixed header/footer height (in mm)
    const headerHeightMM = 25;
    const footerHeightMM = 18;
    const contentAreaHeight = pdfHeight - headerHeightMM - footerHeightMM;

    // ✅ Calculate image height based on page width
    const headerImgHeight =
      (headerCanvas.height * (pdfWidth * 0.95)) / headerCanvas.width;
    const footerImgHeight =
      (footerCanvas.height * (pdfWidth * 0.95)) / footerCanvas.width;

    // ✅ Convert content to tall image and then paginate
    const contentImgHeight =
      (contentCanvas.height * pdfWidth) / contentCanvas.width;

    let heightLeft = contentImgHeight;
    let position = 0;
    let page = 1;

    while (heightLeft > 0) {
      if (page > 1) pdf.addPage();

      // ===== HEADER SECTION =====
      if (headerOptions === "With Letter Head") {
        if (isValidBase64Image(headerImg)) {
          pdf.addImage(
            headerImg,
            "PNG",
            5,
            5,
            pdfWidth * 0.95,
            headerImgHeight,
            undefined,
            "FAST"
          );
        }
      } else {
        // draw white area for header space
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, headerHeightMM, "F");
      }

      // ===== CONTENT SECTION =====
      const contentY =
        -(pdfHeight - headerHeightMM - footerHeightMM) * (page - 1);
      if (isValidBase64Image(contentImg)) {
        pdf.addImage(
          contentImg,
          "PNG",
          0,
          headerHeightMM,
          pdfWidth,
          contentImgHeight
        );
      }

      // ===== FOOTER SECTION =====
      const footerY = pdfHeight - footerHeightMM;
      if (headerOptions === "With Letter Head") {
        if (isValidBase64Image(footerImg)) {
          pdf.addImage(
            footerImg,
            "PNG",
            5,
            footerY - 3,
            pdfWidth * 0.95,
            footerImgHeight,
            undefined,
            "FAST"
          );
        }
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, footerY, pdfWidth, footerHeightMM, "F");
      }

      heightLeft -= contentAreaHeight;
      page++;
    }

    // ===== PAGE NUMBERS =====
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - footerHeightMM + 5,
        { align: "center" }
      );
    }

    // ===== OUTPUT =====
    if (mode === "download") {
      pdf.save(`Invoice_${manageSalesCommon.billno || "Bill"}.pdf`);
    } else {
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  const [imgName, setImgName] = useState([]);
  const [imgArray, setImgArray] = useState([]);
  const generatePDF = async (mode, headerOptions) => {
    setHeaderOptionsButton(true);
    const header = document.getElementById("pdf-header-section");
    const content = document.getElementById("pdf-content-section");
    const footer = document.getElementById("pdf-footer-section");

    if (!header || !content || !footer) return;

    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([
      waitForImages(header),
      waitForImages(content),
      waitForImages(footer),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(content, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(footer, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
    ]);

    const headerImg = headerCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerHeightMM = 25;
    const footerHeightMM = 18;
    const contentAreaHeightMM = pdfHeight - headerHeightMM - footerHeightMM;

    // scale: px/mm ratio
    const pxPerMM =
      contentCanvas.height /
      ((contentCanvas.height * pdfWidth) / contentCanvas.width);
    const pageCanvasHeightPx = contentAreaHeightMM * pxPerMM;

    let renderedHeight = 0;
    let page = 1;

    const marginTop = 10; // space between header and content
    const marginBottom = 5; // space between content and footer
    const marginLeft = 10; // left margin
    const marginRight = 10; // right margin

    // match your layout
    const headerX = 5; // 5mm from left
    const headerY = 3.5; // 3.5mm from top
    const headerWidth = pdfWidth * 0.95; // 95% width
    const headerHeight = 27; // roughly 9% of A4 (9% of 297 ≈ 26.7mm)

    const footerX = 5;
    const footerY = pdfHeight - 5 - 20; // bottom: 5mm margin + height ≈ 20mm
    const footerWidth = pdfWidth * 0.95;
    const footerHeight = 20; // roughly 6.7% of A4 (6.7% of 297 ≈ 20mm)

    while (renderedHeight < contentCanvas.height) {
      // create slice canvas
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = contentCanvas.width;
      pageCanvas.height = Math.min(
        pageCanvasHeightPx,
        contentCanvas.height - renderedHeight
      );

      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(
        contentCanvas,
        0,
        renderedHeight,
        contentCanvas.width,
        pageCanvas.height,
        0,
        0,
        contentCanvas.width,
        pageCanvas.height
      );

      const pageImg = pageCanvas.toDataURL("image/png");

      if (page > 1) pdf.addPage();

      // // old
      // // --- HEADER ---
      // if (headerOptions === 'With Letter Head') {
      //   pdf.addImage(headerImg, 'PNG', 5, 5, pdfWidth * 0.95, 20, undefined, 'FAST');
      // } else {
      //   pdf.setFillColor(255, 255, 255);
      //   pdf.rect(0, 0, pdfWidth, headerHeightMM, 'F');
      // }

      // console.log(headerHeightMM, pdfWidth)
      // // --- CONTENT ---
      // // const imgHeightMM = (pageCanvas.height * pdfWidth) / contentCanvas.width;
      // // pdf.addImage(pageImg, 'PNG', 0, headerHeightMM + 10, pdfWidth, imgHeightMM, undefined, 'MEDIUM');

      // // --- CONTENT WITH MARGINS ---
      // const imgWidthMM = pdfWidth - marginLeft - marginRight;
      // const imgHeightMM = (pageCanvas.height * imgWidthMM) / contentCanvas.width;

      // // Start drawing below header + marginTop
      // const contentStartY = headerHeightMM + marginTop;

      // // Keep image inside left/right margins
      // pdf.addImage(
      //   pageImg,
      //   'PNG',
      //   marginLeft,          // X position
      //   contentStartY,       // Y position
      //   imgWidthMM,          // width within margins
      //   imgHeightMM,         // scaled height
      //   undefined,
      //   'MEDIUM'
      // );

      // // --- FOOTER ---
      // const footerY = pdfHeight - footerHeightMM;
      // if (headerOptions === 'With Letter Head') {
      //   pdf.addImage(footerImg, 'PNG', 5, footerY - 3, pdfWidth * 0.95, 15, undefined, 'FAST');
      // } else {
      //   pdf.setFillColor(255, 255, 255);
      //   pdf.rect(0, footerY, pdfWidth, footerHeightMM, 'F');
      // }

      // new
      // --- HEADER ---
      if (headerOptions === "With Letter Head") {
        pdf.addImage(
          headerImg,
          "PNG",
          headerX,
          headerY,
          headerWidth,
          headerHeight,
          undefined,
          "FAST"
        );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");
      }

      // --- CONTENT WITH MARGINS ---
      const imgWidthMM = pdfWidth - marginLeft - marginRight;
      const imgHeightMM =
        (pageCanvas.height * imgWidthMM) / contentCanvas.width;
      const contentStartY = headerY + headerHeight + marginTop;
      const contentMaxY = footerY - marginBottom;
      const availableContentHeight = contentMaxY - contentStartY;
      pdf.addImage(
        pageImg,
        "PNG",
        marginLeft,
        contentStartY,
        imgWidthMM,
        imgHeightMM,
        undefined,
        "MEDIUM"
      );

      // new
      // --- FOOTER ---
      if (headerOptions === "With Letter Head") {
        pdf.addImage(
          footerImg,
          "PNG",
          footerX,
          footerY,
          footerWidth,
          footerHeight,
          undefined,
          "FAST"
        );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, footerY, pdfWidth, footerHeight, "F");
      }

      renderedHeight += pageCanvasHeightPx;
      page++;
    }

    await generateQrCode();

    // --- PAGE NUMBERS ---
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      //old
      // pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - footerHeightMM - 5, { align: 'center' });
      //new
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        footerY + footerHeight - 23, // 3mm above the footer’s bottom edge
        { align: "center" }
      );
    }

    if (mode === "download") {
      // pdf.save(`Invoice_${manageSalesCommon.billno || 'Bill'}.pdf`);
      pdf.save(
        `Invoice_${
          isAuto === true ? manageSalesCommon.billno : billNoAuto || "Bill"
        }.pdf`
      );
    } else {
      // const pdfBlob = pdf.output('blob');
      const pdfBlob = pdf.output("blob", { compress: true });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
    setHeaderOptionsButton(false);
  };

  const generatePDFForSave = async (headerOptions, uniqueId) => {
    const header = document.getElementById("pdf-header-section");
    const content = document.getElementById("pdf-content-section");
    const footer = document.getElementById("pdf-footer-section");

    if (!header || !content || !footer) return;

    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([
      waitForImages(header),
      waitForImages(content),
      waitForImages(footer),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(content, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
      html2canvas(footer, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      }),
    ]);

    const headerImg = headerCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerHeightMM = 25;
    const footerHeightMM = 18;
    const contentAreaHeightMM = pdfHeight - headerHeightMM - footerHeightMM;

    // scale: px/mm ratio
    const pxPerMM =
      contentCanvas.height /
      ((contentCanvas.height * pdfWidth) / contentCanvas.width);
    const pageCanvasHeightPx = contentAreaHeightMM * pxPerMM;

    let renderedHeight = 0;
    let page = 1;

    while (renderedHeight < contentCanvas.height) {
      // create slice canvas
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = contentCanvas.width;
      pageCanvas.height = Math.min(
        pageCanvasHeightPx,
        contentCanvas.height - renderedHeight
      );

      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(
        contentCanvas,
        0,
        renderedHeight,
        contentCanvas.width,
        pageCanvas.height,
        0,
        0,
        contentCanvas.width,
        pageCanvas.height
      );

      const pageImg = pageCanvas.toDataURL("image/png");

      if (page > 1) pdf.addPage();

      // --- HEADER ---
      if (headerOptions === "With Letter Head") {
        pdf.addImage(
          headerImg,
          "PNG",
          5,
          5,
          pdfWidth * 0.95,
          20,
          undefined,
          "FAST"
        );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, headerHeightMM, "F");
      }

      // --- CONTENT ---
      const imgHeightMM = (pageCanvas.height * pdfWidth) / contentCanvas.width;
      pdf.addImage(
        pageImg,
        "PNG",
        0,
        headerHeightMM,
        pdfWidth,
        imgHeightMM,
        undefined,
        "MEDIUM"
      );

      // --- FOOTER ---
      const footerY = pdfHeight - footerHeightMM;
      if (headerOptions === "With Letter Head") {
        pdf.addImage(
          footerImg,
          "PNG",
          5,
          footerY - 3,
          pdfWidth * 0.95,
          15,
          undefined,
          "FAST"
        );
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, footerY, pdfWidth, footerHeightMM, "F");
      }

      renderedHeight += pageCanvasHeightPx;
      page++;
    }

    await generateQrCode();

    // --- PAGE NUMBERS ---
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - footerHeightMM - 5,
        { align: "center" }
      );
    }

    const pdfBlob = pdf.output("blob", { compress: true });

    const fileName = `Invoice_${
      isAuto === true ? manageSalesCommon.billno : billNoAuto || "Bill"
    }.pdf`;
    const safeFileName = fileName.replace(/[\/\\:]/g, "_");
    const pdfFile = new File([pdfBlob], safeFileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });

    // console.log(pdfFile);
    // --- Validate & Convert ---
    if (pdfFile.type !== "application/pdf") {
      setPopupContentMalert("Only Accept Images or PDF!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      return;
    }

    if (pdfFile.size > 5 * 1024 * 1024) {
      setPopupContentMalert("File size should be less than 5MB!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = btoa(
        new Uint8Array(reader.result).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const newSelectedFiles = [
        {
          name: safeFileName,
          size: pdfFile.size,
          type: pdfFile.type,
          preview: null,
          base64: base64String,
        },
      ];

      setImgArray([...newSelectedFiles]);
      setImgName(newSelectedFiles.map((d) => d.name));

      await handleFileUpload(newSelectedFiles, "invoice", uniqueId);
    };

    reader.readAsArrayBuffer(pdfFile);
  };

  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
    ? isAssignBranch?.map((data) => ({
        branch: data.branch,
        branchcode: data.branchcode,
        company: data.company,
        unit: data.unit,
      }))
    : isAssignBranch
        ?.filter((data) => {
          let fetfinalurl = [];

          if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subsubpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.mainpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.submodulenameurl;
          } else if (data?.modulenameurl?.length !== 0) {
            fetfinalurl = data.modulenameurl;
          } else {
            fetfinalurl = [];
          }

          const remove = [
            window.location.pathname?.substring(1),
            window.location.pathname,
          ];
          return fetfinalurl?.some((item) => remove?.includes(item));
        })
        ?.map((data) => ({
          branch: data.branch,
          branchcode: data.branchcode,
          company: data.company,
          unit: data.unit,
        }));

  // Fetch server time initially
  const getCurrentServerTime1 = async () => {
    try {
      const response = await axios.get(SERVICE.GET_CURRENT_SERVER_TIME);
      setServerTime1(moment(response.data.currentNewDate));
    } catch (err) {
      console.log("Error fetching server time:", err);
    }
  };

  useEffect(() => {
    getCurrentServerTime1();

    const interval = setInterval(() => {
      setServerTime1((prevTime) => moment(prevTime).add(1, "second"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);

      const today = new Date(time);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, "0.00");
      minutes = String(minutes).padStart(2, "0.00");

      // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      let res_prod = await axios.get(SERVICE.PRODUCTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const all = [
        ...res_prod?.data?.productmasters?.map((d) => ({
          ...d,
          label: d.productname,
          value: d.productname,
        })),
      ];
      // Remove duplicates by customer name
      const finalAll = Array.from(
        new Map(
          all.filter((d) => d && d.value).map((d) => [d.value, d])
        ).values()
      );
      setProdTypeOpt(finalAll);
      const defaultData = finalAll?.find((d) => d.value === "SILVER");

      // Remove duplicates based on the 'company' field
      const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
        const x = acc.find(
          (item) =>
            item.company === current.company &&
            item.branch === current.branch &&
            item.unit === current.unit
        );
        if (!x) {
          acc.push(current);
        }
        return acc;
      }, []);

      const company = [
        ...new Set(uniqueIsAssignBranch.map((data) => data.company)),
      ].map((data) => ({
        label: data,
        value: data,
      }));
      setCompanyOpt(company);
      const branch = uniqueIsAssignBranch
        ?.filter((val) => company[0].value === val.company)
        ?.map((data) => ({
          branchcode: data.branchcode,
          label: data.branch,
          value: data.branch,
        }))
        .filter((item, index, self) => {
          return (
            self.findIndex(
              (i) => i.label === item.label && i.value === item.value
            ) === index
          );
        });
      setBranchOpt(branch);
      setBranchString(branch[0].branchcode);
      getHeaderFooterImages(company[0].value, branch[0]?.value);
      getGSTN(company[0].value, branch[0]?.value, "SILVER");
      // fetchSoldCustomer(company[0].value, branch[0].value);

      const res_item = await axios.post(
        SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          producttype: defaultData.value,
        }
      );
      setSalesItemParticularsOpt(res_item?.data?.products);
      setProdString(defaultData.productprefix);

      let res = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Build prefix based on dropdown selections
      const currentPrefix = `${branch[0].branchcode}/${defaultData.productprefix}/`;

      // Filter only bills starting with this prefix
      const filteredBills = res?.data?.managesales?.filter((sale) =>
        sale.billno.startsWith(currentPrefix)
      );

      let newBillNo;
      if (filteredBills.length > 0) {
        // Get the last one (assuming billno are ordered)
        const lastBill = filteredBills[filteredBills.length - 1].billno;
        setLastBillNo(lastBill);
        // Extract number after prefix
        const lastNumber = parseInt(lastBill.replace(currentPrefix, ""), 10);

        // Increment number
        const nextNumber = lastNumber + 1;

        newBillNo = `${currentPrefix}${nextNumber}`;
      } else {
        // If no bill exists for this prefix, start at 1
        newBillNo = `${currentPrefix}1`;
      }

      // console.log(newBillNo, 'Generated Bill No');
      setBillNoAuto(newBillNo);
      setManageSalesCommon({
        ...manageSalesCommon,
        company: company[0].value,
        branch: branch[0].value,
        date: moment(time).format("YYYY-MM-DD"),
        hours: hours,
        minutes: minutes,
        time: ampm,
        billno: newBillNo,
        prodmastertype: defaultData.value,
      });

      let res_gold_rate = await axios.post(
        SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          ornamanet: "Gold",
          date: moment(serverTime1).format("YYYY-MM-DD"),
          time: serverTime1.format("hh:mm:ss A"),
        }
      );
      let res_silver_rate = await axios.post(
        SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          ornamanet: "Silver",
          date: moment(serverTime1).format("YYYY-MM-DD"),
          time: serverTime1.format("hh:mm:ss A"),
        }
      );
      const matchedGoldRate = res_gold_rate?.data?.ratemaster?.rate;
      const matchedSilverRate = res_silver_rate?.data?.ratemaster?.rate;
      setCurrentGoldRate(matchedGoldRate);
      setCurrentSilverRate(matchedSilverRate);
      setRateValue(matchedSilverRate);
    };

    fetchTime();
  }, []);

  var today = new Date(serverTime);

  // Extract hours and minutes
  let hours = today.getHours();
  let minutes = today.getMinutes();

  // Convert to 12-hour format
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  // Format with leading zero if needed
  hours = String(hours).padStart(2, "0.00");
  minutes = String(minutes).padStart(2, "0.00");

  var dd = String(today.getDate()).padStart(2, "0.00");
  var mm = String(today.getMonth() + 1).padStart(2, "0.00"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  const [manageSalesCommon, setManageSalesCommon] = useState({
    customeropeningbalance: "0.00",
    bnoteamount: "0.00",
    salesreturnamount: "0.00",
    company: "Please Select Company",
    branch: "Please Select Branch",
    prodmastertype: "",
    isInvoice: false,
    isSReturn: false,
    isManualGrp: false,
    isManual: false,
    // customername: 'Please Select Customer Name',
    // customeraddress: 'TRICHY',
    customername: "",
    customeraddress: viewData?.length > 0 ? "" : "TRICHY",
    customercontactprefix: "+91",
    customercontact: "",
    date: today,
    hours: hours,
    minutes: minutes,
    time: ampm,
    billno: `${branchString}/${prodString}/`,
    salesid: "",
    empcode: "",
    bnoteno: "Please Select Bnote No",
    salesreturnno: "Please Select Sales Return No",
    overalllesstype: "Fixed",
    overallless: "0.00",
    overalllessamount: "0.00",
    totalsalespieces: 0,
    totalsalesweight: 0,
    totalmcdiscount: 0,
    totalsalesgross: 0,
    totalsalescgstper: 0,
    totalsalessgstper: 0,
    totalsalescgst: 0,
    totalsalessgst: 0,
    totalsalesamount: 0,
    totaloldpieces: 0,
    totaloldweight: 0,
    totalwastagediscount: 0,
    totaloldgross: 0,
    totaloldcgstper: 0,
    totaloldsgstper: 0,
    totaloldcgst: 0,
    totaloldsgst: 0,
    totaloldamount: 0,
    netamountwithoutdis: 0,
    netamount: 0,
    remarks: "",
    modeofpayments: "Please Select Mode of Payments",
    cash: "0.00",
    balanceamount: "0.00",
    bankname: "Please Select Bank Name",
    bankbranchname: "",
    accountholdername: "",
    accountnumber: "",
    ifsccode: "",
    upinumber: "",
    cardtype: "Please Select Card Type",
    cardoptions: "Please Select Card Options",
    othercardname: "",
    cardnumber: "",
    cardholdername: "",
    cardtransactionnumber: "",
    cardmonth: "Month",
    cardyear: "Year",
    cardsecuritycode: "",
    chequenumber: "",
    totalsalesgrosswithoutdiscount: "0.00",
    totalsaleslessamount: "0.00",
    totaloldgrosswithoutdiscount: "0.00",
    totaloldlessamount: "0.00",
    openingbalance: "0.00",
    lessopeningbalance: "0.00",
  });

  const numberToWords = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "";

    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return (
        inWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + inWords(n % 10000000) : "")
      );
    };

    const whole = Math.floor(num);
    const decimal = Math.round((num - whole) * 100);

    let result = inWords(whole) + " Only.";
    if (decimal > 0)
      result = inWords(whole) + " and " + inWords(decimal) + " Paise Only.";
    return "Rupees " + result;
  };

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };

  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  // Upload Popup
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);
  const handleClickUploadPopupOpen = () => {
    setUploadPopupOpen(true);
  };
  const handleUploadPopupClose = () => {
    setUploadPopupOpen(false);
  };

  // View model
  const [openview, setOpenview] = useState(false);
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
    setViewData([]);
    setPageView(1);
    setSearchQueryView("");
  };

  const [itemsView, setItemsView] = useState([]);
  const [loaderView, setLoaderView] = useState(false);
  const [selectedRowsView, setSelectedRowsView] = useState([]);

  const [filteredRowDataView, setFilteredRowDataView] = useState([]);
  const [filteredChangesView, setFilteredChangesView] = useState(null);
  const [isHandleChangeView, setIsHandleChangeView] = useState(false);
  const [searchedStringView, setSearchedStringView] = useState("");

  const [pageView, setPageView] = useState(1);
  const [pageSizeView, setPageSizeView] = useState(10);
  const [searchQueryView, setSearchQueryView] = useState("");

  const [isFilterOpenView, setIsFilterOpenView] = useState(false);
  const [isPdfFilterOpenView, setIsPdfFilterOpenView] = useState(false);
  // page refersh reload
  const handleCloseFilterModView = () => {
    setIsFilterOpenView(false);
  };
  const handleClosePdfFilterModView = () => {
    setIsPdfFilterOpenView(false);
  };

  const [searchQueryManageView, setSearchQueryManageView] = useState("");
  const [isManageColumnsOpenView, setManageColumnsOpenView] = useState(false);
  const [anchorElView, setAnchorElView] = useState(null);

  const handleOpenManageColumnsView = (event) => {
    setAnchorElView(event.currentTarget);
    setManageColumnsOpenView(true);
  };
  const handleCloseManageColumnsView = () => {
    setManageColumnsOpenView(false);
    setSearchQueryManageView("");
  };

  const openView = Boolean(anchorElView);
  const idView = openView ? "simple-popover" : undefined;

  //first allexcel....
  const getFileIcon = (fileName) => {
    const extension1 = fileName?.split(".").pop();
    switch (extension1) {
      case "pdf":
        return pdfIcon;
      case "doc":
      case "docx":
        return wordIcon;
      case "xls":
      case "xlsx":
        return excelIcon;
      case "csv":
        return csvIcon;
      default:
        return fileIcon;
    }
  };

  useEffect(() => {
    getapi();
  }, []);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Manage Sale"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          // date: String(new Date(serverTime)),
        },
      ],
    });
  };

  const lesstypeOpt = [
    { label: "Fixed", value: "Fixed" },
    { label: "Percentage", value: "Percentage" },
  ];

  // pageAttStatus refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  // Pre select dropdowns
  useEffect(() => {
    // Remove duplicates based on the 'company' field
    const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      const x = acc.find(
        (item) =>
          item.company === current.company &&
          item.branch === current.branch &&
          item.unit === current.unit
      );
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);

    const company = [
      ...new Set(uniqueIsAssignBranch.map((data) => data.company)),
    ].map((data) => ({
      label: data,
      value: data,
    }));
    setCompanyOpt(company);

    // const branch = uniqueIsAssignBranch?.filter(
    //   (val) =>
    //     company?.map(comp => comp.value === val.company)
    // )?.map(data => ({
    //   branchcode: data.branchcode,
    //   label: data.branch,
    //   value: data.branch,
    // })).filter((item, index, self) => {
    //   return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
    // })
    //    setBranchOpt(branch);
  }, [isAssignBranch]);

  const fetchBranch = (value) => {
    // Remove duplicates based on the 'company' field
    const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      const x = acc.find(
        (item) =>
          item.company === current.company &&
          item.branch === current.branch &&
          item.unit === current.unit
      );
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);
    const branch = uniqueIsAssignBranch
      ?.filter((val) => val.company === value)
      ?.map((data) => ({
        branchcode: data.branchcode,
        label: data.branch,
        value: data.branch,
      }))
      .filter((item, index, self) => {
        return (
          self.findIndex(
            (i) => i.label === item.label && i.value === item.value
          ) === index
        );
      });
    setBranchOpt(branch);
  };

  // const fetchSoldCustomer = async (company, branch) => {
  //   try {
  //     let res = await axios.post(SERVICE.SOLDBILLNO, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       company: company,
  //       branch: branch,
  //     });
  //     console.log(res?.data?.soldbillno, 'res?.data?.soldbillno')
  //     const filteredData = res?.data?.soldbillno?.filter(data => data.customername === manageSalesCommon.customername && data.customercontact === manageSalesCommon.customercontact);

  //     res?.data?.soldbillno?.filter(data =>
  //       console.log(data.customername, manageSalesCommon.customername, data.customercontact, manageSalesCommon.customercontact)
  //     );
  //     const all = [
  //       ...filteredData
  //         ?.map((d) => ({
  //           ...d,
  //           label: d.billno,
  //           value: d.billno,
  //           customername: d.customername,
  //           customercontact: d.customercontact,
  //         }))
  //         .filter((item, index, self) => {
  //           return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
  //         }),
  //     ];
  //     setIsSoldBillno(all);
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  // const handleChangeBillno = (e) => {
  //   if (salesReturnItemTodo?.length > 0) {
  //     setPopupContentMalert(`${"Particular Already Selected Didn't change BillNo!, Remove All Particular Then Change BillNo!"}`);
  //     setPopupSeverityMalert('info');
  //     handleClickOpenPopupMalert();
  //   } else {
  //     setManageSalesCommon({ ...manageSalesCommon, billtype: e.value });
  //     setIsSoldItems([]);
  //     fetchItemNmae(manageSalesCommon?.company, manageSalesCommon?.branch, e.value, e.customername, e.customercontact);
  //   }
  // };

  // const fetchItemNmae = async (company, branch, billno, customername, customercontact) => {
  //   // const getcus = salesReturn?.customertype?.split('-');
  //   console.log(company, branch, billno, customername, customercontact)
  //   try {
  //     let res = await axios.post(SERVICE.SOLDITEMNAMES, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       company: company,
  //       branch,
  //       branch,
  //       billno: billno,
  //       type: 'individual',
  //       customername: customername,
  //       customercontact: customercontact,
  //     });
  //     console.log(res?.data?.solditemnames, 'res?.data?.solditemnames');
  //     const removeitems = res?.data?.solditemnames.filter((data) => {
  //       return !salesReturnItemTodo.some((item) => item?.productname === data.productname);
  //     });
  //     console.log(removeitems, 'removeitems');
  //     const all = [
  //       ...removeitems
  //         .map((d) => ({
  //           ...d,
  //           label: d.productname,
  //           value: d.productname,
  //           customername: d.customername,
  //           customercontact: d.customercontact,
  //           billno: d.billno,
  //         }))
  //         .filter((item, index, self) => {
  //           return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
  //         }),
  //     ];
  //     setIsSoldItems(all);
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  const handlechangereferencecontactno = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === "") {
      setIsNewCusDetails({
        ...isNewCusDetails,
        customercontact: inputValue,
        customername: "",
      });
    }
  };

  const handlechangereferencecontactnoExist = (e) => {
    setViewDataCount(0);
    setSalesReturnItemTodo([]);
    setTotalSalesReturnAmount("0.00");
    const groupsArrayOld = oldItemTodo
      ?.filter((data) => data.status === "Sales")
      ?.map((val) => ({ ...val, bnoteno: "" }));
    setOldItemTodo(groupsArrayOld);
    // const updatedOld = groupsArrayOld.map((row) => recalcGroupRow1(row));
    // setOldTaxGroupsArray(updatedOld);
    // console.log(oldItemTodo)
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    // console.log(inputValue, regex.test(inputValue), inputValue === '')
    if (regex.test(inputValue) || inputValue === "") {
      setManageSalesCommon({
        ...manageSalesCommon,
        customercontact: inputValue,
        isInvoice: false,
        bnoteno: "Please Select Bnote No",
        isSReturn: false,
        isManualGrp: false,
        isManual: false,
        salesreturnno: "Please Select Sales Return No",
      });
    }
    if (inputValue === "") {
      setIsCusContact(false);
      fetchCustomers();
      setManageSalesCommon({
        ...manageSalesCommon,
        // customername: 'Please Select Customer Name',
        customername: "",
        customeraddress: "TRICHY",
        customercontactprefix: "+91",
        customercontact: inputValue,
        // billno: isAuto === true ? 'TRI/S/' : billNoAuto,
      });
    }
  };

  useEffect(() => {
    // Fetch all bill numbers once (or could fetch only when needed)
    const fetchSales = async () => {
      try {
        let res_sales = await axios.get(SERVICE.MANAGESALES, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setAllManageSales(res_sales?.data?.managesales || []);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };
    fetchSales();
  }, []);

  // Debounce max and min check when waste changes
  useEffect(() => {
    setIsCusAdvanceBalCheck(false);
    if (!manageSalesCommon.customercontact) return;

    let timer;

    const checkContact = () => {
      timer = setTimeout(async () => {
        try {
          let res = await axios.post(
            SERVICE.MANAGESALES_AND_BNOTE_CONTACT_BASED_CUSTOMER_FETCH,
            { contact: manageSalesCommon.customercontact },
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
          const finalResult = res?.data?.result;
          // setCusOptions1(finalResult);
          // setManageSalesCommon({
          //   ...manageSalesCommon,
          //   customername: finalResult[0].value,
          //   customeraddress: finalResult[0].customeraddress,
          //   customercontactprefix: finalResult[0].customercontactprefix,
          //   customercontact: finalResult[0].customercontact,
          //   // billno: isAuto === true ? 'TRI/S/' : billNoAuto,
          // });

          if (finalResult?.length > 0) {
            const result = finalResult?.map((data) => {
              return {
                customername: data.value,
                customeraddress: data.customeraddress,
                customercontactprefix: data.customercontactprefix,
                customercontact: data.customercontact,
                purchasedate: moment(data.date).format("DD-MM-YYYY"),
                purchasetime: data.formattedtime,
              };
            });
            setViewData(result);
            setViewDataCount(result?.length);
            handleClickOpenview();
          } else {
            setViewData([]);
          }
          fetchSRInvoice(finalResult[0].value, finalResult[0].customercontact);
          fetchInvoice(finalResult[0].value, finalResult[0].customercontact);
          fetchCustomerBalance(finalResult[0].customercontact);
          fetchCustomerAdvanceBal(finalResult[0].customercontact);
          setIsCusOpeningBalCheck(false);
          setIsCusAdvanceBalCheck(false);
          // setIsCusContact(true);
        } catch (err) {
          console.error("Failed to fetch customer:", err);
        }
      }, 1000);
    };

    checkContact();

    return () => clearTimeout(timer);
  }, [manageSalesCommon.customercontact]);

  // Debounce duplicate check when billno changes
  useEffect(() => {
    if (!isAuto) return;
    if (!manageSalesCommon.billno) return;

    const timer = setTimeout(() => {
      const isDuplicate = allManageSales.some(
        (item) => item.billno === manageSalesCommon.billno
      );

      if (isDuplicate) {
        setPopupContentMalert("Bill No already exists!");
        setPopupSeverityMalert("warning");
        handleClickOpenPopupMalert();
        setManageSalesCommon({
          ...manageSalesCommon,
          billno: `${branchString}/${prodString}/`,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    manageSalesCommon.billno,
    isAuto,
    allManageSales,
    branchString,
    prodString,
  ]);

  // useEffect(() => {
  //   if (!manageSalesCommon.date) return;
  //   if (!manageSalesCommon.hours) return;
  //   if (!manageSalesCommon.minutes) return;
  //   if (!manageSalesCommon.time) return;

  //   let timer;

  //   const checkDate = async () => {
  //     const time = await getCurrentServerTime();
  //     const currentDate = new Date(time).toISOString().split("T")[0];

  //     timer = setTimeout(() => {
  //       if (manageSalesCommon.date > currentDate) {
  //         setPopupContentMalert("Future Date is restricted!");
  //         setPopupSeverityMalert("warning");
  //         handleClickOpenPopupMalert();
  //         setManageSalesCommon({ ...manageSalesCommon, date: moment(time).format('YYYY-MM-DD') })
  //         toCalculateTotalValues(salesItemTodo, oldItemTodo, moment(time).format('YYYY-MM-DD'), manageSalesCommon.hours, manageSalesCommon.minutes, manageSalesCommon.time, manageSalesCommon.bnoteno,
  //           manageSalesCommon.overalllesstype, manageSalesCommon.overallless, manageSalesCommon.lessopeningbalance);
  //       }
  //     }, 2000);
  //   };

  //   checkDate();

  //   return () => clearTimeout(timer);
  // }, [manageSalesCommon.date]);

  useEffect(() => {
    if (!manageSalesCommon.date) return;
    if (!manageSalesCommon.hours) return;
    if (!manageSalesCommon.minutes) return;
    if (!manageSalesCommon.time) return;

    let timer;

    const checkDateTime = async () => {
      const serverTime = await getCurrentServerTime(); // server UTC time
      const now = new Date(serverTime);

      // Convert dropdown values into a Date
      const selectedDate = new Date(manageSalesCommon.date); // YYYY-MM-DD string → Date

      let hours = parseInt(manageSalesCommon.hours, 10);
      const minutes = parseInt(manageSalesCommon.minutes, 10);
      const isPM = manageSalesCommon.time.toLowerCase() === "pm";

      if (isPM && hours < 12) hours += 12; // Convert PM to 24h
      if (!isPM && hours === 12) hours = 0; // Handle 12 AM as 0

      selectedDate.setHours(hours, minutes, 0, 0);

      // console.log("Selected:", selectedDate, "Server:", now);

      timer = setTimeout(() => {
        if (selectedDate.getTime() > now.getTime()) {
          setPopupContentMalert("Future Date/Time is restricted!");
          setPopupSeverityMalert("warning");
          handleClickOpenPopupMalert();

          // Reset date to current
          setManageSalesCommon({
            ...manageSalesCommon,
            date: moment(serverTime).format("YYYY-MM-DD"),
            hours: moment(serverTime).format("hh"),
            minutes: moment(serverTime).format("mm"),
            time: moment(serverTime).format("A"),
          });
          toCalculateTotalValues(
            salesItemTodo,
            oldItemTodo,
            totalSalesReturnAmount,
            manageSalesCommon.isSReturn,
            manageSalesCommon.isManual,
            manageSalesCommon.isManualGrp,
            isNetAmt,
            isSalesAmt,
            manageSalesCommon.salesreturnno,
            moment(serverTime).format("YYYY-MM-DD"),
            manageSalesCommon.hours,
            manageSalesCommon.minutes,
            manageSalesCommon.time,
            manageSalesCommon.bnoteno,
            manageSalesCommon.overalllesstype,
            manageSalesCommon.overallless,
            manageSalesCommon.lessopeningbalance,
            isCusAdvanceBalCheck,
            isAdvanceAmt
          );
        }
      }, 1000);
    };

    checkDateTime();

    return () => clearTimeout(timer);
  }, [
    manageSalesCommon.date,
    manageSalesCommon.hours,
    manageSalesCommon.minutes,
    manageSalesCommon.time,
  ]);

  // Debounce max and min check when waste changes
  useEffect(() => {
    if (!manageOldItem.waste) return;

    const timer = setTimeout(() => {
      const valueTarget = Number(manageOldItem.waste);
      const min = Number(manageOldItem.oldminimumwastage);
      const max = Number(manageOldItem.oldmaximumwastage);

      if (valueTarget < min || valueTarget > max) {
        setPopupContentMalert(
          `Please enter value between Min: ${min}% and Max: ${max}%!`
        );
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
        setManageOldItem({
          ...manageOldItem,
          waste: manageOldItem.olddefaultwastage
            ? manageOldItem.olddefaultwastage
            : 0,
          wastediscount: "0.00",
        });
        calculateOldItemValues({
          // productname: data.value, itemname: singleData.itemname, bnoteno: (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false) ? isNewBNote.bnoteno : (manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' : manageSalesCommon.bnoteno),
          // hsn: singleData.hsncode, productsize: singleData.sizename, waste: singleData.olddefaultwastage ? singleData.olddefaultwastage : 0, olddefaultwastage: singleData.olddefaultwastage, oldminimumwastage: singleData.oldminimumwastage, oldmaximumwastage: singleData.oldmaximumwastage,
          // productcode: singleData.itemcode, producttype: singleData.pricingtype,
          // rate: rateAmount ? rateAmount : '0.00', id: singleData._id, productgst: gstName, cgstper: Cgst, sgstper: Sgst, cgst: Cgst, sgst: Sgst
          ...manageOldItem,
          waste: manageOldItem.olddefaultwastage
            ? manageOldItem.olddefaultwastage
            : 0,
          wastediscount: "0.00",
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    manageOldItem.waste,
    manageOldItem.olddefaultwastage,
    manageOldItem.oldminimumwastage,
    manageOldItem.oldmaximumwastage,
  ]);

  useEffect(() => {
    if (!manageSalesCommon.lessopeningbalance) return;

    const timer = setTimeout(() => {
      const valueTarget = Number(manageSalesCommon.lessopeningbalance);
      const min = Number(manageSalesCommon.openingbalance);

      if (valueTarget > min) {
        setPopupContentMalert(
          `Please enter an amount equal to or less than ${min}.`
        );
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
        setManageSalesCommon({
          ...manageSalesCommon,
          lessopeningbalance: "0.00",
        });
        toCalculateTotalValues(
          salesItemTodo,
          oldItemTodo,
          totalSalesReturnAmount,
          manageSalesCommon.isSReturn,
          manageSalesCommon.isManual,
          manageSalesCommon.isManualGrp,
          isNetAmt,
          isSalesAmt,
          manageSalesCommon.salesreturnno,
          manageSalesCommon.date,
          manageSalesCommon.hours,
          manageSalesCommon.minutes,
          manageSalesCommon.time,
          manageSalesCommon.bnoteno,
          manageSalesCommon.overalllesstype,
          manageSalesCommon.overallless,
          "0.00",
          isCusAdvanceBalCheck,
          isAdvanceAmt
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [manageSalesCommon.openingbalance, manageSalesCommon.lessopeningbalance]);

  const fetchAllManageSalesForAutoIdOnchange = async (
    branchString,
    prodString
  ) => {
    try {
      let res = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Build prefix based on dropdown selections
      const currentPrefix = `${branchString}/${prodString}/`;

      // Filter only bills starting with this prefix
      const filteredBills = res?.data?.managesales?.filter((sale) =>
        sale.billno.startsWith(currentPrefix)
      );

      let newBillNo;
      if (filteredBills.length > 0) {
        // Get the last one (assuming billno are ordered)
        const lastBill = filteredBills[filteredBills.length - 1].billno;
        setLastBillNo(lastBill);
        // Extract number after prefix
        const lastNumber = parseInt(lastBill.replace(currentPrefix, ""), 10);

        // Increment number
        const nextNumber = lastNumber + 1;

        newBillNo = `${currentPrefix}${nextNumber}`;
      } else {
        // If no bill exists for this prefix, start at 1
        newBillNo = `${currentPrefix}1`;
      }

      // console.log(newBillNo, 'Generated Bill No');
      setBillNoAuto(newBillNo);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllManageSalesForLastBillNo = async (branchString, prodString) => {
    try {
      let res = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Build prefix based on dropdown selections
      const currentPrefix = `${branchString}/${prodString}/`;

      // Filter only bills starting with this prefix
      const filteredBills = res?.data?.managesales?.filter((sale) =>
        sale.billno.startsWith(currentPrefix)
      );

      let lastBill;
      if (filteredBills.length > 0) {
        // Get the last one (assuming billno are ordered)
        lastBill = filteredBills[filteredBills.length - 1].billno;
      } else {
        // If no bill exists for this prefix, start at 1
        lastBill = `${currentPrefix}0`;
      }

      // console.log(lastBill, 'Last Bill No');
      setLastBillNo(lastBill);
    } catch (err) {
      console.error(err);
    }
  };

  // dropdown functionality
  const fetchtProdType = async () => {
    try {
      // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      let res = await axios.get(SERVICE.PRODUCTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const all = [
        ...res?.data?.productmasters?.map((d) => ({
          ...d,
          label: d.productname,
          value: d.productname,
        })),
      ];
      // Remove duplicates by customer name
      const finalAll = Array.from(
        new Map(
          all.filter((d) => d && d.value).map((d) => [d.value, d])
        ).values()
      );
      setProdTypeOpt(finalAll);
      const defaultData = finalAll?.find((d) => d.value === "SILVER");
      setManageSalesCommon({
        ...manageSalesCommon,
        prodmastertype: defaultData.value,
      });
      setProdString(defaultData.productprefix);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  useEffect(() => {
    fetchtProdType();
  }, []);

  const fetchCustomers = async () => {
    try {
      // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      let res = await axios.get(SERVICE.MANAGESALES_AND_BNOTE_CUSTOMER_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setCusOptions(res?.data?.result);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomerBalance = async (inputContact) => {
    try {
      let rescontact = await axios.post(
        SERVICE.GETCONTACTNUMBERCUSTOMEROPBALANCE,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          contactnumber: inputContact,
        }
      );

      const result = rescontact?.data?.result?.filter(
        (data) => data !== null && data.openingbalance !== "0.00"
      );
      setIsCusOpeningBal(result);
      if (result?.length === 0) {
        setIsCusOpeningBalCheck(false);
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const totalSRAmount = (allData) => {
    let totalValue = 0;
    allData?.map((val) => {
      totalValue += Number(val.totalsalesreturnamount);
    });
    setIsSRAmount(Number(totalValue)?.toFixed(2));
  };

  const totalSalesReturnWeight = (allData) => {
    let totalValue = 0;
    allData?.map((val) => {
      totalValue += Number(val.weight);
    });
    return Number(totalValue)?.toFixed(3);
  };

  const fetchSRInvoice = async (selectedCus, selectedNo) => {
    try {
      const res_inv = await axios.post(
        SERVICE.SALESRETURN_INVOICE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          customername: `${selectedCus}-${selectedNo}`,
        }
      );
      setSRInvoiceOptions(res_inv?.data?.salesreturns);
      totalSRAmount(res_inv?.data?.salesreturns);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchSalesReturnItem = async (selectedInvoice) => {
    try {
      const res = await axios.post(
        SERVICE.SALESRETURN_SALESRETURNITEM_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          invoiceno: selectedInvoice,
        }
      );
      const result = res?.data?.salesreturns?.map((data) => ({
        ...data,
        status: data.status === "Bnote" ? "Exists" : "New",
        salesreturnno: selectedInvoice,
      }));
      setSalesReturnItemTodo(result);
      setTotalSalesReturnAmount(res?.data?.totalsalesreturnamount);
      setHandlingSalesReturnAmount(res?.data?.handlingfeesamount);
      toCalculateTotalValues(
        salesItemTodo,
        oldItemTodo,
        res?.data?.totalsalesreturnamount,
        manageSalesCommon.isSReturn,
        manageSalesCommon.isManual,
        manageSalesCommon.isManualGrp,
        isNetAmt,
        isSalesAmt,
        selectedInvoice,
        manageSalesCommon.date,
        manageSalesCommon.hours,
        manageSalesCommon.minutes,
        manageSalesCommon.time,
        selectedInvoice,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless,
        manageSalesCommon.lessopeningbalance,
        isCusAdvanceBalCheck,
        isAdvanceAmt
      );
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const totalAdvanceAmount = (allData) => {
    let totalValue = 0;
    allData?.map((val) => {
      totalValue += Number(val.totalamount);
    });
    setIsAdvanceAmt(Number(totalValue)?.toFixed(2));
  };

  const totalBNoteAmount = (allData) => {
    let totalValue = 0;
    allData?.map((val) => {
      totalValue += Number(val.boughtnoteamount);
    });
    setIsBNoteAmount(Number(totalValue)?.toFixed(2));
  };

  const fetchCustomerAdvanceBal = async (selectedNo) => {
    try {
      let rescontact = await axios.post(
        SERVICE.GETCONTACTNUMBERADAVANCETOTALAMOUNT,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          contactnumber: selectedNo,
        }
      );
      const result = rescontact?.data?.result?.filter(
        (data) => data !== null && data.totalamount !== "0.00"
      );
      totalAdvanceAmount(result);
      // toCalculateTotalValues(salesItemTodo, oldItemTodo, totalSalesReturnAmount, manageSalesCommon.isSReturn, manageSalesCommon.isManual, manageSalesCommon.isManualGrp, isNetAmt, isSalesAmt, manageSalesCommon.salesreturnno, manageSalesCommon.date, manageSalesCommon.hours, manageSalesCommon.minutes, manageSalesCommon.time, manageSalesCommon.bnoteno, manageSalesCommon.overalllesstype, manageSalesCommon.overallless, manageSalesCommon.lessopeningbalance, !isCusAdvanceBalCheck, totalAdvanceAmount(result));
      if (result?.length === 0) {
        setIsCusAdvanceBalCheck(false);
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchInvoice = async (selectedCus, selectedNo) => {
    try {
      const res_inv = await axios.post(
        SERVICE.OSBOUGHTNOTE_INVOICE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          customername: selectedCus,
          customercontact: selectedNo,
        }
      );
      setInvoiceOptions(res_inv?.data?.osboughtnotes);
      const allData = res_inv?.data?.osboughtnotes?.flatMap((d) => d.olditems);
      totalBNoteAmount(allData);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchBnoteOldItem = async (selectedInvoice) => {
    try {
      const res = await axios.post(
        SERVICE.OSBOUGHTNOTE_OLDITEM_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          invoiceno: selectedInvoice,
        }
      );
      const result = res?.data?.osboughtnotes?.map((data) => ({
        ...data,
        status: data.status === "Bnote" ? "Exists" : "New",
        bnoteno: selectedInvoice,
      }));
      setOldItemTodo(result);
      toCalculateTotalValues(
        salesItemTodo,
        result,
        totalSalesReturnAmount,
        manageSalesCommon.isSReturn,
        manageSalesCommon.isManual,
        manageSalesCommon.isManualGrp,
        isNetAmt,
        isSalesAmt,
        manageSalesCommon.salesreturnno,
        manageSalesCommon.date,
        manageSalesCommon.hours,
        manageSalesCommon.minutes,
        manageSalesCommon.time,
        selectedInvoice,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless,
        manageSalesCommon.lessopeningbalance,
        isCusAdvanceBalCheck,
        isAdvanceAmt
      );
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchAllItems = async () => {
    try {
      let res = await axios.get(SERVICE.ITEMMASTER_OLDITEM_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setOldItemFromItems(res?.data?.itemmasters);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const height = 35;

  const MenuList = (props) => {
    const { options, children, maxHeight, getValue } = props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
      <List
        height={maxHeight}
        itemCount={children.length}
        itemSize={height}
        initialScrollOffset={initialOffset}
        width="100%"
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
  };

  const fetchAllPruchase = async (selectedType) => {
    try {
      const res_item = await axios.post(
        SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          producttype: selectedType,
        }
      );
      // let res_pur = await axios.get(SERVICE.MANAGEPURCHASE_LIMIT, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      // });
      setSalesItemParticularsOpt(res_item?.data?.products);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  // const loadOptions = (inputValue, callback) => {
  //   const filtered = salesItemParticularsOpt.filter(i =>
  //     i.label.toLowerCase().includes(inputValue.toLowerCase())
  //   );
  //   callback(filtered.slice(0, 50)); // show max 50 results
  // };

  const fetchMatchedProdHsn = async (selectedItem) => {
    try {
      const res = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedItem = res?.data?.itemmasters.hsncode;
      return matchedItem;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchMatchedProdGstName = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;
      return matchedTaxName;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchMatchedProdCgst = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;

      const res_tax = await axios.post(SERVICE.TAXMASTER_GST_VALUE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        taxname: matchedTaxName,
      });
      const matchedCgst = res_tax?.data?.taxmasters.cgstvalue;
      return matchedCgst;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchMatchedProdSgst = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;

      const res_tax = await axios.post(SERVICE.TAXMASTER_GST_VALUE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        taxname: matchedTaxName,
      });
      const matchedSgst = res_tax?.data?.taxmasters.sgstvalue;
      return matchedSgst;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchRate = async (selectedItem, selectedDate, selectedTime) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedItem = res_item?.data?.itemmasters?.producttype;
      // console.log(matchedItem, 'matchedItem')

      const res_prod = await axios.post(
        SERVICE.PRODUCTMASTER_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          productname: matchedItem,
        }
      );
      const matchedProd = res_prod?.data?.productmasters?.ornamanet;

      let res_rate = await axios.post(
        SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          ornamanet: matchedProd,
          date: selectedDate,
          time: selectedTime,
        }
      );
      const matchedRate = res_rate?.data?.ratemaster?.rate;
      return matchedRate;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchRateForDateOnchage = async (
    prodtype,
    date,
    hours,
    minutes,
    time
  ) => {
    try {
      const formattedtime = `${hours}:${minutes} ${time}`;
      let res_rate = await axios.post(
        SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          ornamanet: prodtype,
          date: date,
          time: formattedtime,
        }
      );
      const matchedRate = res_rate?.data?.ratemaster?.rate;
      setRateValue(matchedRate || 0);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchSinglePur = async (data, date, hours, minutes, time) => {
    try {
      let res_pur = await axios.get(
        `${SERVICE.MANAGEPURCHASE_SINGLE}/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_pur?.data?.smanagepurchase;
      const hsnValue = await fetchMatchedProdHsn(singleData.itemname);
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(
        singleData.itemname,
        date,
        formattedtime
      );

      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
      if (
        [
          "pieces",
          "piece",
          "pcs",
          "Pieces",
          "Piece",
          "Pcs",
          "PIECES",
          "PIECE",
          "PCS",
        ]?.includes(singleData.unit)
      ) {
        setSalesItemTypeFromParticular("Piece");
        calculateSalesItemValues("Piece", {
          productname: data.value,
          weight: "0.000",
          hsn: hsnValue,
          pieces: singleData.piecesvalue,
          itemname: singleData.itemname,
          productsize: singleData.sizename,
          productcode: singleData.itemcode,
          makingcharge: "0.00",
          producttype: singleData.type,
          productitemcoderunningnumber: singleData.itemcoderunningnumber,
          makingchargemode: singleData.makingchargemode,
          originalmc: singleData.makingcharge
            ? singleData.makingcharge
            : "0.00",
          rate: singleData.salesamount,
          unit: singleData.unit,
          id: singleData._id,
          productgst: gstName,
          cgstper: Cgst,
          sgstper: Sgst,
          cgst: Cgst,
          sgst: Sgst,
        });
      }
      if (
        ![
          "pieces",
          "piece",
          "pcs",
          "Pieces",
          "Piece",
          "Pcs",
          "PIECES",
          "PIECE",
          "PCS",
        ]?.includes(singleData.unit)
      ) {
        setSalesItemTypeFromParticular("Gram");
        calculateSalesItemValues("Gram", {
          productname: data.value,
          weight: singleData.weight,
          hsn: hsnValue,
          pieces: singleData.piecesvalue,
          itemname: singleData.itemname,
          productsize: singleData.sizename,
          productcode: singleData.itemcode,
          makingcharge: "0.00",
          producttype: singleData.type,
          productitemcoderunningnumber: singleData.itemcoderunningnumber,
          makingchargemode: singleData.makingchargemode,
          originalmc: singleData.makingcharge
            ? singleData.makingcharge
            : "0.00",
          rate: rateAmount ? rateAmount : "0.00",
          unit: singleData.unit,
          id: singleData._id,
          productgst: gstName,
          cgstper: Cgst,
          sgstper: Sgst,
          cgst: Cgst,
          sgst: Sgst,
        });
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchSinglePurForRateChange = async (
    id,
    productname,
    date,
    hours,
    minutes,
    time,
    index
  ) => {
    try {
      let res_pur = await axios.get(`${SERVICE.MANAGEPURCHASE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_pur?.data?.smanagepurchase;
      const hsnValue = await fetchMatchedProdHsn(singleData.itemname);
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(
        singleData.itemname,
        date,
        formattedtime
      );

      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
      if (
        [
          "pieces",
          "piece",
          "pcs",
          "Pieces",
          "Piece",
          "Pcs",
          "PIECES",
          "PIECE",
          "PCS",
        ]?.includes(singleData.unit)
      ) {
        setSalesItemTypeFromParticular("Piece");
        calculateSalesItemValuesForRateChange(
          "Piece",
          {
            productname: productname,
            weight: "0.000",
            hsn: hsnValue,
            pieces: singleData.piecesvalue,
            itemname: singleData.itemname,
            productsize: singleData.sizename,
            productcode: singleData.itemcode,
            makingcharge: "0.00",
            producttype: singleData.type,
            productitemcoderunningnumber: singleData.itemcoderunningnumber,
            makingchargemode: singleData.makingchargemode,
            originalmc: singleData.makingcharge
              ? singleData.makingcharge
              : "0.00",
            rate: singleData.salesamount,
            unit: singleData.unit,
            id: singleData._id,
            productgst: gstName,
            cgstper: Cgst,
            sgstper: Sgst,
            cgst: Cgst,
            sgst: Sgst,
          },
          date,
          hours,
          minutes,
          time,
          index
        );
      }
      if (
        ![
          "pieces",
          "piece",
          "pcs",
          "Pieces",
          "Piece",
          "Pcs",
          "PIECES",
          "PIECE",
          "PCS",
        ]?.includes(singleData.unit)
      ) {
        setSalesItemTypeFromParticular("Gram");
        calculateSalesItemValuesForRateChange(
          "Gram",
          {
            productname: productname,
            weight: singleData.weight,
            hsn: hsnValue,
            pieces: singleData.piecesvalue,
            itemname: singleData.itemname,
            productsize: singleData.sizename,
            productcode: singleData.itemcode,
            makingcharge: "0.00",
            producttype: singleData.type,
            productitemcoderunningnumber: singleData.itemcoderunningnumber,
            makingchargemode: singleData.makingchargemode,
            originalmc: singleData.makingcharge
              ? singleData.makingcharge
              : "0.00",
            rate: rateAmount ? rateAmount : "0.00",
            unit: singleData.unit,
            id: singleData._id,
            productgst: gstName,
            cgstper: Cgst,
            sgstper: Sgst,
            cgst: Cgst,
            sgst: Sgst,
          },
          date,
          hours,
          minutes,
          time,
          index
        );
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const calculateSalesItemValues = (unitType, updatedData = {}) => {
    const {
      pieces,
      weight,
      lesstype,
      less,
      makingchargemode,
      originalmc,
      makingcharge,
      rate,
      cgstper,
      sgstper,
    } = { ...manageSalesItem, ...updatedData };

    // const foundedValue = (unitType === 'Piece') ? (Number(rate) * Number(pieces)) : (Number(rate) * Number(weight));
    const foundedValue =
      unitType === "Piece" ? Number(rate) : Number(rate) * Number(weight);
    const mcRateBasedMode =
      makingchargemode === "Fixed"
        ? Number(originalmc)
        : Number(weight) * Number(originalmc);
    const finalMackingCharges =
      originalmc !== "0.00"
        ? Number(mcRateBasedMode) - Number(makingcharge)
        : Number(makingcharge);
    const makingCharges = foundedValue + Number(finalMackingCharges);
    const foundedLess =
      lesstype === "Fixed"
        ? Number(less)
        : makingCharges * (Number(less) * (1 / 100));
    const grossAmount = makingCharges - foundedLess;
    const cgstValue = grossAmount * (Number(cgstper) * (1 / 100));
    const sgstValue = grossAmount * (Number(sgstper) * (1 / 100));
    const netSaleAmount = grossAmount + cgstValue + sgstValue;

    setManageSalesItem((prev) => ({
      ...prev,
      ...updatedData,
      value: foundedValue ? foundedValue?.toFixed(2) : "",
      originalmc: originalmc ? Number(originalmc)?.toFixed(2) : "",
      mcgramamount: mcRateBasedMode?.toFixed(2),
      makingchargemode: makingchargemode ? makingchargemode : "",
      mc: makingCharges ? makingCharges?.toFixed(2) : "",
      lessamount: Number(foundedLess)?.toFixed(2),
      grossamount: grossAmount ? grossAmount?.toFixed(2) : "",
      cgst: cgstValue ? cgstValue?.toFixed(2) : "",
      sgst: sgstValue ? sgstValue?.toFixed(2) : "",
      salestype: "Sales Amount",
      salesamount: netSaleAmount ? Math.round(netSaleAmount)?.toFixed(2) : "",
    }));
  };

  const calculateSalesItemValuesForRateChange = (
    unitType,
    updatedData = {},
    date,
    hours,
    minutes,
    time,
    index
  ) => {
    const currentItem = { ...salesItemTodo[index], ...updatedData };
    const {
      pieces,
      weight,
      lesstype,
      less,
      makingchargemode,
      originalmc,
      makingcharge,
      rate,
      cgstper,
      sgstper,
    } = currentItem;

    const foundedValue =
      unitType === "Piece" ? Number(rate) : Number(rate) * Number(weight);
    const mcRateBasedMode =
      makingchargemode === "Fixed"
        ? Number(originalmc)
        : Number(weight) * Number(originalmc);
    const finalMackingCharges =
      originalmc !== "0.00"
        ? Number(mcRateBasedMode) - Number(makingcharge)
        : Number(makingcharge);
    const makingCharges = foundedValue + Number(finalMackingCharges);
    const foundedLess =
      lesstype === "Fixed"
        ? Number(less)
        : makingCharges * (Number(less) * (1 / 100));
    const grossAmount = makingCharges - foundedLess;
    const cgstValue = grossAmount * (Number(cgstper) / 100);
    const sgstValue = grossAmount * (Number(sgstper) / 100);
    const netSaleAmount = grossAmount + cgstValue + sgstValue;

    const updatedItem = {
      ...currentItem,
      value: foundedValue ? foundedValue.toFixed(2) : "",
      originalmc: originalmc ? Number(originalmc).toFixed(2) : "",
      mcgramamount: mcRateBasedMode?.toFixed(2),
      makingchargemode: makingchargemode || "",
      mc: makingCharges ? makingCharges.toFixed(2) : "",
      lessamount: Number(foundedLess)?.toFixed(2),
      grossamount: grossAmount ? grossAmount.toFixed(2) : "",
      cgst: cgstValue ? cgstValue.toFixed(2) : "",
      sgst: sgstValue ? sgstValue.toFixed(2) : "",
      salestype: "Sales Amount",
      salesamount: netSaleAmount ? Math.round(netSaleAmount).toFixed(2) : "",
    };

    setSalesItemTodo((prev) => {
      const newArr = [...prev];
      newArr[index] = updatedItem;
      toCalculateTotalValues(
        newArr,
        oldItemTodo,
        totalSalesReturnAmount,
        manageSalesCommon.isSReturn,
        manageSalesCommon.isManual,
        manageSalesCommon.isManualGrp,
        isNetAmt,
        isSalesAmt,
        manageSalesCommon.salesreturnno,
        date,
        hours,
        minutes,
        time,
        manageSalesCommon.bnoteno,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless,
        manageSalesCommon.lessopeningbalance,
        isCusAdvanceBalCheck,
        isAdvanceAmt
      );
      return newArr;
    });
    setPopupContent("Rate changed based on the selected date and time");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  const addSalesItem = () => {
    if (manageSalesItem.productname === "Please Select Particulars") {
      setPopupContentMalert("Please Select Particulars");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesItem.pieces === "") {
      setPopupContentMalert("Please Enter Pieces");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      salesItemTypeFromParticular === "Gram" &&
      manageSalesItem.weight === ""
    ) {
      setPopupContentMalert("Please Enter Weight");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesItem.rate === "") {
      setPopupContentMalert("Please Enter Rate");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      const newTodo = {
        ...manageSalesCommon,
        // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
        // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
        // customercontactprefix: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontactprefix : manageSalesCommon.customercontactprefix),
        // customercontact: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact),
        customername: String(manageSalesCommon.customername),
        customeraddress: String(manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon.customercontact),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(
          manageSalesCommon.salesid
            ? manageSalesCommon.salesid
            : allUsersLimit[0].companyname.trim()
        ),
        empcode: String(
          manageSalesCommon.empcode
            ? manageSalesCommon.empcode
            : allUsersLimit[0].empcode.trim()
        ),
        bnoteno: String(
          isNewBNote?.isNewValue === false
            ? isNewBNote.bnoteno
            : manageSalesCommon.bnoteno === "Please Select Bnote No"
            ? ""
            : manageSalesCommon.bnoteno
        ),
        // salesreturnno: String(isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno),
        ...manageSalesItem,
        rate: Number(manageSalesItem.rate)?.toFixed(2),
        returnstatus: "Not return",
      };
      const checkDup = salesItemTodo?.some(
        (data) => data.productname === newTodo.productname
      );
      if (salesItemTodo.length > 0 && checkDup) {
        setPopupContentMalert("Product Already Exists!");
        setPopupSeverityMalert("warning");
        handleClickOpenPopupMalert();
      } else {
        setSalesItemTodoProd([...salesItemTodoProd, newTodo.productname]);
        setSalesItemTodo([...salesItemTodo, newTodo]);
        toCalculateTotalValues(
          [...salesItemTodo, newTodo],
          oldItemTodo,
          totalSalesReturnAmount,
          manageSalesCommon.isSReturn,
          manageSalesCommon.isManual,
          manageSalesCommon.isManualGrp,
          isNetAmt,
          isSalesAmt,
          manageSalesCommon.salesreturnno,
          manageSalesCommon.date,
          manageSalesCommon.hours,
          manageSalesCommon.minutes,
          manageSalesCommon.time,
          manageSalesCommon.bnoteno,
          manageSalesCommon.overalllesstype,
          manageSalesCommon.overallless,
          manageSalesCommon.lessopeningbalance,
          isCusAdvanceBalCheck,
          isAdvanceAmt
        );
        setManageSalesItem({
          productname: "Please Select Particulars",
          productcode: "",
          producttype: "",
          productsize: "",
          productgst: "",
          productitemcoderunningnumber: "",
          hsn: "",
          pieces: 1,
          weight: "",
          rate: "",
          value: "",
          makingchargemode: "",
          originalmc: "",
          mcgramamount: "0.00",
          makingcharge: "0.00",
          mc: "",
          lesstype: "Fixed",
          less: "0.00",
          grossamount: "",
          cgstper: "0.00",
          sgstper: "0.00",
          cgst: "",
          sgst: "",
          salestype: "",
          salesamount: "",
        });
      }
    }
  };

  // Delete Searched Product
  const deleteSalesItemRow = (i, e) => {
    setSalesItemTodo(salesItemTodo.filter((v, item) => item !== i));
    const deletedItem = salesItemTodo.filter((v, item) => item !== i);
    const filterdRes = deletedItem.map((d) => d.productname);
    setSalesItemTodoProd([...filterdRes]);
    toCalculateTotalValues(
      deletedItem,
      oldItemTodo,
      totalSalesReturnAmount,
      manageSalesCommon.isSReturn,
      false,
      false,
      "0.00",
      "0.00",
      manageSalesCommon.salesreturnno,
      manageSalesCommon.date,
      manageSalesCommon.hours,
      manageSalesCommon.minutes,
      manageSalesCommon.time,
      manageSalesCommon.bnoteno,
      manageSalesCommon.overalllesstype,
      manageSalesCommon.overallless,
      manageSalesCommon.lessopeningbalance,
      isCusAdvanceBalCheck,
      isAdvanceAmt
    );

    if (deletedItem.length === 0) {
      setSalesTaxGroupsArray([]);
    }
  };

  const loadOptions = (inputValue, callback) => {
    // Ensure salesItemTodoProd is an array of strings
    const selectedValues = (salesItemTodoProd || []).map((v) =>
      v.toLowerCase()
    );

    // Filter out already selected products
    const result = salesItemParticularsOpt.filter(
      (prod) => !selectedValues.includes(prod.value.toLowerCase())
    );

    // Apply search filter
    let filtered = result;
    if (inputValue) {
      const query = inputValue.toLowerCase();
      filtered = result.filter(
        (i) =>
          i.label.toLowerCase().includes(query) ||
          i.value.toLowerCase().includes(query)
      );
    }

    callback(filtered.slice(0, 50)); // max 50 results
  };

  const fetchSingleItem = async (data, date, hours, minutes, time) => {
    try {
      let res_item = await axios.get(
        `${SERVICE.ITEMMASTER_SINGLE}/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_item?.data?.sitemmaster;
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(
        singleData.itemname,
        date,
        formattedtime
      );
      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });

      calculateOldItemValues({
        productname: data.value,
        itemname: singleData.itemname,
        bnoteno:
          manageSalesCommon.isInvoice === true &&
          isNewBNote?.isNewValue === false
            ? isNewBNote.bnoteno
            : manageSalesCommon.bnoteno === "Please Select Bnote No"
            ? ""
            : manageSalesCommon.bnoteno,
        hsn: singleData.hsncode,
        productsize: singleData.sizename,
        waste: singleData.olddefaultwastage ? singleData.olddefaultwastage : 0,
        olddefaultwastage: singleData.olddefaultwastage,
        oldminimumwastage: singleData.oldminimumwastage,
        oldmaximumwastage: singleData.oldmaximumwastage,
        productcode: singleData.itemcode,
        producttype: singleData.pricingtype,
        rate: rateAmount ? rateAmount : "0.00",
        id: singleData._id,
        productgst: gstName,
        cgstper: Cgst,
        sgstper: Sgst,
        cgst: Cgst,
        sgst: Sgst,
      });
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchSingleItemForRateChange = async (
    id,
    productname,
    date,
    hours,
    minutes,
    time,
    index
  ) => {
    try {
      let res_item = await axios.get(`${SERVICE.ITEMMASTER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_item?.data?.sitemmaster;
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(
        singleData.itemname,
        date,
        formattedtime
      );

      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
      calculateOldItemValuesForRateChange(
        {
          productname: productname,
          itemname: singleData.itemname,
          bnoteno:
            manageSalesCommon.isInvoice === true &&
            isNewBNote?.isNewValue === false
              ? isNewBNote.bnoteno
              : manageSalesCommon.bnoteno === "Please Select Bnote No"
              ? ""
              : manageSalesCommon.bnoteno,
          hsn: singleData.hsncode,
          productsize: singleData.sizename,
          waste: singleData.olddefaultwastage
            ? singleData.olddefaultwastage
            : 0,
          olddefaultwastage: singleData.olddefaultwastage,
          oldminimumwastage: singleData.oldminimumwastage,
          oldmaximumwastage: singleData.oldmaximumwastage,
          productcode: singleData.itemcode,
          producttype: singleData.pricingtype,
          rate: rateAmount ? rateAmount : "0.00",
          id: singleData._id,
          productgst: gstName,
          cgstper: Cgst,
          sgstper: Sgst,
          cgst: Cgst,
          sgst: Sgst,
        },
        date,
        hours,
        minutes,
        time,
        index
      );
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const calculateOldItemValues = (updatedData = {}) => {
    const { originalweight, stoneweight, waste, rate, cgstper, sgstper } = {
      ...manageOldItem,
      ...updatedData,
    };

    manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false
      ? setIsAddNew(true)
      : setIsAddNew(false);

    const correctWeight = Number(originalweight) - Number(stoneweight);
    const actualWeight =
      Number(correctWeight) -
      Number(correctWeight) * (Number(waste) * (1 / 100));
    const wasteDiscount = Number(correctWeight) * (Number(waste) * (1 / 100));
    const foundedValue = Number(rate) * Number(actualWeight);
    const bNoteAmount = foundedValue;
    const grossAmt =
      100 * (bNoteAmount / (100 + Number(cgstper) + Number(sgstper)));
    const cgstValue = grossAmt * (Number(cgstper) * (1 / 100));
    const sgstValue = grossAmt * (Number(sgstper) * (1 / 100));
    const netOldAmount = grossAmt;
    // console.log(correctWeight, rateAmount, actualWeight, foundedValue)
    setManageOldItem((prev) => ({
      ...prev,
      ...updatedData,
      correctweight: correctWeight
        ? correctWeight < 0
          ? 0.0
          : correctWeight?.toFixed(3)
        : "",
      wastediscount: wasteDiscount ? wasteDiscount?.toFixed(2) : "0.00",
      actualweight: actualWeight ? actualWeight?.toFixed(3) : "",
      value: foundedValue ? foundedValue?.toFixed(2) : "",
      boughtnoteamount: bNoteAmount ? Math.round(bNoteAmount)?.toFixed(2) : "",
      cgst: cgstValue ? cgstValue?.toFixed(2) : "",
      sgst: sgstValue ? sgstValue?.toFixed(2) : " ",
      salestype: "Bought Note Amount",
      grossamount: netOldAmount ? netOldAmount?.toFixed(2) : "",
      status: "Sales",
    }));
  };

  const calculateOldItemValuesForRateChange = (
    updatedData = {},
    date,
    hours,
    minutes,
    time,
    index
  ) => {
    const currentItem = { ...oldItemTodo[index], ...updatedData };
    const { originalweight, stoneweight, waste, rate, cgstper, sgstper } =
      currentItem;

    manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false
      ? setIsAddNew(true)
      : setIsAddNew(false);

    const correctWeight = Number(originalweight) - Number(stoneweight);
    const actualWeight =
      Number(correctWeight) -
      Number(correctWeight) * (Number(waste) * (1 / 100));
    const wasteDiscount = Number(correctWeight) * (Number(waste) * (1 / 100));
    const foundedValue = Number(rate) * Number(actualWeight);
    const bNoteAmount = foundedValue;
    const grossAmt =
      100 * (bNoteAmount / (100 + Number(cgstper) + Number(sgstper)));
    const cgstValue = grossAmt * (Number(cgstper) * (1 / 100));
    const sgstValue = grossAmt * (Number(sgstper) * (1 / 100));
    const netOldAmount = grossAmt;
    // console.log(correctWeight, rateAmount, actualWeight, foundedValue)
    const updatedItem = {
      ...currentItem,
      correctweight: correctWeight
        ? correctWeight < 0
          ? 0.0
          : correctWeight?.toFixed(3)
        : "",
      wastediscount: wasteDiscount ? wasteDiscount?.toFixed(2) : "0.00",
      actualweight: actualWeight ? actualWeight?.toFixed(3) : "",
      value: foundedValue ? foundedValue?.toFixed(2) : "",
      boughtnoteamount: bNoteAmount ? Math.round(bNoteAmount)?.toFixed(2) : "",
      cgst: cgstValue ? cgstValue?.toFixed(2) : "",
      sgst: sgstValue ? sgstValue?.toFixed(2) : " ",
      salestype: "Bought Note Amount",
      grossamount: netOldAmount ? netOldAmount?.toFixed(2) : "",
      status: "Sales",
    };

    setOldItemTodo((prev) => {
      const newArr = [...prev];
      newArr[index] = updatedItem;
      toCalculateTotalValues(
        salesItemTodo,
        newArr,
        totalSalesReturnAmount,
        manageSalesCommon.isSReturn,
        manageSalesCommon.isManual,
        manageSalesCommon.isManualGrp,
        isNetAmt,
        isSalesAmt,
        manageSalesCommon.salesreturnno,
        date,
        hours,
        minutes,
        time,
        manageSalesCommon.bnoteno,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless,
        manageSalesCommon.lessopeningbalance,
        isCusAdvanceBalCheck,
        isAdvanceAmt
      );
      return newArr;
    });
    setPopupContent("Rate changed based on the selected date and time");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  const addOldItem = () => {
    if (manageOldItem.productname === "Please Select Particulars") {
      setPopupContentMalert("Please Select Particulars");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageOldItem.originalweight === "0.000") {
      setPopupContentMalert("Please Enter Original Weight");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isAddNew === true && manageOldItem.bnoteno === "") {
      setPopupContentMalert("Please Enter Bnote No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageOldItem.correctweight === "") {
      setPopupContentMalert("Please Enter Correct Weight");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    // else if (manageOldItem.waste === '') {
    //   setPopupContentMalert('Please Enter Waste');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageOldItem.rate === "") {
      setPopupContentMalert("Please Enter Rate");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      const newTodo = {
        ...manageSalesCommon,
        // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
        // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
        // customercontactprefix: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontactprefix : manageSalesCommon.customercontactprefix),
        // customercontact: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact),
        customername: String(manageSalesCommon.customername),
        customeraddress: String(manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon.customercontact),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(
          manageSalesCommon.salesid
            ? manageSalesCommon.salesid
            : allUsersLimit[0].companyname.trim()
        ),
        empcode: String(
          manageSalesCommon.empcode
            ? manageSalesCommon.empcode
            : allUsersLimit[0].empcode.trim()
        ),
        ...manageOldItem,
        rate: Number(manageOldItem.rate)?.toFixed(2),
      };
      const checkDup = oldItemTodo?.some(
        (data) => data.productname === newTodo.productname
      );
      // if (oldItemTodo.length > 0 && checkDup) {
      //   setPopupContentMalert('Product Already Exists!');
      //   setPopupSeverityMalert('warning');
      //   handleClickOpenPopupMalert();
      // } else {
      if (isAddNew === true) {
        const result = [...oldItemTodo, newTodo];
        // console.log(result);
        const fileredResult = result
          ?.filter((data) => data.status === "Sales")
          .map((item) => {
            return {
              bnoteno: item.bnoteno,
              id: item.id,
              productname: item.productname,
              productcode: item.productcode,
              producttype: item.producttype,
              hsn: item.hsn,
              productsize: item.productsize,
              productgst: item.productgst,
              pieces: item.pieces,
              originalweight: item.originalweight,
              stoneweight: item.stoneweight,
              correctweight: item.correctweight,
              olddefaultwastage: item.olddefaultwastage,
              oldminimumwastage: item.oldminimumwastage,
              oldmaximumwastage: item.oldmaximumwastage,
              waste: item.waste,
              wastediscount: item.wastediscount,
              actualweight: item.actualweight,
              rate: item.rate,
              value: item.value,
              grossamount: item.grossamount,
              cgstper: item.cgstper,
              sgstper: item.sgstper,
              cgst: item.cgst,
              sgst: item.sgst,
              salestype: item.salestype,
              boughtnoteamount: item.boughtnoteamount,
              status: item.status,
            };
          });
        // console.log(fileredResult, 'fileredResult')
        setAddedNewOldItem(fileredResult);
      } else {
        setAddedNewOldItem([]);
      }
      // setOldItemTodoProd([...oldItemTodoProd, newTodo.productname]);
      setOldItemTodo([...oldItemTodo, newTodo]);
      toCalculateTotalValues(
        salesItemTodo,
        [...oldItemTodo, newTodo],
        totalSalesReturnAmount,
        manageSalesCommon.isSReturn,
        manageSalesCommon.isManual,
        manageSalesCommon.isManualGrp,
        isNetAmt,
        isSalesAmt,
        manageSalesCommon.salesreturnno,
        manageSalesCommon.date,
        manageSalesCommon.hours,
        manageSalesCommon.minutes,
        manageSalesCommon.time,
        manageSalesCommon.bnoteno,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless,
        manageSalesCommon.lessopeningbalance,
        isCusAdvanceBalCheck,
        isAdvanceAmt
      );
      setIsAddNew(true);
      setManageOldItem({
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        bnoteno: "TRI/S/",
        hsn: "",
        pieces: 1,
        originalweight: "0.000",
        stoneweight: "0.000",
        correctweight: "0.000",
        waste: "",
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: "0.00",
        actualweight: "",
        rate: "",
        value: "",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        boughtnoteamount: "",
        status: "",
      });
      // }
    }
  };

  // Delete Searched Product
  const deleteOldItemRow = (i, e) => {
    setOldItemTodo(oldItemTodo.filter((v, item) => item !== i));
    const deletedItem = oldItemTodo.filter((v, item) => item !== i);
    toCalculateTotalValues(
      salesItemTodo,
      deletedItem,
      totalSalesReturnAmount,
      manageSalesCommon.isSReturn,
      manageSalesCommon.isManual,
      manageSalesCommon.isManualGrp,
      isNetAmt,
      isSalesAmt,
      manageSalesCommon.salesreturnno,
      manageSalesCommon.date,
      manageSalesCommon.hours,
      manageSalesCommon.minutes,
      manageSalesCommon.time,
      manageSalesCommon.bnoteno,
      manageSalesCommon.overalllesstype,
      manageSalesCommon.overallless,
      manageSalesCommon.lessopeningbalance,
      isCusAdvanceBalCheck,
      isAdvanceAmt
    );

    const result = oldItemTodo
      .filter((v, item) => item !== i)
      .filter((d) => d.status === "Sales");
    if (manageSalesCommon.isInvoice === true && result?.length > 0) {
      setIsAddNew(true);
    }
    if (manageSalesCommon.isInvoice === true && result?.length === 0) {
      setIsAddNew(false);
    }
    if (deletedItem.length === 0) {
      setOldTaxGroupsArray([]);
    }
  };

  // const fetchSinglePurSR = async (data, date, hours, minutes, time) => {
  //   try {
  //     let res_pur = await axios.get(`${SERVICE.MANAGEPURCHASE_SINGLE}/${data.id}`, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //     });
  //     const formattedtime = `${hours}:${minutes} ${time}`;
  //     const singleData = res_pur?.data?.smanagepurchase;
  //     const hsnValue = await fetchMatchedProdHsn(singleData.itemname);
  //     const gstName = await fetchMatchedProdGstName(singleData.itemname);
  //     const Cgst = await fetchMatchedProdCgst(singleData.itemname);
  //     const Sgst = await fetchMatchedProdSgst(singleData.itemname);
  //     const rateAmount = await fetchRate(singleData.itemname, date, formattedtime);

  //     // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
  //     if (['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticularSR('Piece');
  //       calculateSalesReturnItemValues('Piece', {
  //         productname: data.value,
  //         salesreturnno: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno === 'Please Select Sales Return No' ? '' : manageSalesCommon.salesreturnno,
  //         weight: '0.000',
  //         hsn: hsnValue,
  //         pieces: singleData.piecesvalue,
  //         itemname: singleData.itemname,
  //         productsize: singleData.sizename,
  //         productcode: singleData.itemcode,
  //         makingcharge: '0.00',
  //         producttype: singleData.type,
  //         productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //         makingchargemode: singleData.makingchargemode,
  //         originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //         rate: singleData.salesamount,
  //         unit: singleData.unit,
  //         id: singleData._id,
  //         productgst: gstName,
  //         cgstper: Cgst,
  //         sgstper: Sgst,
  //         cgst: Cgst,
  //         sgst: Sgst,
  //       });
  //     }
  //     if (!['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticularSR('Gram');
  //       calculateSalesReturnItemValues('Gram', {
  //         productname: data.value,
  //         salesreturnno: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno === 'Please Select Sales Return No' ? '' : manageSalesCommon.salesreturnno,
  //         weight: singleData.weight,
  //         hsn: hsnValue,
  //         pieces: singleData.piecesvalue,
  //         itemname: singleData.itemname,
  //         productsize: singleData.sizename,
  //         productcode: singleData.itemcode,
  //         makingcharge: '0.00',
  //         producttype: singleData.type,
  //         productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //         makingchargemode: singleData.makingchargemode,
  //         originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //         rate: rateAmount ? rateAmount : '0.00',
  //         unit: singleData.unit,
  //         id: singleData._id,
  //         productgst: gstName,
  //         cgstper: Cgst,
  //         sgstper: Sgst,
  //         cgst: Cgst,
  //         sgst: Sgst,
  //       });
  //     }
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  // const fetchSinglePurForRateChangeSR = async (id, productname, date, hours, minutes, time, index) => {
  //   try {
  //     let res_pur = await axios.get(`${SERVICE.MANAGEPURCHASE_SINGLE}/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //     });
  //     const formattedtime = `${hours}:${minutes} ${time}`;
  //     const singleData = res_pur?.data?.smanagepurchase;
  //     const hsnValue = await fetchMatchedProdHsn(singleData.itemname);
  //     const gstName = await fetchMatchedProdGstName(singleData.itemname);
  //     const Cgst = await fetchMatchedProdCgst(singleData.itemname);
  //     const Sgst = await fetchMatchedProdSgst(singleData.itemname);
  //     const rateAmount = await fetchRate(singleData.itemname, date, formattedtime);

  //     // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
  //     if (['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticularSR('Piece');
  //       calculateSalesReturnItemValuesForRateChange(
  //         'Piece',
  //         {
  //           productname: productname,
  //           salesreturnno: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno === 'Please Select Sales Return No' ? '' : manageSalesCommon.salesreturnno,
  //           weight: '0.000',
  //           hsn: hsnValue,
  //           pieces: singleData.piecesvalue,
  //           itemname: singleData.itemname,
  //           productsize: singleData.sizename,
  //           productcode: singleData.itemcode,
  //           makingcharge: '0.00',
  //           producttype: singleData.type,
  //           productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //           makingchargemode: singleData.makingchargemode,
  //           originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //           rate: singleData.salesamount,
  //           unit: singleData.unit,
  //           id: singleData._id,
  //           productgst: gstName,
  //           cgstper: Cgst,
  //           sgstper: Sgst,
  //           cgst: Cgst,
  //           sgst: Sgst,
  //         },
  //         date,
  //         hours,
  //         minutes,
  //         time,
  //         index
  //       );
  //     }
  //     if (!['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticularSR('Gram');
  //       calculateSalesReturnItemValuesForRateChange(
  //         'Gram',
  //         {
  //           productname: productname,
  //           salesreturnno: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno === 'Please Select Sales Return No' ? '' : manageSalesCommon.salesreturnno,
  //           weight: singleData.weight,
  //           hsn: hsnValue,
  //           pieces: singleData.piecesvalue,
  //           itemname: singleData.itemname,
  //           productsize: singleData.sizename,
  //           productcode: singleData.itemcode,
  //           makingcharge: '0.00',
  //           producttype: singleData.type,
  //           productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //           makingchargemode: singleData.makingchargemode,
  //           originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //           rate: rateAmount ? rateAmount : '0.00',
  //           unit: singleData.unit,
  //           id: singleData._id,
  //           productgst: gstName,
  //           cgstper: Cgst,
  //           sgstper: Sgst,
  //           cgst: Cgst,
  //           sgst: Sgst,
  //         },
  //         date,
  //         hours,
  //         minutes,
  //         time,
  //         index
  //       );
  //     }
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  // const calculateSalesReturnItemValues = (unitType, updatedData = {}) => {
  //   const { pieces, weight, lesstype, less, makingchargemode, originalmc, makingcharge, rate, cgstper, sgstper } = { ...manageSalesReturnItem, ...updatedData };
  //   console.log(manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? 'Not return' : 'Returned')
  //   manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? setIsAddNewSR(true) : setIsAddNewSR(false);

  //   // const foundedValue = (unitType === 'Piece') ? (Number(rate) * Number(pieces)) : (Number(rate) * Number(weight));
  //   const foundedValue = unitType === 'Piece' ? Number(rate) : Number(rate) * Number(weight);
  //   const mcRateBasedMode = makingchargemode === 'Fixed' ? Number(originalmc) : Number(weight) * Number(originalmc);
  //   const finalMackingCharges = originalmc !== '0.00' ? Number(mcRateBasedMode) - Number(makingcharge) : Number(makingcharge);
  //   const makingCharges = foundedValue + Number(finalMackingCharges);
  //   const foundedLess = lesstype === 'Fixed' ? Number(less) : makingCharges * (Number(less) * (1 / 100));
  //   const grossAmount = makingCharges - foundedLess;
  //   const cgstValue = grossAmount * (Number(cgstper) * (1 / 100));
  //   const sgstValue = grossAmount * (Number(sgstper) * (1 / 100));
  //   const netSaleAmount = grossAmount + cgstValue + sgstValue;

  //   setManageSalesReturnItem((prev) => ({
  //     ...prev,
  //     ...updatedData,
  //     value: foundedValue ? foundedValue?.toFixed(2) : '',
  //     originalmc: originalmc ? Number(originalmc)?.toFixed(2) : '',
  //     mcgramamount: mcRateBasedMode?.toFixed(2),
  //     makingchargemode: makingchargemode ? makingchargemode : '',
  //     mc: makingCharges ? makingCharges?.toFixed(2) : '',
  //     lessamount: foundedLess,
  //     grossamount: grossAmount ? grossAmount?.toFixed(2) : '',
  //     cgst: cgstValue ? cgstValue?.toFixed(2) : '',
  //     sgst: sgstValue ? sgstValue?.toFixed(2) : '',
  //     salestype: 'Sales Amount',
  //     salesamount: netSaleAmount ? Math.round(netSaleAmount)?.toFixed(2) : '',
  //     status: 'Sales',
  //     returnstatus: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? 'Not return' : 'Returned',
  //   }));
  // };

  // const calculateSalesReturnItemValuesForRateChange = (unitType, updatedData = {}, date, hours, minutes, time, index) => {
  //   const currentItem = { ...salesReturnItemTodo[index], ...updatedData };
  //   const { pieces, weight, lesstype, less, makingchargemode, originalmc, makingcharge, rate, cgstper, sgstper } = currentItem;

  //   manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? setIsAddNewSR(true) : setIsAddNewSR(false);

  //   const foundedValue = unitType === 'Piece' ? Number(rate) : Number(rate) * Number(weight);
  //   const mcRateBasedMode = makingchargemode === 'Fixed' ? Number(originalmc) : Number(weight) * Number(originalmc);
  //   const finalMackingCharges = originalmc !== '0.00' ? Number(mcRateBasedMode) - Number(makingcharge) : Number(makingcharge);
  //   const makingCharges = foundedValue + Number(finalMackingCharges);
  //   const foundedLess = lesstype === 'Fixed' ? Number(less) : makingCharges * (Number(less) * (1 / 100));
  //   const grossAmount = makingCharges - foundedLess;
  //   const cgstValue = grossAmount * (Number(cgstper) / 100);
  //   const sgstValue = grossAmount * (Number(sgstper) / 100);
  //   const netSaleAmount = grossAmount + cgstValue + sgstValue;

  //   const updatedItem = {
  //     ...currentItem,
  //     value: foundedValue ? foundedValue.toFixed(2) : '',
  //     originalmc: originalmc ? Number(originalmc).toFixed(2) : '',
  //     mcgramamount: mcRateBasedMode?.toFixed(2),
  //     makingchargemode: makingchargemode || '',
  //     mc: makingCharges ? makingCharges.toFixed(2) : '',
  //     lessamount: foundedLess,
  //     grossamount: grossAmount ? grossAmount.toFixed(2) : '',
  //     cgst: cgstValue ? cgstValue.toFixed(2) : '',
  //     sgst: sgstValue ? sgstValue.toFixed(2) : '',
  //     salestype: 'Sales Amount',
  //     salesamount: netSaleAmount ? Math.round(netSaleAmount).toFixed(2) : '',
  //     status: 'Sales',
  //     returnstatus: manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false ? 'Not return' : 'Returned',
  //   };

  //   setSalesReturnItemTodo((prev) => {
  //     const newArr = [...prev];
  //     newArr[index] = updatedItem;
  //     //   toCalculateTotalValues(newArr, oldItemTodo, date, hours, minutes, time, manageSalesCommon.bnoteno, manageSalesCommon.overalllesstype, manageSalesCommon.overallless, manageSalesCommon.lessopeningbalance);
  //     return newArr;
  //   });
  //   setPopupContent('Rate changed based on the selected date and time');
  //   setPopupSeverity('success');
  //   handleClickOpenPopup();
  // };

  // const addSalesReturnItem = () => {
  //   if (manageSalesReturnItem.productname === 'Please Select Particulars') {
  //     setPopupContentMalert('Please Select Particulars');
  //     setPopupSeverityMalert('warning');
  //     handleClickOpenPopupMalert();
  //   } else if (manageSalesReturnItem.pieces === '') {
  //     setPopupContentMalert('Please Enter Pieces');
  //     setPopupSeverityMalert('warning');
  //     handleClickOpenPopupMalert();
  //   } else if (salesItemTypeFromParticularSR === 'Gram' && manageSalesReturnItem.weight === '') {
  //     setPopupContentMalert('Please Enter Weight');
  //     setPopupSeverityMalert('warning');
  //     handleClickOpenPopupMalert();
  //   } else if (manageSalesReturnItem.rate === '') {
  //     setPopupContentMalert('Please Enter Rate');
  //     setPopupSeverityMalert('warning');
  //     handleClickOpenPopupMalert();
  //   } else {
  //     const newTodo = {
  //       ...manageSalesCommon,
  //       // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
  //       // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
  //       // customercontactprefix: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontactprefix : manageSalesCommon.customercontactprefix),
  //       // customercontact: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact),
  //       customername: String(manageSalesCommon.customername),
  //       customeraddress: String(manageSalesCommon.customeraddress),
  //       customercontactprefix: String(manageSalesCommon.customercontactprefix),
  //       customercontact: String(manageSalesCommon.customercontact),
  //       billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
  //       salesid: String(manageSalesCommon.salesid ? manageSalesCommon.salesid : allUsersLimit[0].companyname.trim()),
  //       empcode: String(manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()),
  //       bnoteno: String(isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : (manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' :  manageSalesCommon.bnoteno)),
  //       // salesreturnno: String(isNewSReturn?.isNewValue === false ? isNewSReturn.salesreturnno : manageSalesCommon.salesreturnno),
  //       ...manageSalesReturnItem,
  //       rate: Number(manageSalesReturnItem.rate)?.toFixed(2),
  //       returnstatus: 'Not return',
  //     };
  //     const checkDup = salesReturnItemTodo?.some((data) => data.productname === newTodo.productname);
  //     // if (salesReturnItemTodo.length > 0 && checkDup) {
  //     //   setPopupContentMalert('Product Already Exists!');
  //     //   setPopupSeverityMalert('warning');
  //     //   handleClickOpenPopupMalert();
  //     // } else {
  //     if (isAddNewSR === true) {
  //       const result = [...salesReturnItemTodo, newTodo];
  //       // console.log(result);
  //       const fileredResult = result
  //         ?.filter((data) => data.status === 'Sales')
  //         .map((item) => {
  //           return {
  //             id: item.id,
  //             salesreturnno: item.salesreturnno,
  //             customername: item.customername,
  //             customercontact: item.customercontact,
  //             date: item.date,
  //             billno: item.billno,
  //             productname: item.productname,
  //             productcode: item.productcode,
  //             producttype: item.producttype,
  //             productitemcoderunningnumber: item.productitemcoderunningnumber,
  //             productsize: item.productsize,
  //             hsn: item.hsn,
  //             pieces: item.pieces,
  //             weight: item.weight,
  //             originalmc: item.originalmc,
  //             mcgramamount: item.mcgramamount,
  //             makingchargemode: item.makingchargemode,
  //             mc: item.mc,
  //             rate: item.rate,
  //             value: item.value,
  //             lesstype: item.lesstype,
  //             less: item.less,
  //             grossamount: item.grossamount,
  //             cgstper: item.cgstper,
  //             sgstper: item.sgstper,
  //             cgst: item.cgst,
  //             sgst: item.sgst,
  //             salestype: item.salestype,
  //             salesamount: item.salesamount,
  //             salesreturnamount: Number(item.salesreturnamount) - Number(item.lessamount),
  //             status: item.status,
  //           };
  //         });
  //       // console.log(fileredResult, 'fileredResult')
  //       setAddedNewSRItem(fileredResult);
  //     } else {
  //       setAddedNewSRItem([]);
  //     }
  //     // setSalesItemTodoProd([...salesItemTodoProd, newTodo.productname]);
  //     setSalesReturnItemTodo([...salesReturnItemTodo, newTodo]);
  //     // toCalculateTotalValues(
  //     //   [...salesReturnItemTodo, newTodo],
  //     //   oldItemTodo,
  //     //   manageSalesCommon.date,
  //     //   manageSalesCommon.hours,
  //     //   manageSalesCommon.minutes,
  //     //   manageSalesCommon.time,
  //     //   manageSalesCommon.bnoteno,
  //     //   manageSalesCommon.overalllesstype,
  //     //   manageSalesCommon.overallless,
  //     //   manageSalesCommon.lessopeningbalance
  //     // );
  //     setManageSalesReturnItem({
  //       productname: 'Please Select Particulars',
  //       productcode: '',
  //       producttype: '',
  //       productsize: '',
  //       productgst: '',
  //       productitemcoderunningnumber: '',
  //       salesreturnno: 'TRI/SR/',
  //       hsn: '',
  //       pieces: 1,
  //       weight: '',
  //       rate: '',
  //       value: '',
  //       makingchargemode: '',
  //       originalmc: '',
  //       mcgramamount: '0.00',
  //       makingcharge: '0.00',
  //       mc: '',
  //       lesstype: 'Fixed',
  //       less: '0.00',
  //       grossamount: '',
  //       cgstper: '0.00',
  //       sgstper: '0.00',
  //       cgst: '',
  //       sgst: '',
  //       salestype: '',
  //       salesamount: '',
  //     });
  //     // }
  //   }
  // };

  // Delete Searched Product
  const deleteSalesReturnItemRow = (i, e) => {
    setSalesReturnItemTodo(salesReturnItemTodo.filter((v, item) => item !== i));
    const deletedItem = salesReturnItemTodo.filter((v, item) => item !== i);

    toCalculateTotalValues(
      salesItemTodo,
      oldItemTodo,
      deletedItem[0]?.totalsalesreturnamount,
      manageSalesCommon.isSReturn,
      manageSalesCommon.isManual,
      manageSalesCommon.isManualGrp,
      isNetAmt,
      isSalesAmt,
      manageSalesCommon.salesreturnno,
      manageSalesCommon.date,
      manageSalesCommon.hours,
      manageSalesCommon.minutes,
      manageSalesCommon.time,
      manageSalesCommon.bnoteno,
      manageSalesCommon.overalllesstype,
      manageSalesCommon.overallless,
      manageSalesCommon.lessopeningbalance,
      isCusAdvanceBalCheck,
      isAdvanceAmt
    );

    const result = salesReturnItemTodo
      .filter((v, item) => item !== i)
      .filter((d) => d.status === "Sales");
    if (manageSalesCommon.isSReturn === true && result?.length > 0) {
      setIsAddNewSR(true);
    }
    if (manageSalesCommon.isSReturn === true && result?.length === 0) {
      setIsAddNewSR(false);
    }
    // if (deletedItem.length === 0) {
    //   setSalesTaxGroupsArray([]);
    // }
  };

  // // sales total calculation
  // const toCalculateTotalValues = (salesItemTodo, oldItemTodo, date, hours, minutes, time, bnotevalue, salestype, salesvalue, oldtype, oldvalue, type, value) => {

  //   let totalSalesValue1 = 0;
  //   let totalSalesValue2 = 0;
  //   let totalSalesValue3 = 0;
  //   let totalSalesValue4 = 0;
  //   let totalSalesValue5 = 0;
  //   let totalSalesValue6 = 0;
  //   let totalSalesValue7 = 0;
  //   let totalSalesCgstper = 0;
  //   let totalSalesSgstper = 0;

  //   let totalOldValue1 = 0;
  //   let totalOldValue2 = 0;
  //   let totalOldValue3 = 0;
  //   let totalOldValue4 = 0;
  //   let totalOldValue5 = 0;
  //   let totalOldValue6 = 0;
  //   let totalOldValue7 = 0;
  //   let totalOldCgstper = 0;
  //   let totalOldSgstper = 0;

  //   // sales total less
  //   let totalSalesLess = 0;
  //   let afterSalesGrossAmt = 0;
  //   let afterSalesCgst = 0;
  //   let afterSalesSgst = 0;
  //   let afterNetSaleAmount = 0;

  //   // old total less
  //   let totalOldLess = 0;
  //   let afterOldGrossAmt = 0;
  //   let afterOldCgst = 0;
  //   let afterOldSgst = 0;
  //   let afterNetOldAmount = 0;

  //   if (salesItemTodo?.length > 0) {
  //     salesItemTodo?.forEach((item) => {
  //       totalSalesValue1 += Number(item.weight || 0);
  //       totalSalesValue2 += Number(item.makingcharge || 0);
  //       totalSalesValue3 += Number(item.grossamount || 0);
  //       totalSalesValue4 += Number(item.cgst || 0);
  //       totalSalesValue5 += Number(item.sgst || 0);
  //       totalSalesValue6 += Number(item.salesamount || 0);
  //       totalSalesValue7 += Number(item.pieces || 0);
  //       totalSalesCgstper += Number(item.cgstper || 0);
  //       totalSalesSgstper += Number(item.sgstper || 0);
  //     });

  //     // sales total less
  //     totalSalesLess = salestype === 'Percentage' ? (totalSalesValue3 * ((Number(salesvalue) * 1 / 100))) : Number(salesvalue);
  //     afterSalesGrossAmt = totalSalesValue3 - totalSalesLess;
  //     afterSalesCgst = afterSalesGrossAmt * (totalSalesCgstper * (1 / 100));
  //     afterSalesSgst = afterSalesGrossAmt * (totalSalesSgstper * (1 / 100));
  //     afterNetSaleAmount = Math.round(afterSalesGrossAmt + afterSalesCgst + afterSalesSgst);
  //   }

  //   if (oldItemTodo?.length > 0) {
  //     oldItemTodo?.forEach((item) => {
  //       totalOldValue1 += Number(item.correctweight || 0);
  //       totalOldValue2 += Number(item.wastediscount || 0);
  //       totalOldValue3 += Number(item.grossamount || 0);
  //       totalOldValue4 += Number(item.cgst || 0);
  //       totalOldValue5 += Number(item.sgst || 0);
  //       totalOldValue6 += Number(item.boughtnoteamount || 0);
  //       totalOldValue7 += Number(item.pieces || 0);
  //       totalOldCgstper += Number(item.cgstper || 0);
  //       totalOldSgstper += Number(item.sgstper || 0);
  //     });

  //     // old total less
  //     totalOldLess = oldtype === 'Percentage' ? (totalOldValue3 * ((Number(oldvalue) * 1 / 100))) : Number(oldvalue);
  //     afterOldGrossAmt = totalOldValue3 - totalOldLess;
  //     afterOldCgst = afterOldGrossAmt * (totalOldCgstper * (1 / 100));
  //     afterOldSgst = afterOldGrossAmt * (totalOldSgstper * (1 / 100));
  //     afterNetOldAmount = Math.round(afterOldGrossAmt + afterOldCgst + afterOldSgst);
  //   }

  //   // const beforeNetAmt = ((salesItemTodo?.length > 0 && oldItemTodo?.length === 0) ? totalSalesValue6
  //   //   : (salesItemTodo?.length === 0 && oldItemTodo?.length > 0) ? totalOldValue6
  //   //     : (salesItemTodo?.length > 0 && oldItemTodo?.length > 0) ? (totalSalesValue6 - totalOldValue6)
  //   //       : 0)?.toFixed(2);

  //   const beforeNetAmt = ((salesItemTodo?.length > 0 && oldItemTodo?.length === 0) ? afterNetSaleAmount
  //     : (salesItemTodo?.length === 0 && oldItemTodo?.length > 0) ? afterNetOldAmount
  //       : (salesItemTodo?.length > 0 && oldItemTodo?.length > 0) ? (afterNetSaleAmount - afterNetOldAmount)
  //         : 0)?.toFixed(2);

  //   const lessAmount = type === 'Percentage' ? (beforeNetAmt * (Number(value) * 1 / 100)) : Number(value);
  //   const afterNetAmt = beforeNetAmt - lessAmount;

  //   setManageSalesCommon({
  //     ...manageSalesCommon,
  //     date: date,
  //     hours: hours,
  //     minutes: minutes,
  //     time: time,
  //     bnoteno: bnotevalue,
  //     totalsalespieces: totalSalesValue7,
  //     totalsalesweight: totalSalesValue1?.toFixed(3),
  //     totalmcdiscount: totalSalesValue2?.toFixed(2),
  //     totalsalesgrosswithoutdiscount: totalSalesValue3?.toFixed(2),
  //     saleslesstype: salesItemTodo?.length > 0 ? salestype : 'Fixed',
  //     salesless: salesItemTodo?.length > 0 ? salesvalue : '0.00',
  //     totalsalesgross: salesItemTodo?.length > 0 ? afterSalesGrossAmt?.toFixed(2) : 0,
  //     totalsalescgstper: totalSalesCgstper,
  //     totalsalessgstper: totalSalesSgstper,
  //     totalsalescgst: salesItemTodo?.length > 0 ? afterSalesCgst?.toFixed(2) : 0,
  //     totalsalessgst: salesItemTodo?.length > 0 ? afterSalesSgst?.toFixed(2) : 0,
  //     totalsalesamount: salesItemTodo?.length > 0 ? afterNetSaleAmount?.toFixed(2) : 0,
  //     totaloldpieces: totalOldValue7,
  //     totaloldweight: totalOldValue1?.toFixed(3),
  //     totalwastagediscount: totalOldValue2?.toFixed(2),
  //     totaloldgrosswithoutdiscount: totalOldValue3?.toFixed(2),
  //     oldlesstype: oldItemTodo?.length > 0 ? oldtype : 'Fixed',
  //     oldless: oldItemTodo?.length > 0 ? oldvalue : '0.00',
  //     totaloldgross: oldItemTodo?.length > 0 ? afterOldGrossAmt?.toFixed(2) : 0,
  //     totaloldcgstper: totalOldCgstper,
  //     totaloldsgstper: totalOldSgstper,
  //     totaloldcgst: oldItemTodo?.length > 0 ? afterOldCgst?.toFixed(2) : 0,
  //     totaloldsgst: oldItemTodo?.length > 0 ? afterOldSgst?.toFixed(2) : 0,
  //     totaloldamount: oldItemTodo?.length > 0 ? afterNetOldAmount?.toFixed(2) : 0,
  //     overalllesstype: (salesItemTodo?.length > 0 || oldItemTodo?.length > 0) ? type : 'Fixed',
  //     overallless: (salesItemTodo?.length > 0 || oldItemTodo?.length > 0) ? value : '0.00',
  //     netamountwithoutdis: (salesItemTodo.length === 0 && oldItemTodo.length > 0) ? 0 : beforeNetAmt,
  //     netamount: (salesItemTodo.length === 0 && oldItemTodo.length > 0) ? 0 : afterNetAmt?.toFixed(2),
  //   });
  // };

  // const totalSalesAmtCalculation = (salesItemTodo) => {
  //   let totalValue = 0;
  //   if (salesItemTodo?.length > 0) {
  //     salesItemTodo?.map(val => {
  //       totalValue += Number(val.totalsalesamount);
  //     })
  //   }
  //   return totalValue;
  // }

  const totalSalesAmtCalculation = (salesItemTodo = []) => {
    return salesItemTodo.reduce(
      (acc, item) => acc + Number(item.salesamount || 0),
      0
    );
  };

  const rowSalesAmtCalculation = (salesItemTodo, perValue) => {
    let totalValue = 0;
    if (salesItemTodo?.length > 0) {
      salesItemTodo?.forEach((val) => {
        if (val.cgstper === perValue) {
          totalValue += Number(val.salesamount);
        }
      });
    }
    return totalValue;
  };

  const toCalculateTotalValues = (
    salesItemTodo,
    oldItemTodo,
    totalSalesReturnAmount,
    isSReturn,
    isManual,
    isManualGrp,
    isNetAmt,
    isSalesAmt,
    salesreturnno,
    date,
    hours,
    minutes,
    time,
    bnotevalue,
    type,
    value,
    lessopeningbalancevalue,
    isCusAdvanceBalCheck,
    isAdvanceAmt
  ) => {
    let salesTaxGroups = {};
    let oldTaxGroups = {};

    if (salesItemTodo?.length > 0) {
      salesItemTodo.forEach((item) => {
        if (!salesTaxGroups[item.cgstper]) {
          const existing = salesTaxGroupsArray.find(
            (row) => Number(row.totalsalescgstper) === Number(item.cgstper)
          );

          salesTaxGroups[item.cgstper] = {
            totalsalespieces: 0,
            totalsalesweight: 0,
            totalmcdiscount: 0,
            totalsalesgrosswithoutdiscount: 0,
            saleslesstype: existing?.saleslesstype || "Fixed",
            salesless: existing?.salesless || 0,
            saleslessamount: existing?.saleslessamount || 0,
            totalsalesgross: 0,
            totalsalescgstper: Number(item.cgstper),
            totalsalessgstper: Number(item.sgstper),
            totalsalescgst: 0,
            totalsalessgst: 0,
            totalsalesamount: 0,
          };
        }

        salesTaxGroups[item.cgstper].totalsalespieces += Number(
          item.pieces || 0
        );
        salesTaxGroups[item.cgstper].totalsalesweight += Number(
          item.weight || 0
        );
        salesTaxGroups[item.cgstper].totalmcdiscount += Number(
          item.makingcharge || 0
        );
        salesTaxGroups[item.cgstper].totalsalesgrosswithoutdiscount += Number(
          item.grossamount || 0
        );
      });

      // distribute discount proportionally across tax groups
      Object.keys(salesTaxGroups).forEach((rate) => {
        const group = salesTaxGroups[rate];

        // console.log(group, group.totalsalesamount, 'group.totalsalesamount')

        const totalSalesLess =
          group.saleslesstype === "Percentage"
            ? Number(group.totalsalesgrosswithoutdiscount) *
              ((Number(group.salesless) * 1) / 100)
            : Number(group.salesless);

        const afterSalesGrossAmt =
          Number(group.totalsalesgrosswithoutdiscount) - totalSalesLess;
        const afterSalesCgst =
          afterSalesGrossAmt * (Number(group.totalsalescgstper) * (1 / 100));
        const afterSalesSgst =
          afterSalesGrossAmt * (Number(group.totalsalessgstper) * (1 / 100));
        const afterNetSaleAmount = Math.round(
          afterSalesGrossAmt + afterSalesCgst + afterSalesSgst
        );

        group.totalsalesweight = Number(group.totalsalesweight)?.toFixed(3);
        group.totalmcdiscount = Number(group.totalmcdiscount)?.toFixed(2);
        group.totalsalesgrosswithoutdiscount = Number(
          group.totalsalesgrosswithoutdiscount
        )?.toFixed(2);
        group.totalsalesgross = Number(afterSalesGrossAmt)?.toFixed(2);
        group.totalsalescgst = Number(afterSalesCgst)?.toFixed(2);
        group.totalsalessgst = Number(afterSalesSgst)?.toFixed(2);
        group.totalsalesamount = Number(afterNetSaleAmount)?.toFixed(2);
      });
    } else {
      setSalesTaxGroupsArray([]);
    }

    // console.log(salesTaxGroups, 'salesTaxGroups')
    // const salesTaxGroupsArray = Object.values(salesTaxGroups);
    // console.log(salesTaxGroupsArray, 'salesTaxGroupsArray')
    const groupsArraySales = Object.values(salesTaxGroups);
    // setSalesTaxGroupsArray(groupsArraySales);
    // console.log(groupsArraySales, 'groupsArraySales')

    if (oldItemTodo?.length > 0) {
      oldItemTodo.forEach((item) => {
        if (!oldTaxGroups[item.cgstper]) {
          const existing = oldTaxGroupsArray.find(
            (row) => Number(row.totaloldcgstper) === Number(item.cgstper)
          );
          oldTaxGroups[item.cgstper] = {
            totaloldpieces: 0,
            totaloldweight: 0,
            totalwastagediscount: 0,
            totaloldgrosswithoutdiscount: 0,
            oldlesstype: existing?.oldlesstype || "Fixed",
            oldless: existing?.oldless || 0,
            oldlessamount: existing?.oldlessamount || 0,
            totaloldgross: 0,
            totaloldcgstper: Number(item.cgstper),
            totaloldsgstper: Number(item.sgstper),
            totaloldcgst: 0,
            totaloldsgst: 0,
            totalsalesgross: 0,
            totaloldamount: 0,
          };
        }

        oldTaxGroups[item.cgstper].totaloldpieces += Number(item.pieces || 0);
        oldTaxGroups[item.cgstper].totaloldweight += Number(
          item.correctweight || 0
        );
        oldTaxGroups[item.cgstper].totalwastagediscount += Number(
          item.wastediscount || 0
        );
        oldTaxGroups[item.cgstper].totaloldgrosswithoutdiscount += Number(
          item.grossamount || 0
        );
      });

      // distribute discount proportionally across tax groups
      Object.keys(oldTaxGroups).forEach((rate) => {
        const group = oldTaxGroups[rate];

        const totalSalesLess =
          group.saleslesstype === "Percentage"
            ? Number(group.totalsalesgrosswithoutdiscount) *
              ((Number(group.salesless) * 1) / 100)
            : Number(group.salesless);

        const afterSalesGrossAmt =
          Number(group.totaloldgrosswithoutdiscount) - totalSalesLess;
        const afterSalesCgst =
          afterSalesGrossAmt * (Number(group.totaloldcgstper) * (1 / 100));
        const afterSalesSgst =
          afterSalesGrossAmt * (Number(group.totaloldsgstper) * (1 / 100));
        const afterNetSaleAmount = Math.round(
          afterSalesGrossAmt + afterSalesCgst + afterSalesSgst
        );

        group.totaloldweight = Number(group.totaloldweight)?.toFixed(3);
        group.totalwastagediscount = Number(
          group.totalwastagediscount
        )?.toFixed(2);
        group.totaloldgrosswithoutdiscount = Number(
          group.totaloldgrosswithoutdiscount
        )?.toFixed(2);
        group.totaloldgross = Number(group.afterSalesGrossAmt)?.toFixed(2);
        group.totaloldcgst = Number(afterSalesCgst)?.toFixed(2);
        group.totaloldsgst = Number(afterSalesSgst)?.toFixed(2);
        group.totaloldamount = Number(afterNetSaleAmount)?.toFixed(2);
      });
    } else {
      setOldTaxGroupsArray([]);
    }
    const groupsArrayOld = Object.values(oldTaxGroups);
    // setOldTaxGroupsArray(groupsArrayOld);
    // console.log(groupsArrayOld, 'groupsArrayOld')

    // Recalculate with preserved inputs
    const updatedSales = groupsArraySales.map((row) =>
      recalcGroupRow(row, isManualGrp, isSalesAmt, salesItemTodo)
    );
    const updatedOld = groupsArrayOld.map((row) => recalcGroupRow1(row));

    setSalesTaxGroupsArray(updatedSales);
    setOldTaxGroupsArray(updatedOld);
    // console.log(updatedSales, 'updatedSales')
    // Now compute net
    let totalSalesPieces = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalespieces || 0),
      0
    );
    let totalSalesWeight = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalesweight || 0),
      0
    );
    let totalSalesMcDis = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalmcdiscount || 0),
      0
    );
    let totalSalesWithoutGross = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalesgrosswithoutdiscount || 0),
      0
    );
    let totalSalesLessAmount = updatedSales.reduce(
      (acc, row) => acc + Number(row.saleslessamount || 0),
      0
    );
    let totalSalesGross = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalesgross || 0),
      0
    );
    let totalSalesCgst = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalescgst || 0),
      0
    );
    let totalSalesSgst = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalessgst || 0),
      0
    );
    let totalSales = updatedSales.reduce(
      (acc, row) => acc + Number(row.totalsalesamount || 0),
      0
    );

    let totalOldPieces = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldpieces || 0),
      0
    );
    let totalOldWieght = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldweight || 0),
      0
    );
    let totalOldWastageDis = updatedOld.reduce(
      (acc, row) => acc + Number(row.totalwastagediscount || 0),
      0
    );
    let totalOldWithoutGross = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldgrosswithoutdiscount || 0),
      0
    );
    let totalOldGross = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldgross || 0),
      0
    );
    let totalOldCgst = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldcgst || 0),
      0
    );
    let totalOldSgst = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldsgst || 0),
      0
    );
    let totalOld = updatedOld.reduce(
      (acc, row) => acc + Number(row.totaloldamount || 0),
      0
    );

    const typeValue =
      updatedSales?.length > 0 || updatedOld?.length > 0 ? type : "Fixed";
    // const inputValues = updatedSales?.length > 0 || updatedOld?.length > 0 ? value : '0.00';

    let beforeNetAmtWithoutReducedSR;
    let beforeNetAmt;
    let inputValues = 0;
    let lessAmount = 0;
    let afterNetAmt = 0;

    console.log(isAdvanceAmt, "isAdvanceAmt");
    if (isManual === true && isNetAmt !== "0.00") {
      const actualNetAmount = (
        updatedSales.length > 0 && updatedOld.length === 0
          ? totalSales
          : updatedSales.length === 0 && updatedOld.length > 0
          ? totalOld
          : updatedSales.length > 0 && updatedOld.length > 0
          ? totalSales - totalOld
          : 0
      ).toFixed(2);

      inputValues =
        updatedSales?.length > 0 || updatedOld?.length > 0
          ? Number(isNetAmt) - actualNetAmount
          : "0.00";

      lessAmount =
        typeValue === "Percentage"
          ? Number(isNetAmt) * (Number(inputValues) / 100)
          : Number(inputValues);

      beforeNetAmt = Number(
        Number(isNetAmt) +
          lessAmount +
          Number(lessopeningbalancevalue) +
          Number(isAdvanceAmt)
      )?.toFixed(2);
      afterNetAmt = Number(isNetAmt);
    } else if (isManual === false && isNetAmt === "0.00") {
      beforeNetAmtWithoutReducedSR = (
        updatedSales.length > 0 && updatedOld.length === 0
          ? totalSales
          : updatedSales.length === 0 && updatedOld.length > 0
          ? totalOld
          : updatedSales.length > 0 && updatedOld.length > 0
          ? totalSales - totalOld
          : 0
      ).toFixed(2);
      beforeNetAmt =
        beforeNetAmtWithoutReducedSR - Number(totalSalesReturnAmount);

      inputValues =
        updatedSales?.length > 0 || updatedOld?.length > 0 ? value : "0.00";

      lessAmount =
        typeValue === "Percentage"
          ? beforeNetAmt * (Number(inputValues) / 100)
          : Number(inputValues);
      afterNetAmt =
        beforeNetAmt -
        (lessAmount + Number(lessopeningbalancevalue) + Number(isAdvanceAmt));
      console.log(afterNetAmt);
    } else {
      beforeNetAmtWithoutReducedSR = (
        updatedSales.length > 0 && updatedOld.length === 0
          ? totalSales
          : updatedSales.length === 0 && updatedOld.length > 0
          ? totalOld
          : updatedSales.length > 0 && updatedOld.length > 0
          ? totalSales - totalOld
          : 0
      ).toFixed(2);
      beforeNetAmt =
        beforeNetAmtWithoutReducedSR - Number(totalSalesReturnAmount);
      lessAmount =
        typeValue === "Percentage"
          ? beforeNetAmt * (Number(inputValues) / 100)
          : Number(inputValues);
      afterNetAmt =
        beforeNetAmt -
        (lessAmount + Number(lessopeningbalancevalue) + Number(isAdvanceAmt));
      // console.log(beforeNetAmt, 'beforeNetAmt')
      // console.log(inputValues, 'inputValues')
    }

    setTotalSalesReturnAmount(totalSalesReturnAmount);
    setManageSalesCommon({
      ...manageSalesCommon,
      date,
      hours,
      minutes,
      time,
      bnoteno: bnotevalue,
      isSReturn,
      salesreturnno,
      isManual,
      isManualGrp,
      // Sales
      totalsalestaxgroupsarray: updatedSales,
      totalsalespieces: totalSalesPieces,
      totalsalesweight: totalSalesWeight?.toFixed(3),
      totalmcdiscount: totalSalesMcDis?.toFixed(2),
      totalsalesgrosswithoutdiscount: totalSalesWithoutGross?.toFixed(2),
      totalsaleslessamount: totalSalesLessAmount?.toFixed(2),
      totalsalesgross: totalSalesGross?.toFixed(2),
      totalsalescgst: totalSalesCgst?.toFixed(2),
      totalsalessgst: totalSalesSgst?.toFixed(2),
      totalsalesamount: Math.round(totalSales)?.toFixed(2),
      // Old
      totaloldtaxgroupsarray: updatedOld,
      totaloldpieces: totalOldPieces,
      totaloldweight: totalOldWieght?.toFixed(3),
      totalwastagediscount: totalOldWastageDis?.toFixed(2),
      totaloldgrosswithoutdiscount: totalOldWithoutGross?.toFixed(2),
      totaloldgross: totalOldGross?.toFixed(2),
      totaloldcgst: totalOldCgst?.toFixed(2),
      totaloldsgst: totalOldSgst?.toFixed(2),
      totaloldamount: Math.round(totalOld)?.toFixed(2),
      // Overall
      lessopeningbalance: lessopeningbalancevalue,
      overalllesstype: typeValue,
      overallless: inputValues,
      overalllessamount: Number(lessAmount)?.toFixed(2),
      netamountwithoutdis:
        updatedSales.length === 0 && updatedOld.length > 0 ? 0 : beforeNetAmt,
      netamount:
        updatedSales.length === 0 && updatedOld.length > 0
          ? 0
          : afterNetAmt?.toFixed(2),
    });
    setIsNetAmt(isNetAmt);
    setIsSalesAmt(isSalesAmt);
    setIsCusAdvanceBalCheck(isCusAdvanceBalCheck);
    // setIsAdvanceAmt(isAdvanceAmt);
  };

  // recalc function for a single row
  const recalcGroupRow = (row, isManualGrp, isSalesAmt, salesItemTodo) => {
    const grossWithoutDiscount = Number(
      row.totalsalesgrosswithoutdiscount || 0
    );
    let less = 0;
    let lessamount = 0;

    const calculatedTotSalesAmt = totalSalesAmtCalculation(salesItemTodo);
    const calculatedRowTotSalesAmt = rowSalesAmtCalculation(
      salesItemTodo,
      row.totalsalescgstper
    );

    if (isManualGrp === true && isSalesAmt !== "0.00") {
      const F7 = calculatedRowTotSalesAmt;
      const G7 = Number(isSalesAmt);
      const H7 = calculatedTotSalesAmt;
      const K7 = Number(row.totalsalescgstper) + Number(row.totalsalessgstper);
      const M7 = Number(row.totalsalesgrosswithoutdiscount);
      const totalCalculatedLess =
        M7 - (((F7 * ((100 * G7) / H7)) / 100) * 100) / (100 + K7) || 0;
      less =
        row.saleslesstype === "Percentage"
          ? (totalCalculatedLess / grossWithoutDiscount) * 100
          : totalCalculatedLess;
      lessamount =
        row.saleslesstype === "Percentage"
          ? (grossWithoutDiscount * Number(less || 0)) / 100
          : Number(less || 0);
    } else if (isManualGrp === false && isSalesAmt === "0.00") {
      less =
        row.saleslesstype === "Percentage"
          ? (grossWithoutDiscount * Number(row.salesless || 0)) / 100
          : Number(row.salesless || 0);
      lessamount =
        row.saleslesstype === "Percentage"
          ? (grossWithoutDiscount * Number(row.salesless || 0)) / 100
          : Number(row.salesless || 0);
    } else {
      less =
        row.saleslesstype === "Percentage"
          ? (grossWithoutDiscount * Number(row.salesless || 0)) / 100
          : Number(row.salesless || 0);
      lessamount =
        row.saleslesstype === "Percentage"
          ? (grossWithoutDiscount * Number(row.salesless || 0)) / 100
          : Number(row.salesless || 0);
    }

    const gross = grossWithoutDiscount - lessamount;
    const finalLess = Math.round(less);
    // console.log(row, 'row');
    // console.log(row.saleslesstype, row.salesless, less, 'less')
    return {
      ...row,
      salesless: finalLess,
      saleslessamount: lessamount.toFixed(2),
      totalsalesgross: gross.toFixed(2),
      totalsalescgst: ((gross * row.totalsalescgstper) / 100).toFixed(2),
      totalsalessgst: ((gross * row.totalsalessgstper) / 100).toFixed(2),
      totalsalesamount: Math.round(
        gross +
          (gross * row.totalsalescgstper) / 100 +
          (gross * row.totalsalessgstper) / 100
      ).toFixed(2),
    };
  };

  const recalcGroupRow1 = (row) => {
    const grossWithoutDiscount = Number(row.totaloldgrosswithoutdiscount || 0);
    const less =
      row.oldlesstype === "Percentage"
        ? (grossWithoutDiscount * Number(row.oldless || 0)) / 100
        : Number(row.oldless || 0);

    const gross = grossWithoutDiscount - less;

    return {
      ...row,
      oldlessamount: less.toFixed(2),
      totaloldgross: gross.toFixed(2),
      totaloldcgst: ((gross * row.totaloldcgstper) / 100).toFixed(2),
      totaloldsgst: ((gross * row.totaloldsgstper) / 100).toFixed(2),
      totaloldamount: Math.round(
        gross +
          (gross * row.totaloldcgstper) / 100 +
          (gross * row.totaloldsgstper) / 100
      ).toFixed(2),
    };
  };

  // update function
  function multiLessInputs(referenceIndex, reference, inputvalue) {
    let updatedSalesArray = salesTaxGroupsArray.map((value, index) => {
      if (index === referenceIndex) {
        let updatedRow = {
          ...value,
          [reference]: inputvalue,
        };
        // recalc totals for this row
        return recalcGroupRow(
          updatedRow,
          manageSalesCommon.isManualGrp,
          isSalesAmt,
          salesItemTodo
        );
      } else {
        return value;
      }
    });

    let updatedOldArray = oldTaxGroupsArray.map((value, index) => {
      if (index === referenceIndex) {
        let updatedRow = {
          ...value,
          [reference]: inputvalue,
        };
        // recalc totals for this row
        return recalcGroupRow1(updatedRow);
      } else {
        return value;
      }
    });

    setSalesTaxGroupsArray(updatedSalesArray);
    setOldTaxGroupsArray(updatedOldArray);

    let totalSalesValue1 = 0;
    let totalSalesValue2 = 0;
    let totalSalesValue3 = 0;
    let totalSalesValue4 = 0;
    let totalSalesValue5 = 0;
    let totalSalesValue6 = 0;
    let totalSalesValue7 = 0;
    let totalSalesValue8 = 0;
    let totalSalesValue9 = 0;
    console.log(updatedSalesArray, "updatedSalesArray");

    if (updatedSalesArray?.length > 0) {
      updatedSalesArray?.forEach((item) => {
        totalSalesValue1 += Number(item.totalsalespieces || 0);
        totalSalesValue2 += Number(item.totalsalesweight || 0);
        totalSalesValue3 += Number(item.totalmcdiscount || 0);
        totalSalesValue4 += Number(item.totalsalesgrosswithoutdiscount || 0);
        totalSalesValue5 += Number(item.saleslessamount || 0);
        totalSalesValue6 += Number(item.totalsalesgross || 0);
        totalSalesValue7 += Number(item.totalsalescgst || 0);
        totalSalesValue8 += Number(item.totalsalessgst || 0);
        totalSalesValue9 += Number(item.totalsalesamount || 0);
      });
    }

    let totalOldValue1 = 0;
    let totalOldValue2 = 0;
    let totalOldValue3 = 0;
    let totalOldValue4 = 0;
    let totalOldValue5 = 0;
    let totalOldValue6 = 0;
    let totalOldValue7 = 0;
    let totalOldValue8 = 0;
    let totalOldValue9 = 0;

    if (updatedOldArray?.length > 0) {
      updatedOldArray?.forEach((item) => {
        totalOldValue1 += Number(item.totaloldpieces || 0);
        totalOldValue2 += Number(item.totaloldweight || 0);
        totalOldValue3 += Number(item.totalwastagediscount || 0);
        totalOldValue4 += Number(item.totaloldgrosswithoutdiscount || 0);
        totalOldValue5 += Number(item.oldlessamount || 0);
        totalOldValue6 += Number(item.totaloldgross || 0);
        totalOldValue7 += Number(item.totaloldcgst || 0);
        totalOldValue8 += Number(item.totaloldsgst || 0);
        totalOldValue9 += Number(item.totaloldamount || 0);
      });
    }

    const beforeNetAmt = (
      updatedSalesArray.length > 0 && updatedOldArray.length === 0
        ? totalSalesValue9
        : updatedSalesArray.length === 0 && updatedOldArray.length > 0
        ? totalOldValue9
        : updatedSalesArray.length > 0 && updatedOldArray.length > 0
        ? totalSalesValue9 - totalOldValue9
        : 0
    ).toFixed(2);

    // const lessAmount = type === 'Percentage'
    //   ? (beforeNetAmt * (Number(value) / 100))
    //   : Number(value);

    // const afterNetAmt = beforeNetAmt - lessAmount;
    console.log(totalSalesReturnAmount, "totalSalesReturnAmount multi");
    setManageSalesCommon({
      ...manageSalesCommon,
      // Sales
      totalsalestaxgroupsarray: updatedSalesArray,
      totalsalespieces: totalSalesValue1,
      totalsalesweight: totalSalesValue2?.toFixed(3),
      totalmcdiscount: totalSalesValue3?.toFixed(2),
      totalsalesgrosswithoutdiscount: totalSalesValue4?.toFixed(2),
      totalsaleslessamount: totalSalesValue5?.toFixed(2),
      totalsalesgross: totalSalesValue6?.toFixed(2),
      totalsalescgst: totalSalesValue7?.toFixed(2),
      totalsalessgst: totalSalesValue8?.toFixed(2),
      totalsalesamount: totalSalesValue9?.toFixed(2),
      //Old
      totaloldtaxgroupsarray: updatedOldArray,
      totaloldspieces: totalOldValue1,
      totaloldweight: totalOldValue2?.toFixed(3),
      totalwastagediscount: totalOldValue3?.toFixed(2),
      totaloldgrosswithoutdiscount: totalOldValue4?.toFixed(2),
      totaloldlessamount: totalOldValue5?.toFixed(2),
      totaloldgross: totalOldValue6?.toFixed(2),
      totaloldcgst: totalOldValue7?.toFixed(2),
      totaloldsgst: totalOldValue8?.toFixed(2),
      totaloldamount: totalOldValue9?.toFixed(2),
      // Overall
      netamountwithoutdis:
        updatedSalesArray.length === 0 && updatedOldArray.length > 0
          ? 0
          : beforeNetAmt - Number(totalSalesReturnAmount),
      netamount:
        updatedSalesArray.length === 0 && updatedOldArray.length > 0
          ? 0
          : beforeNetAmt - Number(totalSalesReturnAmount),
    });
  }

  const totalInvLessAmount = (salesItemTodo) => {
    let totalValue = 0;
    salesItemTodo?.map((val) => {
      totalValue += Number(val.lessamount);
    });
    return totalValue;
  };

  // const handleFileUpload = async (selectedFilesall, type, uniqueId) => {
  //   try {
  //     console.log(selectedFilesall, "selectedFilesall");
  //     let selectedFiles = selectedFilesall;
  //     // .flatMap(t => [{ ...t.files, uniqueId: t.uniqueId }])
  //     // let uniqueId = selectedFilesall[0].uniqueId
  //     // let selectedFiles = selectedFilesall.flatMap(t =>
  //     //   Array.from(t.files).map(file => ({ ...file, uniqueId: t.uniqueId }))
  //     // );

  //     const uploadFiles = async () => {
  //       for (const selectedFile of selectedFiles) {
  //         // console.log(selectedFile, "selectedFile");
  //         const chunkSize = 5 * 1024 * 1024; // 5MB (adjust based on your requirements)
  //         const totalChunks = Math.ceil(selectedFile.size / chunkSize);
  //         const chunkProgress = 100 / totalChunks;
  //         let chunkNumber = 0;
  //         let start = 0;
  //         let end = 0;

  //         const uploadNextChunk = async () => {
  //           try {
  //             if (end < selectedFile.size) {
  //               end = start + chunkSize;
  //               if (end > selectedFile.size) {
  //                 end = selectedFile.size;
  //               }
  //               console.log(selectedFile, 'selectedFile')
  //               const chunk = selectedFile?.slice(start, end, selectedFile.type);
  //               console.log(chunk, "chunk");

  //               const formData = new FormData();
  //               formData.append('file', chunk);
  //               formData.append('chunkNumber', chunkNumber);
  //               formData.append('totalChunks', totalChunks);
  //               formData.append('filesize', selectedFile.size);
  //               formData.append('originalname', `${uniqueId}$${type}$${selectedFile.name}`);

  //               console.log(formData, "formData");

  //               try {
  //                 const response = await axios.post(SERVICE.UPLOAD_CHUNK_MANAGESALES_BILLS, formData, {
  //                   headers: {
  //                     'Content-Type': 'multipart/form-data',
  //                   },
  //                 });
  //                 // console.log(response, "response");
  //                 const temp = `Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully for ${selectedFile.name}`;

  //                 start = end;
  //                 chunkNumber++;

  //                 uploadNextChunk();
  //               } catch (err) {
  //                 console.log(err, 'ERrer');
  //                 handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //               }
  //             } else {
  //               // setProgress(100);
  //               console.log(`File upload completed for ${selectedFile.name}`);
  //             }
  //           } catch (err) {
  //             console.log(err, 'asdfse');
  //           }
  //         };

  //         await uploadNextChunk();
  //       }
  //       // setSelectedFiles([]);
  //       // console.log("All file uploads completed");
  //     };

  //     await uploadFiles();
  //   } catch (err) {
  //     console.log(err, 'errfile');
  //   }
  // };

  const base64ToFile = (base64, fileName, mimeType) => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mimeType });
  };

  const handleFileUpload = async (selectedFilesall, type, uniqueId) => {
    try {
      // Convert objects with base64 into real File objects
      let selectedFiles = selectedFilesall.map((f) => {
        if (f.base64) {
          return base64ToFile(f.base64, f.name, f.type);
        }
        return f; // already a File
      });

      // console.log(selectedFiles, 'converted selectedFiles');

      const uploadFiles = async () => {
        for (const selectedFile of selectedFiles) {
          const chunkSize = 5 * 1024 * 1024; // 5MB
          const totalChunks = Math.ceil(selectedFile.size / chunkSize);
          // console.log(selectedFile, 'inside for loop (real File now)');

          let chunkNumber = 0;
          let start = 0;

          while (start < selectedFile.size) {
            const end = Math.min(start + chunkSize, selectedFile.size);
            const chunk = selectedFile.slice(start, end, selectedFile.type);

            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("chunkNumber", chunkNumber);
            formData.append("totalChunks", totalChunks);
            formData.append("filesize", selectedFile.size);
            formData.append(
              "originalname",
              `${uniqueId}$${type}$${selectedFile.name}`
            );

            try {
              await axios.post(
                SERVICE.UPLOAD_CHUNK_MANAGESALES_BILLS,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );

              // console.log(`Chunk ${chunkNumber + 1}/${totalChunks} uploaded for ${selectedFile.name}`);
            } catch (err) {
              console.error("Chunk upload failed:", err);
              handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
              );
              return; // Stop this file on error
            }

            start = end;
            chunkNumber++;
          }

          // console.log(`File upload completed for ${selectedFile.name}`);
        }
      };

      await uploadFiles();
      // console.log("All file uploads completed");
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  const handleInputChange = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImageBill];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Allow images and PDFs
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader();

          // If PDF, read as ArrayBuffer instead of DataURL
          if (file.type === "application/pdf") {
            reader.onload = () => {
              const base64String = btoa(
                new Uint8Array(reader.result).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              );

              newSelectedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                preview: null, // no preview for pdf
                base64: base64String,
              });

              setRefImageBill([...newSelectedFiles]);
              setRefImageBillFileNames(newSelectedFiles.map((d) => d.name));
            };
            reader.readAsArrayBuffer(file);
          } else {
            // For images
            reader.onload = () => {
              newSelectedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                preview: reader.result,
                base64: reader.result.split(",")[1],
              });

              setRefImageBill([...newSelectedFiles]);
              setRefImageBillFileNames(newSelectedFiles.map((d) => d.name));
            };
            reader.readAsDataURL(file);
          }
        } else {
          setPopupContentMalert("File size should be less than 5MB!");
          setPopupSeverityMalert("info");
          handleClickOpenPopupMalert();
        }
      } else {
        setPopupContentMalert("Only Accept Images or PDF!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  //first deletefile
  const handleDeleteFile = (index) => {
    const newSelectedFiles = [...refImageBill];
    newSelectedFiles.splice(index, 1);
    setRefImageBill(newSelectedFiles);
  };

  const renderFilePreview = async (file) => {
    if (file.type.includes("image/")) {
      // open image in a modal/lightbox
      const response = await fetch(file.preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      window.open(link, "_blank");
    } else if (file.type === "application/pdf") {
      // open pdf in new tab
      const blob = new Blob(
        [Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      // fallback for doc, xls, etc.
      alert("Preview not supported, please download file.");
    }
  };

  const resetImage = () => {
    setGetImg("");
    setFile("");
    setRefImageBill([]);
    setRefImageBillFileNames([]);
  };

  const handleUploadOverAll = () => {
    setUploadPopupOpen(false);
  };

  const sendRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
    const uniqueId = uuidv4();
    const fileName = `Invoice_${
      isAuto === true ? manageSalesCommon.billno : billNoAuto || "Bill"
    }.pdf`;
    const safeFileName = fileName.replace(/[\/\\:]/g, "_");
    try {
      await generatePDFForSave(headerOptions, uniqueId);
      const time = await getCurrentServerTime();
      setServerTime(time);

      const today = new Date(time);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, "0.00");
      minutes = String(minutes).padStart(2, "0.00");

      let subprojectscreate = await axios.post(SERVICE.MANAGESALES_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(manageSalesCommon.company),
        branch: String(manageSalesCommon.branch),
        // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
        // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
        // customercontactprefix: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontactprefix : manageSalesCommon.customercontactprefix),
        // customercontact: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact),
        customername: String(manageSalesCommon.customername),
        customeraddress: String(manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon.customercontact),
        gstinnumber: String(manageSalesCommon.gstinnumber),
        date: String(manageSalesCommon.date),
        hours: String(manageSalesCommon.hours),
        minutes: String(manageSalesCommon.minutes),
        time: String(manageSalesCommon.time),
        formattedtime: String(
          `${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`
        ),
        entrydate: String(moment(serverTime1).format("DD-MM-YYYY")),
        entrytime: String(serverTime1.format("hh:mm:ss A")),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(
          manageSalesCommon.salesid
            ? manageSalesCommon.salesid
            : allUsersLimit[0].companyname.trim()
        ),
        empcode: String(
          manageSalesCommon.empcode
            ? manageSalesCommon.empcode
            : allUsersLimit[0].empcode.trim()
        ),
        bnoteno: String(
          isNewBNote?.isNewValue === false
            ? isNewBNote.bnoteno
            : manageSalesCommon.bnoteno === "Please Select Bnote No"
            ? ""
            : manageSalesCommon.bnoteno
        ),
        // bnoteno: String(isNewCusDetails?.isNewCusValue  === false ? isNewCusDetails.bnoteno : manageSalesCommon.bnoteno),
        salesreturnno: String(
          manageSalesCommon.salesreturnno === "Please Select Sales Return No"
            ? ""
            : manageSalesCommon.salesreturnno
        ),
        prodmastertype: String(manageSalesCommon.prodmastertype),
        salesitems: [...salesItemTodo],
        olditems: [...oldItemTodo],
        salesreturnitems: [...salesReturnItemTodo],
        totalsalestaxgroupsarray: manageSalesCommon.totalsalestaxgroupsarray,
        totalsalespieces: String(manageSalesCommon.totalsalespieces),
        totalsalesweight: String(manageSalesCommon.totalsalesweight),
        totalmcdiscount: String(manageSalesCommon.totalmcdiscount),
        totalsalesgrosswithoutdiscount: String(
          manageSalesCommon.totalsalesgrosswithoutdiscount
        ),
        totalsaleslessamount: String(manageSalesCommon.totalsaleslessamount),
        totalsalesgross: String(manageSalesCommon.totalsalesgross),
        totalsalescgstper: String(manageSalesCommon.totalsalescgstper),
        totalsalessgstper: String(manageSalesCommon.totalsalessgstper),
        totalsalescgst: String(manageSalesCommon.totalsalescgst),
        totalsalessgst: String(manageSalesCommon.totalsalessgst),
        totalsalesamount: String(manageSalesCommon.totalsalesamount),
        totaloldtaxgroupsarray: manageSalesCommon.totaloldtaxgroupsarray,
        totaloldpieces: String(manageSalesCommon.totaloldpieces),
        totaloldweight: String(manageSalesCommon.totaloldweight),
        totalwastagediscount: String(manageSalesCommon.totalwastagediscount),
        totaloldgrosswithoutdiscount: String(
          manageSalesCommon.totaloldgrosswithoutdiscount
        ),
        totaloldlessamount: String(manageSalesCommon.totaloldlessamount),
        totaloldgross: String(manageSalesCommon.totaloldgross),
        totaloldcgstper: String(manageSalesCommon.totaloldcgstper),
        totaloldsgstper: String(manageSalesCommon.totaloldsgstper),
        totaloldcgst: String(manageSalesCommon.totaloldcgst),
        totaloldsgst: String(manageSalesCommon.totaloldsgst),
        totaloldamount: String(manageSalesCommon.totaloldamount),
        netamountwithoutdis: String(manageSalesCommon.netamountwithoutdis),
        overalllesstype: String(manageSalesCommon.overalllesstype),
        overallless: String(manageSalesCommon.overallless),
        overalllessamount: String(manageSalesCommon.overalllessamount),
        netamount: String(manageSalesCommon.netamount),
        dueamount: String(manageSalesCommon.netamount),
        remarks: String(manageSalesCommon.remarks),
        paymentstatus: String("Unpaid"),
        deliverystatus: String("Not Delivered"),
        uniqueId: uniqueId,
        billfiles: refImageBillFileNames,
        invoicefiles: [safeFileName],
        iscusopeningbalcheck: isCusOpeningBalCheck,
        openingbalance: String(manageSalesCommon.openingbalance),
        lessopeningbalance: String(manageSalesCommon.lessopeningbalance),
        iscusadvancecheck: isCusAdvanceBalCheck,
        advanceamount: isAdvanceAmt,
        ismanualgrp: manageSalesCommon.isManualGrp,
        manualsales: isSalesAmt,
        ismanual: manageSalesCommon.isManual,
        manualnet: isNetAmt,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      // await fetchAllManageSalesForAutoId();
      await fetchAllManageSalesForAutoIdOnchange(branchString, prodString);
      await fetchAllManageSalesForLastBillNo(branchString, prodString);
      await handleFileUpload(refImageBill, "todo", uniqueId);
      // await handleFileUpload(imgArray, 'invoice', uniqueId);
      const res_item = await axios.post(
        SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          producttype: manageSalesCommon.prodmastertype,
        }
      );
      setSalesItemParticularsOpt(res_item?.data?.products);
      setManageSalesCommon({
        ...manageSalesCommon,
        customeropeningbalance: "0.00",
        bnoteamount: "0.00",
        salesreturnamount: "0.00",
        // company: 'Please Select Company', branch: 'Please Select Branch', prodmastertype: '',
        isInvoice: false,
        isSReturn: false,
        isManualGrp: false,
        isManual: false,
        // customername: 'Please Select Customer Name',
        // customeraddress: 'TRICHY',
        customername: "",
        customeraddress: "TRICHY",
        customercontactprefix: "+91",
        customercontact: "",
        // date: today, hours: '10', minutes: '45', time: 'AM',
        hours: hours,
        minutes: minutes,
        time: ampm,
        billno: `${branchString}/${prodString}/`,
        salesid: "",
        bnoteno: "Please Select Bnote No",
        overalllesstype: "Fixed",
        overallless: "0.00",
        overalllessamount: "0.00",
        totalsalespieces: 0,
        totalsalesweight: 0,
        totalmcdiscount: 0,
        totalsalesgross: 0,
        totalsalescgstper: 0,
        totalsalessgstper: 0,
        totalsalescgst: 0,
        totalsalessgst: 0,
        totalsalesamount: 0,
        totaloldpieces: 0,
        totaloldweight: 0,
        totalwastagediscount: 0,
        totaloldgross: 0,
        totaloldcgstper: 0,
        totaloldsgstper: 0,
        totaloldcgst: 0,
        totaloldsgst: 0,
        totaloldamount: 0,
        netamountwithoutdis: 0,
        netamount: 0,
        remarks: "",
        modeofpayments: "Please Select Mode of Payments",
        cash: "0.00",
        balanceamount: "0.00",
        bankname: "Please Select Bank Name",
        bankbranchname: "",
        accountholdername: "",
        accountnumber: "",
        ifsccode: "",
        upinumber: "",
        cardtype: "Please Select Card Type",
        cardoptions: "Please Select Card Options",
        othercardname: "",
        cardnumber: "",
        cardholdername: "",
        cardtransactionnumber: "",
        cardmonth: "Month",
        cardyear: "Year",
        cardsecuritycode: "",
        chequenumber: "",
        totalsalesgrosswithoutdiscount: "0.00",
        totalsaleslessamount: "0.00",
        totaloldgrosswithoutdiscount: "0.00",
        totaloldlessamount: "0.00",
        openingbalance: "0.00",
        lessopeningbalance: "0.00",
      });
      setIsCusContact(false);
      setIsCusOpeningBal([]);
      setIsCusOpeningBalCheck(false);
      setIsCusAdvanceBalCheck(false);
      setIsAdvanceAmt("0.00");
      setIsSalesAmt("0.00");
      setIsNetAmt("0.00");
      setManageSalesItem({
        ...manageSalesItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        productitemcoderunningnumber: "",
        hsn: "",
        pieces: 1,
        weight: "",
        rate: "",
        value: "",
        makingchargemode: "",
        originalmc: "",
        mcgramamount: "0.00",
        makingcharge: "0.00",
        mc: "",
        lesstype: "Fixed",
        less: "0.00",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        salesamount: "",
      });
      setManageOldItem({
        ...manageOldItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        bnoteno: "TRI/S/",
        hsn: "",
        pieces: 1,
        originalweight: "0.000",
        stoneweight: "0.000",
        correctweight: "0.000",
        waste: "",
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: "0.00",
        actualweight: "",
        rate: "",
        value: "",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        boughtnoteamount: "",
        status: "",
      });
      setManageSalesReturnItem({
        ...manageSalesItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        productitemcoderunningnumber: "",
        salesreturnno: "TRI/SR",
        hsn: "",
        pieces: 1,
        weight: "",
        rate: "",
        value: "",
        makingchargemode: "",
        originalmc: "",
        mcgramamount: "0.00",
        makingcharge: "0.00",
        mc: "",
        lesstype: "Fixed",
        less: "0.00",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        salesamount: "",
      });
      setIsNewCusDetails({
        ...isNewCusDetails,
        isNewCusValue: false,
        customername: "",
        customeraddress: "TRICHY",
        customercontactprefix: "+91",
        customercontact: "",
        bnoteprefix: "TRI/S/",
        bnoteno: "TRI/S/",
      });
      setSalesItemTodo([]);
      setOldItemTodo([]);
      setSRInvoiceOptions([]);
      setInvoiceOptions([]);
      setSalesTaxGroupsArray([]);
      setOldTaxGroupsArray([]);
      setIsAddNew(false);
      setGetImg("");
      setFile("");
      setRefImageBill([]);
      setRefImageBillFileNames([]);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const sendAnotherRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
    const uniqueId = uuidv4();
    const fileName = `Invoice_${
      isAuto === true ? manageSalesCommon.billno : billNoAuto || "Bill"
    }.pdf`;
    const safeFileName = fileName.replace(/[\/\\:]/g, "_");
    try {
      await generatePDFForSave(headerOptions, uniqueId);
      let subprojectscreate = await axios.post(SERVICE.MANAGESALES_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(manageSalesCommon.company),
        branch: String(manageSalesCommon.branch),
        // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
        // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
        // customercontactprefix: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontactprefix : manageSalesCommon.customercontactprefix),
        // customercontact: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact),
        customername: String(manageSalesCommon.customername),
        customeraddress: String(manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon.customercontact),
        gstinnumber: String(manageSalesCommon.gstinnumber),
        date: String(manageSalesCommon.date),
        hours: String(manageSalesCommon.hours),
        minutes: String(manageSalesCommon.minutes),
        time: String(manageSalesCommon.time),
        formattedtime: String(
          `${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`
        ),
        entrydate: String(moment(serverTime1).format("DD-MM-YYYY")),
        entrytime: String(serverTime1.format("hh:mm:ss A")),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(
          manageSalesCommon.salesid
            ? manageSalesCommon.salesid
            : allUsersLimit[0].companyname.trim()
        ),
        empcode: String(
          manageSalesCommon.empcode
            ? manageSalesCommon.empcode
            : allUsersLimit[0].empcode.trim()
        ),
        bnoteno: String(
          isNewBNote?.isNewValue === false
            ? isNewBNote.bnoteno
            : manageSalesCommon.bnoteno === "Please Select Bnote No"
            ? ""
            : manageSalesCommon.bnoteno
        ),
        // bnoteno: String(isNewCusDetails?.isNewCusValue  === false ? isNewCusDetails.bnoteno : manageSalesCommon.bnoteno),
        salesreturnno: String(
          manageSalesCommon.salesreturnno === "Please Select Sales Return No"
            ? ""
            : manageSalesCommon.salesreturnno
        ),
        prodmastertype: String(manageSalesCommon.prodmastertype),
        salesitems: [...salesItemTodo],
        olditems: [...oldItemTodo],
        salesreturnitems: [...salesReturnItemTodo],
        totalsalestaxgroupsarray: manageSalesCommon.totalsalestaxgroupsarray,
        totalsalespieces: String(manageSalesCommon.totalsalespieces),
        totalsalesweight: String(manageSalesCommon.totalsalesweight),
        totalmcdiscount: String(manageSalesCommon.totalmcdiscount),
        totalsalesgrosswithoutdiscount: String(
          manageSalesCommon.totalsalesgrosswithoutdiscount
        ),
        totalsaleslessamount: String(manageSalesCommon.totalsaleslessamount),
        totalsalesgross: String(manageSalesCommon.totalsalesgross),
        totalsalescgstper: String(manageSalesCommon.totalsalescgstper),
        totalsalessgstper: String(manageSalesCommon.totalsalessgstper),
        totalsalescgst: String(manageSalesCommon.totalsalescgst),
        totalsalessgst: String(manageSalesCommon.totalsalessgst),
        totalsalesamount: String(manageSalesCommon.totalsalesamount),
        totaloldtaxgroupsarray: manageSalesCommon.totaloldtaxgroupsarray,
        totaloldpieces: String(manageSalesCommon.totaloldpieces),
        totaloldweight: String(manageSalesCommon.totaloldweight),
        totalwastagediscount: String(manageSalesCommon.totalwastagediscount),
        totaloldgrosswithoutdiscount: String(
          manageSalesCommon.totaloldgrosswithoutdiscount
        ),
        totaloldlessamount: String(manageSalesCommon.totaloldlessamount),
        totaloldgross: String(manageSalesCommon.totaloldgross),
        totaloldcgstper: String(manageSalesCommon.totaloldcgstper),
        totaloldsgstper: String(manageSalesCommon.totaloldsgstper),
        totaloldcgst: String(manageSalesCommon.totaloldcgst),
        totaloldsgst: String(manageSalesCommon.totaloldsgst),
        totaloldamount: String(manageSalesCommon.totaloldamount),
        netamountwithoutdis: String(manageSalesCommon.netamountwithoutdis),
        overalllesstype: String(manageSalesCommon.overalllesstype),
        overallless: String(manageSalesCommon.overallless),
        overalllessamount: String(manageSalesCommon.overalllessamount),
        netamount: String(manageSalesCommon.netamount),
        dueamount: String(manageSalesCommon.netamount),
        remarks: String(manageSalesCommon.remarks),
        paymentstatus: String("Unpaid"),
        deliverystatus: String("Not Delivered"),
        uniqueId: uniqueId,
        billfiles: refImageBillFileNames,
        invoicefiles: [safeFileName],
        iscusopeningbalcheck: isCusOpeningBalCheck,
        openingbalance: String(manageSalesCommon.openingbalance),
        lessopeningbalance: String(manageSalesCommon.lessopeningbalance),
        iscusadvancecheck: isCusAdvanceBalCheck,
        advanceamount: isAdvanceAmt,
        ismanualgrp: manageSalesCommon.isManualGrp,
        manualsales: isSalesAmt,
        ismanual: manageSalesCommon.isManual,
        manualnet: isNetAmt,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      // await fetchAllManageSalesForAutoId();
      await fetchAllManageSalesForAutoIdOnchange(branchString, prodString);
      await fetchAllManageSalesForLastBillNo(branchString, prodString);
      await handleFileUpload(refImageBill, "todo", uniqueId);
      const res_item = await axios.post(
        SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES,
        {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
          producttype: manageSalesCommon.prodmastertype,
        }
      );
      setSalesItemParticularsOpt(res_item?.data?.products);
      setManageSalesCommon({
        ...manageSalesCommon,
        customeropeningbalance: "0.00",
        bnoteamount: "0.00",
        salesreturnamount: "0.00",
        // company: 'Please Select Company', branch: 'Please Select Branch', prodmastertype: '',
        isInvoice: false,
        isSReturn: false,
        isManualGrp: false,
        isManual: false,
        // customername: 'Please Select Customer Name',
        customername: "",
        customeraddress: "TRICHY",
        customercontactprefix: "+91",
        customercontact: "",
        billno: `${branchString}/${prodString}/`,
        bnoteno: "Please Select Bnote No",
        overalllesstype: "Fixed",
        overallless: "0.00",
        overalllessamount: "0.00",
        totalsalespieces: 0,
        totalsalesweight: 0,
        totalmcdiscount: 0,
        totalsalesgross: 0,
        totalsalescgstper: 0,
        totalsalessgstper: 0,
        totalsalescgst: 0,
        totalsalessgst: 0,
        totalsalesamount: 0,
        totaloldpieces: 0,
        totaloldweight: 0,
        totalwastagediscount: 0,
        totaloldgross: 0,
        totaloldcgstper: 0,
        totaloldsgstper: 0,
        totaloldcgst: 0,
        totaloldsgst: 0,
        totaloldamount: 0,
        netamountwithoutdis: 0,
        netamount: 0,
        remarks: "",
        modeofpayments: "Please Select Mode of Payments",
        cash: "0.00",
        balanceamount: "0.00",
        bankname: "Please Select Bank Name",
        bankbranchname: "",
        accountholdername: "",
        accountnumber: "",
        ifsccode: "",
        upinumber: "",
        cardtype: "Please Select Card Type",
        cardoptions: "Please Select Card Options",
        othercardname: "",
        cardnumber: "",
        cardholdername: "",
        cardtransactionnumber: "",
        cardmonth: "Month",
        cardyear: "Year",
        cardsecuritycode: "",
        chequenumber: "",
        totalsalesgrosswithoutdiscount: "0.00",
        totalsaleslessamount: "0.00",
        totaloldgrosswithoutdiscount: "0.00",
        totaloldlessamount: "0.00",
        openingbalance: "0.00",
        lessopeningbalance: "0.00",
      });
      setIsCusContact(false);
      setIsCusOpeningBal([]);
      setIsCusOpeningBalCheck(false);
      setIsCusAdvanceBalCheck(false);
      setIsAdvanceAmt("0.00");
      setIsSalesAmt("0.00");
      setIsNetAmt("0.00");
      setManageSalesItem({
        ...manageSalesItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        productitemcoderunningnumber: "",
        hsn: "",
        pieces: 1,
        weight: "",
        rate: "",
        value: "",
        makingchargemode: "",
        originalmc: "",
        mcgramamount: "0.00",
        makingcharge: "0.00",
        mc: "",
        lesstype: "Fixed",
        less: "0.00",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        salesamount: "",
      });
      setManageOldItem({
        ...manageOldItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        bnoteno: "TRI/S/",
        hsn: "",
        pieces: 1,
        originalweight: "0.000",
        stoneweight: "0.000",
        correctweight: "0.000",
        waste: "",
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: "0.00",
        actualweight: "",
        rate: "",
        value: "",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        boughtnoteamount: "",
        status: "",
      });
      setManageSalesReturnItem({
        ...manageSalesItem,
        productname: "Please Select Particulars",
        productcode: "",
        producttype: "",
        productsize: "",
        productgst: "",
        productitemcoderunningnumber: "",
        salesreturnno: "TRI/SR",
        hsn: "",
        pieces: 1,
        weight: "",
        rate: "",
        value: "",
        makingchargemode: "",
        originalmc: "",
        mcgramamount: "0.00",
        makingcharge: "0.00",
        mc: "",
        lesstype: "Fixed",
        less: "0.00",
        grossamount: "",
        cgstper: "0.00",
        sgstper: "0.00",
        cgst: "",
        sgst: "",
        salestype: "",
        salesamount: "",
      });
      setIsNewCusDetails({
        ...isNewCusDetails,
        isNewCusValue: false,
        customername: "",
        customeraddress: "TRICHY",
        customercontactprefix: "+91",
        customercontact: "",
        bnoteprefix: "TRI/S/",
        bnoteno: "TRI/S/",
      });
      setSalesItemTodo([]);
      setOldItemTodo([]);
      setSalesTaxGroupsArray([]);
      setOldTaxGroupsArray([]);
      setGetImg("");
      setFile("");
      setRefImageBill([]);
      setRefImageBillFileNames([]);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const totalSalesReturnCal = (addedNewSRItem) => {
    let res = 0;
    addedNewSRItem?.forEach((item) => {
      res += Number(item.salesreturnamount || 0);
    });
    return res.toFixed(2);
  };

  const sendSalesReturnRequest = async () => {
    setPageName(!pageName);
    try {
      const serverTime = await getCurrentServerTime();
      const today = new Date(serverTime);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, "0.00");
      minutes = String(minutes).padStart(2, "0.00");

      let grpcreate = await axios.post(SERVICE.SALESRETURN_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(manageSalesCommon.company),
        branch: String(manageSalesCommon.branch),
        date: String(manageSalesCommon.date),
        hours: String(hours),
        minutes: String(minutes),
        time: String(ampm),
        formattedtime: String(`${hours}:${minutes} ${ampm}`),
        salesreturnno: String(
          manageSalesCommon.isSReturn === true &&
            isNewSReturn?.isNewValue === false
            ? isNewSReturn.salesreturnno
            : manageSalesCommon.salesreturnno ===
              "Please Select Sales Return No"
            ? ""
            : manageSalesCommon.salesreturnno
        ),
        purchasedate: String(manageSalesCommon.purchasedate),
        purchasetime: String(manageSalesCommon.purchasetime),
        billitemtype: "Item Based",
        billtype: String(
          manageSalesCommon.isSReturn === true &&
            isNewSReturn?.isNewValue === false
            ? isNewSReturn.salesreturnno
            : manageSalesCommon.salesreturnno ===
              "Please Select Sales Return No"
            ? ""
            : manageSalesCommon.salesreturnno
        ),
        customertype: String(
          `${manageSalesCommon.customername}-${manageSalesCommon.customercontact}`
        ),
        remarks: "",
        status: "Approve",
        salesreturnitems: [...addedNewSRItem],
        totalsalesreturnamount: String(totalSalesReturnCal(addedNewSRItem)),
        cancelreason: "",
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date()),
          },
        ],
      });
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const sendBnoteRequest = async () => {
    setPageName(!pageName);
    try {
      const serverTime = await getCurrentServerTime();
      const today = new Date(serverTime);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, "0.00");
      minutes = String(minutes).padStart(2, "0.00");

      let grpcreate = await axios.post(SERVICE.OSBOUGHTNOTE_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        customername: String(isNewCusDetails.customername),
        customeraddress: String(isNewCusDetails.customeraddress),
        customercontactprefix: String(isNewCusDetails.customercontactprefix),
        customercontact: String(isNewCusDetails.customercontact),
        date: String(manageSalesCommon.date),
        hours: String(hours),
        minutes: String(minutes),
        time: String(ampm),
        formattedtime: String(`${hours}:${minutes} ${ampm}`),
        // invoiceno: String(`${isNewCusDetails.bnoteprefix}${isNewCusDetails.bnoteno}`),
        invoiceno: String(
          manageSalesCommon.isInvoice === true &&
            isNewBNote?.isNewValue === false
            ? isNewBNote.bnoteno
            : manageSalesCommon.bnoteno === "Please Select Bnote No"
            ? ""
            : manageSalesCommon.bnoteno
        ),
        olditems: [...addedNewOldItem],
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date()),
          },
        ],
      });
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const sendCustomeropbalanceRequest = async () => {
    let finalamount =
      Number(manageSalesCommon.totalsalesamount) -
      Number(manageSalesCommon.totaloldamount);

    try {
      let rescontact = await axios.post(
        SERVICE.GETCONTACTNUMBERCUSTOMEROPBALANCE,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          // contactnumber: isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact,
          contactnumber: manageSalesCommon.customercontact,
        }
      );
      const resultValue = rescontact?.data?.result?.filter(
        (data) => data !== null
      );

      if (resultValue && resultValue?.length != 0) {
        let resupdate = await axios.put(
          `${SERVICE.CUSTOMEROPBALANCE_SINGLE}/${resultValue[0]?._id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            openingbalance:
              Number(resultValue[0]?.openingbalance) +
              Number(Math.abs(finalamount)),
            opbalancelog: [
              ...(resultValue[0]?.opbalancelog || []),
              {
                // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
                // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
                customername: String(manageSalesCommon.customername),
                customeraddress: String(manageSalesCommon.customeraddress),
                billno: String(
                  isAuto === true ? manageSalesCommon.billno : billNoAuto
                ),
                billamount: String(manageSalesCommon.netamount),
                billsalesamount: String(manageSalesCommon.totalsalesamount),
                billoldamount: String(manageSalesCommon.totaloldamount),
                billdate: String(manageSalesCommon.date),
                billtime: String(
                  `${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`
                ),
                billaddedby: String(
                  manageSalesCommon.salesid
                    ? manageSalesCommon.salesid
                    : allUsersLimit[0].companyname.trim()
                ),
              },
            ],
            updatedby: [
              ...(resultValue[0]?.updatedby || []),
              {
                name: String(isUserRoleAccess.companyname),
                // date: String(new Date()),
              },
            ],
          }
        );
      } else {
        let rescus = await axios.post(SERVICE.CUSTOMEROPBALANCE_CREATE, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          contactnumber: String(
            isNewCusDetails?.isNewCusValue === false
              ? isNewCusDetails.customercontact
              : manageSalesCommon.customercontact
          ),
          customercontactprefix: String(
            isNewCusDetails?.isNewCusValue === false
              ? isNewCusDetails.customercontactprefix
              : manageSalesCommon.customercontactprefix
          ),
          openingbalance: Number(Math.abs(finalamount)),
          opbalancelog: [
            {
              // customername: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]),
              // customeraddress: String(isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress),
              customername: String(manageSalesCommon.customername),
              customeraddress: String(manageSalesCommon.customeraddress),
              billno: String(
                isAuto === true ? manageSalesCommon.billno : billNoAuto
              ),
              billamount: String(manageSalesCommon.netamount),
              billsalesamount: String(manageSalesCommon.totalsalesamount),
              billoldamount: String(manageSalesCommon.totaloldamount),
              billdate: String(manageSalesCommon.date),
              billtime: String(
                `${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`
              ),
              billaddedby: String(
                manageSalesCommon.salesid
                  ? manageSalesCommon.salesid
                  : allUsersLimit[0].companyname.trim()
              ),
            },
          ],
          addedby: [
            {
              name: String(isUserRoleAccess.companyname),
            },
          ],
        });
      }
    } catch (err) {
      console.log(err, "er1");
    }
  };

  const sendCustomerBalanceUpdate = async () => {
    try {
      let rescontact = await axios.post(
        SERVICE.GETCONTACTNUMBERCUSTOMEROPBALANCE,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          // contactnumber: isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact,
          contactnumber: manageSalesCommon.customercontact,
        }
      );
      const resultValue = rescontact?.data?.result?.filter(
        (data) => data !== null
      );
      if (resultValue && resultValue?.length != 0) {
        let resupdate = await axios.put(
          `${SERVICE.CUSTOMEROPBALANCE_SINGLE}/${resultValue[0]?._id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            openingbalance:
              Number(resultValue[0]?.openingbalance) -
              Number(manageSalesCommon.lessopeningbalance),
            usedbalancelog: [
              ...(resultValue[0]?.usedbalancelog || []),
              {
                opbalanceusedamount: "",
                billno: String(
                  isAuto === true ? manageSalesCommon.billno : billNoAuto
                ),
                billamount: String(manageSalesCommon.netamount),
                billsalesamount: String(manageSalesCommon.totalsalesamount),
                billoldamount: String(manageSalesCommon.totaloldamount),
                billdate: String(manageSalesCommon.date),
                billtime: String(
                  `${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`
                ),
                billaddedby: String(
                  manageSalesCommon.salesid
                    ? manageSalesCommon.salesid
                    : allUsersLimit[0].companyname.trim()
                ),
              },
            ],
            updatedby: [
              ...(resultValue[0]?.updatedby || []),
              {
                name: String(isUserRoleAccess.companyname),
                // date: String(new Date()),
              },
            ],
          }
        );
      }
    } catch (err) {
      console.log(err.message, "errr");
    }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    e.preventDefault();

    // let res_sr = await axios.get(SERVICE.SALESRETURNINVOICENO, {
    //   headers: {
    //     Authorization: `Bearer ${auth.APIToken}`,
    //   },
    // });
    // const allSalesReturn = res_sr?.data?.allsalesreturninvoice;

    let res_grp = await axios.get(SERVICE.OSBOUGHTNOTE, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    const allOsBoughtNote = res_grp?.data?.osboughtnotes;
    const isInvoiceMatch = allOsBoughtNote.some(
      (item) =>
        manageSalesCommon.isInvoice === true &&
        isNewBNote?.isNewValue === false &&
        item.invoiceno === manageOldItem.bnoteno
    );
    // const isSRInvoiceMatch = allSalesReturn.some((item) => manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false && item.invoiceno === manageSalesItem.salesreturnno);

    let res_sales = await axios.get(SERVICE.MANAGESALES, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allManageSales = res_sales?.data?.managesales;
    const isBillNoMatch = allManageSales.some(
      (item) => isAuto === true && item.billno === manageSalesCommon.billno
    );

    const time = await getCurrentServerTime();
    const currentDate = new Date(time).toISOString().split("T")[0];
    if (manageSalesCommon.company === "Please Select Company") {
      setPopupContentMalert("Please Select Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.branch === "Please Select Branch") {
      setPopupContentMalert("Please Select Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.customername === 'Please Select Customer Name') {
    //   setPopupContentMalert('Please Select Customer Name!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.customername === "") {
      setPopupContentMalert("Please Enter Customer Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.customeraddress === "") {
      setPopupContentMalert("Please Enter Customer Address!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customername === '') {
    //   setPopupContentMalert('Please Enter Customer Name!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customeraddress === '') {
    //   setPopupContentMalert('Please Enter Customer Address!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customercontact === '') {
    //   setPopupContentMalert('Please Enter Customer Contact No!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.date === "") {
      setPopupContentMalert("Please Select Date");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date > currentDate) {
      setPopupContentMalert("Future Date is restricted!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      isAuto === true &&
      manageSalesCommon.billno === `${branchString}/${prodString}/`
    ) {
      setPopupContentMalert("Please Enter Bill No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.salesid === "Please Select Sales Person") {
      setPopupContentMalert("Please Select Sales Person");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === false && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
    //   setPopupContentMalert('Please Select Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.bnoteno === '') {
    //   setPopupContentMalert('Please Enter Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (
      manageSalesCommon.isSReturn === true &&
      isNewSReturn?.isNewValue === true &&
      manageSalesCommon.salesreturnno === "Please Select Bnote No"
    ) {
      setPopupContentMalert("Please Select Sales Return No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isSReturn === true &&
      isNewSReturn?.isNewValue === false &&
      isNewBNote.salesreturnno === "TRI/S/"
    ) {
      setPopupContentMalert("Please Enter Sales Return No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isInvoice === true &&
      isNewBNote?.isNewValue === true &&
      manageSalesCommon.bnoteno === "Please Select Bnote No"
    ) {
      setPopupContentMalert("Please Select Bnote No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isInvoice === true &&
      isNewBNote?.isNewValue === false &&
      isNewBNote.bnoteno === "TRI/S/"
    ) {
      setPopupContentMalert("Please Enter Bnote No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0 && oldItemTodo.length === 0) {
      setPopupContentMalert(
        "Please enter values in Sales Item or Old Item to get Net Amount"
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      salesItemTodo.length > 0 &&
      oldItemTodo.length > 0 &&
      manageSalesCommon.netamount === 0
    ) {
      setPopupContentMalert(
        "Please enter values in Sales Item or Old Item to get Net Amount"
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isBillNoMatch) {
      setPopupContentMalert("Bill No Already Exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    // else if (isSRInvoiceMatch) {
    //   setPopupContentMalert('Sales Return No Already Exists!');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (isInvoiceMatch) {
      setPopupContentMalert("Bnote No Already Exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      isCusOpeningBal?.length > 0 &&
      isCusOpeningBalCheck === true &&
      manageSalesCommon.lessopeningbalance === "0.00"
    ) {
      setPopupContentMalert(
        `Please enter amount in 'Less Opening Balance' field to less net amount!`
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0 && salesReturnItemTodo?.length > 0) {
      setPopupContentMalert(
        `No purchase record found for this customer. Return cannot be processed.`
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
      // if (isNewCusDetails?.isNewCusValue  === false) {
      // if (manageSalesCommon.isSReturn === true && isAddNewSR === true) {
      //   sendSalesReturnRequest();
      // }
      if (manageSalesCommon.isInvoice === true && isAddNew === true) {
        sendBnoteRequest();
      }
      // console.log(Number(manageSalesCommon.totaloldamount) > Number(manageSalesCommon.totalsalesamount))
      if (
        Number(manageSalesCommon.totaloldamount) >
        Number(manageSalesCommon.totalsalesamount)
      ) {
        sendCustomeropbalanceRequest();
      }

      if (
        isCusOpeningBalCheck === true &&
        manageSalesCommon.lessopeningbalance !== "0.00"
      ) {
        sendCustomerBalanceUpdate();
      }
    }
  };

  const handleAnotherSubmit = async (e) => {
    e.preventDefault();

    // let res_sr = await axios.get(SERVICE.SALESRETURNINVOICENO, {
    //   headers: {
    //     Authorization: `Bearer ${auth.APIToken}`,
    //   },
    // });
    // const allSalesReturn = res_sr?.data?.allsalesreturninvoice;

    let res_grp = await axios.get(SERVICE.OSBOUGHTNOTE, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allOsBoughtNote = res_grp?.data?.osboughtnotes;
    const isInvoiceMatch = allOsBoughtNote.some(
      (item) =>
        manageSalesCommon.isInvoice === true &&
        isNewBNote?.isNewValue === false &&
        item.invoiceno === manageOldItem.bnoteno
    );
    // const isSRInvoiceMatch = allSalesReturn.some((item) => manageSalesCommon.isSReturn === true && isNewSReturn?.isNewValue === false && item.invoiceno === manageSalesItem.salesreturnno);

    let res_sales = await axios.get(SERVICE.MANAGESALES, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allManageSales = res_sales?.data?.managesales;
    const isBillNoMatch = allManageSales.some(
      (item) => isAuto === true && item.billno === manageSalesCommon.billno
    );

    const time = await getCurrentServerTime();
    const currentDate = new Date(time).toISOString().split("T")[0];

    if (manageSalesCommon.company === "Please Select Company") {
      setPopupContentMalert("Please Select Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.branch === "Please Select Branch") {
      setPopupContentMalert("Please Select Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.customername === 'Please Select Customer Name') {
    //   setPopupContentMalert('Please Select Customer Name!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.customername === "") {
      setPopupContentMalert("Please Enter Customer Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.customeraddress === "") {
      setPopupContentMalert("Please Enter Customer Address!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    //  else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customername === '') {
    //   setPopupContentMalert('Please Enter Customer Name!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customeraddress === '') {
    //   setPopupContentMalert('Please Enter Customer Address!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === false && isNewCusDetails.customercontact === '') {
    //   setPopupContentMalert('Please Enter Customer Contact No!');
    //   setPopupSeverityMalert('info');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.date === "") {
      setPopupContentMalert("Please Select Date");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date > currentDate) {
      setPopupContentMalert("Future Date is restricted!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      isAuto === true &&
      manageSalesCommon.billno === `${branchString}/${prodString}/`
    ) {
      setPopupContentMalert("Please Enter Bill No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.salesid === "Please Select Sales Person") {
      setPopupContentMalert("Please Select Sales Person");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === false && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
    //   setPopupContentMalert('Please Select Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.bnoteno === '') {
    //   setPopupContentMalert('Please Enter Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (
      manageSalesCommon.isSReturn === true &&
      isNewSReturn?.isNewValue === true &&
      manageSalesCommon.salesreturnno === "Please Select Bnote No"
    ) {
      setPopupContentMalert("Please Select Sales Return No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isSReturn === true &&
      isNewSReturn?.isNewValue === false &&
      isNewBNote.salesreturnno === "TRI/S/"
    ) {
      setPopupContentMalert("Please Enter Sales Return No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isInvoice === true &&
      isNewBNote?.isNewValue === true &&
      manageSalesCommon.bnoteno === "Please Select Bnote No"
    ) {
      setPopupContentMalert("Please Select Bnote No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.isInvoice === true &&
      isNewBNote?.isNewValue === false &&
      isNewBNote.bnoteno === "TRI/S/"
    ) {
      setPopupContentMalert("Please Enter Bnote No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0 && oldItemTodo.length === 0) {
      setPopupContentMalert(
        "Please enter values in Sales Item or Old Item to get Net Amount"
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      salesItemTodo.length > 0 &&
      oldItemTodo.length > 0 &&
      manageSalesCommon.netamount === 0
    ) {
      setPopupContentMalert(
        "Please enter values in Sales Item or Old Item to get Net Amount"
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isBillNoMatch) {
      setPopupContentMalert("Bill No Already Exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    // else if (isSRInvoiceMatch) {
    //   setPopupContentMalert('Sales Return No Already Exists!');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (isInvoiceMatch) {
      setPopupContentMalert("Bnote No Already Exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      isCusOpeningBal?.length > 0 &&
      isCusOpeningBalCheck === true &&
      manageSalesCommon.lessopeningbalance === "0.00"
    ) {
      setPopupContentMalert(
        `Please enter amount in 'Less Opening Balance' field to less net amount!`
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0 && salesReturnItemTodo?.length > 0) {
      setPopupContentMalert(
        `No purchase record found for this customer. Return cannot be processed.`
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      sendAnotherRequest();
      // if (isNewCusDetails?.isNewCusValue  === false) {
      // if (manageSalesCommon.isSReturn === true && isAddNewSR === true) {
      // sendSalesReturnRequest();
      // }
      if (manageSalesCommon.isInvoice === true && isAddNew === true) {
        sendBnoteRequest();
      }
      // console.log(Number(manageSalesCommon.totaloldamount) > Number(manageSalesCommon.totalsalesamount));
      if (
        Number(manageSalesCommon.totaloldamount) >
        Number(manageSalesCommon.totalsalesamount)
      ) {
        sendCustomeropbalanceRequest();
      }
      if (
        isCusOpeningBalCheck === true &&
        manageSalesCommon.lessopeningbalance !== "0.00"
      ) {
        sendCustomerBalanceUpdate();
      }
    }
  };

  const handleClear = async (e) => {
    e.preventDefault();
    const time = await getCurrentServerTime();
    setServerTime(time);

    const today = new Date(time);
    // Extract hours and minutes
    let hours = today.getHours();
    let minutes = today.getMinutes();

    // Convert to 12-hour format
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    // Format with leading zero if needed
    hours = String(hours).padStart(2, "0.00");
    minutes = String(minutes).padStart(2, "0.00");

    // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
    let res_prod = await axios.get(SERVICE.PRODUCTMASTER, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const all = [
      ...res_prod?.data?.productmasters?.map((d) => ({
        ...d,
        label: d.productname,
        value: d.productname,
      })),
    ];
    // Remove duplicates by customer name
    const finalAll = Array.from(
      new Map(all.filter((d) => d && d.value).map((d) => [d.value, d])).values()
    );
    setProdTypeOpt(finalAll);
    const defaultData = finalAll?.find((d) => d.value === "SILVER");

    // Remove duplicates based on the 'company' field
    const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      const x = acc.find(
        (item) =>
          item.company === current.company &&
          item.branch === current.branch &&
          item.unit === current.unit
      );
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);

    const company = [
      ...new Set(uniqueIsAssignBranch.map((data) => data.company)),
    ].map((data) => ({
      label: data,
      value: data,
    }));
    setCompanyOpt(company);
    const branch = uniqueIsAssignBranch
      ?.filter((val) => company[0].value === val.company)
      ?.map((data) => ({
        branchcode: data.branchcode,
        label: data.branch,
        value: data.branch,
      }))
      .filter((item, index, self) => {
        return (
          self.findIndex(
            (i) => i.label === item.label && i.value === item.value
          ) === index
        );
      });
    setBranchOpt(branch);
    setBranchString(branch[0].branchcode);

    const res_item = await axios.post(
      SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES,
      {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        producttype: defaultData.value,
      }
    );
    setSalesItemParticularsOpt(res_item?.data?.products);
    setProdString(defaultData.productprefix);

    let res = await axios.get(SERVICE.MANAGESALES, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    // Build prefix based on dropdown selections
    const currentPrefix = `${branch[0].branchcode}/${defaultData.productprefix}/`;

    // Filter only bills starting with this prefix
    const filteredBills = res?.data?.managesales?.filter((sale) =>
      sale.billno.startsWith(currentPrefix)
    );

    let newBillNo;
    if (filteredBills.length > 0) {
      // Get the last one (assuming billno are ordered)
      const lastBill = filteredBills[filteredBills.length - 1].billno;
      setLastBillNo(lastBill);
      // Extract number after prefix
      const lastNumber = parseInt(lastBill.replace(currentPrefix, ""), 10);

      // Increment number
      const nextNumber = lastNumber + 1;

      newBillNo = `${currentPrefix}${nextNumber}`;
    } else {
      // If no bill exists for this prefix, start at 1
      newBillNo = `${currentPrefix}1`;
    }

    // console.log(newBillNo, 'Generated Bill No');
    setBillNoAuto(newBillNo);

    setManageSalesCommon({
      ...manageSalesCommon,
      company: company[0].value,
      branch: branch[0].value,
      prodmastertype: defaultData.value,
      isInvoice: false,
      isSReturn: false,
      isManualGrp: false,
      isManual: false,
      // customername: 'Please Select Customer Name',
      customername: "",
      customeraddress: "TRICHY",
      customercontactprefix: "+91",
      customercontact: "",
      date: today,
      hours: hours,
      minutes: minutes,
      time: ampm,
      billno: newBillNo,
      salesid: "",
      empcode: "",
      bnoteno: "Please Select Bnote No",
      overalllesstype: "Fixed",
      overallless: "0.00",
      overalllessamount: "0.00",
      totalsalespieces: 0,
      totalsalesweight: 0,
      totalmcdiscount: 0,
      totalsalesgross: 0,
      totalsalescgstper: 0,
      totalsalessgstper: 0,
      totalsalescgst: 0,
      totalsalessgst: 0,
      totalsalesamount: 0,
      totaloldpieces: 0,
      totaloldweight: 0,
      totalwastagediscount: 0,
      totaloldgross: 0,
      totaloldcgstper: 0,
      totaloldsgstper: 0,
      totaloldcgst: 0,
      totaloldsgst: 0,
      totaloldamount: 0,
      netamountwithoutdis: 0,
      netamount: 0,
      remarks: "",
      modeofpayments: "Please Select Mode of Payments",
      cash: "0.00",
      balanceamount: "0.00",
      bankname: "Please Select Bank Name",
      bankbranchname: "",
      accountholdername: "",
      accountnumber: "",
      ifsccode: "",
      upinumber: "",
      cardtype: "Please Select Card Type",
      cardoptions: "Please Select Card Options",
      othercardname: "",
      cardnumber: "",
      cardholdername: "",
      cardtransactionnumber: "",
      cardmonth: "Month",
      cardyear: "Year",
      cardsecuritycode: "",
      chequenumber: "",
      totalsalesgrosswithoutdiscount: "0.00",
      totalsaleslessamount: "0.00",
      totaloldgrosswithoutdiscount: "0.00",
      totaloldlessamount: "0.00",
      openingbalance: "0.00",
      lessopeningbalance: "0.00",
    });
    setIsCusContact(false);
    setIsCusOpeningBal([]);
    setIsCusOpeningBalCheck(false);
    setIsCusAdvanceBalCheck(false);
    setIsAdvanceAmt("0.00");
    setIsSalesAmt("0.00");
    setIsNetAmt("0.00");
    setManageSalesItem({
      ...manageSalesItem,
      productname: "Please Select Particulars",
      productcode: "",
      producttype: "",
      productsize: "",
      productgst: "",
      productitemcoderunningnumber: "",
      hsn: "",
      pieces: 1,
      weight: "",
      rate: "",
      value: "",
      makingchargemode: "",
      originalmc: "",
      mcgramamount: "0.00",
      makingcharge: "0.00",
      mc: "",
      lesstype: "Fixed",
      less: "0.00",
      grossamount: "",
      cgstper: "0.00",
      sgstper: "0.00",
      cgst: "",
      sgst: "",
      salestype: "",
      salesamount: "",
    });
    setManageOldItem({
      ...manageOldItem,
      productname: "Please Select Particulars",
      productcode: "",
      producttype: "",
      productsize: "",
      productgst: "",
      bnoteno: "TRI/S/",
      hsn: "",
      pieces: 1,
      originalweight: "0.000",
      stoneweight: "0.000",
      correctweight: "0.000",
      waste: "",
      olddefaultwastage: 0,
      oldminimumwastage: 0,
      oldmaximumwastage: 0,
      wastediscount: "0.00",
      actualweight: "",
      rate: "",
      value: "",
      grossamount: "",
      cgstper: "0.00",
      sgstper: "0.00",
      cgst: "",
      sgst: "",
      salestype: "",
      boughtnoteamount: "",
      status: "",
    });
    setManageSalesReturnItem({
      ...manageSalesItem,
      productname: "Please Select Particulars",
      productcode: "",
      producttype: "",
      productsize: "",
      productgst: "",
      productitemcoderunningnumber: "",
      salesreturnno: "TRI/SR",
      hsn: "",
      pieces: 1,
      weight: "",
      rate: "",
      value: "",
      makingchargemode: "",
      originalmc: "",
      mcgramamount: "0.00",
      makingcharge: "0.00",
      mc: "",
      lesstype: "Fixed",
      less: "0.00",
      grossamount: "",
      cgstper: "0.00",
      sgstper: "0.00",
      cgst: "",
      sgst: "",
      salestype: "",
      salesamount: "",
    });
    setIsNewCusDetails({
      isNewCusValue: false,
      customername: "",
      customeraddress: "TRICHY",
      customercontactprefix: "+91",
      customercontact: "",
      bnoteprefix: "TRI/S/",
      bnoteno: "TRI/S/",
    });
    setIsNewBNote({ isNewValue: false, bnoteno: "TRI/S/" });
    setIsNewSReturn({ isNewValue: false, salesreturnno: "TRI/SR/" });
    setIsAuto(false);
    setIsAddNew(false);
    setSalesItemTodo([]);
    setOldItemTodo([]);
    setSRInvoiceOptions([]);
    setInvoiceOptions([]);
    setSalesTaxGroupsArray([]);
    setOldTaxGroupsArray([]);
    setGetImg("");
    setFile("");
    setRefImageBill([]);
    setRefImageBillFileNames([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  // view table
  const addSerialNumberView = (datas) => {
    setItemsView(datas);
  };

  useEffect(() => {
    addSerialNumberView(
      viewData?.map((item, index) => ({ ...item, serialNumber: index + 1 }))
    );
  }, [viewData]);

  const handlePageSizeChangeView = (event) => {
    setPageSizeView(Number(event.target.value));
    setPageView(1);
  };

  const handleCopyData = async (rowData) => {
    setManageSalesCommon({ ...manageSalesCommon, ...rowData });
    fetchSRInvoice(rowData.customername, rowData.customercontact);
    fetchInvoice(rowData.customername, rowData.customercontact);
    fetchCustomerBalance(rowData.customercontact);
    fetchCustomerAdvanceBal(rowData.customercontact);
    setIsCusContact(false);
    setIsCusOpeningBalCheck(false);
    setIsCusAdvanceBalCheck(false);
    handleCloseview();
  };

  const handleAddNewInExisting = () => {
    setManageSalesCommon({
      ...manageSalesCommon,
      customername: "",
      customeraddress: "TRICHY",
    });
    handleCloseview();
  };

  const initialColumnVisibilityView = {
    serialNumber: true,
    customername: true,
    customercontact: true,
    customeraddress: true,
    purchasedate: true,
    purchasetime: true,
    actions: true,
  };

  const [columnVisibilityView, setColumnVisibilityView] = useState(
    initialColumnVisibilityView
  );

  const columnDataTableView = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 75,
      hide: !columnVisibilityView.serialNumber,
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "customername",
      headerName: "Customer Name",
      flex: 0,
      width: 250,
      hide: !columnVisibilityView.customername,
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "customercontact",
      headerName: "Customer Contact",
      flex: 0,
      width: 130,
      hide: !columnVisibilityView.customercontact,
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "customeraddress",
      headerName: "Address",
      flex: 0,
      width: 300,
      hide: !columnVisibilityView.customeraddress,
    },
    {
      field: "purchasedate",
      headerName: "Purchase Date",
      flex: 0,
      width: 130,
      hide: !columnVisibilityView.purchasedate,
    },
    {
      field: "purchasetime",
      headerName: "Purchase Time",
      flex: 0,
      width: 130,
      hide: !columnVisibilityView.purchasetime,
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 130,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibilityView.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          <Button
            sx={userStyle.buttonedit}
            onClick={() => {
              handleCopyData(params.data);
            }}
          >
            {/* <ContentCopyIcon /> */}
            Fix Customer
          </Button>
        </Grid>
      ),
    },
  ];

  const handleShowAllColumnsView = () => {
    const updatedVisibilityView = { ...columnVisibilityView };
    for (const columnKey in updatedVisibilityView) {
      updatedVisibilityView[columnKey] = true;
    }
    setColumnVisibilityView(updatedVisibilityView);
  };

  const filteredColumnsView = columnDataTableView.filter((column) =>
    column.headerName
      .toLowerCase()
      .includes(searchQueryManageView.toLowerCase())
  );

  const toggleColumnVisibilityView = (field) => {
    setColumnVisibilityView((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // Split the search query into individual terms
  const searchTermsView = searchQueryView.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatasView = itemsView?.filter((item) => {
    return searchTermsView.every((term) =>
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  });

  const filteredDataView = filteredDatasView?.slice(
    (pageView - 1) * pageSizeView,
    pageView * pageSizeView
  );
  const totalPagesView = Math.ceil(filteredDatasView.length / pageSizeView);
  const visiblePagesView = Math.min(totalPagesView, 3);
  const firstVisiblePageView = Math.max(1, pageView - 1);
  const lastVisiblePageView = Math.min(
    firstVisiblePageView + visiblePagesView - 1,
    totalPagesView
  );
  const pageNumbersView = [];
  const indexOfLastItemView = pageView * pageSizeView;
  const indexOfFirstItemView = indexOfLastItemView - pageSizeView;
  for (let i = firstVisiblePageView; i <= lastVisiblePageView; i++) {
    pageNumbersView.push(i);
  }

  const rowDataTableView = filteredDataView.map((item, index) => {
    return {
      ...item,
    };
  });

  // Excel
  const [fileFormat, setFormat] = useState("");
  let exportColumnNamesView = [
    "Customer Name",
    "Customer Contact",
    "Address",
    "Purchase Date",
    "Purchase Time",
  ];
  let exportRowValuesView = [
    "customername",
    "customercontact",
    "customeraddress",
    "purchasedate",
    "purchasetime",
  ];

  const [serverTimeForPrintView, setServerTimeForPrintView] = useState(null);
  const componentRefView = useRef();

  const fetchTimeForPrintView = async () => {
    const time = await getCurrentServerTime();
    setServerTimeForPrintView(time);

    setTimeout(() => {
      handleprintView();
    }, 100);
  };

  const handleprintView = useReactToPrint({
    content: () => componentRefView.current,
    // documentTitle: `${tableName}`,
    // pageStyle: 'print',
  });

  const handleCaptureImageView = () => {
    if (gridRefTableImgView.current) {
      domtoimage
        .toBlob(gridRefTableImgView.current)
        .then((blob) => {
          saveAs(blob, `Existing Customers.png`);
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  return (
    <Box>
      <Headtitle title={"Add Manage Sales"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Add Manage Sales"
        modulename="Products"
        submodulename="Manage Sales"
        mainpagename=""
        subpagename=""
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("amanagesales") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <Grid container spacing={1}>
              <Grid item md={6} sm={6} xs={6}></Grid>
              <Grid item md={2} sm={4} xs={6}>
                <Typography>
                  <b>Silver:</b>{" "}
                  <span style={{ color: "red" }}>
                    {Number(currentSilverRate)?.toFixed(2)}
                  </span>
                </Typography>
              </Grid>
              <Grid item md={2} sm={4} xs={6}>
                <Typography>
                  <b>Gold:</b>{" "}
                  <span style={{ color: "red" }}>
                    {Number(currentGoldRate)?.toFixed(2)}
                  </span>
                </Typography>
              </Grid>
              <Grid item md={2} sm={4} xs={12}>
                <Typography sx={{ color: "red" }}>
                  {moment(serverTime1).format("DD-MM-YYYY")}{" "}
                  {serverTime1.format("hh:mm:ss A")}
                </Typography>
              </Grid>
              <Grid item md={3} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={companyOpt}
                    value={{
                      label: manageSalesCommon.company,
                      value: manageSalesCommon.company,
                    }}
                    onChange={(e) => {
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        company: e.value,
                      });
                      fetchBranch(e.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Branch<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={branchOpt}
                    value={{
                      label: manageSalesCommon.branch,
                      value: manageSalesCommon.branch,
                    }}
                    onChange={(e) => {
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        branch: e.value,
                        billno: `${e.branchcode}/${prodString}/`,
                      });
                      setBranchString(e.branchcode);
                      fetchAllManageSalesForAutoIdOnchange(
                        e.branchcode,
                        prodString
                      );
                      fetchAllManageSalesForLastBillNo(
                        e.branchcode,
                        prodString
                      );

                      getHeaderFooterImages(manageSalesCommon.company, e.value);
                      getGSTN(
                        manageSalesCommon.company,
                        e.value,
                        manageSalesCommon.prodmastertype
                      );
                      // fetchSoldCustomer(manageSalesCommon.company, e.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Typography>Bill</Typography>
                <Box sx={{ display: "flex", justifyContent: "left" }}>
                  <Button
                    variant="contained"
                    onClick={handleClickUploadPopupOpen}
                  >
                    Upload
                  </Button>
                </Box>
              </Grid>
              <Grid item md={3.5} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Typography>
                    Entry Date & Time:{" "}
                    <span style={{ color: "red" }}>
                      {moment(serverTime1).format("DD-MM-YYYY")}{" "}
                      {serverTime1.format("hh:mm:ss A")}
                    </span>
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={5} sm={12} xs={12}></Grid>
              <Grid item md={12} sm={12} xs={12}>
                <Typography>Uploaded Files</Typography>
                {refImageBill.map((file, index) => (
                  <Grid container key={index} sx={{ mb: 1 }}>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {file.type?.includes("image/") ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            height={50}
                            style={{ maxWidth: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <img
                            src={getFileIcon(file.name)}
                            alt="file icon"
                            height={30}
                            style={{ cursor: "pointer" }}
                            onClick={() => renderFilePreview(file)} // open PDF/doc when clicked
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={7}
                      sm={7}
                      xs={7}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {file.name}
                      </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={1}>
                      <Grid sx={{ display: "flex" }}>
                        <Button
                          sx={{
                            padding: "6px",
                            minWidth: "36px",
                            borderRadius: "50%",
                            ":hover": { backgroundColor: "#80808036" },
                          }}
                          onClick={() => renderFilePreview(file)}
                        >
                          <VisibilityOutlinedIcon
                            sx={{ fontSize: 16, color: "#357AE8" }}
                          />
                        </Button>
                        <Button
                          sx={{
                            padding: "6px",
                            minWidth: "36px",
                            borderRadius: "50%",
                            ":hover": { backgroundColor: "#80808036" },
                          }}
                          onClick={() => handleDeleteFile(index)}
                        >
                          <FaTrash
                            style={{ color: "#a73131", fontSize: "14px" }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              {/* {isNewCusDetails?.isNewCusValue === false ? (
                <>
                  <Grid item md={2.5} xs={10.5} sm={5}>
                    <Typography>
                      Customer Contact No<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <FormControl size="small" sx={{ width: '80px' }}>
                        <OutlinedInput id="component-outlined" sx={userStyle.input} value={isNewCusDetails.customercontactprefix} />
                      </FormControl>
                      <FormControl size="small" fullWidth>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Customer Contact No"
                          value={isNewCusDetails.customercontact}
                          onChange={(e) => {
                            handlechangereferencecontactno(e);
                          }}
                        />
                      </FormControl>
                    </Box>
                    {isNewCusDetails.customercontact !== '' && isNewCusDetails.customercontact?.length !== 10 && <Typography style={{ color: 'red' }}>Contact No must be 10 digits required</Typography>}
                  </Grid>
                  <Grid item md={0.5} sm={1} xs={1.5}>
                    <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 3, xs: 3 } })}>
                      <Button
                        onClick={(e) => {
                          setIsNewCusDetails({ ...isNewCusDetails, isNewCusValue: !isNewCusDetails.isNewCusValue });
                          setManageSalesCommon({ ...manageSalesCommon, customername: 'Please Select Customer Name', customeraddress: 'TRICHY', customercontact: '', bnoteprefix: 'TRI/S/', bnoteno: 'TRI/S/' });
                        }}
                      >
                        Exist
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item md={2} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Customer Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        placeholder="Customer Name"
                        value={isNewCusDetails.customername}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setIsNewCusDetails({ ...isNewCusDetails, customername: upperValue });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={6} xs={12}>
                    <Typography>
                      Address<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <TextareaAutosize
                        fullWidth
                        aria-label="maximum height"
                        minRows={2}
                        maxRows={2}
                        value={isNewCusDetails.customeraddress}
                        placeholder="Please Enter Address"
                        onChange={(e) => {
                          setIsNewCusDetails({ ...isNewCusDetails, customeraddress: e.target.value });
                        }}
                        style={{ resize: 'none', fontSize: '1rem' }}
                      />
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item md={2.5} xs={10.5} sm={5}>
                    <Typography>
                      Customer Contact No<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <FormControl size="small" sx={{ width: '80px' }}>
                        <OutlinedInput id="component-outlined" sx={userStyle.input} value={manageSalesCommon.customercontactprefix} />
                      </FormControl>
                      <FormControl size="small" fullWidth>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          inputMode="numeric"
                          sx={userStyle.input}
                          placeholder="Customer Contact No"
                          value={manageSalesCommon.customercontact}
                          onChange={(e) => {
                            handlechangereferencecontactnoExist(e);
                          }}
                        />
                        {manageSalesCommon.customercontact !== '' && manageSalesCommon.customercontact?.length !== 10 && <Typography style={{ color: 'red' }}>Contact No must be 10 digits required</Typography>}
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item md={0.5} xs={1.5} sm={1}>
                    <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 3, xs: 3 } })}>
                      <Button
                        onClick={(e) => {
                          setIsNewCusDetails({ ...isNewCusDetails, isNewCusValue: !isNewCusDetails.isNewCusValue, customername: '', customeraddress: 'TRICHY', customercontact: '', bnoteprefix: 'TRI/S/', bnoteno: 'TRI/S/' });
                          fetchCustomers();
                        }}
                      >
                        New
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item md={2} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Customer Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={isCusContact === true ? cusOptions1 : cusOptions}
                        value={{ label: manageSalesCommon.customername, value: manageSalesCommon.customername }}
                        onChange={(e) => {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            customername: e.value,
                            customeraddress: e.customeraddress,
                            customercontactprefix: e.customercontactprefix,
                            customercontact: e.customercontact,
                            // billno: isAuto === true ? 'TRI/S/' : billNoAuto,
                          });
                          fetchInvoice(e.value);
                          fetchCustomerBalance(e.customercontact);
                          setIsCusContact(false);
                          setIsCusOpeningBalCheck(false);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={6} xs={12}>
                    <Typography>
                      Address<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <TextareaAutosize fullWidth aria-label="maximum height" minRows={2} maxRows={2} value={manageSalesCommon.customeraddress} placeholder="Address" style={{ resize: 'none', fontSize: '1rem' }} />
                    </FormControl>
                  </Grid>
                </>
              )} */}

              <>
                <Grid item md={2.25} xs={6} sm={12}>
                  <Typography>
                    Customer Contact No<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Box sx={{ display: "flex" }}>
                    <FormControl size="small" sx={{ width: "80px" }}>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        value={manageSalesCommon.customercontactprefix}
                      />
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        inputMode="numeric"
                        sx={userStyle.input}
                        placeholder="Customer Contact No"
                        value={manageSalesCommon.customercontact}
                        onChange={(e) => {
                          handlechangereferencecontactnoExist(e);
                        }}
                      />
                      {manageSalesCommon.customercontact !== "" &&
                        manageSalesCommon.customercontact?.length !== 10 && (
                          <Typography style={{ color: "red" }}>
                            Contact No must be 10 digits required
                          </Typography>
                        )}
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item md={1.5} sm={12} xs={12}>
                  <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                    <Typography>
                      No of purchase:{" "}
                      <span style={{ color: "red" }}>{viewDataCount || 0}</span>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Customer Name<b style={{ color: "red" }}>*</b>
                    </Typography>
                    {viewData?.length > 0 ? (
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        inputMode="numeric"
                        sx={userStyle.input}
                        placeholder="Customer Name"
                        value={manageSalesCommon.customername}
                      />
                    ) : (
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        inputMode="numeric"
                        sx={userStyle.input}
                        placeholder="Customer Name"
                        value={manageSalesCommon.customername}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            customername: upperValue,
                          });
                        }}
                      />
                    )}
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <Typography>
                    Address<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl size="small" fullWidth>
                    {viewData?.length > 0 ? (
                      <TextareaAutosize
                        fullWidth
                        aria-label="maximum height"
                        minRows={2}
                        maxRows={2}
                        value={manageSalesCommon.customeraddress}
                        placeholder="Address"
                        style={{ resize: "none", fontSize: "1rem" }}
                      />
                    ) : (
                      <TextareaAutosize
                        fullWidth
                        aria-label="maximum height"
                        minRows={2}
                        maxRows={2}
                        value={manageSalesCommon.customeraddress}
                        placeholder="Address"
                        style={{ resize: "none", fontSize: "1rem" }}
                        onChange={(e) => {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            customeraddress: e.target.value,
                          });
                        }}
                      />
                    )}
                  </FormControl>
                </Grid>
              </>
              <Grid item md={2.25} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>GSTIN</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    inputMode="numeric"
                    sx={userStyle.input}
                    placeholder="GSTIN"
                    value={manageSalesCommon.gstinnumber}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        gstinnumber: upperValue,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Bill Date<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={manageSalesCommon.date}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      // Ensure that the selected date is not in the future
                      const currentDate = new Date(serverTime)
                        .toISOString()
                        .split("T")[0];
                      // if (selectedDate <= currentDate) {
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        date: selectedDate,
                      });
                      fetchRateForDateOnchage(
                        manageSalesCommon.prodmastertype,
                        selectedDate,
                        manageSalesCommon.hours,
                        manageSalesCommon.minutes,
                        manageSalesCommon.time
                      );

                      setManageSalesItem({
                        productname: "Please Select Particulars",
                        productcode: "",
                        producttype: "",
                        productsize: "",
                        productgst: "",
                        productitemcoderunningnumber: "",
                        salesreturnno: "TRI/SR/",
                        hsn: "",
                        pieces: 1,
                        weight: "",
                        rate: "",
                        value: "",
                        makingchargemode: "",
                        originalmc: "",
                        mcgramamount: "0.00",
                        makingcharge: "0.00",
                        mc: "",
                        lesstype: "Fixed",
                        less: "0.00",
                        grossamount: "",
                        cgstper: "0.00",
                        sgstper: "0.00",
                        cgst: "",
                        sgst: "",
                        salestype: "",
                        salesamount: "",
                      });

                      setManageOldItem({
                        productname: "Please Select Particulars",
                        productcode: "",
                        producttype: "",
                        productsize: "",
                        productgst: "",
                        bnoteno: "TRI/S/",
                        hsn: "",
                        pieces: 1,
                        originalweight: "0.000",
                        stoneweight: "0.000",
                        correctweight: "0.000",
                        waste: "",
                        olddefaultwastage: 0,
                        oldminimumwastage: 0,
                        oldmaximumwastage: 0,
                        wastediscount: "0.00",
                        actualweight: "",
                        rate: "",
                        value: "",
                        grossamount: "",
                        cgstper: "0.00",
                        sgstper: "0.00",
                        cgst: "",
                        sgst: "",
                        salestype: "",
                        boughtnoteamount: "",
                        status: "",
                      });

                      setManageSalesReturnItem({
                        ...manageSalesItem,
                        productname: "Please Select Particulars",
                        productcode: "",
                        producttype: "",
                        productsize: "",
                        productgst: "",
                        productitemcoderunningnumber: "",
                        salesreturnno: "TRI/SR",
                        hsn: "",
                        pieces: 1,
                        weight: "",
                        rate: "",
                        value: "",
                        makingchargemode: "",
                        originalmc: "",
                        mcgramamount: "0.00",
                        makingcharge: "0.00",
                        mc: "",
                        lesstype: "Fixed",
                        less: "0.00",
                        grossamount: "",
                        cgstper: "0.00",
                        sgstper: "0.00",
                        cgst: "",
                        sgst: "",
                        salestype: "",
                        salesamount: "",
                      });

                      if (salesItemTodo?.length > 0) {
                        salesItemTodo?.map((val, index) => {
                          fetchSinglePurForRateChange(
                            val.id,
                            val.productname,
                            selectedDate,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time,
                            index
                          );
                        });
                      }
                      if (oldItemTodo?.length > 0) {
                        oldItemTodo?.map((val, index) => {
                          fetchSingleItemForRateChange(
                            val.id,
                            val.productname,
                            selectedDate,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time,
                            index
                          );
                        });
                      }
                      // }
                    }}
                    // inputProps={{ max: new Date(serverTime).toISOString().split("T")[0] }}
                  />
                </FormControl>
                <Typography style={{ color: "red" }}>
                  Rate: {rateValue}
                </Typography>
              </Grid>
              <Grid item md={2.5} sm={12} xs={12}>
                <Typography>
                  Bill Time<b style={{ color: "red" }}>*</b>
                </Typography>
                <Grid container>
                  <Grid item xs={12} sm={12} md={4}>
                    <FormControl size="small" fullWidth>
                      <Selects
                        options={hoursTimeOpt}
                        value={{
                          label: manageSalesCommon.hours,
                          value: manageSalesCommon.hours,
                        }}
                        onChange={(e) => {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            hours: e.value,
                          });
                          fetchRateForDateOnchage(
                            manageSalesCommon.prodmastertype,
                            manageSalesCommon.date,
                            e.value,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time
                          );
                          setManageSalesItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          setManageOldItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            bnoteno: "TRI/S/",
                            hsn: "",
                            pieces: 1,
                            originalweight: "0.000",
                            stoneweight: "0.000",
                            correctweight: "0.000",
                            waste: "",
                            olddefaultwastage: 0,
                            oldminimumwastage: 0,
                            oldmaximumwastage: 0,
                            wastediscount: "0.00",
                            actualweight: "",
                            rate: "",
                            value: "",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            boughtnoteamount: "",
                            status: "",
                          });

                          setManageSalesReturnItem({
                            ...manageSalesItem,
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            salesreturnno: "TRI/SR",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          if (salesItemTodo?.length > 0) {
                            salesItemTodo?.map((val, index) => {
                              fetchSinglePurForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                e.value,
                                manageSalesCommon.minutes,
                                manageSalesCommon.time,
                                index
                              );
                            });
                          }
                          if (oldItemTodo?.length > 0) {
                            oldItemTodo?.map((val, index) => {
                              fetchSingleItemForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                e.value,
                                manageSalesCommon.minutes,
                                manageSalesCommon.time,
                                index
                              );
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <FormControl size="small" fullWidth>
                      <Selects
                        options={minutesTimeOpt}
                        value={{
                          label: manageSalesCommon.minutes,
                          value: manageSalesCommon.minutes,
                        }}
                        onChange={(e) => {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            minutes: e.value,
                          });
                          fetchRateForDateOnchage(
                            manageSalesCommon.prodmastertype,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            e.value,
                            manageSalesCommon.time
                          );
                          setManageSalesItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          setManageOldItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            bnoteno: "TRI/S/",
                            hsn: "",
                            pieces: 1,
                            originalweight: "0.000",
                            stoneweight: "0.000",
                            correctweight: "0.000",
                            waste: "",
                            olddefaultwastage: 0,
                            oldminimumwastage: 0,
                            oldmaximumwastage: 0,
                            wastediscount: "0.00",
                            actualweight: "",
                            rate: "",
                            value: "",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            boughtnoteamount: "",
                            status: "",
                          });

                          setManageSalesReturnItem({
                            ...manageSalesItem,
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            salesreturnno: "TRI/SR",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          if (salesItemTodo?.length > 0) {
                            salesItemTodo?.map((val, index) => {
                              fetchSinglePurForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                manageSalesCommon.hours,
                                e.value,
                                manageSalesCommon.time,
                                index
                              );
                            });
                          }
                          if (oldItemTodo?.length > 0) {
                            oldItemTodo?.map((val, index) => {
                              fetchSingleItemForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                manageSalesCommon.hours,
                                e.value,
                                manageSalesCommon.time,
                                index
                              );
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <FormControl size="small" fullWidth>
                      <Selects
                        options={[
                          { label: "AM", value: "AM" },
                          { label: "PM", value: "PM" },
                        ]}
                        value={{
                          label: manageSalesCommon.time,
                          value: manageSalesCommon.time,
                        }}
                        onChange={(e) => {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            time: e.value,
                          });
                          fetchRateForDateOnchage(
                            manageSalesCommon.prodmastertype,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            e.value
                          );
                          setManageSalesItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          setManageOldItem({
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            bnoteno: "TRI/S/",
                            hsn: "",
                            pieces: 1,
                            originalweight: "0.000",
                            stoneweight: "0.000",
                            correctweight: "0.000",
                            waste: "",
                            olddefaultwastage: 0,
                            oldminimumwastage: 0,
                            oldmaximumwastage: 0,
                            wastediscount: "0.00",
                            actualweight: "",
                            rate: "",
                            value: "",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            boughtnoteamount: "",
                            status: "",
                          });

                          setManageSalesReturnItem({
                            ...manageSalesItem,
                            productname: "Please Select Particulars",
                            productcode: "",
                            producttype: "",
                            productsize: "",
                            productgst: "",
                            productitemcoderunningnumber: "",
                            salesreturnno: "TRI/SR",
                            hsn: "",
                            pieces: 1,
                            weight: "",
                            rate: "",
                            value: "",
                            makingchargemode: "",
                            originalmc: "",
                            mcgramamount: "0.00",
                            makingcharge: "0.00",
                            mc: "",
                            lesstype: "Fixed",
                            less: "0.00",
                            grossamount: "",
                            cgstper: "0.00",
                            sgstper: "0.00",
                            cgst: "",
                            sgst: "",
                            salestype: "",
                            salesamount: "",
                          });

                          if (salesItemTodo?.length > 0) {
                            salesItemTodo?.map((val, index) => {
                              fetchSinglePurForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                manageSalesCommon.hours,
                                manageSalesCommon.minutes,
                                e.value,
                                index
                              );
                            });
                          }
                          if (oldItemTodo?.length > 0) {
                            oldItemTodo?.map((val, index) => {
                              fetchSingleItemForRateChange(
                                val.id,
                                val.productname,
                                manageSalesCommon.date,
                                manageSalesCommon.hours,
                                manageSalesCommon.minutes,
                                e.value,
                                index
                              );
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item md={2} sm={12} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Typography>
                    Customer Op Bal:{" "}
                    <span style={{ color: "red" }}>
                      {isCusOpeningBal.length > 0
                        ? Number(isCusOpeningBal[0]?.openingbalance)?.toFixed(2)
                        : "0.00"}
                    </span>
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={2} sm={12} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Typography>
                    Bnote Amt:{" "}
                    <span style={{ color: "red" }}>
                      {isBNoteAmount || "0.00"}
                    </span>
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={2} sm={12} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Typography>
                    Sales Return Amt:{" "}
                    <span style={{ color: "red" }}>{isSRAmount || "0.00"}</span>
                  </Typography>
                </Box>
              </Grid>
              {isCusOpeningBal?.length > 0 ? (
                <Grid item md={1} sm={6} xs={12}>
                  <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isCusAdvanceBalCheck}
                            onChange={(e) => {
                              // setIsCusAdvanceBalCheck(!isCusAdvanceBalCheck);
                              // setIsAdvanceAmt(!isCusAdvanceBalCheck ? Number(isAdvanceAmt)?.toFixed(2) : '0.00');
                              if (!isCusAdvanceBalCheck) {
                                toCalculateTotalValues(
                                  salesItemTodo,
                                  oldItemTodo,
                                  totalSalesReturnAmount,
                                  manageSalesCommon.isSReturn,
                                  manageSalesCommon.isManual,
                                  manageSalesCommon.isManualGrp,
                                  isNetAmt,
                                  isSalesAmt,
                                  manageSalesCommon.salesreturnno,
                                  manageSalesCommon.date,
                                  manageSalesCommon.hours,
                                  manageSalesCommon.minutes,
                                  manageSalesCommon.time,
                                  manageSalesCommon.bnoteno,
                                  manageSalesCommon.overalllesstype,
                                  manageSalesCommon.overallless,
                                  manageSalesCommon.lessopeningbalance,
                                  !isCusAdvanceBalCheck,
                                  isAdvanceAmt
                                );
                              } else {
                                toCalculateTotalValues(
                                  salesItemTodo,
                                  oldItemTodo,
                                  totalSalesReturnAmount,
                                  manageSalesCommon.isSReturn,
                                  manageSalesCommon.isManual,
                                  manageSalesCommon.isManualGrp,
                                  isNetAmt,
                                  isSalesAmt,
                                  manageSalesCommon.salesreturnno,
                                  manageSalesCommon.date,
                                  manageSalesCommon.hours,
                                  manageSalesCommon.minutes,
                                  manageSalesCommon.time,
                                  manageSalesCommon.bnoteno,
                                  manageSalesCommon.overalllesstype,
                                  manageSalesCommon.overallless,
                                  manageSalesCommon.lessopeningbalance,
                                  false,
                                  "0.00"
                                );
                              }
                            }}
                          />
                        }
                        label="Use Advance Bal"
                      />
                    </FormGroup>
                  </Box>
                </Grid>
              ) : (
                <Grid item md={1} sm={6} xs={12}></Grid>
              )}
              {isCusAdvanceBalCheck === true && (
                <>
                  <Grid item md={1} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Advance Bal</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        placeholder="Opening Balance"
                        value={isAdvanceAmt}
                      />
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item md={2} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Product Type<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={prodTypeOpt}
                    value={{
                      label: manageSalesCommon.prodmastertype,
                      value: manageSalesCommon.prodmastertype,
                    }}
                    onChange={(e) => {
                      if (
                        manageSalesCommon.company === "Please Select Company"
                      ) {
                        setPopupContentMalert("Please Select Company!");
                        setPopupSeverityMalert("info");
                        handleClickOpenPopupMalert();
                      } else if (
                        manageSalesCommon.branch === "Please Select Branch"
                      ) {
                        setPopupContentMalert("Please Select Branch!");
                        setPopupSeverityMalert("info");
                        handleClickOpenPopupMalert();
                      } else {
                        getGSTN(
                          manageSalesCommon.company,
                          manageSalesCommon.branch,
                          e.value
                        );
                        setManageSalesItem({
                          productname: "Please Select Particulars",
                          productcode: "",
                          producttype: "",
                          productsize: "",
                          productgst: "",
                          productitemcoderunningnumber: "",
                          hsn: "",
                          pieces: 1,
                          weight: "",
                          rate: "",
                          value: "",
                          makingchargemode: "",
                          originalmc: "",
                          mcgramamount: "0.00",
                          makingcharge: "0.00",
                          mc: "",
                          lesstype: "Fixed",
                          less: "0.00",
                          grossamount: "",
                          cgstper: "0.00",
                          sgstper: "0.00",
                          cgst: "",
                          sgst: "",
                          salestype: "",
                          salesamount: "",
                        });
                        setManageSalesReturnItem({
                          ...manageSalesItem,
                          productname: "Please Select Particulars",
                          productcode: "",
                          producttype: "",
                          productsize: "",
                          productgst: "",
                          productitemcoderunningnumber: "",
                          salesreturnno: "TRI/SR",
                          hsn: "",
                          pieces: 1,
                          weight: "",
                          rate: "",
                          value: "",
                          makingchargemode: "",
                          originalmc: "",
                          mcgramamount: "0.00",
                          makingcharge: "0.00",
                          mc: "",
                          lesstype: "Fixed",
                          less: "0.00",
                          grossamount: "",
                          cgstper: "0.00",
                          sgstper: "0.00",
                          cgst: "",
                          sgst: "",
                          salestype: "",
                          salesamount: "",
                        });
                        fetchRateForDateOnchage(
                          e.value,
                          manageSalesCommon.date,
                          manageSalesCommon.hours,
                          manageSalesCommon.minutes,
                          manageSalesCommon.time
                        );
                        setSalesItemTodo([]);
                        setManageSalesCommon({
                          ...manageSalesCommon,
                          prodmastertype: e.value,
                          billno: `${branchString}/${e.productprefix}/`,
                        });
                        fetchAllPruchase(e.value);
                        setProdString(e.productprefix);
                        fetchAllManageSalesForAutoIdOnchange(
                          branchString,
                          e.productprefix
                        );
                        fetchAllManageSalesForLastBillNo(
                          branchString,
                          e.productprefix
                        );
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isAuto}
                          onChange={(e) => {
                            setIsAuto(!isAuto);
                            setManageSalesCommon({
                              ...manageSalesCommon,
                              billno: !isAuto
                                ? `${branchString}/${prodString}/`
                                : billNoAuto,
                            });
                          }}
                        />
                      }
                      label="New Bill No"
                    />
                  </FormGroup>
                </Box>
              </Grid>
              {isAuto === true ? (
                <Grid item md={1.5} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Bill No<b style={{ color: "red" }}>*L.No: {lastBillNo}</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      sx={userStyle.input}
                      placeholder="Bill No"
                      // value={billNoAuto}
                      value={manageSalesCommon.billno}
                      onChange={(e) => {
                        setManageSalesCommon({
                          ...manageSalesCommon,
                          billno: e.target.value,
                        });
                      }}
                      error={!!billNoError} // red border if error
                    />
                    {billNoError && (
                      <Typography variant="caption" color="error">
                        {billNoError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              ) : (
                <Grid item md={1.5} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Bill No<b style={{ color: "red" }}>*L.No: {lastBillNo}</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      sx={userStyle.input}
                      placeholder="Bill No"
                      value={billNoAuto}
                    />
                  </FormControl>
                </Grid>
              )}
              <Grid item md={2} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Sales Person<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={allUsersLimit?.map((data) => ({
                      label: data.companyname.trim(),
                      value: data.companyname.trim(),
                      empcode: data.empcode.trim(),
                    }))}
                    // value={{ label: manageSalesCommon.salesid, value: manageSalesCommon.salesid }}
                    value={
                      manageSalesCommon.salesid
                        ? {
                            label: manageSalesCommon.salesid,
                            value: manageSalesCommon.salesid,
                          }
                        : allUsersLimit && allUsersLimit.length > 0
                        ? {
                            label: allUsersLimit[0].companyname.trim(),
                            value: allUsersLimit[0].companyname.trim(),
                          }
                        : null
                    }
                    onChange={(e) => {
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        salesid: e.value,
                        empcode: e.empcode,
                        // billno: isAuto === true ? 'TRI/S/' : billNoAuto
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={manageSalesCommon.isInvoice}
                          onChange={(e) => {
                            setManageSalesCommon({
                              ...manageSalesCommon,
                              isInvoice: !manageSalesCommon.isInvoice,
                              bnoteno:
                                !manageSalesCommon.isInvoice &&
                                !isNewBNote?.isNewValue
                                  ? "TRI/S/"
                                  : "Please Select Bnote No",
                            });
                            setIsNewBNote({ ...isNewBNote, bnoteno: "TRI/S/" });
                          }}
                        />
                      }
                      label="Is Bnote No"
                    />
                  </FormGroup>
                </Box>
              </Grid>
              {/* {isNewCusDetails?.isNewCusValue  === false ? */}
              {manageSalesCommon.isInvoice === true ? (
                isNewBNote?.isNewValue === false ? (
                  <>
                    <Grid item md={1.25} sm={6} xs={12}>
                      <Typography>
                        Bnote No<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Box sx={{ display: "flex" }}>
                        {/* <FormControl size="small" fullWidth>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            sx={userStyle.input}
                            placeholder="Bnote No"
                            value={isNewCusDetails.bnoteprefix}
                          />
                        </FormControl> */}
                        <FormControl size="small" fullWidth>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            sx={userStyle.input}
                            placeholder="Bnote No"
                            value={isNewBNote.bnoteno}
                            onChange={(e) => {
                              setIsNewBNote({
                                ...isNewBNote,
                                bnoteno: e.target.value,
                              });
                            }}
                            // value={isNewCusDetails.bnoteno}
                            // onChange={(e) => { setIsNewCusDetails({ ...isNewCusDetails, bnoteno: e.target.value }) }}
                          />
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item md={0.5} sm={6} xs={12}>
                      <Box
                        sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}
                      >
                        <Button
                          onClick={(e) => {
                            setIsNewBNote({
                              ...isNewBNote,
                              isNewValue: !isNewBNote.isNewValue,
                            });
                            setManageSalesCommon({
                              ...manageSalesCommon,
                              bnoteno: "Please Select Bnote No",
                            });
                          }}
                        >
                          Exist
                        </Button>
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item md={1.25} sm={6} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>
                          Bnote No<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={invoiceOptions}
                          value={{
                            label: manageSalesCommon.bnoteno,
                            value: manageSalesCommon.bnoteno,
                          }}
                          onChange={(e) => {
                            // setManageSalesCommon({ ...manageSalesCommon, bnoteno: e.value, });
                            fetchBnoteOldItem(e.value);
                            setIsAddNew(false);
                          }}
                          // value={{ label: manageSalesCommon.bnoteno, value: manageSalesCommon.bnoteno }}
                          // onChange={(e) => {
                          //   setManageSalesCommon({ ...manageSalesCommon, bnoteno: e.value, });
                          //   fetchBnoteOldItem(e.value);
                          // }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={0.5} xs={12} sm={6}>
                      <Box
                        sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}
                      >
                        <Button
                          onClick={(e) => {
                            setIsNewBNote({
                              ...isNewBNote,
                              isNewValue: !isNewBNote.isNewValue,
                              bnoteno: "TRI/S/",
                            });
                            setOldItemPurticularsOpt([]);
                            setManageOldItem({
                              productname: "Please Select Particulars",
                              productcode: "",
                              producttype: "",
                              productsize: "",
                              productgst: "",
                              bnoteno: "TRI/S/",
                              hsn: "",
                              pieces: 1,
                              originalweight: "0.000",
                              stoneweight: "0.000",
                              correctweight: "0.000",
                              waste: "",
                              olddefaultwastage: 0,
                              oldminimumwastage: 0,
                              oldmaximumwastage: 0,
                              wastediscount: "0.00",
                              actualweight: "",
                              rate: "",
                              value: "",
                              grossamount: "",
                              cgstper: "0.00",
                              sgstper: "0.00",
                              cgst: "",
                              sgst: "",
                              salestype: "",
                              boughtnoteamount: "",
                              status: "",
                            });
                          }}
                        >
                          New
                        </Button>
                      </Box>
                    </Grid>
                  </>
                )
              ) : null}
              {/* <Grid item md={3} sm={6} xs={12}></Grid> */}
              <Grid item md={1.25} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={manageSalesCommon.isSReturn}
                          onChange={(e) => {
                            // setManageSalesCommon({ ...manageSalesCommon, isSReturn: !manageSalesCommon.isSReturn, salesreturnno: 'Please Select Sales Return No' });
                            setSalesReturnItemTodo([]);
                            setTotalSalesReturnAmount("0.00");
                            toCalculateTotalValues(
                              salesItemTodo,
                              oldItemTodo,
                              "0.00",
                              !manageSalesCommon.isSReturn,
                              manageSalesCommon.isManual,
                              manageSalesCommon.isManualGrp,
                              isNetAmt,
                              isSalesAmt,
                              "Please Select Sales Return No",
                              manageSalesCommon.date,
                              manageSalesCommon.hours,
                              manageSalesCommon.minutes,
                              manageSalesCommon.time,
                              manageSalesCommon.bnoteno,
                              manageSalesCommon.overalllesstype,
                              manageSalesCommon.overallless,
                              manageSalesCommon.lessopeningbalance,
                              isCusAdvanceBalCheck,
                              isAdvanceAmt
                            );
                          }}
                        />
                      }
                      label="Is Sales Return No"
                    />
                  </FormGroup>
                </Box>
              </Grid>
              {/* {manageSalesCommon.isSReturn === true ? (
                isNewSReturn.isNewValue === false ? (
                  <>
                    <Grid item md={1.5} sm={6} xs={12}>
                      <Typography>
                        Sales Return No<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        <FormControl size="small" fullWidth>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            sx={userStyle.input}
                            placeholder="Bnote No"
                            value={isNewSReturn.salesreturnno}
                            onChange={(e) => {
                              setIsNewSReturn({ ...isNewSReturn, salesreturnno: e.target.value });
                            }}
                          />
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item md={0.5} sm={6} xs={12}>
                      <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                        <Button
                          onClick={(e) => {
                            setIsNewSReturn({ ...isNewSReturn, isNewValue: !isNewSReturn.isNewValue });
                            setManageSalesCommon({ ...manageSalesCommon, salesreturnno: 'Please Select Sales Return No' });
                          }}
                        >
                          Exist
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          BillNo<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={isSoldBillno}
                          value={{ label: manageSalesCommon.billtype, value: manageSalesCommon.billtype }}
                          onChange={(e) => {
                            handleChangeBillno(e);
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item md={1.5} sm={6} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>
                          Sales Return No<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={sRInvoiceOptions}
                          value={{ label: manageSalesCommon.salesreturnno, value: manageSalesCommon.salesreturnno }}
                          onChange={(e) => {
                            fetchSalesReturnItem(e.value);
                            setIsAddNewSR(false);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={0.5} xs={12} sm={6}>
                      <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                        <Button
                          onClick={(e) => {
                            setIsNewSReturn({ ...isNewSReturn, isNewValue: !isNewSReturn.isNewValue, salesreturnno: 'TRI/SR/' });
                            setManageSalesReturnItem({
                              ...manageSalesItem,
                              productname: 'Please Select Particulars',
                              productcode: '',
                              producttype: '',
                              productsize: '',
                              productgst: '',
                              productitemcoderunningnumber: '',
                              salesreturnno: 'TRI/SR',
                              hsn: '',
                              pieces: 1,
                              weight: '',
                              rate: '',
                              value: '',
                              makingchargemode: '',
                              originalmc: '',
                              mcgramamount: '0.00',
                              makingcharge: '0.00',
                              mc: '',
                              lesstype: 'Fixed',
                              less: '0.00',
                              grossamount: '',
                              cgstper: '0.00',
                              sgstper: '0.00',
                              cgst: '',
                              sgst: '',
                              salestype: '',
                              salesamount: '',
                            });
                          }}
                        >
                          New
                        </Button>
                      </Box>
                    </Grid>
                  </>
                )
              ) : null} */}
              {manageSalesCommon.isSReturn === true ? (
                sRInvoiceOptions?.length === 0 ? (
                  <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                    <Typography>No Sales Return</Typography>
                  </Box>
                ) : (
                  <Grid item md={1.5} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Sales Return No<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Selects
                        options={sRInvoiceOptions}
                        value={{
                          label: manageSalesCommon.salesreturnno,
                          value: manageSalesCommon.salesreturnno,
                        }}
                        onChange={(e) => {
                          // setManageSalesCommon({ ...manageSalesCommon, salesreturnno: e.value });
                          fetchSalesReturnItem(e.value);
                          setIsAddNewSR(false);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )
              ) : null}
            </Grid>
            <br />
            <Grid container spacing={1}>
              <Grid item md={12} sm={6} xs={12}>
                <Typography>
                  <b>Sales Item</b>
                </Typography>
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Particulars
                    <b style={{ color: "red" }}>
                      * ({manageSalesItem.producttype},{" "}
                      {manageSalesItem.productsize},{" "}
                      {manageSalesItem.productgst})
                    </b>
                  </Typography>
                  {/* <Selects
                    options={salesItemTodo?.length === 0 ? salesItemParticularsOpt : salesItemParticularsOpt?.filter(prod => !salesItemTodoProd?.includes(prod.value))}
                    value={{ label: manageSalesItem.productname, value: manageSalesItem.productname }}
                    onChange={(e) => { fetchSinglePur(e, manageSalesCommon.date); }}
                  /> */}
                  <Select
                    components={{ MenuList }}
                    options={
                      salesItemTodo?.length === 0
                        ? salesItemParticularsOpt
                        : salesItemParticularsOpt?.filter(
                            (prod) => !salesItemTodoProd?.includes(prod.value)
                          )
                    }
                    value={{
                      label: manageSalesItem.productname,
                      value: manageSalesItem.productname,
                    }}
                    onChange={(e) => {
                      if (
                        manageSalesCommon.prodmastertype ===
                        "Please Select Product Type"
                      ) {
                        setPopupContentMalert("Please Select Product Type");
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                      } else if (manageSalesCommon.date === "") {
                        setPopupContentMalert("Please Select Date");
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                      } else {
                        fetchSinglePur(
                          e,
                          manageSalesCommon.date,
                          manageSalesCommon.hours,
                          manageSalesCommon.minutes,
                          manageSalesCommon.time
                        );
                      }
                    }}
                  />
                  {/* <AsyncSelect
                    cacheOptions
                    // defaultOptions
                    defaultOptions={(salesItemTodo?.length === 0 ? salesItemParticularsOpt : salesItemParticularsOpt?.filter(prod => !salesItemTodoProd?.includes(prod.value))).slice(0, 50)}
                    loadOptions={loadOptions}
                    onChange={(e) => fetchSinglePur(e, manageSalesCommon.date)}
                    placeholder="Please Select Particulars"
                  /> */}
                </FormControl>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>HSN</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="HSN"
                    value={manageSalesItem.hsn}
                  />
                </FormControl>
              </Grid>
              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Pieces<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Pieces"
                    value={manageSalesItem.pieces}
                    // onChange={(e) => {
                    //   calculateSalesItemValues(salesItemTypeFromParticular, { pieces: e.target.value });
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                {salesItemTypeFromParticular === "Piece" ? (
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Weight<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Weight"
                      value={manageSalesItem.weight}
                      onChange={(e) => {
                        setManageSalesItem({
                          ...manageSalesItem,
                          weight: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                ) : (
                  <FormControl size="small" fullWidth>
                    <Typography>Weight</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Weight"
                      value={manageSalesItem.weight}
                    />
                  </FormControl>
                )}
              </Grid>
              {[
                "pieces",
                "piece",
                "pcs",
                "Pieces",
                "Piece",
                "Pcs",
                "PIECES",
                "PIECE",
                "PCS",
              ]?.includes(manageSalesItem.unit) ? (
                <Grid item md={1.25} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Rate<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Rate"
                      value={manageSalesItem.rate}
                    />
                  </FormControl>
                </Grid>
              ) : (
                <Grid item md={1.25} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Rate<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Rate"
                      value={manageSalesItem.rate}
                      onChange={(e) => {
                        calculateSalesItemValues(salesItemTypeFromParticular, {
                          rate: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              )}
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Value<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Value"
                    value={manageSalesItem.value}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>MC Dis Mode</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="MC Dis Mode"
                    value={manageSalesItem.makingchargemode}
                  />
                </FormControl>
              </Grid>
              <Grid item md={2} sm={6} xs={12}>
                <Typography>Original MC</Typography>
                <Box sx={{ display: "flex" }}>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Original MC"
                      value={manageSalesItem.originalmc}
                    />
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder=""
                      value={manageSalesItem.mcgramamount}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item md={2} sm={6} xs={12}>
                <Typography>MC Dis Amount</Typography>
                <Box sx={{ display: "flex" }}>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="MC Dis Amount"
                      value={manageSalesItem.makingcharge}
                      onChange={(e) => {
                        calculateSalesItemValues(salesItemTypeFromParticular, {
                          makingcharge: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      // type="number"
                      sx={userStyle.input}
                      placeholder=""
                      value={manageSalesItem.mc}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item md={2} sm={6} xs={12}>
                <Typography>Less</Typography>
                <Box sx={{ display: "flex" }}>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={lesstypeOpt}
                      value={{
                        label: manageSalesItem.lesstype,
                        value: manageSalesItem.lesstype,
                      }}
                      onChange={(e) => {
                        calculateSalesItemValues(salesItemTypeFromParticular, {
                          lesstype: e.value,
                        });
                      }}
                    />
                  </FormControl>
                  <FormControl size="small" sx={{ width: "150px" }}>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Less"
                      value={manageSalesItem.less}
                      onChange={(e) => {
                        calculateSalesItemValues(salesItemTypeFromParticular, {
                          less: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Gross Amount<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Gross Amount"
                    value={manageSalesItem.grossamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    CGST @ {`${manageSalesItem.cgstper}`}%
                    <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="CGST"
                    value={manageSalesItem.cgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    SGST @ {`${manageSalesItem.sgstper}`}%
                    <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="SGST"
                    value={manageSalesItem.sgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Type<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    placeholder="Type"
                    value={manageSalesItem.salestype}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Sales Amount<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Sales Amount"
                    value={manageSalesItem.salesamount}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={0.5} md={0.5} sm={2} xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    height: "30px",
                    minWidth: "20px",
                    padding: "19px 13px",
                    marginTop: "25px",
                  }}
                  onClick={addSalesItem}
                >
                  <FaPlus />
                </Button>
              </Grid>
            </Grid>
            <br />
            {salesItemTodo?.length > 0 && (
              <TableContainer component={Paper} sx={userStyle.tablecontainer}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>SNo</TableCell>
                      <TableCell colSpan={5}>Particulars</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>HSN</TableCell>
                      <TableCell>pcs</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>MC</TableCell>
                      <TableCell>MC Amount</TableCell>
                      <TableCell>MC Discount</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Less</TableCell>
                      <TableCell>Gross Amount</TableCell>
                      <TableCell>cgst</TableCell>
                      <TableCell>sgst</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Sales Amount</TableCell>
                      <TableCell>
                        <DeleteOutlineOutlinedIcon
                          style={{ fontSize: "large" }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesItemTodo?.length > 0 &&
                      salesItemTodo?.map((data, i) => {
                        return (
                          <>
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell colSpan={5}>
                                {data.productname}
                              </TableCell>
                              <TableCell>
                                {data.status === "Sales" ? "New" : "Exists"}
                              </TableCell>
                              <TableCell>{data.hsn}</TableCell>
                              <TableCell>{data.pieces}</TableCell>
                              <TableCell>{data.weight}</TableCell>
                              <TableCell>{`${data.originalmc} (${data.makingchargemode})`}</TableCell>
                              <TableCell>{data.mcgramamount}</TableCell>
                              <TableCell>{data.makingcharge}</TableCell>
                              <TableCell>
                                {Number(data.rate)?.toFixed(2)}
                              </TableCell>
                              <TableCell>{data.value}</TableCell>
                              <TableCell>{`${data.lessamount} (${data.lesstype})`}</TableCell>
                              <TableCell>{data.grossamount}</TableCell>
                              <TableCell>{`${data.cgst} (${data.cgstper}%)`}</TableCell>
                              <TableCell>{`${data.sgst} (${data.sgstper}%)`}</TableCell>
                              <TableCell>{data.salestype}</TableCell>
                              <TableCell>{data.salesamount}</TableCell>
                              <TableCell>
                                <AiOutlineClose
                                  style={{
                                    color: "red",
                                    fontWeight: "900",
                                    cursor: "pointer",
                                    fontSize: "large",
                                  }}
                                  onClick={(e) => deleteSalesItemRow(i, e)}
                                />
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <br />
            <Grid container spacing={1}>
              <Grid item md={12} sm={12} xs={12}>
                {salesTaxGroupsArray?.length > 0 && (
                  <TableContainer
                    component={Paper}
                    sx={userStyle.tablecontainer}
                  >
                    <Table aria-label="customized table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Tax Grp</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Pc</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Wt</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot MC Dis</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Gross(W/o)</b>
                          </TableCell>
                          <TableCell>
                            <b>Less</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Gross(W)</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot cgst</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot sgst</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Sales Amount</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesTaxGroupsArray?.length > 0 &&
                          salesTaxGroupsArray?.map((data, i) => {
                            return (
                              <>
                                <TableRow key={i}>
                                  <TableCell>{`${data.totalsalescgstper}%`}</TableCell>
                                  <TableCell>{data.totalsalespieces}</TableCell>
                                  <TableCell>{data.totalsalesweight}</TableCell>
                                  <TableCell>{data.totalmcdiscount}</TableCell>
                                  <TableCell>
                                    {data.totalsalesgrosswithoutdiscount}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex" }}>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "200px" }}
                                      >
                                        <Selects
                                          options={lesstypeOpt}
                                          value={{
                                            label: data.saleslesstype,
                                            value: data.saleslesstype,
                                          }}
                                          onChange={(e) => {
                                            multiLessInputs(
                                              i,
                                              "saleslesstype",
                                              e.value
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "100px" }}
                                      >
                                        <OutlinedInput
                                          id="component-outlined"
                                          type="number"
                                          sx={userStyle.input}
                                          placeholder="Less"
                                          value={data.salesless}
                                          onChange={(e) => {
                                            multiLessInputs(
                                              i,
                                              "salesless",
                                              e.target.value
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "150px" }}
                                      >
                                        <OutlinedInput
                                          id="component-outlined"
                                          sx={userStyle.input}
                                          placeholder="Amount"
                                          value={data.saleslessamount}
                                        />
                                      </FormControl>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{data.totalsalesgross}</TableCell>
                                  <TableCell>{`${data.totalsalescgst} (${data.totalsalescgstper}%)`}</TableCell>
                                  <TableCell>{`${data.totalsalessgst} (${data.totalsalessgstper}%)`}</TableCell>
                                  <TableCell>{data.totalsalesamount}</TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={1}>
              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot Pc</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Pc"
                    value={manageSalesCommon.totalsalespieces}
                  />
                </FormControl>
              </Grid>
              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot Wt</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Wt"
                    value={manageSalesCommon.totalsalesweight}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot MC Dis</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot MC Dis"
                    value={manageSalesCommon.totalmcdiscount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.35} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Gross(W/o)
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Gross Amount"
                    value={manageSalesCommon.totalsalesgrosswithoutdiscount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Typography sx={{ fontWeight: "900" }}>Tot Less</Typography>
                <FormControl size="small" fullWidth>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Tot Less"
                    value={manageSalesCommon.totalsaleslessamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Gross(W)
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Gross Amount"
                    value={manageSalesCommon.totalsalesgross}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot cgst</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot cgst"
                    value={manageSalesCommon.totalsalescgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot sgst</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot sgst"
                    value={manageSalesCommon.totalsalessgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.65} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Sales Amount
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Sales Amount"
                    value={manageSalesCommon.totalsalesamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={manageSalesCommon.isManualGrp}
                          onChange={(e) => {
                            // setIsSalesAmt('0.00');
                            // setManageSalesCommon({ ...manageSalesCommon, isManualGrp: !manageSalesCommon.isManualGrp, netamount: !manageSalesCommon.isManualGrp ? '0.00' : manageSalesCommon.netamount });
                            toCalculateTotalValues(
                              salesItemTodo,
                              oldItemTodo,
                              "0.00",
                              manageSalesCommon.isSReturn,
                              manageSalesCommon.isManual,
                              !manageSalesCommon.isManualGrp,
                              isNetAmt,
                              "0.00",
                              manageSalesCommon.salesreturnno,
                              manageSalesCommon.date,
                              manageSalesCommon.hours,
                              manageSalesCommon.minutes,
                              manageSalesCommon.time,
                              manageSalesCommon.bnoteno,
                              manageSalesCommon.overalllesstype,
                              manageSalesCommon.overallless,
                              manageSalesCommon.lessopeningbalance,
                              isCusAdvanceBalCheck,
                              isAdvanceAmt
                            );
                            setSalesReturnItemTodo([]);
                            setTotalSalesReturnAmount("0.00");
                          }}
                        />
                      }
                      label="Manual"
                    />
                  </FormGroup>
                </Box>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Manual Sales
                  </Typography>
                  {manageSalesCommon.isManualGrp ? (
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Manage Sales"
                      type="number"
                      value={isSalesAmt}
                      onChange={(e) => {
                        toCalculateTotalValues(
                          salesItemTodo,
                          oldItemTodo,
                          "0.00",
                          manageSalesCommon.isSReturn,
                          manageSalesCommon.isManual,
                          manageSalesCommon.isManualGrp,
                          isNetAmt,
                          e.target.value,
                          manageSalesCommon.salesreturnno,
                          manageSalesCommon.date,
                          manageSalesCommon.hours,
                          manageSalesCommon.minutes,
                          manageSalesCommon.time,
                          manageSalesCommon.bnoteno,
                          manageSalesCommon.overalllesstype,
                          manageSalesCommon.overallless,
                          manageSalesCommon.lessopeningbalance,
                          isCusAdvanceBalCheck,
                          isAdvanceAmt
                        );
                      }}
                    />
                  ) : (
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Manage Sales"
                      value={"0.00"}
                    />
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={1}>
              <Grid item md={12} sm={6} xs={12}>
                <Typography>
                  <b>Old Item</b>
                </Typography>
              </Grid>
              {/* {(manageSalesCommon.isInvoice === false || isNewBNote?.isNewValue  === false) ? */}
              <Grid item md={3} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Particulars
                    <b style={{ color: "red" }}>
                      * ({manageOldItem.producttype},{" "}
                      {manageOldItem.productsize}, {manageOldItem.productgst})
                    </b>
                  </Typography>
                  {/* {console.log(manageSalesCommon.isInvoice, 'manageSalesCommon.isInvoice')}
                    {console.log(isNewBNote?.isNewValue  === false, 'isNewBNote?.isNewValue  === false')}
                    {console.log(oldItemFromItems, 'Item')}
                    {console.log(oldItemPurticularsOpt, 'bnoe')} */}
                  <Selects
                    options={oldItemFromItems}
                    value={{
                      label: manageOldItem.productname,
                      value: manageOldItem.productname,
                    }}
                    onChange={(e) => {
                      if (
                        manageSalesCommon.isInvoice === true &&
                        isNewBNote?.isNewValue === false &&
                        isNewBNote.bnoteno === "TRI/S/"
                      ) {
                        setPopupContentMalert("Please Enter Bnote No");
                        setPopupSeverityMalert("warning");
                        handleClickOpenPopupMalert();
                      } else {
                        if (manageSalesCommon.date === "") {
                          setPopupContentMalert("Please Select Date");
                          setPopupSeverityMalert("warning");
                          handleClickOpenPopupMalert();
                        } else {
                          fetchSingleItem(
                            e,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time
                          );
                        }
                      }
                      // calculateOldItemValues({
                      //   productname: e.value, itemname: e.itemname, bnoteno: (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false) ? isNewBNote.bnoteno : manageSalesCommon.bnoteno,
                      //   hsn: e.hsncode, productsize: e.sizename,
                      //   productcode: e.itemcode, producttype: e.pricingtype, date: manageSalesCommon.date
                      // });
                      // fetchSelectedRecentProdDetails(e);
                    }}
                  />
                </FormControl>
              </Grid>
              {/* :
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Particulars<b style={{ color: "red" }}>*</b></Typography>
                    <Selects
                      options={oldItemPurticularsOpt}
                      value={{ label: manageOldItem.productname, value: manageOldItem.productname }}
                      onChange={(e) => {
                        calculateOldItemValues({ productname: e.value, });
                        // fetchSelectedProdDetails(isNewBNote?.isNewValue, manageSalesCommon.isInvoice, e);
                        // fetchSelectedProdDetails(e);
                      }}
                    />
                  </FormControl>
                </Grid>
              } */}
              {isAddNew === true ? (
                <Grid item md={1} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Bnote No<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      sx={userStyle.input}
                      placeholder="Bnote No"
                      value={manageOldItem.bnoteno}
                      onChange={(e) => {
                        setManageOldItem({
                          ...manageOldItem,
                          bnoteno: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              ) : null}
              <Grid item md={isAddNew === true ? 1 : 1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>HSN</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    // type="number"
                    sx={userStyle.input}
                    placeholder="HSN"
                    // value={oldItemHsnValue}
                    value={manageOldItem.hsn}
                    // onChange={(e) => { setManageOldItem({ ...manageOldItem, hsn: e.target.value }) }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>Pieces</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Pieces"
                    value={manageOldItem.pieces}
                    onChange={(e) => {
                      setManageOldItem({
                        ...manageOldItem,
                        pieces: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={isAddNew === true ? 1.25 : 1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Original Weight<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Original Weight"
                    value={manageOldItem.originalweight}
                    onChange={(e) => {
                      // setManageOldItem({ ...manageOldItem, originalweight: e.target.value, });
                      calculateOldItemValues({
                        originalweight: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={isAddNew === true ? 1.25 : 1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>Stone Weight</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Stone Weight"
                    value={manageOldItem.stoneweight}
                    onChange={(e) => {
                      // setManageOldItem({ ...manageOldItem, stoneweight: e.target.value, });
                      calculateOldItemValues({ stoneweight: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={isAddNew === true ? 1.25 : 1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Correct Weight<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Correct Weight"
                    value={manageOldItem.correctweight}
                    // onChange={(e) => {
                    //   setManageOldItem({ ...manageOldItem, correctweight: e.target.value, waste: 0 });
                    //   calculateOldItemValues({ correctweight: e.target.value });
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={isAddNew === true ? 2.5 : 2.5} sm={6} xs={12}>
                <Typography>
                  Waste% (
                  {`d(${
                    manageOldItem.olddefaultwastage
                      ? manageOldItem.olddefaultwastage
                      : 0
                  }), min(${manageOldItem.oldminimumwastage})-max(${
                    manageOldItem.oldmaximumwastage
                  })`}
                  )
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Waste%"
                      value={manageOldItem.waste}
                      onChange={(e) => {
                        // setManageOldItem({ ...manageOldItem, waste: e.target.value });
                        calculateOldItemValues({ waste: e.target.value });
                      }}
                    />
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      // type="number"
                      sx={userStyle.input}
                      placeholder=""
                      value={manageOldItem.wastediscount}
                      // onChange={(e) => { setManageSalesItem({ ...manageSalesItem, mc: e.target.value }) }}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Actual Weight<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Actual Weight"
                    value={manageOldItem.actualweight}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Rate<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Rate"
                    value={manageOldItem.rate}
                    onChange={(e) => {
                      // setManageOldItem({ ...manageOldItem, rate: e.target.value });
                      calculateOldItemValues({ rate: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Value<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Value"
                    value={manageOldItem.value}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Gross Amount<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Gross Amount"
                    value={manageOldItem.grossamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    CGST @ {`${manageOldItem.cgstper}`}%
                    <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="CGST"
                    value={manageOldItem.cgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    SGST @ {`${manageOldItem.sgstper}`}%
                    <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="SGST"
                    value={manageOldItem.sgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Type<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    placeholder="Type"
                    value={manageOldItem.salestype}
                  />
                </FormControl>
              </Grid>
              <Grid item md={2} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Bought Note Amount<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Bought Note Amount"
                    value={manageOldItem.boughtnoteamount}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={0.5} md={0.5} sm={2} xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    height: "30px",
                    minWidth: "20px",
                    padding: "19px 13px",
                    marginTop: "25px",
                  }}
                  onClick={addOldItem}
                >
                  <FaPlus />
                </Button>
              </Grid>
            </Grid>
            <br />
            {oldItemTodo?.length > 0 && (
              <TableContainer component={Paper} sx={userStyle.tablecontainer}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>SNo</TableCell>
                      <TableCell colSpan={5}>Particulars</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Bnote No</TableCell>
                      <TableCell>HSN</TableCell>
                      <TableCell>pcs</TableCell>
                      <TableCell>Origial Weight</TableCell>
                      <TableCell>Stone Weight</TableCell>
                      <TableCell>Correct Weight</TableCell>
                      <TableCell>Waste%</TableCell>
                      <TableCell>Waste Discount</TableCell>
                      <TableCell>Actual Weight</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Gross Amount</TableCell>
                      <TableCell>cgst</TableCell>
                      <TableCell>sgst</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Bought Note Amount</TableCell>
                      <TableCell>
                        <DeleteOutlineOutlinedIcon
                          style={{ fontSize: "large" }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oldItemTodo?.length > 0 &&
                      oldItemTodo?.map((data, i) => {
                        return (
                          <>
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell colSpan={5}>
                                {data.productname}
                              </TableCell>
                              <TableCell>
                                {data.status === "Sales" ? "New" : "Exists"}
                              </TableCell>
                              <TableCell>{data.bnoteno}</TableCell>
                              <TableCell>{data.hsn}</TableCell>
                              <TableCell>{data.pieces}</TableCell>
                              <TableCell>{data.originalweight}</TableCell>
                              <TableCell>{data.stoneweight}</TableCell>
                              <TableCell>{data.correctweight}</TableCell>
                              <TableCell>{data.waste}</TableCell>
                              <TableCell>{data.wastediscount}</TableCell>
                              <TableCell>{data.actualweight}</TableCell>
                              <TableCell>
                                {Number(data.rate)?.toFixed(2)}
                              </TableCell>
                              <TableCell>{data.value}</TableCell>
                              <TableCell>{data.grossamount}</TableCell>
                              <TableCell>{`${data.cgst} (${data.cgstper}%)`}</TableCell>
                              <TableCell>{`${data.sgst} (${data.sgstper}%)`}</TableCell>
                              <TableCell>{data.salestype}</TableCell>
                              <TableCell>{data.boughtnoteamount}</TableCell>
                              <TableCell>
                                <AiOutlineClose
                                  style={{
                                    color: "red",
                                    fontWeight: "900",
                                    cursor: "pointer",
                                    fontSize: "large",
                                  }}
                                  onClick={(e) => deleteOldItemRow(i, e)}
                                />
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <br />
            <Grid container spacing={1}>
              <Grid item md={12} sm={12} xs={12}>
                {oldTaxGroupsArray?.length > 0 && (
                  <TableContainer
                    component={Paper}
                    sx={userStyle.tablecontainer}
                  >
                    <Table aria-label="customized table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Tax Grp</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Pc</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Wt</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Wastage Dis</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Gross(W/o)</b>
                          </TableCell>
                          <TableCell>
                            <b>Less</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Gross(W)</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot cgst</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot sgst</b>
                          </TableCell>
                          <TableCell>
                            <b>Tot Bought Note Amount</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {oldTaxGroupsArray?.length > 0 &&
                          oldTaxGroupsArray?.map((data, i) => {
                            return (
                              <>
                                <TableRow key={i}>
                                  <TableCell>{`${data.totaloldcgstper}%`}</TableCell>
                                  <TableCell>{data.totaloldpieces}</TableCell>
                                  <TableCell>{data.totaloldweight}</TableCell>
                                  <TableCell>
                                    {data.totalwastagediscount}
                                  </TableCell>
                                  <TableCell>
                                    {data.totaloldgrosswithoutdiscount}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex" }}>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "200px" }}
                                      >
                                        <Selects
                                          options={lesstypeOpt}
                                          value={{
                                            label: data.oldlesstype,
                                            value: data.oldlesstype,
                                          }}
                                          onChange={(e) => {
                                            multiLessInputs(
                                              i,
                                              "oldlesstype",
                                              e.value
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "100px" }}
                                      >
                                        <OutlinedInput
                                          id="component-outlined"
                                          type="number"
                                          sx={userStyle.input}
                                          placeholder="Less"
                                          value={data.oldless}
                                          onChange={(e) => {
                                            multiLessInputs(
                                              i,
                                              "oldless",
                                              e.target.value
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl
                                        size="small"
                                        sx={{ width: "150px" }}
                                      >
                                        <OutlinedInput
                                          id="component-outlined"
                                          sx={userStyle.input}
                                          placeholder="Amount"
                                          value={data.oldlessamount}
                                        />
                                      </FormControl>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{data.totaloldgross}</TableCell>
                                  <TableCell>{`${data.totaloldcgst} (${data.totaloldcgstper}%)`}</TableCell>
                                  <TableCell>{`${data.totaloldsgst} (${data.totaloldsgstper}%)`}</TableCell>
                                  <TableCell>{data.totaloldamount}</TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={1}>
              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot Pc</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Pc"
                    value={manageSalesCommon.totaloldpieces}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot Wt</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Wt"
                    value={manageSalesCommon.totaloldweight}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Wastage Dis
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Wastage Dis"
                    value={manageSalesCommon.totalwastagediscount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Gross(W/o)
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Gross Amount"
                    value={manageSalesCommon.totaloldgrosswithoutdiscount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Typography sx={{ fontWeight: "900" }}>Tot Less</Typography>
                {/* <Box sx={{ display: 'flex' }}>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={lesstypeOpt}
                      value={{ label: manageSalesCommon.oldlesstype, value: manageSalesCommon.oldlesstype }}
                      onChange={(e) => {
                        toCalculateTotalValues(salesItemTodo, oldItemTodo, manageSalesCommon.date, manageSalesCommon.hours, manageSalesCommon.minutes, manageSalesCommon.time, manageSalesCommon.bnoteno,
                          manageSalesCommon.saleslesstype, manageSalesCommon.salesless,
                          e.value, manageSalesCommon.oldless,
                          manageSalesCommon.overalllesstype, manageSalesCommon.overallless);
                      }}
                    />
                  </FormControl>
                  <FormControl size="small" sx={{ width: '150px' }}>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Less"
                      value={manageSalesCommon.oldless}
                      onChange={(e) => {
                        toCalculateTotalValues(salesItemTodo, oldItemTodo, manageSalesCommon.date, manageSalesCommon.hours, manageSalesCommon.minutes, manageSalesCommon.time, manageSalesCommon.bnoteno,
                          manageSalesCommon.saleslesstype, manageSalesCommon.salesless,
                          manageSalesCommon.oldlesstype, e.target.value,
                          manageSalesCommon.overalllesstype, manageSalesCommon.overallless);
                      }}
                    />
                  </FormControl>
                </Box> */}
                <FormControl size="small" fullWidth>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Tot Less"
                    value={manageSalesCommon.totaloldlessamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Gross(W)
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Gross Amount"
                    value={manageSalesCommon.totaloldgross}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot cgst</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot cgst"
                    value={manageSalesCommon.totaloldcgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Tot sgst</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot sgst"
                    value={manageSalesCommon.totaloldsgst}
                  />
                </FormControl>
              </Grid>
              <Grid item md={2.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Tot Bought Note Amount
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Tot Bought Note Amount"
                    value={manageSalesCommon.totaloldamount}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br />
            {salesReturnItemTodo?.length > 0 && (
              <>
                <Grid container spacing={1}>
                  <Grid item md={12} sm={6} xs={12}>
                    <Typography>
                      <b>Sales Return Item</b>
                    </Typography>
                  </Grid>
                </Grid>
                <br />
                <TableContainer component={Paper} sx={userStyle.tablecontainer}>
                  <Table aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <TableCell>SNo</TableCell>
                        <TableCell colSpan={5}>Particulars</TableCell>
                        <TableCell>Bill No</TableCell>
                        <TableCell>HSN</TableCell>
                        <TableCell>pcs</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>MC</TableCell>
                        <TableCell>MC Amount</TableCell>
                        <TableCell>MC Discount</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Less</TableCell>
                        <TableCell>Gross Amount</TableCell>
                        <TableCell>cgst</TableCell>
                        <TableCell>sgst</TableCell>
                        <TableCell>Sales Amount</TableCell>
                        <TableCell>Sales Return Amount</TableCell>
                        <TableCell>
                          <DeleteOutlineOutlinedIcon
                            style={{ fontSize: "large" }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesReturnItemTodo?.length > 0 &&
                        salesReturnItemTodo?.map((data, i) => {
                          return (
                            <>
                              <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell colSpan={5}>
                                  {data.productname}
                                </TableCell>
                                <TableCell>{data.salesreturnno}</TableCell>
                                <TableCell>{data.hsn}</TableCell>
                                <TableCell>{data.pieces}</TableCell>
                                <TableCell>{data.weight}</TableCell>
                                <TableCell>{`${data.originalmc} (${data.makingchargemode})`}</TableCell>
                                <TableCell>{data.mcgramamount}</TableCell>
                                <TableCell>{data.makingcharge}</TableCell>
                                <TableCell>
                                  {Number(data.rate)?.toFixed(2)}
                                </TableCell>
                                <TableCell>{data.value}</TableCell>
                                <TableCell>{data.less}</TableCell>
                                <TableCell>{data.grossamount}</TableCell>
                                <TableCell>{`${data.cgst} (${data.cgstper}%)`}</TableCell>
                                <TableCell>{`${data.sgst} (${data.sgstper}%)`}</TableCell>
                                <TableCell>{data.salesamount}</TableCell>
                                <TableCell>
                                  {Number(data.salesreturnamount)?.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <AiOutlineClose
                                    style={{
                                      color: "red",
                                      fontWeight: "900",
                                      cursor: "pointer",
                                      fontSize: "large",
                                    }}
                                    onClick={(e) =>
                                      deleteSalesReturnItemRow(i, e)
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            </>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <br />
                <Grid container spacing={1}>
                  <Grid item md={8} sm={8} xs={8}></Grid>
                  <Grid item md={2} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography sx={{ fontWeight: "900" }}>
                        Handling Fee
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        placeholder="Handling Fee"
                        value={handlingSalesReturnAmount}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={2} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography sx={{ fontWeight: "900" }}>
                        Tot Sales Return Amount
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        placeholder="Tot Sales Return Amount"
                        value={totalSalesReturnAmount}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            )}
            <br />
            <Grid container spacing={1}>
              <Grid item md={1} sm={6} xs={12}>
                <Typography>Bill</Typography>
                <Box sx={{ display: "flex", justifyContent: "left" }}>
                  <Button
                    variant="contained"
                    onClick={handleClickUploadPopupOpen}
                  >
                    Upload
                  </Button>
                </Box>
              </Grid>
              {isCusOpeningBal?.length > 0 ? (
                <Grid item md={1} sm={6} xs={12}>
                  <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isCusOpeningBalCheck}
                            onChange={(e) => {
                              setIsCusOpeningBalCheck(!isCusOpeningBalCheck);
                              setManageSalesCommon({
                                ...manageSalesCommon,
                                openingbalance: !isCusOpeningBalCheck
                                  ? Number(
                                      isCusOpeningBal[0]?.openingbalance
                                    )?.toFixed(2)
                                  : "0.00",
                                lessopeningbalance: "0.00",
                              });
                            }}
                          />
                        }
                        label="Use Op Balance"
                      />
                    </FormGroup>
                  </Box>
                </Grid>
              ) : (
                <Grid item md={1} sm={6} xs={12}></Grid>
              )}
              {isCusOpeningBalCheck === true ? (
                <>
                  <Grid item md={1.25} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Opening Balance</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        placeholder="Opening Balance"
                        value={manageSalesCommon.openingbalance}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={1.25} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Less Op Balance<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        sx={userStyle.input}
                        placeholder="Less Opening Balance"
                        value={manageSalesCommon.lessopeningbalance}
                        onChange={(e) => {
                          toCalculateTotalValues(
                            salesItemTodo,
                            oldItemTodo,
                            totalSalesReturnAmount,
                            manageSalesCommon.isSReturn,
                            manageSalesCommon.isManual,
                            manageSalesCommon.isManualGrp,
                            isNetAmt,
                            isSalesAmt,
                            manageSalesCommon.salesreturnno,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time,
                            manageSalesCommon.bnoteno,
                            manageSalesCommon.overalllesstype,
                            manageSalesCommon.overallless,
                            e.target.value,
                            isCusAdvanceBalCheck,
                            isAdvanceAmt
                          );
                        }}
                      />
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <Grid item md={2.5} sm={6} xs={12}></Grid>
              )}
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Net Amount(W/o)
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Net Amount(W/o)"
                    value={manageSalesCommon.netamountwithoutdis}
                  />
                </FormControl>
              </Grid>
              <Grid item md={2} sm={6} xs={12}>
                <Typography sx={{ fontWeight: "900" }}>Less</Typography>
                <Box sx={{ display: "flex" }}>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={lesstypeOpt}
                      value={{
                        label: manageSalesCommon.overalllesstype,
                        value: manageSalesCommon.overalllesstype,
                      }}
                      onChange={(e) => {
                        if (salesItemTodo?.length === 0) {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            overalllesstype: e.value,
                          });
                        } else {
                          toCalculateTotalValues(
                            salesItemTodo,
                            oldItemTodo,
                            totalSalesReturnAmount,
                            manageSalesCommon.isSReturn,
                            manageSalesCommon.isManual,
                            manageSalesCommon.isManualGrp,
                            isNetAmt,
                            isSalesAmt,
                            manageSalesCommon.salesreturnno,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time,
                            manageSalesCommon.bnoteno,
                            e.value,
                            manageSalesCommon.overallless,
                            manageSalesCommon.lessopeningbalance,
                            isCusAdvanceBalCheck,
                            isAdvanceAmt
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormControl size="small" sx={{ width: "150px" }}>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Less"
                      value={manageSalesCommon.overallless}
                      onChange={(e) => {
                        if (salesItemTodo?.length === 0) {
                          setManageSalesCommon({
                            ...manageSalesCommon,
                            overallless: e.target.value,
                          });
                        } else {
                          toCalculateTotalValues(
                            salesItemTodo,
                            oldItemTodo,
                            totalSalesReturnAmount,
                            manageSalesCommon.isSReturn,
                            manageSalesCommon.isManual,
                            manageSalesCommon.isManualGrp,
                            isNetAmt,
                            isSalesAmt,
                            manageSalesCommon.salesreturnno,
                            manageSalesCommon.date,
                            manageSalesCommon.hours,
                            manageSalesCommon.minutes,
                            manageSalesCommon.time,
                            manageSalesCommon.bnoteno,
                            manageSalesCommon.overalllesstype,
                            e.target.value,
                            manageSalesCommon.lessopeningbalance,
                            isCusAdvanceBalCheck,
                            isAdvanceAmt
                          );
                        }
                      }}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>
                    Net Amount(W)<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    sx={userStyle.input}
                    placeholder="Net Amount(W)"
                    value={manageSalesCommon.netamount}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1} sm={6} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 2, md: 2, sm: 1, xs: 0 } })}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={manageSalesCommon.isManual}
                          onChange={(e) => {
                            setIsNetAmt("0.00");
                            toCalculateTotalValues(
                              salesItemTodo,
                              oldItemTodo,
                              "0.00",
                              manageSalesCommon.isSReturn,
                              !manageSalesCommon.isManual,
                              manageSalesCommon.isManualGrp,
                              "0.00",
                              isSalesAmt,
                              manageSalesCommon.salesreturnno,
                              manageSalesCommon.date,
                              manageSalesCommon.hours,
                              manageSalesCommon.minutes,
                              manageSalesCommon.time,
                              manageSalesCommon.bnoteno,
                              "Fixed",
                              "0.00",
                              manageSalesCommon.lessopeningbalance,
                              isCusAdvanceBalCheck,
                              isAdvanceAmt
                            );
                            setSalesReturnItemTodo([]);
                            setTotalSalesReturnAmount("0.00");
                          }}
                        />
                      }
                      label="Manual"
                    />
                  </FormGroup>
                </Box>
              </Grid>
              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography sx={{ fontWeight: "900" }}>Manual Net</Typography>
                  {manageSalesCommon.isManual ? (
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Manage Sales"
                      type="number"
                      value={isNetAmt}
                      onChange={(e) => {
                        toCalculateTotalValues(
                          salesItemTodo,
                          oldItemTodo,
                          "0.00",
                          manageSalesCommon.isSReturn,
                          manageSalesCommon.isManual,
                          manageSalesCommon.isManualGrp,
                          e.target.value,
                          isSalesAmt,
                          manageSalesCommon.salesreturnno,
                          manageSalesCommon.date,
                          manageSalesCommon.hours,
                          manageSalesCommon.minutes,
                          manageSalesCommon.time,
                          manageSalesCommon.bnoteno,
                          manageSalesCommon.overalllesstype,
                          manageSalesCommon.overallless,
                          manageSalesCommon.lessopeningbalance,
                          isCusAdvanceBalCheck,
                          isAdvanceAmt
                        );
                      }}
                    />
                  ) : (
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      placeholder="Manage Sales"
                      value={"0.00"}
                    />
                  )}
                </FormControl>
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <Typography>Remarks</Typography>
                <FormControl size="small" fullWidth>
                  <TextareaAutosize
                    fullWidth
                    aria-label="maximum height"
                    minRows={2}
                    maxRows={2}
                    value={manageSalesCommon.remarks}
                    onChange={(e) => {
                      setManageSalesCommon({
                        ...manageSalesCommon,
                        remarks: e.target.value,
                      });
                    }}
                    placeholder="Remarks"
                    style={{ resize: "none", fontSize: "1rem" }}
                  />
                </FormControl>
              </Grid>
              {/* </Grid><br />
            <Grid container spacing={1}> */}
              <Grid item lg={1} md={1} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button
                    variant="outlined"
                    sx={buttonStyles.buttonsubmit}
                    onClick={() => {
                      handleClickOpenLetterHeader("preview");
                    }}
                  >
                    Preview
                  </Button>
                </Box>
              </Grid>
              <Grid item lg={0.75} md={1} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button
                    sx={buttonStyles.buttonsubmit}
                    onClick={() => {
                      handleClickOpenLetterHeader("print");
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </Grid>
              <Grid item lg={0.75} md={0.75} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button
                    sx={buttonStyles.buttonsubmit}
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isBtn}
                  >
                    Save
                  </Button>
                </Box>
              </Grid>
              <Grid item lg={2.1} md={2.1} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button
                    sx={buttonStyles.buttonsubmit}
                    variant="contained"
                    onClick={handleAnotherSubmit}
                    disabled={isBtn}
                  >
                    Save And Add Another
                  </Button>
                </Box>
              </Grid>
              <Grid item lg={1} md={1} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      {/* UPLOAD BILL CREATE IMAGE DIALOG */}
      <Dialog
        open={uploadPopupOpen}
        onClose={handleUploadPopupClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ marginTop: "95px" }}
      >
        <DialogTitle
          id="customized-dialog-title1"
          sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
        >
          Upload Image
        </DialogTitle>
        <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <br />
              <FormControl size="small" fullWidth>
                <Grid sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={userStyle.uploadbtn}
                  >
                    Upload
                    <input
                      type="file"
                      multiple
                      id="productimage"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={handleInputChange}
                    />
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {/* {refImageBill.map((file, index) => (
                <Grid container key={index}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {file.type.includes('image/')  ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          height={50}
                          style={{
                            maxWidth: '-webkit-fill-available',
                          }}
                        />
                      ) : (
                        <img style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }} src={getFileIcon(file.name)} height="10" alt="file icon" />
                      )}
                    </Box>
                  </Grid>
                  <Grid
                    item
                    md={7}
                    sm={7}
                    xs={7}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle2"> {file.name} </Typography>
                  </Grid>
                  <Grid item md={1} sm={1} xs={1}>
                    <Grid sx={{ display: 'flex' }}>
                      <Button
                        sx={{
                          padding: '14px 14px',
                          minWidth: '40px !important',
                          borderRadius: '50% !important',
                          ':hover': {
                            backgroundColor: '#80808036', // theme.palette.primary.main
                          },
                        }}
                        onClick={() => renderFilePreview(file)}
                      >
                        <VisibilityOutlinedIcon style={{ fontsize: '12px', color: '#357AE8' }} />
                      </Button>
                      <Button
                        sx={{
                          padding: '14px 14px',
                          minWidth: '40px !important',
                          borderRadius: '50% !important',
                          ':hover': {
                            backgroundColor: '#80808036', // theme.palette.primary.main
                          },
                        }}
                        onClick={() => handleDeleteFile(index)}
                      >
                        <FaTrash style={{ color: '#a73131', fontSize: '12px' }} />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              ))} */}
              {refImageBill.map((file, index) => (
                <Grid container key={index} sx={{ mb: 1 }}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {file.type?.includes("image/") ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          height={50}
                          style={{ maxWidth: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <img
                          src={getFileIcon(file.name)}
                          alt="file icon"
                          height={30}
                          style={{ cursor: "pointer" }}
                          onClick={() => renderFilePreview(file)} // open PDF/doc when clicked
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid
                    item
                    md={7}
                    sm={7}
                    xs={7}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {file.name}
                    </Typography>
                  </Grid>

                  <Grid item md={1} sm={1} xs={1}>
                    <Grid sx={{ display: "flex" }}>
                      <Button
                        sx={{
                          padding: "6px",
                          minWidth: "36px",
                          borderRadius: "50%",
                          ":hover": { backgroundColor: "#80808036" },
                        }}
                        onClick={() => renderFilePreview(file)}
                      >
                        <VisibilityOutlinedIcon
                          sx={{ fontSize: 16, color: "#357AE8" }}
                        />
                      </Button>
                      <Button
                        sx={{
                          padding: "6px",
                          minWidth: "36px",
                          borderRadius: "50%",
                          ":hover": { backgroundColor: "#80808036" },
                        }}
                        onClick={() => handleDeleteFile(index)}
                      >
                        <FaTrash
                          style={{ color: "#a73131", fontSize: "14px" }}
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadOverAll} variant="contained">
            Ok
          </Button>
          <Button onClick={resetImage} sx={userStyle.btncancel}>
            Reset
          </Button>
          <Button onClick={handleUploadPopupClose} sx={userStyle.btncancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {/* Alert  */}
      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      {/* SUCCESS */}
      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />

      <Box>
        <Dialog
          open={isOpenLetterHeadPopup}
          onClose={handleClickCloseLetterHead}
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
            marginTop: "50px",
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Typography sx={userStyle.HeaderText}>
                View Letter Header Options
              </Typography>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Print Option<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={HeaderDropDowns}
                      value={{ label: headerOptions, value: headerOptions }}
                      onChange={(e) => {
                        setHeaderOptions(e.value);
                        setSelectedHeadOpt([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                {headerOptions === "With Letter Head" && (
                  <Grid
                    item
                    md={headerOptions === "With Letter Head" ? 4 : 3}
                    xs={12}
                    sm={12}
                  >
                    <FormControl fullWidth size="small">
                      <Typography>
                        With Letter Head <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        maxMenuHeight={300}
                        options={WithHeaderOptions}
                        value={selectedHeadOpt}
                        onChange={handleHeadChangeAdd}
                        valueRenderer={customValueRenderHeadFromAdd}
                      />
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              <br />
              <br /> <br />
              <br />
              <Grid container spacing={2} sx={{ marginLeft: "3px" }}>
                <Grid item md={4} xs={12} sm={12}>
                  <LoadingButton
                    loading={HeaderOptionsButton}
                    sx={buttonStyles.buttonsubmit}
                    autoFocus
                    variant="contained"
                    onClick={(e) => {
                      if (pagePopeOpen === "print") {
                        handlePrintingLayout();
                        setTimeout(
                          () => generatePDF("download", headerOptions),
                          500
                        ); // short delay for rendering
                      }
                      if (pagePopeOpen === "preview") {
                        handlePrintingLayout();
                        setTimeout(
                          () => generatePDF("preview", headerOptions),
                          500
                        );
                      }
                    }}
                  >
                    {" "}
                    OK{" "}
                  </LoadingButton>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Button
                    onClick={handleClickCloseLetterHead}
                    sx={buttonStyles.btncancel}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />

      {/* Print Layout */}
      <div
        id="bill-layout-container"
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#fff",
          // padding: '5mm',
          margin: "auto",
          boxSizing: "border-box",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "210mm",
            minHeight: "297mm",
            // p: 0, // Remove extra padding to fit header/footer precisely
            paddingTop: "30mm", // reserve space for header
            paddingBottom: "25mm", // reserve space for footer
            boxSizing: "border-box",
            position: "relative", // Allows absolutely-positioned header/footer
            backgroundColor: "#fff",
            overflow: "hidden",
            "@media print": {
              width: "210mm",
              minHeight: "297mm",
              margin: 0,
              boxShadow: "none",
              border: "none",
            },
          }}
        >
          {/* 🖼️ Header Image */}
          {/* <div id="pdf-header-section" style={{ marginBottom: '30px', }}> */}
          {/* {header && printLayout && ( */}
          {/* {header && (
              // <Box
              //   component="img"
              //   src={header}
              //   alt="Header"
              //   sx={{
              //     position: 'absolute',
              //     top: '3.5mm',
              //     left: '5mm',
              //     width: '95%',
              //     height: '9%',
              //     objectFit: 'contain',
              //   }}
              // />
              <img src={header} alt="Header" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            )}
          </div> */}

          <div
            id="pdf-header-section"
            style={{
              position: "absolute",
              top: "3.5mm",
              left: "5mm",
              width: "95%",
              height: "9%",
              objectFit: "contain",
            }}
          >
            {header && (
              <img
                src={header}
                alt="Header"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>

          <div id="pdf-content-section">
            <Box
              sx={{
                // display: 'flex',
                justifyContent: "center",
                // backgroundColor: '#f9f9f9',
                backgroundColor: "#fff",
                // py: 4,
                marginTop: "30px", // gap below header
                marginBottom: "30px",
                // marginLeft: '20px',
                // marginRight: '20px',
              }}
            >
              {/* <Paper
            elevation={2}
            sx={{
              width: '210mm',
              minHeight: '297mm',
              p: 3,
              boxSizing: 'border-box',
              // border: "1px solid #000",
              backgroundColor: '#fff',
              '@media print': {
                width: '210mm',
                minHeight: '297mm',
                margin: 0,
                boxShadow: 'none',
                border: 'none',
              },
            }}
          > */}
              {/* <Box sx={{ border: '1px solid #000', borderRadius: 1 }}> */}

              <Box sx={{ background: "#0000000a", mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  INVOICE
                </Typography>
              </Box>

              <Box
                sx={{
                  border: "1px solid #000",
                  borderRadius: 1,
                  // marginTop: '35mm', // Push content below header
                  // marginBottom: '25mm', // Leave space for footer
                  // padding: 2,
                }}
              >
                {/* <div id="pdf-header-section"> */}
                {/* Header */}
                <Box
                  sx={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderRadius: 1,
                    borderColor: "black",
                    margin: "3px",
                  }}
                >
                  {/* <Grid container spacing={2}>
                    <Grid item xs={1.5}>
                      <Box sx={{ borderRight: "1px solid #000", pb: 0.5 }}>

                      </Box>
                    </Grid>
                    <Grid item xs={5.5}>
                      <Box sx={{ padding: '5px', borderRight: "1px solid #000", }}>
                        <Typography fontSize={13}>
                          <b>To.</b>
                        </Typography>
                        <Box sx={{ marginLeft: '10px' }}>
                          <Typography fontSize={13}>
                            <b>{isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]}</b>
                          </Typography>
                          <Typography fontSize={12}>{isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress},</Typography>
                          <Typography fontSize={12}>Phone : {isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact}</Typography>
                          <Typography fontSize={12}>GSTIN :</Typography>
                        </Box>
                      </Box>
                    </Grid> */}
                  {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, marginTop: '10px', marginBottom: '-5px' }} /> */}
                  {/* <Grid item xs={4.5}>
                      <Typography fontSize={13}>
                        <b>
                          Date&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{moment(manageSalesCommon.date).format('DD/MM/YYYY')} {`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`}
                        </b>
                      </Typography>
                      <Divider sx={{ my: 1, borderColor: '#000' }} />
                      <Typography fontSize={13}>
                        <b>No.&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{isAuto === true ? manageSalesCommon.billno : billNoAuto}</b>
                      </Typography>
                      <Typography fontSize={13}>
                        <b>BNote No&ensp;&ensp;:&ensp;&ensp;{isNewBNote?.isNewValue === false ? (isNewBNote.bnoteno === 'TRI/S/' ? '' : isNewBNote.bnoteno) : manageSalesCommon.bnoteno}</b>
                      </Typography>
                      <Typography fontSize={13}>
                        <b>SR No&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{ }</b>
                      </Typography>
                      <Typography fongSize={13}>
                        <b>Sales ID</b>&ensp;:&ensp;&ensp;{manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()}
                      </Typography>
                    </Grid>
                  </Grid> */}
                  <Grid container>
                    <Grid item xs={2} sx={{ borderRight: "1px solid #000" }}>
                      <Box
                        sx={{ justifyContent: "center", paddingTop: "10px" }}
                      >
                        {imageUrl && (
                          <>
                            <Grid item xs={12} sx={{ textAlign: "center" }}>
                              <img
                                src={imageUrl}
                                alt="QR Code"
                                style={{
                                  width: "80px",
                                  height: "auto",
                                  objectFit: "contain",
                                }}
                              />
                            </Grid>
                          </>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={5} sx={{ borderRight: "1px solid #000" }}>
                      <Box sx={{ padding: "5px" }}>
                        <Typography fontSize={13}>
                          <b>To.</b>
                        </Typography>
                        <Box sx={{ marginLeft: "10px" }}>
                          <Typography fontSize={13}>
                            <b>{manageSalesCommon.customername}</b>
                          </Typography>
                          <Typography fontSize={12}>
                            {manageSalesCommon.customeraddress},
                          </Typography>
                          <Typography fontSize={12}>
                            Phone : {manageSalesCommon.customercontact}
                          </Typography>
                          <Typography fontSize={12}>
                            GSTIN : {manageSalesCommon.gstinnumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={5}>
                      <Box sx={{ padding: "5px" }}>
                        <Typography fontSize={13}>
                          <b>
                            Date&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;
                            {moment(manageSalesCommon.date).format(
                              "DD/MM/YYYY"
                            )}{" "}
                            {`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`}
                          </b>
                        </Typography>
                      </Box>
                      <Divider sx={{ borderColor: "#000" }} />
                      <Box sx={{ padding: "5px" }}>
                        <Typography fontSize={13}>
                          <b>
                            No.&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;
                            {isAuto === true
                              ? manageSalesCommon.billno
                              : billNoAuto}
                          </b>
                        </Typography>
                        <Typography fontSize={13}>
                          <b>
                            BNote No&ensp;&ensp;:&ensp;&ensp;
                            {isNewBNote?.isNewValue === false
                              ? isNewBNote.bnoteno === "TRI/S/"
                                ? ""
                                : isNewBNote.bnoteno
                              : manageSalesCommon.bnoteno ===
                                "Please Select Bnote No"
                              ? ""
                              : manageSalesCommon.bnoteno}
                          </b>
                        </Typography>
                        <Typography fontSize={13}>
                          <b>
                            SR No&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;
                            {manageSalesCommon.salesreturnno ===
                            "Please Select Sales Return No"
                              ? ""
                              : manageSalesCommon.salesreturnno}
                          </b>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Gold Silver */}
                <Grid container spacing={2} sx={{ padding: "5px" }}>
                  <Grid item xs={6} textAlign="center">
                    <Typography fontSize={12}>
                      <b>
                        Gold&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;
                        {Number(currentGoldRate)?.toFixed(2)}
                      </b>
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="center">
                    <Typography fontSize={12}>
                      <b>
                        Silver&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;
                        {Number(currentSilverRate)?.toFixed(2)}
                      </b>
                    </Typography>
                  </Grid>
                </Grid>
                {/* </div> */}
                <Divider sx={{ my: 1, borderColor: "#000" }} />
                {/* <div id="pdf-content-section"> */}
                {/* Sales Items */}
                <Box sx={{ margin: "3px" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ borderBottom: "1px solid #000", pb: 0.5 }}
                  >
                    Sales Items
                  </Typography>
                  <TableContainer>
                    <Table
                      size="small"
                      sx={{
                        border: "1px solid #000",
                        "& th, & td": {
                          border: "1px solid #000",
                          fontSize: "11px",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "40px" }}>
                            <b>SNo.</b>
                          </TableCell>
                          <TableCell
                            sx={{
                              width: "500px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <b>Particulars</b>
                          </TableCell>
                          <TableCell sx={{ width: "100px" }}>
                            <b>HSN</b>
                          </TableCell>
                          <TableCell sx={{ width: "40px" }}>
                            <b>Pcs</b>
                          </TableCell>
                          <TableCell sx={{ width: "80px" }}>
                            <b>Weight</b>
                          </TableCell>
                          <TableCell sx={{ width: "100px" }}>
                            <b>MC</b>
                          </TableCell>
                          <TableCell sx={{ width: "100px" }}>
                            <b>Rate</b>
                          </TableCell>
                          <TableCell sx={{ width: "100px" }}>
                            <b>Disc</b>
                          </TableCell>
                          <TableCell sx={{ width: "100px" }} align="right">
                            <b>Amount</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesItemTodo?.length > 0 &&
                          salesItemTodo.map((data, i) => {
                            return (
                              <TableRow>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{data.productname}</TableCell>
                                <TableCell>{data.hsn}</TableCell>
                                <TableCell>{data.pieces}</TableCell>
                                <TableCell>{data.weight || "0.000"}</TableCell>
                                <TableCell>
                                  {data.makingcharge || "0.00"}
                                </TableCell>
                                <TableCell>{data.rate || "0.00"}</TableCell>
                                <TableCell>
                                  {data.lessamount || "0.00"}
                                </TableCell>
                                <TableCell align="right">
                                  {data.grossamount || "0.00"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <b>Total</b>
                          </TableCell>
                          <TableCell colSpan={3} align="center">
                            <b>
                              {manageSalesCommon.totalsalesweight || "0.00"}
                            </b>
                          </TableCell>
                          <TableCell colSpan={2} align="right"></TableCell>
                          {/* <TableCell colSpan={2} align="right"><b>{Number(totalInvLessAmount(salesItemTodo))?.toFixed(2)}</b></TableCell> */}
                          <TableCell colSpan={1} align="right">
                            <b>
                              {manageSalesCommon.totalsalesgrosswithoutdiscount ||
                                "0.00"}
                            </b>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell colSpan={1}>
                            <b>Disc</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>CGST</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>SGST</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>Rnd Off</b>
                          </TableCell>
                          <TableCell colSpan={2} align="right">
                            <b>Sales Amount</b>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell colSpan={1}>
                            <b>{manageSalesCommon.totalsaleslessamount}</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>{manageSalesCommon.totalsalescgst || "0.00"}</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>{manageSalesCommon.totalsalessgst || "0.00"}</b>
                          </TableCell>
                          <TableCell colSpan={1}>
                            <b>
                              {Math.abs(
                                Number(manageSalesCommon.totalsalesamount) -
                                  (Number(
                                    manageSalesCommon.totalsalesgrosswithoutdiscount
                                  ) +
                                    Number(manageSalesCommon.totalsalescgst) +
                                    Number(manageSalesCommon.totalsalessgst))
                              )?.toFixed(2) || "0.00"}
                            </b>
                          </TableCell>
                          <TableCell colSpan={2} align="right">
                            <b>
                              {manageSalesCommon.totalsalesamount || "0.00"}
                            </b>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Old Items */}
                {oldItemTodo && oldItemTodo?.length > 0 && (
                  <>
                    <Divider sx={{ my: 1, borderColor: "#000" }} />
                    <Box sx={{ margin: "3px" }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ borderBottom: "1px solid #000", pb: 0.5 }}
                      >
                        Old Items
                      </Typography>
                      <TableContainer>
                        <Table
                          size="small"
                          sx={{
                            border: "1px solid #000",
                            "& th, & td": {
                              border: "1px solid #000",
                              fontSize: "11px",
                            },
                          }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: "40px" }}>
                                <b>SNo.</b>
                              </TableCell>
                              <TableCell
                                sx={{
                                  width: "500px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <b>Particulars</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>HSN</b>
                              </TableCell>
                              <TableCell sx={{ width: "40px" }}>
                                <b>Pcs</b>
                              </TableCell>
                              <TableCell sx={{ width: "80px" }}>
                                <b>Weight</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>Waste</b>
                              </TableCell>
                              <TableCell sx={{ width: "250px" }}>
                                <b>Rate</b>
                              </TableCell>
                              <TableCell sx={{ width: "250px" }} align="right">
                                <b>Amount</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {oldItemTodo?.length > 0 &&
                              oldItemTodo.map((data, i) => {
                                return (
                                  <TableRow>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{data.productname}</TableCell>
                                    <TableCell>{data.hsn}</TableCell>
                                    <TableCell>{data.pieces}</TableCell>
                                    <TableCell>
                                      {data.correctweight || "0.000"}
                                    </TableCell>
                                    <TableCell>{data.waste || "0%"}</TableCell>
                                    <TableCell>
                                      {data.rate || "0.000"}
                                    </TableCell>
                                    <TableCell align="right">
                                      {data.grossamount || "0.00"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <b>Total</b>
                              </TableCell>
                              <TableCell colSpan={2} align="right">
                                <b>
                                  {manageSalesCommon.totaloldweight || "0.00"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={2} align="right"></TableCell>
                              <TableCell colSpan={1} align="right">
                                <b>
                                  {manageSalesCommon.totaloldgrosswithoutdiscount ||
                                    "0.00"}
                                </b>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3}></TableCell>
                              <TableCell colSpan={1}>
                                <b>Disc</b>
                              </TableCell>
                              <TableCell colSpan={1}>
                                <b>CGST</b>
                              </TableCell>
                              <TableCell colSpan={1}>
                                <b>SGST</b>
                              </TableCell>
                              <TableCell colSpan={1} sx={{ width: "250px" }}>
                                <b>Rnd Off</b>
                              </TableCell>
                              <TableCell
                                colSpan={1}
                                sx={{ width: "250px" }}
                                align="right"
                              >
                                <b>Bnote Amount</b>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3}></TableCell>
                              <TableCell colSpan={1}>
                                <b>
                                  {manageSalesCommon.totaloldlessamount ||
                                    "0.00"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={1}>
                                <b>
                                  {manageSalesCommon.totaloldcgst || "0.00"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={1}>
                                <b>
                                  {manageSalesCommon.totaloldsgst || "0.00"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={1}>
                                <b>
                                  {Math.abs(
                                    Number(
                                      manageSalesCommon.totaloldgrosswithoutdiscount
                                    ) +
                                      Number(manageSalesCommon.totaloldcgst) +
                                      Number(manageSalesCommon.totaloldsgst) -
                                      Number(manageSalesCommon.totaloldamount)
                                  )?.toFixed(2) || "0.00"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={1} align="right">
                                <b>
                                  {manageSalesCommon.totaloldamount || "0.00"}
                                </b>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                )}

                {/* Sales Return */}
                {salesReturnItemTodo && salesReturnItemTodo?.length > 0 && (
                  <>
                    <Divider sx={{ my: 1, borderColor: "#000" }} />
                    <Box sx={{ margin: "3px" }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ borderBottom: "1px solid #000", pb: 0.5 }}
                      >
                        Sales Return
                      </Typography>
                      <TableContainer>
                        <Table
                          size="small"
                          sx={{
                            border: "1px solid #000",
                            "& th, & td": {
                              border: "1px solid #000",
                              fontSize: "11px",
                            },
                          }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: "40px" }}>
                                <b>SNo.</b>
                              </TableCell>
                              <TableCell
                                sx={{
                                  width: "500px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <b>Particulars</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>HSN</b>
                              </TableCell>
                              <TableCell sx={{ width: "40px" }}>
                                <b>Pcs</b>
                              </TableCell>
                              <TableCell sx={{ width: "80px" }}>
                                <b>Weight</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>MC</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>Rate</b>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }}>
                                <b>Disc</b>
                              </TableCell>
                              <TableCell sx={{ width: "200px" }} align="right">
                                <b>Amount</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {salesReturnItemTodo?.length > 0 &&
                              salesReturnItemTodo.map((data, i) => {
                                return (
                                  <TableRow>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{data.productname}</TableCell>
                                    <TableCell>{data.hsn}</TableCell>
                                    <TableCell>{data.pieces}</TableCell>
                                    <TableCell>
                                      {data.weight || "0.000"}
                                    </TableCell>
                                    <TableCell>
                                      {data.makingcharge || "0.00"}
                                    </TableCell>
                                    <TableCell>{data.rate || "0.00"}</TableCell>
                                    <TableCell>
                                      {Number(data.less)?.toFixed(2) || "0.00"}
                                    </TableCell>
                                    <TableCell align="right">
                                      {data.grossamount || "0.00"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <b>Total</b>
                              </TableCell>
                              <TableCell colSpan={3} align="center">
                                <b>
                                  {totalSalesReturnWeight(
                                    salesReturnItemTodo
                                  ) || "0.000"}
                                </b>
                              </TableCell>
                              <TableCell colSpan={2} align="right"></TableCell>
                              <TableCell colSpan={1} align="right">
                                <b>{totalSalesReturnAmount || "0.00"}</b>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                )}
                {/* </div> */}
                <Divider sx={{ my: 1, borderColor: "#000" }} />
                {/* <div id="pdf-footer-section"> */}
                {/* Net Total */}
                {/* <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderRadius: 1, borderColor: 'black', margin: '3px', padding: '5px' }}> */}
                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '5px', paddingRight: '5px' }}> */}
                <Grid container>
                  <Grid item xs={9} sx={{ paddingLeft: "5px" }}>
                    <Typography fontSize={13} fontWeight="bold">
                      {}
                    </Typography>
                    <br />
                    <Typography fontSize={13} fontWeight="bold">
                      {numberToWords(manageSalesCommon.netamount)}
                    </Typography>
                    {/* <Box sx={{ paddingLeft: '5px' }}> */}
                    {/* {discriptionValue?.map(val =>
                      <Typography fontSize={8}>{val.description}</Typography>
                    )} */}
                    {/* </Box> */}
                  </Grid>
                  <Grid xs={3}>
                    <Typography fontSize={13} fontWeight="bold">
                      {/* Tot Disc&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;{(manageSalesCommon.overalllesstype === 'Percentage' ? (Number(manageSalesCommon.netamountwithoutdis) * ((Number(manageSalesCommon.overallless) * 1 / 100))) : manageSalesCommon.overallless) || '0.00'} */}
                      Tot Disc&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;
                      {Number(
                        Number(manageSalesCommon.overalllessamount) +
                          Number(manageSalesCommon.totalsaleslessamount) +
                          totalInvLessAmount(salesItemTodo)
                      )?.toFixed(2) || "0.00"}
                    </Typography>
                    <Typography
                      fontSize={13}
                      fontWeight="bold"
                      // textAlign="right"
                      // sx={{ borderTop: "1px solid #000", pt: 1 }}
                    >
                      Net Total&ensp;&ensp;:&ensp;&ensp;&ensp;
                      {manageSalesCommon.netamount || "0.00"}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      paddingLeft: "5px",
                      paddingRight: "5px",
                      paddingTop: "5px",
                      borderTop: "1px solid black",
                    }}
                  >
                    {discriptionValue?.map((val) => (
                      <Typography fontSize={8}>{val.description}</Typography>
                    ))}
                  </Grid>
                </Grid>
                {/* </Box> */}

                <Divider sx={{ my: 1, borderColor: "#000" }} />

                {/* Footer */}
                <Grid container spacing={1}>
                  <Grid
                    item
                    xs={7}
                    sx={{ borderRight: "1px solid #000", pb: 0.5 }}
                  >
                    {/* <Typography fontSize={11}>
                      <b>Sales ID:</b> {manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()}
                    </Typography> */}
                    <Box sx={{ paddingLeft: "5px", paddingRight: "5px" }}>
                      {contentValue?.map((val) => (
                        <Typography fontSize={8}>{val.content}</Typography>
                      ))}
                    </Box>
                  </Grid>
                  {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, }} /> */}
                  <Grid
                    item
                    xs={2}
                    sx={{ borderRight: "1px solid #000", pb: 0.5 }}
                  >
                    {/* <Typography fontSize={11}>for {manageSalesCommon.company}</Typography> */}
                    <Box mt={10} sx={{ padding: "5px" }}>
                      <Typography fontSize={11}>Purchaser Signature</Typography>
                      {/* <Typography fontSize={10}>{discriptionValue}</Typography> */}
                    </Box>
                  </Grid>
                  {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, marginTop: '10px', marginBottom: '-5px' }} /> */}
                  <Grid item xs={3} textAlign="right">
                    <Box sx={{ paddingRight: "5px" }}>
                      <Typography fontSize={11}>
                        <b>Sales ID&ensp;:&ensp;</b>{" "}
                        {manageSalesCommon.empcode
                          ? manageSalesCommon.empcode
                          : allUsersLimit[0].empcode.trim()}
                      </Typography>
                      <Typography fontSize={11}>
                        For {manageSalesCommon.company}
                      </Typography>
                      {/* <Box mt={4}>
                  <Typography fontSize={11}>Purchaser Signature</Typography>
                </Box> */}
                    </Box>
                  </Grid>
                </Grid>
                {/* </div> */}
              </Box>
              {/* <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{
              position: 'absolute',
              bottom: '28mm', // just above footer area
              left: 0,
              width: '100%',
              fontSize: 10,
            }}
          >
            Page 1 of 1
          </Typography> */}
              {/* </Paper> */}
            </Box>
          </div>

          {/* 🖼️ Footer Image */}
          {/* <div id="pdf-footer-section" style={{ marginTop: '30px', }}>             */}
          {/* {footer && printLayout && ( */}
          {/* {footer && (
              // <Box
              //   component="img"
              //   src={footer}
              //   alt="Footer"
              //   sx={{
              //     position: 'absolute',
              //     bottom: '5mm',
              //     left: '5mm',
              //     width: '95%',
              //     height: '6.7%',
              //     objectFit: 'contain',
              //   }}
              // />
              <img src={footer} alt="Footer" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                     )}
          </div> */}
          <div
            id="pdf-footer-section"
            style={{
              position: "absolute",
              bottom: "5mm",
              left: "5mm",
              width: "95%",
              height: "6.7%",
              objectFit: "contain",
            }}
          >
            {footer && (
              <img
                src={footer}
                alt="Footer"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>
        </Paper>
      </div>

      {/* View model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth
        scroll="paper"
        sx={{ marginTop: "95px" }}
      >
        <Box sx={{ padding: "20px 20px" }}>
          <Grid container spacing={2}>
            <Grid item md={9} sx={6} xs={12}>
              <Typography sx={userStyle.HeaderText}>
                Existing Customers
              </Typography>
            </Grid>
            <Grid item md={2} sx={6} xs={12}>
              <Button
                variant="contained"
                sx={buttonStyles.buttonsubmit}
                onClick={handleAddNewInExisting}
              >
                New Customer
              </Button>
            </Grid>
            <Grid item md={1} sx={6} xs={12}>
              <Button
                variant="contained"
                sx={buttonStyles.btncancel}
                onClick={handleCloseview}
              >
                Back
              </Button>
            </Grid>
          </Grid>
          <br />
          <Grid item md={6} sm={12} xs={12}>
            <Box>
              {/* ******************************************************EXPORT Buttons****************************************************** */}
              <Grid container spacing={2} style={userStyle.dataTablestyle}>
                <Grid item md={2} xs={12} sm={12}>
                  <Box>
                    <label>Show entries:</label>
                    <Select
                      id="pageSizeSelect"
                      value={pageSizeView}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 180,
                            width: 80,
                          },
                        },
                      }}
                      onChange={handlePageSizeChangeView}
                      sx={{ width: "77px" }}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={viewData?.length}>All</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                <Grid
                  item
                  md={8}
                  xs={12}
                  sm={12}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <Box>
                        {isUserRoleCompare?.includes('excelteamattendanceoverallreport') && (
                          <>
                            <Button
                              onClick={(e) => {
                                setIsFilterOpenView(true);
                                setFormat('xl');
                              }}
                              sx={userStyle.buttongrp}
                            >
                              <FaFileExcel />
                              &ensp;Export to Excel&ensp;
                            </Button>
                          </>
                        )}
                        {isUserRoleCompare?.includes('csvteamattendanceoverallreport') && (
                          <>
                            <Button
                              onClick={(e) => {
                                setIsFilterOpenView(true);
                                setFormat('csv');
                              }}
                              sx={userStyle.buttongrp}
                            >
                              <FaFileCsv />
                              &ensp;Export to CSV&ensp;
                            </Button>
                          </>
                        )}
                        {isUserRoleCompare?.includes('printteamattendanceoverallreport') && (
                          <>
                            <Button sx={userStyle.buttongrp} onClick={fetchTimeForPrintView}>
                              &ensp;
                              <FaPrint />
                              &ensp;Print&ensp;
                            </Button>
                          </>
                        )}
                        {isUserRoleCompare?.includes('pdfteamattendanceoverallreport') && (
                          <>
                            <Button
                              sx={userStyle.buttongrp}
                              onClick={() => {
                                setIsPdfFilterOpenView(true);
                              }}
                            >
                              <FaFilePdf />
                              &ensp;Export to PDF&ensp;
                            </Button>
                          </>
                        )}
                        {isUserRoleCompare?.includes('imageteamattendanceoverallreport') && (
                          <>
                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImageView}>
                              <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;
                            </Button>
                          </>
                        )}
                      </Box> */}
                </Grid>
                <Grid item md={2} xs={6} sm={6}>
                  <Box>
                    <AggregatedSearchBar
                      columnDataTable={columnDataTableView}
                      setItems={setItemsView}
                      addSerialNumber={addSerialNumberView}
                      setPage={setPageView}
                      maindatas={viewData}
                      setSearchedString={setSearchedStringView}
                      searchQuery={searchQueryView}
                      setSearchQuery={setSearchQueryView}
                      paginated={false}
                      totalDatas={viewData}
                    />
                  </Box>
                </Grid>
              </Grid>
              <br />
              <Button
                sx={userStyle.buttongrp}
                onClick={handleShowAllColumnsView}
              >
                Show All Columns
              </Button>
              &ensp;
              <Button
                sx={userStyle.buttongrp}
                onClick={handleOpenManageColumnsView}
              >
                Manage Columns
              </Button>
              <br />
              <br />
              {loaderView ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <ThreeDots
                      height="80"
                      width="80"
                      radius="9"
                      color="#1976d2"
                      ariaLabel="three-dots-loading"
                      wrapperStyle={{}}
                      wrapperClassName=""
                      visible={true}
                    />
                  </Box>
                </>
              ) : (
                <>
                  <AggridTable
                    rowDataTable={rowDataTableView}
                    columnDataTable={columnDataTableView}
                    columnVisibility={columnVisibilityView}
                    page={pageView}
                    setPage={setPageView}
                    pageSize={pageSizeView}
                    totalPages={totalPagesView}
                    setColumnVisibility={setColumnVisibilityView}
                    isHandleChange={isHandleChangeView}
                    items={itemsView}
                    gridRefTable={gridRefTableView}
                    paginated={false}
                    filteredDatas={filteredDatasView}
                    // totalDatas={totalDatasView}
                    selectedRows={selectedRowsView}
                    setSelectedRows={setSelectedRowsView}
                    searchQuery={searchedStringView}
                    handleShowAllColumnsUserShiftSummary={
                      handleShowAllColumnsView
                    }
                    setFilteredRowData={setFilteredRowDataView}
                    filteredRowData={filteredRowDataView}
                    setFilteredChanges={setFilteredChangesView}
                    filteredChanges={filteredChangesView}
                    gridRefTableImg={gridRefTableImgView}
                    itemsList={viewData}
                  />
                </>
              )}
            </Box>
          </Grid>
        </Box>
      </Dialog>

      <ExportData
        isFilterOpen={isFilterOpenView}
        handleCloseFilterMod={handleCloseFilterModView}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpenView}
        isPdfFilterOpen={isPdfFilterOpenView}
        setIsPdfFilterOpen={setIsPdfFilterOpenView}
        handleClosePdfFilterMod={handleClosePdfFilterModView}
        filteredDataTwo={
          (filteredChangesView !== null
            ? filteredRowDataView
            : rowDataTableView) ?? []
        }
        itemsTwo={viewData ?? []}
        filename={"Existing Customers"}
        exportColumnNames={exportColumnNamesView}
        exportRowValues={exportRowValuesView}
        componentRef={componentRefView}
        serverTimeForPrint={serverTimeForPrintView}
        buttonStyles={buttonStyles}
      />

      {/* Manage Column */}
      <Popover
        id={idView}
        open={isManageColumnsOpenView}
        anchorEl={anchorElView}
        onClose={handleCloseManageColumnsView}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <ManageColumnsContent
          handleClose={handleCloseManageColumnsView}
          searchQuery={searchQueryManageView}
          setSearchQuery={setSearchQueryManageView}
          filteredColumns={filteredColumnsView}
          columnVisibility={columnVisibilityView}
          toggleColumnVisibility={toggleColumnVisibilityView}
          setColumnVisibility={setColumnVisibilityView}
          initialColumnVisibility={initialColumnVisibilityView}
          columnDataTable={columnDataTableView}
        />
      </Popover>
    </Box>
  );
}

export default ManageSalesList;
