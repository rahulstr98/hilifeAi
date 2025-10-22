import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, OutlinedInput, Dialog, DialogContent, DialogActions, FormControl, Grid, Button } from "@mui/material";
import { userStyle } from "../../../pageStyle";
import axios from "axios";
import { MultiSelect } from "react-multi-select-component";
import { SERVICE } from "../../../services/Baseservice";
import { handleApiError } from "../../../components/Errorhandling";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import { AuthContext } from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import PageHeading from "../../../components/PageHeading";
// import Complatedmanualentrylist from "./completedmanualentrylist";
import Completedstimestidylist from "./CompletedTimeStudyList";
import Onprogresstimestidylist from "./OnprogressTimestudyList";

// import Onprogressmanualentrylist from "./onprogressmanualentrylist";
// import ExportData from "../../../components/ExportData";

function ManualEntryTimeStudyList() {
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

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  //    today date fetching
  let today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  // today = yyyy + "-" + mm + "-" + dd;
  const formattedToday = `${yyyy}-${mm}-${dd}`;

  const [overallState, setOverallState] = useState({
    project: "Please Select Project",
    vendor: "Please Select Vendor",
    fromdate: today,
    alllogin: "Please Select Login",
    todate: today,
  });

  const [overallStateCompleted, setOverallStateCompleted] = useState({
    project: "Please Select Project",
    vendor: "Please Select Vendor",
    fromdate: today,
    alllogin: "Please Select Login",
    todate: today,
  });

  const [projectOpt, setProjmasterOpt] = useState([]);
  const [vendorOpt, setVendormasterOpt] = useState([]);
  const [categoryOpt, setCategoryOPt] = useState([]);
  const [subcategory, setSubCategoryOpt] = useState([]);

  const [selectedProject, setSelectedProject] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState([]);
  const [selectedOptionsCategory, setSelectedOptionsCategory] = useState([]);
  const [selectedOptionsSubCategory, setSelectedOptionsSubCategory] = useState([]);
  const [selectedOptionsLoginid, setSelectedOptionsLoginid] = useState([]);
  const [loginAllotFilter, setLoginAllotFilter] = useState([]);

  const [vendorOptCompleted, setVendormasterOptCompleted] = useState([]);
  const [categoryOptCompleted, setCategoryOPtCompleted] = useState([]);
  const [subcategoryCompleted, setSubCategoryOptCompleted] = useState([]);

  const [selectedProjectCompleted, setSelectedProjectCompleted] = useState([]);
  const [selectedVendorCompleted, setSelectedVendorCompleted] = useState([]);
  const [selectedOptionsCategoryCompleted, setSelectedOptionsCategoryCompleted] = useState([]);
  const [selectedOptionsSubCategoryCompleted, setSelectedOptionsSubCategoryCompleted] = useState([]);
  const [selectedOptionsLoginidCompleted, setSelectedOptionsLoginidCompleted] = useState([]);
  const [loginAllotFilterCompleted, setLoginAllotFilterCompleted] = useState([]);

  //get all project.
  const fetchProjMaster = async () => {
    try {
      let res_project = await axios.get(SERVICE.PROJECTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const projectopt = [
        ...res_project?.data?.projmaster.map((item) => ({
          ...item,
          label: item.name,
          value: item.name,
        })),
      ];

      setProjmasterOpt(projectopt);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };

  // const fetchVendor = async (e) => {
  //     const branchArr = e.map((t) => t.name);
  //     try {
  //         let res_vendor = await axios.get(SERVICE.VENDORMASTER, {
  //             headers: {
  //                 Authorization: `Bearer ${auth.APIToken}`,
  //             },
  //         });

  //         console.log(res_vendor?.data?.vendormaster, "restedsard")
  //         let vendorall = res_vendor?.data?.vendormaster?.map((d) => ({
  //             ...d,
  //             label: d.projectname + "-" + d.name,
  //             value: d.projectname + "-" + d.name,
  //         }));
  //         console.log(vendorall, "vendorall")
  //         setVendormasterOpt(vendorall);
  //     } catch (err) {
  //         console.log(err, "eroro")
  //         handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //     }
  // };

  const fetchVendors = async (project) => {
    try {
      let res_vendor = await axios.post(SERVICE.VENDORMASTER_LIMITED_BYPROJECT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        project: project.map((item) => item.value),
      });
      let vendorall = res_vendor?.data?.vendormaster?.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setVendormasterOpt(vendorall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //COMPLETED
  const fetchVendorsCompleted = async (project) => {
    try {
      let res_vendor = await axios.post(SERVICE.VENDORMASTER_LIMITED_BYPROJECT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        project: project.map((item) => item.value),
      });
      let vendorall = res_vendor?.data?.vendormaster?.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setVendormasterOptCompleted(vendorall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchProjMaster();
  }, []);

  const fetchAllCategory = async (projectvendor) => {
    try {
      let res_module = await axios.post(SERVICE.CATEGORYPROD_LIMITED_REPORT_MULTI, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        projectvendor: projectvendor.map((item) => item.value),
      });
      const uniques = [...new Set(res_module?.data?.categoryprod.map((item) => item.name))];
      const categoryOpt = uniques.map((d) => ({
        label: d,
        value: d,
      }));
      setCategoryOPt(categoryOpt);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };

  //get all category.
  const fetchAllSubCategory = async (project, category) => {
    try {
      let res_module = await axios.post(SERVICE.SUBCATEGORYPROD_LIMITED_REPORT_MULTI, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        project: project.map((item) => item.value),
        category: category.map((item) => item.value),
      });
      const uniques = [...new Set(res_module?.data?.subcategoryprod.map((item) => item.name))];

      const projFilt = uniques.map((d) => ({
        label: d,
        value: d,
      }));

      setSubCategoryOpt(projFilt);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };

  //COMPLETED
  const fetchAllCategoryCompleted = async (projectvendor) => {
    try {
      let res_module = await axios.post(SERVICE.CATEGORYPROD_LIMITED_REPORT_MULTI, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        projectvendor: projectvendor.map((item) => item.value),
      });
      const uniques = [...new Set(res_module?.data?.categoryprod.map((item) => item.name))];
      const categoryOpt = uniques.map((d) => ({
        label: d,
        value: d,
      }));
      setCategoryOPtCompleted(categoryOpt);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };

  //get all category.
  const fetchAllSubCategoryCompleted = async (project, category) => {
    try {
      let res_module = await axios.post(SERVICE.SUBCATEGORYPROD_LIMITED_REPORT_MULTI, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        project: project.map((item) => item.value),
        category: category.map((item) => item.value),
      });
      const uniques = [...new Set(res_module?.data?.subcategoryprod.map((item) => item.name))];

      const projFilt = uniques.map((d) => ({
        label: d,
        value: d,
      }));

      setSubCategoryOptCompleted(projFilt);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };

  const fetchAllLogins = async (date, vendor) => {
    try {
      if (date !== "") {
        let res_vendor = await axios.post(SERVICE.CLIENTUSERID_LIMITED_BYCOMPNYNAME_MULTI, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          role: isUserRoleAccess.role,
          project: vendor,
          companyname: isUserRoleAccess.companyname,
          date: date,
        });

        let uniques = [...new Set(res_vendor?.data?.clientuserid.map((item) => item.userid))];
        let alluseridNamesadmin = uniques.map((d) => ({
          // ...d,
          label: d,
          value: d,
        }));

        setLoginAllotFilter(alluseridNamesadmin);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //COMPLETED
  const fetchAllLoginsCompleted = async (date, vendor) => {
    try {
      if (date !== "") {
        let res_vendor = await axios.post(SERVICE.CLIENTUSERID_LIMITED_BYCOMPNYNAME_MULTI, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          role: isUserRoleAccess.role,
          project: vendor,
          companyname: isUserRoleAccess.companyname,
          date: date,
        });

        let uniques = [...new Set(res_vendor?.data?.clientuserid.map((item) => item.userid))];
        let alluseridNamesadmin = uniques.map((d) => ({
          // ...d,
          label: d,
          value: d,
        }));

        setLoginAllotFilterCompleted(alluseridNamesadmin);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleProjectChange = (options) => {
    setSelectedProject(options);
    fetchAllCategory(options);
    fetchVendors(options);

    setSelectedOptionsCategory([]);
    setSelectedOptionsSubCategory([]);
  };
  const customValueRendererProject = (valueProject, _categoryname) => {
    return valueProject?.length ? valueProject.map(({ label }) => label)?.join(", ") : "Please Select Project";
  };

  const handleVendorChange = (options) => {
    setSelectedVendor(options);
    let resultvendor = [];
    selectedProject
      .map((d) => d.value)
      .forEach((proj) => {
        options
          .map((d) => d.value)
          .forEach((vend) => {
            resultvendor.push(`${proj}-${vend}`);
          });
      });
    let projvendor = [...new Set(resultvendor)];

    fetchAllLogins(overallState.fromdate, projvendor);
  };
  const customValueRendererVendor = (valueVendor, _categoryname) => {
    return valueVendor?.length ? valueVendor.map(({ label }) => label)?.join(", ") : "Please Select Vendor";
  };

  const handleCategoryChange = (options) => {
    setSelectedOptionsCategory(options);
    fetchAllSubCategory(selectedProject, options);
    setSelectedOptionsSubCategory([]);
  };
  const customValueRendererCategory = (valueCompanyCategory, _categoryname) => {
    return valueCompanyCategory?.length ? valueCompanyCategory.map(({ label }) => label)?.join(", ") : "Please Select Category";
  };

  const handleSubCategoryChange = (options) => {
    setSelectedOptionsSubCategory(options);
  };
  const customValueRendererSubCategory = (valueSubCat, _categoryname) => {
    return valueSubCat?.length ? valueSubCat.map(({ label }) => label)?.join(", ") : "Please Select SubCategory";
  };

  //employee multiselect dropdown changes
  const handleLoginChangeFrom = (options) => {
    setSelectedOptionsLoginid(options);
  };
  const customValueRendererLoginFrom = (valueLoginCat, _employeename) => {
    return valueLoginCat.length ? valueLoginCat.map(({ label }) => label).join(", ") : "Please Select Login";
  };

  ///COMPLETED FILTER FIELDS
  const handleProjectChangeCompleted = (options) => {
    setSelectedProjectCompleted(options);
    fetchAllCategoryCompleted(options);
    fetchVendorsCompleted(options);

    setSelectedOptionsCategoryCompleted([]);
    setSelectedOptionsSubCategoryCompleted([]);
  };
  const customValueRendererCompletedProject = (valueProject, _categoryname) => {
    return valueProject?.length ? valueProject.map(({ label }) => label)?.join(", ") : "Please Select Project";
  };

  const handleVendorChangeCompleted = (options) => {
    setSelectedVendorCompleted(options);
    let resultvendor = [];
    selectedProjectCompleted
      .map((d) => d.value)
      .forEach((proj) => {
        options
          .map((d) => d.value)
          .forEach((vend) => {
            resultvendor.push(`${proj}-${vend}`);
          });
      });
    let projvendor = [...new Set(resultvendor)];

    fetchAllLoginsCompleted(overallStateCompleted.fromdate, projvendor);
  };
  const customValueRendererCompletedVendor = (valueVendor, _categoryname) => {
    return valueVendor?.length ? valueVendor.map(({ label }) => label)?.join(", ") : "Please Select Vendor";
  };

  const handleCategoryChangeCompleted = (options) => {
    setSelectedOptionsCategoryCompleted(options);
    fetchAllSubCategoryCompleted(selectedProjectCompleted, options);
    setSelectedOptionsSubCategoryCompleted([]);
  };
  const customValueRendererCompletedCategory = (valueCompanyCategory, _categoryname) => {
    return valueCompanyCategory?.length ? valueCompanyCategory.map(({ label }) => label)?.join(", ") : "Please Select Category";
  };

  const handleSubCategoryChangeCompleted = (options) => {
    setSelectedOptionsSubCategoryCompleted(options);
  };
  const customValueRendererCompletedSubCategory = (valueSubCat, _categoryname) => {
    return valueSubCat?.length ? valueSubCat.map(({ label }) => label)?.join(", ") : "Please Select SubCategory";
  };

  //employee multiselect dropdown changes
  const handleLoginChangeFromCompleted = (options) => {
    setSelectedOptionsLoginidCompleted(options);
  };
  const customValueRendererCompletedLoginFrom = (valueLoginCat, _employeename) => {
    return valueLoginCat.length ? valueLoginCat.map(({ label }) => label).join(", ") : "Please Select Login";
  };

  // Calculate the date two months ago
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(today.getMonth() - 2);
  const ddPast = String(twoMonthsAgo.getDate()).padStart(2, "0");
  const mmPast = String(twoMonthsAgo.getMonth() + 1).padStart(2, "0");
  const yyyyPast = twoMonthsAgo.getFullYear();
  const formattedTwoMonthsAgo = `${yyyyPast}-${mmPast}-${ddPast}`;

  let now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  let currtime = `${hours}:${minutes}`;

  const [projmaster, setProjmaster] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  //get all project.
  // const fetchProductionIndividual = async () => {
  //   setPageName(!pageName);
  //   setProjectCheck(true);
  //   try {
  //     let res_project = await axios.post(SERVICE.PRODUCTION_INDIVIDUAL_LIMITED, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       username: isUserRoleAccess.username,
  //       access: isUserRoleAccess.role,
  //     });

  //     setProjmasterDup(res_project?.data?.result);
  //     setProjectCheck(false);
  //   } catch (err) {
  //     setProjectCheck(false);
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  // useEffect(() => {
  //   fetchProductionIndividual();
  // }, []);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Manual Entry"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          date: String(new Date()),
        },
      ],
    });
  };

  useEffect(() => {
    getapi();
  }, []);

  const [isFilter, setIsFilter] = useState([]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      let resultvendor = [];
      selectedProject
        .map((d) => d.value)
        .forEach((proj) => {
          selectedVendor
            .map((d) => d.value)
            .forEach((vend) => {
              resultvendor.push(`${proj}-${vend}`);
            });
        });
      let projvendor = [...new Set(resultvendor)];
      const isRoleManager = ["Manager", "Director", "Admin", "SuperAdmin", "ADMIN"].some((rl) => isUserRoleAccess.role.includes(rl));
      let res_employee = await axios.post(SERVICE.TIMESTULDY_COMPLETED_LIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        vendor: projvendor,
        filename: selectedOptionsCategory.map((item) => item.value),
        category: selectedOptionsSubCategory.map((item) => item.value),
        user: isRoleManager && selectedOptionsLoginid.length === 0 ? [] : selectedOptionsLoginid.map((item) => item.value) === 0 ? loginAllotFilter.map((item) => item.value) : selectedOptionsLoginid.map((item) => item.value),
        fromdate: overallState.fromdate,
        status: ["Overall"],
      });
      const ans = res_employee?.data?.manualclientinfo;
      setProjmaster(ans);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const [projmasterCompleted, setProjmasterCompleted] = useState([]);
  const [projmasterOnProgress, setProjmasterOnProgress] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [loadingOnProgress, setLoadingOnProgress] = useState(false);

  const [initialPage, setInitialPage] = useState(1);

  const fetchCompleted = async () => {
    setLoadingCompleted(true);
    try {
      let resultvendor = [];
      selectedProjectCompleted
        .map((d) => d.value)
        .forEach((proj) => {
          selectedVendorCompleted
            .map((d) => d.value)
            .forEach((vend) => {
              resultvendor.push(`${proj}-${vend}`);
            });
        });
      let projvendor = [...new Set(resultvendor)];
      const isRoleManager = ["Manager", "Director", "Admin", "SuperAdmin", "ADMIN"].some((rl) => isUserRoleAccess.role.includes(rl));
      let res_employee = await axios.post(SERVICE.TIMESTULDY_COMPLETED_LIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        vendor: projvendor,
        filename: selectedOptionsCategoryCompleted.map((item) => item.value),
        category: selectedOptionsSubCategoryCompleted.map((item) => item.value),
        user:
          isRoleManager && selectedOptionsLoginidCompleted.length === 0
            ? []
            : selectedOptionsLoginidCompleted.map((item) => item.value) === 0
            ? loginAllotFilterCompleted.map((item) => item.value)
            : selectedOptionsLoginidCompleted.map((item) => item.value),
        fromdate: overallStateCompleted.fromdate,
        status: ["Completed"],
      });
      const ans = res_employee?.data?.manualclientinfo.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      }));
      setProjmasterCompleted(ans);
      setInitialPage(1);
      setLoadingCompleted(false);
    } catch (err) {
      setLoadingCompleted(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchOnProgress = async () => {
    setLoadingOnProgress(true);
    try {
      let res_employee = await axios.post(SERVICE.TIMESTULDY_COMPLETED_LIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        vendor: [],
        filename: [],
        category: [],
        user: [],
        fromdate: "",
        status: ["Started"],
      });
      const ans = res_employee?.data?.manualclientinfo.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      }));
      console.log(ans, "ans");
      setProjmasterOnProgress(ans);
      // setInitialPage(1);
      setLoadingOnProgress(false);
    } catch (err) {
      setLoadingOnProgress(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    // fetchCompleted();
    fetchOnProgress();
  }, []);

  //submit option for saving
  const handleSubmitFilter = (e) => {
    e.preventDefault();

    // if (selectedCompanyFrom.length === 0) {
    //     setPopupContentMalert("Please Select Company!");
    //     setPopupSeverityMalert("info");
    //     handleClickOpenPopupMalert();
    // }
    // else if (selectedBranchFrom.length === 0) {
    //     setPopupContentMalert("Please Select Branch!");
    //     setPopupSeverityMalert("info");
    //     handleClickOpenPopupMalert();
    // }
    // else {
    fetchEmployee();
    // }
  };

  const handleSubmitFilterCompleted = (e) => {
    e.preventDefault();

    // if (selectedCompanyFrom.length === 0) {
    //     setPopupContentMalert("Please Select Company!");
    //     setPopupSeverityMalert("info");
    //     handleClickOpenPopupMalert();
    // }
    // else if (selectedBranchFrom.length === 0) {
    //     setPopupContentMalert("Please Select Branch!");
    //     setPopupSeverityMalert("info");
    //     handleClickOpenPopupMalert();
    // }
    // else {
    fetchCompleted();
    // }
  };
  const handleClearFilter = async (e) => {
    e.preventDefault();

    setIsFilter([]);
  };

  return (
    <Box>
      <Headtitle title={"ManualEntry TimeStudy List"} />
      {/* ****** Header Content ****** */}
      {/* <Typography sx={userStyle.HeaderText}>Manual Entry</Typography> */}
      <PageHeading title="ManualEntry TimeStudy List" modulename="Production" submodulename="Manual Entry" mainpagename="ManualEntry TimeStudy List" subpagename="" subsubpagename="" />

      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lmanualentrytimestudylist") && (
        <>
          <Box sx={{ ...userStyle.container, padding: "10px 30px", borderTop: "4px solid #eba015bf", borderRadius: "5px" }}>
            <Grid item xs={8}>
              <Typography sx={{ ...userStyle.importheadtext, color: "#e9ae3f", fontWeight: "bold" }}>Onprogress ManualEntry TimeStudy List</Typography>
            </Grid>

            <Onprogresstimestidylist projmaster={projmasterOnProgress} initialPage={initialPage} loading={loadingOnProgress} fetchPendingOnProgress={fetchOnProgress} />
          </Box>
          <br />
          <Box sx={{ ...userStyle.container, padding: "10px 30px", borderTop: "4px solid #38a938", borderRadius: "5px" }}>
            <Grid item xs={8}>
              <Typography sx={{ ...userStyle.importheadtext, color: "#38a938", fontWeight: "bold" }}>Completed ManualEntry TimeStudy List</Typography>
            </Grid>

            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Project</Typography>

                  <MultiSelect
                    options={projectOpt}
                    value={selectedProjectCompleted}
                    onChange={(e) => {
                      handleProjectChangeCompleted(e);
                    }}
                    valueRenderer={customValueRendererCompletedProject}
                    labelledBy="Please Select Project"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Vendor</Typography>
                  <MultiSelect
                    options={vendorOptCompleted}
                    value={selectedVendorCompleted}
                    onChange={(e) => {
                      handleVendorChangeCompleted(e);
                    }}
                    valueRenderer={customValueRendererCompletedVendor}
                    labelledBy="Please Select Vendor"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Category</Typography>
                  <MultiSelect
                    options={categoryOptCompleted}
                    value={selectedOptionsCategoryCompleted}
                    onChange={(e) => {
                      handleCategoryChangeCompleted(e);
                      setOverallStateCompleted({
                        ...overallStateCompleted,
                        raisedby: "Please Select Category",
                      });
                    }}
                    valueRenderer={customValueRendererCompletedCategory}
                    labelledBy="Please Select Category"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Sub Category</Typography>
                  <MultiSelect
                    options={subcategoryCompleted}
                    value={selectedOptionsSubCategoryCompleted}
                    onChange={(e) => {
                      handleSubCategoryChangeCompleted(e);
                      setOverallStateCompleted({
                        ...overallStateCompleted,
                        raisedby: "Please Select SubCategory",
                      });
                    }}
                    valueRenderer={customValueRendererCompletedSubCategory}
                    labelledBy="Please Select SubCategory"
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    From Date <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={overallStateCompleted.fromdate}
                    onChange={(e) => {
                      let resultvendor = [];
                      selectedProjectCompleted
                        .map((d) => d.value)
                        .forEach((proj) => {
                          selectedVendorCompleted
                            .map((d) => d.value)
                            .forEach((vend) => {
                              resultvendor.push(`${proj}-${vend}`);
                            });
                        });
                      let projvendor = [...new Set(resultvendor)];
                      fetchAllLoginsCompleted(e.target.value, projvendor);
                      setOverallStateCompleted({ ...overallStateCompleted, fromdate: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>All Login Id</Typography>
                  <MultiSelect options={loginAllotFilterCompleted} value={selectedOptionsLoginidCompleted} onChange={handleLoginChangeFromCompleted} valueRenderer={customValueRendererCompletedLoginFrom} labelledBy="Please Select Login" />
                </FormControl>
              </Grid>
              <Grid item md={1} xs={12} sm={12} marginTop={3}>
                <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmitFilterCompleted}>
                  Filter
                </Button>
              </Grid>
              <Grid item md={0.5} xs={12} sm={12} marginTop={3}>
                <Button onClick={handleClearFilter} sx={buttonStyles.btncancel}>
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Completedstimestidylist projmaster={projmasterCompleted} loading={loadingCompleted} fetchEmployee={fetchCompleted} />
          </Box>
          <br />
          <Box sx={{ ...userStyle.container, padding: "10px 30px", borderTop: "4px solid #3ba6cf", borderRadius: "5px" }}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8} sx={{ marginBottom: "3px" }}>
              <Typography sx={{ ...userStyle.importheadtext, color: "#3ba6cf", fontWeight: "bold" }}>ManualEntry TimeStudy List</Typography>
            </Grid>

            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Project</Typography>

                  <MultiSelect
                    options={projectOpt}
                    value={selectedProject}
                    onChange={(e) => {
                      handleProjectChange(e);
                    }}
                    valueRenderer={customValueRendererProject}
                    labelledBy="Please Select Project"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Vendor</Typography>
                  <MultiSelect
                    options={vendorOpt}
                    value={selectedVendor}
                    onChange={(e) => {
                      handleVendorChange(e);
                    }}
                    valueRenderer={customValueRendererVendor}
                    labelledBy="Please Select Vendor"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Category</Typography>
                  <MultiSelect
                    options={categoryOpt}
                    value={selectedOptionsCategory}
                    onChange={(e) => {
                      handleCategoryChange(e);
                      setOverallState({
                        ...overallState,
                        raisedby: "Please Select Category",
                      });
                    }}
                    valueRenderer={customValueRendererCategory}
                    labelledBy="Please Select Category"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth>
                  <Typography>Sub Category</Typography>
                  <MultiSelect
                    options={subcategory}
                    value={selectedOptionsSubCategory}
                    onChange={(e) => {
                      handleSubCategoryChange(e);
                      setOverallState({
                        ...overallState,
                        raisedby: "Please Select SubCategory",
                      });
                    }}
                    valueRenderer={customValueRendererSubCategory}
                    labelledBy="Please Select SubCategory"
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    From Date <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={overallState.fromdate}
                    onChange={(e) => {
                      let resultvendor = [];
                      selectedProject
                        .map((d) => d.value)
                        .forEach((proj) => {
                          selectedVendor
                            .map((d) => d.value)
                            .forEach((vend) => {
                              resultvendor.push(`${proj}-${vend}`);
                            });
                        });
                      let projvendor = [...new Set(resultvendor)];
                      fetchAllLogins(e.target.value, projvendor);
                      setOverallState({ ...overallState, fromdate: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>All Login Id</Typography>
                  <MultiSelect options={loginAllotFilter} value={selectedOptionsLoginid} onChange={handleLoginChangeFrom} valueRenderer={customValueRendererLoginFrom} labelledBy="Please Select Login" />
                </FormControl>
              </Grid>
              <Grid item md={1} xs={12} sm={12} marginTop={3}>
                <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmitFilter}>
                  Filter
                </Button>
              </Grid>
              <Grid item md={0.5} xs={12} sm={12} marginTop={3}>
                <Button onClick={handleClearFilter} sx={buttonStyles.btncancel}>
                  Clear
                </Button>
              </Grid>
            </Grid>
            <Completedstimestidylist projmaster={projmaster} loading={loading} fetchEmployee />
          </Box>
        </>
      )}

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
      {/* ****** Table End ****** */}
    </Box>
  );
}

export default ManualEntryTimeStudyList;