import { useEffect, useState, useContext } from 'react';
import { Button, CircularProgress, Grid, Box, Typography } from '@mui/material';
import axios from '../../axiosInstance';
import moment from 'moment-timezone';
import { SERVICE } from '../../services/Baseservice';
import { AuthContext } from '../../context/Appcontext';
const UserDocumentUploadView = ({ queryParams, openPopup, setUploadedFiles, date = [] }) => {
  console.log(queryParams , "queryParams")
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [dataArrayMultiple, setDataArrayMultiple] = useState([]);
  const [dataArray, setDataArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(AuthContext);
  const transformData = (data) => {
    if (!Array.isArray(data)) return [];

    return data.flatMap((item) =>
      (item.files || []).map((file, index) => ({
        ...item,
        files: [file], // keep only one file in each object
        fileIndex: index, // optional: add index if needed
      }))
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      // if (!openPopup || fetchedOnce) return; // ✅ prevent re-run
      setLoading(true);
      try {
        let response = await axios.post(
          SERVICE.GET_FILTERED_USERDOCUMENTUPLOADS,
          {
            modulename: queryParams?.modulename || '',
            submodulename: queryParams?.submodulename || '',
            mainpagename: queryParams?.mainpagename || '',
            subpagename: queryParams?.subpagename || '',
            subsubpagename: queryParams?.subsubpagename || '',
            employeename: queryParams?.employeename || '',
            selectedDate: date || [],
          },
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
console.log(response?.data , "response?.data?")
        if (response?.data?.success) {
          setShowButton(true);
          setDataArrayMultiple(response?.data?.userdocumentuploads);
          let newData = await transformData(response?.data?.userdocumentuploads);
          setDataArray(newData);

          // ✅ only once
          await fetchAndStoreMultipleFiles(newData, 'userdocuments');
          setFetchedOnce(true);
        } else {
          setShowButton(false);
          setDataArray([]);
          setDataArrayMultiple([]);
        }
      } catch (err) {
        console.error(err);
        setShowButton(false);
        setDataArray([]);
        setDataArrayMultiple([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [openPopup, queryParams]);

  const openAllFilesInTabs = async ({ files, uniqueId }, type) => {
    try {
      if (!files || files.length === 0) return;
      console.log(files, 'files');

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
        window.open(blobUrl, '_blank');
      }
    } catch (error) {
      console.log('Error fetching files:', error);
    }
  };

  const fetchAndStoreMultipleFiles = async (items, type) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return;

      const allFileObjects = [];

      for (const item of items) {
        const { files, uniqueId } = item;

        if (!files || files.length === 0) continue;

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

          const fileBlob = new File([res.data], filename, { type: res.data.type });

          allFileObjects.push({
            file: fileBlob,
            candidatefilename: 'Long Absent Approval',
            category: 'Approval',
            subcategory: 'Long Absent Approval',
            status: 'Uploaded',
            pagemodeselected: 'Front',
            date: item?.date || '',
          });
        }
      }
      console.log(allFileObjects, 'allFileObjects');
      // ✅ Update state (append new files if already exists)
      setUploadedFiles((prev) => [...allFileObjects]);
    } catch (error) {
      console.log('Error fetching and storing files:', error);
    }
  };

  if (loading) return <CircularProgress size={20} />;

  return showButton && dataArray?.length > 0 ? (
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
            <Button onClick={() => openAllFilesInTabs(document, 'userdocuments')} variant="contained" color="primary">
              View
            </Button>
          </Box>
        </Grid>
      ))}
    </Grid>
  ) : null;
};

export default UserDocumentUploadView;
