import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Typography,
  OutlinedInput,
  InputLabel,
  TextareaAutosize,
  Dialog,
  DialogContent,
  TableCell,
  TableRow,
  DialogActions,
  FormControl,
  Grid,
  Paper,
  Table,
  TableHead,
  TableContainer,
  Button,
  TableBody,
  TextField,
  FormGroup,
} from "@mui/material";
import moment from "moment-timezone";
import { AUTH, BASE_URL } from "../../../services/Authservice";
import FormControlLabel from "@mui/material/FormControlLabel";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Checkbox from "@mui/material/Checkbox";
import { userStyle } from "../../../pageStyle";
import { handleApiError } from "../../../components/Errorhandling";
import { StyledTableRow, StyledTableCell } from "../../../components/Table";
import { SERVICE } from "../../../services/Baseservice";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "jspdf-autotable";
import { Country, State, City } from "country-state-city";
import "cropperjs/dist/cropper.css";
import "react-image-crop/dist/ReactCrop.css";
import "./MultistepForm.css";
import { FaArrowAltCircleRight } from "react-icons/fa";
import {
  UserRoleAccessContext,
  AuthContext,
} from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import MessageAlert from "../../../components/MessageAlert";
import FullAddressCard from '../../../components/FullAddressCard.js';
import { Backdrop } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
function MultistepForm() {


  const LoadingBackdrop = ({ open }) => {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <div className="pulsating-circle">
          <CircularProgress color="inherit" className="loading-spinner" />
        </div>
        <Typography
          variant="h6"
          sx={{ marginLeft: 2, color: "#fff", fontWeight: "bold" }}
        >
          Please Wait...
        </Typography>
      </Backdrop>
    );
  };

  const [isLoading, setIsLoading] = useState(true);

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    // setUpdateLoader(false);
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    // setUpdateLoader(false);
    setOpenPopupMalert(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    // setUpdateLoader(false);
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    // setUpdateLoader(false);
    setOpenPopup(false);
  };



  const [step, setStep] = useState(1);

  const timer = useRef();

  const [todo, setTodo] = useState([]);

  const [employee, setEmployee] = useState({
    wordcheck: false,
    shiftgrouping: "",
    prefix: "Mr",
    firstname: "",
    lastname: "",
    legalname: "",
    fathername: "",
    mothername: "",
    gender: "",
    maritalstatus: "",
    dom: "",
    dob: "",
    bloodgroup: "",
    profileimage: "",
    location: "",
    email: "",
    contactpersonal: "",
    contactfamily: "",
    emergencyno: "",
    doj: "",
    dot: "",
    name: "",
    contactno: "",
    details: "",
    username: "",
    password: "",
    companyname: "",
    pdoorno: "",
    pstreet: "",
    parea: "",
    plandmark: "",
    ptaluk: "",
    ppost: "",
    ppincode: "",
    pcountry: "",
    pstate: "",
    pcity: "",
    cdoorno: "",
    cstreet: "",
    carea: "",
    clandmark: "",
    ctaluk: "",
    cpost: "",
    cpincode: "",
    ccountry: "",
    cstate: "",
    ccity: "",
    branch: "",
    workstation: "",
    weekoff: "",
    unit: "",
    floor: "",
    department: "",
    team: "",
    designation: "",
    shifttiming: "",
    reportingto: "",
    empcode: "",
    remark: "",
    aadhar: "",
    panno: "",
    draft: "",
    intStartDate: "",
    intEndDate: "",
    intCourse: "",
    bankname: "ICICI BANK LTD",
    workmode: "Please Select Work Mode",
    bankbranchname: "",
    accountholdername: "",
    accountnumber: "",
    ifsccode: "",

    categoryedu: "Please Select Category",
    subcategoryedu: "Please Select Sub Category",
    specialization: "Please Select Specialization",
  });

  const [assignExperience, setAssignExperience] = useState({
    expval: "",
    expmode: "",
    endexp: "",
    endexpdate: "",
    endtar: "",
    endtardate: "",
    updatedate: "",
  });

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  const [allUsersLoginName, setAllUsersLoginName] = useState([]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [primaryWorkStation, setPrimaryWorkStation] = useState(
    "Please Select Primary Work Station"
  );

  const [primaryWorkStationInput, setPrimaryWorkStationInput] = useState("");

  const [selectedWorkStation, setSelectedWorkStation] = useState("");
  const [selectedOptionsWorkStation, setSelectedOptionsWorkStation] = useState(
    []
  );

  const [enableWorkstation, setEnableWorkstation] = useState(false);
  const [enableLoginName, setEnableLoginName] = useState(true);
  const [valueWorkStation, setValueWorkStation] = useState([]);
  const [employeecodenew, setEmployeecodenew] = useState("");
  const [checkcode, setCheckcode] = useState(false);

  // week off details
  const [selectedOptionsCate, setSelectedOptionsCate] = useState([]);
  let [valueCate, setValueCate] = useState("");

  let skno = 1;
  let eduno = 1;

  const id = useParams().id;
  const from = useParams().from;
  const [backPath, setBackPath] = useState("");
  const [headTitle, setHeadTitle] = useState("");

  useEffect(() => {
    switch (from) {
      case "employee":
        setBackPath("/list");
        setHeadTitle("EMPLOYEE VIEW");
        break;
      case "employeestatus":
        setBackPath("/interview/employeestatus");
        setHeadTitle("EMPLOYEE VIEW");
        break;
      case "intern":
        setBackPath("/internlist");
        setHeadTitle("INTERN VIEW");
        break;
      case "enquiry":
        setBackPath("/enquirypurposelist");
        setHeadTitle("ENQUIRY VIEW");
        break;
      case "deactivateemployeelist":
        setBackPath("/updatepages/deactivateemployeeslistview");
        setHeadTitle("DEACTIVATE EMPLOYEE VIEW");
        break;
      case "deactivateinternlist":
        setBackPath("/deactivateinternlistview");
        setHeadTitle("DEACTIVATE INTERN VIEW");
        break;
    }
  }, []);

  const [files, setFiles] = useState([]);

  const handleRemarkChange = (index, remark) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) => (i === index ? { ...file, remark } : file))
    );
  };

  const downloadFile = async (filename) => {
    try {
      const response = await axios.get(`${BASE_URL}/uploadsDocuments/${filename}`, {
        responseType: "blob",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file", error);
    }
  };

    const downloadFileDocument = async (filename) => {
      try {
        const response = await axios.get(`${BASE_URL}/EmployeeUserDocuments/${filename}`, {
          responseType: 'blob',
        });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error downloading the file', error);
      }
    };
    const renderFilePreview = async (file) => {
      if (file?.orginpath && file?.orginpath === 'Employee Documents') {
        const fileUrl = `${BASE_URL}/uploadsDocuments/${file.preview}`;
        window.open(fileUrl, '_blank');
      } else if (file?.path) {
        const fileUrl = `${BASE_URL}/EmployeeUserDocuments/${file.filename}`;
        window.open(fileUrl, '_blank');
      }
      else {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        window.open(link, '_blank');
      }
    };
  // const renderFilePreview = async (file) => {
  //   if (file?.orginpath && file?.orginpath === "Employee Documents") {
  //     const fileUrl = `${BASE_URL}/uploadsDocuments/${file.preview}`;
  //     window.open(fileUrl, '_blank');
  //   } else {
  //     const response = await fetch(file.preview);
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     window.open(link, "_blank");
  //   }
  // };
  const [errmsg, setErrmsg] = useState("");
  const [errors, setErrors] = useState({});
  const [errorsLog, setErrorsLog] = useState({});
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isPasswordChange, setIsPasswordChange] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    let emailvalue = email ? email : employee.email;
    return regex.test(emailvalue);
  };

  const { auth } = useContext(AuthContext);
  const { isUserRoleCompare, isUserRoleAccess, buttonStyles, workStationSystemName } = useContext(
    UserRoleAccessContext
  );

  const [selectedCountryp, setSelectedCountryp] = useState(null);
  const [selectedStatep, setSelectedStatep] = useState(null);
  const [selectedCityp, setSelectedCityp] = useState(null);

  const [selectedCountryc, setSelectedCountryc] = useState(null);
  const [selectedStatec, setSelectedStatec] = useState(null);
  const [selectedCityc, setSelectedCityc] = useState(null);

  const [message, setErrorMessage] = useState("");
  const [usernameaddedby, setUsernameaddedby] = useState("");

  let sno = 1;

  const [eduTodo, setEduTodo] = useState([]);

  const [addAddQuaTodo, setAddQuaTodo] = useState("");

  const [workhistTodo, setWorkhistTodo] = useState("");

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  const [bankTodo, setBankTodo] = useState([]);

  const [croppedImage, setCroppedImage] = useState("");

  const [oldData, setOldData] = useState({
    company: "",
    branch: "",
    unit: "",
    team: "",
  });

  const [loginNotAllot, setLoginNotAllot] = useState({
    process: "Please Select Process",
    processtype: "Primary",
    processduration: "Full",

    time: "Hrs",
    timemins: "Mins",
  });

  const [overallgrosstotal, setoverallgrosstotal] = useState("");
  const [modeexperience, setModeexperience] = useState("");
  const [targetexperience, setTargetexperience] = useState("");
  const [targetpts, setTargetpts] = useState("");
  const [accessibleTodo, setAccessibleTodo] = useState([]);
  const [createRocketChat, setCreateRocketChat] = useState({
    create: false,
    email: "",
    roles: [{
      label: "user",
      value: "user",
    }]
  });
  const [createHiConnect, setCreateHiConnect] = useState({
    createhiconnect: false,
    hiconnectemail: '',
    hiconnectroles: [
      {
        label: 'system_user',
        value: 'system_user',
      },
    ],
  });
  const [maxSelections, setMaxSelections] = useState(0);
  const [workstationTodoList, setWorkstationTodoList] = useState([]);
  const [primaryWorkStationLabel, setPrimaryWorkStationLabel] = useState('Please Select Primary Work Station');
  const fetchWorkStation = async () => {
    try {
      let res = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const aggregationPipeline = [
        {
          $project: {
            workstation: 1, // Include only the workstation field
          },
        },
        {
          $unwind: '$workstation', // Unwind the workstation array into separate documents
        },
        {
          $group: {
            _id: null, // Group all documents together
            allWorkstations: { $addToSet: '$workstation' }, // Combine all unique workstation values into a single array
          },
        },
      ];
      let response = await axios.post(
        SERVICE.DYNAMICUSER_CONTROLLER,
        {
          aggregationPipeline,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const allWorkstations = response.data?.users?.[0]?.allWorkstations || [];
      // setAllAssignedWorkStations(allWorkstations)
      // setAllAssignedWorkStations([]);
      const result = res?.data?.locationgroupings.flatMap((item) => {
        return item.combinstation.flatMap((combinstationItem) => {
          return combinstationItem.subTodos.length > 0 ? combinstationItem.subTodos.map((subTodo) => subTodo.subcabinname + '(' + item.branch + '-' + item.floor + ')') : [combinstationItem.cabinname + '(' + item.branch + '-' + item.floor + ')'];
        });
      });
      // setWorkStationOpt(res?.data?.locationgroupings);

      const processedResult = result.map((e) => {
        const selectedCabinName = e?.split('(')[0];

        const Bracketsbranch = e?.match(/\(([^)]+)\)/)?.[1];

        const hyphenCount = Bracketsbranch.split('-').length - 1;

        const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch.split('-').slice(0, 2).join('-');

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

        const shortname = workStationSystemName
          ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
          ?.map((item) => item?.systemshortname)
          ?.toString();

        return e + `(${shortname})`;
      });

      let secondaryworkstation = processedResult
        ?.filter((d) => !allWorkstations.includes(d))
        ?.map((d) => ({
          ...d,
          label: d,
          value: d?.replace(/\([^)]*\)$/, ''),
        }));
      return secondaryworkstation;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchHandlerEdit = async () => {
    try {
      setIsLoading(true);
      let response = await axios.get(`${SERVICE.USER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let responsenew = await axios.post(
        SERVICE.EMPLOYEEDOCUMENT_SINGLEWITHALLBYCOMMONID,
        {
          commonid: id,
        }
      );
      const savedEmployee = {
        ...response?.data?.suser,
        ...responsenew?.data?.semployeedocument,
      };
      setAssignExperience((prev) => ({
        ...prev,
        ...savedEmployee.assignExpLog[0],
      }));

      setBankTodo(response?.data?.suser?.bankdetails);

      setReferenceTodo(response?.data?.suser?.referencetodo);

      setFirst(
        response?.data?.suser?.firstname?.toLowerCase().split(" ").join("")
      );
      setSecond(
        response?.data?.suser?.lastname?.toLowerCase().split(" ").join("")
      );

      setoverallgrosstotal(response?.data?.suser.grosssalary);
      setTodo(response?.data?.suser?.boardingLog[0]?.todo);
      setModeexperience(response?.data?.suser.modeexperience);
      setTargetexperience(response?.data?.suser.targetexperience);
      setTargetpts(response?.data?.suser.targetpts);
      setLoginNotAllot(response?.data?.suser);

      // Find the corresponding Country, State, and City objects
      const country = Country.getAllCountries().find(
        (country) => country.name === savedEmployee.ccountry
      );
      const state = State.getStatesOfCountry(country?.isoCode).find(
        (state) => state.name === savedEmployee.cstate
      );
      const city = City.getCitiesOfState(
        state?.countryCode,
        state?.isoCode
      ).find((city) => city.name === savedEmployee.ccity);

      // Find the corresponding Country, State, and City objects
      // Find the corresponding Country, State, and City objects
      const countryp = Country.getAllCountries().find((country) => country.name === savedEmployee.pcountry);
      const statep = State.getStatesOfCountry(countryp?.isoCode).find((state) => state.name === savedEmployee.pstate);
      const cityp = City.getCitiesOfState(statep?.countryCode, statep?.isoCode).find((city) => city.name === savedEmployee.pcity);

      setSelectedCityc(city);
      setSelectedCountryc(country);
      setSelectedStatec(state);
      setSelectedCountryp(countryp);
      setSelectedStatep(statep);
      setSelectedCityp(cityp);
      setEmployee(savedEmployee);
      setEnableLoginName(response?.data?.suser?.usernameautogenerate);

      fetchAccessibleDetails(
        response?.data?.suser.companyname,
        response?.data?.suser.empcode
      );
      setCreateRocketChat({
        create: response?.data?.suser?.rocketchatid ? true : false,
        email: response?.data?.suser?.rocketchatemail ?? "",
        roles: response?.data?.suser?.rocketchatroles ? response?.data?.suser?.rocketchatroles?.map((data) => ({
          label: data,
          value: data,
        })) : []
      })
      setCreateHiConnect({
        createhiconnect: response?.data?.suser?.hiconnectid ? true : false,
        hiconnectemail: response?.data?.suser?.hiconnectemail ?? '',
        hiconnectroles: response?.data?.suser?.hiconnectroles
          ? response?.data?.suser?.hiconnectroles?.map((data) => ({
            label: data,
            value: data,
          }))
          : [],
      });
      setFiles(responsenew?.data?.semployeedocument?.files);
      setEduTodo(response?.data?.suser?.eduTodo);
      setAddQuaTodo(response?.data?.suser?.addAddQuaTodo);
      setWorkhistTodo(response?.data?.suser?.workhistTodo);
      setIsValidEmail(validateEmail(response?.data?.suser?.email));
      setSelectedCompany(response?.data?.suser?.company);
      setSelectedBranch(response?.data?.suser?.branch);
      setSelectedUnit(response?.data?.suser?.unit);

      setSelectedDesignation(response?.data?.suser?.designation);
      setSelectedTeam(response?.data?.suser?.team);
      setEnableWorkstation(response?.data?.suser?.enableworkstation);
      // setPrimaryWorkStation(
      //   response?.data?.suser?.workstation[0] ===
      //     "Please Select Primary Work Station"
      //     ? ""
      //     : response?.data?.suser?.workstation[0]
      // );
      setPrimaryWorkStationInput(response?.data?.suser?.workstationinput);
      // setSelectedWorkStation(response?.data?.suser?.workstation.slice(1));
      // setSelectedOptionsWorkStation(
      //   Array.isArray(response?.data?.suser?.workstation)
      //     ? response?.data?.suser?.workstation.slice(1).map((x) => ({
      //       ...x,
      //       label: x,
      //       value: x,
      //     }))
      //     : []
      // );
      setSelectedWorkStation(
        response?.data?.suser?.workstation.slice(
          1,
          response?.data?.suser?.workstation?.length
        )
      );
      setSelectedOptionsWorkStation(
        Array.isArray(response?.data?.suser?.workstation)
          ? response?.data?.suser?.workstation
            .slice(1, response?.data?.suser?.workstation?.length)
            ?.map((x) => ({
              ...x,
              label: x,
              value: x,
            }))
          : []
      );
      setSelectedOptionsCate(
        Array.isArray(response?.data?.suser?.boardingLog[0]?.weekoff)
          ? response?.data?.suser?.boardingLog[0]?.weekoff?.map((x) => ({
            ...x,
            label: x,
            value: x,
          }))
          : []
      );
      setEmployee({
        ...savedEmployee,
        paddresstype: savedEmployee?.paddresstype ? savedEmployee?.paddresstype : "",
        ppersonalprefix: savedEmployee?.ppersonalprefix ? savedEmployee?.ppersonalprefix : "",
        presourcename: savedEmployee?.presourcename ? savedEmployee?.presourcename : "",
        plandmarkandpositionalprefix: savedEmployee?.plandmarkandpositionalprefix ? savedEmployee?.plandmarkandpositionalprefix : "",
        pgpscoordination: savedEmployee?.pgpscoordination ? savedEmployee?.pgpscoordination : "",
        caddresstype: savedEmployee?.caddresstype ? savedEmployee?.caddresstype : "",
        cpersonalprefix: savedEmployee?.cpersonalprefix ? savedEmployee?.cpersonalprefix : "",
        cresourcename: savedEmployee?.cresourcename ? savedEmployee?.cresourcename : "",
        clandmarkandpositionalprefix: savedEmployee?.clandmarkandpositionalprefix ? savedEmployee?.clandmarkandpositionalprefix : "",
        cgpscoordination: savedEmployee?.cgpscoordination ? savedEmployee?.cgpscoordination : "",

        pgenerateviapincode: Boolean(savedEmployee?.pgenerateviapincode) || false,
        pvillageorcity: savedEmployee?.pvillageorcity || '',
        pdistrict: savedEmployee?.pdistrict || '',
        cgenerateviapincode: Boolean(savedEmployee?.cgenerateviapincode) || false,
        cvillageorcity: savedEmployee?.cvillageorcity || '',
        cdistrict: savedEmployee?.cdistrict || '',

        religion: savedEmployee?.religion || "",
        empcode: savedEmployee.wordcheck === true ? "" : savedEmployee.empcode,
        panstatus: savedEmployee?.panno
          ? "Have PAN"
          : savedEmployee?.panrefno
            ? "Applied"
            : "Yet to Apply",
        age: calculateAge(savedEmployee?.dob),
        callingname:
          savedEmployee?.callingname === "" ||
            savedEmployee?.callingname == undefined
            ? savedEmployee?.legalname
            : savedEmployee?.callingname,
      });
      setEmployeecodenew(
        savedEmployee.wordcheck === true ? savedEmployee.empcode : ""
      );
      setCheckcode(savedEmployee.wordcheck);

      // setValueWorkStation(
      //   response?.data?.suser?.workstation.slice(
      //     1,
      //     response?.data?.suser?.workstation.length
      //   )
      // );

      setValueCate(response?.data?.suser?.boardingLog[0]?.weekoff);
      setOldData({
        ...oldData,
        empcode: response?.data?.suser?.empcode,
        company: response?.data?.suser?.company,
        unit: response?.data?.suser?.unit,
        branch: response?.data?.suser?.branch,
        team: response?.data?.suser?.team,
      });
      //workstation start
      let isIntern = !response?.data?.suser?.internstatus ? false : response?.data?.suser?.internstatus === 'Moved';

      let boardingLog = response?.data?.suser?.boardingLog;
      const movetoliveIndex = boardingLog.findIndex((item) => item.movetolive === true);

      let beforeArray = [];
      let afterArray = [];

      if (movetoliveIndex !== -1) {
        // Separate the arrays based on the found index
        beforeArray = boardingLog.slice(0, movetoliveIndex);
        afterArray = boardingLog.slice(movetoliveIndex);
      }
      let boardFirstLog = isIntern && movetoliveIndex !== -1 && afterArray?.length > 0 ? afterArray[0] : response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0] : undefined;

      let resNew = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let workStationOpt = resNew?.data?.locationgroupings;
      let allWorkStationOpt = await fetchWorkStation()

      const wfhcount = response?.data?.suser?.wfhcount || 0;
      // setMaxSelections(Number(employeeCount) + Number(wfhcount));
      // setWfhSelections(Number(wfhcount));



      setPrimaryWorkStation(boardFirstLog?.workstation[0] || "Please Select Primary Work Station");

      const assignPrimarySecondaryWorkstations = (data) => {
        return data.map((emp) => {
          const workstations = (emp.workstation || []).map((ws) => (ws ? ws.trim() : ''));

          const [primary, ...secondary] = workstations;

          const extractBranchAndFloor = (workstation) => {
            const branchAndFloor = (workstation || '')?.match(/\(([^)]+)\)/)?.[1];
            if (branchAndFloor) {
              const hyphenCount = branchAndFloor.split('-').length - 1;
              const Branch = hyphenCount === 1 ? branchAndFloor.split('-')[0].trim() : branchAndFloor.split('-').slice(0, 2).join('-');
              const Floor = hyphenCount === 1 ? branchAndFloor.split('-')[1].trim() : hyphenCount === 2 ? branchAndFloor.split('-').pop() : branchAndFloor.split('-').slice(-2).join('-')?.replace(')', '');
              return { Branch, Floor };
            }
            return {};
          };

          const findSystemShortName = (workstation) => {
            const { Branch, Floor } = extractBranchAndFloor(workstation);
            const match = workStationSystemName?.find((sht) => sht?.branch === Branch && sht?.floor === Floor && sht?.cabinname === workstation.split('(')[0].trim());
            return match ? match.systemshortname : '';
          };

          const primarySystemShortName = findSystemShortName(primary);
          const secondarySystemShortNames = secondary.map(findSystemShortName).filter((name) => name);

          const secondaryworkstationvalue = secondary.join(', ');

          return {
            ...emp,
            primaryworkstation: ['Please Select Primary Work Station', 'Select Primary Workstation', null]?.includes(primary) ? '' : primary || '', // Set the first workstation as primary
            secondaryworkstation: secondaryworkstationvalue || '',
            systemshortname: [primarySystemShortName, ...secondarySystemShortNames].join(', '), // Combine all short names
          };
        });
      };

      const updatedData = assignPrimarySecondaryWorkstations([boardFirstLog || response?.data?.suser]);

      const systemShortNamesArray = updatedData[0]?.systemshortname.split(', ');

      const [primary, ...secondary] = systemShortNamesArray;



      const employeeCount = Number(response?.data?.suser?.employeecount ?? 0) + Number(response?.data?.suser?.wfhcount ?? 0);
      setMaxSelections(employeeCount);
      var filteredWorks;
      if (response?.data?.suser?.unit === '' && response?.data?.suser?.floor === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === response?.data?.suser?.company && u.branch === response?.data?.suser?.branch);
      } else if (response?.data?.suser?.unit === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === response?.data?.suser?.company && u.branch === response?.data?.suser?.branch && u.floor === response?.data?.suser?.floor);
      } else if (response?.data?.suser?.floor === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === response?.data?.suser?.company && u.branch === response?.data?.suser?.branch && u.unit === response?.data?.suser?.unit);
      } else {
        filteredWorks = workStationOpt?.filter((u) => u.company === response?.data?.suser?.company && u.branch === response?.data?.suser?.branch && u.unit === response?.data?.suser?.unit && u.floor === response?.data?.suser?.floor);
      }

      const result = filteredWorks.flatMap((item) => {
        return item.combinstation.flatMap((combinstationItem) => {
          return combinstationItem.subTodos.length > 0 ? combinstationItem.subTodos.map((subTodo) => subTodo.subcabinname + '(' + item.branch + '-' + item.floor + ')') : [combinstationItem.cabinname + '(' + item.branch + '-' + item.floor + ')'];
        });
      });

      const processedResult = result.map((e) => {
        const selectedCabinName = e?.split('(')[0];

        const Bracketsbranch = e?.match(/\(([^)]+)\)/)?.[1];

        const hyphenCount = Bracketsbranch.split('-').length - 1;

        const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch.split('-').slice(0, 2).join('-');

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

        const shortname = workStationSystemName
          ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
          ?.map((item) => item?.systemshortname)
          ?.toString();

        return e + `(${shortname})`;
      });

      // The processedResult array now contains all the mapped `shortname` values
      let workstationsFinal = [
        ...processedResult.map((t) => ({
          label: t,
          value: t?.replace(/\([^)]*\)$/, ''),
        })),
      ];
      let primaryWorkstationNew = boardFirstLog?.workstation[0] || "Please Select Primary Work Station";
      let findLabel = workstationsFinal?.find((item) => item.label.includes(primaryWorkstationNew)) || {};
      // setFilteredWorkStation(workstationsFinal);
      setPrimaryWorkStationLabel(findLabel?.label || "Please Select Primary Work Station");

      const matches = (findLabel?.label || "")?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);
      console.log(primaryWorkstationNew, matches)
      setWorkstationTodoList((prev) => matches ? [
        {
          workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
          shortname: matches?.[3],
          type: 'Primary',
        },
      ] : []);
      let secondaryWorkstation = Array.isArray(boardFirstLog?.workstation)
        ? boardFirstLog?.workstation
          ?.filter((item) => item !== boardFirstLog?.workstation[0])
          .map((x) => ({
            ...x,
            label: x,
            value: x,
          }))
        : [];
      let foundDataNew = secondaryWorkstation?.map((item) => {
        let getData = allWorkStationOpt?.find((data) => data.value === item.value);
        return {
          ...item,
          label: getData?.label,
        };
      });
      console.log(foundDataNew, "foundDataNew")

      setSelectedOptionsWorkStation(foundDataNew);

      const resultNew = (foundDataNew || []).map((item) => {
        if (!item || !item.label) return null;

        const matches = item.label.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

        if (!matches) return null;

        return {
          workstation: `${matches[1].trim()}(${matches[2].trim()})`,
          shortname: matches[3],
          type: 'Secondary',
        };
      }).filter(Boolean); // remove null results

      setWorkstationTodoList((prev) => {
        const primaryItem = prev?.find((item) => item?.type === 'Primary');
        return primaryItem ? [primaryItem, ...resultNew] : [...resultNew];
      });

      setValueWorkStation(boardFirstLog?.workstation?.filter((item) => item !== boardFirstLog?.workstation[0]));
      //workstation end
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [getunitname, setgetunitname] = useState("");
  let branch = getunitname ? getunitname : employee.branch;

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  const [getbranchname, setgetbranchname] = useState("");
  let branchname = getbranchname ? setgetbranchname : employee.company;

  const [name, setUserNameEmail] = useState("");
  const [reportingtonames, setreportingtonames] = useState([]);

  const backPage = useNavigate();

  //webcam

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);

  //id for login

  let loginid = localStorage.LoginUserId;
  //get user row  edit  function


  const [referenceTodo, setReferenceTodo] = useState([]);
  const [referenceTodoError, setReferenceTodoError] = useState({});
  const [singleReferenceTodo, setSingleReferenceTodo] = useState({
    name: "",
    relationship: "",
    occupation: "",
    contact: "",
    details: "",
  });

  // let capture = isWebcamCapture == true ? getImg : croppedImage;

  let final = croppedImage ? croppedImage : employee.profileimage;

  useEffect(() => {
    // fetchCompanies();
    // fetchfloorNames();
    // fetchDepartments();
    // fetchteamdropdowns();
    // fetchShiftDropdowns();
    // fetchWorkStation();
    // fetchDesignation();
    // fetchSkillSet();
    fetchHandlerEdit();
    // fetchInternCourses();
    // fetchUsernames();
  }, []);





  useEffect(() => {
    ShowErrMess();
    setThird(first + second.slice(0, 1));
    setUserNameEmail(first + second.slice(0, 1));
  }, [first, second, name]);

  //ERROR MESSAGESE
  const ShowErrMess = () => {
    if (first.length == "" || second.length == 0) {
      setErrmsg("Unavailable");
    } else if (third.length >= 1) {
      setErrmsg("Available");
    }
  };

  const isImages = (fileName) => {
    return /\.png$/i.test(fileName);
  };

  const isImage = (fileName) => {
    return /\.jpeg$|\.jpg$/i.test(fileName);
  };

  const isPdf = (fileName) => {
    return /\.pdf$/i.test(fileName);
  };

  const isExcel = (fileName) => {
    return /\.xlsx?$/i.test(fileName);
  };

  function isTxt(fileName) {
    return /\.txt$/.test(fileName);
  }

  let conditions = [
    employee.prefix !== "",
    employee.firstname !== "",
    employee.lastname !== "",
    employee.legalname !== "",
    employee.fathername !== "",
    employee.mothername !== "",
    employee.gender !== "",
    employee.maritalstatus !== "",
    employee.maritalstatus === "Married" &&
    employee.dom !== "" &&
    employee.dob !== "",
    employee.bloodgroup !== "",
    employee.profileimage !== "",
    employee.location !== "",
    employee.email !== "",
    employee.contactpersonal !== "",
    employee.contactfamily !== "",
    employee.emergencyno !== "",
    employee.doj !== "",
    employee.dot !== "",
    employee.aadhar !== "",
    employee.panno !== "",

    employee.contactno !== "",
    employee.details !== "",

    employee.username !== "",
    employee.password !== "",
    employee.companyname !== "",

    employee.company !== "",
    employee.branch !== "",
    employee.unit !== "",
    employee.floor !== "",
    employee.department !== "",
    employee.team !== "",
    employee.designation !== "",
    employee.shifttiming !== "",
    employee.reportingto !== "",
    employee.empcode !== "",

    employee.pdoorno !== "",
    employee.pstreet !== "",
    employee.parea !== "",
    employee.plandmark !== "",
    employee.ptaluk !== "",
    employee.ppincode !== "",
    employee.ppost !== "",
    selectedCountryp !== "",
    selectedStatep !== "",
    selectedCityp !== "",
    !employee.samesprmnt ? employee.cdoorno : employee.pdoorno !== "",
    !employee.samesprmnt ? employee.cstreet : employee.pstreet !== "",
    !employee.samesprmnt ? employee.carea : employee.parea !== "",
    !employee.samesprmnt ? employee.clandmark : employee.plandmark !== "",
    !employee.samesprmnt ? employee.ctaluk : employee.ptaluk !== "",
    !employee.samesprmnt ? employee.cpost : employee.ppost !== "",
    !employee.samesprmnt ? employee.cpincode : employee.ppincode !== "",
    // !employee.samesprmnt ? selectedCountryc.name : selectedCountryp.name !== "",
    // !employee.samesprmnt ? selectedStatec.name : selectedStatep.name !== "",
    // !employee.samesprmnt ? selectedCityc.name : selectedCityp.name !== "",

    files.length > 0,
    addAddQuaTodo.length > 0,
    eduTodo.length > 0,
    workhistTodo.length > 0,
  ];

  const result = conditions.reduce(
    (acc, val) => {
      acc[val]++;
      return acc;
    },
    { true: 0, false: 0 }
  );

  const totalFields = 61;
  const filledFields = Object.values(employee).filter(
    (value) => value !== ""
  ).length;

  const completionPercentage = (result.true / totalFields) * 100;

  //branch updatedby edit page....
  let updateby = employee.updatedby;

  const nextStep = () => {
    setStep(step + 1);
  };

  //login detail validation
  const nextStepLog = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStepOne = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">

          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography sx={userStyle.SubHeaderText}>
                Personal Information{" "}
              </Typography>
              <br />
              <br />
              <>
                <Grid container spacing={2}>
                  <Grid item md={6} sm={12} xs={12}>
                    <Typography>First Name</Typography>
                    <Grid container sx={{ display: "flex" }}>
                      <Grid item md={3} sm={3} xs={3}>
                        <FormControl size="small" fullWidth>
                          <OutlinedInput value={employee.prefix} readOnly={true} />
                        </FormControl>
                      </Grid>
                      <Grid item md={9} sm={9} xs={9}>
                        <FormControl size="small" fullWidth>
                          <OutlinedInput
                            readOnly={true}
                            value={employee.firstname}
                          />
                        </FormControl>
                        {errors.firstname && <div>{errors.firstname}</div>}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={6} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Last Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        value={employee.lastname}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Legal Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        readOnly
                        value={employee.legalname}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Calling Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        readOnly
                        value={employee.callingname}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Father Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        readOnly
                        value={employee.fathername}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mother Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        value={employee.mothername}
                        readOnly
                      />
                    </FormControl>
                  </Grid>

                  {/* <Grid container spacing={2}> */}
                  <Grid item md={9} sm={12} xs={12}>
                    <Grid container spacing={2}>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Gender</Typography>

                          <OutlinedInput
                            id="component-outlined"
                            value={employee.gender}
                            readOnly
                            type="text"
                            size="small"
                            name="dom"
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Marital Status</Typography>

                          <OutlinedInput
                            id="component-outlined"
                            value={employee.maritalstatus}
                            readOnly
                            type="text"
                            size="small"
                            name="dom"
                          />
                        </FormControl>
                      </Grid>
                      {employee.maritalstatus === "Married" && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Date Of Marriage</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              value={
                                employee.dom
                                  ? moment(employee.dom)?.format("DD-MM-YYYY")
                                  : ""
                              }
                              readOnly
                              type="text"
                              size="small"
                              name="dom"
                            />
                          </FormControl>
                          {errors.dom && <div>{errors.dom}</div>}
                        </Grid>
                      )}
                      <Grid item md={2.5} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Date Of Birth</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            value={
                              employee.dob
                                ? moment(employee.dob)?.format("DD-MM-YYYY")
                                : ""
                            }
                            readOnly
                            type="text"
                            size="small"
                            name="dob"
                          />
                        </FormControl>
                        {errors.dob && <div>{errors.dob}</div>}
                      </Grid>
                      <Grid item md={1.5} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Age</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            value={employee.dob === "" ? "" : employee?.age}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Religion</Typography>

                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="religion"
                            value={employee?.religion || ""}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Blood Group</Typography>

                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="bloodgroup"
                            value={employee.bloodgroup}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Email</Typography>
                          <TextField
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={employee.email}
                            readOnly
                          />
                        </FormControl>
                      </Grid>

                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Location</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Location"
                            value={employee.location}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Contact No (personal)</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Contact No (personal)"
                            value={employee.contactpersonal}
                            readOnly
                          />
                        </FormControl>
                        {errors.contactpersonal && (
                          <div>{errors.contactpersonal}</div>
                        )}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Contact No (Family)</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Contact No (Family)"
                            value={employee.contactfamily}
                            readOnly
                          />
                        </FormControl>
                        {errors.contactfamily && <div>{errors.contactfamily}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Emergency No</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Emergency No (Emergency)"
                            value={employee.emergencyno}
                            readOnly
                          />
                        </FormControl>
                        {errors.emergencyno && <div>{errors.emergencyno}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Aadhar No</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="Number"
                            sx={userStyle.input}
                            placeholder="Aadhar No"
                            value={employee.aadhar}
                            readOnly
                          />
                        </FormControl>
                        {errors.aadhar && <div>{errors.aadhar}</div>}
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>PAN Card Status</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Pan No"
                            value={employee.panstatus}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      {employee?.panstatus === "Have PAN" && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Pan No</Typography>

                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Pan No"
                              value={employee.panno}
                              readOnly
                            />
                          </FormControl>
                          {errors.panno && <div>{errors.panno}</div>}
                        </Grid>
                      )}
                      {employee?.panstatus === "Applied" && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Application Ref No</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Pan No"
                              value={employee.panrefno}
                              readOnly
                            />
                          </FormControl>
                          {errors.panrefno && <div>{errors.panrefno}</div>}
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item lg={3} md={3} sm={12} xs={12}>
                    <InputLabel sx={{ m: 1 }}>Profile Image</InputLabel>
                    <img
                      style={{ height: 120 }}
                      src={
                        croppedImage === "" ? employee.profileimage : croppedImage
                      }
                      alt=""
                    />
                  </Grid>
                </Grid>
              </>
              <br />
            </Box>
            <br />
          </Grid>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={nextStep}
              >
                Next
              </Button>
              <Link
                to={backPath}
                style={{
                  textDecoration: "none",
                  color: "white",
                  // float: "right",
                  marginRight: "0px"
                }}
              >
                <Button
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                >Cancel</Button>
              </Link>

            </Box>
          </Grid>
        </Grid>
        {/* ALERT DIALOG */}
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
              <Typography variant="h6">{message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseerr}
              >
                ok
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </>
    );
  };

  const renderStepTwo = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button className="prev" variant="contained"
              size="small"
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={prevStep}>
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>
                  Reference Details{" "}
                </Typography>
                <br />
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={12} sm={12} xs={12}>
                  {" "}
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <TableContainer component={Paper}>
                    <Table
                      sx={{ minWidth: 700 }}
                      aria-label="customized table"
                      id="usertable"
                    >
                      <TableHead sx={{ fontWeight: "600" }}>
                        <StyledTableRow>
                          <StyledTableCell>SNo</StyledTableCell>
                          <StyledTableCell>Name</StyledTableCell>
                          <StyledTableCell>Relationship</StyledTableCell>
                          <StyledTableCell>Occupation</StyledTableCell>
                          <StyledTableCell>Contact</StyledTableCell>
                          <StyledTableCell>Details</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody align="left">
                        {referenceTodo?.length > 0 ? (
                          referenceTodo?.map((row, index) => (
                            <StyledTableRow>
                              <StyledTableCell>{index + 1}</StyledTableCell>
                              <StyledTableCell>{row.name}</StyledTableCell>
                              <StyledTableCell>{row.relationship}</StyledTableCell>
                              <StyledTableCell>{row.occupation}</StyledTableCell>
                              <StyledTableCell>{row.contact}</StyledTableCell>
                              <StyledTableCell>{row.details}</StyledTableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <StyledTableRow>
                            {" "}
                            <StyledTableCell colSpan={8} align="center">
                              No Data Available
                            </StyledTableCell>{" "}
                          </StyledTableRow>
                        )}
                        <StyledTableRow></StyledTableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>{" "}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.selectcontainer}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>
                  Login Details{" "}
                </Typography>
                <br />
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={4} sm={6} xs={12}>
                  {enableLoginName ? (
                    <FormControl size="small" fullWidth>
                      <Typography>Login Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="login Name"
                        value={third}
                        readOnly
                      />
                    </FormControl>
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Typography>Login Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={employee.username}
                      />
                    </FormControl>
                  )}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Password</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="password"
                      // value={employee.password}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>company Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value={employee.companyname}
                    />
                  </FormControl>
                </Grid>
              </Grid>{" "}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.dialogbox}>
              <Typography sx={userStyle.importheadtext}>
                Boarding Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Attendance Mode</Typography>
                    <Typography>{employee?.attendancemode?.map(data => data).join(',')}</Typography>
                  </FormControl>
                </Grid>
                {isUserRoleAccess.role.includes("Manager") ? (
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Status</Typography>
                      <OutlinedInput
                        value={employee.enquirystatus}
                        readOnly={true}
                      />
                    </FormControl>
                  </Grid>
                ) : isUserRoleCompare.includes("lassignenquierypurpose") ? (
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Status</Typography>
                      <OutlinedInput
                        value={employee.enquirystatus}
                        readOnly={true}
                      />
                    </FormControl>
                  </Grid>
                ) : (
                  ""
                )}
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Work Mode</Typography>
                    <OutlinedInput value={employee.workmode} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>DOJ</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={
                        employee.doj
                          ? moment(employee.doj)?.format("DD-MM-YYYY")
                          : ""
                      }
                      readOnly
                    />
                    {errors.doj && <div>{errors.doj}</div>}
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>DOT</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={
                        employee.dot
                          ? moment(employee.dot)?.format("DD-MM-YYYY")
                          : ""
                      }
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Company Email</Typography>
                    <TextField
                      id="email"
                      type="email"
                      placeholder="Company Email"
                      value={employee.companyemail}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Company</Typography>
                    <OutlinedInput value={selectedCompany} readOnly={true} />

                    {/* <OutlinedInput id="component-outlined" type="text" placeholder="Company" readOnly value={selectedCompany} /> */}
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Branch</Typography>
                    <OutlinedInput value={selectedBranch} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Unit</Typography>
                    <OutlinedInput value={selectedUnit} readOnly={true} />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Department</Typography>
                    <OutlinedInput value={employee.department} readOnly={true} />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Team</Typography>
                    <OutlinedInput value={selectedTeam} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Floor</Typography>
                    <OutlinedInput value={employee.floor} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Area</Typography>
                    <OutlinedInput value={employee.area} readOnly={true} />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Designation</Typography>
                    <OutlinedInput value={selectedDesignation} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>System Count</Typography>
                    <OutlinedInput value={maxSelections} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Shift Type</Typography>
                    <OutlinedInput value={employee.shifttype} readOnly={true} />
                  </FormControl>
                </Grid>
                {employee.shifttype === "Standard" ? (
                  <>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography>Shift Grouping</Typography>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          value={employee.shiftgrouping}
                          readOnly={true}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography>Shift</Typography>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          value={employee.shifttiming}
                          readOnly={true}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={6} xs={12} sx={{ display: "flex" }}>
                      <FormControl fullWidth size="small">
                        <Typography>Week Off</Typography>
                        {employee?.boardingLog[0]?.weekoff?.length !== 0
                          ? employee?.boardingLog[0]?.weekoff?.map((data, index) => (
                            <Typography>
                              {index + 1}.{data}
                            </Typography>
                          ))
                          : ""}
                      </FormControl>
                    </Grid>
                  </>
                ) : null}

                <Grid item md={12} sm={12} xs={12}>
                  {employee.shifttype === "1 Week Rotation" ? (
                    <>
                      {todo.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Mode</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Grouping</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid
                            container
                            spacing={2}
                            key={index}
                            sx={{ paddingTop: "5px" }}
                          >
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  value={todo.shiftmode}
                                  readOnly={true}
                                />
                              </FormControl>
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <OutlinedInput
                                      value={todo.shiftgrouping}
                                      readOnly={true}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    {/* Fetching options */}
                                    <OutlinedInput
                                      value={todo.shifttiming}
                                      type="text"
                                      readOnly
                                    />
                                  </FormControl>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "2 Week Rotation" ? (
                    <>
                      {todo.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Mode</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Grouping</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  value={todo.shiftmode}
                                  readOnly={true}
                                />
                              </FormControl>
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    {" "}
                                    <OutlinedInput
                                      value={todo.shiftgrouping}
                                      readOnly={true}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    {/* Fetching options */}
                                    <OutlinedInput
                                      value={todo.shifttiming}
                                      type="text"
                                      readOnly
                                    />
                                  </FormControl>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "1 Month Rotation" ? (
                    <>
                      {todo.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Mode</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Grouping</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  value={todo.shiftmode}
                                  readOnly={true}
                                />
                              </FormControl>
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <OutlinedInput
                                      value={todo.shiftgrouping}
                                      readOnly={true}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    {/* Fetching options */}
                                    <OutlinedInput
                                      value={todo.shifttiming}
                                      type="text"
                                      readOnly
                                    />
                                  </FormControl>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "2 Month Rotation" ? (
                    <>
                      {todo.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Mode</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift Grouping</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>Shift </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  value={todo.shiftmode}
                                  readOnly={true}
                                />
                              </FormControl>
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <OutlinedInput
                                      value={todo.shiftgrouping}
                                      readOnly={true}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    {/* Fetching options */}
                                    <OutlinedInput
                                      value={todo.shifttiming}
                                      type="text"
                                      readOnly
                                    />
                                  </FormControl>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Reporting To</Typography>
                    <OutlinedInput value={employee.reportingto} readOnly={true} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  {employee.wordcheck === true ? (
                    <FormControl size="small" fullWidth>
                      <Typography>EmpCode(Manual)</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // disabled

                        // value={employee.empcode}
                        value={employeecodenew}
                        readOnly
                      />
                    </FormControl>
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Typography>EmpCode(Auto)</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // disabled
                        readOnly
                        // value={employee.empcode}
                        value={employee.empcode}
                      />
                    </FormControl>
                  )}
                </Grid>

                {employee.workmode !== "Remote" ? (
                  <>
                    {" "}
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Primary)</Typography>
                        <OutlinedInput value={primaryWorkStationLabel === "Please Select Primary Work Station" ? "" : primaryWorkStationLabel} readOnly={true} />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Secondary)</Typography>
                        {selectedOptionsWorkStation.length !== 0
                          ? selectedOptionsWorkStation.map((data, index) => (
                            <Typography>
                              {index + 1}.{data.value}
                            </Typography>
                          ))
                          : ""}
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>If Office</Typography>
                      </FormControl>
                      <Grid>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={employee.workstationofficestatus === true}
                              />
                            }
                            readObnly
                            label="Work Station Other"
                          />
                        </FormGroup>
                      </Grid>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (WFH)</Typography>
                        <OutlinedInput
                          value={primaryWorkStationInput}
                          readOnly={true}
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : null}

                {employee.workmode === "Remote" ? (
                  <>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Primary)</Typography>
                        <OutlinedInput value={primaryWorkStationLabel === "Please Select Primary Work Station" ? "" : primaryWorkStationLabel} readOnly={true} />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Secondary)</Typography>
                        {selectedOptionsWorkStation.length !== 0
                          ? selectedOptionsWorkStation.map((data, index) => (
                            <Typography>
                              {index + 1}.{data.value}
                            </Typography>
                          ))
                          : ""}
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (WFH)</Typography>
                        <OutlinedInput
                          value={primaryWorkStationInput}
                          readOnly={true}
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : null}

                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Workstation ShortName</Typography>
                    <TextareaAutosize aria-label="minimum height" minRows={5} readOnly
                      value={workstationTodoList?.length > 0 ? workstationTodoList?.map(data => data?.shortname)?.join(",") : ''}
                    // value={keyPrimaryShortname + keyShortname}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={8} xs={12} sm={12}>
                  <TableContainer size="small">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ py: 0.3 }}>
                            <Typography variant="subtitle1">Workstation</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.3 }}>
                            <Typography variant="subtitle1">Shortname</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.3 }}>
                            <Typography variant="subtitle1">Type</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {workstationTodoList.map((todo, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ py: 0.3 }}>
                              <Typography sx={{ fontSize: '0.9rem' }}>{todo.workstation}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.3 }}>
                              <Typography sx={{ fontSize: '0.9rem' }}>{todo.shortname}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.3 }}>
                              <Typography sx={{ fontSize: '0.9rem' }}>{todo.type}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                        {workstationTodoList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No Workstations.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
            <br />
          </Grid>

          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize !important",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={nextStepLog}>

                Next
              </Button>

              <Link
                to={backPath}
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px"
                }}
              >
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                >Cancel</Button>
              </Link>

            </Box>
          </Grid>

        </Grid>
      </>
    );
  };

  const renderStepThree = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography sx={userStyle.SubHeaderText}>
                {" "}
                Permanent Address
              </Typography>
              <br />
              <br />

              <>
                <Grid container spacing={2}>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Address Type</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={employee?.paddresstype}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Personal Prefix</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={employee?.ppersonalprefix}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Reference Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={employee?.presourcename}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Country</Typography>
                      <OutlinedInput
                        value={selectedCountryp?.name}
                        readOnly={true}
                      />
                    </FormControl>
                    {selectedCountryp?.name === "India" && (
                      <FormControlLabel
                        control={
                          <Checkbox checked={Boolean(employee?.pgenerateviapincode)}
                            readOnly
                            isDisabled={true}
                          />
                        }
                        label="Generate Via Pincode"
                      />
                    )}
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Pincode</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="number"
                        sx={userStyle.input}
                        readOnly
                        value={employee.ppincode}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>State</Typography>
                      <OutlinedInput value={employee?.pstate} readOnly={true} />
                    </FormControl>
                  </Grid>

                  {selectedCountryp?.name === "India" && employee?.pgenerateviapincode ?
                    <>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>District</Typography>
                          <OutlinedInput value={employee?.pdistrict || ""} readOnly={true} />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Village/City</Typography>
                          <OutlinedInput value={employee?.pvillageorcity || ""} readOnly={true} />
                        </FormControl>
                      </Grid>
                    </> :
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>City</Typography>
                        <OutlinedInput value={selectedCityp?.name} readOnly={true} />
                      </FormControl>
                    </Grid>
                  }


                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>GPS Coordinations</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        sx={userStyle.input}
                        readOnly
                        value={employee?.pgpscoordination}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Landmark & Positional Prefix</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={employee?.plandmarkandpositionalprefix}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Landmark  Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={employee.plandmark}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>House/Flat No</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={employee.pdoorno}
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Street/Road Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={employee.pstreet}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Locality/Area Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={employee.parea}
                      />
                    </FormControl>
                  </Grid>






                  <Grid item md={12} sm={12} xs={12}>
                    <FullAddressCard employee={{
                      ...employee,
                      pcity: selectedCityp?.name,
                      pstate: selectedStatep?.name,
                      pcountry: selectedCountryp?.name,
                      pvillageorcity: employee?.pvillageorcity || "",
                      pdistrict: employee?.pdistrict || "",

                    }} />
                  </Grid>
                </Grid>
              </>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    {" "}
                    Current Address
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <br />
              {!employee.samesprmnt ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address Type</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.caddresstype}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Personal Prefix</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.cpersonalprefix}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.cresourcename}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Country</Typography>
                        <OutlinedInput
                          value={selectedCountryc?.name}
                          readOnly={true}
                        />
                      </FormControl>
                      {selectedCountryc?.name === "India" && (
                        <FormControlLabel
                          control={
                            <Checkbox checked={employee?.cgenerateviapincode}
                              readOnly
                              isDisabled={true}
                            />
                          }
                          label="Generate Via Pincode"
                        />
                      )}
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Pincode</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          readOnly
                          value={employee.cpincode}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>State</Typography>
                        <OutlinedInput value={employee?.cstate} readOnly={true} />
                      </FormControl>
                    </Grid>

                    {selectedCountryc?.name === "India" && employee?.cgenerateviapincode ?
                      <>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>District</Typography>
                            <OutlinedInput value={employee?.cdistrict || ""} readOnly={true} />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Village/City</Typography>
                            <OutlinedInput value={employee?.cvillageorcity || ""} readOnly={true} />
                          </FormControl>
                        </Grid>
                      </> :
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>City</Typography>
                          <OutlinedInput value={selectedCityc?.name} readOnly={true} />
                        </FormControl>
                      </Grid>
                    }


                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>GPS Coordinations</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          sx={userStyle.input}
                          readOnly
                          value={employee?.cgpscoordination}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark & Positional Prefix</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.clandmarkandpositionalprefix}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark  Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.clandmark}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee.cdoorno}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.cstreet}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.carea}
                        />
                      </FormControl>
                    </Grid>







                  </Grid>
                </>
              ) : (
                // else condition starts here
                <>
                  <Grid container spacing={2}>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address Type</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.paddresstype}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Personal Prefix</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.ppersonalprefix}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.presourcename}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Country</Typography>
                        <OutlinedInput
                          value={selectedCountryp?.name}
                          readOnly={true}
                        />
                      </FormControl>
                      {selectedCountryp?.name === "India" && (
                        <FormControlLabel
                          control={
                            <Checkbox checked={Boolean(employee?.pgenerateviapincode)}
                              readOnly
                              isDisabled={true}
                            />
                          }
                          label="Generate Via Pincode"
                        />
                      )}
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Pincode</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          readOnly
                          value={employee.ppincode}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>State</Typography>
                        <OutlinedInput value={employee?.pstate} readOnly={true} />
                      </FormControl>
                    </Grid>

                    {selectedCountryp?.name === "India" && employee?.pgenerateviapincode ?
                      <>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>District</Typography>
                            <OutlinedInput value={employee?.pdistrict || ""} readOnly={true} />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Village/City</Typography>
                            <OutlinedInput value={employee?.pvillageorcity || ""} readOnly={true} />
                          </FormControl>
                        </Grid>
                      </> :
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>City</Typography>
                          <OutlinedInput value={selectedCityp?.name} readOnly={true} />
                        </FormControl>
                      </Grid>
                    }


                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>GPS Coordinations</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          sx={userStyle.input}
                          readOnly
                          value={employee?.pgpscoordination}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark & Positional Prefix</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee?.plandmarkandpositionalprefix}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark  Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.plandmark}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={employee.pdoorno}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.pstreet}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          readOnly
                          value={employee.parea}
                        />
                      </FormControl>
                    </Grid>







                  </Grid>
                </>
              )}
            </Box>
            <br />
          </Grid>

          <Grid item md={1} xs={12} sm={12} container alignItems="center">

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next" variant="contained" onClick={nextStep}
                size="small"
                sx={{
                  textTransform: "capitalize",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Next
              </Button>

              <Link
                to={backPath}
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px"
                }}
              >
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                >Cancel</Button>
              </Link>

            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepFour = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button className="prev" variant="contained"
              size="small"
              onClick={prevStep}
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
            >
              Previous
            </Button>
          </Grid>

          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.container}>
              <Typography sx={userStyle.SubHeaderText}> Document List </Typography>
              <br />
              <br />
              <br />
              <TableContainer component={Paper}>
                <Table aria-label="simple table" id="branch">
                  <TableHead sx={{ fontWeight: "600" }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">Document</StyledTableCell>
                      <StyledTableCell align="center">Remarks</StyledTableCell>
                      <StyledTableCell align="center">View</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {files &&
                      files.map((file, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{sno++}</StyledTableCell>
                          <StyledTableCell align="left">
                            {file.name}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <FormControl>
                              <OutlinedInput
                                sx={{
                                  height: "30px !important",
                                  background: "white",
                                  border: "1px solid rgb(0 0 0 / 48%)",
                                }}
                                size="small"
                                type="text"
                                readOnly
                                value={file.remark}
                              />
                            </FormControl>
                          </StyledTableCell>

                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                             {file?.orginpath === 'Employee Documents' ? (
                              <a
                                style={{
                                  color: '#357ae8',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent default anchor behavior
                                  downloadFile(file.preview);
                                }}
                              >
                                Download
                              </a>
                            ) : file?.path ? (
                              <a
                                style={{
                                  color: '#357ae8',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent default anchor behavior
                                  downloadFileDocument(file.filename);
                                }}
                              >
                                Download
                              </a>
                            ) : (
                              <a style={{ color: '#357ae8' }} href={`data:application/octet-stream;base64,${file.data}`} download={file.name}>
                                Download
                              </a>
                            )}
                            <a
                              style={{
                                color: '#357ae8',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                              onClick={() => renderFilePreview(file)}
                            >
                              View
                            </a>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <br /> <br />
              {/* // <button onClick={handleDownloadAll}>download All</button> */}
            </Box>
            <br />
            <Box sx={userStyle.container}>
              <br /> <br />
              <Typography sx={userStyle.SubHeaderText}>
                {" "}
                Educational Details{" "}
              </Typography>
              <br />
              <br />
              <br />
              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table aria-label="simple table" id="branch">
                  <TableHead sx={{ fontWeight: "600" }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">Category</StyledTableCell>
                      <StyledTableCell align="center">Sub Category</StyledTableCell>
                      <StyledTableCell align="center">
                        Specialization
                      </StyledTableCell>
                      <StyledTableCell align="center">Institution</StyledTableCell>
                      <StyledTableCell align="center">Passed Year</StyledTableCell>
                      <StyledTableCell align="center">% or cgpa</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {eduTodo &&
                      eduTodo.map((todo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">
                            {eduno++}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {todo.categoryedu}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {todo.subcategoryedu}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {todo.specialization}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.institution}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.passedyear}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.cgpa}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
            <br />
          </Grid>

          <Grid item md={1} xs={12} sm={12} container alignItems="center">

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize !important",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={nextStep}
              >
                Next
              </Button>
              <Link
                to={backPath}
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px"
                }}
              >
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}

                >Cancel</Button>
              </Link>


            </Box>

          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepFive = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={prevStep}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.container}>
              <Typography sx={userStyle.SubHeaderText}>
                Additional Qualification{" "}
              </Typography>

              <br />
              <br />

              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table
                  aria-label="simple table"
                  id="branch"
                // ref={tableRef}
                >
                  <TableHead sx={{ fontWeight: "600" }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">
                        Addl. Qualification
                      </StyledTableCell>
                      <StyledTableCell align="center">Institution</StyledTableCell>
                      <StyledTableCell align="center">Duration</StyledTableCell>
                      <StyledTableCell align="center">Remarks</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {addAddQuaTodo &&
                      addAddQuaTodo.map((addtodo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{skno++}</StyledTableCell>
                          <StyledTableCell align="center">
                            {addtodo.addQual}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {addtodo.addInst}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {addtodo.duration}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {addtodo.remarks}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
            <Box sx={userStyle.container}>
              <Typography sx={userStyle.SubHeaderText}>
                {" "}
                Work History Details{" "}
              </Typography>
              <br />
              <br />
              <br />
              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table
                  aria-label="simple table"
                  id="branch"
                // ref={tableRef}
                >
                  <TableHead sx={{ fontWeight: "600" }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">
                        Employee Name
                      </StyledTableCell>
                      <StyledTableCell align="center">Designation</StyledTableCell>
                      <StyledTableCell align="center">Joined On</StyledTableCell>
                      <StyledTableCell align="center">Leave On</StyledTableCell>
                      <StyledTableCell align="center">Duties</StyledTableCell>
                      <StyledTableCell align="center">
                        Reason for Leaving
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {workhistTodo &&
                      workhistTodo.map((todo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{sno++}</StyledTableCell>
                          <StyledTableCell align="left">
                            {todo.empNameTodo}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.desigTodo}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.joindateTodo
                              ? moment(todo.joindateTodo)?.format("DD-MM-YYYY")
                              : ""}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.leavedateTodo
                              ? moment(todo.leavedateTodo)?.format("DD-MM-YYYY")
                              : ""}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.dutiesTodo}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {todo.reasonTodo}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
          </Grid>

          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next" variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={nextStep}>
                Next
              </Button>
              <Link
                to={backPath}
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px"
                }}
              >
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                >Cancel</Button>
              </Link>

            </Box>

          </Grid>
        </Grid>
      </>
    );
  };

  const [accessible, setAccessible] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
    unit: "Please Select Unit",
    responsibleperson:
      String(employee.firstname).toUpperCase() +
      "." +
      String(employee.lastname).toUpperCase(),
  });

  const fetchAccessibleDetails = async (eployeename, employeecode) => {
    try {
      let req = await axios.post(SERVICE.GETUSERASSIGNBRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        empname: eployeename,
        empcode: employeecode,
      });
      let allData = req?.data?.assignbranch;

      if (allData?.length > 0) {
        let todos = allData?.map((data) => ({
          fromcompany: data.fromcompany,
          frombranch: data.frombranch,
          fromunit: data.fromunit,
          companycode: data.companycode,
          branchcode: data.branchcode,
          unitcode: data.unitcode,
          branchemail: data.branchemail,
          branchaddress: data.branchaddress,
          branchstate: data.branchstate,
          branchcity: data.branchcity,
          branchcountry: data.branchcountry,
          branchpincode: data.branchpincode,

          company: data?.company,
          branch: data?.branch,
          unit: data?.unit,
          employee: employee.companyname,
          employeecode: String(
            employee.wordcheck === true ? employeecodenew : employee.empcode
          ),
          id: data?._id,
          updatedby: data?.updatedby,
        }));
        setAccessibleTodo(todos);
        setAccessible({
          company: "Please Select Company",
          branch: "Please Select Branch",
          unit: "Please Select Unit",
          responsibleperson: employee.companyname,
          companycode: "",
          branchcode: "",
          unitcode: "",
          branchemail: "",
          branchaddress: "",
          branchstate: "",
          branchcity: "",
          branchcountry: "",
          branchpincode: "",
        });
      } else {
        setAccessible({
          company: "Please Select Company",
          branch: "Please Select Branch",
          unit: "Please Select Unit",
          responsibleperson: employee.companyname,
          companycode: "",
          branchcode: "",
          unitcode: "",
          branchemail: "",
          branchaddress: "",
          branchstate: "",
          branchcity: "",
          branchcountry: "",
          branchpincode: "",
        });
        setAccessibleTodo([]);
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

  const renderStepSix = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button className="prev" variant="contained"
              size="small"
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={prevStep}>
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            {bankTodo?.length > 0 && (
              <Box sx={userStyle.dialogbox}>
                <Typography sx={userStyle.SubHeaderText}>Bank Details </Typography>
                <br />
                <br />
                {bankTodo?.map((data, index) => (
                  <div key={index}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography sx={{ fontWeight: "bold" }}>{`Row No : ${index + 1
                          }`}</Typography>
                      </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={2}>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Bank Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.bankname}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Bank Branch Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.bankbranchname}
                            placeholder="Please Enter Bank Branch Name"
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Account Holder Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.accountholdername}
                            placeholder="Please Enter Account Holder Name"
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Account Number</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.accountnumber}
                            placeholder="Please Enter Account Number"
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>IFSC Code</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.ifsccode}
                            placeholder="Please Enter IFSC Code"
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Type of Account</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.accounttype}
                            placeholder="Please Enter IFSC Code"
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12} sx={{ display: "flex" }}>
                        <FormControl fullWidth size="small">
                          <Typography>Status</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={data.accountstatus ?? "In-Active"}
                            placeholder="Please Enter IFSC Code"
                            readOnly
                          />
                        </FormControl>
                      </Grid>

                      <Grid item md={6} xs={12} sm={12} sx={{ display: "flex" }}>
                        <Grid container spacing={2}>
                          {data?.proof?.length > 0 && (
                            <Grid
                              item
                              md={6}
                              sm={8}
                              xs={8}
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // marginTop: "10%",
                              }}
                            >
                              {data?.proof?.length > 0 &&
                                data?.proof.map((file) => (
                                  <>
                                    <Grid container spacing={2}>
                                      <Grid item lg={8} md={10} sm={8} xs={8}>
                                        <Typography
                                          style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "100%",
                                          }}
                                          title={file.name}
                                        >
                                          {file.name}
                                        </Typography>
                                      </Grid>
                                      <Grid item lg={1} md={2} sm={1} xs={1}>
                                        <VisibilityOutlinedIcon
                                          style={{
                                            fontsize: "large",
                                            color: "#357AE8",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => renderFilePreview(file)}
                                        />
                                      </Grid>
                                      <br />
                                      <br />
                                    </Grid>
                                  </>
                                ))}
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                    <br />
                  </div>
                ))}
              </Box>
            )}

            <br />
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    Exp Log Details{" "}
                  </Typography>
                </Grid>
                <Grid item md={1} xs={12} sm={4} marginTop={1}>
                  <Typography>Date</Typography>
                </Grid>
                <Grid item md={3} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value={
                        assignExperience.updatedate
                          ? moment(assignExperience.updatedate)?.format(
                            "DD-MM-YYYY"
                          )
                          : ""
                      }
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={1}>
                <Grid item md={4} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Mode Val</Typography>
                    <OutlinedInput
                      value={assignExperience.expmode}
                      readOnly={true}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <Typography>Value (In Months)</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value={assignExperience.expval}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={1}>
                <Grid item md={3} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Mode Exp</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value="Exp Stop"
                    />
                  </FormControl>
                </Grid>

                <Grid item md={3} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>End Exp</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value={assignExperience.endexp}
                    />
                  </FormControl>
                </Grid>

                {assignExperience.endexp === "Yes" ? (
                  <>
                    <Grid item md={3} xs={12} sm={4}>
                      <Typography>End Exp Date</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={
                          assignExperience.endexpdate
                            ? moment(assignExperience.endexpdate)?.format(
                              "DD-MM-YYYY"
                            )
                            : ""
                        }
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
              <br />
              <Grid container spacing={1}>
                <Grid item md={3} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Mode Target</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value="Target Stop"
                    />
                  </FormControl>
                </Grid>

                <Grid item md={3} xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>End Tar</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      readOnly
                      value={assignExperience.endtar}
                    />
                  </FormControl>
                </Grid>

                {assignExperience.endtar === "Yes" ? (
                  <>
                    <Grid item md={3} xs={12} sm={4}>
                      <Typography>End Tar Date</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        readOnly
                        value={
                          assignExperience.endtardate
                            ? moment(assignExperience.endtardate)?.format(
                              "DD-MM-YYYY"
                            )
                            : ""
                        }
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
              <br />
            </Box>
            <br />
            {/* process details add */}
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    Process Allot{" "}
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Process </Typography>
                  <FormControl fullWidth size="small">
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={loginNotAllot?.process}
                      readOnly
                    />
                  </FormControl>
                  {errorsLog.process && <div>{errorsLog.process}</div>}
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Process Type</Typography>
                  <FormControl fullWidth size="small">
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={loginNotAllot?.processtype}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Process Duration</Typography>
                  <FormControl fullWidth size="small">
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={loginNotAllot?.processduration}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={6}>
                  <Typography>Duration</Typography>
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={loginNotAllot?.time || ""}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={loginNotAllot?.timemins || ""}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                  {errorsLog.duration && <div>{errorsLog.duration}</div>}
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Gross Salary</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={overallgrosstotal}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Mode Experience</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={modeexperience}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Target Experience</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={targetexperience}
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Target Points</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={targetpts}
                      readOnly
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
            </Box>
            <br />

          </Grid>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button className="next" variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize",
                  width: "73px",
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={nextStep}>
                Next
              </Button>
              <Link to={backPath}>
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                > Cancel </Button>
              </Link>

            </Box>
          </Grid>
        </Grid>

      </>
    );
  };
  const renderStepSeven = () => {
    return (
      <>
        <Headtitle title={headTitle} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">
            <Button className="prev" variant="contained"
              size="small"
              sx={{
                display: { xs: "none", md: "flex" }, // Hide on small screens, show on large screens
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                left: { md: "10px" }, // Align left for large screens
                top: { md: "50%" }, // Center vertically for large screens
                transform: { md: "translateY(-50%)" }, // Center transform for large screens
                textTransform: "capitalize",
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={prevStep}>
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>

            {/* Accessible Company/Branch/Unit add details */}
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    Accessible Company/Branch/Unit
                  </Typography>
                </Grid>
              </Grid>
              <br />
              {accessibleTodo?.map((datas, index) => (
                <div key={index}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography sx={{ fontWeight: "bold" }}>{`Row No : ${index + 1
                        }`}</Typography>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Company</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={datas.fromcompany ?? ""}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Branch</Typography>

                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={datas.frombranch ?? ""}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Unit</Typography>

                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={datas.fromunit ?? ""}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                  <br />
                </div>
              ))}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    Connects
                  </Typography>

                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      &nbsp;
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox checked={createRocketChat?.create}

                          disabled={true} />
                      }
                      label="Create Account"
                    />
                  </FormControl>
                </Grid>
                {createRocketChat?.create && <>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Email
                      </Typography>
                      <Typography>{createRocketChat?.email}</Typography>

                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Role
                      </Typography>
                      <Typography>{createRocketChat?.roles?.join(",")}</Typography>
                    </FormControl>
                  </Grid>
                </>}

              </Grid>
            </Box>
            <br />
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>HI Connect</Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>&nbsp;</Typography>
                    <FormControlLabel control={<Checkbox checked={createHiConnect?.createhiconnect} disabled={true} />} label="Create Account" />
                  </FormControl>
                </Grid>
                {createHiConnect?.create && (
                  <>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Email</Typography>
                        <Typography>{createHiConnect?.hiconnectemail}</Typography>
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Role</Typography>
                        <Typography>{createHiConnect?.hiconnectroles?.join(',')}</Typography>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
          <Grid item md={1} xs={12} sm={12} container alignItems="center">

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" }, // Row for small screens, column for larger screens
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                gap: "10px",
                position: { xs: "static", md: "fixed" }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: "auto" }, // Align to bottom for small screens
                right: { xs: "auto", md: "10px" }, // Align right for large screens
                top: { xs: "auto", md: "50%" }, // Center vertically for large screens
                transform: { xs: "none", md: "translateY(-50%)" }, // Center transform for large screens
                width: "auto",
                padding: { xs: "0 5px", md: "0 10px" }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Link to={backPath}>
                <Button
                  size="small"
                  sx={{
                    ...buttonStyles.btncancel,
                    textTransform: "capitalize",
                    width: "73px",

                  }}
                > Cancel </Button>
              </Link>

            </Box>
          </Grid>
        </Grid>

      </>
    );
  };

  const renderIndicator = () => {
    return (
      <ul className="indicatoremployee">
        <li className={step === 1 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Personal Info
        </li>
        <li className={step === 2 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Login & Boarding Details
        </li>
        <li className={step === 3 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Address
        </li>
        <li className={step === 4 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Document
        </li>
        <li className={step === 5 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Work History
        </li>
        <li className={step === 6 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;Bank Details
        </li>
        <li className={step === 7 ? "active" : null}>
          <FaArrowAltCircleRight />
          &ensp;User Access
        </li>
      </ul>
    );
  };

  return (
    <div className="multistep-form">
      {renderIndicator()}
      {step === 1 ? renderStepOne() : null}
      {step === 2 ? renderStepTwo() : null}
      {step === 3 ? renderStepThree() : null}
      {step === 4 ? renderStepFour() : null}
      {step === 5 ? renderStepFive() : null}
      {step === 6 ? renderStepSix() : null}
      {step === 7 ? renderStepSeven() : null}

      {/* VALIDATION */}
      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      <LoadingBackdrop open={isLoading} />
    </div>

  );
}

export default MultistepForm;