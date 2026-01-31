// TURN Server Test Utility
const testTurnServer = async () => {
  console.log('🔄 Testing TURN server configuration...');
  
  // Basic TURN server configuration test
  const turnConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      },
      {
        urls: process.env.TURN_SERVER_URL_2 || 'turn:numb.viagenie.ca:3478',
        username: process.env.TURN_USERNAME || 'webrtc@live.com',
        credential: process.env.TURN_CREDENTIAL || 'muazkh'
      }
    ]
  };

  console.log('📋 TURN Configuration:');
  console.log(JSON.stringify(turnConfig, null, 2));

  // Test if we can create a peer connection with this config
  // Note: This is a basic test - full WebRTC testing requires a browser environment
  console.log('✅ TURN server configuration loaded successfully');
  console.log('🔍 To fully test video calling, use the browser interface');
  
  return turnConfig;
};

// Export for use in other files
module.exports = { testTurnServer };

// Run test if called directly
if (require.main === module) {
  testTurnServer().catch(console.error);
}
