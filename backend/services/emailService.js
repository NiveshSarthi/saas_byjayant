const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createCompanyEmail = async (employeeName, department) => {
  // Logic to create email, e.g., firstname.lastname@company.com
  const email = `${employeeName.toLowerCase().replace(' ', '.')}@company.com`;
  // Send welcome email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to the Company',
    text: `Welcome ${employeeName}! Your company email is ${email}.`
  });
  return email;
};

const sendOfferEmail = async (candidateEmail, offerDetails) => {
  // Send offer letter via email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: 'Job Offer',
    text: `Dear Candidate, ${offerDetails}`
  });
};

const sendAlertEmail = async (userEmail, message) => {
  // Send alert email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Alert',
    text: message
  });
};

module.exports = {
  createCompanyEmail,
  sendOfferEmail,
  sendAlertEmail,
};