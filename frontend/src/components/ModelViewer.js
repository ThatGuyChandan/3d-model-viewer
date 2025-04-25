import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stage } from '@react-three/drei';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Model({ url }) {
  const s3Url = url.startsWith(process.env.REACT_APP_API_URL) 
    ? url.replace(process.env.REACT_APP_API_URL, '') 
    : url;

  const { scene } = useGLTF(s3Url);
  return <primitive object={scene} scale={0.8} />;
}

function ModelViewer() {
  const { id } = useParams();
  const [modelData, setModelData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/models/${id}`);
        setModelData(response.data);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !modelData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error || 'Model not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="dawn" background />
          <Stage intensity={1.5} environment="sunset">
            <Model url={modelData.filePath} />
          </Stage>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </Box>
  );
}

export default ModelViewer;
