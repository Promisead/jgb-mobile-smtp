require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const data = req.body;

  // const transporter = nodemailer.createTransport({
  //   host: 'mail.jgbaccountant.com',
  //   port: 587, // Use 465 for SSL, 587 for TLS
  //   secure: false, // Set to true for port 465
  //   auth: {
  //     user: process.env.SMTP_USER, // should be webcontact@jgbaccountant.com
  //     pass: process.env.SMTP_PASS  // should be the actual email password
  //   }
  // });

const transporter = nodemailer.createTransport({
  host: 'mail.dev-champions.tech',
  port: 465,
  secure: true, // because 465 uses SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});



  transporter.verify((err, success) => {
    if (err) {
      console.error('❌ Could not connect to SMTP server:', err);
      return res.status(500).json({ success: false, message: 'SMTP verification failed.', error: err });
    } else {
      console.log('✅ SMTP server is ready to send mail');

      let subject = '📩 New Website Submission';
      let html = '';

      if (data.contactTime) {
        subject = '📞 Callback Request';
        html = `
          <h3>Callback Request</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.tel}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Best Time to Contact:</strong> ${data.contactTime}</p>
          <p><strong>Contact Preferences:</strong> ${data.CheckboxGroup?.join(', ') || 'None'}</p>
        `;
      } else if (data.why || data.comment) {
        subject = '📬 Contact Form Submission';
        html = `
          <h3>New Contact Form Message</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.tel}</p>
          <p><strong>Service Area:</strong> ${data.why}</p>
          <p><strong>Message:</strong><br>${data.comment}</p>
        `;
      } else {
        return res.status(400).json({ success: false, message: 'Unrecognized form data.' });
      }

      const message = {
        from: `"JGB Website Form" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // You can also CC other recipients here
        subject: subject,
        html: html
      };

      transporter.sendMail(message)
        .then(() => res.status(200).json({ success: true, message: '✅ Email sent!' }))
        .catch(error => {
          console.error('❌ Mail error:', error);
          res.status(500).json({ success: false, message: 'Failed to send email.', error });
        });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



