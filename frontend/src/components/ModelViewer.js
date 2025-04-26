import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Paper, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stage, Sky } from '@react-three/drei';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const backgrounds = {
  night: {
    name: 'Space',
    component: <Environment preset="night" background />,
  },
  sunset: {
    name: 'Sunset',
    component: <Environment preset="sunset" background />,
  },
  dawn: {
    name: 'Dawn',
    component: <Environment preset="dawn" background />,
  },
  forest: {
    name: 'Forest',
    component: <Environment preset="forest" background />,
  },
  warehouse: {
    name: 'Warehouse',
    component: <Environment preset="warehouse" background />,
  },
  city: {
    name: 'City',
    component: <Environment preset="city" background />,
  },
  studio: {
    name: 'Studio',
    component: <Environment preset="studio" background />,
  },
  park: {
    name: 'Park',
    component: <Environment preset="park" background />,
  },
  sky: {
    name: 'Sky',
    component: <Sky sunPosition={[100, 10, 100]} />,
  },
};

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={0.5} />;
}

function ModelViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState('night');
  const canvasRef = useRef();

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models/${id}`);
        setModel(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load model');
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
        <Typography>Loading model...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error-container">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="model-viewer-container">
      <Paper className="model-info better-model-info">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="model-title" sx={{ fontWeight: 700, fontSize: '2rem', letterSpacing: 1 }}>
            {model.name}
          </Typography>
        </Box>
        <Typography variant="body1" className="model-description" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
          {model.description}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: 'white' }}>Background</InputLabel>
          <Select
            value={selectedBackground}
            onChange={(e) => setSelectedBackground(e.target.value)}
            label="Background"
            sx={{
              color: 'white',
              background: 'rgba(30,30,30,0.7)',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(144,202,249,0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(144,202,249,1)',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            }}
          >
            {Object.entries(backgrounds).map(([key, { name }]) => (
              <MenuItem key={key} value={key} sx={{ color: 'black' }}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      <Box className="canvas-container" ref={canvasRef}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {backgrounds[selectedBackground].component}
          <Stage 
            intensity={1.5} 
            environment={selectedBackground === 'sky' ? 'sunset' : selectedBackground}
            preset={selectedBackground === 'sky' ? 'rembrandt' : 'soft'}
          >
            <Model url={model.filePath} />
          </Stage>
          <OrbitControls />
        </Canvas>
      </Box>
    </Box>
  );
}

export default ModelViewer;
