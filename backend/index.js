const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib'); 
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.CORS_ORIGIN)
// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true
}));

// Parsing incoming requests with JSON payloads
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// API to retrieve the uploaded PDF for display
app.get('/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// API to extract selected pages from the uploaded PDF
app.post('/extract-pages', async (req, res) => {
  const { filename, selectedPages } = req.body;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Original PDF file not found.');
  }

  try {
    // Read the original PDF
    const existingPdfBytes = fs.readFileSync(filePath);

    // Load the existing PDF into pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Create a new PDF document to hold extracted pages
    const newPdfDoc = await PDFDocument.create();

    // Add selected pages to the new PDF
    for (const pageNum of selectedPages) {
      const [extractedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);  // Pages are 0-indexed
      newPdfDoc.addPage(extractedPage);
    }

    // Serialize the new PDF and save it to a file
    const newPdfBytes = await newPdfDoc.save();
    const newFilename = `extracted-${Date.now()}.pdf`;
    const newFilePath = path.join(__dirname, 'uploads', newFilename);

    fs.writeFileSync(newFilePath, newPdfBytes);

    res.json({ message: 'PDF extracted successfully', newFilename });
  } catch (error) {
    console.error('Error extracting pages:', error);
    res.status(500).send('Error extracting pages.');
  }
});

// Basic server listening
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
