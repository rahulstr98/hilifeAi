import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
  Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPlus, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { Link, useParams } from "react-router-dom";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from "../../components/AggregatedSearchBar";
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import {
  monthsOption
} from "../../components/Componentkeyword";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import MessageAlert from "../../components/MessageAlert";
import { StyledTableCell, StyledTableRow } from "../../components/Table";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import AddExpensePopup from "./AddExpensePopup";
import EditExpensePopup from "./EditExpensePopup";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PaymentDueRemainderLogList from "./PaymentDueRemainderLogList";

function PaymentDueReminderLog() {

  const [modeofpay, setmodeofpay] = useState([]);
  const location = useLocation();
  const migrateData = location?.state?.migrateData;
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = (date.getMonth() + 1).toString().padStart(2, "0");


  const [yearsOption, setYearsOption] = useState([]);


  const generateYearsOptions = () => {
    const yearsOpt = [];
    let fromPrevThreeYrs = 2023
    for (let i = fromPrevThreeYrs; i <= currentYear + 30; i++) {
      yearsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setYearsOption(yearsOpt);
  };

  let Expensetotal = 0;

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  const [vendor, setVendor] = useState({
    vendorname: "",
    emailid: "",
    phonenumber: "",
    phonenumberone: "",
    phonenumbertwo: "",
    phonenumberthree: "",
    phonenumberfour: "",
    whatsappnumber: "",
    contactperson: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    gstnumber: "",
    creditdays: "",
    bankname: "Please Select Bank Name",
    bankbranchname: "",
    accountholdername: "",
    accountnumber: "",
    ifsccode: "",
    phonecheck: false,
    modeofpayments: "Please Select Mode of Payments",
    paymentfrequency: "Please Select Payment Frequency",
    monthlyfrequency: "",
    weeklyfrequency: "",
    vendorstatus: "",
    upinumber: "",
    chequenumber: "",
    cardnumber: "",
    cardholdername: "",
    cardtransactionnumber: "",
    cardtype: "Please Select Card Type",
    cardmonth: "Month",
    cardyear: "Year",
    cardsecuritycode: "",

    payamount: "",
    payamountdate: today
  });

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    // setSubmitLoader(false);
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  let exportColumnNames = [
    "Date",
    "Bill No",
    "Vendor Name",
    "Frequency",
    "Source",
    "Total Amount",
  ];
  let exportRowValues = [
    "currdate",
    "billno",
    "vendor",
    "vendorfrequency",
    "source",
    "amount",
  ];

  const [fileFormat, setFormat] = useState("");

  const gridRef = useRef(null);



  const [documentsList, setDocumentsList] = useState([]);
  const { isUserRoleCompare, isAssignBranch, setPageName, pageName, buttonStyles, isUserRoleAccess } =
    useContext(UserRoleAccessContext);
  const [singleDoc, setSingleDoc] = useState({});
  const { auth } = useContext(AuthContext);
  //Datatable
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchedString, setSearchedString] = useState("");
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openInfo, setOpeninfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [viewInfo, setViewInfo] = useState([]);
  const [openView, setOpenView] = useState(false);
  // Get the current URL
  const url = new URL(window.location.href);

  // Use URLSearchParams to extract query parameters
  const params = new URLSearchParams(url.search);

  // Get the value of the 'pathname' query parameter
  const pathname = params.get("pathname");
  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
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
          data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subsubpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 &&
          data?.subpagenameurl?.length !== 0 && data?.subpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 && data?.mainpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.mainpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.submodulenameurl;
        } else if (data?.modulenameurl?.length !== 0) {
          fetfinalurl = data.modulenameurl;
        } else {
          fetfinalurl = [];
        }


        // Check if the pathname exists in the URL
        return fetfinalurl?.includes(pathname);
      })
      ?.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
      }));
  const initialColumnVisibility = {
    actions: true,
    checkbox: true,
    serialNumber: true,
    vendorfrequency: true,
    currdate: true,
    vendor: true,
    source: true,
    billno: true,
    amount: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );
  const handleShowAllColumns = () => {
    setColumnVisibility(initialColumnVisibility);
  };
  const [vendorAuto, setVendorAuto] = useState("");
  const [expenseEditAuto, setExpenseEditAuto] = useState("");
  const [expenseEditId, setExpenseEditId] = useState();
  //useEffect
  useEffect(() => {
    sendRequest();
    generateYearsOptions();
  }, [migrateData]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const [openviewalertvendor, setOpenviewalertvendro] = useState(false);
  const [openviewalertExpEdit, setOpenviewalertExpEdit] = useState(false);

  const [expenseCatePop, setExpenseCatePop] = useState();
  const [expenseSubCatePop, setExpenseSubCatePop] = useState();
  const [reminderId, setReminderId] = useState();
  const [expenseDatePop, setExpenseDatePop] = useState();
  // view model
  const handleClickOpenviewalertvendor = () => {
    setOpenviewalertvendro(true);
  };

  const handleCloseviewalertvendor = () => {
    setOpenviewalertvendro(false);
  };
  const handleClickOpenviewalertExp = () => {
    setOpenviewalertExpEdit(true);
  };

  const handleCloseviewalertExp = () => {
    setOpenviewalertExpEdit(false);
  };
  //image
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Payment Due Reminder Log.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const handlViewClose = () => {
    setOpenView(false);
  };
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  //delete model
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  console.log(migrateData, "migrateData")
  const sendRequest = async () => {
    try {
      setLoading(false);
      let res = await axios.post(SERVICE.PAYMENTDUEREMINDER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        frequency: migrateData?.frequency,
        fromdate: migrateData?.fromdate,
        todate: migrateData?.todate,
        assignbranch: migrateData?.assignbranch,
        vendorid: migrateData?.vendorid,
        includeothers: isUserRoleCompare?.includes("lassignexpenseothers")
      });

      const updatedDataTwo = res?.data?.expensereminder?.filter(data => data?.source === migrateData?.source)
        .map((tp, index) => {
          tp.serialNumber = index + 1;
          return tp;
        });

      setDocumentsList(updatedDataTwo?.map((item) => ({
        ...item,
        id: item._id,
      })));
      setLoading(true);
    } catch (err) {
      setLoading(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //Project updateby edit page...
  // let updateby = singleDoc.updatedby;
  let addedby = viewInfo.addedby;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };

  // Excel
  const fileName = "PaymentDueReminderLog";

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "All Reminder",
    pageStyle: "print",
  });

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };
  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  const [vendorId, setVendorId] = useState("");

  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const [isErrorOpenAmount, setIsErrorOpenAmount] = useState(false);

  //amount mismatch Popup model
  const handleClickOpenerrAmount = () => {
    setIsErrorOpenAmount(true);
  };
  const handleCloseerrAmount = () => {
    setIsErrorOpenAmount(false);
  };

  const [expenseUpdtaeby, setExpenseUpdtaeby] = useState()
  const [payNowData, setPayNowData] = useState()

  let expenseid = expenseUpdtaeby?._id;
  let updateby = expenseUpdtaeby?.updatedby;

  const sendRequestPaidRequest = async (Paidamt, balamt) => {
    setPageName(!pageName);


    try {
      if (migrateData?.source === "Scheduled Payment") {
        let queuecreate = await axios.put(
          `${SERVICE.SINGLE_OTHERPAYMENTS}/${expenseid}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            paidamount: Number(Paidamt),
            paiddate: vendor.payamountdate,
            paidthrough: vendor.modeofpayments,
            paidstatus: "Paid",
            ...(balamt === 0 && { sortdate: new Date() }),
            // billstatus: "Partially Paid",
            paidbillstatus: balamt === 0 ? "Completed" : "Partially Paid",


            bankname:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.bankname)
                : "",
            bankbranchname:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.bankbranchname)
                : "",
            accountholdername:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.accountholdername)
                : "",
            accountnumber:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.accountnumber)
                : "",
            ifsccode:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.ifsccode)
                : "",

            upinumber:
              vendor.modeofpayments === "UPI" ? String(vendor.upinumber) : "",

            cardnumber:
              vendor.modeofpayments === "Card" ? String(vendor.cardnumber) : "",
            cardholdername:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardholdername)
                : "",
            cardtransactionnumber:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardtransactionnumber)
                : "",
            cardtype:
              vendor.modeofpayments === "Card" ? String(vendor.cardtype) : "",
            cardmonth:
              vendor.modeofpayments === "Card" ? String(vendor.cardmonth) : "",
            cardyear:
              vendor.modeofpayments === "Card" ? String(vendor.cardyear) : "",
            cardsecuritycode:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardsecuritycode)
                : "",

            chequenumber:
              vendor.modeofpayments === "Cheque"
                ? String(vendor.chequenumber)
                : "",

            cash: vendor.modeofpayments === "Cash" ? String("Cash") : "",
            paymentduereminderlog: [
              ...(expenseUpdtaeby?.paymentduereminderlog?.length > 0 ? expenseUpdtaeby?.paymentduereminderlog : []),
              {
                balanceamount: balamt,
                expensetotal: payNowData?.expensetotal,
                modeofpayments: vendor.modeofpayments,
                payamountdate: vendor.payamountdate,
                payamount: vendor.payamount,
                bankname: vendor.modeofpayments === "Bank Transfer"
                  ? String(vendor.bankname)
                  : "",
                bankbranchname: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.bankbranchname
                  : "",
                accountholdername: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.accountholdername
                  : "",
                accountnumber: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.accountnumber
                  : "",
                ifsccode: vendor.modeofpayments === "Bank Transfer" ? vendor.ifsccode : "",

                upinumber: vendor.modeofpayments === "UPI" ? vendor.upinumber : "",

                cardnumber: vendor.modeofpayments === "Card" ? vendor.cardnumber : "",
                cardholdername: vendor.modeofpayments === "Card"
                  ? vendor.cardholdername
                  : "",
                cardtransactionnumber: vendor.modeofpayments === "Card"
                  ? vendor.cardtransactionnumber
                  : "",
                cardtype: vendor.modeofpayments === "Card" ? vendor.cardtype : "",
                cardmonth: vendor.modeofpayments === "Card" ? vendor.cardmonth : "",
                cardyear: vendor.modeofpayments === "Card" ? vendor.cardyear : "",
                cardsecuritycode: vendor.modeofpayments === "Card"
                  ? vendor.cardsecuritycode
                  : "",
                chequenumber: vendor.modeofpayments === "Cheque"
                  ? vendor.chequenumber
                  : "",
                addedby: [
                  {
                    name: String(isUserRoleAccess.companyname),
                    date: String(new Date()),
                  },
                ],
              }]
          }
        );
      } else {
        let queuecreate = await axios.put(
          `${SERVICE.EXPENSES_SINGLE}/${expenseid}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            paidamount: Paidamt,
            balanceamount: balamt,
            paidmode: vendor.modeofpayments,
            paidstatus: "Paid",
            ...(balamt === 0 && { sortdate: new Date() }),
            // billstatus: "Partially Paid",
            billstatus: balamt === 0 ? "Completed" : "Partially Paid",


            bankname:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.bankname)
                : "",
            bankbranchname:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.bankbranchname)
                : "",
            accountholdername:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.accountholdername)
                : "",
            accountnumber:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.accountnumber)
                : "",
            ifsccode:
              vendor.modeofpayments === "Bank Transfer"
                ? String(vendor.ifsccode)
                : "",

            upinumber:
              vendor.modeofpayments === "UPI" ? String(vendor.upinumber) : "",

            cardnumber:
              vendor.modeofpayments === "Card" ? String(vendor.cardnumber) : "",
            cardholdername:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardholdername)
                : "",
            cardtransactionnumber:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardtransactionnumber)
                : "",
            cardtype:
              vendor.modeofpayments === "Card" ? String(vendor.cardtype) : "",
            cardmonth:
              vendor.modeofpayments === "Card" ? String(vendor.cardmonth) : "",
            cardyear:
              vendor.modeofpayments === "Card" ? String(vendor.cardyear) : "",
            cardsecuritycode:
              vendor.modeofpayments === "Card"
                ? String(vendor.cardsecuritycode)
                : "",

            chequenumber:
              vendor.modeofpayments === "Cheque"
                ? String(vendor.chequenumber)
                : "",

            cash: vendor.modeofpayments === "Cash" ? String("Cash") : "",
            paymentduereminderlog: [
              ...(expenseUpdtaeby?.paymentduereminderlog?.length > 0 ? expenseUpdtaeby?.paymentduereminderlog : []),
              {
                balanceamount: balamt,
                expensetotal: payNowData?.expensetotal,
                modeofpayments: vendor.modeofpayments,
                payamountdate: vendor.payamountdate,
                payamount: vendor.payamount,
                bankname: vendor.modeofpayments === "Bank Transfer"
                  ? String(vendor.bankname)
                  : "",
                bankbranchname: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.bankbranchname
                  : "",
                accountholdername: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.accountholdername
                  : "",
                accountnumber: vendor.modeofpayments === "Bank Transfer"
                  ? vendor.accountnumber
                  : "",
                ifsccode: vendor.modeofpayments === "Bank Transfer" ? vendor.ifsccode : "",

                upinumber: vendor.modeofpayments === "UPI" ? vendor.upinumber : "",

                cardnumber: vendor.modeofpayments === "Card" ? vendor.cardnumber : "",
                cardholdername: vendor.modeofpayments === "Card"
                  ? vendor.cardholdername
                  : "",
                cardtransactionnumber: vendor.modeofpayments === "Card"
                  ? vendor.cardtransactionnumber
                  : "",
                cardtype: vendor.modeofpayments === "Card" ? vendor.cardtype : "",
                cardmonth: vendor.modeofpayments === "Card" ? vendor.cardmonth : "",
                cardyear: vendor.modeofpayments === "Card" ? vendor.cardyear : "",
                cardsecuritycode: vendor.modeofpayments === "Card"
                  ? vendor.cardsecuritycode
                  : "",
                chequenumber: vendor.modeofpayments === "Cheque"
                  ? vendor.chequenumber
                  : "",
                addedby: [
                  {
                    name: String(isUserRoleAccess.companyname),
                    date: String(new Date()),
                  },
                ],
              }]
          }
        );
      }


      await sendRequest();
      setPayNowData()
      setVendor({
        ...vendor,
        modeofpayments: "Please Select Mode of Payments",
        payamount: "",
        payamountdate: today
      })
      setmodeofpay([])
      handleCloseview();
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };



  const paidamountdue = (Number(payNowData?.expensetotal) - Number(payNowData?.amount)) + Number(vendor.payamount)
  const balanceamountCal = Number(payNowData?.expensetotal) - ((Number(payNowData?.expensetotal) - Number(payNowData?.amount)) + Number(vendor.payamount))


  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    if (vendor.payamount === "") {
      setPopupContentMalert("Please Enter Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor?.payamountdate === ""
    ) {
      setPopupContentMalert("Please Select Date");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Please Select Mode of Payments"
    ) {
      setPopupContentMalert("Please Select Mode of Payments");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (vendor.modeofpayments === "Please Select Mode of Payments") {
      setPopupContentMalert("Please Select Mode of Payments!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Bank Transfer" &&
      (vendor.bankname === "Please Select Bank Name" || vendor.bankname === "" || vendor.bankname === undefined)
    ) {
      setPopupContentMalert("Please Select Bank Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Bank Transfer" &&
      vendor.bankbranchname === ""
    ) {
      setPopupContentMalert("Please Enter Bank Branch Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Bank Transfer" &&
      vendor.accountholdername === ""
    ) {
      setPopupContentMalert("Please Enter Account Holder Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Bank Transfer" &&
      vendor.accountnumber === ""
    ) {
      setPopupContentMalert("Please Enter Account Number!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Bank Transfer" && vendor.ifsccode === "") {
      setPopupContentMalert("Please Enter IFSC Code!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "UPI" && vendor.upinumber === "") {
      setPopupContentMalert("Please Enter UPI Number!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Card" && vendor.cardnumber === "") {
      setPopupContentMalert("Please Enter Card Number!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Card" && vendor.cardholdername === "") {
      setPopupContentMalert("Please Enter Card Holder Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Card" &&
      vendor.cardtransactionnumber === ""
    ) {
      setPopupContentMalert("Please Enter Card Transaction Number!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      vendor.modeofpayments === "Card" &&
      vendor.cardtype === "Please Select Card Type"
    ) {
      setPopupContentMalert("Please Select Card Type!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Card" && vendor.cardmonth === "Month") {
      setPopupContentMalert("Please Select Expire Month!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Card" && vendor.cardyear === "Year") {
      setPopupContentMalert("Please Select Expire Year!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Card" && vendor.cardsecuritycode === "") {
      setPopupContentMalert("Please Enter Card Security Code!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendor.modeofpayments === "Cheque" && vendor.chequenumber === "") {
      setPopupContentMalert("Please Enter Cheque Number!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (modeofpay.length === 0) {
      setPopupContentMalert("Please Insert Mode of Payments!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequestPaidRequest(paidamountdue, balanceamountCal);
    }
  };

  useEffect(() => {
    addSerialNumber(documentsList);
  }, [documentsList]);

  // Split the search query into individual terms
  const searchOverTerms = searchQuery?.toLowerCase()?.split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchOverTerms.every((term) =>
      Object.values(item)?.join(" ")?.toLowerCase()?.includes(term)
    );
  });
  const filteredData = filteredDatas?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredDatas?.length / pageSize);
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(
    firstVisiblePage + visiblePages - 1,
    totalPages
  );
  const pageNumbers = [];
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }
  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );
  const columnDataTable = [
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0,
      width: 80,
      minHeight: "40px",
      hide: !columnVisibility.serialNumber,
      pinned: "left",
      //lockPinned: true,
    },
    {
      field: "currdate",
      headerName: "Date",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.currdate,
      pinned: "left",
      //lockPinned: true,
    },
    {
      field: "billno",
      headerName: "Bill Number",
      flex: 0,
      width: 150,
      minHeight: "40px",
      hide: !columnVisibility.billno,
      pinned: "left",
      //lockPinned: true,
    },
    {
      field: "vendor",
      headerName: "Vendor Name",
      flex: 0,
      width: 200,
      minHeight: "40px",
      hide: !columnVisibility.vendor,
    },
    {
      field: "vendorfrequency",
      headerName: "Frequency",
      flex: 0,
      width: 150,
      minHeight: "40px",
      hide: !columnVisibility.vendorfrequency,
    },
    {
      field: "source",
      headerName: "Source",
      flex: 0,
      width: 180,
      minHeight: "40px",
      hide: !columnVisibility.source,
    },
    {
      field: "amount",
      headerName: "Total Amount",
      flex: 0,
      width: 130,
      minHeight: "40px",
      hide: !columnVisibility.amount,
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 180,
      sortable: false,
      //lockPinned: true,
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      hide: !columnVisibility.actions,
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex", padding: "10px" }}>
          {isUserRoleCompare?.includes("epaymentduereminder") && (
            <Button variant="contained" size="small" onClick={() => {
              getviewCode(params.data);

            }}>
              Pay Now
            </Button>
          )}
          {isUserRoleCompare?.includes("vpaymentduereminder") && (
            <Button
              onClick={() => {
                getviewLog(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];
  const rowDataTable = filteredData.map((item) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      vendorfrequency: item.vendorfrequency,
      currdate: item.currdate,
      vendor: item.vendor,
      source: item.source,
      billno: item.billno,
      amount: Number(item.amount),
    };
  });

  console.log(rowDataTable, "rowDataTable")
  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.id),
  }));

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };
  // Function to filter columns based on search query
  const filteredColumns = columnDataTable.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
  );
  // JSX for the "Manage Columns" popover content
  const manageColumnsContent = (
    <div style={{ padding: "10px", minWidth: "325px" }}>
      <Typography variant="h6">Manage Columns</Typography>
      <IconButton
        aria-label="close"
        onClick={handleCloseManageColumns}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ position: "relative", margin: "10px" }}>
        <TextField
          label="Find column"
          variant="standard"
          fullWidth
          value={searchQueryManage}
          onChange={(e) => setSearchQueryManage(e.target.value)}
          sx={{ marginBottom: 5, position: "absolute" }}
        />
      </Box>
      <br />
      <br />
      <DialogContent
        sx={{ minWidth: "auto", height: "200px", position: "relative" }}
      >
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: "flex" }}
                primary={
                  <Switch
                    sx={{ marginTop: "-10px" }}
                    checked={columnVisibility[column.field]}
                    onChange={() => toggleColumnVisibility(column.field)}
                  />
                }
                secondary={column.headerName}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => setColumnVisibility(initialColumnVisibility)}
            >
              Show All
            </Button>
          </Grid>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => setColumnVisibility({})}
            >
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </div>
  );
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  const [openview, setOpenview] = useState(false);

  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
    setVendor({
      ...vendor,
      modeofpayments: "Please Select Mode of Payments",
      payamount: "",
      payamountdate: today
    })
    setmodeofpay([])
  };

  const [openviewLog, setOpenviewLog] = useState(false);
  const [paymentdueremainderlog, setPaymentdueremainderlog] = useState([]);

  const handleClickOpenviewLog = () => {
    setOpenviewLog(true);
  };
  const handleCloseviewLog = () => {
    setOpenviewLog(false);
  };

  const getviewLog = async (e) => {
    setPageName(!pageName);
    try {


      if (migrateData?.source === "Scheduled Payment") {
        let res = await axios.get(`${SERVICE.SINGLE_OTHERPAYMENTS}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setPaymentdueremainderlog(res?.data?.sotherpayment?.paymentduereminderlog || [])
      } else {
        let res = await axios.get(`${SERVICE.EXPENSES_SINGLE}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setPaymentdueremainderlog(res?.data?.sexpenses?.paymentduereminderlog || [])
      }
      // setUpload(res?.data?.sexpenses?.files);

      handleClickOpenviewLog();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };


  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      if (migrateData?.source === "Scheduled Payment") {
        let res = await axios.get(`${SERVICE.SINGLE_OTHERPAYMENTS}/${e?.id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setExpenseUpdtaeby(res?.data?.sotherpayment);
        setPayNowData({
          ...res?.data?.sotherpayment,
          expensetotal: res?.data?.sotherpayment?.dueamount,
          amount: Number(res?.data?.sotherpayment?.dueamount) - Number(res?.data?.sotherpayment?.paidamount || 0),
        });
      } else {
        let res = await axios.get(`${SERVICE.EXPENSES_SINGLE}/${e?.id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setExpenseUpdtaeby(res?.data?.sexpenses);
        setPayNowData({
          ...res?.data?.sexpenses,
          amount: Number(res?.data?.sexpenses?.totalbillamount) - Number(res?.data?.sexpenses?.paidamount || 0),
        });
      }

      console.log(e, "e")
      handleClickOpenview();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const deleteTodo = (index) => {
    setmodeofpay(
      modeofpay.filter((data) => {
        return data !== index;
      })
    );
    switch (index) {
      case "Bank Transfer":
        setVendor({
          ...vendor,
          bankname: "Please Select Bank Name",
          bankbranchname: "",
          accountholdername: "",
          accountnumber: "",
          ifsccode: "",
        });
        break;
      case "UPI":
        setVendor({ ...vendor, upinumber: "" });
        break;
      case "Cheque":
        setVendor({ ...vendor, chequenumber: "" });
        break;
      case "Card":
        setVendor({
          ...vendor,
          cardnumber: "",
          cardholdername: "",
          cardtransactionnumber: "",
          cardtype: "Please Select Card Type",
          cardmonth: "Month",
          cardyear: "Year",
          cardsecuritycode: "",
        });
        break;
    }
  };

  console.log(modeofpay)
  console.log(vendor.modeofpayments)

  const handlemodeofpay = () => {

    if (vendor.modeofpayments === "Please Select Mode of Payment") {
      setPopupContentMalert("Please Select Mode of Payment!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (modeofpay.includes(vendor.modeofpayments)) {
      setPopupContentMalert("ToDo is Already Added!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (modeofpay.length > 0) {
      setPopupContentMalert("Mode of Payments Already Added!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else {
      setmodeofpay([vendor.modeofpayments]);
    }
  };

  //bank name options
  const accounttypes = [
    { value: "ALLAHABAD BANK", label: "ALLAHABAD BANK" },
    { value: "ANDHRA BANK", label: "ANDHRA BANK" },
    { value: "AXIS BANK", label: "AXIS BANK" },
    { value: "STATE BANK OF INDIA", label: "STATE BANK OF INDIA" },
    { value: "BANK OF BARODA", label: "BANK OF BARODA" },
    { value: "CITY UNION BANK", label: "CITY UNION BANK" },
    { value: "UCO BANK", label: "UCO BANK" },
    { value: "UNION BANK OF INDIA", label: "UNION BANK OF INDIA" },
    { value: "BANK OF INDIA", label: "BANK OF INDIA" },
    { value: "BANDHAN BANK LIMITED", label: "BANDHAN BANK LIMITED" },
    { value: "CANARA BANK", label: "CANARA BANK" },
    { value: "GRAMIN VIKASH BANK", label: "GRAMIN VIKASH BANK" },
    { value: "CORPORATION BANK", label: "CORPORATION BANK" },
    { value: "INDIAN BANK", label: "INDIAN BANK" },
    { value: "INDIAN OVERSEAS BANK", label: "INDIAN OVERSEAS BANK" },
    { value: "ORIENTAL BANK OF COMMERCE", label: "ORIENTAL BANK OF COMMERCE" },
    { value: "PUNJAB AND SIND BANK", label: "PUNJAB AND SIND BANK" },
    { value: "PUNJAB NATIONAL BANK", label: "PUNJAB NATIONAL BANK" },
    { value: "RESERVE BANK OF INDIA", label: "RESERVE BANK OF INDIA" },
    { value: "SOUTH INDIAN BANK", label: "SOUTH INDIAN BANK" },
    { value: "UNITED BANK OF INDIA", label: "UNITED BANK OF INDIA" },
    { value: "CENTRAL BANK OF INDIA", label: "CENTRAL BANK OF INDIA" },
    { value: "VIJAYA BANK", label: "VIJAYA BANK" },
    { value: "DENA BANK", label: "DENA BANK" },
    {
      value: "BHARATIYA MAHILA BANK LIMITED",
      label: "BHARATIYA MAHILA BANK LIMITED",
    },
    { value: "FEDERAL BANK LTD", label: "FEDERAL BANK LTD" },
    { value: "HDFC BANK LTD", label: "HDFC BANK LTD" },
    { value: "ICICI BANK LTD", label: "ICICI BANK LTD" },
    { value: "IDBI BANK LTD", label: "IDBI BANK LTD" },
    { value: "PAYTM BANK", label: "PAYTM BANK" },
    { value: "FINO PAYMENT BANK", label: "FINO PAYMENT BANK" },
    { value: "INDUSIND BANK LTD", label: "INDUSIND BANK LTD" },
    { value: "KARNATAKA BANK LTD", label: "KARNATAKA BANK LTD" },
    { value: "KOTAK MAHINDRA BANK", label: "KOTAK MAHINDRA BANK" },
    { value: "YES BANK LTD", label: "YES BANK LTD" },
    { value: "SYNDICATE BANK", label: "SYNDICATE BANK" },
    { value: "BANK OF MAHARASHTRA", label: "BANK OF MAHARASHTRA" },
    { value: "DCB BANK", label: "DCB BANK" },
    { value: "IDFC BANK", label: "IDFC BANK" },
    {
      value: "JAMMU AND KASHMIR BANK BANK",
      label: "JAMMU AND KASHMIR BANK BANK",
    },
    { value: "KARUR VYSYA BANK", label: "KARUR VYSYA BANK" },
    { value: "RBL BANK", label: "RBL BANK" },
    { value: "TMB BANK", label: "TMB BANK" },
    { value: "DHANLAXMI BANK", label: "DHANLAXMI BANK" },
    { value: "CSB BANK", label: "CSB BANK" },
  ];
  const modeofpayments = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "UPI", label: "UPI" },
    { value: "Card", label: "Card" },
    { value: "Cheque", label: "Cheque" },
  ];

  const cardtypes = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Visa Card", label: "Visa Card" },
    { value: "Master Card", label: "Master Card" },
  ];

  console.log(vendor, "vendor")

  return (
    <Box>
      <Headtitle title={"PAYMENT DUE REMINDER LIST LOG"} />
      {/* ****** Header Content ****** */}
      <Typography sx={userStyle.HeaderText}>
        Payment Due Reminder List Log
      </Typography>

      <>
        {isUserRoleCompare?.includes("lpaymentduereminder") && (
          <>
            <Box sx={userStyle.container}>
              {/* ******************************************************EXPORT Buttons****************************************************** */}
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.SubHeaderText}>
                    List Payment Due Reminder Log
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <>
                    <Link
                      to="/expense/paymentduereminder"
                      style={{
                        textDecoration: "none",
                        color: "white",
                        float: "right",
                      }}
                    >
                      <Button variant="contained">BACK</Button>
                    </Link>
                  </>
                </Grid>
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
                <Grid>
                  {isUserRoleCompare?.includes("excelpaymentduereminder") && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat("xl");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("csvpaymentduereminder") && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat("csv");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("printpaymentduereminder") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfpaymentduereminder") && (
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
                  {isUserRoleCompare?.includes("imagepaymentduereminder") && (
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={handleCaptureImage}
                    >
                      {" "}
                      <ImageIcon
                        sx={{ fontSize: "15px" }}
                      /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Grid>
              </Grid>
              <br />
              {/* ****** Table Grid Container ****** */}
              <Grid style={userStyle.dataTablestyle}>
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
                    sx={{ width: "77px" }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={documentsList?.length}>All</MenuItem>
                  </Select>
                </Box>
                <Box>
                  <FormControl fullWidth size="small">
                    <AggregatedSearchBar
                      columnDataTable={columnDataTable}
                      setItems={setItems}
                      addSerialNumber={addSerialNumber}
                      setPage={setPage}
                      maindatas={documentsList}
                      setSearchedString={setSearchedString}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      paginated={false}
                      totalDatas={documentsList}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <br />
              <br />
              <Grid container spacing={1}>
                <Grid item md={3} xs={12} sm={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "left",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={() =>
                        setColumnVisibility(initialColumnVisibility)
                      }
                    >
                      Show All Columns
                    </Button>
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={handleOpenManageColumns}
                    >
                      Manage Columns
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <br />
              <br />
              {/* ****** Table start ****** */}
              {!loading ? (
                <Box sx={userStyle.container}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      minHeight: "350px",
                    }}
                  >
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
                </Box>
              ) : (
                <AggridTable
                  rowDataTable={rowDataTable}
                  columnDataTable={columnDataTable}
                  columnVisibility={columnVisibility}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  setColumnVisibility={setColumnVisibility}
                  isHandleChange={isHandleChange}
                  items={items}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  gridRefTable={gridRefTable}
                  paginated={false}
                  filteredDatas={filteredDatas}
                  // totalDatas={totalProjects}
                  searchQuery={searchQuery}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={documentsList}
                />
              )}
              {/* ****** Table End ****** */}
            </Box>
            <TableContainer component={Paper} sx={userStyle.printcls}>
              <Table
                aria-label="customized table"
                id="jobopening"
                ref={componentRef}
              >
                <TableHead sx={{ fontWeight: "600" }}>
                  <StyledTableRow>
                    <StyledTableCell>S.No</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Bill No</StyledTableCell>
                    <StyledTableCell>Vendor Name</StyledTableCell>
                    <StyledTableCell>Frequency</StyledTableCell>
                    <StyledTableCell>Source</StyledTableCell>
                    <StyledTableCell>Total Amount</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {rowDataTable?.length > 0 ? (
                    rowDataTable?.map((row, index) => (
                      <StyledTableRow key={index}>
                        <StyledTableCell>{row.serialNumber}</StyledTableCell>
                        <StyledTableCell>{row.currdate}</StyledTableCell>
                        <StyledTableCell>{row.billno}</StyledTableCell>
                        <StyledTableCell>{row.vendor}</StyledTableCell>
                        <StyledTableCell>{row.vendorfrequency}</StyledTableCell>
                        <StyledTableCell>{row.source}</StyledTableCell>
                        <StyledTableCell>{row.amount}</StyledTableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <StyledTableRow>
                      {" "}
                      <StyledTableCell colSpan={7} align="center">
                        No Data Available
                      </StyledTableCell>{" "}
                    </StyledTableRow>
                  )}
                  <StyledTableRow></StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Popover
              id={id}
              open={isManageColumnsOpen}
              anchorEl={anchorEl}
              onClose={handleCloseManageColumns}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {manageColumnsContent}
            </Popover>
          </>
        )}
      </>
      {/* this is info view details */}
      <Dialog
        open={openInfo}
        onClose={handleCloseinfo}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ width: "550px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>All Reminder Info</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">addedby</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {"SNO"}.
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"UserName"}
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"Date"}
                      </StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {addedby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {i + 1}.
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {item.name}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FormControl>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Updated by</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {"SNO"}.
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"UserName"}
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"Date"}
                      </StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {updateby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {i + 1}.
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {item.name}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <br />
            <Grid container spacing={2}>
              <Button variant="contained" onClick={handleCloseinfo}>
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      <br />
      <br />
      {/* view model */}
      <Dialog
        open={openView}
        onClose={handlViewClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ width: "500px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View All Reminder
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Employee Code</Typography>
                  <Typography>{singleDoc.empcode}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Name</Typography>
                  <Typography>{singleDoc.companyname}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlViewClose}
              >
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* alert dialog */}
      <Box>
        <Dialog
          open={isErrorOpen}
          onClose={handleCloseerr}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{
                padding: "7px 13px",
                color: "white",
                background: "rgb(25, 118, 210)",
              }}
              onClick={handleCloseerr}
            >
              {" "}
              ok{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleCloseview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
        sx={{ marginTop: "50px" }}

      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              Pay Now
            </Typography>
            <Grid container spacing={4}>
              <Grid item md={5} xs={12} sm={12}>
                <FormControl fullWidth size="small" sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Typography variant="h6">Tota Bill Amount:</Typography>
                  &nbsp;
                  <Typography variant="h6">{payNowData?.expensetotal}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3.5} xs={12} sm={12}>
                <FormControl fullWidth size="small" sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Typography variant="h6">Due Amount:</Typography>
                  &nbsp;
                  <Typography variant="h6">{payNowData?.amount}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3.5} xs={12} sm={12}>
                <FormControl fullWidth size="small" sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Typography variant="h6">Paid Amount:</Typography>
                  &nbsp;
                  <Typography variant="h6">{Number(payNowData?.expensetotal) - Number(payNowData?.amount)}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <Grid container spacing={4}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Enter Amount <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={vendor.payamount}
                    placeholder="Please Enter Amount"
                    onChange={(e) => {
                      // Allow only numeric values
                      let numericValue = e.target.value.replace(/[^0-9]/g, '');

                      // Prevent leading zero (do not allow "0" as the first digit)
                      if (numericValue.startsWith('0')) {
                        numericValue = numericValue.replace(/^0+/, '');
                      }

                      // Ensure entered value does not exceed payNowData?.amount
                      if (numericValue === '' || Number(numericValue) <= payNowData?.amount) {
                        setVendor({ ...vendor, payamount: numericValue });
                      }
                    }}

                  />

                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Date <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={vendor.payamountdate}
                    onChange={(e) => {
                      setVendor({ ...vendor, payamountdate: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12} sx={{ display: "flex" }}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Mode of Payments<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={250}
                    options={modeofpayments}
                    placeholder="Please Choose Mode Of Payments"
                    value={{
                      label: vendor.modeofpayments,
                      value: vendor.modeofpayments,
                    }}
                    onChange={(e) => {
                      setVendor({ ...vendor, modeofpayments: e.value });
                      setmodeofpay([]);
                    }}
                  />
                </FormControl>
                &emsp;
                <Button
                  variant="contained"
                  color="success"
                  onClick={handlemodeofpay}
                  type="button"
                  sx={{
                    height: "30px",
                    minWidth: "30px",
                    marginTop: "28px",
                    padding: "6px 10px",
                  }}
                >
                  <FaPlus />
                </Button>
                &nbsp;
              </Grid>
              {modeofpay.includes("Cash") && (
                <>
                  <br />
                  {/* <Grid container spacing={2}> */}
                  <Grid item md={3} xs={12} sm={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography sx={{ fontWeight: "bold" }}>
                        Cash <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly={true}
                        value={"Cash"}
                        onChange={(e) => { }}
                      />
                    </FormControl>
                    &nbsp; &emsp;
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={(e) => deleteTodo("Cash")}
                      sx={{
                        height: "30px",
                        minWidth: "30px",
                        marginTop: "28px",
                        padding: "6px 10px",
                      }}
                    >
                      <AiOutlineClose />
                    </Button>
                  </Grid>
                  {/* </Grid> */}
                </>
              )}
              <br />
              <br />
              {modeofpay.includes("Bank Transfer") && (
                <>
                  {/* <Grid container spacing={2}> */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Bank Details
                    </Typography>
                  </Grid>
                  {/* </Grid> */}
                  <br />
                  {/* <Grid container spacing={2}> */}
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Bank Name<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={accounttypes}
                        placeholder="Please Choose Bank Name"
                        value={{
                          label: vendor.bankname,
                          value: vendor.bankname,
                        }}
                        onChange={(e) => {
                          setVendor({ ...vendor, bankname: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Bank Branch Name<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={vendor.bankbranchname}
                        placeholder="Please Enter Bank Branch Name"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^$|^[a-zA-Z\s]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              bankbranchname: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Account Holder Name<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={vendor.accountholdername}
                        placeholder="Please Enter Account Holder Name"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^$|^[a-zA-Z\s]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              accountholdername: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Account Number<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        value={vendor.accountnumber}
                        placeholder="Please Enter Account Number"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              accountnumber: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        IFSC Code<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={vendor.ifsccode}
                        placeholder="Please Enter IFSC Code"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({ ...vendor, ifsccode: inputvalue });
                          }
                        }}
                      />
                    </FormControl>
                    &nbsp; &emsp;
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={(e) => deleteTodo("Bank Transfer")}
                      sx={{
                        height: "30px",
                        minWidth: "30px",
                        marginTop: "28px",
                        padding: "6px 10px",
                      }}
                    >
                      <AiOutlineClose />
                    </Button>
                  </Grid>
                  {/* </Grid> */}
                </>
              )}
              <br /> <br />
              {modeofpay.includes("UPI") && (
                <>
                  {/* <Grid container spacing={2}> */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      UPI Details
                    </Typography>
                  </Grid>
                  {/* </Grid> */}
                  <br />
                  {/* <Grid container spacing={2}> */}
                  <Grid item md={3} xs={12} sm={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        UPI Number<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        value={vendor.upinumber}
                        placeholder="Please Enter UPI Number"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({ ...vendor, upinumber: inputvalue });
                          }
                        }}
                      />
                    </FormControl>
                    &nbsp; &emsp;
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={(e) => deleteTodo("UPI")}
                      sx={{
                        height: "30px",
                        minWidth: "30px",
                        marginTop: "28px",
                        padding: "6px 10px",
                      }}
                    >
                      <AiOutlineClose />
                    </Button>
                  </Grid>
                  {/* </Grid> */}
                </>
              )}
              <br /> <br />
              {modeofpay.includes("Card") && (
                <>
                  {/* <Grid container spacing={2}> */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Card Details
                    </Typography>
                  </Grid>
                  {/* </Grid> */}
                  <br />
                  {/* <Grid container spacing={2}> */}
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Card Number<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        value={vendor.cardnumber}
                        placeholder="Please Enter Card Number"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({ ...vendor, cardnumber: inputvalue });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Card Holder Name<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={vendor.cardholdername}
                        placeholder="Please Enter Card Holder Name"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^$|^[a-zA-Z\s]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              cardholdername: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Card Transaction Number
                        <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={vendor.cardtransactionnumber}
                        placeholder="Please Enter Card Transaction Number"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              cardtransactionnumber: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Card Type<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={cardtypes}
                        placeholder="Please Select Card Type"
                        value={{
                          label: vendor.cardtype,
                          value: vendor.cardtype,
                        }}
                        onChange={(e) => {
                          setVendor({ ...vendor, cardtype: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <Typography>
                      Expire At<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item md={6} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Selects
                            maxMenuHeight={300}
                            options={monthsOption}
                            placeholder="Month"
                            id="select7"
                            value={{
                              label: vendor.cardmonth,
                              value: vendor.cardmonth,
                            }}
                            onChange={(e) => {
                              setVendor({ ...vendor, cardmonth: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={6} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Selects
                            maxMenuHeight={300}
                            options={yearsOption}
                            placeholder="Year"
                            value={{
                              label: vendor.cardyear,
                              value: vendor.cardyear,
                            }}
                            id="select8"
                            onChange={(e) => {
                              setVendor({ ...vendor, cardyear: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Security Code<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="number"
                        value={vendor.cardsecuritycode}
                        sx={userStyle.input}
                        placeholder="Please Enter Security Code"
                        onChange={(e) => {
                          setVendor({
                            ...vendor,
                            cardsecuritycode: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                    &nbsp; &emsp;
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={(e) => deleteTodo("Card")}
                      sx={{
                        height: "30px",
                        minWidth: "30px",
                        marginTop: "28px",
                        padding: "6px 10px",
                      }}
                    >
                      <AiOutlineClose />
                    </Button>
                    {/* </Grid> */}
                  </Grid>
                </>
              )}
              <br />
              {modeofpay.includes("Cheque") && (
                <>
                  {/* <Grid container spacing={2}> */}
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Cheque Details
                    </Typography>
                  </Grid>
                  {/* </Grid> */}
                  <br />
                  {/* <Grid container spacing={2}> */}
                  <Grid item md={4} xs={12} sm={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Cheque Number<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        value={vendor.chequenumber}
                        placeholder="Please Enter Cheque Number"
                        onChange={(e) => {
                          const inputvalue = e.target.value;
                          if (/^[a-zA-Z0-9]*$/.test(inputvalue)) {
                            setVendor({
                              ...vendor,
                              chequenumber: inputvalue,
                            });
                          }
                        }}
                      />
                    </FormControl>
                    &nbsp; &emsp;
                    <Button
                      variant="contained"
                      color="error"
                      type="button"
                      onClick={(e) => deleteTodo("Cheque")}
                      sx={{
                        height: "30px",
                        minWidth: "30px",
                        marginTop: "28px",
                        padding: "6px 10px",
                      }}
                    >
                      <AiOutlineClose />
                    </Button>
                  </Grid>
                  {/* </Grid> */}
                </>
              )}
            </Grid>
            <br /> <br /> <br />
            <Grid
              item md={12} sm={12} xs={12}


            >
              <Button
                onClick={handleSubmit}
                // disabled={isBtn}
                sx={buttonStyles.buttonsubmit}
                loadingPosition="end"
                variant="contained"
              >
                Submit
              </Button>
              &nbsp;
              &nbsp;
              <Button sx={buttonStyles.btncancel}
                onClick={handleCloseview}
              >
                Cancel
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* Amount Mismatch Alert Dialog */}
      <Box>
        <Dialog
          open={isErrorOpenAmount}
          onClose={handleCloseerrAmount}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{
              width: "350px",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <Typography variant="h6" style={{ color: "red" }}>
              {
                "Are you sure? Paid Amount is less than Total Bill Amount.Do you want to save?"
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={buttonStyles.btncancel}
              onClick={handleCloseerrAmount}
            >
              Cancel
            </Button>
            &nbsp;
            <Button
              variant="contained"
              style={{
                padding: "7px 13px",
                color: "white",
                background: "rgb(25, 118, 210)",
              }}
              onClick={() => {
                sendRequestPaidRequest(paidamountdue, balanceamountCal);
              }}
            >
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={openviewLog} onClose={handleCloseviewLog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth={true}
          sx={{ marginTop: "80px" }}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {" "}
                <b>Payment Due Reminder Log List</b>
              </Typography>
              <Grid item md={6} sm={12} xs={12}>
                {paymentdueremainderlog && paymentdueremainderlog.length > 0 ? (
                  <PaymentDueRemainderLogList
                    ExistingVisitors={paymentdueremainderlog}
                    handleCloseModEdit={handleCloseviewLog}
                  />) : (
                  <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: "flex", justifyContent: "center" }}>
                    There is no Due Reminder
                  </Typography>
                )}
              </Grid>
              <br />
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "15px",
                  }}
                >
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseviewLog}>
                    Back
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      <Dialog
        open={openviewalertvendor}
        onClose={handleClickOpenviewalertvendor}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
      >
        <AddExpensePopup
          setVendorAuto={setVendorAuto}
          handleCloseviewalertvendor={handleCloseviewalertvendor}
          expenseCatePop={expenseCatePop}
          expenseSubCatePop={expenseSubCatePop}
          expenseDatePop={expenseDatePop}
          reminderId={reminderId}
        />
      </Dialog>

      <Dialog
        open={openviewalertExpEdit}
        onClose={handleClickOpenviewalertExp}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
      >
        <EditExpensePopup
          setExpenseEditAuto={setExpenseEditAuto}
          handleCloseviewalertExp={handleCloseviewalertExp}
          expenseEditId={expenseEditId}
        />
      </Dialog>

      {/* PRINT PDF EXCEL CSV */}
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={documentsList ?? []}
        filename={"Payment Due Reminder Log"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />
      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
    </Box>
  );
}
export default PaymentDueReminderLog;
