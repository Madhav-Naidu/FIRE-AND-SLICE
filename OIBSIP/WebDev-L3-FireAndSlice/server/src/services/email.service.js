import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email, token) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`✉️ [DEV MODE] SMTP not configured. Verification URL for ${email}: ${verificationUrl}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔥 Verify Your FIRE & SLICE Account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4500;">Welcome to FIRE & SLICE!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ff4500; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    // Don't crash server in dev
    console.log(`🔗 Fallback verification URL: ${verificationUrl}`);
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`🔐 [DEV MODE] SMTP not configured. Password reset URL for ${email}: ${resetUrl}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Reset Your FIRE & SLICE Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4500;">Password Reset Request</h1>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ff4500; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #ff0000; margin-top: 20px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.log(`🔗 Fallback reset URL: ${resetUrl}`);
  }
};

export const sendLowStockAlert = async (adminEmail, items) => {
  const itemsList = items.map(item =>
    `<li><strong>${item.name}</strong> - Current stock: ${item.stock} ${item.unit} (Threshold: ${item.threshold})</li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: '⚠️ FIRE & SLICE - Low Inventory Alert',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4500;">⚠️ Low Inventory Alert</h1>
        <p>The following items are running low and need to be restocked:</p>
        <ul style="line-height: 2;">
          ${itemsList}
        </ul>
        <p style="margin-top: 30px;">Please restock these items as soon as possible to avoid order fulfillment issues.</p>
        <a href="${process.env.CLIENT_URL}/admin/inventory" style="display: inline-block; padding: 12px 24px; background-color: #ff4500; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Manage Inventory</a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Low stock alert sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Error sending low stock alert:', error);
    throw error;
  }
};
