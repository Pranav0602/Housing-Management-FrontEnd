import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Chip,
  Card, 
  CardContent, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  PersonAdd, 
  Save, 
  Cancel, 
  Person, 
  Home,
  Phone,
  Description,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const GuardVisitorLog = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [flats, setFlats] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    visitorId: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      console.log("Current user:", currentUser);
      try {
        if (currentUser?.societyId) {
          // Fetch all flats in the society
          const flatsResponse = await api.get(`/flats/society/${currentUser.societyId}`);
          console.log("API response:", flatsResponse.data);
          setFlats(flatsResponse.data);
          
          // Fetch recent visitors
          const visitorsResponse = await api.get(`/visitor-logs/society/${currentUser.societyId}`);
          // Sort by entry time, most recent first
          const sortedVisitors = visitorsResponse.data.sort((a, b) => 
            new Date(b.entryTime) - new Date(a.entryTime)
          );
          setRecentVisitors(sortedVisitors.slice(0, 10)); // Get last 10 visitors
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load data. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Form validation schema
  const validationSchema = Yup.object({
    visitorName: Yup.string()
      .required('Visitor name is required')
      .min(2, 'Name should be at least 2 characters')
      .max(100, 'Name should not exceed 100 characters'),
    visitorPhone: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    purpose: Yup.string()
      .required('Purpose is required')
      .min(3, 'Purpose should be at least 3 characters')
      .max(200, 'Purpose should not exceed 200 characters'),
    flatId: Yup.number()
      .required('Flat is required')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      purpose: '',
      flatId: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await api.post('/visitor-logs', {
          ...values,
          loggedById: currentUser.id,
          loggedByName: currentUser.name
        });
        
        // Add the new visitor to recent visitors
        setRecentVisitors(prev => [response.data, ...prev].slice(0, 10));
        
        setSnackbar({
          open: true,
          message: 'Visitor logged successfully! Waiting for resident approval.',
          severity: 'success'
        });
        
        resetForm();
      } catch (error) {
        console.error('Error logging visitor:', error);
        setSnackbar({
          open: true,
          message: 'Failed to log visitor. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenConfirmDialog = (visitorId) => {
    setConfirmDialog({
      open: true,
      title: 'Record Visitor Exit',
      message: 'Are you sure you want to record this visitor as exited?',
      visitorId
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  const handleRecordExit = async () => {
    try {
      await api.put(`/visitor-logs/${confirmDialog.visitorId}/exit`);
      
      // Update the visitor in the list
      setRecentVisitors(prevVisitors => 
        prevVisitors.map(visitor => 
          visitor.id === confirmDialog.visitorId 
            ? { ...visitor, exitTime: new Date().toISOString() } 
            : visitor
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Visitor exit recorded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error recording visitor exit:', error);
      setSnackbar({
        open: true,
        message: 'Failed to record visitor exit. Please try again.',
        severity: 'error'
      });
    } finally {
      handleCloseConfirmDialog();
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom className="page-title">
        Visitor Log
      </Typography>
      
      <Grid container spacing={4}>
        {/* Visitor Entry Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Log New Visitor
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="visitorName"
                    name="visitorName"
                    label="Visitor Name"
                    value={formik.values.visitorName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.visitorName && Boolean(formik.errors.visitorName)}
                    helperText={formik.touched.visitorName && formik.errors.visitorName}
                    InputProps={{
                      startAdornment: <Person color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="visitorPhone"
                    name="visitorPhone"
                    label="Visitor Phone"
                    value={formik.values.visitorPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.visitorPhone && Boolean(formik.errors.visitorPhone)}
                    helperText={formik.touched.visitorPhone && formik.errors.visitorPhone}
                    InputProps={{
                      startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="purpose"
                    name="purpose"
                    label="Purpose of Visit"
                    value={formik.values.purpose}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                    helperText={formik.touched.purpose && formik.errors.purpose}
                    InputProps={{
                      startAdornment: <Description color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.flatId && Boolean(formik.errors.flatId)}>
                    <InputLabel id="flat-label">Visiting Flat</InputLabel>
                    <Select
                      labelId="flat-label"
                      id="flatId"
                      name="flatId"
                      value={formik.values.flatId}
                      label="Visiting Flat"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      startAdornment={<Home color="action" sx={{ mr: 1 }} />}
                    >
                      {flats.map((flat) => (
                        <MenuItem key={flat.id} value={flat.id}>
                          {flat.buildingName} - Flat {flat.flatNumber}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.flatId && formik.errors.flatId && (
                      <Typography color="error" variant="caption" sx={{ ml: 2, mt: 0.5 }}>
                        {formik.errors.flatId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      startIcon={<Cancel />}
                      onClick={() => formik.resetForm()}
                    >
                      Clear
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAdd />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Log Visitor'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Visitors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Visitors
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {recentVisitors.length > 0 ? (
              <List>
                {recentVisitors.map((visitor) => (
                  <ListItem 
                    key={visitor.id} 
                    alignItems="flex-start"
                    secondaryAction={
                      !visitor.exitTime && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenConfirmDialog(visitor.id)}
                          startIcon={<CheckCircle />}
                        >
                          Record Exit
                        </Button>
                      )
                    }
                    sx={{ mb: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {visitor.visitorName}
                          {visitor.approved ? (
                            <Chip 
                              label="Approved" 
                              color="success" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          ) : (
                            <Chip 
                              label="Pending" 
                              color="warning" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {visitor.purpose}
                          </Typography>
                          {` — Flat: ${visitor.flatNumber}, Phone: ${visitor.visitorPhone}`}
                          <br />
                          {`Entry: ${visitor.entryTime && format(new Date(visitor.entryTime), 'MMM dd, hh:mm a')}`}
                          {visitor.exitTime && ` | Exit: ${format(new Date(visitor.exitTime), 'MMM dd, hh:mm a')}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No recent visitors
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRecordExit} color="primary" variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuardVisitorLog;