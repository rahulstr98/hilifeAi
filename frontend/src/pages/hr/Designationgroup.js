import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, Table, TableBody, TableHead, TextField, Typography } from "@mui/material";
import DialogContentText from "@mui/material/DialogContentText";
import Switch from '@mui/material/Switch';
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from 'html2canvas';
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import { StyledTableCell, StyledTableRow } from "../../components/Table";
import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";

import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import AlertDialog from "../../components/Alert";
import ExportData from "../../components/ExportData";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";



function Designationgroup() {

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
      pagename: String("Designation Group"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          date: String(new Date()),
        },
      ],
    });

  }

  const { auth } = useContext(AuthContext);

  const [designationgroup, setDesignationgroup] = useState({
    name: "",
  });
  let exportColumnNames = ['Name', 'Roles'];
  let exportRowValues = ['name', 'roles'];
  const [desiggrpid, setDesiggrpid] = useState({
    name: "",
  });
  const [desiggroup, setDesiggroup] = useState([]);
  const [desiggroupalledit, setDesiggroupalledit] = useState([]);

  const { isUserRoleCompare, isUserRoleAccess, allUsersData, pageName,
    setPageName,
    buttonStyles } = useContext(UserRoleAccessContext);
  const username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [typeOptValue, setTypeOptValue] = useState([])
  const [typeOptValueReq, setTypeOptValueReq] = useState([])

  const [typeOptValueEdit, setTypeOptValueEdit] = useState([])
  const [typeOptValueReqEdit, setTypeOptValueReqEdit] = useState([])

  const [allRoles, setAllRoles] = useState([]);
  const [isBtn, setIsBtn] = useState(false);

  const handleChangeType = (opt) => {
    setTypeOptValue(opt);
    setTypeOptValueReq(opt.map((a, index) => {
      return a.value;
    }))
  }

  const customValueRendererRoles = (typeOptValueReq, _employeename) => {
    return typeOptValueReq?.length ? typeOptValueReq.map(({ label }) => label)?.join(", ") : "Please select Roles";
  };

  const handleChangeTypeEdit = (opt) => {
    setTypeOptValueEdit(opt);
    setTypeOptValueReqEdit(opt.map((a, index) => {
      return a.value;
    }))
  }

  const customValueRendererRolesEdit = (typeOptValueReq, _employeename) => {
    return typeOptValueReq?.length ? typeOptValueReq.map(({ label }) => label)?.join(", ") : "Please select Roles";
  };

  const fetchAllRoles = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.get(SERVICE.ROLENAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const allrolelist = [
        ...res?.data?.roles.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];

      setAllRoles(allrolelist);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'Designation Group.png');
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
  const [ovProj, setOvProj] = useState("");
  const [ovProjcount, setOvProjcount] = useState(0);

  const [getOverAllCount, setGetOverallCount] = useState("");

  const [isDesigngrp, setIsDesigngrp] = useState(false);

  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  // view model
  const [openview, setOpenview] = useState(false);

  const handleClickOpenview = () => {
    setOpenview(true);
  };

  const handleCloseview = () => {
    setOpenview(false);
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

  const [getrowid, setRowGetid] = useState("");

  // Edit model
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
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
      overallBulkdelete(selectedRows);

      // setIsDeleteOpencheckbox(true);
    }
  };

  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  const overallBulkdelete = async (ids) => {
    setPageName(!pageName);
    try {
      let overallcheck = await axios.post(
        `${SERVICE.DESIGNATIONGROUPBULKCHECK}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          id: ids,
        }
      );
      // setSelectedRows(overallcheck?.data?.result);
      // setIsDeleteOpencheckbox(true);
      setSelectedRows(overallcheck?.data?.result);
      setSelectedRowsCount(overallcheck?.data?.count)
      handleClickOpencheckbox(true);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("")
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const getRowClassName = (params) => {
    if ((selectedRows).includes(params.row.id)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns 
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    name: true,
    roles: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // get all designation
  const fetchDesignationgroup = async () => {
    setPageName(!pageName)
    try {
      let res_designationgroup = await axios.get(SERVICE.DESIGNATIONGRP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setDesiggroup(res_designationgroup?.data.desiggroup);
      setIsDesigngrp(true);
    } catch (err) { setIsDesigngrp(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const [deletedesignationgrp, setDeletedesignationgrp] = useState({});

  //------------------------------------------------------

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState("xl");

  // Print
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Designationgroup",
    pageStyle: "print",
  });

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  //set function to get particular row

  const [checkdesignation, setCheckDesignation] = useState();

  const rowData = async (id, name) => {
    setPageName(!pageName)
    try {
      const [res, resdev] = await Promise.all([
        axios.get(`${SERVICE.DESIGNATIONGRP_SINGLE}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.post(SERVICE.GROUPTODESIGNATIONCHECK, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          checkdesignationgrp: String(name),
        })
      ])
      setDeletedesignationgrp(res?.data?.sdesiggroup);
      setCheckDesignation(resdev?.data?.group);

      if ((resdev?.data?.group).length > 0) {
        setPopupContentMalert(
          <span style={{ fontWeight: "700", color: "#777" }}>
            {`${name}`}
            <span style={{ fontWeight: "bold", color: "black" }}> was linked</span>
          </span>
        );
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        handleClickOpen();
      }
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  // Alert delete popup
  let designationgrpid = deletedesignationgrp._id;
  const delDesignationgrp = async () => {
    setPageName(!pageName)
    try {
      await axios.delete(`${SERVICE.DESIGNATIONGRP_SINGLE}/${designationgrpid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchDesignationgroup();
      setPage(1);
      setSelectedRows([]);
      handleCloseMod();
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();


    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };


  const delDesiggrpcheckbox = async () => {
    setPageName(!pageName)
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.DESIGNATIONGRP_SINGLE}/${item}`, {
          headers: {
            'Authorization': `Bearer ${auth.APIToken}`
          }
        });
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);

      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);

      await fetchDesignationgroup();
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };


  //this is add database
  const sendRequest = async () => {
    setIsBtn(true)
    let filteredData = typeOptValue.map((data) => data.value);

    setPageName(!pageName)
    try {
      let designationgrp = await axios.post(SERVICE.DESIGNATIONGRP_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },

        name: String(designationgroup.name),
        roles: filteredData,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchDesignationgroup();
      setDesignationgroup(designationgrp.data);
      setDesignationgroup({ name: "" });
      setTypeOptValue([]);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setIsBtn(false)
    } catch (err) { setIsBtn(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const handleSubmit = (e) => {

    e.preventDefault();
    let filtered = typeOptValue.map((data) => data.value);
    const isNameMatch = desiggroup.some((item) =>
      item.name.toLowerCase() === designationgroup.name.toLowerCase()
    );

    if (designationgroup.name === "") {
      setPopupContentMalert("Please Enter Name");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    }
    else if (typeOptValue.length === 0) {
      setPopupContentMalert("Please Select Roles");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    }

    else if (isNameMatch) {
      setPopupContentMalert("Data Already Exists!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setDesignationgroup({
      name: "",
    });
    setTypeOptValue([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();


  };

  useEffect(() => {
    fetchDesignationgroup();
    fetchDesignationgroupAll();
    fetchAllRoles();
  }, []);

  useEffect(() => {
    fetchDesignationgroupAll();
  }, [isEditOpen, desiggrpid]);

  //Edit functiona --->> getCode, sendEditRequest , editSubmit

  const [oldRoles, setOldRoles] = useState([]);

  //get single row to edit
  const getCode = async (e, name, roles) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.DESIGNATIONGRP_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesiggrpid(res?.data?.sdesiggroup);
      setOldRoles(roles?.split(','));
      setTypeOptValueEdit(res?.data?.sdesiggroup?.roles.map((data) => ({
        label: data, value: data
      })))
      setRowGetid(res?.data?.sdesiggroup);
      setOvProj(name);
      getOverallEditSection(name);
      handleClickOpenEdit();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.DESIGNATIONGRP_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesiggrpid(res?.data?.sdesiggroup);
      handleClickOpenview();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.DESIGNATIONGRP_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesiggrpid(res?.data?.sdesiggroup);
      handleClickOpeninfo();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  // get all designation
  const fetchDesignationgroupAll = async () => {
    setPageName(!pageName)
    try {
      let res_designationgroup = await axios.get(SERVICE.DESIGNATIONGRP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesiggroupalledit(res_designationgroup?.data?.desiggroup.filter((item) => item._id !== desiggrpid._id));
    } catch (err) { setIsDesigngrp(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  //floor updateby edit page...
  let updateby = desiggrpid.updatedby;
  let addedby = desiggrpid.addedby;
  let desiggroupid = getrowid._id;
  //editing the single data
  const sendEditRequest = async () => {
    let filteredData = typeOptValueEdit.map((data) => data.value);
    setPageName(!pageName)
    try {
      let res = await axios.put(`${SERVICE.DESIGNATIONGRP_SINGLE}/${desiggroupid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        name: String(desiggrpid.name),
        roles: filteredData,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });

      let res_designation = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let getDesignations = res_designation?.data?.designation.filter((data) => {
        return data.group === desiggrpid.name
      }).map((item) => item.name)

      let designationBasedUsers = allUsersData.filter((data) => {
        return getDesignations.includes(data.designation)
      })

      let getIDwithrole = designationBasedUsers.map((item) => ({ id: item._id, roleold: item.role }));


      let selectedRoles = typeOptValueEdit.map((item) => item.value);


      // let res1 = await Promise.all(
      //   getIDwithrole.map(async (data) => {
      //     setPageName(!pageName)
      //     try {
      //       const response = await axios.put(
      //         `${SERVICE.USER_SINGLE_PWD}/${data.id}`,
      //         {
      //           role: [...selectedRoles, ...data.roleold],
      //           updatedby: [
      //             ...updateby,
      //             {
      //               name: String(isUserRoleAccess.companyname),
      //               date: String(new Date()),
      //             },
      //           ],
      //         },
      //         {
      //           headers: {
      //             Authorization: `Bearer ${auth.APIToken}`,
      //           },
      //         }
      //       );

      //     } catch (error) {
      //       console.error(`Error updating user ${data}:`, error);
      //       throw error; // Rethrow error to handle it outside if necessary
      //     }
      //   })
      // );
      let res1 = await Promise.all(
        getIDwithrole.map(async (data) => {
          setPageName(!pageName);
          try {
            const response = await axios.put(
              `${SERVICE.USER_SINGLE_PWD}/${data.id}`,
              {
                role: [...selectedRoles, ...(Array.isArray(data.roleold) ? data.roleold : [])],
                updatedby: [
                  ...updateby,
                  {
                    name: String(isUserRoleAccess.companyname),
                    date: String(new Date()),
                  },
                ],
              },
              {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
              }
            );
          } catch (error) {
            console.error(`Error updating user ${data.id}:`, error);
            throw error; // Rethrow error to handle it outside if necessary
          }
        })
      );



      await fetchDesignationgroup();
      await fetchDesignationgroupAll();
      setDesignationgroup(res.data);
      await getOverallEditSectionUpdate();
      handleCloseModEdit();
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();

    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    e.preventDefault();
    fetchDesignationgroupAll();
    let filtered = typeOptValueEdit.map((data) => data.value);
    const isNameMatch = desiggroupalledit.some((item) =>
      item.name.toLowerCase() === desiggrpid.name.toLowerCase()

    );

    if (desiggrpid.name === "") {
      setPopupContentMalert("Please Enter Name");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    }
    else if (typeOptValueEdit.length === 0) {
      setPopupContentMalert("Please Select Roles");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else if (isNameMatch) {
      setPopupContentMalert("Data Already Exists!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    }
    else if (desiggrpid.name != ovProj && ovProjcount > 0) {
      setShowAlertpop(getOverAllCount);
      handleClickOpenerrpop();

    }
    else {
      sendEditRequest();
    }
  };

  //overall edit section for all pages
  const getOverallEditSection = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.post(SERVICE.OVERALL_DESIGNATIONGROUP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: e,
      });

      setOvProjcount(res?.data?.count);

      setGetOverallCount(<span style={{ fontWeight: "700", color: "#777" }}>
        <span style={{ fontWeight: "bold", color: "black" }}> The </span>
        {`${e}`}
        <span style={{ fontWeight: "bold", color: "black" }}> is linked  whether you want to do changes ..??</span>
      </span>);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  //overall edit section for all pages
  const getOverallEditSectionUpdate = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.post(SERVICE.OVERALL_DESIGNATIONGROUP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: ovProj,
      });
      sendEditRequestOverall(res?.data?.designation, res?.data?.hierarchy);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const sendEditRequestOverall = async (designation, hierarchy) => {
    setPageName(!pageName)
    try {
      if (designation.length > 0) {
        let answ = designation.map((d, i) => {
          let res = axios.put(`${SERVICE.DESIGNATION_SINGLE}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            group: String(desiggrpid.name),
          });
        });
      }
      if (hierarchy.length > 0) {
        let answ = hierarchy.map((d, i) => {
          let res = axios.put(`${SERVICE.HIRERARCHI_SINGLE}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            designationgroup: String(desiggrpid.name),
          });
        });
      }
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = desiggroup?.map((item, index) => ({ ...item, serialNumber: index + 1, roles: item.roles?.toString() }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [desiggroup]);

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
    setSelectAllChecked(false)
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setSelectAllChecked(false)
    setPage(1);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) =>
      Object.values(item)?.join(" ").toLowerCase().includes(term)
    );
  });
  const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas.length / pageSize);

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
      <Checkbox
        checked={selectAllChecked}
        onChange={onSelectAll}
      />
    </div>
  );

  const columnDataTable = [

    {
      field: "checkbox",
      headerName: "Checkbox", // Default header name
      headerStyle: {
        fontWeight: "bold", // Apply the font-weight style to make the header text bold
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
      headerClassName: "bold-header"
    },
    {
      field: "serialNumber", headerName: "SNo",
      flex: 0, width: 90, hide: !columnVisibility.serialNumber, headerClassName: "bold-header"
    },
    { field: "name", headerName: "Name", flex: 0, width: 130, hide: !columnVisibility.name, headerClassName: "bold-header" },
    { field: "roles", headerName: "Roles", flex: 0, width: 300, hide: !columnVisibility.roles, headerClassName: "bold-header" },

    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 250,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      renderCell: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes("edesignationgroup") && (
            <Button sx={userStyle.buttonedit} onClick={() => {
              getCode(params.row.id, params.row.name, params.row.roles);
            }}><EditOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttonedit} /></Button>
          )}
          {isUserRoleCompare?.includes("ddesignationgroup") && (
            <Button sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name)
              }}>
              <DeleteOutlineOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttondelete} /></Button>
          )}
          {isUserRoleCompare?.includes("vdesignationgroup") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("idesignationgroup") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ]


  useEffect(() => {
    // Save column visibility to localStorage whenever it changes
    localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    // Retrieve column visibility from localStorage (if available)
    const savedVisibility = localStorage.getItem("columnVisibility");
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);


  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      name: item.name,
      roles: item.roles

    }
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
  const filteredColumns = columnDataTable.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
  );

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {

    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));

  };

  // JSX for the "Manage Columns" popover content
  const manageColumnsContent = (
    <Box style={{ padding: "10px", minWidth: "325px", '& .MuiDialogContent-root': { padding: '10px 0' } }} >
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
        <TextField
          label="Find column"
          variant="standard"
          fullWidth
          value={searchQueryManage}
          onChange={(e) => setSearchQueryManage(e.target.value)}
          sx={{ marginBottom: 5, position: 'absolute', }}
        />
      </Box><br /><br />
      <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
        <List sx={{ overflow: 'auto', height: '100%', }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText sx={{ display: 'flex' }}
                primary={
                  <Switch sx={{ marginTop: "-5px" }} size="small"
                    checked={columnVisibility[column.field]}
                    onChange={() => toggleColumnVisibility(column.field)}
                  />
                }
                secondary={(column.field === "checkbox") ? "Checkbox" : column.headerName}
              // secondary={column.headerName }
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
              sx={{ textTransform: 'none', }}
              onClick={() => setColumnVisibility(initialColumnVisibility)}
            >
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

  return (
    <Box>
      <Headtitle title={"DESIGNATION GROUP"} />

      <PageHeading
        title="Designation Group"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="HR Setup"
        subpagename="Designation Group"
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("adesignationgroup") && (
        <>
          <Box sx={userStyle.selectcontainer}>
            < Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.Headtitle}>Add Designation Group</Typography>
              </Grid>
            </Grid>
            <br></br>
            <Grid container lg={12} md={12} sm={12} xs={12} spacing={1}>
              <Grid item md={4} xs={12} sm={6}>
                {/* <Grid container lg={12} md={12}>
                  <Grid item lg={9} md={10} sx={{ display: "flex" }}> */}
                <FormControl fullWidth size="small">
                  <Typography>Name<Typography component="span" sx={{ color: 'red' }}>*</Typography></Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={designationgroup.name}
                    placeholder="Please Enter Name"
                    onChange={(e) => {
                      setDesignationgroup({ ...designationgroup, name: e.target.value });
                    }}
                  />
                </FormControl>
                {/* </Grid>

                </Grid> */}
              </Grid>
              <Grid item md={4} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>Roles <Typography component="span" sx={{ color: 'red' }}>*</Typography></Typography>

                  <MultiSelect
                    options={allRoles}
                    value={typeOptValue}
                    onChange={handleChangeType}
                    valueRenderer={customValueRendererRoles}

                  />

                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={6} mt={3}>
                <Grid container spacing={2}>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <>
                      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isBtn} sx={buttonStyles.buttonsubmit}>
                        Submit
                      </Button>
                    </>
                  </Grid>
                  <Grid item md={2.5} xs={12} sm={6}></Grid>
                  <Grid item md={2.5} xs={12} sm={6}>
                    <>
                      <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                        Clear
                      </Button>
                    </>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <br />

          </Box>
          <br />
        </>
      )}

      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth={true} maxWidth="sm" sx={{
          overflow: 'visible',
          '& .MuiPaper-root': {
            overflow: 'visible',
          },
        }}>
          <Box sx={userStyle.dialogbox}>
            <Typography sx={userStyle.HeaderText} >Edit Designation Group</Typography>
            <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Name <Typography component="span" sx={{ color: 'red' }}>*</Typography></Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={desiggrpid.name}
                    placeholder="Please Enter Name"
                    onChange={(e) => {
                      setDesiggrpid({ ...desiggrpid, name: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>Roles <Typography component="span" sx={{ color: 'red' }}>*</Typography></Typography>

                  <MultiSelect
                    options={allRoles}
                    value={typeOptValueEdit}
                    onChange={handleChangeTypeEdit}
                    valueRenderer={customValueRendererRolesEdit}

                  />

                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={6} sm={6}>
                <Button sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
                  Update
                </Button>
              </Grid>
              <Grid item md={6} xs={6} sm={6}>
                <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      </Box>
      <br />

      {/* header text */}
      {isUserRoleCompare?.includes("ldesignationgroup") && (
        <>
          <Box sx={userStyle.container}>
            { /* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Designation Group List</Typography>
            </Grid>

            <br />

            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label >Show entries:</label>
                  <Select id="pageSizeSelect" value={pageSize}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 180,
                          width: 80,
                        },
                      },
                    }}
                    onChange={handlePageSizeChange} sx={{ width: "77px" }}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box >
                  {isUserRoleCompare?.includes("exceldesignationgroup") && (
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
                  {isUserRoleCompare?.includes("csvdesignationgroup") && (
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
                  {isUserRoleCompare?.includes("printdesignationgroup") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfdesignationgroup") && (
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
                  {isUserRoleCompare?.includes("imagedesignationgroup") && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                  )}
                </Box >
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                <Box>
                  <FormControl fullWidth size="small" >
                    <Typography>Search</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>Show All Columns</Button>&ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>Manage Columns</Button>&ensp;
            {isUserRoleCompare?.includes("bddesignationgroup") && (
              <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>Bulk Delete</Button>
            )}


            <br /><br />
            {!isDesigngrp ?
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>

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
              :
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
                    Showing {filteredData.length > 0 ? ((page - 1) * pageSize) + 1 : 0} to {Math.min(page * pageSize, filteredDatas.length)} of {filteredDatas.length} entries
                  </Box>
                  <Box>
                    <Button onClick={() => setPage(1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <FirstPageIcon />
                    </Button>
                    <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <NavigateBeforeIcon />
                    </Button>
                    {pageNumbers?.map((pageNumber) => (
                      <Button key={pageNumber} sx={userStyle.paginationbtn} onClick={() => handlePageChange(pageNumber)} className={((page)) === pageNumber ? 'active' : ''} disabled={page === pageNumber}>
                        {pageNumber}
                      </Button>
                    ))}
                    {lastVisiblePage < totalPages && <span>...</span>}
                    <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <NavigateNextIcon />
                    </Button>
                    <Button onClick={() => setPage((totalPages))} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <LastPageIcon />
                    </Button>
                  </Box>
                </Box>
              </>}
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

      {/* content end */}
      {/* ALERT DIALOG */}
      <Dialog open={isDeleteOpen} onClose={handleCloseMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: "orange" }} />
          <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
            Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMod} sx={userStyle.btncancel}>
            Cancel
          </Button>
          <Button autoFocus variant="contained" color="error" onClick={(e) => delDesignationgrp(designationgrpid)}>
            {" "}
            OK{" "}
          </Button>
        </DialogActions>
      </Dialog>

      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box sx={{ width: "550px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Designation Group</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Name</Typography>
                  <Typography>{desiggrpid.name}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Roles</Typography>
                  <Typography>{desiggrpid?.roles ? desiggrpid?.roles.map((data, index) => `${index + 1}.${data} `) : ""}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* this is info view details */}

      <Dialog
        open={openInfo}
        onClose={handleCloseinfo}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        sx={{ marginTop: "80px" }}
      >
        <Box sx={{ width: "550px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}> Designation Group Info</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">addedby</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>{"SNO"}.</StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}> {"UserName"}</StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}> {"Date"}</StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {addedby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}>{i + 1}.</StyledTableCell>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}> {item.name}</StyledTableCell>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}> {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FormControl>
              </Grid>
              <br />
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Updated by</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>{"SNO"}.</StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}> {"UserName"}</StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}> {"Date"}</StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {updateby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}>{i + 1}.</StyledTableCell>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}> {item.name}</StyledTableCell>
                          <StyledTableCell sx={{ padding: "5px 10px !important" }}> {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}</StyledTableCell>
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
              <Button variant="contained" onClick={handleCloseinfo} sx={buttonStyles.btncancel}>
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                width: "350px"
              }}
            >
              <InfoOutlinedIcon style={{ fontSize: "3.5rem", color: "teal" }} />              <Typography
                sx={{ fontSize: "1.4rem", fontWeight: "600", color: "black", textAlign: "center" }}
              >
                {showAlertpop}
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={buttonStyles.buttonsubmit}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button
              sx={buttonStyles.btncancel}
              onClick={handleCloseerrpop}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Check delete Modal */}
      <Box>
        <>
          <Box>
            {/* ALERT DIALOG */}
            <Dialog open={isCheckOpen} onClose={handleCloseCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: "orange" }} />

                <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
                  {checkdesignation?.length > 0 ? (
                    <>
                      <span style={{ fontWeight: "700", color: "#777" }}>{`${deletedesignationgrp.name} `}</span>was linked in <span style={{ fontWeight: "700" }}>Designation</span>{" "}
                    </>
                  ) : (
                    ""
                  )}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCheck} autoFocus variant="contained" color="error">
                  {" "}
                  OK{" "}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </>
      </Box>


      <Box>
        {/* ALERT DIALOG */}
        <Dialog
          open={isDeleteOpenalert}
          onClose={handleCloseModalert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: "70px", color: 'orange' }} />
            <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>Please Select any Row</Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus variant="contained" color='error'
              onClick={handleCloseModalert}
            > OK </Button>
          </DialogActions>
        </Dialog>
      </Box>


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

      <Box>
        <Dialog
          open={isDeleteOpencheckbox}
          onClose={handleCloseModcheckbox}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} />
            {selectedRowsCount > 0 ?
              <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>Some of the Data's are Linked in other pages. Do You want to Delete the Remaining.?</Typography>
              :
              <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>This Data is Linked in Some pages</Typography>

            }
          </DialogContent>
          <DialogActions>
            {selectedRowsCount > 0 ?
              <>
                <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>Cancel</Button>
                <Button sx={buttonStyles.buttonsubmit}
                  onClick={(e) => delDesiggrpcheckbox(e)}
                > OK </Button>
              </>
              :
              <Button sx={buttonStyles.buttonsubmit} onClick={handleCloseModcheckbox} >Ok</Button>
            }
          </DialogActions>
        </Dialog>

      </Box>

      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={desiggroup ?? []}
        filename={"Designation Group"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

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

    </Box>
  );
}
export default Designationgroup;