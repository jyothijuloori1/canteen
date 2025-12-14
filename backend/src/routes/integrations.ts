import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendEmail } from '../services/email';
import { upload, getFileUrl } from '../services/upload';

const router = Router();

// All integration routes require authentication
router.use(authenticateToken);

// Send Email
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { to, subject, body, html } = req.body;

    if (!to || !subject || !body) {
      res.status(400).json({ error: 'to, subject, and body are required' });
      return;
    }

    const result = await sendEmail({ to, subject, body, html });
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload File
router.post('/upload-file', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = getFileUrl(req.file.filename);
    
    res.json({
      success: true,
      file_url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req: Request, res: Response) => {
  const path = require('path');
  const fs = require('fs');
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const filePath = path.join(uploadDir, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
