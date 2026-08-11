import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback for development: use ethereal email
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Using Ethereal Email test account: ${testAccount.user}`);
    }

    const mailOptions = {
      from: `SaveBite <${process.env.EMAIL_USER || 'no-reply@savebite.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!process.env.EMAIL_USER) {
      console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Service] Error sending email: ${error.message}`);
    // Don't throw error to prevent crashing the app if email fails
  }
};

export const sendWelcomeEmail = async (email, name, role) => {
  const subject = 'Welcome to SaveBite! 🌱';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #16a34a; text-align: center;">Welcome to SaveBite!</h2>
      <p style="color: #334155; font-size: 16px;">Hi ${name || 'there'},</p>
      <p style="color: #334155; font-size: 16px;">We're thrilled to have you join our community as a <strong>${role.replace('_', ' ')}</strong>. Together, we can make a huge impact in reducing food waste and saving bites!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore SaveBite</a>
      </div>
      <p style="color: #64748b; font-size: 14px; text-align: center;">Thank you for making a difference!</p>
    </div>
  `;
  await sendEmail({ email, subject, html });
};

export const sendLoginAlertEmail = async (email, name) => {
  const subject = 'New Login Alert - SaveBite 🔐';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #16a34a; text-align: center;">Login Alert</h2>
      <p style="color: #334155; font-size: 16px;">Hi ${name || 'there'},</p>
      <p style="color: #334155; font-size: 16px;">We noticed a new login to your SaveBite account on <strong>${new Date().toLocaleString()}</strong>.</p>
      <p style="color: #334155; font-size: 16px;">If this was you, you can safely ignore this email. If you did not authorize this login, please contact our support team immediately.</p>
    </div>
  `;
  await sendEmail({ email, subject, html });
};

export default sendEmail;
