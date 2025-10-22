import { Grid, Typography, Button, Dialog, InputAdornment, IconButton, DialogContent, DialogActions, Box, FormControl, InputLabel, OutlinedInput, DialogTitle } from '@mui/material';
import moment from 'moment-timezone';
import React, { useEffect, useState, useContext, useRef } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { loginSignIn } from './Loginstyle';
import axios from 'axios';
import { AuthContext, UserRoleAccessContext } from '../context/Appcontext';
import { AUTH } from '../services/Authservice';
import { SERVICE } from '../services/Baseservice';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import LinearProgress from '@mui/material/LinearProgress';
import loginimg from './crap-img.png';
import google from './google.png';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/footer/footer';
import * as faceapi from 'face-api.js';
import Beep from '../components/Sounds/beep.mp3';
import Chelle from '../components/Sounds/chelle.mp3';
import Chime from '../components/Sounds/chime.mp3';
import Ding from '../components/Sounds/ding.mp3';
import Door from '../components/Sounds/door.mp3';
import Droplet from '../components/Sounds/droplet.mp3';
import HighBell from '../components/Sounds/highbell.mp3';
import Seasons from '../components/Sounds/seasons.mp3';
import { CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';

import { BASE_URL } from '../services/Authservice';

const Signin = () => {
  const {
    setButtonStyles,
    setIsUserRoleAccess,
    setIsUserRoleCompare,
    setalltaskLimit,
    setAllprojects,
    setallTasks,
    setIsAssignBranch,
    setWorkStationSystemName,
    setallUsersLimit,
    setAllUsersData,
    setAllCompany,
    setAllBranch,
    setAllLocation,
    setAllArea,
    setAllFloor,
    setAllAreagrouping,
    setAllUnit,
    setAllTeam,
    setAllLocationgrouping,
    setAllDepartment,
    setAllDesignation,
    setTooltip,
    setListPageAccessMode,
  } = useContext(UserRoleAccessContext);

  const getCurrentServerTime = async () => {
    try {
      const response = await axios.get(SERVICE.GET_CURRENT_SERVER_TIME);
      console.log(response.data, 'resdata');
      let serverTime = response.data;

      // formatted,
      // currentNewDate,
      // currenttoLocaleTimeString

      return serverTime;
    } catch (err) {
      console.log(err, 'err getting server time');
    }
  };
  const [token, setToken] = useState('');
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [error, setError] = useState('');
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get('token');
    const redirectPathFromUrl = queryParams.get('redirectPath');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setRedirectPath(redirectPathFromUrl || '/dashboard');
    }
  }, []);
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [islogin, setislogin] = useState();
  const [
    showAlert,
    //  setShowAlert
  ] = useState();
  // const handleClickOpenerr = () => {
  //   setIsErrorOpen(true);
  // };

  const [status, setStatus] = useState('Connecting...');
  const [statusType, setStatusType] = useState('loading'); // "loading", "online", "offline"

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/connectionstatus?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (isMounted) {
          setStatus(data.status);
          setStatusType(data.status === 'Server is Online' ? 'online' : 'offline');
        }
      } catch (error) {
        console.error('❌ Fetch Error:', error);
        if (isMounted) {
          setStatus('Server Offline');
          setStatusType('offline');
        }
      } finally {
        if (isMounted) {
          setTimeout(fetchData, 30000);
        }
      }
    };

    fetchData(); // Initial call

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusIcon = () => {
    switch (statusType) {
      case 'online':
        return <CheckCircle sx={{ fontSize: 16, marginRight: 0.5 }} />;
      case 'offline':
        return <Error sx={{ fontSize: 16, marginRight: 0.5 }} />;
      case 'loading':
      default:
        return <HourglassEmpty sx={{ fontSize: 16, marginRight: 0.5 }} />;
    }
  };

  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  let systemUsername;
  let linkExpiryDate;
  var today = new Date();
  var todayDate = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  var todayDateFormat = `${dd}/${mm}/${yyyy}`;

  // Get yesterday's date
  var yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  var ddp = String(yesterday.getDate()).padStart(2, '0');
  var mmp = String(yesterday.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyyp = yesterday.getFullYear();

  var yesterdayDate = yyyyp + '-' + mmp + '-' + ddp;
  var yesterdayDateFormat = `${ddp}/${mmp}/${yyyyp}`;

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const url = window.location.href;
  function decryptString(str) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const shift = 3; // You should use the same shift value used in encryption
    let decrypted = '';
    for (let i = 0; i < str.length; i++) {
      let charIndex = characters.indexOf(str[i]);
      if (charIndex === -1) {
        // If character is not found, add it directly to the decrypted string
        decrypted += str[i];
      } else {
        // Reverse the shift for decryption
        charIndex = (charIndex - shift + characters.length) % characters.length;
        decrypted += characters[charIndex];
      }
    }
    return decrypted;
  }
  // Function to get query parameters from the URL
  function getQueryParams(url) {
    const params = {};
    const queryString = url.split('?')[1]; // Get everything after the '?'
    if (queryString) {
      const pairs = queryString.split('&');
      pairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value); // Decode the value
      });
    }
    return params;
  }

  // Get the systemInfo parameter from the URL
  const queryParams = getQueryParams(url);
  const systemInfoString = queryParams.systemInfo;

  // Parse the JSON string into an object
  if (systemInfoString) {
    const systemInfo = JSON.parse(systemInfoString);
    systemUsername = decryptString(systemInfo.username);
    const dateExpiry = decryptString(systemInfo.expirydate);
    linkExpiryDate = new Date(dateExpiry);
  } else {
    console.log('No systemInfo parameter found in the URL');
  }
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('signinbackground');
    return () => {
      document.body.classList.remove('signinbackground');
    };
  }, []);

  const [signin, setSignin] = useState({
    username: '',
    password: '',
    twofaotp: '',
    publicIP: '',
  });
  const [showTwofa, setShowTwofa] = useState(false);

  const { auth, setAuth, setQrImage, qrImage } = useContext(AuthContext);

  const backPage = useNavigate();

  useEffect(() => {
    fetchIP();
  }, []);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    switch: false,
    image: '',
  });
  useEffect(() => {
    fetchNotification();
  }, []);
  const fetchNotification = async () => {
    const response = await axios.get(SERVICE.CONTROL_NOTIFICATIONSETTINGS_LAST_INDEX);
    setNotificationData({ switch: response?.data?.overallsettings?.notificationswitch || false, image: response?.data?.overallsettings?.notificationimage || '' });
  };
  useEffect(() => {
    if (notificationData.switch && notificationData.image) {
      setNotificationOpen(true);
    } else {
      setNotificationOpen(false);
    }
  }, [notificationData]);

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };
  // get all assignBranches
  const fetchAllAssignBranch = async (name, code) => {
    try {
      let res = await axios.post(SERVICE.GETUSERASSIGNBRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        empcode: code,
        empname: name,
      });

      const ansswer = res?.data?.assignbranch.map((data, index) => {
        return {
          tocompany: data.company,
          tobranch: data.branch,
          tounit: data.unit,
          companycode: data.companycode,
          branchcode: data.branchcode,
          branchemail: data.branchemail,
          branchaddress: data.branchaddress,
          branchstate: data.branchstate,
          branchcity: data.branchcity,
          branchcountry: data.branchcountry,
          branchpincode: data.branchpincode,
          unitcode: data.unitcode,
          employee: data.employee,
          employeecode: data.employeecode,
          company: data.fromcompany,
          branch: data.frombranch,
          unit: data.fromunit,
          branchphone: data.branchphone,
          modulenameurl: data.modulenameurl,
          submodulenameurl: data.submodulenameurl,
          mainpagenameurl: data.mainpagenameurl,
          subpagenameurl: data.subpagenameurl,
          subsubpagenameurl: data.subsubpagenameurl,
          _id: data._id,
        };
      });
      return ansswer?.length > 0 ? ansswer : [];
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        console.log(messages);
      } else {
        console.log(messages);
      }
    }
  };

  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const getLocalIP = async () => {
      const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then((sdp) => pc.setLocalDescription(sdp));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
        if (myIP) setIpAddress(myIP[1]);
        pc.onicecandidate = null;
      };
    };

    getLocalIP();
  }, []);

  const fetchIP = async () => {
    const response = await axios.get('https://api.ipify.org?format=json');
    setSignin({ ...signin, publicIP: response?.data?.ip });
  };

  const isCurrentTimeInShift = async (shifts, servertime) => {
    if (!shifts) return false; // Return false if shifts array is not provided

    const now = new Date(servertime);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentInMinutes = currentHour * 60 + currentMinute;

    for (let shift of shifts) {
      if (!shift?.shift) continue; // Skip if no shift
      if (shift?.shift === 'Week Off') continue; // Skip "Week Off" shifts

      const [startTime, endTime] = shift?.shift?.split('to').map((time) => time.trim());

      // Check if the shift starts in PM and ends in AM
      const isStartInPM = startTime.includes('PM');
      const isEndInAM = endTime.includes('AM');

      if (isStartInPM && isEndInAM) {
        // Function to convert time string to hours and minutes
        const parseTime = (time) => {
          if (!time) {
            return { hours: 0, minutes: 0 };
          }
          let [hours, minutes] = time
            ?.match(/(\d+):(\d+)(AM|PM)/)
            ?.slice(1, 3)
            ?.map(Number);
          const period = time.slice(-2);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return { hours, minutes };
        };

        // Set start to 12:00AM and use end time from the shift
        const start = parseTime('12:00AM');
        const end = parseTime(endTime);

        // Calculate the start and end times in minutes
        const startInMinutes = start.hours * 60 + start.minutes; // 0 minutes
        const endInMinutes = end.hours * 60 + end.minutes;

        // Check if the current time is between 12:00AM and the shift's end time
        if (currentInMinutes >= startInMinutes && currentInMinutes <= endInMinutes) {
          return true;
        }
      }
    }

    return false; // Return false if no shifts match the conditions
  };

  async function fetchCheckinStatus(loginid, shifttime, from) {
    try {
      const res = await axios.post(SERVICE.LOGINOUT_USERID, {
        loginid: loginid,
        shifttime,
      });
      localStorage.setItem('currentaddedshifttime', shifttime);
      let buttonHideShow = res?.data?.attstatus[res?.data?.attstatus?.length - 1];

      return buttonHideShow;
    } catch (err) {
      console.log(err);
    }
  }

  // const fetchHandler = async (faceData) => {
  //   let holiday = false;

  //   try {
  //     const currDate = new Date();
  //     const currDay = currDate.getDay();
  //     let startMonthDate = new Date(yesterdayDate);
  //     let endMonthDate = new Date(today);

  //     const daysArray = [];

  //     while (startMonthDate <= endMonthDate) {
  //       const formattedDate = `${String(startMonthDate.getDate()).padStart(
  //         2,
  //         "0"
  //       )}/${String(startMonthDate.getMonth() + 1).padStart(
  //         2,
  //         "0"
  //       )}/${startMonthDate.getFullYear()}`;
  //       const dayName = startMonthDate.toLocaleDateString("en-US", {
  //         weekday: "long",
  //       });
  //       const dayCount = startMonthDate.getDate();
  //       const shiftMode = "Main Shift";

  //       daysArray.push({ formattedDate, dayName, dayCount, shiftMode });

  //       // Move to the next day
  //       startMonthDate.setDate(startMonthDate.getDate() + 1);
  //     }
  //     console.log(window.location.hostname, "window.location.hostname");
  //     const [response, res_status, notificationSoundPreview] = await Promise.all([
  //       axios.post(`${!faceData ? AUTH.LOGINCHECK : AUTH.FACEDETECTLOGIN}`, {
  //         username: String(signin.username),
  //         password: String(signin.password),
  //         publicIP: String(signin.publicIP),
  //         otp: String(signin.twofaotp),
  //         hostname: "none",
  //         macAddress: "none",
  //         version: "1.4.0",
  //         applogin: false,
  //         currenturl: String(window.location.hostname),
  //         faceDescriptor: faceData,
  //       }),
  //       axios.get(SERVICE.TODAY_HOLIDAY),
  //       axios.get(SERVICE.ALL_NOTIFICATION_SOUNDS),
  //     ]);
  //     console.log(
  //       response?.data?.loginapprestriction,
  //       "response?.data?.loginapprestriction"
  //     );
  //     const sigindate = response?.data?.suser?.sigindate;
  //     const notificationsounds =
  //       notificationSoundPreview?.data?.notificationsound[notificationSoundPreview?.data?.notificationsound?.length - 1] ? notificationSoundPreview?.data?.notificationsound[notificationSoundPreview?.data?.notificationsound?.length - 1]?.sound : null;
  //     const attendanceExtraTime =
  //       response?.data?.controlcriteria?.length > 0
  //         ? response?.data?.controlcriteria[
  //         response?.data?.controlcriteria?.length - 1
  //         ]
  //         : "";
  //     const prevAddHours = attendanceExtraTime
  //       ? Number(attendanceExtraTime?.clockout)
  //       : 0;
  //     const afterAddHours = attendanceExtraTime
  //       ? Number(attendanceExtraTime?.clockin)
  //       : 0;

  //     const userId = response?.data?.result?._id;
  //     if (
  //       response?.data?.loginapprestriction === "loginrestirct" &&
  //       !response?.data?.result?.role?.includes("Manager")
  //     ) {
  //       // console.log(1)
  //       setErrorMessage("Login Restricted.Please Try Again Later..");
  //       setislogin(true);
  //       stopVideo();
  //     } else if (
  //       response?.data?.loginapprestriction === "desktopapponly" &&
  //       (systemUsername === undefined || systemUsername === null)
  //     ) {
  //       // console.log(2)
  //       setErrorMessage("Login Restricted.Please SignIn Via HRMS App..");
  //       setislogin(true);
  //       stopVideo();
  //     } else if (
  //       response?.data?.result?.loginUserStatus?.length === 0 &&
  //       response?.data?.loginapprestriction !== "urlonlywithoutauthentication"
  //     ) {
  //       // console.log(3)
  //       setErrorMessage(
  //         "Login Restricted Temporarily.Please SignIn Via HRMS App.."
  //       );
  //       setislogin(true);
  //       stopVideo();
  //     } else if (
  //       systemUsername != undefined &&
  //       systemUsername != signin.username
  //     ) {
  //       // console.log(8)
  //       setErrorMessage("Login Restricted due to different username");
  //       setislogin(true);
  //       stopVideo();
  //     } else if (
  //       response?.data?.loginapprestriction === "desktopurl" &&
  //       systemUsername != undefined &&
  //       linkExpiryDate <= new Date()
  //     ) {
  //       setErrorMessage("RedirectionLink Expired.Login Again Using App");
  //       setislogin(true);
  //       stopVideo();
  //     } else if (
  //       response?.data?.loginapprestriction === "desktopapponly" &&
  //       systemUsername != undefined &&
  //       linkExpiryDate <= new Date()
  //     ) {
  //       setErrorMessage("RedirectionLink Expired.Login Again Using App");
  //       setislogin(true);
  //       stopVideo();
  //     } else {
  //       const [resuseratt, loginusershift] = await Promise.all([
  //         axios.post(`${AUTH.GETUSERATTINV}`, {
  //           userid: String(response?.data?.result?._id),
  //         }),
  //         axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_CHECKLOGIN, {
  //           userDates: daysArray,
  //           empcode: response?.data?.result?.empcode,
  //         }),
  //       ]);
  //       console.log(daysArray, "daysArray");
  //       console.log(loginusershift, "loginusershift");

  //       const yesrtedayShifts = loginusershift?.data?.finaluser?.filter(
  //         (data) => data?.formattedDate === yesterdayDateFormat
  //       );
  //       // console.log(yesrtedayShifts, "yesrtedayShifts");
  //       const todayShifts = loginusershift?.data?.finaluser?.filter(
  //         (data) => data?.formattedDate === todayDateFormat
  //       );

  //       const isInYesterdayShift = await isCurrentTimeInShift(
  //         yesrtedayShifts?.length > 0
  //           ? [yesrtedayShifts[yesrtedayShifts?.length - 1]]
  //           : []
  //       );
  //       // console.log(isInYesterdayShift, "isInYesterdayShift");
  //       const finalShift = isInYesterdayShift ? yesrtedayShifts : todayShifts;
  //       // console.log(finalShift, "finalShift");
  //       const mainshifttimespl =
  //         finalShift[0]?.shift != "Week Off"
  //           ? finalShift[0]?.shift?.split("to")
  //           : "";
  //       const secondshifttimespl =
  //         finalShift?.length > 1 ? finalShift[1]?.shift?.split("to") : "";

  //       const addHours = (time, hours) => {
  //         return moment(time, "hh:mmA").add(hours, "hours").format("hh:mmA");
  //       };
  //       const updatedMainShiftTiming =
  //         mainshifttimespl?.length > 0
  //           ? [
  //             addHours(mainshifttimespl[0], 0),
  //             addHours(mainshifttimespl[1], 0),
  //           ]
  //           : [];

  //       const updatedSecondShiftTiming =
  //         secondshifttimespl?.length > 0
  //           ? [
  //             addHours(secondshifttimespl[0], 0),
  //             addHours(secondshifttimespl[1], 0),
  //           ]
  //           : [];
  //       const getTimeRanges = (timeRange) => {
  //         const [start, end] = timeRange.split("-");
  //         return { start, end };
  //       };
  //       const isCurrentTimeInRange = (start, end) => {
  //         const now = moment();
  //         // const startTime = moment(start, "hh:mmA");
  //         // const endTime = moment(end, "hh:mmA");
  //         const startTime = moment(start, "hh:mmA").subtract(
  //           afterAddHours,
  //           "hours"
  //         );
  //         const endTime = moment(end, "hh:mmA").add(prevAddHours, "hours");

  //         if (endTime.isBefore(startTime)) {
  //           // Handles overnight ranges
  //           return (
  //             now.isBetween(startTime, moment().endOf("day")) ||
  //             now.isBetween(moment().startOf("day"), endTime)
  //           );
  //         } else {
  //           return now.isBetween(startTime, endTime);
  //         }
  //       };
  //       const { start: start1, end: end1 } = getTimeRanges(
  //         updatedMainShiftTiming[0] + "-" + updatedMainShiftTiming[1]
  //       );
  //       const { start: start2, end: end2 } = getTimeRanges(
  //         updatedSecondShiftTiming[0] + "-" + updatedSecondShiftTiming[1]
  //       );

  //       let secondshiftmode =
  //         finalShift?.length > 1
  //           ? mainshifttimespl[1] === secondshifttimespl[0]
  //             ? "Continuous Shift"
  //             : "Double Shift"
  //           : "";
  //       // console.
  //       // console.log(start1, end1);
  //       // console.log(start2, end2);
  //       const updateCheckMainTiming =
  //         isCurrentTimeInRange(start1, end1) ||
  //         isCurrentTimeInRange(start2, end2);
  //       const addedFirstShiftInRange = isCurrentTimeInRange(
  //         start1,
  //         end1,
  //         "three"
  //       );
  //       const addedSecondShiftInRange = isCurrentTimeInRange(
  //         start2,
  //         end2,
  //         "four"
  //       );
  //       const isCurrentTimeInRangeNew = (start, end, from) => {
  //         const now = moment();
  //         let startTime = moment(start, "hh:mmA").set({
  //           year: now.year(),
  //           month: now.month(),
  //           date: now.date(),
  //         });
  //         let endTime = moment(end, "hh:mmA").set({
  //           year: now.year(),
  //           month: now.month(),
  //           date: now.date(),
  //         });

  //         // If the end time is in AM and before the start time, assume the shift spans overnight
  //         if (endTime.isBefore(startTime)) {
  //           startTime.subtract(1, "days"); // Treat start time as yesterday
  //         }

  //         return now.isBetween(startTime, endTime);
  //       };

  //       //for continouos shift
  //       const addedTimeinFirstShiftStart = moment(start1, "hh:mmA").subtract(
  //         afterAddHours,
  //         "hours"
  //       );
  //       const addedTimeinSecondShiftStart = moment(start2, "hh:mmA").subtract(
  //         afterAddHours,
  //         "hours"
  //       );
  //       const addedTimeinFirstShiftEnd = moment(end1, "hh:mmA").add(
  //         prevAddHours,
  //         "hours"
  //       );
  //       const addedTimeinSecondShiftEnd = moment(end2, "hh:mmA").add(
  //         prevAddHours,
  //         "hours"
  //       );
  //       const addedFirstShiftInRangeWithoutGrace =
  //         (secondshiftmode === "Continuous Shift" ||
  //           secondshiftmode === "Double Shift") &&
  //         isCurrentTimeInRangeNew(
  //           addedTimeinFirstShiftStart,
  //           mainshifttimespl[1],
  //           "onenew"
  //         );
  //       const addedSecondShiftInRangeWithoutGrace =
  //         (secondshiftmode === "Continuous Shift" ||
  //           secondshiftmode === "Double Shift") &&
  //         isCurrentTimeInRangeNew(
  //           secondshifttimespl[0],
  //           addedTimeinSecondShiftEnd,
  //           "twomew"
  //         );

  //       let buttonHideShow;
  //       if (addedFirstShiftInRangeWithoutGrace) {
  //         buttonHideShow = await fetchCheckinStatus(
  //           response?.data?.result?._id,
  //           `${moment(addedTimeinFirstShiftStart, "hh:mmA").format(
  //             "HH:mm"
  //           )} - ${moment(mainshifttimespl[1], "hh:mmA").format("HH:mm")}`,
  //           "one"
  //         );
  //       } else if (addedSecondShiftInRangeWithoutGrace) {
  //         buttonHideShow = await fetchCheckinStatus(
  //           response?.data?.result?._id,
  //           `${moment(secondshifttimespl[0], "hh:mmA").format(
  //             "HH:mm"
  //           )} - ${moment(addedTimeinSecondShiftEnd, "hh:mmA").format(
  //             "HH:mm"
  //           )}`,
  //           "two"
  //         );
  //       } else if (addedFirstShiftInRange) {
  //         buttonHideShow = await fetchCheckinStatus(
  //           response?.data?.result?._id,
  //           `${moment(addedTimeinFirstShiftStart, "hh:mmA").format(
  //             "HH:mm"
  //           )} - ${moment(addedTimeinFirstShiftEnd, "hh:mmA").format("HH:mm")}`,
  //           "three"
  //         );
  //       } else if (addedSecondShiftInRange) {
  //         buttonHideShow = await fetchCheckinStatus(
  //           response?.data?.result?._id,
  //           `${moment(addedTimeinSecondShiftStart, "hh:mmA").format(
  //             "HH:mm"
  //           )} - ${moment(addedTimeinSecondShiftEnd, "hh:mmA").format(
  //             "HH:mm"
  //           )}`,
  //           "four"
  //         );
  //       }
  //       let buttonName = buttonHideShow?.buttonname;

  //       const reslogstatus = response?.data?.result?.loginUserStatus.filter(
  //         (data, index) => {
  //           return data.macaddress != "none";
  //         }
  //       );
  //       const currentDay = new Date().toLocaleDateString("en-US", {
  //         weekday: "long",
  //       });
  //       // // Check if the current day matches any day in the array
  //       const currentDateStatusFinalUser =
  //         loginusershift?.data?.finaluser?.find(
  //           (data) => data?.dayName === currentDay
  //         );
  //       const isCurrentDayInArray =
  //         response?.data?.result?.weekoff?.includes(currentDay) == true
  //           ? currentDateStatusFinalUser?.shift === "Week Off"
  //           : false;

  //       const holidayDate = res_status?.data?.holiday.filter((data, index) => {
  //         return (
  //           (data.company.includes(response?.data?.result?.company) &&
  //             data.applicablefor.includes(response?.data?.result?.branch) &&
  //             data.unit.includes(response?.data?.result?.unit) &&
  //             data.team.includes(response?.data?.result?.team) &&
  //             data.employee.includes(response?.data?.result?.companyname)) ||
  //           (data.company.includes(response?.data?.result?.company) &&
  //             data.applicablefor.includes(response?.data?.result?.branch) &&
  //             data.unit.includes(response?.data?.result?.unit) &&
  //             data.team.includes(response?.data?.result?.team) &&
  //             data.employee.includes("ALL"))
  //         );
  //       });
  //       if (
  //         holidayDate?.some(
  //           (item) =>
  //             moment(item.date).format("DD-MM-YYYY") ==
  //             moment(currDate).format("DD-MM-YYYY")
  //         )
  //       ) {
  //         holiday = true;
  //       }
  //       if (response?.data?.result?.role?.includes("Manager")) {
  //         handleLogin(response, loginusershift, notificationsounds);
  //       } else if (
  //         (systemUsername === undefined || systemUsername === null) &&
  //         response?.data?.loginapprestriction === "desktopapponly"
  //       ) {
  //         setErrorMessage("Login Restricted.Please SignIn Via HRMS App..");
  //         setislogin(true);
  //         stopVideo();
  //       } else if (
  //         (systemUsername === undefined || systemUsername === null) &&
  //         response?.data?.loginapprestriction === "desktopurl" &&
  //         reslogstatus?.length === 0
  //       ) {
  //         setErrorMessage("Login Restricted.Please SignIn Via HRMS App..");
  //         setislogin(true);
  //         stopVideo();
  //       } else if (
  //         (systemUsername === undefined || systemUsername === null) &&
  //         response?.data?.loginapprestriction === "desktopurl" &&
  //         (resuseratt?.data?.attandances?.buttonstatus == "false" ||
  //           resuseratt?.data?.attandances == {} ||
  //           resuseratt?.data?.attandances?.buttonstatus === undefined) &&
  //         reslogstatus?.length === 0
  //       ) {
  //         setErrorMessage("Login Restricted.Please SignIn Via HRMS App..");
  //         setislogin(true);
  //         stopVideo();
  //       } else if (
  //         (systemUsername === undefined || systemUsername === null) &&
  //         response?.data?.loginapprestriction == "urlonly" &&
  //         reslogstatus?.length === 0
  //       ) {
  //         setErrorMessage("Login Restricted.Please SignIn Via HRMS App..");
  //         setislogin(true);
  //         stopVideo();
  //       } else if (
  //         systemUsername != undefined &&
  //         systemUsername != signin.username
  //       ) {
  //         setErrorMessage("Login Restricted due to different username");
  //         setislogin(true);
  //         stopVideo();
  //       } else if (
  //         !response?.data?.result?.role?.includes("Manager") &&
  //         holiday
  //       ) {
  //         console.log("1");
  //         if (
  //           response?.data?.result?.extrastatus &&
  //           (response?.data?.result?.extraTimeStatus?.length < 1 ||
  //             response?.data?.result?.extraTimeStatus?.length === undefined) &&
  //           (response?.data?.result?.extratimestatus === undefined ||
  //             response?.data?.result?.extratimestatus === "" ||
  //             ["permanent-used"].includes(
  //               response?.data?.result?.extratimestatus
  //             )) &&
  //           response?.data?.result?.extrapermanentdate !==
  //           moment().format("DD-MM-YYYY")
  //         ) {
  //           console.log("506");
  //           const date = new Date();
  //           const extraHoursMin = response?.data?.result?.extratime;
  //           const [hours, minutes] = extraHoursMin.split(":").map(Number);
  //           // Add hours and minutes to the date
  //           date.setHours(date.getHours() + hours);
  //           date.setMinutes(date.getMinutes() + minutes);
  //           const expDate = date;
  //           if (response?.data?.result?.extrastatus === "One Time") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "onetime-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (response?.data?.result?.extrastatus === "Permanent") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "permanent-using",
  //                 extrapermanentdate: moment().format("DD-MM-YYYY"),
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate
  //           ) {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "manual-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else {
  //             console.log("553");
  //             setErrorMessage("Today Holiday! Login Restricted");
  //             setislogin(true);
  //             stopVideo();
  //           }
  //         } else if (
  //           response?.data?.result?.extrastatus &&
  //           response?.data?.result?.extraTimeStatus?.length > 0 &&
  //           !["onetime-used", "manual-used"]?.includes(
  //             response?.data?.result?.extratimestatus
  //           )
  //         ) {
  //           console.log("560");
  //           const ExpiredStatusData =
  //             response?.data?.result?.extraTimeStatus[0];
  //           if (
  //             response?.data?.result?.extrastatus === "One Time" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             // console.log("21")
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Permanent" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             // console.log("22")
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             console.log("580");
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: [],
  //                 extratimestatus:
  //                   response?.data?.result?.extrastatus === "One Time"
  //                     ? "onetime-used"
  //                     : response?.data?.result?.extrastatus === "Permanent"
  //                       ? "permanent-used"
  //                       : response?.data?.result?.extrastatus === "Manual"
  //                         ? "manual-used"
  //                         : "",
  //               }
  //             );
  //             setErrorMessage("Today Holiday! Login Restricted");
  //             setislogin(true);
  //             stopVideo();
  //           }
  //         } else {
  //           console.log("600");
  //           setErrorMessage("Today Holiday! Login Restricted");
  //           setislogin(true);
  //           stopVideo();
  //         }
  //       } else if (
  //         !response?.data?.result?.role?.includes("Manager") &&
  //         finalShift[0]?.shift === "Week Off"
  //       ) {
  //         // console.log("2")
  //         if (
  //           response?.data?.result?.extrastatus &&
  //           (response?.data?.result?.extraTimeStatus?.length < 1 ||
  //             response?.data?.result?.extraTimeStatus?.length === undefined) &&
  //           (response?.data?.result?.extratimestatus === undefined ||
  //             response?.data?.result?.extratimestatus === "" ||
  //             ["permanent-used"].includes(
  //               response?.data?.result?.extratimestatus
  //             )) &&
  //           response?.data?.result?.extrapermanentdate !==
  //           moment().format("DD-MM-YYYY")
  //         ) {
  //           const date = new Date();
  //           const extraHoursMin = response?.data?.result?.extratime;
  //           const [hours, minutes] = extraHoursMin.split(":").map(Number);
  //           // Add hours and minutes to the date
  //           date.setHours(date.getHours() + hours);
  //           date.setMinutes(date.getMinutes() + minutes);
  //           const expDate = date;
  //           if (response?.data?.result?.extrastatus === "One Time") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "onetime-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (response?.data?.result?.extrastatus === "Permanent") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "permanent-using",
  //                 extrapermanentdate: moment().format("DD-MM-YYYY"),
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate
  //           ) {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "manual-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else {
  //             setErrorMessage("Today WeekOff! Login Restricted!..");
  //             setislogin(true);
  //             stopVideo();
  //           }
  //         } else if (
  //           response?.data?.result?.extrastatus &&
  //           response?.data?.result?.extraTimeStatus?.length > 0 &&
  //           !["onetime-used", "manual-used"]?.includes(
  //             response?.data?.result?.extratimestatus
  //           )
  //         ) {
  //           const ExpiredStatusData =
  //             response?.data?.result?.extraTimeStatus[0];
  //           if (
  //             response?.data?.result?.extrastatus === "One Time" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Permanent" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: [],
  //                 extratimestatus:
  //                   response?.data?.result?.extrastatus === "One Time"
  //                     ? "onetime-used"
  //                     : response?.data?.result?.extrastatus === "Permanent"
  //                       ? "permanent-used"
  //                       : response?.data?.result?.extrastatus === "Manual"
  //                         ? "manual-used"
  //                         : "",
  //               }
  //             );
  //             setErrorMessage("Today WeekOff! Login Restricted!..");
  //             setislogin(true);
  //             stopVideo();
  //           }
  //         } else {
  //           setErrorMessage("Today WeekOff! Login Restricted!..");
  //           setislogin(true);
  //           stopVideo();
  //         }
  //       } else if (updateCheckMainTiming && !holiday && !isCurrentDayInArray) {
  //         // console.log("3")
  //         if (
  //           Number(response?.data?.result?.employeecount) === 0 ||
  //           response?.data?.result?.employeecount === undefined
  //         ) {
  //           setErrorMessage(
  //             "System is not alloted.Please Contact Administrator"
  //           );
  //           setislogin(true);
  //           stopVideo();
  //         } else {
  //           handleLogin(response, loginusershift, notificationsounds);
  //         }
  //       } else {
  //         // console.log("4")
  //         if (
  //           response?.data?.result?.extrastatus &&
  //           (response?.data?.result?.extraTimeStatus?.length < 1 ||
  //             response?.data?.result?.extraTimeStatus?.length === undefined) &&
  //           (response?.data?.result?.extratimestatus === undefined ||
  //             response?.data?.result?.extratimestatus === "" ||
  //             ["permanent-used"].includes(
  //               response?.data?.result?.extratimestatus
  //             )) &&
  //           response?.data?.result?.extrapermanentdate !==
  //           moment().format("DD-MM-YYYY")
  //         ) {
  //           // console.log("4 1")
  //           const date = new Date();
  //           const extraHoursMin = response?.data?.result?.extratime;
  //           const [hours, minutes] = extraHoursMin.split(":").map(Number);
  //           // Add hours and minutes to the date
  //           date.setHours(date.getHours() + hours);
  //           date.setMinutes(date.getMinutes() + minutes);
  //           const expDate = date;

  //           if (response?.data?.result?.extrastatus === "One Time") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "onetime-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (response?.data?.result?.extrastatus === "Permanent") {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "permanent-using",
  //                 extrapermanentdate: moment().format("DD-MM-YYYY"),
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate
  //           ) {
  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: {
  //                   sigindate: new Date(),
  //                   status: "Active",
  //                   resetstatus: response?.data?.result?.extrastatus,
  //                   expireddate: expDate,
  //                 },
  //                 extratimestatus: "manual-using",
  //               }
  //             );
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "" ||
  //             undefined
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           }
  //         } else if (
  //           response?.data?.result?.extrastatus &&
  //           response?.data?.result?.extraTimeStatus?.length > 0 &&
  //           !["onetime-used", "manual-used"]?.includes(
  //             response?.data?.result?.extratimestatus
  //           )
  //         ) {
  //           const ExpiredStatusData =
  //             response?.data?.result?.extraTimeStatus[0];
  //           if (
  //             response?.data?.result?.extrastatus === "One Time" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Permanent" &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "Manual" &&
  //             moment().format("YYYY-MM-DD") ===
  //             response?.data?.result?.extradate &&
  //             new Date(ExpiredStatusData?.expireddate) >= new Date()
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else if (
  //             response?.data?.result?.extrastatus === "" ||
  //             undefined
  //           ) {
  //             handleLogin(response, loginusershift, notificationsounds);
  //           } else {
  //             // console.log("33");

  //             let res = await axios.put(
  //               `${SERVICE.USER_SINGLE_PWD}/${userId}`,
  //               {
  //                 extraTimeStatus: [],
  //                 extratimestatus:
  //                   response?.data?.result?.extrastatus === "One Time"
  //                     ? "onetime-used"
  //                     : response?.data?.result?.extrastatus === "Permanent"
  //                       ? "permanent-used"
  //                       : response?.data?.result?.extrastatus === "Manual"
  //                         ? "manual-used"
  //                         : "",
  //               }
  //             );

  //             setErrorMessage("Shift Is Not Allotted.Contact Administrator");
  //             setislogin(true);
  //             stopVideo();
  //           }
  //         } else if (
  //           !response?.data?.result?.role?.includes("Manager") &&
  //           buttonName === "SHIFT CLOSED" &&
  //           new Date() < new Date(buttonHideShow?.calculatedshiftend) &&
  //           buttonHideShow?.buttonstatus === "false" &&
  //           response?.data?.loginapprestriction !==
  //           "urlonlywithoutauthentication"
  //         ) {
  //           setErrorMessage("Login Restricted!You Have Clocked Out!");
  //           setislogin(true);
  //           stopVideo();
  //           return;
  //         } else {
  //           setErrorMessage("Shift Is Not Allotted.Contact Administrator");
  //           setislogin(true);
  //           stopVideo();
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.log(err, "err");
  //     setislogin(true);
  //     stopVideo();
  //     const messages = err?.response?.data?.message;
  //     if (messages) {
  //       setErrorMessage(messages);
  //     } else {
  //       setErrorMessage("Something went wrong. Please check your connection!");
  //     }
  //     backPage("/signin");
  //   }
  // };

  const fetchHandler = async (faceData) => {
    let holiday = false;

    try {
      const serverTime = await getCurrentServerTime();
      const currentServerDate = moment(serverTime?.currentNewDate).format('YYYY-MM-DD');
      var today = new Date(serverTime?.currentNewDate);
      var todayDate = new Date(serverTime?.currentNewDate);
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      var yyyy = today.getFullYear();
      today = yyyy + '-' + mm + '-' + dd;
      var todayDateFormat = `${dd}/${mm}/${yyyy}`;

      // Get yesterday's date
      var yesterday = new Date(todayDate);
      yesterday.setDate(todayDate.getDate() - 1);
      var ddp = String(yesterday.getDate()).padStart(2, '0');
      var mmp = String(yesterday.getMonth() + 1).padStart(2, '0'); // January is 0!
      var yyyyp = yesterday.getFullYear();

      var yesterdayDate = yyyyp + '-' + mmp + '-' + ddp;
      var yesterdayDateFormat = `${ddp}/${mmp}/${yyyyp}`;

      const currDate = new Date(serverTime?.currentNewDate);
      const currDay = currDate.getDay();
      let startMonthDate = new Date(yesterdayDate);
      let endMonthDate = new Date(today);

      const daysArray = [];

      while (startMonthDate <= endMonthDate) {
        const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
        const dayName = startMonthDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const dayCount = startMonthDate.getDate();
        const shiftMode = 'Main Shift';

        daysArray.push({ formattedDate, dayName, dayCount, shiftMode });

        // Move to the next day
        startMonthDate.setDate(startMonthDate.getDate() + 1);
      }
      const [response, res_status] = await Promise.all([
        axios.post(`${!faceData ? AUTH.LOGINCHECK : AUTH.FACEDETECTLOGIN}`, {
          username: String(signin.username),
          password: String(signin.password),
          publicIP: String(signin.publicIP),
          otp: String(signin.twofaotp),
          hostname: 'none',
          macAddress: 'none',
          version: '1.4.0',
          applogin: false,
          currenturl: String(window.location.hostname),
          faceDescriptor: faceData,
          loginvia: token !== '' && token !== undefined ? 'token' : 'signin',
          token: token,
        }),
        axios.get(SERVICE.TODAY_HOLIDAY),
      ]);
      const sigindate = response?.data?.suser?.sigindate;
      const holidayWeekOffStatus = response?.data?.holidayWeekOffRestriction;
      const controlcriteriaWeekOff = response?.data?.userCheckInControlCriteria ? response?.data?.userCheckInControlCriteria?.enableweekoff : false;
      const controlcriteriaHoliday = response?.data?.userCheckInControlCriteria ? response?.data?.userCheckInControlCriteria?.enableHoliday : false;

      const attendanceExtraTime = response?.data?.controlcriteria?.length > 0 ? response?.data?.controlcriteria[response?.data?.controlcriteria?.length - 1] : '';
      const prevAddHours = attendanceExtraTime ? Number(attendanceExtraTime?.clockout) : 0;
      const afterAddHours = attendanceExtraTime ? Number(attendanceExtraTime?.clockin) : 0;

      const userId = response?.data?.result?._id;

      const [resuseratt, loginusershift] = await Promise.all([
        axios.post(`${AUTH.GETUSERATTINV}`, {
          userid: String(response?.data?.result?._id),
        }),
        axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_CHECKLOGIN, {
          userDates: daysArray,
          empcode: response?.data?.result?.empcode,
        }),
      ]);
      console.log(loginusershift?.data?.finaluser, 'loginusershift?.data?.finaluser');
      console.log(yesterdayDateFormat, todayDateFormat, 'yesterdayDateFormat,todayDateFormat');

      // if (!response?.data?.result?.role?.includes('Manager') && loginusershift?.data?.finaluser[1]?.shift?.includes('Not Allotted')) {
      //   setErrorMessage('Shift Not Allotted Contact Administrator!');
      //   setislogin(true);
      //   stopVideo();
      // } else {
      const yesrtedayShifts = loginusershift?.data?.finaluser?.filter((data) => data?.formattedDate === yesterdayDateFormat);

      const todayShifts = loginusershift?.data?.finaluser?.filter((data) => data?.formattedDate === todayDateFormat);

      const isInYesterdayShift = await isCurrentTimeInShift(yesrtedayShifts?.length > 0 ? [yesrtedayShifts[yesrtedayShifts?.length - 1]] : [], serverTime?.currentNewDate);

      const finalShift = isInYesterdayShift ? yesrtedayShifts : todayShifts;
      console.log(finalShift, 'finalshift');

      const mainshifttimespl = finalShift[0]?.shift != 'Week Off' ? finalShift[0]?.shift?.split('to') : '';
      const secondshifttimespl = finalShift?.length > 1 ? finalShift[1]?.shift?.split('to') : '';

      const addHours = (time, hours) => {
        console.log(moment(`${currentServerDate} ${time}`, 'YYYY-MM-DD hh:mmA').add(hours, 'hours').format('hh:mmA'), 'sffsdfsdfsd');
        return moment(`${currentServerDate} ${time}`, 'YYYY-MM-DD hh:mmA').add(hours, 'hours').format('hh:mmA');
      };
      const updatedMainShiftTiming = mainshifttimespl?.length > 0 ? [addHours(mainshifttimespl[0], 0), addHours(mainshifttimespl[1], 0)] : [];

      const updatedSecondShiftTiming = secondshifttimespl?.length > 0 ? [addHours(secondshifttimespl[0], 0), addHours(secondshifttimespl[1], 0)] : [];
      const getTimeRanges = (timeRange) => {
        const [start, end] = timeRange.split('-');
        return { start, end };
      };
      const isCurrentTimeInRange = (start, end) => {
        const now = moment(serverTime?.currentNewDate);
        console.log(now, 'now', start, end);
        // const startTime = moment(start, "hh:mmA");
        // const endTime = moment(end, "hh:mmA");
        const currentDate = moment(serverTime?.currentNewDate).format('YYYY-MM-DD');

        const startTime = moment(`${currentDate} ${start}`, 'YYYY-MM-DD hh:mmA').subtract(afterAddHours, 'hours');
        const endTime = moment(`${currentDate} ${end}`, 'YYYY-MM-DD hh:mmA').add(prevAddHours, 'hours');

        if (endTime.isBefore(startTime)) {
          // Handles overnight ranges
          return now.isBetween(startTime, moment(serverTime?.currentNewDate).endOf('day')) || now.isBetween(moment(serverTime?.currentNewDate).startOf('day'), endTime);
        } else {
          return now.isBetween(startTime, endTime);
        }
      };
      const { start: start1, end: end1 } = getTimeRanges(updatedMainShiftTiming[0] + '-' + updatedMainShiftTiming[1]);
      const { start: start2, end: end2 } = getTimeRanges(updatedSecondShiftTiming[0] + '-' + updatedSecondShiftTiming[1]);

      let secondshiftmode = finalShift?.length > 1 ? (mainshifttimespl[1] === secondshifttimespl[0] ? 'Continuous Shift' : 'Double Shift') : '';

      const updateCheckMainTiming = isCurrentTimeInRange(start1, end1) || isCurrentTimeInRange(start2, end2);
      const LoginRestriction = updateCheckMainTiming ? response?.data?.restrictionBtwShift : response?.data?.loginapprestriction;
      console.log(LoginRestriction, 'LoginRestriction');
      if (LoginRestriction === 'loginrestirct' && !response?.data?.result?.role?.includes('Manager')) {
        setErrorMessage('Login Restricted.Please Try Again Later..');
        setislogin(true);
        stopVideo();
      } else if (LoginRestriction === 'desktopapponly' && (systemUsername === undefined || systemUsername === null)) {
        setErrorMessage('Login Restricted.Please SignIn Via HRMS App..');
        setislogin(true);
        stopVideo();
      } else if (response?.data?.result?.loginUserStatus?.length === 0 && LoginRestriction !== 'urlonlywithoutauthentication') {
        setErrorMessage('Login Restricted Temporarily.Please SignIn Via HRMS App..');
        setislogin(true);
        stopVideo();
      } else if (finalShift?.length > 0 && (finalShift[0]?.shift?.includes('Not Allotted') || !finalShift[0]?.shift)) {
        // } else if (loginusershift?.data?.finaluser[1]?.shift?.includes('Not Allotted')) {
        setErrorMessage('Shift Not Allotted Contact Administrator!');
        setislogin(true);
        stopVideo();
      } else if (systemUsername != undefined && systemUsername != response?.data?.result?.username) {
        // console.log(8)
        setErrorMessage('Login Restricted due to different username');
        setislogin(true);
        stopVideo();
      } else if (LoginRestriction === 'desktopurl' && systemUsername != undefined && linkExpiryDate <= new Date(serverTime?.currentNewDate)) {
        setErrorMessage('RedirectionLink Expired.Login Again Using App');
        setislogin(true);
        stopVideo();
      } else if (LoginRestriction === 'desktopapponly' && systemUsername != undefined && linkExpiryDate <= new Date(serverTime?.currentNewDate)) {
        setErrorMessage('RedirectionLink Expired.Login Again Using App');
        setislogin(true);
        stopVideo();
      } else {
        const addedFirstShiftInRange = isCurrentTimeInRange(start1, end1, 'three');
        const addedSecondShiftInRange = isCurrentTimeInRange(start2, end2, 'four');
        const isCurrentTimeInRangeNew = (start, end, from) => {
          const now = moment(serverTime?.currentNewDate);
          const currentDate = moment(serverTime?.currentNewDate).format('YYYY-MM-DD');
          let startTime = moment(`${currentDate} ${start}`, 'YYYY-MM-DD hh:mmA').set({
            year: now.year(),
            month: now.month(),
            date: now.date(),
          });
          let endTime = moment(`${currentDate} ${end}`, 'YYYY-MM-DD hh:mmA').set({
            year: now.year(),
            month: now.month(),
            date: now.date(),
          });

          // If the end time is in AM and before the start time, assume the shift spans overnight
          if (endTime.isBefore(startTime)) {
            startTime.subtract(1, 'days'); // Treat start time as yesterday
          }

          return now.isBetween(startTime, endTime);
        };

        //for continouos shift
        const addedTimeinFirstShiftStart = moment(`${currentServerDate} ${start1}`, 'YYYY-MM-DD hh:mmA').subtract(afterAddHours, 'hours');
        const addedTimeinSecondShiftStart = moment(`${currentServerDate} ${start2}`, 'YYYY-MM-DD hh:mmA').subtract(afterAddHours, 'hours');
        const addedTimeinFirstShiftEnd = moment(`${currentServerDate} ${end1}`, 'YYYY-MM-DD hh:mmA').add(prevAddHours, 'hours');
        const addedTimeinSecondShiftEnd = moment(`${currentServerDate} ${start1}`, 'YYYY-MM-DD hh:mmA').add(prevAddHours, 'hours');
        const addedFirstShiftInRangeWithoutGrace = (secondshiftmode === 'Continuous Shift' || secondshiftmode === 'Double Shift') && isCurrentTimeInRangeNew(addedTimeinFirstShiftStart, mainshifttimespl[1], 'onenew');
        const addedSecondShiftInRangeWithoutGrace = (secondshiftmode === 'Continuous Shift' || secondshiftmode === 'Double Shift') && isCurrentTimeInRangeNew(secondshifttimespl[0], addedTimeinSecondShiftEnd, 'twomew');

        let buttonHideShow;
        if (addedFirstShiftInRangeWithoutGrace) {
          buttonHideShow = await fetchCheckinStatus(response?.data?.result?._id, `${moment(addedTimeinFirstShiftStart, 'hh:mmA').format('HH:mm')} - ${moment(mainshifttimespl[1], 'hh:mmA').format('HH:mm')}`, 'one');
        } else if (addedSecondShiftInRangeWithoutGrace) {
          buttonHideShow = await fetchCheckinStatus(response?.data?.result?._id, `${moment(secondshifttimespl[0], 'hh:mmA').format('HH:mm')} - ${moment(addedTimeinSecondShiftEnd, 'hh:mmA').format('HH:mm')}`, 'two');
        } else if (addedFirstShiftInRange) {
          buttonHideShow = await fetchCheckinStatus(response?.data?.result?._id, `${moment(addedTimeinFirstShiftStart, 'hh:mmA').format('HH:mm')} - ${moment(addedTimeinFirstShiftEnd, 'hh:mmA').format('HH:mm')}`, 'three');
        } else if (addedSecondShiftInRange) {
          buttonHideShow = await fetchCheckinStatus(response?.data?.result?._id, `${moment(addedTimeinSecondShiftStart, 'hh:mmA').format('HH:mm')} - ${moment(addedTimeinSecondShiftEnd, 'hh:mmA').format('HH:mm')}`, 'four');
        }
        let buttonName = buttonHideShow?.buttonname;
        console.log(buttonName, 'ButtonName');

        const reslogstatus = response?.data?.result?.loginUserStatus.filter((data, index) => {
          return data.macaddress != 'none';
        });
        const currentDay = new Date(serverTime?.currentNewDate).toLocaleDateString('en-US', {
          weekday: 'long',
        });
        // // Check if the current day matches any day in the array
        const currentDateStatusFinalUser = loginusershift?.data?.finaluser?.find((data) => data?.dayName === currentDay);
        const isCurrentDayInArray = response?.data?.result?.weekoff?.includes(currentDay) == true ? currentDateStatusFinalUser?.shift === 'Week Off' : false;

        const holidayDate = res_status?.data?.holiday.filter((data, index) => {
          return (
            (data.company.includes(response?.data?.result?.company) &&
              data.applicablefor.includes(response?.data?.result?.branch) &&
              data.unit.includes(response?.data?.result?.unit) &&
              data.team.includes(response?.data?.result?.team) &&
              data.employee.includes(response?.data?.result?.companyname)) ||
            (data.company.includes(response?.data?.result?.company) && data.applicablefor.includes(response?.data?.result?.branch) && data.unit.includes(response?.data?.result?.unit) && data.team.includes(response?.data?.result?.team) && data.employee.includes('ALL'))
          );
        });
        console.log(res_status?.data?.holiday, 'res_status?.data?.holiday');
        console.log(response?.data?.result, 'response?.data?.result');
        if (holidayDate?.some((item) => moment(item.date).format('DD-MM-YYYY') == moment(serverTime?.currentNewDate).format('DD-MM-YYYY'))) {
          holiday = true;
        }
        if (LoginRestriction === 'desktopclockinout' && buttonName === 'CLOCKIN' && (systemUsername === undefined || systemUsername === null)) {
          setErrorMessage('Please log in via the app at least once to access the website features.');
          setislogin(true);
          stopVideo();
        } else if (LoginRestriction === 'desktopclockinout' && buttonName === 'CLOCKIN' && (systemUsername !== undefined || systemUsername !== null) && linkExpiryDate <= new Date(serverTime?.currentNewDate)) {
          setErrorMessage('RedirectionLink Expired.Login Again Using App');
          setislogin(true);
          stopVideo();
        } else if (response?.data?.result?.role?.includes('Manager')) {
          console.log('logggggggggggggggggggggggggggg');
          handleLogin(response, loginusershift);
        } else if ((systemUsername === undefined || systemUsername === null) && LoginRestriction === 'desktopapponly') {
          setErrorMessage('Login Restricted.Please SignIn Via HRMS App..');
          setislogin(true);
          stopVideo();
        } else if ((systemUsername === undefined || systemUsername === null) && LoginRestriction === 'desktopurl' && reslogstatus?.length === 0) {
          setErrorMessage('Login Restricted.Please SignIn Via HRMS App..');
          setislogin(true);
          stopVideo();
        } else if (
          (systemUsername === undefined || systemUsername === null) &&
          LoginRestriction === 'desktopurl' &&
          (resuseratt?.data?.attandances?.buttonstatus == 'false' || resuseratt?.data?.attandances == {} || resuseratt?.data?.attandances?.buttonstatus === undefined) &&
          reslogstatus?.length === 0
        ) {
          setErrorMessage('Login Restricted.Please SignIn Via HRMS App..');
          setislogin(true);
          stopVideo();
        } else if ((systemUsername === undefined || systemUsername === null) && LoginRestriction == 'urlonly' && reslogstatus?.length === 0) {
          setErrorMessage('Login Restricted.Please SignIn Via HRMS App..');
          setislogin(true);
          stopVideo();
        } else if (systemUsername != undefined && systemUsername != response?.data?.result?.username) {
          setErrorMessage('Login Restricted due to different username');
          setislogin(true);
          stopVideo();
        } else if (!response?.data?.result?.role?.includes('Manager') && holiday) {
          if (
            response?.data?.result?.extrastatus &&
            (response?.data?.result?.extraTimeStatus?.length < 1 || response?.data?.result?.extraTimeStatus?.length === undefined) &&
            (response?.data?.result?.extratimestatus === undefined || response?.data?.result?.extratimestatus === '' || ['permanent-used'].includes(response?.data?.result?.extratimestatus)) &&
            response?.data?.result?.extrapermanentdate !== moment(serverTime?.currentNewDate).format('DD-MM-YYYY')
          ) {
            const date = new Date(serverTime?.currentNewDate);
            const extraHoursMin = response?.data?.result?.extratime;
            const [hours, minutes] = extraHoursMin.split(':').map(Number);
            // Add hours and minutes to the date
            date.setHours(date.getHours() + hours);
            date.setMinutes(date.getMinutes() + minutes);
            const expDate = date;
            if (response?.data?.result?.extrastatus === 'One Time') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'onetime-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'permanent-using',
                extrapermanentdate: moment(serverTime?.currentNewDate).format('DD-MM-YYYY'),
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate) {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'manual-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (controlcriteriaHoliday && !holidayWeekOffStatus) {
              alert(`Today Holiday, You are login with Temporary Access`);
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else {
              setErrorMessage('Today Holiday! Login Restricted');
              setislogin(true);
              stopVideo();
            }
          } else if (response?.data?.result?.extrastatus && response?.data?.result?.extraTimeStatus?.length > 0 && !['onetime-used', 'manual-used']?.includes(response?.data?.result?.extratimestatus)) {
            const ExpiredStatusData = response?.data?.result?.extraTimeStatus[0];
            if (response?.data?.result?.extrastatus === 'One Time' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              handleLogin(response, loginusershift);
            } else {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: [],
                extratimestatus: response?.data?.result?.extrastatus === 'One Time' ? 'onetime-used' : response?.data?.result?.extrastatus === 'Permanent' ? 'permanent-used' : response?.data?.result?.extrastatus === 'Manual' ? 'manual-used' : '',
              });
              if (controlcriteriaHoliday && !holidayWeekOffStatus) {
                alert(`Today Holiday, You are login with Temporary Access`);
                handleLogin(response, loginusershift);
              } else {
                setErrorMessage('Today Holiday! Login Restricted');
                setislogin(true);
                stopVideo();
              }
            }
          } else if (controlcriteriaHoliday && !holidayWeekOffStatus) {
            alert(`Today Holiday, You are login with Temporary Access`);
            console.log('logggggggggggggggggggggggggggg');
            handleLogin(response, loginusershift);
          } else {
            setErrorMessage('Today Holiday! Login Restricted');
            setislogin(true);
            stopVideo();
          }
        } else if (!response?.data?.result?.role?.includes('Manager') && finalShift[0]?.shift === 'Week Off') {
          if (
            response?.data?.result?.extrastatus &&
            (response?.data?.result?.extraTimeStatus?.length < 1 || response?.data?.result?.extraTimeStatus?.length === undefined) &&
            (response?.data?.result?.extratimestatus === undefined || response?.data?.result?.extratimestatus === '' || ['permanent-used'].includes(response?.data?.result?.extratimestatus)) &&
            response?.data?.result?.extrapermanentdate !== moment(serverTime?.currentNewDate).format('DD-MM-YYYY')
          ) {
            const date = new Date(serverTime?.currentNewDate);
            const extraHoursMin = response?.data?.result?.extratime;
            const [hours, minutes] = extraHoursMin.split(':').map(Number);
            // Add hours and minutes to the date
            date.setHours(date.getHours() + hours);
            date.setMinutes(date.getMinutes() + minutes);
            const expDate = date;
            if (response?.data?.result?.extrastatus === 'One Time') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'onetime-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'permanent-using',
                extrapermanentdate: moment(serverTime?.currentNewDate).format('DD-MM-YYYY'),
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate) {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'manual-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (controlcriteriaWeekOff && !holidayWeekOffStatus) {
              alert(`Today WeekOff, You are login with Temporary Access`);
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else {
              setErrorMessage('Today WeekOff! Login Restricted!..');
              setislogin(true);
              stopVideo();
            }
          } else if (response?.data?.result?.extrastatus && response?.data?.result?.extraTimeStatus?.length > 0 && !['onetime-used', 'manual-used']?.includes(response?.data?.result?.extratimestatus)) {
            const ExpiredStatusData = response?.data?.result?.extraTimeStatus[0];
            if (response?.data?.result?.extrastatus === 'One Time' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: [],
                extratimestatus: response?.data?.result?.extrastatus === 'One Time' ? 'onetime-used' : response?.data?.result?.extrastatus === 'Permanent' ? 'permanent-used' : response?.data?.result?.extrastatus === 'Manual' ? 'manual-used' : '',
              });
              if (controlcriteriaWeekOff && !holidayWeekOffStatus) {
                alert(`Today WeekOff, You are login with Temporary Access`);
                console.log('logggggggggggggggggggggggggggg');
                handleLogin(response, loginusershift);
              } else {
                setErrorMessage('Today WeekOff! Login Restricted!..');
                setislogin(true);
                stopVideo();
              }
            }
          } else if (controlcriteriaWeekOff && !holidayWeekOffStatus) {
            alert(`Today WeekOff, You are login with Temporary Access`);
            console.log('logggggggggggggggggggggggggggg');
            handleLogin(response, loginusershift);
          } else {
            setErrorMessage('Today WeekOff! Login Restricted!..');
            setislogin(true);
            stopVideo();
          }
        } else if (updateCheckMainTiming && !holiday && !isCurrentDayInArray) {
          if (Number(response?.data?.result?.employeecount) === 0 || response?.data?.result?.employeecount === undefined) {
            setErrorMessage('System is not alloted.Please Contact Administrator');
            setislogin(true);
            stopVideo();
          } else if (
            !response?.data?.result?.role?.includes('Manager') &&
            buttonName === 'SHIFT CLOSED' &&
            new Date(serverTime?.currentNewDate) < new Date(buttonHideShow?.calculatedshiftend) &&
            buttonHideShow?.buttonstatus === 'false'
            // && LoginRestriction !== 'urlonlywithoutauthentication'
          ) {
            setErrorMessage('Login Restricted!You Have Clocked Out!');
            setislogin(true);
            stopVideo();
            return;
          } else {
            console.log('logggggggggggggggggggggggggggg');
            handleLogin(response, loginusershift);
          }
        } else {
          if (
            response?.data?.result?.extrastatus &&
            (response?.data?.result?.extraTimeStatus?.length < 1 || response?.data?.result?.extraTimeStatus?.length === undefined) &&
            (response?.data?.result?.extratimestatus === undefined || response?.data?.result?.extratimestatus === '' || ['permanent-used'].includes(response?.data?.result?.extratimestatus)) &&
            response?.data?.result?.extrapermanentdate !== moment(serverTime?.currentNewDate).format('DD-MM-YYYY')
          ) {
            const date = new Date(serverTime?.currentNewDate);
            const extraHoursMin = response?.data?.result?.extratime;
            const [hours, minutes] = extraHoursMin.split(':').map(Number);
            // Add hours and minutes to the date
            date.setHours(date.getHours() + hours);
            date.setMinutes(date.getMinutes() + minutes);
            const expDate = date;

            if (response?.data?.result?.extrastatus === 'One Time') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'onetime-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent') {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'permanent-using',
                extrapermanentdate: moment(serverTime?.currentNewDate).format('DD-MM-YYYY'),
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate) {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: {
                  sigindate: new Date(serverTime?.currentNewDate),
                  status: 'Active',
                  resetstatus: response?.data?.result?.extrastatus,
                  expireddate: expDate,
                },
                extratimestatus: 'manual-using',
              });
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === '' || !response?.data?.result?.extrastatus) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            }
          } else if (response?.data?.result?.extrastatus && response?.data?.result?.extraTimeStatus?.length > 0 && !['onetime-used', 'manual-used']?.includes(response?.data?.result?.extratimestatus)) {
            const ExpiredStatusData = response?.data?.result?.extraTimeStatus[0];
            if (response?.data?.result?.extrastatus === 'One Time' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Permanent' && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === 'Manual' && moment(serverTime?.currentNewDate).format('YYYY-MM-DD') === response?.data?.result?.extradate && new Date(ExpiredStatusData?.expireddate) >= new Date(serverTime?.currentNewDate)) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else if (response?.data?.result?.extrastatus === '' || !response?.data?.result?.extrastatus) {
              console.log('logggggggggggggggggggggggggggg');
              handleLogin(response, loginusershift);
            } else {
              let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${userId}`, {
                extraTimeStatus: [],
                extratimestatus: response?.data?.result?.extrastatus === 'One Time' ? 'onetime-used' : response?.data?.result?.extrastatus === 'Permanent' ? 'permanent-used' : response?.data?.result?.extrastatus === 'Manual' ? 'manual-used' : '',
              });
              console.log('abcd 1');
              setErrorMessage('Shift Is Not Allotted.Contact Administrator');
              setislogin(true);
              stopVideo();
            }
          } else if (
            !response?.data?.result?.role?.includes('Manager') &&
            buttonName === 'SHIFT CLOSED' &&
            new Date(serverTime?.currentNewDate) < new Date(buttonHideShow?.calculatedshiftend) &&
            buttonHideShow?.buttonstatus === 'false'
            // && LoginRestriction !== 'urlonlywithoutauthentication'
          ) {
            setErrorMessage('Login Restricted!You Have Clocked Out!');
            setislogin(true);
            stopVideo();
            return;
          } else {
            console.log('abcd 2');
            setErrorMessage('Shift Is Not Allotted.Contact Administrator');
            setislogin(true);
            stopVideo();
          }
        }
      }
      // }
    } catch (err) {
      console.log(err, 'err1');
      setislogin(true);
      stopVideo();
      const messages = err?.response?.data?.message;
      if (messages) {
        setErrorMessage(messages);
      } else {
        setErrorMessage('Something went wrong. Please check your connection!');
      }
      backPage('/signin');
    }
  };
  const workStationSystemNameFunc = async (conpanyDatas, branchDatas, unitDatas, accessiblebranch) => {
    try {
      // Fetch data
      let res_employee = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Flatten and transform the data
      const result = res_employee?.data?.locationgroupings.flatMap((item) =>
        item.combinstation.flatMap((combinstationItem) =>
          combinstationItem.subTodos.length > 0
            ? combinstationItem.subTodos.map((subTodo) => ({
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              floor: item.floor,
              id: item._id,
              cabinname: subTodo.subcabinname,
            }))
            : [
              {
                company: item.company,
                branch: item.branch,
                unit: item.unit,
                floor: item.floor,
                id: item._id,
                cabinname: combinstationItem.cabinname,
              },
            ]
        )
      );

      // Create lookup tables for company, branch, and unit codes
      const companyLookup = Object.fromEntries(conpanyDatas.map((item) => [item.name, item.code]));
      const branchLookup = Object.fromEntries(branchDatas.map((item) => [item.name, item.code]));
      const unitLookup = Object.fromEntries(unitDatas.map((item) => [item.name, item.code]));

      // Count occurrences and transform the data
      const counts = {};
      const updatedData = result.map((item) => {
        // Increment count for each unique company-branch-unit-floor combination
        const key = `${item.company}-${item.branch}-${item.unit}-${item.floor}`;
        counts[key] = (counts[key] || 0) + 1;

        // Add codes using the lookup tables
        const companyCode = companyLookup[item.company] || '';
        const branchCode = branchLookup[item.branch] || '';
        const unitCode = unitLookup[item.unit] || '';

        // Create system names
        return {
          ...item,
          companycode: companyCode,
          branchcode: branchCode,
          unitcode: unitCode,
          count: counts[key],
          systemname: `${companyCode}_${branchCode}#${counts[key]}#${unitCode}_${item.cabinname}`,
          systemshortname: `${branchCode}_${counts[key]}_${unitCode}_${item.cabinname}`,
        };
      });

      // Filter data based on accessible branches
      const filteredData = updatedData.filter((item) => accessiblebranch.some((branch) => branch.company === item.company && branch.branch === item.branch && branch.unit === item.unit));
      // Set the final result
      setWorkStationSystemName(filteredData);
    } catch (err) {
      console.error('Error:', err);
      const messages = err?.response?.data?.message;
      if (messages) {
        console.error('Error message:', messages);
      }
    }
  };

  const handleLogin = async (response, loginusershift) => {
    // console.log(9)
    localStorage.setItem('APIToken', response?.data?.token);
    localStorage.setItem('LoginUserId', response?.data?.result?._id);
    localStorage.setItem('LoginUserrole', response?.data?.result?.role);
    localStorage.setItem('LoginUsercode', response?.data?.result?.empcode);

    const serverTime = await getCurrentServerTime();
    const userId = response?.data?.result?._id;
    const userrole = response?.data?.result?.role;
    const userempcode = response?.data?.result?.empcode;

    var today = new Date(serverTime?.currentNewDate);
    var todayDate = new Date(serverTime?.currentNewDate);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var todayDateFormat = `${dd}/${mm}/${yyyy}`;

    // Get yesterday's date
    var yesterday = new Date(todayDate);
    yesterday.setDate(todayDate.getDate() - 1);
    var ddp = String(yesterday.getDate()).padStart(2, '0');
    var mmp = String(yesterday.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyyp = yesterday.getFullYear();

    var yesterdayDate = yyyyp + '-' + mmp + '-' + ddp;
    var yesterdayDateFormat = `${ddp}/${mmp}/${yyyyp}`;

    const [loginuserdata, userroles, documents, allcompany, allbranch, allunit, allteam, listpageaccessmode, controlpanel] = await Promise.all([
      axios.get(`${AUTH.GETUSER}/${userId}`),
      axios.post(AUTH.GETAUTHROLE, {
        userrole: userrole,
      }),
      axios.post(AUTH.GETDOCUMENTS, {
        commonid: userId,
      }),
      axios.get(SERVICE.COMPANY),
      axios.get(SERVICE.BRANCH),
      axios.get(SERVICE.UNIT),
      axios.get(SERVICE.TEAMS),
      axios.get(SERVICE.LISTPAGEACCESSMODES),
      axios.get(SERVICE.CONTROL_SETTINGS_LAST_INDEX),
      axios.post(SERVICE.USER_IDLETIME_CREATE, {
        userid: userId,
        username: response?.data?.result?.username,
        companyname: response?.data?.result?.companyname,
        empcode: userempcode,
        date: today,
        starttime: new Date(serverTime?.currentNewDate),
        endtime: '',
        role: userrole,
        company: response?.data?.result?.company,
        branch: response?.data?.result?.branch,
        unit: response?.data?.result?.unit,
        team: response?.data?.result?.team,
        department: response?.data?.result?.department,
        loginstatus: 'loggedin',
      }),
    ]);

    let ansswer = controlpanel?.data?.overallsettings;
    if (ansswer?.notificationsound && ansswer?.notificationsound !== '') {
      handleNotificationPreview(ansswer?.notificationsound);
    }
    setButtonStyles({
      btncancel: {
        backgroundColor: ansswer?.colorsandfonts?.clearcancelbgcolour || '#f4f4f4',
        color: ansswer?.colorsandfonts?.clearcancelfontcolour || '#444',
        boxShadow: 'none',
        borderRadius: '3px',
        // border: "1px solid #0000006b",
        '&:hover': {
          backgroundColor: ansswer?.colorsandfonts?.clearcancelbgcolour || '#f4f4f4', // Same as default
          color: ansswer?.colorsandfonts?.clearcancelfontcolour || '#444', // Same as default
        },
      },
      buttonsubmit: {
        backgroundColor: ansswer?.colorsandfonts?.submitbgcolour || '#1976d2',
        color: ansswer?.colorsandfonts?.submitfontcolour || '#ffffff',
        '&:hover': {
          backgroundColor: ansswer?.colorsandfonts?.submitbgcolour || '#1976d2',
          color: ansswer?.colorsandfonts?.submitfontcolour || '#ffffff',
        },
      },
      buttonbulkdelete: {
        backgroundColor: ansswer?.colorsandfonts?.bulkdeletebgcolour || '#d32f2f',
        color: ansswer?.colorsandfonts?.bulkdeletefontcolour || '#ffffff',
        textTransform: 'capitalize',
        '&:hover': {
          backgroundColor: ansswer?.colorsandfonts?.bulkdeletebgcolour || '#d32f2f',
          color: ansswer?.colorsandfonts?.bulkdeletefontcolour || '#ffffff',
        },
      },
      buttonedit: {
        color: ansswer?.colorsandfonts?.editiconcolour || '#f4f4f4',
        fontSize: 'large',
      },
      buttonupdate: {
        backgroundColor: ansswer?.colorsandfonts?.editiconcolour || '#f4f4f4',
        fontSize: 'small',
        color: 'white',
      },
      buttondelete: {
        color: ansswer?.colorsandfonts?.deleteiconcolour || '#f4f4f4',
        fontSize: 'large',
      },
      buttonview: {
        color: ansswer?.colorsandfonts?.viewiconcolour || '#f4f4f4',
        fontSize: 'large',
      },
      buttoninfo: {
        color: ansswer?.colorsandfonts?.infoiconcolour || '#f4f4f4',
        fontSize: 'large',
      },
      pageheading: {
        fontSize: (() => {
          switch (ansswer?.colorsandfonts?.pageheadingfontsize || 'medium') {
            case 'small':
              return '15px'; // or your preferred size for "small"
            case 'medium':
              return '24px'; // or your preferred size for "medium"
            case 'large':
              return '30px'; // or your preferred size for "large"
            default:
              return '24px'; // default to "medium" size
          }
        })(),
      },

      navbar: {
        backgroundColor: ansswer?.colorsandfonts?.navbgcolour || '#1976d2',
        color: ansswer?.colorsandfonts?.navfontcolour || '#ffffff',
      },
      companylogo: {
        backgroundColor: ansswer?.colorsandfonts?.companylogobfcolour || '#1976d2',
      },
    });
    const yesrtedayShifts = loginusershift?.data?.finaluser?.filter((data) => data?.formattedDate === yesterdayDateFormat);
    const todayShifts = loginusershift?.data?.finaluser?.filter((data) => data?.formattedDate === todayDateFormat);

    const isInYesterdayShift = await isCurrentTimeInShift(yesrtedayShifts?.length > 0 ? [yesrtedayShifts[yesrtedayShifts?.length - 1]] : [], serverTime?.currentNewDate);

    const finalShift = isInYesterdayShift ? yesrtedayShifts : todayShifts;
    console.log(finalShift, 'finalShift');

    const mainshifttimespl = finalShift[0]?.shift != 'Week Off' ? finalShift[0]?.shift?.split('to') : '';
    const secondshifttimespl = finalShift?.length > 1 ? finalShift[1]?.shift?.split('to') : '';

    const userassign = await fetchAllAssignBranch(loginuserdata?.data?.suser?.companyname, loginuserdata?.data?.suser?.empcode);
    let managerassign = [];
    await allcompany?.data?.companies.forEach((comp) => {
      allbranch?.data?.branch
        .filter((br) => br.company === comp.name)
        .forEach((br) => {
          allunit?.data?.units
            .filter((un) => un.branch === br.name)
            .forEach((un) => {
              managerassign.push({
                company: comp?.name,
                companycode: comp?.code,
                branch: br?.name,
                branchcode: br?.code,
                branchemail: br?.email,
                branchaddress: br?.address,
                branchphone: br.phone,
                branchstate: br?.state,
                branchcity: br?.city,
                branchcountry: br?.country,
                branchpincode: br?.pincode,
                unit: un?.name,
                unitcode: un?.code,
                _id: un?._id,
              });
            });
        });
    });
    setAllCompany(allcompany?.data?.companies);
    setAllBranch(allbranch?.data?.branch);
    setAllUnit(allunit?.data?.units);

    const answer = loginuserdata?.data?.suser?.role?.includes('Manager') ? managerassign : userassign;

    if (documents && documents.data) {
      setIsUserRoleAccess({
        ...loginuserdata?.data?.suser,
        files: documents?.data?.semployeedocument?.files,
        loginusershift: loginusershift?.data?.finaluser,
        profileimage: documents?.data?.semployeedocument?.profileimage,
        userdayshift: finalShift,
        mainshiftname: '',
        mainshifttiming: mainshifttimespl[0] + '-' + mainshifttimespl[1],
        issecondshift: finalShift?.length > 1 ? true : false,
        secondshiftmode: finalShift?.length > 1 ? (mainshifttimespl[1] === secondshifttimespl[0] ? 'Continuous Shift' : 'Double Shift') : '',
        secondshiftname: '',
        secondshifttiming: finalShift?.length > 1 ? secondshifttimespl[0] + '-' + secondshifttimespl[1] : '',
        accessbranch: answer,
      });
      setIsAssignBranch(answer);
    } else {
      setIsUserRoleAccess({
        ...loginuserdata?.data?.suser,
        files: [],
        profileimage: '',
        userdayshift: finalShift,
        mainshiftname: '',
        loginusershift: loginusershift?.data?.finaluser,
        mainshifttiming: mainshifttimespl[0] + '-' + mainshifttimespl[1],
        issecondshift: finalShift?.length > 1 ? true : false,
        secondshiftmode: finalShift?.length > 1 ? (mainshifttimespl[1] === secondshifttimespl[0] ? 'Continuous Shift' : 'Double Shift') : '',
        secondshiftname: '',
        secondshifttiming: finalShift?.length > 1 ? secondshifttimespl[0] + '-' + secondshifttimespl[1] : '',
        accessbranch: answer,
      });
      setIsAssignBranch(answer);
    }
    await workStationSystemNameFunc(allcompany?.data?.companies, allbranch?.data?.branch, allunit?.data?.units, answer);

    setIsUserRoleCompare(userroles?.data?.result);
    setListPageAccessMode(listpageaccessmode?.data?.listpageaccessmode);
    setAllTeam(allteam?.data?.teamsdetails);
    // Change login state
    setAuth({
      ...auth,
      loginState: true,
      APIToken: response.data.token,
      loginuserid: userId,
      loginuserrole: userrole,
      loginusercode: userempcode,
    });

    setislogin(true);
    stopVideo();
    await handleUpdateTimeAfterLogin(response?.data?.result)
    backPage(redirectPath);
    const [allfloor, allarea, allareagrouping, alllocation, alllocationgrouping, alldepartment, alldesignation, alltooltip, allusersdata] = await Promise.all([
      axios.get(SERVICE.FLOOR),
      axios.get(SERVICE.AREAS),
      axios.get(SERVICE.AREAGROUPING),
      axios.get(SERVICE.LOCATION),
      axios.get(SERVICE.LOCATIONGROUPING),
      axios.get(SERVICE.DEPARTMENT),
      axios.get(SERVICE.DESIGNATION),
      axios.get(SERVICE.TOOLTIPDESCRIPTIONS),
      axios.get(SERVICE.ALLUSERSDATA),
    ]);
    setAllUsersData(allusersdata?.data?.usersstatus);

    setAllFloor(allfloor?.data?.floors);
    setAllArea(allarea?.data?.areas);
    setAllAreagrouping(allareagrouping?.data?.areagroupings);
    setAllLocation(alllocation?.data?.locationdetails);
    setAllLocationgrouping(alllocationgrouping?.data?.locationgroupings);
    setAllDepartment(alldepartment?.data?.departmentdetails);
    setAllDesignation(alldesignation?.data?.designation);
    setTooltip(alltooltip?.data?.tooldescription);
    setSignin(response);
    // Perform remaining API requests asynchronously
    axios.get(AUTH.PROJECTLIMIT).then((response) => setAllprojects(response.data.projects));
    // .catch(err);

    axios.get(AUTH.ALLUSERLIMIT).then((response) => setallUsersLimit(response.data.users));
    // .catch(err);

    axios.get(AUTH.ALLTASKS).then((response) => setallTasks(response.data.task));
    // .catch(err);

    axios
      .post(AUTH.TASKSLIMIT, {
        userrole: String(userroles?.data?.result[0]?.accesss),
        userid: String(userId),
      })
      .then((response) => setalltaskLimit(response.data.taskfilter));
    // }
  };

  // Update the LoginUserStatus After the SuccessFull Login
  const handleUpdateTimeAfterLogin = async (userData) => {
    try {
      let res = await axios.post(SERVICE.UPDATE_USER_LOGIN_DATE_AFTER_LOGIN, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        username: userData?.username,
        companyname: userData?.companyname,
      });
      console.log(res?.data, 'userData')
    }
    catch (err) {
      console.log(err, "Failed To Update User Date After successfull Login");
    }
  }



  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (signin.username === '' || signin.password === '') {
      setislogin(true);
      stopVideo();
      setErrorMessage('Please enter username and password');
    } else {
      setislogin(false);
      fetchHandler();
    }
  };
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    handleResize(); // Call the handleResize function once to set the initial state
    window.addEventListener('resize', handleResize); // Listen for window resize events
    return () => {
      window.removeEventListener('resize', handleResize); // Clean up the event listener on component unmount
    };
  }, []);

  const Sounds = [
    { label: 'Beep', value: 'Beep', file: Beep },
    { label: 'HighBell', value: 'HighBell', file: HighBell },
    { label: 'Ding', value: 'Ding', file: Ding },
    { label: 'Seasons', value: 'Seasons', file: Seasons },
    { label: 'Chelle', value: 'Chelle', file: Chelle },
    { label: 'Droplet', value: 'Droplet', file: Droplet },
    { label: 'Chime', value: 'Chime', file: Chime },
    { label: 'Door', value: 'Door', file: Door },
  ];

  // Previewing the Sound
  const handleNotificationPreview = (sound) => {
    if (sound !== null || sound !== undefined) {
      const previewFile = Sounds?.find((data) => data?.value === sound);
      const audio = new Audio(previewFile?.file);
      audio.play();
    }
  };

  //face regognition start

  useEffect(() => {
    const loadModels = async () => {
      const modelUrl = SERVICE.FACEDETECTLOGINMODEL;
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
      console.log('Models loaded');
    };
    loadModels();
  }, []);
  const videoRef = useRef();
  const [open, setOpen] = useState(false);
  const startVideo = () => {
    setOpen(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error('Camera access error: ', err);
      });
  };
  // Stop video stream when closing dialog
  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setOpen(false); // Close the dialog
    setBtnSubmit(false);
    // Clear the video source object
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const authenticateUser = async (faceDescriptor) => {
    console.log(faceDescriptor);
    fetchHandler(faceDescriptor);
  };

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512, // Increase this if necessary for better detection
    scoreThreshold: 0.4, // Adjust this for sensitivity
  });
  const [btnSubmit, setBtnSubmit] = useState(false);
  //   // Handle face detection and authentication
  const handleFaceRecognition = async () => {
    setBtnSubmit(true);
    const video = videoRef.current;
    console.log(video, 'video element'); // Ensure the video element is logged correctly

    if (!video) {
      console.error('No video element found');
      return;
    }

    try {
      const fullFaceDescriptions = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();

      console.log(fullFaceDescriptions);

      if (fullFaceDescriptions.length) {
        // const faceDescriptor = fullFaceDescriptions[0].descriptor;
        const faceDescriptor = Array.from(fullFaceDescriptions[0].descriptor);
        console.log('Face detected. Sending to backend for authentication.');
        authenticateUser(faceDescriptor);
      } else {
        console.log('No face detected');
        setErrorMessage('No face detected!');
        setislogin(true);
        stopVideo();
      }
    } catch (err) {
      console.error('Face detection error: ', err);
      setErrorMessage('Face detection error!');
      setislogin(true);
      stopVideo();
    }
  };

  return (
    <>
      <Box
        sx={{
          marginY: '5%',
        }}
      >
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <br /> <br /> <br /> <br />
            <Box sx={loginSignIn.loginboxmedia}>
              {/* <Grid sx={{ display: "flex" }}> */}
              {islogin == false ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress style={{ borderRadius: '9px' }} />
                </Box>
              ) : null}
              {/* </Grid> */}
              <Grid
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    HI-HRMS
                  </Typography>
                  <br />
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#F4F6FD',
                      color: statusType === 'online' ? '#058226' : statusType === 'offline' ? '#F44336' : '#FF9800',
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',

                      fontWeight: 'bold',

                      marginLeft: '60px',
                    }}
                  >
                    {getStatusIcon()}
                    <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {status}
                    </Typography>
                  </Box>
                  <br />
                  <br />
                  {/* <InputLabel htmlFor="outlined-adornment-amount">User Name</InputLabel> */}
                  <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                    <OutlinedInput
                      placeholder="User Name"
                      sx={{ paddingRight: '8px' }}
                      id="outlined-adornment-weight"
                      value={signin.username}
                      onChange={(e) => {
                        setSignin({ ...signin, username: e.target.value });
                        setErrorMessage('');
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <PersonIcon sx={{ fontSize: '25px' }} />
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                    />
                  </FormControl>
                  <br />
                  <br />
                  <br />
                  {/* <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel> */}
                  <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                    <OutlinedInput
                      placeholder="Password"
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signin.password}
                      onChange={(e) => {
                        setSignin({ ...signin, password: e.target.value });
                        setErrorMessage('');
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {!showPassword ? <VisibilityOff sx={{ fontSize: '25px' }} /> : <Visibility sx={{ fontSize: '25px' }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  <br />
                  <br />
                  <br />
                  {showTwofa && (
                    <>
                      <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                        <OutlinedInput
                          placeholder="Please Enter 2FA OTP"
                          sx={{ paddingRight: '8px' }}
                          id="outlined-adornment-weight"
                          value={signin.twofaotp}
                          onChange={(e) => {
                            setSignin({ ...signin, twofaotp: e.target.value });
                            setErrorMessage('');
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <PersonIcon sx={{ fontSize: '25px' }} />
                            </InputAdornment>
                          }
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                          }}
                        />
                      </FormControl>
                      <br />
                      <br />
                      <br />
                    </>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button variant="contained" type="submit" size="small" sx={loginSignIn.signinBtn}>
                      Sign in
                    </Button>
                    &emsp;
                    <Button variant="contained" size="small" onClick={startVideo} sx={loginSignIn.signinBtn}>
                      Face Detect
                    </Button>
                    &emsp;
                  </Box>
                  {errorMessage && (
                    <div
                      className="alert alert-danger"
                      style={{
                        color: 'red',
                        fontSize: '10px !important',
                        textAlign: 'center',
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                </form>
              </Grid>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              margin: '0 auto',
            }}
          >
            <br /> <br /> <br /> <br />
            <Box sx={loginSignIn.loginbox}>
              {/* <Grid sx={{ display: "flex" }}> */}
              {islogin == false ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress style={{ borderRadius: '9px' }} />
                </Box>
              ) : null}
              {/* </Grid> */}
              <Grid
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 40px 10px 5px',
                  '& .css-1mktpz ': { backgroundColor: 'red' },
                }}
              >
                <img src={loginimg} style={{ width: '60%' }} />
                <form onSubmit={handleSubmit}>
                  <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    HI-HRMS
                  </Typography>
                  <br />
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#F4F6FD',
                      color: statusType === 'online' ? '#058226' : statusType === 'offline' ? '#F44336' : '#FF9800',
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',

                      fontWeight: 'bold',

                      marginLeft: '60px',
                    }}
                  >
                    {getStatusIcon()}
                    <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {status}
                    </Typography>
                  </Box>
                  <br />
                  <br />
                  {/* <InputLabel htmlFor="outlined-adornment-amount">User Name</InputLabel> */}
                  <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                    <OutlinedInput
                      placeholder="User Name"
                      sx={{ paddingRight: '8px' }}
                      id="outlined-adornment-weight"
                      value={signin.username}
                      onChange={(e) => {
                        setSignin({ ...signin, username: e.target.value });
                        setErrorMessage('');
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <PersonIcon sx={{ fontSize: '25px' }} />
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                    />
                  </FormControl>
                  <br />
                  <br />
                  {/* <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel> */}
                  <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                    <OutlinedInput
                      placeholder="Password"
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signin.password}
                      onChange={(e) => {
                        setSignin({ ...signin, password: e.target.value });
                        setErrorMessage('');
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {!showPassword ? <VisibilityOff sx={{ fontSize: '25px' }} /> : <Visibility sx={{ fontSize: '25px' }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  <br />
                  <br />
                  {showTwofa && (
                    <>
                      <FormControl variant="outlined" fullWidth sx={{ maxWidth: '100%' }}>
                        <OutlinedInput
                          placeholder="Please Enter 2FA OTP"
                          sx={{ paddingRight: '8px' }}
                          id="outlined-adornment-weight"
                          value={signin.twofaotp}
                          onChange={(e) => {
                            setSignin({ ...signin, twofaotp: e.target.value });
                            setErrorMessage('');
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <PersonIcon sx={{ fontSize: '25px' }} />
                            </InputAdornment>
                          }
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                          }}
                        />
                      </FormControl>
                      <br />
                      <br />
                      <br />
                    </>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button variant="contained" type="submit" size="small" sx={loginSignIn.signinBtn}>
                      Sign in
                    </Button>
                    &emsp;
                    <Button variant="contained" size="small" onClick={startVideo} sx={loginSignIn.signinBtn}>
                      Face Detect
                    </Button>
                    &emsp;
                  </Box>
                  {errorMessage && (
                    <div
                      className="alert alert-danger"
                      style={{
                        color: 'red',
                        fontSize: '10px !imporant',
                        textAlign: 'center',
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                </form>
              </Grid>
            </Box>
            <br />
            <br />
          </Box>
        )}
        <br />
        <br />
        <Box>
          {/* ALERT DIALOG */}
          <Box>
            <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogContent
                sx={{
                  width: '350px',
                  textAlign: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">{showAlert}</Typography>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="error" onClick={handleCloseerr}>
                  ok
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>

        <Dialog open={open} onClose={stopVideo} maxWidth="sm" fullWidth>
          <DialogTitle>Face Detection</DialogTitle>
          <DialogContent>
            {/* Video Element */}
            <Grid container justifyContent="center">
              <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
            </Grid>
          </DialogContent>

          <DialogActions>
            {/* Authenticate Button */}
            <LoadingButton variant="contained" loading={btnSubmit} onClick={handleFaceRecognition}>
              Authenticate
            </LoadingButton>
            {/* Cancel Button */}
            <Button variant="outlined" color="secondary" onClick={stopVideo}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Footer />

        <Dialog
          open={notificationOpen}
          onClose={handleCloseNotification}
          aria-labelledby="notification-popup"
          PaperProps={{
            style: {
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '15px',
              overflow: 'hidden',
            },
          }}
          BackdropProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseNotification}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              color: 'black',
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{
              padding: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={notificationData.image ? notificationData.image : ''}
              alt="Notification"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};
export default Signin;
