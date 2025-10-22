import { DeleteOutlineOutlined, EditOutlined } from "@material-ui/icons";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, Grid, OutlinedInput, Typography } from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Link, useNavigate, useParams } from "react-router-dom";
import Selects from "react-select";
import { Bounce, Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AlertDialog from "../../../components/Alert";
import { handleApiError } from "../../../components/Errorhandling";
import Headtitle from "../../../components/Headtitle";
import { menuItems } from "../../../components/menuItemsList";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import { AuthContext, UserRoleAccessContext } from "../../../context/Appcontext";
import { colourStyles, userStyle } from "../../../pageStyle";
import { SERVICE } from "../../../services/Baseservice";

function EditRole() {

  let toastId = null; // Store toast ID to control it

  const showToast = () => {
    toastId = toast.info(
      <div
      >
        <p style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          You have made changes. Please update!
        </p>
        <button
          onClick={
            handleSubmit
          }
          style={{
            backgroundColor: "gold",
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: "5px",
            fontWeight: "bold",
            marginRight: "10px",
            transition: "background-color 0.3s ease, transform 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#e6b800";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "gold";
            e.target.style.transform = "scale(1)";
          }}
        >
          Update
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: "dark",
        transition: Slide,
        closeButton: false,
      }
    );
  };


  // Function to close the toast manually
  const closeToast = () => {
    if (toastId == null) {
      toast.dismiss(toastId);
    }
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
  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };
  const [subprojid, setSubprojid] = useState();
  const [oldRoleNameData, setOldRoleNameData] = useState([]);
  const [ovProjCount, setOvProjCount] = useState("");
  const [getOverAllCount, setGetOverallCount] = useState("");
  const [roleNameEdit, setRoleNameEdit] = useState("");
  const [moduleName, setModuleName] = useState("Please Select Module");
  const [submoduleOptions, setSubModuleOptions] = useState([]);
  const [mainpageOptions, setMainPageOptions] = useState([]);
  const [subpageOptions, setSubpageOptions] = useState([]);
  const [subsubpageOptions, setSubSubpageOptions] = useState([]);
  const [subModuleTitle, setsubModuleTitle] = useState([]);
  const [mainPageTitle, setmainPageTitle] = useState([]);
  const [subPageTitle, setSubpageTitle] = useState([]);
  const [subsubPageTitle, setSubSubpageTitle] = useState([]);
  const [controlTitle, setControlTitle] = useState([]);
  const [changeControl, setChangeControl] = useState(false);
  const [updateControlNames, setUpdateControlNames] = useState([]);
  const [getIndex, setGetIndex] = useState("");
  const [controlsgroupings, setControlsgroupings] = useState([]);
  const [selectedControlGrouping, setSelectedControlGrouping] = useState([]);
  const [controls, setControls] = useState([]);

  // controls
  const controlsUpdate = [
    { label: "Menu", value: "Menu" },
    { label: "Add", value: "Add" },
    { label: "Edit", value: "Edit" },
    { label: "List", value: "List" },
    { label: "Info", value: "Info" },
    { label: "Delete", value: "Delete" },
    { label: "View", value: "View" },
    { label: "PDF", value: "PDF" },
    { label: "Print", value: "Print" },
    { label: "Excel", value: "Excel" },
    { label: "CSV", value: "CSV" },
    { label: "Image", value: "Image" },
    { label: "BulkEdit", value: "BulkEdit" },
    { label: "BulkDelete", value: "BulkDelete" },
  ];
  const [controlGroupingValues, setControlGroupingValues] = useState([]);
  // / Sub Module Multiselect
  const [selectedOptionsSubModule, setSelectedOptionsSubModule] = useState([]);
  let [valueSubModule, setValueSubModule] = useState("");
  // Main Page Multiselect
  const [selectedOptionsMainPage, setSelectedOptionsMainPage] = useState([]);
  let [valueMainPage, setValueMainPage] = useState("");
  // Sub Page Multiselect
  const [selectedOptionsSubPage, setSelectedOptionsSubPage] = useState([]);
  const [selectedOptionsSubSubPage, setSelectedOptionsSubSubPage] = useState([]);
  // Controls Multiselect
  const [selectedOptionsControls, setSelectedOptionsControls] = useState([]);
  let [valueControls, setValueControls] = useState("");

  //Delete model
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const handleClickOpendel = () => {
    setisDeleteOpen(true);
  };
  const handleCloseDel = () => {
    setisDeleteOpen(false);
  };
  const backPage = useNavigate();
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

  const [roleEditOptions, setRoleEditOptions] = useState([]);
  const [roleEditOptionsDup, setRoleEditOptionsDup] = useState([]);
  const [roleEditOptionsDupForBackup, setRoleEditOptionsDupForBackup] = useState([]);

  const { auth } = useContext(AuthContext);

  const username = isUserRoleAccess.username;

  const id = useParams().id;
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [showAlert, setShowAlert] = useState();

  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  let index = 0

  //get single row to edit....
  const getCode = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.ROLE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await getUserRolesOverallLinked(res?.data?.srole?.name)
      setSubprojid(res?.data?.srole);
      setRoleNameEdit(res?.data?.srole?.name);
      const transformed = [];
      const moduleDbNames = [];
      const moduleTitleNames = [];
      const subModuleDbNames = [];
      const subModuleTitleNames = [];
      const mainPageDbNames = [];
      const mainPageTitleNames = [];
      const subPageDbNames = [];
      const subsubPageDbNames = [];
      const subPageTitleNames = [];
      const subsubPageTitleNames = [];

      let ans = menuItems.filter((itemmodule) => {
        if (res?.data?.srole?.modulename?.includes(itemmodule.title)) {
          moduleTitleNames.push(itemmodule.title);
          moduleDbNames.push(itemmodule.dbname);
          const filteredArray = res?.data?.srole?.controlname
            .filter((item) => {
              const parts = item.split(".");
              return parts[0] === itemmodule.title;
            })
            .map((item) => {
              const parts = item.split(".");
              return parts[1];
            });
          if (itemmodule.submenu) {
            itemmodule.submenu.filter((itemsubmod) => {
              if (res?.data?.srole?.submodulename?.includes(itemsubmod.title)) {
                subModuleDbNames.push(itemsubmod.dbname);
                subModuleTitleNames.push(itemmodule.title);
                const filteredArray = res?.data?.srole?.controlname
                  .filter((item) => {
                    const parts = item.split(".");
                    return parts[0] === itemsubmod.title;
                  })
                  .map((item) => {
                    const parts = item.split(".");
                    return parts[1];
                  });
                const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                  .filter((item) => {
                    const parts = item.split(".");
                    return parts[0] === itemsubmod.title;
                  })
                  .map((item) => {
                    const parts = item.split(".");
                    return parts[1];
                  });

                if (itemsubmod.submenu) {
                  itemsubmod.submenu.filter((itemmainpage) => {
                    if (res?.data?.srole?.mainpagename?.includes(itemmainpage.title)) {
                      mainPageDbNames.push(itemsubmod.dbname);
                      mainPageTitleNames.push(itemmodule.title);
                      const filteredArray = res?.data?.srole?.controlname
                        .filter((item) => {
                          const parts = item.split(".");
                          return parts[0] === itemmainpage.title;
                        })
                        .map((item) => {
                          const parts = item.split(".");
                          return parts[1];
                        });
                      const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                        .filter((item) => {
                          const parts = item.split(".");
                          return parts[0] === itemmainpage.title;
                        })
                        .map((item) => {
                          const parts = item.split(".");
                          return parts[1];
                        });

                      if (itemmainpage.submenu) {
                        itemmainpage.submenu.filter((itemsubpage) => {
                          if (res?.data?.srole?.subpagename?.includes(itemsubpage.title)) {
                            subPageDbNames.push(itemsubmod.dbname);
                            subPageTitleNames.push(itemmodule.title);
                            const filteredArray = res?.data?.srole?.controlname
                              .filter((item) => {
                                const parts = item.split(".");
                                return parts[0] === itemsubpage.title;
                              })
                              .map((item) => {
                                const parts = item.split(".");
                                return parts[1];
                              });
                            const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                              .filter((item) => {
                                const parts = item.split(".");
                                return parts[0] === itemsubpage.title;
                              })
                              .map((item) => {
                                const parts = item.split(".");
                                return parts[1];
                              });

                            if (itemsubpage.submenu) {
                              itemsubpage.submenu.filter((itemsubsubpage) => {
                                if (res?.data?.srole?.subsubpagename?.includes(itemsubsubpage.title)) {
                                  subsubPageDbNames.push(itemsubmod.dbname);
                                  subsubPageTitleNames.push(itemmodule.title);
                                  const filteredArray = res?.data?.srole?.controlname
                                    .filter((item) => {

                                      const parts = item.split(".");
                                      return parts[0] === itemsubsubpage.title;

                                    })
                                    .map((item) => {
                                      const parts = item.split(".");
                                      return parts[1];
                                    });
                                  const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                                    .filter((item) => {
                                      const parts = item.split(".");
                                      return parts[0] === itemsubsubpage.title;
                                    })
                                    .map((item) => {
                                      const parts = item.split(".");
                                      return parts[1];
                                    });

                                  transformed.push({
                                    name: itemmodule.title,
                                    submodule: itemsubmod.title,
                                    mainpage: itemmainpage.title,
                                    subpage: itemsubpage.title,
                                    subsubpage: itemsubsubpage.title,
                                    control: filteredArray,
                                    controlgroupingtitles: filteredArrayControlGroup,
                                  });

                                }
                              });
                            } else {
                              transformed.push({
                                name: itemmodule.title,
                                submodule: itemsubmod.title,
                                mainpage: itemmainpage.title,
                                subpage: itemsubpage.title,
                                control: filteredArray,
                                controlgroupingtitles: filteredArrayControlGroup,
                              });
                            }
                          }
                        });
                      } else {
                        transformed.push({
                          name: itemmodule.title,
                          submodule: itemsubmod.title,
                          mainpage: itemmainpage.title,
                          control: filteredArray,
                          controlgroupingtitles: filteredArrayControlGroup,
                        });
                      }
                    }
                  });
                } else {
                  transformed.push({
                    name: itemmodule.title,
                    submodule: itemsubmod.title,
                    control: filteredArray,
                    controlgroupingtitles: filteredArrayControlGroup,
                  });
                }
              }
            });
          } else {

          }
        }
      });

      setRoleEditOptions(transformed);
      setRoleEditOptionsDup(transformed);

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const getCodeDup = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.ROLE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const transformed = [];
      const moduleDbNames = [];
      const moduleTitleNames = [];
      const subModuleDbNames = [];
      const subModuleTitleNames = [];
      const mainPageDbNames = [];
      const mainPageTitleNames = [];
      const subPageDbNames = [];
      const subsubPageDbNames = [];
      const subPageTitleNames = [];
      const subsubPageTitleNames = [];

      let ans = menuItems.filter((itemmodule) => {
        if (res?.data?.srole?.modulename?.includes(itemmodule.title)) {
          moduleTitleNames.push(itemmodule.title);
          moduleDbNames.push(itemmodule.dbname);
          const filteredArray = res?.data?.srole?.controlname
            .filter((item) => {
              const parts = item.split(".");
              return parts[0] === itemmodule.title;
            })
            .map((item) => {
              const parts = item.split(".");
              return parts[1];
            });
          if (itemmodule.submenu) {
            itemmodule.submenu.filter((itemsubmod) => {
              if (res?.data?.srole?.submodulename?.includes(itemsubmod.title)) {
                subModuleDbNames.push(itemsubmod.dbname);
                subModuleTitleNames.push(itemmodule.title);
                const filteredArray = res?.data?.srole?.controlname
                  .filter((item) => {
                    const parts = item.split(".");
                    return parts[0] === itemsubmod.title;
                  })
                  .map((item) => {
                    const parts = item.split(".");
                    return parts[1];
                  });
                const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                  .filter((item) => {
                    const parts = item.split(".");
                    return parts[0] === itemsubmod.title;
                  })
                  .map((item) => {
                    const parts = item.split(".");
                    return parts[1];
                  });

                if (itemsubmod.submenu) {
                  itemsubmod.submenu.filter((itemmainpage) => {
                    if (res?.data?.srole?.mainpagename?.includes(itemmainpage.title)) {
                      mainPageDbNames.push(itemsubmod.dbname);
                      mainPageTitleNames.push(itemmodule.title);
                      const filteredArray = res?.data?.srole?.controlname
                        .filter((item) => {
                          const parts = item.split(".");
                          return parts[0] === itemmainpage.title;
                        })
                        .map((item) => {
                          const parts = item.split(".");
                          return parts[1];
                        });
                      const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                        .filter((item) => {
                          const parts = item.split(".");
                          return parts[0] === itemmainpage.title;
                        })
                        .map((item) => {
                          const parts = item.split(".");
                          return parts[1];
                        });

                      if (itemmainpage.submenu) {
                        itemmainpage.submenu.filter((itemsubpage) => {
                          if (res?.data?.srole?.subpagename?.includes(itemsubpage.title)) {
                            subPageDbNames.push(itemsubmod.dbname);
                            subPageTitleNames.push(itemmodule.title);
                            const filteredArray = res?.data?.srole?.controlname
                              .filter((item) => {
                                const parts = item.split(".");
                                return parts[0] === itemsubpage.title;
                              })
                              .map((item) => {
                                const parts = item.split(".");
                                return parts[1];
                              });
                            const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                              .filter((item) => {
                                const parts = item.split(".");
                                return parts[0] === itemsubpage.title;
                              })
                              .map((item) => {
                                const parts = item.split(".");
                                return parts[1];
                              });

                            if (itemsubpage.submenu) {
                              itemsubpage.submenu.filter((itemsubsubpage) => {
                                if (res?.data?.srole?.subsubpagename?.includes(itemsubsubpage.title)) {
                                  subsubPageDbNames.push(itemsubmod.dbname);
                                  subsubPageTitleNames.push(itemmodule.title);
                                  const filteredArray = res?.data?.srole?.controlname
                                    .filter((item) => {

                                      const parts = item.split(".");
                                      return parts[0] === itemsubsubpage.title;

                                    })
                                    .map((item) => {
                                      const parts = item.split(".");
                                      return parts[1];
                                    });
                                  const filteredArrayControlGroup = res?.data?.srole?.controlgroupingtitles
                                    .filter((item) => {
                                      const parts = item.split(".");
                                      return parts[0] === itemsubsubpage.title;
                                    })
                                    .map((item) => {
                                      const parts = item.split(".");
                                      return parts[1];
                                    });

                                  transformed.push({
                                    name: itemmodule.title,
                                    submodule: itemsubmod.title,
                                    mainpage: itemmainpage.title,
                                    subpage: itemsubpage.title,
                                    subsubpage: itemsubsubpage.title,
                                    control: filteredArray,
                                    controlgroupingtitles: filteredArrayControlGroup,
                                  });

                                }
                              });
                            } else {
                              transformed.push({
                                name: itemmodule.title,
                                submodule: itemsubmod.title,
                                mainpage: itemmainpage.title,
                                subpage: itemsubpage.title,
                                control: filteredArray,
                                controlgroupingtitles: filteredArrayControlGroup,
                              });
                            }
                          }
                        });
                      } else {
                        transformed.push({
                          name: itemmodule.title,
                          submodule: itemsubmod.title,
                          mainpage: itemmainpage.title,
                          control: filteredArray,
                          controlgroupingtitles: filteredArrayControlGroup,
                        });
                      }
                    }
                  });
                } else {
                  transformed.push({
                    name: itemmodule.title,
                    submodule: itemsubmod.title,
                    control: filteredArray,
                    controlgroupingtitles: filteredArrayControlGroup,
                  });
                }
              }
            });
          } else {

          }
        }
      });


      setRoleEditOptionsDupForBackup(transformed);

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const getUserRolesOverallLinked = async (name) => {
    try {
      let roles = await axios.post(SERVICE.OVERALL_EDIT_ROLE_CHECK, {
        headers: {
          'Authorization': `Bearer ${auth.APIToken}`
        },
        rolename: name
      });
      const dataRoles = roles?.data?.role?.length > 0 ? roles?.data?.role : [];
      setOldRoleNameData(dataRoles);
      setOvProjCount(roles?.data?.count);
      setGetOverallCount(`The ${name} is linked in
     ${dataRoles?.length > 0 ? "Users " : ""} whether you want to do changes ..??`);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  }
  const [deleted, setDeleted] = useState([]);

  const removeArray = (index) => {
    const ans = [...roleEditOptions];
    ans.splice(index, 1);
    setDeleted(ans);
    setRoleEditOptions(ans);

    setPopupContent("Deleted Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  const EditControls = async (index) => {
    setChangeControl(true);
    setGetIndex(index);
    const ans = roleEditOptions[index].control;
    setUpdateControlNames(ans.map((data) => ({
      label: data,
      value: data
    })))

  };

  const UpdateControls = (index) => {
    setChangeControl(false);
    const answer = updateControlNames.map((d) => d.value);
    const newTodoscheck = [...roleEditOptions];
    newTodoscheck[index].control = answer;
    setRoleEditOptions(newTodoscheck);
    setHasChangesRole(compareData(newTodoscheck, roleEditOptionsDupForBackup));
    setRoleEditOptionsDup(roleEditOptionsDupForBackup);
    setPopupContent("Updated Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  //module dropdowns
  const module = menuItems.map((d) => ({
    ...d,
    label: d.title,
    value: d.title,
  }));

  //Submodule dropdowns
  const fetchSubModuleDropDowns = (e) => {
    let subModule = menuItems.filter((data) => data.title === e);
    let dropdown = subModule.map((data) => data.submenu);
    let ans = [].concat(...dropdown).map((d) => ({
      ...d,
      label: d.title,
      value: d.title,
    }));
    setSubModuleOptions(ans);
  };
  //MainPage dropdowns
  const fetchMainDropDowns = (e) => {
    let ans = e;
    setsubModuleTitle(ans.map((data) => data.title));
    let subModule = ans.filter((data) => data.submenu).map((item) => item.submenu);
    let answer = [].concat(...subModule).map((d) => ({
      ...d,
      label: d.title,
      value: d.title,
    }));
    setMainPageOptions(answer);
  };
  //subPage dropdowns
  const fetchSubPageDropDowns = (e) => {
    let ans = e;
    setmainPageTitle(e.map((data) => data.title));
    let subModule = ans.filter((data) => data.submenu).map((item) => item.submenu);
    let answer = [].concat(...subModule).map((d) => ({
      ...d,
      label: d.title,
      value: d.title,
    }));
    setSubpageOptions(answer);
  };
  //subPage dropdowns
  const fetchSubSubPageDropDowns = (e) => {
    let ans = e;
    setSubpageTitle(e.map((data) => data.title));
    let subModule = ans.filter((data) => data.submenu).map((item) => item.submenu);
    let answer = [].concat(...subModule).map((d) => ({
      ...d,
      label: d.title,
      value: d.title,
    }));
    setSubSubpageOptions(answer);
  };

  const compareData = (data1, data2) => {
    if (data1.length !== data2.length) return true;

    return data1.some((obj1, index) => {
      const obj2 = data2[index];

      if (obj1.mainpage !== obj2.mainpage || obj1.name !== obj2.name || obj1.submodule !== obj2.submodule) {
        return true;
      }

      if (!arraysEqual(obj1.control, obj2.control)) {
        return true;
      }

      if (!arraysEqual(obj1.controlgroupingtitles, obj2.controlgroupingtitles)) {
        return true;
      }

      return false;
    });
  };

  const arraysEqual = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;

    return arr1.every(item1 => arr2.some(item2 => JSON.stringify(item1) === JSON.stringify(item2))) &&
      arr2.every(item2 => arr1.some(item1 => JSON.stringify(item1) === JSON.stringify(item2)));
  };

  const [hasChangesRole, setHasChangesRole] = useState(false);

  useEffect(() => {
    setHasChangesRole(compareData(roleEditOptions, roleEditOptionsDup));
  }, [roleEditOptions, roleEditOptionsDup]);

  useEffect(() => {
    if (hasChangesRole) {
      showToast();
    } else {
      closeToast();
    }
  }, [hasChangesRole]);



  // / Sub Module Multiselect
  const handleSubModuleChange = (options) => {
    setValueSubModule(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsSubModule(options);
    setSelectedOptionsMainPage([]);
    setSelectedOptionsSubPage([]);
    setSelectedOptionsSubSubPage([]);
    fetchMainDropDowns(options);
    if (options.length == 0) {
      setSelectedOptionsMainPage([]);
      setValueMainPage("");
    }
    setSubpageOptions([])
    setSubSubpageOptions([])
  };
  const customValueRendererSubModule = (valueSubModule, _submoduleOptions) => {
    return valueSubModule.length ? valueSubModule.map(({ label }) => label).join(", ") : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Sub-Module</span>;
  };
  // Main Page Multiselect
  const handleMainPageChange = (options) => {
    setValueMainPage(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsSubPage([]);
    setSelectedOptionsSubSubPage([]);
    setSubSubpageOptions([])
    fetchSubPageDropDowns(options);
    setSelectedOptionsMainPage(options);
  };
  const customValueRendererMainPage = (valueMainPage, _mainpageOptions) => {
    return valueMainPage.length ? valueMainPage.map(({ label }) => label).join(", ") : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Main-Page</span>;
  };
  // Sub Page Multiselect
  const handleSubPageChange = (options) => {

    setSelectedOptionsSubSubPage([]);
    setSelectedOptionsSubPage(options);
    setSubpageTitle(options.map((data) => data.title));
    fetchSubSubPageDropDowns(options)
  };
  const customValueRendererSubPage = (valueSubPage, _subpageOptions) => {
    return valueSubPage.length ? valueSubPage.map(({ label }) => label).join(", ") : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Sub-Page</span>;
  };

  // Sub-Sub Page Multiselect
  const handleSubSubPageChange = (options) => {
    setSelectedOptionsSubSubPage(options);
    setSubSubpageTitle(options.map((data) => data.title));
  };
  const customValueRendererSubSubPage = (valueSubPage, _subpageOptions) => {
    return valueSubPage.length ? valueSubPage.map(({ label }) => label).join(", ") : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Sub Sub-Page</span>;
  };

  //get all Control Groupping.
  const fetchControlGrouping = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.CONTROLSGROUPING, {
        headers: {
          'Authorization': `Bearer ${auth.APIToken}`
        }
      });
      setControlsgroupings(res_vendor?.data?.controlsgroupings?.map((data) => ({
        ...data,
        label: data.controlname,
        value: data.controlname
      })));
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  }

  const handleControlGroupingChange = (options) => {

    setSelectedControlGrouping(options);
    setControlGroupingValues(options.map((a, index) => {
      return a.value;
    }));
    let ans = options.flatMap((a, index) => {
      return a.control;
    })
    setControls(ans.map((data) => ({
      ...data,
      label: data,
      value: data,

    })))

  };

  const handleControlGroupingUpdate = async (options) => {
    let answer = options.map((data) => data.value);

    let res_vendor = await axios.get(SERVICE.CONTROLSGROUPING, {
      headers: {
        'Authorization': `Bearer ${auth.APIToken}`
      }
    });

    let ans = res_vendor.data.controlsgroupings.filter((data) => answer.includes(data.controlname))
    let answers = ans.map((data) => data.control).flat();
  };
  const customValueRendererControlGrouping = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(", ") : "Please select Control Grouping";
  };

  useEffect(() => {
    fetchControlGrouping();
  }, [])

  // Controls Multiselect
  const handleControlsChange = (options) => {
    setValueControls(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsControls(options);
    setControlTitle(options.map((data) => data.value));
  };
  const customValueRendererControls = (valueControls, _controls) => {
    return valueControls.length ? valueControls.map(({ label }) => label).join(", ") : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Controls</span>;
  };

  //Todo Page
  const fetchhTodo = () => {

    if (moduleName === "Please Select Module" && valueSubModule.length < 1) {
      setPopupContentMalert("Please Select Module& Sub-Module");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (valueSubModule.length < 1 && submoduleOptions.length > 1) {
      setPopupContentMalert("Please Select Sub Module Page");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (valueMainPage.length < 1 && mainpageOptions.length > 1) {
    //   setPopupContentMalert("Please Select Main Page");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    else if (controlGroupingValues?.length < 1) {
      setPopupContentMalert("Please Choose Controls Grouping");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (valueControls.length < 1) {
      setPopupContentMalert("Please Select Controls");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }

    else {
      const todo = [];
      let ans = menuItems.filter((itemmodule) => {
        if (moduleName?.includes(itemmodule.title)) {
          // todo.push({
          //   name: itemmodule.title,
          //   control: controlTitle,
          // });
          if (itemmodule.submenu) {
            itemmodule.submenu.filter((itemsubmod) => {
              if (subModuleTitle?.includes(itemsubmod.title)) {
                if (itemsubmod.submenu) {
                  itemsubmod.submenu.filter((itemmainpage) => {
                    if (mainPageTitle?.includes(itemmainpage.title)) {
                      if (itemmainpage.submenu) {
                        itemmainpage.submenu.filter((itemsubpage) => {
                          if (subPageTitle?.includes(itemsubpage.title)) {
                            if (itemsubpage.submenu) {
                              itemsubpage.submenu.filter((itemsubsubpage) => {
                                if (subsubPageTitle?.includes(itemsubsubpage.title)) {
                                  todo.push({
                                    name: itemmodule.title,
                                    submodule: itemsubmod.title,
                                    mainpage: itemmainpage.title,
                                    subpage: itemsubpage.title,
                                    subsubpage: itemsubsubpage.title,
                                    control: controlTitle,
                                    controlgroupingtitles: controlGroupingValues
                                  });

                                }
                              });
                            } else {
                              todo.push({
                                name: itemmodule.title,
                                submodule: itemsubmod.title,
                                mainpage: itemmainpage.title,
                                subpage: itemsubpage.title,
                                control: controlTitle,
                                controlgroupingtitles: controlGroupingValues
                              });
                            }
                          }
                        });
                      } else {
                        todo.push({
                          name: itemmodule.title,
                          submodule: itemsubmod.title,
                          mainpage: itemmainpage.title,
                          control: controlTitle,
                          controlgroupingtitles: controlGroupingValues
                        });
                      }
                    }
                  });
                } else {
                  todo.push({
                    name: itemmodule.title,
                    submodule: itemsubmod.title,
                    control: controlTitle,
                    controlgroupingtitles: controlGroupingValues
                  });
                }
              }
            });
          }
        }
      });

      const unmatchedItems = [];

      for (let i = 0; i < todo.length; i++) {
        const item2 = todo[i];
        const isMatched = roleEditOptions.some((item1) => deepCompareWithoutControl(item1, item2));

        if (!isMatched) {
          unmatchedItems.push(item2);
        }
      }

      function deepCompareWithoutControl(obj1, obj2) {
        const keys1 = Object.keys(obj1).filter((key) => key !== "control" && key !== "controlgroupingtitles");
        const keys2 = Object.keys(obj2).filter((key) => key !== "control" && key !== "controlgroupingtitles");

        if (keys1.length !== keys2.length) {
          return false;
        }

        for (const key of keys1) {
          if (obj1[key] !== obj2[key]) {
            return false;
          }
        }

        return true;
      }

      if (unmatchedItems.length > 0) {
        setRoleEditOptions([...roleEditOptions, ...unmatchedItems]);
        setPopupContent("Data is Added");
        setPopupSeverity("success");
        handleClickOpenPopup();
      } else {
        setPopupContentMalert("These Data is Already Added");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  const hanldeClear = () => {
    setModuleName("Please Select Module");
    setsubModuleTitle([]);
    setmainPageTitle([]);
    setSubpageTitle([]);
    setSubSubpageTitle([]);
    setControlTitle([])
    setValueControls([])
    setValueMainPage([])
    setValueSubModule([])
    setSubModuleOptions([]);
    setMainPageOptions([]);
    setSubpageOptions([]);
    setSubSubpageOptions([]);
    setsubModuleTitle([]);
    setSelectedOptionsSubModule([]);
    setSelectedOptionsMainPage([]);
    setSelectedOptionsSubPage([]);
    setSelectedOptionsSubSubPage([]);
    setSelectedOptionsControls([]);
    setControlGroupingValues([]);
    setSelectedControlGrouping([]);
    setControls([])
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  const handleBAck = () => {
    setModuleName("Please Select Module");
    setSubModuleOptions([]);
    setMainPageOptions([]);
    setSubpageOptions([]);
    setSubSubpageOptions([]);
    setsubModuleTitle([]);
    setSelectedOptionsSubModule([]);
    setSelectedOptionsMainPage([]);
    setSelectedOptionsSubPage([]);
    setSelectedOptionsControls([]);
    setSelectedOptionsSubSubPage([]);
    setControlGroupingValues([]);
    setSelectedControlGrouping([]);
    setControls([])
    backPage("/createrole");
  };

  let updateby = subprojid?.updatedby;
  let addedby = subprojid?.addedby;

  const handleSubmit = () => {
    if (roleNameEdit === "") {
      setPopupContentMalert("Please Enter Role Name");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (subprojid?.name !== roleNameEdit && ovProjCount > 0) {
      setShowAlertpop(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>{getOverAllCount}</p>
        </>
      );
      handleClickOpenerrpop();
    } else {
      fetchSubmit()
    }
  }


  //ubmiit Request
  const fetchSubmit = async () => {
    setPageName(!pageName);
    try {

      const controlNames = [];
      const ans = roleEditOptions.map((data, indeex) => {
        // controlNames.push(data.name , data.submodule , data.mainpage , data.subpage)
        let answer = [data.name, data.submodule, data.mainpage, data.subpage, data.subsubpage];
        const filteredArray = answer.filter((item) => item !== undefined);
        const answerFilterArray = filteredArray.map((data) => data.toLowerCase().replace(/\s+/g, ""));
        for (const wordA of answerFilterArray) {
          for (const wordB of data.control) {
            if (wordB === "PDF" || wordB === "Excel" || wordB === "Print" || wordB === "CSV" || wordB === "Image") {
              const combinedWord = wordB.toLowerCase() + wordA;
              const combinedWordMenu = "menu" + wordA;
              controlNames.push(combinedWordMenu);
              controlNames.push(combinedWord);
            }
            else if (wordB === 'BulkEdit') {
              const combinedWord = "be" + wordA;
              const combinedWordMenu = "menu" + wordA;
              controlNames.push(combinedWordMenu);
              controlNames.push(combinedWord);
            }
            else if (wordB === "BulkDelete") {
              const combinedWord = "bd" + wordA;
              controlNames.push(combinedWord);
              const combinedWordMenu = "menu" + wordA;
              controlNames.push(combinedWordMenu);
            }
            else {
              const combinedWord = wordB[0].toLowerCase() + wordA;
              controlNames.push(combinedWord);
              const combinedWordMenu = "menu" + wordA;
              controlNames.push(combinedWordMenu);
            }
          }
        }
      });

      const moduleTitle = Array.from(new Set(roleEditOptions.map((data) => data.name)));

      const concatenatedArray = roleEditOptions.map((item) => {
        return item.control.map((control) => `${item.name}.${control}`);
      });

      const concatenatedArraysubMod = roleEditOptions
        .filter((data) => data.submodule !== undefined)
        .map((item) => {
          return item.control.map((control) => `${item.submodule}.${control}`);
        });
      const concatenatedArraymainPage = roleEditOptions
        .filter((data) => data.mainpage !== undefined)
        .map((item) => {
          return item.control.map((control) => `${item.mainpage}.${control}`);
        });
      const concatenatedArraysubPage = roleEditOptions
        .filter((data) => data.subpage !== undefined)
        .map((item) => {
          return item.control.map((control) => `${item.subpage}.${control}`);
        });
      const concatenatedArraysubsubPage = roleEditOptions
        .filter((data) => data.subsubpage !== undefined)
        .map((item) => {
          return item.control.map((control) => `${item.subsubpage}.${control}`);
        });

      let controNamesMod = [].concat(...concatenatedArray);
      let controNamessubMod = [].concat(...concatenatedArraysubMod);
      let controNamesMainpage = [].concat(...concatenatedArraymainPage);
      let controNamessubpage = [].concat(...concatenatedArraysubPage);
      let controNamessubsubpage = [].concat(...concatenatedArraysubsubPage);
      let overalNamesControl = [...controNamesMod, ...controNamessubMod, ...controNamesMainpage, ...controNamessubpage, ...controNamessubsubpage];
      const subMod = roleEditOptions.filter((data) => data.submodule !== undefined);

      const submooduleTitle = Array.from(new Set(subMod.map((data) => data.submodule)));

      const mainPage = roleEditOptions.filter((data) => data.mainpage !== undefined);
      const mainPageTitle = Array.from(new Set(mainPage.map((data) => data.mainpage)));

      const subPage = roleEditOptions.filter((data) => data.subpage !== undefined);
      const subPageTitle = Array.from(new Set(subPage.map((data) => data.subpage)));

      const subSubPage = roleEditOptions.filter((data) => data.subsubpage !== undefined);
      const subSubPageTitle = Array.from(new Set(subSubPage.map((data) => data.subsubpage)));

      let res = await axios.put(`${SERVICE.ROLE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        name: String(roleNameEdit),
        modulename: moduleTitle,
        submodulename: submooduleTitle,
        mainpagename: mainPageTitle,
        subpagename: subPageTitle,
        subsubpagename: subSubPageTitle,
        controlname: Array.from(new Set(overalNamesControl)),
        rolenew: controlNames,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await sendEditRequestOverall(roleNameEdit);
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      getCode()
      getCodeDup()
      // backPage("/createrole");
      // setModuleName("Please Select Module");
      setSubModuleOptions([]);
      setMainPageOptions([]);
      setSubpageOptions([]);
      setSubSubpageOptions([]);
      setsubModuleTitle([]);
      // }
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

  };

  const sendEditRequestOverall = async (role) => {
    setPageName(!pageName);
    try {
      if (oldRoleNameData.length > 0) {
        let answ = oldRoleNameData.map((d, i) => {
          const oldNames = d?.role?.filter(data => data !== subprojid?.name)
          console.log([...oldNames, role], '[...oldNames, role]')
          let res = axios.put(`${SERVICE.USER_SINGLE_PWD}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            role: [...oldNames, role],
          });
        });
      }


    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    getCode();
    getCodeDup();
  }, []);

  return (
    <Box>
      <Headtitle title={"Role Edit"} />
      <PageHeading
        title="Edit Role"
        modulename="Setup"
        submodulename="Role"
        mainpagename=""
        subpagename=""
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("erole") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item md={8} xs={12} sm={12}>
                  <Typography sx={userStyle.importheadtext}>
                    Edit Roles
                  </Typography>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                    Update
                  </Button>
                </Grid>

                <Grid item md={2} xs={12} sm={12}>
                  <Link to={`/createrole`} style={{ textDecoration: "none", color: "#fff", minWidth: "0px" }}>
                    <Button variant="contained" sx={buttonStyles.btncancel}  >Back</Button>
                  </Link>
                </Grid>

              </Grid>
              <br />
              <Grid item md={12} xs={12} sx={{ display: "flex" }}>
                <Typography variant="h6">
                  Role Name<b style={{ color: "red" }}>*</b>:
                </Typography>
                &emsp;
                <FormControl>
                  <OutlinedInput type="text" value={roleNameEdit} onChange={(e) => setRoleNameEdit(e.target.value)} />
                </FormControl>
              </Grid>
              <Grid container sx={{ justifyContent: "left" }} spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>
                    Module<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Selects
                      styles={colourStyles}
                      options={module}
                      value={{ value: moduleName, label: moduleName }}
                      onChange={(e) => {
                        setModuleName(e.value);
                        fetchSubModuleDropDowns(e.value);
                        setSelectedOptionsSubModule([]);
                        setSelectedOptionsMainPage([]);
                        setSelectedOptionsSubPage([]);
                        setSelectedOptionsSubSubPage([]);
                        setMainPageOptions([])
                        setSubpageOptions([])
                        setSubSubpageOptions([])

                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Sub-Module<b style={{ color: "red" }}>*</b></Typography>
                  <FormControl size="small" fullWidth>

                    <MultiSelect size="small"
                      options={submoduleOptions}
                      value={selectedOptionsSubModule}
                      onChange={handleSubModuleChange} valueRenderer={customValueRendererSubModule} />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Main-Page</Typography>
                  <FormControl size="small" fullWidth>

                    <MultiSelect size="small"
                      options={mainpageOptions}
                      value={selectedOptionsMainPage}
                      onChange={handleMainPageChange} valueRenderer={customValueRendererMainPage} />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Sub-Page</Typography>
                  <FormControl size="small" fullWidth>

                    <MultiSelect size="small" options={subpageOptions} value={selectedOptionsSubPage} onChange={handleSubPageChange} valueRenderer={customValueRendererSubPage} />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>Sub Sub-Page</Typography>
                  <FormControl size="small" fullWidth>

                    <MultiSelect size="small" options={subsubpageOptions} value={selectedOptionsSubSubPage} onChange={handleSubSubPageChange} valueRenderer={customValueRendererSubSubPage} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Controls Grouping<b style={{ color: "red" }}>*</b></Typography>
                    <MultiSelect
                      options={controlsgroupings}
                      value={selectedControlGrouping}
                      onChange={(e) => {
                        handleControlGroupingChange(e);
                      }}
                      valueRenderer={customValueRendererControlGrouping}
                      labelledBy="Please Select Control Grouping"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Typography>
                    Controls <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl size="small" fullWidth>

                    <MultiSelect size="small"
                      options={controls}
                      value={selectedOptionsControls}
                      onChange={handleControlsChange}
                      valueRenderer={customValueRendererControls} />
                  </FormControl>
                </Grid>
              </Grid>
              <br></br>
              <br></br>
              <br></br>
              <Grid container spacing={2}>
                <Grid item md={1} xs={12} sm={12}>
                  {moduleName === "Please Select Module" ? "" :
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={fetchhTodo}>
                      ADD
                    </Button>}
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  {moduleName === "Please Select Module" ? "" :
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                      Update
                    </Button>}
                </Grid>
                <Grid item md={1} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={hanldeClear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
              <br />
              <br />

              <Typography>
                <b>Role List </b>
              </Typography>
              <br></br>
              <Grid container spacing={2}>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Typography>
                    <b>Module Name</b>
                  </Typography>
                </Grid>
                <Grid item md={1} xs={12} sm={12}>
                  <Typography>
                    <b>Sub-Module Name</b>
                  </Typography>
                </Grid>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Typography>
                    <b>Main Page Name</b>
                  </Typography>
                </Grid>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Typography>
                    <b>Sub-Page Name</b>
                  </Typography>
                </Grid>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Typography>
                    <b>Sub-Sub-Page Name</b>
                  </Typography>
                </Grid>
                <Grid item md={3.2} xs={12} sm={12}>
                  <Typography>
                    <b>Control Name</b>
                  </Typography>
                </Grid>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Typography>
                    <b>Actions</b>
                  </Typography>
                </Grid>
              </Grid>
              <br></br>

              {roleEditOptions.length > 0 &&
                roleEditOptions.map((data, index) => {
                  return (
                    <Grid container spacing={2}>
                      <Grid item md={1.5} xs={12} sm={12}>
                        <Typography>{data.name}</Typography>
                      </Grid>
                      <Grid item md={1} xs={12} sm={12}>
                        <Typography>{data.submodule}</Typography>
                      </Grid>
                      <Grid item md={1.5} xs={12} sm={12}>
                        <Typography>{data.mainpage}</Typography>
                      </Grid>
                      <Grid item md={1.5} xs={12} sm={12}>
                        <Typography>{data.subpage}</Typography>
                      </Grid>
                      <Grid item md={1.5} xs={12} sm={12}>
                        <Typography>{data.subsubpage}</Typography>
                      </Grid>
                      {changeControl && getIndex === index ? (
                        <>
                          <Grid item md={2} xs={12} sm={12}>
                            <Selects
                              isMulti
                              options={controlsUpdate}
                              styles={colourStyles}
                              value={updateControlNames}
                              onChange={(e) => {
                                setUpdateControlNames(e);
                              }}
                            />
                          </Grid>
                          <Grid item md={1} xs={12} sm={12}>
                            <Button onClick={(e) => UpdateControls(index)}>
                              <CheckCircleIcon />
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          <Grid item md={3.5} xs={12} sm={12}>
                            <Typography>{data?.control?.map((t, i) => `${i + 1 + ". "}` + t).toString()}</Typography>
                          </Grid>
                          <Grid item md={0.5} xs={12} sm={12}>
                            <Button onClick={(e) => EditControls(index)}>
                              <EditOutlined sx={buttonStyles.buttonedit} />
                            </Button>
                          </Grid>
                        </>
                      )}
                      <Grid item md={0.5} xs={12} sm={12}>
                        {changeControl && getIndex === index ? (
                          ""
                        ) : (
                          <Button onClick={(e) => removeArray(index)}>
                            <DeleteOutlineOutlined sx={buttonStyles.buttondelete} />
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
              { }
              <br />
              <br />
              <br />

              <Grid container spacing={2}>
                {/* <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
                  <Button variant="contained" color="primary" onClick={fetchSubmit}>
                    Update
                  </Button> */}
                {/* </Grid> */}
                <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
                  <Button sx={buttonStyles.btncancel} onClick={handleBAck}>
                    Back
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </>
      )
      }
      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
            {/* <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} /> */}
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Delete Modal */}
      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isDeleteOpen} onClose={handleCloseDel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: "orange" }} />
            <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
              Are you sure?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDel} sx={userStyle.btncancel}>
              Cancel
            </Button>
            <Button autoFocus variant="contained" color="error">
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* ALERT DIALOG */}
      <Box>
        <Dialog
          open={isErrorOpenpop}
          onClose={handleCloseerrpop}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Grid>
              <Button
                variant="contained"
                style={{
                  padding: "7px 13px",
                  color: "white",
                  background: "rgb(25, 118, 210)",
                  ...buttonStyles?.buttonsubmit
                }}
                onClick={() => {
                  fetchSubmit();
                  handleCloseerrpop();
                }}
              >
                ok
              </Button>
            </Grid>
            &nbsp;
            <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
              Cancel
            </Button>
          </DialogActions>
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
      <ToastContainer transition={Bounce} />
    </Box >
  );
}

export default EditRole;