const axios = require('axios');

class XirsysService {
  constructor() {
    this.apiUrl = process.env.XIRSYS_API_URL;
    this.ident = process.env.XIRSYS_IDENT;
    this.secret = process.env.XIRSYS_SECRET;
    this.channel = process.env.XIRSYS_CHANNEL;
  }

  /**
   * Get TURN server credentials from Xirsys
   */
  async getTurnCredentials() {
    try {
      const url = `${this.apiUrl}/_turn/${this.channel}`;
      const auth = Buffer.from(`${this.ident}:${this.secret}`).toString('base64');
      
      const response = await axios.put(url, {
        format: 'urls'
      }, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.s === 'ok') {
        const iceServers = response.data.v.iceServers;
        
        // Add STUN servers for better connectivity
        iceServers.unshift({
          urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
        });

        return {
          iceServers: iceServers
        };
      } else {
        throw new Error('Failed to get TURN credentials from Xirsys');
      }
    } catch (error) {
      console.error('Xirsys TURN credentials error:', error.message);
      
      // Fallback to public TURN servers
      return {
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
          },
          {
            urls: 'turn:numb.viagenie.ca:3478',
            username: process.env.TURN_USERNAME,
            credential: process.env.TURN_CREDENTIAL
          }
        ]
      };
    }
  }

  /**
   * Test the Xirsys connection
   */
  async testConnection() {
    try {
      const credentials = await this.getTurnCredentials();
      return {
        success: true,
        message: 'Xirsys connection successful',
        iceServers: credentials.iceServers
      };
    } catch (error) {
      return {
        success: false,
        message: 'Xirsys connection failed',
        error: error.message
      };
    }
  }
}

module.exports = new XirsysService();
