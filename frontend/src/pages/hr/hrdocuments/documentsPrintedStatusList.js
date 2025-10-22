import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Typography, OutlinedInput, TableBody, TableRow, TableCell, Select, Paper, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Grid, Table, TableHead, TableContainer, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton } from "@mui/material";
import { userStyle, colourStyles } from "../../../pageStyle";
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from "react-icons/fa";
import "jspdf-autotable";
import html2pdf from "html2pdf.js";
import Selects from "react-select";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { StyledTableRow, StyledTableCell } from "../../../components/Table";
import LoadingButton from "@mui/lab/LoadingButton";
import { MultiSelect } from "react-multi-select-component";
import 'react-quill/dist/quill.snow.css';
import { SERVICE } from "../../../services/Baseservice";
import { handleApiError } from "../../../components/Errorhandling";
import { BASE_URL } from "../../../services/Authservice";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import moment from "moment-timezone";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import { AuthContext } from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { saveAs } from "file-saver";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import CircularProgress from '@mui/material/CircularProgress';
import PageHeading from "../../../components/PageHeading";
import AlertDialog from "../../../components/Alert";
import ExportData from "../../../components/ExportData";
import InfoPopup from "../../../components/InfoPopup.js";
import MessageAlert from "../../../components/MessageAlert";
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import domtoimage from 'dom-to-image';
import Backdrop from '@mui/material/Backdrop';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';

const Loader = ({ loading, message }) => {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#edf1f7' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#edf1f7' }}>
          {message}
        </Typography>
      </div>
    </Backdrop>
  );
};

function DocumentsPrintedStatusList() {
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

  const marginValues = {
    normal: [96, 96, 96, 96],
    narrow: [48, 48, 48, 48],
    moderate: [96, 72, 96, 72],
    wide: [96, 192, 96, 192],
    mirrored: [96, 120, 96, 96],
    office2003: [96, 120, 96, 120]
  };
  const pxToMm = (px) => px * 0.264583;
  const convertPxArrayToMm = (arr) => arr.map(pxToMm);
  const getAdjustedMargin = (selectedMargin, headImage, footImage) => {
    const base = marginValues[selectedMargin] || marginValues["narrow"];
    let [top, right, bottom, left] = base;
    const footerReservedSpace = 60;
    top += selectedMargin === 'narrow' ? 80 : 35; // increase space for header image
    bottom += selectedMargin === 'narrow' ? 80 : 35; // increase space for footer image

    return convertPxArrayToMm([top, right, (bottom + footerReservedSpace), left]);
  };

  const getPageDimensionsTable = (pagesize, pageorientation) => {
    const dimensions = {
      A2: { portrait: [420, 594], landscape: [594, 420] },
      A3: { portrait: [297, 420], landscape: [420, 297] },
      A4: { portrait: [210, 297], landscape: [297, 210] },
      A5: { portrait: [148, 210], landscape: [210, 148] },
      Letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
      Legal: { portrait: [215.9, 355.6], landscape: [355.6, 215.9] },
      Tabloid: { portrait: [279.4, 431.8], landscape: [431.8, 279.4] },
      Executive: { portrait: [184.1, 266.7], landscape: [266.7, 184.1] },
      B4: { portrait: [250, 353], landscape: [353, 250] },
      B5: { portrait: [176, 250], landscape: [250, 176] },
      Statement: { portrait: [139.7, 215.9], landscape: [215.9, 139.7] },
      Office2003: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] } // same as Letter
    };

    return dimensions[pagesize]?.[pageorientation] || [210, 297]; // default A4
  };
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [UserPrintedInfoList, setUserPrintedInfoList] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName,
    setPageName,
    buttonStyles, isAssignBranch, allTeam, allUsersData } = useContext(UserRoleAccessContext);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [searchedString, setSearchedString] = useState("");
  const [templateName, setTemplateName] = useState("Please Select Template");
  const [employeeModeValue, setEmployeeModeValue] = useState("Please Select Employee Mode");
  const [templateValues, setTemplateValues] = useState([]);
  const [employeeModeOptions, setEmployeeModeOptions] = useState([]);
  const [employeenames, setEmployeenames] = useState([]);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");

  const tableHeadCellStyle = { padding: "5px 10px", fontSize: "14px", boxShadow: "none", width: "max-content" };
  const tableBodyCellStyle = { padding: "5px 10px", width: "max-content" };

  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Please Wait...!');
  const [HeaderOptionsButton, setHeaderOptionsButton] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  const [filterState, setFilterState] = useState({
    type: "Please Select Type",
    employeestatus: "Please Select Employee Status",
  });
  const TypeOptions = [
    { label: "Department", value: "Department" },
    { label: "Branch", value: "Branch" },
    { label: "Unit", value: "Unit" },
    { label: "Team", value: "Team" },
  ];
  const TemplateDropdowns = async (branches) => {
    console.log(branches, "branches")
    const accessbranchs = accessbranch
      ? accessbranch.map((data) => ({
        branch: data.branch,
        company: data.company,
      }))
      : [];
    setPageName(!pageName);
    try {
      let res = await axios.post(
        SERVICE.EMPLOYEE_TEMPLATECREATION,
        {
          assignbranch: accessbranchs,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      const tempValues = res?.data?.templatecreation?.filter(data => branches?.includes(data?.branch));
      const tempOptions = tempValues?.length > 0 ? tempValues : [];
      setTemplateValues(
        tempOptions?.map((data) => ({
          ...data,
          label: `${data.name}--(${data.company}--${data.branch})`,
          value: `${data.name}--(${data.company}--${data.branch})`,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const handleEmployeeModeOptions = (e) => {
    const employeeModeOpt =
      e?.employeemode?.length > 0
        ? [
          ...e?.employeemode?.map((data) => ({
            label: data,
            value: data,
          })),
          { label: 'Manual', value: 'Manual' },
        ]
        : [{ label: 'Manual', value: 'Manual' }];
    setEmployeeModeOptions(employeeModeOpt);
  };

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
          data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.mainpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
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
        company: data.company,
        unit: data.unit,
      }));
  //MULTISELECT ONCHANGE START
  //company multiselect
  const [selectedOptionsTemplate, setSelectedOptionsTemplate] = useState([]);
  let [valueTemplate, setValueTemplate] = useState([]);
  const handleTemplateChange = (options) => {
    setValueTemplate(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsTemplate(options);
    setSelectedOptionsCompany([]);
    setValueCompanyCat([])
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };
  const customValueRendererTemplate = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Template";
  };

  const [selectedOptionsStatus, setSelectedOptionsStatus] = useState([]);
  let [valueStatus, setValueStatus] = useState([]);
  const handleStatusChange = (options) => {
    setValueStatus(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsStatus(options);

  };
  const customValueRendererStatus = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Status";
  };


  //company multiselect
  const [selectedOptionsCompanyTemplate, setSelectedOptionsCompanyTemplate] = useState([]);
  let [valueCompanyCatTemplate, setValueCompanyCatTemplate] = useState([]);
  const handleCompanyChangeTemplate = (options) => {
    setValueCompanyCatTemplate(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyTemplate(options);
    setValueBranchCatTemplate([]);
    setSelectedOptionsBranchTemplate([]);
    setEmployeeModeOptions([]);
    setTemplateValues([])
    setEmployeeModeValue("Please Select Employee Mode")
    setTemplateName("Please Select Template")
  };
  const customValueRendererCompanyTemplate = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };
  //branch multiselect
  const [selectedOptionsBranchTemplate, setSelectedOptionsBranchTemplate] = useState([]);
  let [valueBranchCatTemplate, setValueBranchCatTemplate] = useState([]);
  const handleBranchChangeTemplate = (options) => {
    setValueBranchCatTemplate(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchTemplate(options);
    const branches = options?.map(data => data?.value);
    TemplateDropdowns(branches);
    setEmployeeModeValue("Please Select Employee Mode");
    setTemplateName("Please Select Template");
    setEmployeeModeOptions([]);
  };
  const customValueRendererBranchTemplate = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length
      ? valueBranchCat.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };






  //company multiselect
  const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);
  let [valueCompanyCat, setValueCompanyCat] = useState([]);
  const handleCompanyChange = (options) => {
    setValueCompanyCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompany(options);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };
  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };
  //branch multiselect
  const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);
  let [valueBranchCat, setValueBranchCat] = useState([]);
  const handleBranchChange = (options) => {
    setValueBranchCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranch(options);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };
  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length
      ? valueBranchCat.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };

  //unit multiselect
  const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
  let [valueUnitCat, setValueUnitCat] = useState([]);

  const handleUnitChange = (options) => {
    setValueUnitCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnit(options);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererUnit = (valueUnitCat, _categoryname) => {
    return valueUnitCat?.length
      ? valueUnitCat.map(({ label }) => label)?.join(", ")
      : "Please Select Unit";
  };

  //team multiselect
  const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);
  let [valueTeamCat, setValueTeamCat] = useState([]);

  const handleTeamChange = (options) => {
    setValueTeamCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    const values = options.map(a => a.value)
    fetchEmployeeDropdownNames(values, employeeModeValue, "Team");

    setSelectedOptionsTeam(options);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length
      ? valueTeamCat.map(({ label }) => label)?.join(", ")
      : "Please Select Team";
  };

  //department multiselect
  const [selectedOptionsDepartment, setSelectedOptionsDepartment] = useState(
    []
  );
  let [valueDepartmentCat, setValueDepartmentCat] = useState([]);

  const handleDepartmentChange = (options) => {
    setValueDepartmentCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    const values = options.map(a => a.value)
    fetchEmployeeDropdownNames(values, employeeModeValue, "Department");
    setSelectedOptionsDepartment(options);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
    setSelectedOptionsCompany([]);
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
  };

  const customValueRendererDepartment = (valueDepartmentCat, _categoryname) => {
    return valueDepartmentCat?.length
      ? valueDepartmentCat.map(({ label }) => label)?.join(", ")
      : "Please Select Department";
  };


  const fetchEmployeeDropdownNames = async (e, mode, dropdown) => {
    setPageName(!pageName);
    try {
      let res_type = await axios.post(SERVICE.USERNAMES_EMP_DOCUMENT_PRINTED_LIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: valueCompanyCat,
        branch: valueBranchCat,
        unit: valueUnitCat,
        team: dropdown === "Team" ? e : [],
        department: dropdown === "Department" ? e : [],
        resonablestatus: mode,
        pagevalue: dropdown
      });

      let usersEmployeemode = res_type.data.userteamgroup?.length > 0 ? res_type.data.userteamgroup : [];
      setEmployeenames(
        usersEmployeemode?.map((data) => ({
          // ...data,
          label: data.companyname,
          value: data.companyname,
          company: data.company,
          branch: data.branch,
          unit: data.unit,
          username: data.username,
          team: data.team,
          department: data.department,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //employee multiselect
  const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
  let [valueEmployeeCat, setValueEmployeeCat] = useState([]);

  const handleEmployeeChange = (options) => {
    setValueEmployeeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsEmployee(options);
  };

  const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
    return valueEmployeeCat?.length
      ? valueEmployeeCat.map(({ label }) => label)?.join(", ")
      : "Please Select Employee";
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const fetchDepartments = async () => {
    //  setPageName(!pageName);
    try {
      let req = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDepartmentOptions(
        req?.data?.departmentdetails?.map((data) => ({
          label: data?.deptname,
          value: data?.deptname,
        }))
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

  const [filterLoader, setFilterLoader] = useState(false);
  const handleFilter = () => {

    if (selectedOptionsCompanyTemplate?.length === 0) {
      setPopupContentMalert("Please Select Template Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (selectedOptionsBranchTemplate?.length === 0) {
      setPopupContentMalert("Please Select Template Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (
      templateName === "Please Select Template" ||
      templateName === ""
    ) {
      setPopupContentMalert("Please Select Template!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (employeeModeValue === "Please Select Employee Mode" || employeeModeValue === "") {
      setPopupContentMalert("Please Select Employee Mode!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (selectedOptionsDepartment?.length === 0 && selectedOptionsCompany?.length === 0) {
      setPopupContentMalert("Please Select Department or Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (selectedOptionsDepartment?.length === 0 && selectedOptionsBranch?.length === 0) {
    //   setPopupContentMalert("Please Select Branch!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    // else if (selectedOptionsDepartment?.length === 0 && selectedOptionsUnit?.length === 0) {
    //   setPopupContentMalert("Please Select Unit!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    // else if (selectedOptionsDepartment?.length === 0 && selectedOptionsTeam?.length === 0) {
    //   setPopupContentMalert("Please Select Team!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    // else if (selectedOptionsEmployee?.length === 0) {
    //   setPopupContentMalert("Please Select Employee Names!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    else {
      fetchBrandMaster();
    }
  };

  //MULTISELECT ONCHANGE END
  const handleClearFilter = () => {
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setTemplateValues([])
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setValueStatus([]);
    setValueTemplate([]);
    setSelectedOptionsStatus([]);
    setSelectedOptionsTemplate([]);
    setSelectedOptionsEmployee([]);
    // setEmployeeOptions([]);
    setTemplateCreationArrayCreate([]);
    setValueBranchCatTemplate([]);
    setSelectedOptionsBranchTemplate([]);
    setEmployeeModeOptions([]);
    setValueCompanyCatTemplate([]);
    setSelectedOptionsCompanyTemplate([]);
    setEmployeeModeValue("Please Select Employee Mode")
    setTemplateName("Please Select Template")
    setFilterState({
      type: "Individual",
      employeestatus: "Please Select Employee Status",
    });

    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };


  // //auto select all dropdowns
  // const [allAssignCompany, setAllAssignCompany] = useState([]);
  // const [allAssignBranch, setAllAssignBranch] = useState([]);
  // const [allAssignUnit, setAllAssignUnit] = useState([]);
  // const handleAutoSelect = async () => {
  //   setPageName(!pageName);
  //   try {
  //     let selectedValues = accessbranch
  //       ?.map((data) => ({
  //         company: data.company,
  //         branch: data.branch,
  //         unit: data.unit,
  //       }))
  //       .filter(
  //         (value, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) =>
  //               t.company === value.company &&
  //               t.branch === value.branch &&
  //               t.unit === value.unit
  //           )
  //       );
  //     let selectedCompany = selectedValues
  //       ?.filter(
  //         (value, index, self) =>
  //           index === self.findIndex((t) => t.company === value.company)
  //       )
  //       .map((a, index) => {
  //         return a.company;
  //       });

  //     let mappedCompany = selectedValues
  //       ?.filter(
  //         (value, index, self) =>
  //           index === self.findIndex((t) => t.company === value.company)
  //       )
  //       ?.map((data) => ({
  //         label: data?.company,
  //         value: data?.company,
  //       }));

  //     setValueCompanyCat(selectedCompany);
  //     setSelectedOptionsCompany(mappedCompany);

  //     let selectedBranch = selectedValues
  //       .filter(
  //         (value, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) => t.company === value.company && t.branch === value.branch
  //           )
  //       )
  //       .map((a, index) => {
  //         return a.branch;
  //       });

  //     let mappedBranch = selectedValues
  //       .filter(
  //         (value, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) => t.company === value.company && t.branch === value.branch
  //           )
  //       )
  //       ?.map((data) => ({
  //         label: data?.branch,
  //         value: data?.branch,
  //       }));

  //     setValueBranchCat(selectedBranch);
  //     setSelectedOptionsBranch(mappedBranch);

  //     let selectedUnit = selectedValues
  //       .filter(
  //         (value, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) =>
  //               t.company === value.company &&
  //               t.branch === value.branch &&
  //               t.unit === value.unit
  //           )
  //       )
  //       .map((a, index) => {
  //         return a.unit;
  //       });

  //     let mappedUnit = selectedValues
  //       .filter(
  //         (value, index, self) =>
  //           index ===
  //           self.findIndex(
  //             (t) =>
  //               t.company === value.company &&
  //               t.branch === value.branch &&
  //               t.unit === value.unit
  //           )
  //       )
  //       ?.map((data) => ({
  //         label: data?.unit,
  //         value: data?.unit,
  //       }));

  //     setValueUnitCat(selectedUnit);
  //     setSelectedOptionsUnit(mappedUnit);

  //     let mappedTeam = allTeam
  //       ?.filter(
  //         (u) =>
  //           selectedCompany?.includes(u.company) &&
  //           selectedBranch?.includes(u.branch) &&
  //           selectedUnit?.includes(u.unit)
  //       )
  //       .map((u) => ({
  //         label: u.teamname,
  //         value: u.teamname,
  //       }));

  //     let selectedTeam = allTeam
  //       ?.filter(
  //         (u) =>
  //           selectedCompany?.includes(u.company) &&
  //           selectedBranch?.includes(u.branch) &&
  //           selectedUnit?.includes(u.unit)
  //       )
  //       .map((u) => u.teamname);

  //     let mappedemployees = allUsersData
  //       ?.filter(
  //         (u) =>
  //           selectedCompany?.includes(u.company) &&
  //           selectedBranch?.includes(u.branch) &&
  //           selectedUnit?.includes(u.unit) &&
  //           selectedTeam?.includes(u.team)
  //         //  &&
  //         //  u.workmode !== "Internship"
  //       )
  //       .map((u) => ({
  //         label: u.companyname,
  //         value: u.companyname,
  //       }));

  //     let employees = allUsersData
  //       ?.filter(
  //         (u) =>
  //           selectedCompany?.includes(u.company) &&
  //           selectedBranch?.includes(u.branch) &&
  //           selectedUnit?.includes(u.unit) &&
  //           selectedTeam?.includes(u.team)
  //         //  &&
  //         //  u.workmode !== "Internship"
  //       )
  //       .map((u) => u.companyname);
  //     setValueTeamCat(selectedTeam);
  //     setSelectedOptionsTeam(mappedTeam);
  //     setAllAssignCompany(selectedCompany);

  //     setAllAssignBranch(selectedBranch);

  //     setAllAssignUnit(selectedUnit);

  //     setValueEmployeeCat(employees);
  //     setSelectedOptionsEmployee(mappedemployees);
  //   } catch (err) {
  //     handleApiError(
  //       err,
  //       setPopupContentMalert,
  //       setPopupSeverityMalert,
  //       handleClickOpenPopupMalert
  //     );
  //   }
  // };

  // useEffect(() => {
  //   handleAutoSelect();
  // }, [isAssignBranch]);


  let exportColumnNames = [
    'Document Need',
    'Date ',
    'Reference No',
    'Template No',
    'Template',
    'EmployeeMode',
    'Department',
    'Company',
    'Branch',
    'Unit',
    'Team',
    'Person',
    'Document Need',
    'Approval Status',
    'Printed Count',
    'Printing Status',
    'Issued Person Details',
    'Issuing Authority'
  ];
  let exportRowValues = [
    'documentneed',
    'date',
    'referenceno',
    'templateno',
    'template',
    'employeemode',
    'department',
    'company',
    'branch',
    'unit',
    'team',
    'person',
    'documentneed',
    'approval',
    'printedcount',
    'printingstatus',
    'issuedpersondetails',
    'issuingauthority'
  ];


  let today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + "-" + mm + "-" + dd;
  //useStates
  const [date, setDate] = useState(formattedDate);
  const gridRef = useRef(null);
  let newval = "DP0001";
  // let newvalues = "DOC0001";
  const [autoId, setAutoId] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [documentPreparationEdit, setDocumentPreparationEdit] = useState({ name: "" });
  const [templateCreationArrayCreate, setTemplateCreationArrayCreate] = useState([]);

  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [btnload, setBtnLoad] = useState(false);
  const [btnloadSave, setBtnLoadSave] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openview, setOpenview] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cateCodeValue, setCatCodeValue] = useState([]);


  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedData, setCopiedData] = useState("");
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [overallExcelDatas, setOverallExcelDatas] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [fileFormat, setFormat] = useState('')
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = fileFormat === "xl" ? '.xlsx' : '.csv';
  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };


  function encryptString(str) {
    if (str) {
      const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const shift = 3; // You can adjust the shift value as per your requirement
      let encrypted = "";
      for (let i = 0; i < str.length; i++) {
        let charIndex = characters.indexOf(str[i]);
        if (charIndex === -1) {
          // If character is not found, add it directly to the encrypted string
          encrypted += str[i];
        } else {
          // Shift the character index
          charIndex = (charIndex + shift) % characters.length;
          encrypted += characters[charIndex];
        }
      }
      return encrypted;
    }
    else {
      return ""
    }

  }

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    date: true,
    email: true,
    referenceno: true,
    templateno: true,
    template: true,
    employeemode: true,
    department: true,
    company: true,
    printingstatus: true,
    approval: true,
    documentneed: true,
    branch: true,
    unit: true,
    team: true,
    person: true,
    head: true,
    foot: true,
    headvaluetext: true,
    document: true,
    issuedpersondetails: true,
    issuingauthority: true,
    actions: true,
    printoptions: true,
    printedcount: true,
    updatedby: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);


  useEffect(() => {
    addSerialNumber(templateCreationArrayCreate);
  }, [templateCreationArrayCreate]);


  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);


  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setBtnLoad(false)
    setBtnLoadSave(false)
  };
  // view model
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  // info model
  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };
  //Delete model
  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };
  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  // Manage Columns
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("");
  };
  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

  const handleClickOpencheckbox = () => {
    setIsDeleteOpencheckbox(true);
  };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const handleClickOpenalert = () => {
    setIsHandleChange(true);
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      setIsDeleteOpencheckbox(true);
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };


  //get all brand master name.
  const fetchBrandMaster = async () => {
    setLoader(true);
    setFilterLoader(true)
    const queryParams = {
      assignbranch: accessbranch,
      template: templateName,
      employeemode: employeeModeValue,
      documentneed: valueStatus,
      company: valueCompanyCat,
      branch: valueBranchCat,
      unit: valueUnitCat,
      team: valueTeamCat,
      department: valueDepartmentCat,
      person: valueEmployeeCat,

    };
    setPageName(!pageName);
    try {
      let res_freq = await axios.post(`${SERVICE.ACCESIBLEBRANCHALL_DOCUMENTPREPARATION_FILTER}`, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAutoId(res_freq?.data?.documentPreparation);
      console.log(res_freq?.data, 'Data Objects')
      const answer = res_freq?.data?.documentPreparation?.length > 0 ? res_freq?.data?.documentPreparation?.map((item, index) => ({
        serialNumber: index + 1,
        date: moment(item.date).format("DD-MM-YYYY"),
        id: item._id,
        referenceno: item.referenceno,
        templateno: item.templateno,
        printedcount: item.printedcount,
        template: item.template,
        mail: item.mail,
        email: item.email,
        printingstatus: item.printingstatus,
        employeemode: item.employeemode,
        department: item.department === "Please Select Department" ? "" : item.department,
        company: item.company === "Please Select Company" ? "" : item.company,
        branch: item.branch === "Please Select Branch" ? "" : item.branch,
        unit: item.unit === "Please Select Unit" ? "" : item.unit,
        team: item.team === "Please Select Team" ? "" : item.team,
        person: item.person,
        issuedpersondetails: item.issuedpersondetails,
        issuingauthority: item.issuingauthority,
        approval: item.approval,
        documentneed: item.documentneed,
        updatedby: item.updatedby,
        approvedfilename: item.approvedfilename,
      })) : [];
      setTemplateCreationArrayCreate(answer)
      setFilterLoader(false)
      setLoader(false);
    } catch (err) {
      setLoader(false);
      setFilterLoader(false)
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };



  //get single row to edit....
  const getUpdatePrintingStatus = async (e, updatedby) => {
    setPageName(!pageName);
    console.log(updatedby, 'console')
    try {
      let response = await axios.post(SERVICE.FILTER_DOCUMENT_USER_LOGIN, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        person: isUserRoleAccess.companyname,
      });
      if (response?.data?.user) {
        let ans = response?.data?.user?.loginUserStatus?.find(data => data?.status === "Active");
        let res = await axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          printingstatus: "Re-Printed",
          $inc: { printedcount: 1 },
          updatedby: updatedby ? [...updatedby, {
            name: isUserRoleAccess.companyname,
            localip: ans ? ans?.localip : "",
            date: new Date(serverTime),
          }] : []
        });
      }

    } catch (err) { console.log(err, 'err'); handleApiError(err, setShowAlert, handleClickOpenerr); }
  };



  //frequency master name updateby edit page...
  let updateby = documentPreparationEdit?.updatedby;
  let addedby = documentPreparationEdit?.addedby;




  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Employee Printed Documents List.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };
  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Document Preparation",
    pageStyle: "print",
  });

  //serial no for listing items
  const addSerialNumber = (data) => {

    setItems(data);
  };
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
    setPage(1);
  };


  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
  });

  const filteredData = filteredDatas?.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDatas?.length / pageSize);
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
  const pageNumbers = [];
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const [personId, setPersonId] = useState('');
  // letter headd options
  const [buttonLoadingPreview, setButtonLoadingPreview] = useState(false);
  const [head, setHeader] = useState("");
  const [foot, setfooter] = useState("");
  const HeaderDropDowns = [{ label: "With Letter Head", value: "With Letter Head" }, { label: "Without Letter Head", value: "Without Letter Head" }];
  const WithHeaderOptions = [{ value: "With Head content", label: "With Head content" }, { value: "With Footer content", label: "With Footer content" }]
  const [isOpenLetterHeadPopup, setIsLetterHeadPopup] = useState(false)
  const [PageMailOpen, setPageMailOpen] = useState(false)
  const [PageUpdateOpen, setPageUpdateOpen] = useState(false)
  const [headerOptions, setHeaderOptions] = useState("Please Select Print Options")
  const [pagePopeOpen, setPagePopUpOpen] = useState("")
  const [DataTableId, setDataTableId] = useState("")
  const [selectedHeadOpt, setSelectedHeadOpt] = useState([]);
  const [headvalue, setHeadValue] = useState([]);
  const [emailValuePage, setEmailValuePage] = useState({});
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };
  const handleHeadChange = (options) => {
    let value = options.map((a) => {
      return a.value;
    })
    setHeadValue(value)
    if (!["Preview Manual", "Print Manual"]?.includes(pagePopeOpen)) {
      if (value?.length === 1 && value?.includes("With Head content")) {
        setHeader(personId?.letterheadcontentheader[0]?.preview)
      }
      else if (value?.length === 1 && value?.includes("With Footer content")) {
        setfooter(personId?.letterheadcontentfooter[0]?.preview)
      }
      else if (value?.length > 1) {
        setHeader(personId?.letterheadcontentheader[0]?.preview)
        setfooter(personId?.letterheadcontentfooter[0]?.preview)
      }
      else {
        setHeader("")
        setfooter("")
      }
    }



    setSelectedHeadOpt(options)
  }
  const customValueRenderHeadFrom = (valueCate) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(", ") : "Please Select Letter Head";
  };
  const handleClickOpenLetterHeader = (page) => {
    setPagePopUpOpen(page)
    setIsLetterHeadPopup(true);
  }

  const handleClickCloseLetterHead = () => {
    setIsLetterHeadPopup(false);
    setHeaderOptions("Please Select Print Options")
    setHeadValue([]);
    setPagePopUpOpen("")
    setHeader("");
    setfooter("");
    setSelectedHeadOpt([]);
  }


  const handleClickOpenMailOpen = (page) => {
    setPageMailOpen(true);
  }

  const handleClickCloseMail = () => {
    setPageMailOpen(false);
  }

  const handleClickUpdateOpen = () => {
    setPageUpdateOpen(true);
  }

  const handleClickUpdateClose = () => {
    setPageUpdateOpen(false);
  }


  const getCode = async (e, pagename) => {
    setPageName(!pageName)
    const NewDatetime = await getCurrentServerTime();

    console.log(pagename, 'pagename')
    try {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: e?.company,
        branch: e?.branch,
      });
      if (res?.data?.templatecontrolpanel) {
        const ans = res?.data?.templatecontrolpanel ?
          res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : "";
        setPersonId(ans);
        handleClickOpenLetterHeader(pagename);
        setDataTableId(e?.id);
      }

    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert)
    }
  };

  const getInfoStatus = async (e) => {
    setPageName(!pageName)
    try {

      handleClickUpdateOpen();
      setUserPrintedInfoList(e)
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert)
    }
  };
  const extractEmailFormat = async (name, id, email, pagename) => {
    const suser = await axios.post(SERVICE.USER_NAME_SEARCH, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      name: name
    });

    const userFind = suser?.data?.users?.length > 0 ? suser?.data?.users[0] : "none";
    const tempcontpanel = await axios.post(SERVICE.TEMPLATECONTROLPANEL_USERFIND, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      user: userFind
    });
    let convert = tempcontpanel?.data?.result[0]?.emailformat;
    let fromemail = tempcontpanel?.data?.result[0]?.fromemail;
    let ccemail = tempcontpanel?.data?.result[0]?.ccemail;
    let bccemail = tempcontpanel?.data?.result[0]?.bccemail;

    setPersonId(tempcontpanel?.data?.result[0]);
    if (pagename === "Employee") {
      setEmailValuePage({ id, convert, fromemail, ccemail, bccemail, email, pagename })
      handleClickOpenMailOpen();
      // await fetchEmailForUser(id, convert, fromemail, ccemail, bccemail, email, pagename)

    } else {
      handleClickOpenLetterHeader('Email');
      setEmailValuePage({ id, convert, fromemail, ccemail, bccemail, email, pagename })
    }


  }

  const handleSubmit = (e) => {
    e.preventDefault();

    fetchEmailForUser(emailValuePage?.id, emailValuePage?.convert, emailValuePage?.fromemail, emailValuePage?.ccemail, emailValuePage?.bccemail, emailValuePage?.pagename)
    handleClickCloseMail();

  }
  const getViewFile = async (name, details) => {
    const fileUrl = `${BASE_URL}/uploadsDocuments/${name}`;
    window.open(fileUrl, '_blank');
    console.log(name, 'id')
    await getUpdatePrintingStatus(details?.id, details?.updatedby)
  }

  const downloadFile = async (filename, details) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/uploadsDocuments/${filename}`,
        {
          responseType: "blob",
        }
      );
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      await getUpdatePrintingStatus(details?.id, details?.updatedby)
    } catch (error) {
      console.error("Error downloading the file", error);
    }
  };


  // Print Documents
  const downloadPdfTesdtTable = async (e, pagename) => {
    const NewDatetime = await getCurrentServerTime();
    if (pagename !== "Employee" && headerOptions === "Please Select Print Options") {
      setButtonLoadingPreview(false);
      setPopupContentMalert("Please Select Print Options!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (pagename !== "Employee" && headerOptions === "With Letter Head" && selectedHeadOpt?.length < 1) {
      setPopupContentMalert("Please Select With Letter Head!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else {
      setHeaderOptionsButton(true)
      // Create a new div element to hold the Quill content
      let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let qrCodeInfoDetails = [];
      if (response.data.sdocumentPreparation) {
        let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: response.data.sdocumentPreparation?.company,
          branch: response.data.sdocumentPreparation?.branch,
        });
        if (res?.data?.templatecontrolpanel) {
          const ans = res?.data?.templatecontrolpanel ?
            res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : "";
          const qrInfoDetails = ans?.qrInfo?.length > 0 ? ans?.qrInfo : []
          console.log(qrInfoDetails, 'qrInfoDetails')
          qrCodeInfoDetails = qrInfoDetails?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
            .replaceAll('$C:DATE$', date)}`)
        }
      }
      await getUpdatePrintingStatus(e, response.data.sdocumentPreparation?.updatedby)
      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = response.data.sdocumentPreparation.document?.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);;

      let headerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.head : head;
      let footerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.foot : foot;
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
        console.log(contentEndY, "contentEndY")
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (headerDisp !== '') {
            doc.addImage(headerDisp, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }

          const imgWidth = pageWidth * 0.50;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (footerDisp !== "") {
            doc.addImage(footerDisp, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
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
          if (response?.data?.sdocumentPreparation?.pagenumberneed === "All Pages") {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (response?.data?.sdocumentPreparation?.pagenumberneed === "End Page" && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

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
                `3. For questions, contact us at ${fromEmail}.`
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
                `3. For questions, contact us at ${fromEmail}.`
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

      const hasHeaderImage = headerDisp !== ""; // assuming head is a base64 src or image URL
      const hasFooterImage = footerDisp !== "";

      const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before
      // Convert the HTML content to PDF
      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: pdfDimensions,
            orientation: response.data.sdocumentPreparation?.orientationQuill
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).toPdf().get('pdf').then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
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
            const qrImg = new Image();
            qrImg.src = response.data.sdocumentPreparation?.qrcode; // QR code image URL
            if (response.data.sdocumentPreparation?.qrCodeNeed) {
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                // Add page numbers and watermark to each page
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                // Save the PDF
                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(pdfUrl);
                // pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
                handleClickCloseLetterHead();
                setHeaderOptionsButton(false);
                fetchBrandMaster();
              };
            }
            else {
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, "");
              // Save the PDF
              const pdfBlob = pdf.output('blob');
              const pdfUrl = URL.createObjectURL(pdfBlob);
              const printWindow = window.open(pdfUrl);
              // pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
              handleClickCloseLetterHead();
              setHeaderOptionsButton(false);
              fetchBrandMaster();
            }

          };
        });

    }
  };



  const downloadPdfPrintTable = async (e, pagename) => {
    const NewDatetime = await getCurrentServerTime();
    if (pagename !== "Employee" && headerOptions === "Please Select Print Options") {
      setButtonLoadingPreview(false);
      setPopupContentMalert("Please Select Print Options!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (pagename !== "Employee" && headerOptions === "With Letter Head" && selectedHeadOpt?.length < 1) {
      setPopupContentMalert("Please Select With Letter Head!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else {
      setHeaderOptionsButton(true)
      // Create a new div element to hold the Quill content
      let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
            let qrCodeInfoDetails = [];
      if (response.data.sdocumentPreparation) {
        let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: response.data.sdocumentPreparation?.company,
          branch: response.data.sdocumentPreparation?.branch,
        });
        if (res?.data?.templatecontrolpanel) {
          const ans = res?.data?.templatecontrolpanel ?
            res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : "";
          const qrInfoDetails = ans?.qrInfo?.length > 0 ? ans?.qrInfo : []
          console.log(qrInfoDetails, 'qrInfoDetails')
          qrCodeInfoDetails = qrInfoDetails?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
            .replaceAll('$C:DATE$', date)}`)
        }
      }
      await getUpdatePrintingStatus(e, response.data.sdocumentPreparation?.updatedby)
      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = response.data.sdocumentPreparation.document?.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
      let headerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.head : head;
      let footerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.foot : foot;
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

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (headerDisp !== '') {
            doc.addImage(headerDisp, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }
          const imgWidth = pageWidth * 0.50;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (footerDisp !== "") {
            doc.addImage(footerDisp, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
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
          if (response?.data?.sdocumentPreparation?.pagenumberneed === "All Pages") {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (response?.data?.sdocumentPreparation?.pagenumberneed === "End Page" && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

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
                `3. For questions, contact us at ${fromEmail}.`
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
                `3. For questions, contact us at ${fromEmail}.`
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
      const hasHeaderImage = headerDisp !== ""; // assuming head is a base64 src or image URL
      const hasFooterImage = footerDisp !== "";

      const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before
      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: pdfDimensions,
            orientation: response.data.sdocumentPreparation?.orientationQuill
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).toPdf().get('pdf').then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
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
            const qrImg = new Image();
            qrImg.src = response.data.sdocumentPreparation?.qrcode; // QR code image URL
            if (response.data.sdocumentPreparation?.qrCodeNeed) {
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                // Add page numbers and watermark to each page
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                // // Save the PDF
                // const pdfBlob = pdf.output('blob');
                // const pdfUrl = URL.createObjectURL(pdfBlob);
                // const printWindow = window.open(pdfUrl);
                pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
                handleClickCloseLetterHead();
                setHeaderOptionsButton(false);
                fetchBrandMaster();
              };
            }
            else {
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, "");
              // Save the PDF
              // const pdfBlob = pdf.output('blob');
              // const pdfUrl = URL.createObjectURL(pdfBlob);
              // const printWindow = window.open(pdfUrl);
              pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
              handleClickCloseLetterHead();
              setHeaderOptionsButton(false);
              fetchBrandMaster();
            }

          };
        });

    }
  };
  const fetchEmailForUser = async (e, emailformat, fromemail, ccemail, bccemail, pagename) => {
    setLoading(true);
    const NewDatetime = await getCurrentServerTime();
    setLoadingMessage('Document is preparing...');

    let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
          let qrCodeInfoDetails = [];
      if (response.data.sdocumentPreparation) {
        let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: response.data.sdocumentPreparation?.company,
          branch: response.data.sdocumentPreparation?.branch,
        });
        if (res?.data?.templatecontrolpanel) {
          const ans = res?.data?.templatecontrolpanel ?
            res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : "";
          const qrInfoDetails = ans?.qrInfo?.length > 0 ? ans?.qrInfo : []
          console.log(qrInfoDetails, 'qrInfoDetails')
          qrCodeInfoDetails = qrInfoDetails?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
            .replaceAll('$C:DATE$', date)}`)
        }
      }
    if (pagename !== "Employee") {
      handleClickCloseLetterHead();
    }

    const tempElementEmail = document?.createElement("div");
    tempElementEmail.innerHTML = emailformat;
    let textedEmail = tempElementEmail.innerHTML;
    let findMethodEmail = textedEmail
      .replaceAll("$TEMPLATENAME$", response.data.sdocumentPreparation?.template ? response.data.sdocumentPreparation?.template : "")
      .replaceAll("$REFERENCEID$", response.data.sdocumentPreparation?.templateno ? response.data.sdocumentPreparation?.templateno : "")
      .replaceAll("$CANDIDATENAME$", response.data.sdocumentPreparation?.person ? response.data.sdocumentPreparation?.person : "")
      .replaceAll("$COMPANYNAME$", isUserRoleAccess?.companyname ? isUserRoleAccess?.companyname : "")
      .replaceAll("$DESIGNATION$", isUserRoleAccess?.designation ? isUserRoleAccess?.designation : "")
      .replaceAll("$COMPANY$", isUserRoleAccess?.company ? isUserRoleAccess?.company : "");


    const pdfElement = document.createElement("div");
    pdfElement.innerHTML = response.data.sdocumentPreparation.document?.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
    let headerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.head : head;
    let footerDisp = pagename === "Employee" ? response?.data?.sdocumentPreparation?.foot : foot;

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
        const headerImgHeight = pageHeight * 0.09;
        const headerX = 5; // Start from the left
        const headerY = 3.5; // Start from the top
        if (headerDisp !== '') {
          doc.addImage(headerDisp, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
        }
        const imgWidth = pageWidth * 0.50; // 75% of page width
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
        if (footerDisp !== "") {
          doc.addImage(footerDisp, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
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

        if (response?.data?.sdocumentPreparation?.pagenumberneed === "All Pages") {
          const textY = footerY - 3;
          doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
        } else if (response?.data?.sdocumentPreparation?.pagenumberneed === "End Page" && i === totalPages) {
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
              `3. For questions, contact us at ${fromEmail}.`
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
              `3. For questions, contact us at ${fromEmail}.`
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
    const hasHeaderImage = headerDisp !== ""; // assuming head is a base64 src or image URL
    const hasFooterImage = footerDisp !== "";

    const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
    const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before

    return new Promise((resolve, reject) => {

      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: pdfDimensions,
            orientation: response.data.sdocumentPreparation?.orientationQuill
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).toPdf().get('pdf').then(async (pdf) => {
          const img = new Image();
          img.src = response.data.sdocumentPreparation?.watermark;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            const qrImg = new Image();
            qrImg.src = response.data.sdocumentPreparation?.qrcode;
            qrImg.onload = () => {
              const qrCanvas = document.createElement('canvas');
              qrCanvas.width = qrImg.width;
              qrCanvas.height = qrImg.height;
              const qrCtx = qrCanvas.getContext('2d');
              qrCtx.drawImage(qrImg, 0, 0);
              const qrCodeImage = qrCanvas.toDataURL('image/png');

              addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

              // Convert the PDF to a Blob
              const pdfBlob = pdf.output('blob');

              // Create FormData and append the PDF Blob
              const formData = new FormData();
              formData.append('file', pdfBlob, `${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);

              // Convert Blob to base64 string
              const reader = new FileReader();
              reader.readAsDataURL(pdfBlob);
              reader.onloadend = async () => {
                setLoadingMessage('Document is converting to Email format...');
                const base64String = reader.result.split(',')[1]; // Extract base64 string without data:image/jpeg;base64,

                let res_module = await axios.post(SERVICE.DOCUMENT_PREPARATION_MAIL, {
                  document: response?.data?.sdocumentPreparation?.approval === "approved" ? response?.data?.sdocumentPreparation?.approvedfilename : base64String,
                  companyname: response?.data?.sdocumentPreparation?.person,
                  letter: response?.data?.sdocumentPreparation?.template,
                  email: response?.data?.sdocumentPreparation?.email,
                  emailformat: findMethodEmail,
                  fromemail: fromemail,
                  ccemail: ccemail,
                  bccemail: bccemail,
                  tempid: response?.data?.sdocumentPreparation?.templateno,
                  pagename: pagename,
                  approval: response?.data?.sdocumentPreparation?.approval

                }, {
                  headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                  },
                });
                setLoadingMessage('Email is Sending...');
                if (res_module.status === 200) {
                  setLoading(false)
                  NotificationManager.success('Email Sent Successfully 👍', '', 2000);
                } else {
                  setLoading(false)
                }

                resolve(base64String);
              };


            };
          };
          if (response?.data?.sdocumentPreparation?.mail === "Send") {
            let res = await axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
              mail: "Re-send",
            });
            await fetchBrandMaster();
          }

        }).catch(err => {
          setLoading(false)
          reject(err)
        });
    });

  };

  const columnDataTable = [

    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0,
      width: 100,
      hide: !columnVisibility.date,
      headerClassName: "bold-header",
    },
    {
      field: "referenceno",
      headerName: "Reference No",
      flex: 0,
      width: 100,
      hide: !columnVisibility.referenceno,
      headerClassName: "bold-header",
    },
    {
      field: "templateno",
      headerName: "Template No",
      flex: 0,
      width: 100,
      hide: !columnVisibility.templateno,
      headerClassName: "bold-header",
    },
    {
      field: "template",
      headerName: "Template",
      flex: 0,
      width: 150,
      hide: !columnVisibility.template,
      headerClassName: "bold-header",
    },
    {
      field: "employeemode",
      headerName: "Employee Mode",
      flex: 0,
      width: 100,
      hide: !columnVisibility.employeemode,
      headerClassName: "bold-header",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 0,
      width: 140,
      hide: !columnVisibility.department,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 80,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 80,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 80,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "team",
      headerName: "Team",
      flex: 0,
      width: 80,
      hide: !columnVisibility.team,
      headerClassName: "bold-header",
    },
    {
      field: "person",
      headerName: "Person",
      flex: 0,
      width: 100,
      hide: !columnVisibility.person,
      headerClassName: "bold-header",
    },
    {
      field: "documentneed",
      headerName: "Document Need",
      flex: 0,
      width: 100,
      hide: !columnVisibility.documentneed,
      headerClassName: "bold-header",
    },
    {
      field: "approval",
      headerName: "Approval Status",
      flex: 0,
      width: 100,
      hide: !columnVisibility.approval,
      headerClassName: "bold-header",
    },
    {
      field: "printedcount",
      headerName: "Printed Count",
      flex: 0,
      width: 100,
      hide: !columnVisibility.printedcount,
      headerClassName: "bold-header",
    },
    {
      field: "document",
      headerName: "Documents",
      flex: 0,
      width: 300,
      minHeight: "40px",
      hide: !columnVisibility.document,
      cellRenderer: (params) => (
        <Grid>
          {params.data?.documentneed === "Employee Approval" ?
            <>
              <Button
                variant="contained"
                color="primary"

                onClick={() => {
                  console.log(params?.data?.approval, "2339")
                  params?.data?.approval === "approved" ? getViewFile(params?.data?.approvedfilename, params?.data) :
                    downloadPdfTesdtTable(params?.data?.id, "Employee");
                }}
                sx={userStyle.buttonview}
              >
                View
              </Button>
              &ensp;
              <Button
                variant="contained"
                sx={{
                  backgroundColor: params?.data?.mail === "Send" ? "#4CAF50" : "#F44336", // Green for "Send", Red otherwise
                  color: "white",
                  "&:hover": {
                    backgroundColor: params?.data?.mail === "Send" ? "#45A049" : "#D32F2F",
                  },
                }}
                onClick={() => {
                  extractEmailFormat(params.data.person, params.data.id, params.data?.email, "Employee")
                }}
              >
                {params?.data?.mail}
              </Button>
              &ensp;
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FF9800",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#E68900",
                  },
                }}
                onClick={() => {
                  params?.data?.approval === "approved" ?
                    downloadFile(params?.data?.approvedfilename, params?.data) :
                    downloadPdfPrintTable(params?.data?.id, "Employee")
                }}
              >
                Print
              </Button>
            </>
            :
            <>
              <Button
                variant="contained"
                color="primary"

                onClick={() => {
                  getCode(params?.data, "Table View")
                }}
                sx={userStyle.buttonview}
              >
                View
              </Button>
              &ensp;
              <Button
                variant="contained"
                sx={{
                  backgroundColor: params?.data?.mail === "Send" ? "#4CAF50" : "#F44336", // Green for "Send", Red otherwise
                  color: "white",
                  "&:hover": {
                    backgroundColor: params?.data?.mail === "Send" ? "#45A049" : "#D32F2F",
                  },
                }}
                onClick={() => {
                  extractEmailFormat(params.data.person, params.data.id, params.data?.email)
                }}
              >
                {params?.data?.mail}
              </Button>
              &ensp;
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FF9800",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#E68900",
                  },
                }}
                onClick={() => {
                  getCode(params?.data, "Table Print")
                }}
              // sx={userStyle.buttonview}
              >
                Print
              </Button>
            </>
          }
        </Grid>
      ),
    },
    {
      field: "printingstatus",
      headerName: "Printing Status",
      flex: 0,
      width: 150,
      minHeight: "40px",
      hide: !columnVisibility.printingstatus,

    },
    {
      field: "issuedpersondetails",
      headerName: "Issued Person Details",
      flex: 0,
      width: 100,
      hide: !columnVisibility.issuedpersondetails,
      headerClassName: "bold-header",
    },
    {
      field: "issuingauthority",
      headerName: "Issuing Authority",
      flex: 0,
      width: 100,
      hide: !columnVisibility.issuingauthority,
      headerClassName: "bold-header",
    },
    {
      field: "updatedby",
      headerName: "Printed Info",
      flex: 0,
      width: 150,
      hide: !columnVisibility.updatedby,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid>

          <Button
            variant="contained"
            color="primary"

            onClick={() => { getInfoStatus(params?.data) }}
            sx={userStyle.buttonview}
          >
            Info
          </Button>

        </Grid>
      ),
    },

  ];


  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      date: item.date,
      mail: item.mail,
      email: item.email,
      referenceno: item.referenceno,
      templateno: item.templateno,
      template: item.template,
      printingstatus: item.printingstatus,
      employeemode: item.employeemode,
      department: item.department,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      person: item.person,
      issuedpersondetails: item.issuedpersondetails,
      issuingauthority: item.issuingauthority,
      printedcount: item.printedcount,
      approval: item.approval,
      documentneed: item.documentneed,
      updatedby: item.updatedby,
      approvedfilename: item.approvedfilename,
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
  // Function to filter columns based on search query
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
    <Box
      style={{
        padding: "10px",
        minWidth: "325px",
        "& .MuiDialogContent-root": { padding: "10px 0" },
      }}
    >
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
        <TextField label="Find column" variant="standard" fullWidth value={searchQueryManage} onChange={(e) => setSearchQueryManage(e.target.value)} sx={{ marginBottom: 5, position: "absolute" }} />
      </Box>
      <br />
      <br />
      <DialogContent sx={{ minWidth: "auto", height: "200px", position: "relative" }}>
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText sx={{ display: "flex" }} primary={<Switch sx={{ marginTop: "-5px" }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />} secondary={column.field === "checkbox" ? "Checkbox" : column.headerName} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button variant="text" sx={{ textTransform: "none" }} onClick={() => setColumnVisibility(initialColumnVisibility)}>
              {" "}
              Show All
            </Button>
          </Grid>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => {
                const newColumnVisibility = {};
                columnDataTable.forEach((column) => {
                  newColumnVisibility[column.field] = false; // Set hide property to true
                });
                setColumnVisibility(newColumnVisibility);
              }}
            >
              {" "}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );


  return (
    <Box>
      <Headtitle title={"DOCUMENT PREPARATION"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Employee Document Printed Status List"
        modulename="Human Resources"
        submodulename="HR Documents"
        mainpagename="Employee Document Printed Status List"
        subpagename=""
        subsubpagename=""
      />

      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lemployeedocumentprintedstatuslist") && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <NotificationContainer />
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Employee Document Printed Status Filter </Typography>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <Typography>
                  Template Company<b style={{ color: "red" }}>*</b>
                </Typography>
                <FormControl size="small" fullWidth>
                  <MultiSelect
                    options={accessbranch
                      ?.map((data) => ({
                        label: data.company,
                        value: data.company,
                      }))
                      .filter((item, index, self) => {
                        return (
                          self.findIndex(
                            (i) =>
                              i.label === item.label && i.value === item.value
                          ) === index
                        );
                      })}
                    value={selectedOptionsCompanyTemplate}
                    onChange={(e) => {
                      handleCompanyChangeTemplate(e);
                    }}
                    valueRenderer={customValueRendererCompanyTemplate}
                    labelledBy="Please Select Company"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Template Branch<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={accessbranch?.filter(data => valueCompanyCatTemplate?.includes(data?.company))
                      ?.map((data) => ({
                        label: data.branch,
                        value: data.branch,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedOptionsBranchTemplate}
                    onChange={(e) => {
                      handleBranchChangeTemplate(e);
                    }}
                    valueRenderer={customValueRendererBranchTemplate}
                    labelledBy="Please Select Branch"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Template <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={templateValues}
                    value={{ label: templateName, value: templateName }}
                    onChange={(e) => {
                      setTemplateName(e.value);
                      setEmployeeModeValue("Please Select Employee Mode")
                      handleEmployeeModeOptions(e);
                      setValueCompanyCat([]);
                      setSelectedOptionsCompany([]);
                      setValueBranchCat([]);
                      setSelectedOptionsBranch([]);
                      setValueUnitCat([]);
                      setSelectedOptionsUnit([]);
                      setValueTeamCat([]);
                      setSelectedOptionsTeam([]);
                      setValueDepartmentCat([]);
                      setSelectedOptionsDepartment([]);
                      setValueEmployeeCat([]);
                      setSelectedOptionsEmployee([]);
                      setEmployeenames([])
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Employee Mode <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={employeeModeOptions}
                    value={{ label: employeeModeValue, value: employeeModeValue }}
                    onChange={(e) => {
                      setEmployeeModeValue(e.value);
                      setValueCompanyCat([]);
                      setSelectedOptionsCompany([]);
                      setValueBranchCat([]);
                      setSelectedOptionsBranch([]);
                      setValueUnitCat([]);
                      setSelectedOptionsUnit([]);
                      setValueTeamCat([]);
                      setSelectedOptionsTeam([]);
                      setValueDepartmentCat([]);
                      setSelectedOptionsDepartment([]);
                      setValueEmployeeCat([]);
                      setSelectedOptionsEmployee([]);
                      setEmployeenames([])
                    }}
                  />
                </FormControl>
              </Grid>

              {selectedOptionsCompany?.length === 0 &&
                <>
                  {/* Department */}
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Department<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={departmentOptions}
                        value={selectedOptionsDepartment}
                        onChange={(e) => {
                          handleDepartmentChange(e);
                        }}
                        valueRenderer={customValueRendererDepartment}
                        labelledBy="Please Select Department"
                      />
                    </FormControl>
                  </Grid>
                </>
              }
              {selectedOptionsDepartment?.length === 0 &&
                <>
                  {/*Company Branch Unit Team */}
                  <Grid item md={3} xs={12} sm={12}>
                    <Typography>
                      Company<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <MultiSelect
                        options={accessbranch
                          ?.map((data) => ({
                            label: data.company,
                            value: data.company,
                          }))
                          .filter((item, index, self) => {
                            return (
                              self.findIndex(
                                (i) =>
                                  i.label === item.label && i.value === item.value
                              ) === index
                            );
                          })}
                        value={selectedOptionsCompany}
                        onChange={(e) => {
                          handleCompanyChange(e);
                        }}
                        valueRenderer={customValueRendererCompany}
                        labelledBy="Please Select Company"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        {" "}
                        Branch <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) =>
                            valueCompanyCat?.includes(comp.company)
                          )
                          ?.map((data) => ({
                            label: data.branch,
                            value: data.branch,
                          }))
                          .filter((item, index, self) => {
                            return (
                              self.findIndex(
                                (i) =>
                                  i.label === item.label &&
                                  i.value === item.value
                              ) === index
                            );
                          })}
                        value={selectedOptionsBranch}
                        onChange={(e) => {
                          handleBranchChange(e);
                        }}
                        valueRenderer={customValueRendererBranch}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        {" "}
                        Unit<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter(
                            (comp) =>
                              valueCompanyCat?.includes(comp.company) &&
                              valueBranchCat?.includes(comp.branch)
                          )
                          ?.map((data) => ({
                            label: data.unit,
                            value: data.unit,
                          }))
                          .filter((item, index, self) => {
                            return (
                              self.findIndex(
                                (i) =>
                                  i.label === item.label &&
                                  i.value === item.value
                              ) === index
                            );
                          })}
                        value={selectedOptionsUnit}
                        onChange={(e) => {
                          handleUnitChange(e);
                        }}
                        valueRenderer={customValueRendererUnit}
                        labelledBy="Please Select Unit"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Team<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allTeam
                          ?.filter(
                            (u) =>
                              valueCompanyCat?.includes(u.company) &&
                              valueBranchCat?.includes(u.branch) &&
                              valueUnitCat?.includes(u.unit)
                          )
                          .map((u) => ({
                            ...u,
                            label: u.teamname,
                            value: u.teamname,
                          }))}
                        value={selectedOptionsTeam}
                        onChange={(e) => {
                          handleTeamChange(e);
                        }}
                        valueRenderer={customValueRendererTeam}
                        labelledBy="Please Select Team"
                      />
                    </FormControl>
                  </Grid>
                </>
              }
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Employee<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={employeenames}
                    value={selectedOptionsEmployee}
                    onChange={(e) => {
                      handleEmployeeChange(e);
                    }}
                    valueRenderer={customValueRendererEmployee}
                    labelledBy="Please Select Employee"
                  />
                </FormControl>

              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <Typography>
                  Status Filter
                </Typography>
                <FormControl size="small" fullWidth>
                  <MultiSelect
                    options={[{ label: "Print Document", value: "Print Document" }, { label: "Employee Approval", value: "Employee Approval" }]}
                    value={selectedOptionsStatus}
                    onChange={(e) => {
                      handleStatusChange(e);
                    }}
                    valueRenderer={customValueRendererStatus}
                    labelledBy="Please Select Status"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={6} mt={3}>
                <div style={{ display: "flex", gap: "20px" }}>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={handleFilter}
                    loading={filterLoader}
                    sx={buttonStyles.buttonsubmit}
                  >
                    Filter
                  </LoadingButton>

                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={handleClearFilter}
                  >
                    Clear
                  </Button>
                </div>
              </Grid>

            </Grid>
          </Box>
          <br />
          {/* ******************************************************EXPORT Buttons****************************************************** */}

          <Box sx={userStyle.selectcontainer}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Employee Document Printed Status List</Typography>
            </Grid>
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
                    sx={{ width: "77px" }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={templateCreationArrayCreate?.length}>All</MenuItem>
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
                <Box>
                  {isUserRoleCompare?.includes("excelemployeedocumentprintedstatuslist") && (

                    <>
                      <Button onClick={(e) => {
                        setIsFilterOpen(true)
                        setFormat("xl")
                      }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                    </>

                  )}
                  {isUserRoleCompare?.includes("csvemployeedocumentprintedstatuslist") && (

                    <>
                      <Button onClick={(e) => {
                        setIsFilterOpen(true)
                        setFormat("csv")
                      }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>

                    </>
                  )}
                  {isUserRoleCompare?.includes("printemployeedocumentprintedstatuslist") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfemployeedocumentprintedstatuslist") && (
                    <>
                      <Button sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true)
                        }}>
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;</Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("imageemployeedocumentprintedstatuslist") && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {" "}
                      <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={12} sm={12}>
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={templateCreationArrayCreate}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={items}
                />
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
            <br />
            <br />
            {loader ?
              <>

                <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '350px' }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
              :
              <>
                <Box
                  style={{
                    width: "100%",
                    overflowY: "hidden", // Hide the y-axis scrollbar
                  }}
                >
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
                    searchQuery={searchedString}
                    handleShowAllColumns={handleShowAllColumns}
                    setFilteredRowData={setFilteredRowData}
                    filteredRowData={filteredRowData}
                    setFilteredChanges={setFilteredChanges}
                    filteredChanges={filteredChanges}
                    gridRefTableImg={gridRefTableImg}
                    itemsList={items}
                  />
                </Box>
              </>
            }
          </Box>
          {/* ****** Table End ****** */}

        </>
      )}

      {/* ****** Table End ****** */}
      {/* Manage Column */}
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
      {/* print layout */}
      <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable" ref={componentRef}>
          <TableHead>
            <TableRow>
              <TableCell> SI.No</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reference No</TableCell>
              <TableCell>Template No</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Employee Mode</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Person</TableCell>
              <TableCell>Printing Status</TableCell>
              <TableCell>Issued Person Details</TableCell>
              <TableCell>Issuing Authority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody align="left">
            {rowDataTable?.length > 0 &&
              rowDataTable.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.referenceno}</TableCell>
                  <TableCell>{row.templateno}</TableCell>
                  <TableCell>{row.template}</TableCell>
                  <TableCell>{row.employeemode}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.team}</TableCell>
                  <TableCell>{row.person}</TableCell>
                  <TableCell>{row.printingstatus}</TableCell>
                  <TableCell>{row.issuedpersondetails}</TableCell>
                  <TableCell>{row.issuingauthority}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>



      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
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
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Bulk delete ALERT DIALOG */}
      <Dialog open={isDeleteOpenalert} onClose={handleCloseModalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: "70px", color: "orange" }} />
          <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
            Please Select any Row
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleCloseModalert}>
            {" "}
            OK{" "}
          </Button>
        </DialogActions>
      </Dialog>
      <br />
      <Box>
        <Dialog open={isOpenLetterHeadPopup}
          onClose={handleClickCloseLetterHead}
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
            marginTop: "50px"
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Typography sx={userStyle.HeaderText}>View Letter Header Options</Typography>
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
                        setSelectedHeadOpt([])
                        setHeadValue([])
                        setHeader("")
                        setfooter("")

                      }}
                    />
                  </FormControl>
                </Grid>
                {headerOptions === "With Letter Head" && (
                  <Grid item md={headerOptions === "With Letter Head" ? 4 : 3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        With Letter Head <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        maxMenuHeight={300}
                        options={WithHeaderOptions}
                        value={selectedHeadOpt}
                        onChange={handleHeadChange}
                        valueRenderer={customValueRenderHeadFrom}
                      />
                    </FormControl>
                  </Grid>)}

              </Grid>
              <br />
              <br /> <br />
              <br />
              <Grid container spacing={2} sx={{ marginLeft: "3px" }}>
                <Grid item md={4} xs={12} sm={12}>
                  <LoadingButton loading={HeaderOptionsButton} sx={buttonStyles.buttonsubmit} autoFocus variant="contained" onClick={(e) => {
                    if (pagePopeOpen === "Table View") {
                      downloadPdfTesdtTable(DataTableId, "Print")
                    }
                    else if (pagePopeOpen === "Table Print") {
                      downloadPdfPrintTable(DataTableId, "Print")
                    }
                    else if (pagePopeOpen === "Email") {
                      if (headerOptions === "Please Select Print Options") {
                        setButtonLoadingPreview(false);
                        setPopupContentMalert("Please Select Print Options!");
                        setPopupSeverityMalert("info");
                        handleClickOpenPopupMalert();
                      }
                      else if (headerOptions === "With Letter Head" && selectedHeadOpt?.length < 1) {
                        setPopupContentMalert("Please Select With Letter Head!");
                        setPopupSeverityMalert("info");
                        handleClickOpenPopupMalert();
                      }
                      else {
                        handleClickOpenMailOpen();
                      }
                    }
                  }
                  }>
                    {" "}
                    OK{" "}
                  </LoadingButton>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Button onClick={handleClickCloseLetterHead} sx={buttonStyles.btncancel}>
                    Cancel
                  </Button>
                </Grid>

              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={PageMailOpen}
          onClose={handleClickCloseMail}
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: "hidden",
            "& .MuiPaper-root": {
              overflow: "hidden",
            },
            marginTop: "50px"
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <Box sx={{ padding: "20px 50px" }}>

            <Typography sx={userStyle.HeaderText}>Email Information</Typography>
            <br />
            <br />
            <Grid container spacing={2} sx={{ marginLeft: "3px" }}>
              <Grid item md={4} xs={12} sm={12}>
                <Typography>Mail From</Typography>
                <Typography>{emailValuePage?.fromemail}</Typography>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <Typography>To Mail</Typography>
                <Typography>{emailValuePage?.email}</Typography>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <Typography>CC Mail</Typography>
                {emailValuePage?.ccemail?.map((data, index) => (
                  <Typography key={index}>{index + 1}. {data}</Typography>
                ))}
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <Typography>BCC Mail</Typography>
                {emailValuePage?.bccemail?.map((data, index) => (
                  <Typography key={index}>{index + 1}. {data}</Typography>
                ))}
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <TextArea
                  label="Message"
                  name="message"
                  value={stripHtml(emailValuePage.convert)}
                />
              </Grid>
            </Grid>
            <DialogActions>
              <Button variant="contained" color="primary"
                onClick={(e) => handleSubmit(e)}
              >
                Send
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleClickCloseMail}>
                Cancel
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>

      {/* Pop up for Viewing info */}
      <Box>
        <Dialog open={PageUpdateOpen}
          onClose={handleClickUpdateClose}
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: "hidden",
            "& .MuiPaper-root": {
              overflow: "hidden",
            },
            marginTop: "50px"
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <Box sx={{ padding: "20px 50px" }}>
            <Typography sx={userStyle.HeaderText}>Printed Info</Typography>
            <br />
            <br />

            <Grid container spacing={2} sx={{ marginLeft: "3px" }}>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell style={tableHeadCellStyle}>{"Sno"}.</StyledTableCell>
                    <StyledTableCell style={tableHeadCellStyle}> {"Name"}</StyledTableCell>
                    <StyledTableCell style={tableHeadCellStyle}> {"Date"}</StyledTableCell>
                    <StyledTableCell style={tableHeadCellStyle}> {"Local Ip"}</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {UserPrintedInfoList?.updatedby?.map((item, i) => {


                    return (
                      <StyledTableRow key={i}>
                        <StyledTableCell style={tableBodyCellStyle}>{i + 1}.</StyledTableCell>
                        <StyledTableCell style={tableBodyCellStyle}>{item.name}</StyledTableCell>
                        <StyledTableCell style={tableBodyCellStyle}>
                          {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}
                        </StyledTableCell>
                        <StyledTableCell style={tableBodyCellStyle}>{item.localip}</StyledTableCell>
                      </StyledTableRow>
                    );
                  })}

                </TableBody>
              </Table>
            </Grid>
            <DialogActions>
              <Button variant="outlined" color="secondary" onClick={handleClickUpdateClose}>
                Back
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
      {/* EXTERNAL COMPONENTS -------------- START */}
      {/* VALIDATION */}
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
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Employee Document Preparation List Info"
        addedby={addedby}
        updateby={updateby}
      />

      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={items ?? []}
        filename={"Employee Printed Documents List"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      <Loader loading={loading} message={loadingMessage} />
    </Box>
  );
}

export default DocumentsPrintedStatusList;