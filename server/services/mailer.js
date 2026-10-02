import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and configures the nodemailer transporter.
 * Supports Yahoo Mail, Gmail, or any custom SMTP.
 */
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // Yahoo/Gmail/Custom SMTP configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'yahoo',
    host: process.env.EMAIL_HOST || 'smtp.mail.yahoo.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: {
      user,
      pass
    }
  });
}

function getWelcomeHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fbf5e9; margin: 0; padding: 0; color: #1e3a3f; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1.5px solid rgba(30,58,63,0.12); box-shadow: 0 10px 30px rgba(30,58,63,0.06); }
    .header { background: #1e3a3f; color: #f3e7ce; padding: 36px 30px; text-align: center; }
    .header h1 { margin: 0 0 6px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.85; font-style: italic; }
    .body-content { padding: 36px 32px; line-height: 1.6; font-size: 15px; }
    .greeting { font-size: 18px; font-weight: 600; color: #c4707a; margin-bottom: 14px; }
    .coupon-box { background: #fbf5e9; border: 2px dashed #e3ae49; border-radius: 14px; padding: 20px; text-align: center; margin: 26px 0; }
    .coupon-code { font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #1e3a3f; background: #ffffff; padding: 6px 18px; border-radius: 8px; display: inline-block; margin-top: 8px; border: 1px solid #e3ae49; }
    .cta-btn { display: inline-block; background: #1e3a3f; color: #f3e7ce !important; text-decoration: none; padding: 13px 28px; border-radius: 30px; font-weight: 600; font-size: 14px; margin-top: 10px; }
    .footer { background: #f3e7ce; padding: 22px; text-align: center; font-size: 12px; color: #5c7175; border-top: 1px solid rgba(30,58,63,0.08); }
    .wa-link { color: #15803d; font-weight: bold; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>handii<span style="color:#e3ae49;">.co</span> 🌸</h1>
      <p>Handmade Factory — Little things, stitched with love.</p>
    </div>
    
    <div class="body-content">
      <div class="greeting">Welcome to our artisan craft family! ✨</div>
      <p>Thank you for subscribing to handii.co drop alerts. Every petal, letter charm, and bracelet is crafted one-by-one with pipe cleaner coils and crystal resin in our studio.</p>
      
      <p>As a warm welcome, please enjoy <strong>10% off</strong> your first handcrafted piece:</p>
      
      <div class="coupon-box">
        <span style="font-size: 13px; text-transform: uppercase; color: #5c7175; font-weight: 600;">Your Welcome Gift Voucher</span><br>
        <div class="coupon-code">WELCOME10</div>
        <p style="margin: 8px 0 0; font-size: 12px; color: #5c7175;">Apply at checkout or connect with us on Instagram.</p>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://www.instagram.com/handii.co/" class="cta-btn">
          💬 Chat With Our Artisan on Instagram
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">Need a bespoke flower bouquet or personalized alphabet charm?</p>
      <p style="margin: 0;">Studio Instagram: <a href="https://www.instagram.com/handii.co/" style="color:#c4707a;">@handii.co</a> • Email: <a href="mailto:handii.co@yahoo.com" style="color:#c4707a;">handii.co@yahoo.com</a></p>
      <p style="margin: 10px 0 0; font-size: 11px; opacity: 0.7;">© 2026 handii.co Handmade Factory, India.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Sends a handcrafted Welcome & Restock Alert email to a new subscriber.
 * Automatically uses Resend API if RESEND_API_KEY is provided,
 * or standard SMTP if EMAIL_USER and EMAIL_PASS are provided.
 */
export async function sendWelcomeEmail(toEmail) {
  dotenv.config();
  const resendApiKey = process.env.RESEND_API_KEY;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const htmlContent = getWelcomeHtml();

  // 1. If Brevo API Key is set, use Brevo (allows sending to ANY recipient email without needing a domain!)
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSender = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || process.env.REPLY_TO_EMAIL || 'handii.co@yahoo.com';

  if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'handii.co Studio 🌸',
            email: brevoSender
          },
          to: [{ email: toEmail }],
          replyTo: {
            email: process.env.REPLY_TO_EMAIL || 'handii.co@yahoo.com',
            name: 'handii.co Studio 🌸'
          },
          subject: '✨ Welcome to the handii.co family! (+ 10% Welcome Gift Voucher 🌸)',
          htmlContent: htmlContent
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`🌸 [Brevo Success]: Welcome email successfully sent to <${toEmail}> (MessageId: ${data.messageId})`);
        return { success: true, messageId: data.messageId };
      } else {
        console.error('🌸 [Brevo Error]:', data);
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('🌸 [Brevo Network Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. If Resend API Key is set, use Resend
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'handii.co Studio 🌸 <onboarding@resend.dev>',
          to: [toEmail],
          reply_to: process.env.REPLY_TO_EMAIL || 'handii.co@yahoo.com',
          subject: '✨ Welcome to the handii.co family! (+ 10% Welcome Gift Voucher 🌸)',
          html: htmlContent
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`🌸 [Resend Success]: Welcome email dispatched to <${toEmail}> (Id: ${data.id})`);
        return { success: true, id: data.id };
      } else {
        // If in test mode and the recipient is an external address, route to the registered test email so the demo never fails
        if (data.message && data.message.includes('only send testing emails to your own email address')) {
          const match = data.message.match(/\(([^)]+)\)/);
          const fallbackEmail = match ? match[1] : 'aroranikita348@gmail.com';
          console.log(`🌸 [Resend Demo Fallback]: Routing demo email for <${toEmail}> to test account <${fallbackEmail}>...`);

          const demoHtml = `
            <div style="background:#e0f2fe; border:1px solid #0284c7; color:#0369a1; padding:10px 16px; border-radius:10px; font-family:sans-serif; font-size:13px; margin-bottom:16px;">
              <strong>🎓 Live Project Demo Mode:</strong> This email was requested for <strong>${toEmail}</strong>. In production with a domain, it delivers straight to the customer's inbox.
            </div>
            ${htmlContent}
          `;

          const fallbackResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey.trim()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'handii.co Studio 🌸 <onboarding@resend.dev>',
              to: [fallbackEmail],
              reply_to: process.env.REPLY_TO_EMAIL || 'handii.co@yahoo.com',
              subject: `✨ Welcome to handii.co! [Demo for ${toEmail}] (+ 10% Voucher 🌸)`,
              html: demoHtml
            })
          });

          const fallbackData = await fallbackResponse.json();
          if (fallbackResponse.ok) {
            console.log(`🌸 [Resend Demo Success]: Forwarded demo email to <${fallbackEmail}> (Id: ${fallbackData.id})`);
            return { success: true, id: fallbackData.id, demoRouted: true };
          }
        }

        console.error('🌸 [Resend Error]:', data);
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('🌸 [Resend Network Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Otherwise use SMTP (Yahoo/Gmail/Custom SMTP)
  if (user && pass && pass.length >= 8) {
    try {
      const transporter = getTransporter();
      if (!transporter) return { success: false, message: 'Mailer not configured' };

      const info = await transporter.sendMail({
        from: `"handii.co Studio 🌸" <${user}>`,
        to: toEmail,
        subject: '✨ Welcome to the handii.co family! (+ 10% Welcome Gift Voucher 🌸)',
        html: htmlContent
      });

      console.log(`🌸 [SMTP Success]: Welcome email dispatched to <${toEmail}> (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('🌸 [SMTP Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 4. Fallback: Simulation mode
  console.log(`🌸 [Mailer Notice]: Simulated welcome email for <${toEmail}>.`);
  console.log(`👉 Add BREVO_API_KEY=xkeysib-... or RESEND_API_KEY in .env to send real emails.`);
  return { success: true, simulated: true };
}
