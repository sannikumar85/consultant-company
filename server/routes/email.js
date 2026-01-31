const express = require('express');
const { testEmailConfig, sendWelcomeEmail } = require('../utils/email');
const router = express.Router();

// Test email configuration
router.get('/test-config', async (req, res) => {
  try {
    const result = await testEmailConfig();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email configuration is working correctly!',
        details: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Email configuration failed',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing email configuration',
      error: error.message
    });
  }
});

// Send test email
router.post('/send-test', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const result = await sendWelcomeEmail(email, name, 'student');
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

module.exports = router;
