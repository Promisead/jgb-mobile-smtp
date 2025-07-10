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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  transporter.verify((err, success) => {
    if (err) {
      console.error('❌ Could not connect to Gmail SMTP:', err);
      return res.status(500).json({ success: false, message: 'SMTP verification failed.', error: err });
    } else {
      console.log('✅ Gmail SMTP is ready to send mail');

      let subject = '📩 New Website Submission';
      let html = '';

      // Check which form was submitted
      if (data.contactTime) {
        // 📞 Callback form
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
        // 📬 Main Contact Form
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
        // Unknown form
        return res.status(400).json({ success: false, message: 'Unrecognized form data.' });
      }

      const message = {
        from: `"Website Form" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
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
