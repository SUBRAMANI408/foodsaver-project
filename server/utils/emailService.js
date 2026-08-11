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

export const sendOrderConfirmationEmail = async (email, name, order) => {
  const subject = `Order Confirmation - #${order.orderNumber} 🧾`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name} x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${(item.discountedPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #16a34a; text-align: center;">Order Confirmed!</h2>
      <p style="color: #334155; font-size: 16px;">Hi ${name || 'there'},</p>
      <p style="color: #334155; font-size: 16px;">Thank you for your order! Your payment method is <strong>${order.paymentMethod === 'cash_on_delivery' ? 'Pay at Pickup' : order.paymentMethod}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color: #334155;">
        ${itemsHtml}
        <tr>
          <td style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
          <td style="padding: 10px; font-weight: bold; text-align: right; color: #16a34a;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 20px;">
        <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Pickup Instructions:</strong></p>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Please pick up your order within 2 hours. Have your order number ready when you arrive at the store.</p>
      </div>
    </div>
  `;
  await sendEmail({ email, subject, html });
};

export const sendOrderExpiringEmail = async (email, name, order) => {
  const subject = `Urgent: Order Expiring Soon - #${order.orderNumber} ⏰`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 10px;">
      <h2 style="color: #ef4444; text-align: center;">Order Expiring Soon!</h2>
      <p style="color: #334155; font-size: 16px;">Hi ${name || 'there'},</p>
      <p style="color: #334155; font-size: 16px;">This is an urgent reminder that your order <strong>#${order.orderNumber}</strong> will expire in less than 15 minutes.</p>
      <p style="color: #334155; font-size: 16px;">If you do not pick up the food before the deadline, your token will expire and the food will be released back to the merchant.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/orders" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Details</a>
      </div>
    </div>
  `;
  await sendEmail({ email, subject, html });
};

export default sendEmail;
