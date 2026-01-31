const express = require('express');
const xirsysService = require('../services/xirsysService');
// const auth = require('../middleware/auth'); // Optional auth - commented out for testing

const router = express.Router();

// Get TURN server configuration for WebRTC
router.get('/turn-config', async (req, res) => {
  try {
    // Get TURN credentials from Xirsys
    const turnConfig = await xirsysService.getTurnCredentials();
    
    console.log('📋 Providing Xirsys TURN config to client:', turnConfig.iceServers.length, 'servers');
    
    res.json({
      success: true,
      data: turnConfig
    });
  } catch (error) {
    console.error('❌ Error getting TURN config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get TURN server configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test Xirsys connection
router.get('/test-xirsys', async (req, res) => {
  try {
    const testResult = await xirsysService.testConnection();
    res.json(testResult);
  } catch (error) {
    console.error('❌ Error testing Xirsys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Xirsys connection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test TURN server connectivity (legacy endpoint)
router.get('/test-turn', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Use /test-xirsys for Xirsys testing',
      data: {
        xirsysConfigured: !!(process.env.XIRSYS_API_URL && process.env.XIRSYS_IDENT && process.env.XIRSYS_SECRET),
        fallbackConfigured: !!(process.env.TURN_SERVER_URL_2 && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL),
        note: 'Visit /api/webrtc/test-xirsys for full Xirsys testing'
      }
    });
  } catch (error) {
    console.error('❌ Error testing TURN servers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test TURN servers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

module.exports = router;
