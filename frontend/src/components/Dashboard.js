import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import '../styles/global.css';

function Dashboard() {
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: null,
  });
  const [uploading, setUploading] = useState(false);
  const [deletingModelId, setDeletingModelId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      model: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('model', formData.model);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/models`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData({ name: '', description: '', model: null });
      fetchModels();
    } catch (error) {
      console.error('Error uploading model:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (model) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;
    
    setDeletingModelId(modelToDelete._id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/models/${modelToDelete._id}`);
      fetchModels();
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setDeletingModelId(null);
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Paper className="upload-paper">
        <Typography variant="h5" gutterBottom className="section-title">
          <CloudUploadIcon /> Upload New 3D Model
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={uploading}
                className="text-field"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={uploading}
                className="text-field"
              />
            </Grid>
            <Grid item xs={12}>
              <Box className="file-input">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileChange}
                  required
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="model-upload"
                />
                <label htmlFor="model-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={uploading}
                    startIcon={<DescriptionIcon />}
                    className="file-button"
                  >
                    Choose File
                  </Button>
                </label>
                <Typography variant="body2" className="file-name">
                  {formData.model ? formData.model.name : 'No file chosen'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!formData.model || uploading}
                  className="upload-button"
                >
                  {uploading ? 'Uploading...' : 'Upload Model'}
                </Button>
                {uploading && (
                  <CircularProgress
                    size={24}
                    className="upload-progress"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom className="section-title">
        Your 3D Models
      </Typography>
      <Grid container spacing={3}>
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model._id}>
            <Fade in={true} timeout={500}>
              <Card className="model-card">
                <CardContent className="card-content">
                  <Typography className="model-name" variant="h6">
                    {model.name}
                  </Typography>
                  <Typography className="model-description" variant="body2">
                    {model.description}
                  </Typography>
                  <Box className="action-buttons">
                    <Tooltip title="View Model">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/view/${model._id}`)}
                        disabled={deletingModelId !== null}
                        className="view-button"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Model">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(model)}
                        disabled={deletingModelId !== null}
                        className="delete-button"
                      >
                        {deletingModelId === model._id ? (
                          <CircularProgress size={24} sx={{ color: 'error.main' }} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          className: "delete-dialog"
        }}
      >
        <DialogTitle id="delete-dialog-title">
          Delete Model
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{modelToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} className="cancel-button">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deletingModelId !== null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard; 