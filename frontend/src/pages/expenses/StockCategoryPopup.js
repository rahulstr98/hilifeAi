import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  OutlinedInput,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Button,
} from "@mui/material";
import { handleApiError } from "../../components/Errorhandling";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import axios from "axios";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AiOutlineClose } from "react-icons/ai";
import { UserRoleAccessContext, AuthContext } from "../../context/Appcontext";
import Headtitle from "../../components/Headtitle";
import { FaPlus } from "react-icons/fa";
import "jspdf-autotable";

import AlertDialog from "../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
function StockCategoryPopup({
  setStockCategoryAuto,
  handleCloseviewalertstockcategory,
}) {
  let newval = "STC0001";

  const [openPopup, setOpenPopup] = useState(false);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    // setBtnSubmit(false);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };

  const handleClickOpenPopup = () => {
    setOpenPopup(true);
    // setBtnSubmit(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  //useState
  const [category, setCategory] = useState({ categoryname: "" });
  const [subCategoryTodo, setSubcategoryTodo] = useState([]);
  const [subcategory, setSubcategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const { auth } = useContext(AuthContext);

  //Datatable
  const { isUserRoleCompare, isUserRoleAccess, buttonStyles } = useContext(
    UserRoleAccessContext
  );
  const [showAlert, setShowAlert] = useState();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  //useEffect
  useEffect(() => {
    getCategoryList();
    fetchAutoId();
  }, []);

  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  const [autoId, setAutoId] = useState("");
  const fetchAutoId = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.STOCKCATEGORY_AUTOID, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let refNo = res_vendor?.data?.autoid;

      setAutoId(refNo);

      return refNo;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const sendRequest = async () => {
    let autoIds = await fetchAutoId();
    const subcategoryName =
      subCategoryTodo.length === 0 ? subcategory : [...subCategoryTodo];
    try {
      let res_doc = await axios.post(SERVICE.STOCKCATEGORY_CREATE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        categoryname: String(category.categoryname),
        categorycode: String(autoIds),
        subcategoryname: subcategoryName,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      setSubcategoryTodo([]);
      setStockCategoryAuto("none");
      setSubcategory("");
      setCategory({ ...category, categoryname: "" });
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      await getCategoryList();
      await fetchAutoId();
      handleCloseviewalertstockcategory();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const handleClear = () => {
    setSubcategoryTodo([]);
    setSubcategory("");
    setCategory({ ...category, categoryname: "" });
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  const getCategoryList = async () => {
    try {
      let response = await axios.get(`${SERVICE.STOCKCATEGORY}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setCategoryList(response?.data?.stockcategory);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const addTodo = () => {
    getCategoryList();
    const isSubNameMatch = subCategoryTodo.some(
      (item) => item?.toLowerCase() === subcategory?.toLowerCase()
    );
    if (subcategory === "") {

      setPopupContentMalert("Please Enter Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isSubNameMatch) {

      setPopupContentMalert("Already Added ! Please Enter Another Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      setSubcategoryTodo([...subCategoryTodo, subcategory]);
      setSubcategory("");
    }
  };
  const handleTodoEdit = (index, newValue) => {
    const isDuplicate = subCategoryTodo.some(
      (item, i) => i !== index && item.toLowerCase() === newValue.toLowerCase()
    );
    if (isDuplicate) {

      setPopupContentMalert("Already Added! Please Enter Another Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      return;
    } else {
      if (
        subCategoryTodo.some(
          (item) => item?.toLowerCase() === newValue?.toLowerCase()
        )
      ) {

        setPopupContentMalert("Already Added ! Please Enter Another Subcategory!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
        return;
      }
    }
    const updatedTodos = [...subCategoryTodo];
    updatedTodos[index] = newValue;
    setSubcategoryTodo(updatedTodos);
  };

  const handleSubmit = () => {
    const isNameMatch = categoryList?.some(
      (item) =>
        item?.categoryname?.toLowerCase() ===
        category?.categoryname.toLowerCase()
    );
    if (isNameMatch) {

      setPopupContentMalert("Already Added ! Please Enter Another category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (category.categoryname === "") {

      setPopupContentMalert("Please Enter Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (subCategoryTodo.some((item) => item === "")) {

      setPopupContentMalert("Please Enter Sub Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (subCategoryTodo.length === 0) {

      setPopupContentMalert("Please Enter Sub Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const deleteTodo = (index) => {
    const updatedTodos = [...subCategoryTodo];
    updatedTodos.splice(index, 1);
    setSubcategoryTodo(updatedTodos);
  };

  return (
    <Box>
      <Headtitle title={"STOCK CATEGORY"} />
      <>
        {isUserRoleCompare?.includes("astockcategory") && (
          <Box sx={userStyle.container}>
            <Grid container spacing={2}>
              <Grid item md={12} sm={12} xs={12}>
                <Typography sx={userStyle.HeaderText}>
                  Add Stock Category
                </Typography>
              </Grid>
              <Grid item md={2}></Grid>
              <Grid item md={4} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Category Name <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    placeholder="Please Enter Category  Name"
                    value={category.categoryname}
                    onChange={(e) => {
                      setCategory({
                        ...category,
                        categoryname: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    {" "}
                    Category Code <b style={{ color: "red" }}>*</b>{" "}
                  </Typography>
                  <OutlinedInput id="component-outlined" value={autoId} />
                </FormControl>
              </Grid>
              <Grid item md={2}></Grid>
              <Grid item md={2}></Grid>
              <Grid item md={4} sm={12} xs={12} sx={{ display: "flex" }}>
                <FormControl fullWidth size="small">
                  {" "}
                  <Typography>
                    {" "}
                    SubCategory <b style={{ color: "red" }}>*</b>{" "}
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    placeholder="Please Enter SubCategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </FormControl>
                &emsp;
                <Button
                  variant="contained"
                  color="success"
                  onClick={addTodo}
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
              </Grid>
              <Grid item md={1} marginTop={3}></Grid>
              <Grid item md={5}></Grid>
              <Grid item md={2}></Grid>
              <Grid item md={4} sm={12} xs={12}>
                {subCategoryTodo.length > 0 && (
                  <ul type="none">
                    {subCategoryTodo.map((item, index) => {
                      return (
                        <li key={index}>
                          <br />
                          <Grid sx={{ display: "flex" }}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                SubCategory <b style={{ color: "red" }}>*</b>
                              </Typography>
                              <OutlinedInput
                                id="component-outlined"
                                placeholder="Please Enter SubCategory"
                                value={item}
                                onChange={(e) =>
                                  handleTodoEdit(index, e.target.value)
                                }
                              />
                            </FormControl>
                            &emsp;
                            <Button
                              variant="contained"
                              color="error"
                              type="button"
                              onClick={(e) => deleteTodo(index)}
                              sx={{
                                height: "30px",
                                minWidth: "30px",
                                marginTop: "28px",
                                padding: "6px 10px",
                              }}
                            >
                              <AiOutlineClose />{" "}
                            </Button>
                          </Grid>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Grid>
              <Grid item md={1} marginTop={3}></Grid>
              <Grid item md={5}></Grid>
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  container
                  spacing={2}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={buttonStyles.buttonsubmit}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                      Clear
                    </Button>
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <Button
                      sx={buttonStyles.btncancel}
                      onClick={handleCloseviewalertstockcategory}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
      </>
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
            <Typography
              variant="h6"
              style={{ fontSize: "20px", fontWeight: 900 }}
            >
              {" "}
              {showAlert}
            </Typography>
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
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* VALIDATION */}
      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />
    </Box>
  );
}
export default StockCategoryPopup;
