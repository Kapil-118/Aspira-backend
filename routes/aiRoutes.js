// peerbridge-backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const multer = require('multer');

// Enforce explicit memory storage allocations so req.file.buffer exists
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route mapping remains clean
router.post('/summarize', upload.single('file'), aiController.summarizeResume);

module.exports = router;