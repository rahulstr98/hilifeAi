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
function CandidateDocumentsKeywords() {
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
    { id: 1, keyword: "$GROSS$", instruction: "It denotes the Gross Salary for Candidate Document." },
    { id: 2, keyword: "$BASIC$", instruction: "It denotes the Basic Salary for Candidate Document." },
    { id: 3, keyword: "$CONVEYANCE$", instruction: "It denotes Conveyance for Candidate Document." },
    { id: 4, keyword: "$MA$", instruction: "It denotes the Medical allowance for Candidate Document." },
    { id: 5, keyword: "$PRODALLOWANCE1$", instruction: "It denotes the First Production Allowance for Candidate Document." },
    { id: 6, keyword: "$PRODALLOWANCE2$", instruction: "It denotes the Second Production Allowance for Candidate Document." },
    { id: 7, keyword: "$OTHERALLOW$", instruction: "It denotes the Other Allowance for Candidate Document." },
    { id: 8, keyword: "$ANNUALGROSSCTC$", instruction: "It denotes the Annual gross CTC for Candidate Document." },
    { id: 9, keyword: "$SALARYCOMPONENT$", instruction: "It denotes the Salary Structure Image for Candidate Document." },
    { id: 10, keyword: "$PF$", instruction: "It denotes the PF Deduction for Candidate Document." },
    { id: 11, keyword: "$ESI$", instruction: "It denotes the ESI Deduction for Candidate Document." },
    { id: 12, keyword: "$HRA$", instruction: "It denotes the HRA for Candidate Document." },
    { id: 13, keyword: "$C:CONTACT$", instruction: "It denotes the Candidate Contact Number for Candidate Document." },
    { id: 14, keyword: "$C:EMAIL$", instruction: "It denotes the Candidate Email for Candidate Document." },
    { id: 15, keyword: "$C:DOB$", instruction: "It denotes the Candidate Date Of birth for Candidate Document." },
    { id: 16, keyword: "$C:GENDER$", instruction: "It denotes the Candidate Gender for Candidate Document." },
    { id: 17, keyword: "$C:NAME$", instruction: "It denotes the Candidate FirstName and LastName for Candidate Document." },
    { id: 18, keyword: "$C:AADHAR$", instruction: "It denotes the Candidate Aadhar Number for Candidate Document." },
    { id: 19, keyword: "$C:PAN$", instruction: "It denotes the Candidate PAN Number for Candidate Document." },
    { id: 20, keyword: "$C:ADDRESS$", instruction: "It denotes the Candidate Address for Candidate Document." },
    { id: 21, keyword: "$C:DATE$", instruction: "It denotes the Current Date" },
    { id: 22, keyword: "$C:TIME$", instruction: "It denotes the Current Time" },
    { id: 23, keyword: "$SIGNATURE$", instruction: "It denotes the Signature of the person" },
    { id: 24, keyword: "$FSIGNATURE$", instruction: "It denotes the For Seal with an Signature of the Document" },
    { id: 25, keyword: "$RSEAL$", instruction: "It denotes the Round Seal of the Document" },
    { id: 26, keyword: "$UNIID$", instruction: "It denotes the Unique id of the Document" },
    { id: 27, keyword: "$TEMPLATENAME$", instruction: "It denotes the Template Name for the Email format" },
    { id: 28, keyword: "$REFERENCEID$", instruction: "It denotes the Reference ID for the Email format" },
    { id: 29, keyword: "$COMPANYTITLE$", instruction: "It denotes the Company's title." },
    { id: 30, keyword: "$V.BRANCHADDRESS$", instruction: "It denotes the Branch's Address that aligned vertical." },
    { id: 31, keyword: "$H.BRANCHADDRESS$", instruction: "It denotes the Branch's Address that aligned horizontal." },
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
      <Headtitle title={'CANDIDATE DOCUMENTS KEYWORDS'} />
      <Typography sx={userStyle.HeaderText}>Candidate Documents Keyword Instructions</Typography>
      {/* ****** Instructions Box ****** */}
      {isUserRoleCompare?.includes('lcandidatedocumentskeywords') && (
        <Box sx={userStyle.selectcontainer}>
          <Grid item xs={8}>
            <Typography sx={userStyle.importheadtext}>Candidate Documents keywords List</Typography>
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
                {isUserRoleCompare?.includes("excelcandidatedocumentprintedstatuslist") && (

                  <>
                    <Button onClick={(e) => {
                      setIsFilterOpen(true)
                      setFormat("xl")
                    }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                  </>

                )}
                {isUserRoleCompare?.includes("csvcandidatedocumentprintedstatuslist") && (

                  <>
                    <Button onClick={(e) => {
                      setIsFilterOpen(true)
                      setFormat("csv")
                    }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>

                  </>
                )}
                {isUserRoleCompare?.includes("printcandidatedocumentprintedstatuslist") && (
                  <>
                    <Button sx={userStyle.buttongrp} onClick={handleprint}>
                      &ensp;
                      <FaPrint />
                      &ensp;Print&ensp;
                    </Button>
                  </>
                )}
                {isUserRoleCompare?.includes("pdfcandidatedocumentprintedstatuslist") && (
                  <>
                    <Button sx={userStyle.buttongrp}
                      onClick={() => {
                        setIsPdfFilterOpen(true)
                      }}>
                      <FaFilePdf />
                      &ensp;Export to PDF&ensp;</Button>
                  </>
                )}
                {isUserRoleCompare?.includes("imagecandidatedocumentprintedstatuslist") && (
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

export default CandidateDocumentsKeywords;
