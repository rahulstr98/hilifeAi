import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Typography, Stack, Paper, LinearProgress, Box, Avatar, IconButton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Storage as StorageIcon, CheckCircle as HealthyIcon } from '@mui/icons-material';
import { SERVICE } from '../services/Baseservice.js';
import { AuthContext, UserRoleAccessContext } from '../context/Appcontext.js';

const formatBytes = (bytes) => {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const DiskAlert = () => {
  const { auth } = useContext(AuthContext);
  const [drives, setDrives] = useState([]);
  const [open, setOpen] = useState(false);

  const threshold = 3;

  const handleOpen = async () => {
    try {
      let res = await axios.get(SERVICE.DISKDISPLAYALERT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const drivesData = res.data.drives;
      setDrives(drivesData);
      setOpen(true);
    } catch (err) {
      console.error('API error:', err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const criticalDrives = drives.filter((drive) => {
    const usage = parseInt(drive.capacity.replace('%', ''));
    return usage >= threshold;
  });

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="error"
        sx={{
          p: 1,
          bgcolor: '#f5f5f5',
          borderRadius: '50%',
          '&:hover': {
            bgcolor: '#e0e0e0',
          },
        }}
      >
        <StorageIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          marginTop: '90px',
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.5,
            px: 2.5,
            background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
            color: 'white',
          }}
        >
          <WarningAmberIcon fontSize="small" sx={{ color: 'white' }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Storage Warning
          </Typography>
          <Chip
            label={`${criticalDrives.length} issue${criticalDrives.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              ml: 'auto',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              fontWeight: 600,
            }}
          />
        </DialogTitle>

        <DialogContent dividers sx={{ py: 1.5, px: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {criticalDrives.length > 0 ? (
              criticalDrives.map((drive, idx) => {
                const usage = parseInt(drive.capacity.replace('%', ''));
                const percentageColor = usage >= 90 ? '#ff4444' : '#ff9800';

                return (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: `3px solid ${percentageColor}`,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StorageIcon color="action" fontSize="small" />
                      <Typography variant="body2" fontWeight={600} sx={{ ml: 1 }}>
                        {drive.filesystem}
                      </Typography>
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: percentageColor }}>
                          {usage}%
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={usage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: percentageColor,
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      {/* <Typography variant="caption" color="textSecondary">
                        Free: {formatBytes(drive.free)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total: {formatBytes(drive.total)}
                      </Typography> */}
                      <Typography variant="caption" color="textSecondary">
                        Free: {drive.free} GB
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total: {drive.total} GB
                      </Typography>
                    </Box>
                  </Paper>
                );
              })
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.main',
                    mb: 1,
                    width: 40,
                    height: 40,
                  }}
                >
                  <HealthyIcon />
                </Avatar>
                <Typography variant="body2" color="textSecondary">
                  All drives are within safe capacity
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            onClick={handleClose}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              fontWeight: 500,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DiskAlert;
