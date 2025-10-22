import { useEffect, useState, useContext } from "react";
import {
    Button, CircularProgress, Grid,
    Box,
    Typography,
} from "@mui/material";
import axios from '../../axiosInstance';
import moment from 'moment-timezone';
import { SERVICE } from '../../services/Baseservice';
import { AuthContext } from '../../context/Appcontext';
const UserDocumentUploadView = ({ queryParams, openPopup }) => {
    const [showButton, setShowButton] = useState(false);
    const [dataArray, setDataArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(AuthContext);
    useEffect(() => {
        const fetchData = async () => {
            console.log(queryParams, openPopup)
            if (openPopup) {
                setLoading(true);
                try {
                    //   const { data } = await axios.post("/api/userdocumentuploads/filter", queryParams);
                    let response = await axios.post(SERVICE.GET_FILTERED_USERDOCUMENTUPLOADS, {
                        modulename: queryParams?.modulename || '',
                        submodulename: queryParams?.submodulename || '',
                        mainpagename: queryParams?.mainpagename || '',
                        subpagename: queryParams?.subpagename || '',
                        subsubpagename: queryParams?.subsubpagename || '',
                        employeename: queryParams?.employeename || '',
                    }, {
                        headers: {
                            Authorization: `Bearer ${auth.APIToken}`,
                        },
                    });
                    if (response?.data?.success) {
                        setShowButton(true);
                        setDataArray(response?.data?.userdocumentuploads);
                    } else {
                        setShowButton(false);
                        setDataArray([]);
                    }
                } catch (err) {
                    console.error(err);
                    setShowButton(false);
                    setDataArray([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setShowButton(false);
                setLoading(false);
                setDataArray([]);
            }
        };

        fetchData();
    }, [openPopup, queryParams]);

    const openAllFilesInTabs = async ({ files, uniqueId }, type) => {
        try {
            if (!files || files.length === 0) return;

            // Optional confirmation if many files
            // if (files.length > 3) {
            //   const confirmOpen = window.confirm(`This will open ${files.length} tabs. Continue?`);
            //   if (!confirmOpen) return;
            // }

            for (const filename of files) {
                const res = await axios.post(
                    SERVICE.USERDOCUMENTS_EDIT_FETCH,
                    { filename: `${uniqueId}$${type}$${filename}` },
                    {
                        headers: {
                            Authorization: `Bearer ${auth.APIToken}`,
                        },
                        responseType: 'blob',
                    }
                );

                const blobUrl = URL.createObjectURL(res.data);
                window.open(blobUrl, "_blank");
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };




    if (loading) return <CircularProgress size={20} />;

    return (showButton && dataArray?.length > 0) ? (
        // <Button variant="contained" color="primary" size="small">
        //     View
        // </Button>
        <Grid container spacing={2}>
            {dataArray.map((document, index) => (
                <Grid item xs={12} md={6} key={index}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                        }}
                    >
                        <Typography>Date: {moment(document.date).format('DD-MM-YYYY')}</Typography>
                        <Button
                            onClick={() => openAllFilesInTabs(document, "userdocuments")}
                            variant="contained"
                            color="primary"
                        >
                            View
                        </Button>
                    </Box>
                </Grid>
            ))}
        </Grid>

    ) : null;
};

export default UserDocumentUploadView;
