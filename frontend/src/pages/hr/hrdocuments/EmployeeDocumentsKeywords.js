import React, { useContext, useState, useRef, useEffect } from 'react';
import { userStyle } from '../../../pageStyle';
import { Box, Typography, OutlinedInput, TableBody, TableRow, TableCell, Select, Paper, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Grid, Table, TableHead, TableContainer, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton } from "@mui/material";
import { StyledTableRow, StyledTableCell } from '../../../components/Table';
import 'jspdf-autotable';
import Headtitle from '../../../components/Headtitle';
import { UserRoleAccessContext } from '../../../context/Appcontext';
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import CloseIcon from "@mui/icons-material/Close";
import Switch from "@mui/material/Switch";
function EmployeeDocumentsKeywords() {
  const { isUserRoleCompare } = useContext(UserRoleAccessContext);
  const [searchedString, setSearchedString] = useState("");
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const gridRefTable = useRef(null);
  const gridRefTableImg = useRef(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };

const keywordData = [
  { id: 1, keyword: "$LEGALNAME$", instruction: "It denotes the Legal Name of the selected person" },
  { id: 2, keyword: "$DOB$", instruction: "It denotes the Date of Birth of the selected person" },
  { id: 3, keyword: "$P:ADDRESS$", instruction: "It denotes the Permanent Address of the selected person" },
  { id: 4, keyword: "$C:ADDRESS$", instruction: "It denotes the Current Address of the selected person" },
  { id: 5, keyword: "$EMAIL$", instruction: "It denotes the Email Address of the selected person" },
  { id: 6, keyword: "$P:NUMBER$", instruction: "It denotes the Personal Number of the selected person" },
  { id: 7, keyword: "$DOJ$", instruction: "It denotes the Date of Joining of the selected person" },
  { id: 8, keyword: "$EMPCODE$", instruction: "It denotes the Employee Code of the selected person" },
  { id: 9, keyword: "$BRANCH$", instruction: "It denotes the Branch of the selected person" },
  { id: 10, keyword: "$LOGIN$", instruction: "It denotes the Username of the selected person" },
  { id: 11, keyword: "$C:NAME$", instruction: "It denotes the Company Name of the selected person" },
  { id: 12, keyword: "$F:NAME$", instruction: "It denotes the First Name of the selected person" },
  { id: 13, keyword: "$L:NAME$", instruction: "It denotes the Last Name of the selected person" },
  { id: 14, keyword: "$UNIT$", instruction: "It denotes the Unit of the selected person" },
  { id: 15, keyword: "$TEAM$", instruction: "It denotes the Team of the selected person" },
  { id: 16, keyword: "$PROCESS$", instruction: "It denotes the Process of the selected person" },
  { id: 17, keyword: "$LWD$", instruction: "It denotes the Last Working Day" },
  { id: 18, keyword: "$SHIFT$", instruction: "It denotes the Shift Timing of the selected person" },
  { id: 19, keyword: "$AC:NAME$", instruction: "It denotes the Account Name of the selected person" },
  { id: 20, keyword: "$AC:NUMBER$", instruction: "It denotes the Account Number of the selected person" },
  { id: 21, keyword: "$IFSC$", instruction: "It denotes the IFSC Code of the selected person" },
  { id: 22, keyword: "$C:DATE$", instruction: "It denotes the Current Date" },
  { id: 23, keyword: "$C:TIME$", instruction: "It denotes the Current Time" },
  { id: 24, keyword: "$BREAK$", instruction: "It denotes the Break Time of the selected person" },
  { id: 25, keyword: "$WORKSTATION:NAME$", instruction: "It denotes the Work station name of the selected person" },
  { id: 26, keyword: "$WORKSTATION:COUNT$", instruction: "It denotes the Workstation count of the selected person" },
  { id: 27, keyword: "$SYSTEM:COUNT$", instruction: "It denotes the System count of the selected person" },
  { id: 28, keyword: "$SIGNATURE$", instruction: "It denotes the Signature of the person" },
  { id: 29, keyword: "$FSIGNATURE$", instruction: "It denotes the For Seal with an Signature of the Document" },
  { id: 30, keyword: "$RSEAL$", instruction: "It denotes the Round Seal of the Document" },
  { id: 31, keyword: "$UNIID$", instruction: "It denotes the Unique id of the Document" },
  { id: 32, keyword: "$TEMPLATENAME$", instruction: "It denotes the Template Name for the Email format" },
  { id: 33, keyword: "$REFERENCEID$", instruction: "It denotes the Reference ID for the Email format" },
  { id: 34, keyword: "$CANDIDATENAME$", instruction: "It denotes the Candidate Name for the Email format" },
  { id: 35, keyword: "$COMPANYNAME$", instruction: "It denotes the Sender's Company Name for the Email format" },
  { id: 36, keyword: "$DESIGNATION$", instruction: "It denotes the Sender's Designation for the Email format" },
  { id: 37, keyword: "$COMPANY$", instruction: "It denotes the Sender's Company for the Email format" },
  { id: 38, keyword: "$ATTENDANCEDATE$", instruction: "It denotes the Employee's Attendance status in date wise" },
  { id: 39, keyword: "$ATTENDANCEMONTH$", instruction: "It denotes the Employee's Attendance status in month wise" },
  { id: 40, keyword: "$PRODUCTIONDATETARGET$", instruction: "It denotes the Employee's Production target Status in date wise" },
  { id: 41, keyword: "$PRODUCTIONDATEPOINT$", instruction: "It denotes the Employee's Production point earned Status in Date wise" },
  { id: 42, keyword: "$PRODUCTIONMONTHTARGET$", instruction: "It denotes the Employee's Production target Status in Month wise" },
  { id: 43, keyword: "$PRODUCTIONMONTHPOINT$", instruction: "It denotes the Employee's Production point earned Status in Month wise" },
  { id: 44, keyword: "$GENDERHE/SHE$", instruction: "It denotes the Gender of an employee like He/She" },
  { id: 45, keyword: "$GENDERHE/SHE/SMALL$", instruction: "It denotes the Gender of an employee like he/she" },
  { id: 46, keyword: "$GENDERHIM/HER$", instruction: "It denotes the Gender of an employee like Him/Her" },
  { id: 47, keyword: "$SALUTATION$", instruction: "It denotes gesture used as a greeting." },
  { id: 48, keyword: "$EMPLOYEESIGNATURE$", instruction: "It denotes the Employee's Signature." },
  { id: 49, keyword: "$COMPANYTITLE$", instruction: "It denotes the Company's title." },
  { id: 50, keyword: "$V.BRANCHADDRESS$", instruction: "It denotes the Branch's Address that aligned vertical." },
  { id: 51, keyword: "$H.BRANCHADDRESS$", instruction: "It denotes the Branch's Address that aligned horizontal." },
  { id: 52, keyword: "$GROSS$", instruction: "It denotes the Gross Salary for Employee Document." },
  { id: 53, keyword: "$BASIC$", instruction: "It denotes the Basic Salary for Employee Document." },
  { id: 54, keyword: "$CONVEYANCE$", instruction: "It denotes Conveyance for Employee Document." },
  { id: 55, keyword: "$MANUALDATE$", instruction: "It denotes Manual Date Field Chosen value for Employee Document." },
  { id: 56, keyword: "$RECENT_DESIGNATION$", instruction: "It denotes recent designation value for Employee Document." },
  { id: 57, keyword: "$RECENT_DEPARTMENT$", instruction: "It denotes recent department value for Employee Document." },
  { id: 58, keyword: "$YEARMONTH_DEPARTMENT$", instruction: "It denotes department value for Employee Document on a chosen date." },
  { id: 59, keyword: "$YEARMONTH_DESIGNATION$", instruction: "It denotes designation value for Employee Document on a chosen date." },
  { id: 60, keyword: "$DOJ_DEPARTMENT$", instruction: "It denotes department value for Employee Document at Date of Joining." },
  { id: 61, keyword: "$DOJ_DESIGNATION$", instruction: "It denotes designation value for Employee Document at Date of Joining." },
];


  const [items, setItems] = useState(keywordData);

  const addSerialNumber = (data) => {
    const updated = data.map((item, index) => ({
      ...item,
      id: index + 1, // reset S.No after filtering
      serialNumber: index + 1, // reset S.No after filtering
    }));
    setItems(updated);
  };
  useEffect(() => {
    addSerialNumber(items);
  }, []);
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    keyword: true,
    instruction: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
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
      field: "keyword",
      headerName: "Keyword",
      flex: 0,
      width: 300,
      hide: !columnVisibility.keyword,
      headerClassName: "bold-header",
    },
    {
      field: "instruction",
      headerName: "Instructions",
      flex: 0,
      width: 500,
      hide: !columnVisibility.instruction,
      headerClassName: "bold-header",
    },


  ];


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



  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      keyword: item.keyword,
      instruction: item.instruction,
    };
  });
  console.log(rowDataTable, 'RowData')
  // Manage Columns
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("");
  };
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
      <Headtitle title={'EMPLOYEE DOCUMENTS KEYWORDS'} />
      <Typography sx={userStyle.HeaderText}>Employee Documents Keyword Instructions</Typography>
      {/* ****** Instructions Box ****** */}
      {isUserRoleCompare?.includes('lemployeedocumentskeywords') && (
        <Box sx={userStyle.selectcontainer}>
          <Grid item xs={8}>
            <Typography sx={userStyle.importheadtext}>Employee Document keywords List</Typography>
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
                  <MenuItem value={keywordData?.length}>All</MenuItem>
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
              </Box> */}
            </Grid>
            <Grid item md={2} xs={12} sm={12}>
              <AggregatedSearchBar
                columnDataTable={columnDataTable}
                setItems={setItems}
                addSerialNumber={addSerialNumber}
                setPage={setPage}
                maindatas={keywordData}
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
              isHandleChange={false}
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
        </Box>
      )}
      {/* ****** Instructions Box Ends ****** */}
    </Box>
  );
}

export default EmployeeDocumentsKeywords;
