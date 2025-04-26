const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/3d-model-viewer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Model Schema
const modelSchema = new mongoose.Schema({
  name: String,
  description: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now }
});

const Model = mongoose.model('Model', modelSchema);

// Custom storage for S3 uploads
const s3Storage = multer.memoryStorage();

const upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes
app.post('/api/models', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, description } = req.body;
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `models/${Date.now()}${fileExtension}`;
    
    // Upload to S3 with public read access
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      CacheControl: 'public, max-age=31536000'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generate the public URL with proper region
    const filePath = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    const newModel = new Model({
      name,
      description,
      filePath: filePath
    });
    
    await newModel.save();
    res.json(newModel);
  } catch (err) {
    console.error('Error saving model:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const models = await Model.find().sort({ createdAt: -1 });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/models/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Extract the file key from the S3 URL
    const fileKey = model.filePath.split('.com/')[1];
    
    // Delete from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    
    // Delete from database
    await Model.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Model deleted successfully' });
  } catch (err) {
    console.error('Error deleting model:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 