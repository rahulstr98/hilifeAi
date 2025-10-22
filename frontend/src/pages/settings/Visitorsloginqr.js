import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Box, Button, Dialog, DialogActions, DialogContent, Table, TableBody, TableContainer, TableHead, Typography } from "@mui/material";
import axios from "axios";
import "jspdf-autotable";
import React, { useContext, useEffect, useState } from "react";
import { StyledTableCell, StyledTableRow } from "../../components/Table";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import PageHeading from "../../components/PageHeading";
import { handleApiError } from "../../components/Errorhandling";
import MessageAlert from "../../components/MessageAlert";


const Visitorlogin = () => {

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };

  const { auth } = useContext(AuthContext);
  const { isAssignBranch, isUserRoleAccess, pageName, setPageName } = useContext(UserRoleAccessContext);

  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
  ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
      branchaddress: data?.branchaddress,
  }))
  : isAssignBranch
      ?.filter((data) => {
          let fetfinalurl = [];
          if (
              data?.modulenameurl?.length !== 0 &&
              data?.submodulenameurl?.length !== 0 &&
              data?.mainpagenameurl?.length !== 0 &&
              data?.subpagenameurl?.length !== 0 &&
              data?.subsubpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
          ) {
              fetfinalurl = data.subsubpagenameurl;
          } else if (
              data?.modulenameurl?.length !== 0 &&
              data?.submodulenameurl?.length !== 0 &&
              data?.mainpagenameurl?.length !== 0 &&
              data?.subpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
          ) {
              fetfinalurl = data.subpagenameurl;
          } else if (
              data?.modulenameurl?.length !== 0 &&
              data?.submodulenameurl?.length !== 0 &&
              data?.mainpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
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
          branchaddress: data?.branchaddress
      }));
      
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  const [units, setUnits] = useState([]);
  const fetchUnits = async () => {

    setPageName(!pageName)
    try {
      let res_unit = await axios.post(SERVICE.BRANCHQRCODE, {
        assignbranch: accessbranch
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setUnits(res_unit?.data?.branch);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

  };

  // page refersh reload code
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

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Branch Wise QRCode"),
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

  useEffect(() => {
    fetchUnits()
    getapi()
  }, [])
  return (
    <Box sx={{ justifyContent: "center" }}>
      {/* <Typography sx={userStyle.HeaderText} style={{ textAlign: "center", margin: "20px" }}>Branch Wise QRCode</Typography> */}
      <PageHeading
        title="Branch Wise QRCode"
        modulename="Settings"
        submodulename="Visitor Login"
        mainpagename=""
        subpagename=""
        subsubpagename=""
      />

      <Box sx={userStyle.dialogbox}>
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Company</StyledTableCell>
                  <StyledTableCell align="left">Branch</StyledTableCell>
                  <StyledTableCell align="left">Qr Code</StyledTableCell>
                  <StyledTableCell align="left">Copy Link</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {units &&
                  (units.map((row, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell align="left">{row.company}</StyledTableCell>
                      <StyledTableCell align="left">{row.name}</StyledTableCell>
                      <StyledTableCell align="left">{<img src={row.qrcode} width={50} height={50} />}</StyledTableCell>
                      <StyledTableCell align="left">{row.qrcode ? <><Button variant="contained" color="primary"><a style={{ color: "white" }} href={`/Checkinvisitor/${row.company}/${row.name}`} target="_blank">
                        Copy Visitor Link
                      </a></Button></> : <></>}</StyledTableCell>
                    </StyledTableRow>
                  ))
                  )}
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
                <Button variant="contained" color="error" onClick={handleCloseerr}>
                  ok
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
          <MessageAlert
            openPopup={openPopupMalert}
            handleClosePopup={handleClosePopupMalert}
            popupContent={popupContentMalert}
            popupSeverity={popupSeverityMalert}
          />
        </>
      </Box>
    </Box>
  )
}
export default Visitorlogin;