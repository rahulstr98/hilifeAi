import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Grid, FormControl, Typography, FormControlLabel, Checkbox } from '@mui/material';
import Selects from 'react-select';
import { MultiSelect } from 'react-multi-select-component';
import { SERVICE } from '../../../services/Baseservice';
import axios from '../../../axiosInstance';
import { UserRoleAccessContext, AuthContext } from '../../../context/Appcontext';
import { userStyle } from '../../../pageStyle';
const HiConnectComponentCreate = ({ value, setValue, employeeEmails = [], errors = {}, employee, from }) => {
  const { auth } = useContext(AuthContext);
  useEffect(() => {
    fetchHiConnectRoles();
  }, []);
  const [hiConnectRolesOptions, setHiConnectRolesOptions] = useState([]);
  const fetchHiConnectRoles = async () => {
    try {
      let response = await axios.get(SERVICE.GET_HICONNECT_ROLES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setHiConnectRolesOptions(
        response?.data?.hiconnectRoles?.map((data) => ({
          value: data?.name,
          label: data?.name,
        }))
      );
    } catch (err) {
      console.log(err, 'Error getting HiConnect Roles');
      // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const handleCheckboxChange = (e) => {
    setValue((prev) => ({
      ...prev,
      createhiconnect: e.target.checked,
      hiconnectroles: [{ label: 'channel_user', value: 'channel_user' }],
      hiconnectemail: employeeEmails?.split(',')?.length > 0 ? employeeEmails?.split(',')[0] : '',
    }));
  };

  const customValueRenderer = (valueCompany, _attmode) => {
    return valueCompany?.length ? valueCompany.map(({ label }) => label)?.join(', ') : 'Please Select Role';
  };

  const handleEmailChange = (selected) => {
    setValue((prev) => ({
      ...prev,
      hiconnectemail: selected?.value || '',
    }));
  };

  const handleRoleChange = (selected) => {
    setValue((prev) => ({
      ...prev,
      hiconnectroles: selected || [],
    }));
  };

  return (
    <Box sx={userStyle.dialogbox}>
      <Grid container spacing={1}>
        <Grid item md={8} xs={0} sm={4}>
          <Typography sx={userStyle.SubHeaderText}>Hi Connect</Typography>
          {from === 'edit' && <p style={{ fontSize: 'small' }}>{`(Once an account is created, the "Create Account" checkbox cannot be unchecked.)`}</p>}
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
          <FormControl fullWidth size="small">
            <Typography>&nbsp;</Typography>
            <FormControlLabel control={<Checkbox checked={value?.createhiconnect} onChange={handleCheckboxChange} disabled={!!employee?.hiconnectid} />} label="Create HiConnect Account" />
          </FormControl>
        </Grid>

        {value?.createhiconnect && (
          <>
            <Grid item md={4} xs={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Email <b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  maxMenuHeight={250}
                  options={
                    employeeEmails?.split(',')?.length > 0
                      ? employeeEmails?.split(',')?.map((data) => ({
                          label: data,
                          value: data,
                        }))
                      : []
                  }
                  placeholder="Please Select Email"
                  value={{ label: value.hiconnectemail !== '' ? value.hiconnectemail : 'Please Select Email', value: value.hiconnectemail !== '' ? value.hiconnectemail : 'Please Select Email' }}
                  onChange={handleEmailChange}
                />
                {errors?.hiconnectemail && <div style={{ color: 'red' }}>{errors.hiconnectemail}</div>}
              </FormControl>
            </Grid>

            <Grid item md={4} xs={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Role <b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect options={hiConnectRolesOptions} value={value?.hiconnectroles || []} onChange={handleRoleChange} labelledBy="Select Role" valueRenderer={customValueRenderer} />
                {errors?.hiconnectroles && <div style={{ color: 'red' }}>{errors.hiconnectroles}</div>}
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default HiConnectComponentCreate;
