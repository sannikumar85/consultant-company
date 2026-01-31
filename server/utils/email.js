const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"EduConnect Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - EduConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Welcome to EduConnect!</h2>
        <p>Thank you for registering with our tutoring platform. Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/verify-email/${verificationToken}" 
             style="background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${process.env.CLIENT_URL}/verify-email/${verificationToken}</p>
        
        <p>This link will expire in 24 hours.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"EduConnect Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password - EduConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Password Reset Request</h2>
        <p>You requested a password reset for your EduConnect account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" 
             style="background-color: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${process.env.CLIENT_URL}/reset-password/${resetToken}</p>
        
        <p>This link will expire in 1 hour.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"EduConnect Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to EduConnect, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Welcome to EduConnect! 🎉</h2>
        <p>Hi ${name},</p>
        
        <p>Welcome to our tutoring platform! We're excited to have you join our community of learners and educators.</p>
        
        ${role === 'teacher' ? `
          <h3>As a Teacher:</h3>
          <ul>
            <li>Create your profile and add your specializations</li>
            <li>Set your availability and rates</li>
            <li>Connect with students looking for your expertise</li>
            <li>Start teaching and earning!</li>
          </ul>
        ` : `
          <h3>As a Student:</h3>
          <ul>
            <li>Browse our talented teachers</li>
            <li>Filter by subject, rating, and price</li>
            <li>Book sessions that fit your schedule</li>
            <li>Start learning today!</li>
          </ul>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard" 
             style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Happy learning!</p>
        <p>The EduConnect Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          You're receiving this email because you created an account on EduConnect.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailConfig
};
