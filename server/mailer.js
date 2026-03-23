import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* Verify connection on startup */
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email config error:", err.message);
    console.error("   Check MAIL_USER and MAIL_PASS in server/.env");
  } else {
    console.log("✅ Email server ready — mails will be sent via", process.env.MAIL_USER);
  }
});

/* ── Shared HTML wrapper ── */
function wrap(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; font-family:'Segoe UI',Arial,sans-serif; background:#f2f5ff; color:#0a1a3e; }
    .outer { max-width:600px; margin:32px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(10,45,110,0.1); }
    .header { background:linear-gradient(135deg,#0a2d6e,#1e56c8); padding:32px 36px; text-align:center; }
    .header h1 { margin:0; color:#ffffff; font-size:20px; letter-spacing:-0.3px; }
    .header p  { margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px; }
    .body   { padding:32px 36px; }
    .ack-box { background:linear-gradient(135deg,#fff4ea,#ffe8d0); border:1.5px solid rgba(245,110,0,0.3); border-radius:12px; padding:18px 24px; margin:20px 0; text-align:center; }
    .ack-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#f56e00; margin-bottom:6px; }
    .ack-number { font-size:26px; font-weight:700; color:#0a2d6e; letter-spacing:1px; }
    .field-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eef2ff; font-size:14px; }
    .field-row:last-child { border-bottom:none; }
    .field-label { color:#7a90b8; font-weight:500; min-width:140px; }
    .field-value { color:#0a1a3e; font-weight:500; text-align:right; }
    .note { background:#eef2ff; border-radius:10px; padding:14px 18px; font-size:13px; color:#3a5080; margin-top:20px; line-height:1.6; }
    .footer { background:#0a2d6e; padding:18px 36px; text-align:center; font-size:12px; color:rgba(255,255,255,0.6); }
    .footer a { color:rgba(255,255,255,0.85); text-decoration:none; }
  </style>
</head>
<body>
  <div class="outer">
    ${content}
    <div class="footer">
      &copy; ${new Date().getFullYear()} One Paper One Claim &mdash; JSS Science and Technology University<br/>
      <a href="mailto:research@jssstuniv.in">research@jssstuniv.in</a> &nbsp;|&nbsp; +91 821 2548 400
    </div>
  </div>
</body>
</html>`;
}

/* ── Paper submission acknowledgement ── */
export async function sendPaperAck({ to, name, ackNumber, paperTitle, paperType, journal, submittedAt }) {
  const date = new Date(submittedAt).toLocaleString("en-IN", {
    dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata",
  });

  const html = wrap(`
    <div class="header">
      <h1>Submission Acknowledged</h1>
      <p>One Paper One Claim &mdash; Research Publication Portal</p>
    </div>
    <div class="body">
      <p style="font-size:15px;margin-bottom:4px;">Dear <strong>${name}</strong>,</p>
      <p style="font-size:14px;color:#3a5080;margin-bottom:20px;">
        Your research paper has been successfully submitted and registered in the portal.
        Please save your acknowledgement number for future reference.
      </p>

      <div class="ack-box">
        <div class="ack-label">Acknowledgement Number</div>
        <div class="ack-number">${ackNumber}</div>
        <div style="font-size:12px;color:#f56e00;margin-top:6px;">${date}</div>
      </div>

      <div style="margin-top:24px;">
        <div class="field-row"><span class="field-label">Paper Title</span><span class="field-value" style="max-width:280px;word-break:break-word;text-align:right;">${paperTitle}</span></div>
        <div class="field-row"><span class="field-label">Paper Type</span><span class="field-value">${paperType}</span></div>
        <div class="field-row"><span class="field-label">Journal / Venue</span><span class="field-value">${journal}</span></div>
        <div class="field-row"><span class="field-label">Submitted To</span><span class="field-value">JSSSTU Research Cell</span></div>
      </div>

      <div class="note">
        <strong>Next Steps:</strong> You can verify your submission anytime using the
        <strong>Search</strong> tab in the portal. For queries, contact
        <a href="mailto:research@jssstuniv.in" style="color:#1e56c8;">research@jssstuniv.in</a>
        or call <strong>+91 821 2548 400</strong>.
      </div>
    </div>
  `);

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `[OPOC] Submission Acknowledged — ${ackNumber}`,
    html,
  });
}

/* ── Contact message acknowledgement ── */
export async function sendContactAck({ to, name, ackNumber, subject, createdAt }) {
  const date = new Date(createdAt).toLocaleString("en-IN", {
    dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata",
  });

  const html = wrap(`
    <div class="header">
      <h1>Message Received</h1>
      <p>One Paper One Claim &mdash; Grievance &amp; Enquiry Portal</p>
    </div>
    <div class="body">
      <p style="font-size:15px;margin-bottom:4px;">Dear <strong>${name}</strong>,</p>
      <p style="font-size:14px;color:#3a5080;margin-bottom:20px;">
        We have received your message and will respond within <strong>2 working days</strong>.
        Please keep your acknowledgement number handy when following up.
      </p>

      <div class="ack-box">
        <div class="ack-label">Acknowledgement Number</div>
        <div class="ack-number">${ackNumber}</div>
        <div style="font-size:12px;color:#f56e00;margin-top:6px;">${date}</div>
      </div>

      <div style="margin-top:24px;">
        <div class="field-row"><span class="field-label">Subject</span><span class="field-value">${subject}</span></div>
        <div class="field-row"><span class="field-label">Received By</span><span class="field-value">JSSSTU Research Cell</span></div>
        <div class="field-row"><span class="field-label">Response Time</span><span class="field-value">Within 2 working days</span></div>
      </div>

      <div class="note">
        If you have an urgent matter, please call us directly at <strong>+91 821 2548 400</strong>
        or email <a href="mailto:research@jssstuniv.in" style="color:#1e56c8;">research@jssstuniv.in</a>.
      </div>
    </div>
  `);

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `[OPOC] Message Received — ${ackNumber}`,
    html,
  });
}
