import nodemailer from "nodemailer";

const CONTACT_EMAIL = "office.deanres@jssstuniv.in";
const CONTACT_PHONE = "0821 241 1305";

const transporter = nodemailer.createTransport({
  host:       process.env.MAIL_HOST || "smtp-relay.brevo.com",
  port:       parseInt(process.env.MAIL_PORT || "587"),
  secure:     false,       // STARTTLS on port 587
  requireTLS: true,        // enforce STARTTLS — Brevo requires it
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },  // tolerate self-signed certs in dev
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Email config error:", err.message);
  } else {
    console.log("✅ Email server ready —", process.env.MAIL_USER);
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
    .outer { max-width:620px; margin:32px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(10,45,110,0.1); }
    .header { background:linear-gradient(135deg,#0a2d6e,#1e56c8); padding:28px 36px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:20px; letter-spacing:-0.3px; }
    .header p  { margin:5px 0 0; color:rgba(255,255,255,0.75); font-size:13px; }
    .body { padding:28px 36px; }
    .ack-box { background:linear-gradient(135deg,#fff4ea,#ffe8d0); border:1.5px solid rgba(245,110,0,0.3); border-radius:12px; padding:18px 24px; margin:20px 0; text-align:center; }
    .ack-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#f56e00; margin-bottom:6px; }
    .ack-number { font-size:26px; font-weight:700; color:#0a2d6e; letter-spacing:1px; }
    .ack-date { font-size:12px; color:#f56e00; margin-top:4px; }
    .field-row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #eef2ff; font-size:13.5px; }
    .field-row:last-child { border-bottom:none; }
    .field-label { color:#7a90b8; font-weight:500; min-width:140px; }
    .field-value { color:#0a1a3e; font-weight:500; text-align:right; max-width:300px; word-break:break-word; }
    .note { background:#eef2ff; border-radius:10px; padding:14px 18px; font-size:13px; color:#3a5080; margin-top:18px; line-height:1.65; }
    .footer { background:#0a2d6e; padding:16px 36px; text-align:center; font-size:12px; color:rgba(255,255,255,0.6); }
    .footer a { color:rgba(255,255,255,0.85); text-decoration:none; }
    .section-head { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#f56e00; padding:10px 0 4px; border-bottom:1px solid #f56e00; margin-bottom:4px; }
  </style>
</head>
<body>
  <div class="outer">
    ${content}
    <div class="footer">
      &copy; ${new Date().getFullYear()} One Paper One Claim &mdash; JSS Science and Technology University<br/>
      <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> &nbsp;|&nbsp; ${CONTACT_PHONE}
    </div>
  </div>
</body>
</html>`;
}

/* ── Paper submission ACK — to applicant ── */
export async function sendPaperAck({ to, name, ackNumber, data, submittedAt, pdfBuffer, pdfName }) {
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
      <p style="font-size:14px;color:#3a5080;margin-bottom:18px;">
        Your research paper has been successfully submitted. Please save your acknowledgement number for future reference.
      </p>
      <div class="ack-box">
        <div class="ack-label">Acknowledgement Number</div>
        <div class="ack-number">${ackNumber}</div>
        <div class="ack-date">Submitted on ${date}</div>
      </div>
      <div class="section-head">Paper Details</div>
      <div class="field-row"><span class="field-label">Paper Title</span><span class="field-value">${data.paperTitle}</span></div>
      <div class="field-row"><span class="field-label">Paper Type</span><span class="field-value">${data.paperType}</span></div>
      <div class="field-row"><span class="field-label">Journal / Venue</span><span class="field-value">${data.journal}</span></div>
      <div class="field-row"><span class="field-label">Publisher</span><span class="field-value">${data.publisher}</span></div>
      <div class="field-row"><span class="field-label">DOI</span><span class="field-value">${data.doi || "—"}</span></div>
      <div class="field-row"><span class="field-label">Indexing</span><span class="field-value">${data.indexing}</span></div>
      <div class="note">
        <strong>Next Steps:</strong> You can verify your submission anytime using the <strong>Search</strong> tab.
        For corrections or queries, contact the Office of Dean Research at
        <a href="mailto:${CONTACT_EMAIL}" style="color:#1e56c8;">${CONTACT_EMAIL}</a>
        or call <strong>${CONTACT_PHONE}</strong>.
      </div>
    </div>
  `);

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `[OPOC] Submission Acknowledged — ${ackNumber}`,
    html,
    ...(pdfBuffer && {
      attachments: [{
        filename:    pdfName || `OPOC-Report-${ackNumber}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      }],
    }),
  });
}

/* ── Paper notification — to Office of Dean Research ── */
export async function sendPaperNotifyDean({ ackNumber, data, submittedAt, pdfBuffer, pdfName }) {
  const to = process.env.DEAN_RESEARCH_MAIL || CONTACT_EMAIL;
  const date = new Date(submittedAt).toLocaleString("en-IN", {
    dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata",
  });

  const html = wrap(`
    <div class="header">
      <h1>New Paper Submission</h1>
      <p>One Paper One Claim &mdash; Research Publication Portal</p>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#3a5080;margin-bottom:16px;">
        A new research paper has been submitted to the portal. Details are below.
      </p>
      <div class="ack-box">
        <div class="ack-label">Acknowledgement Number</div>
        <div class="ack-number">${ackNumber}</div>
        <div class="ack-date">${date}</div>
      </div>
      <div class="section-head">Submitter</div>
      <div class="field-row"><span class="field-label">Name</span><span class="field-value">${data.prefix} ${data.name}</span></div>
      <div class="field-row"><span class="field-label">Employee ID</span><span class="field-value">${data.empId}</span></div>
      <div class="field-row"><span class="field-label">Designation</span><span class="field-value">${data.designation}</span></div>
      <div class="field-row"><span class="field-label">Department</span><span class="field-value">${data.department}</span></div>
      <div class="field-row"><span class="field-label">Email</span><span class="field-value">${data.email}</span></div>
      <div class="field-row"><span class="field-label">Phone</span><span class="field-value">${data.phone}</span></div>
      <div class="section-head" style="margin-top:10px;">Paper</div>
      <div class="field-row"><span class="field-label">Title</span><span class="field-value">${data.paperTitle}</span></div>
      <div class="field-row"><span class="field-label">Type</span><span class="field-value">${data.paperType}</span></div>
      <div class="field-row"><span class="field-label">Article Type</span><span class="field-value">${data.articleType}</span></div>
      <div class="field-row"><span class="field-label">Domain</span><span class="field-value">${data.domainType}</span></div>
      <div class="field-row"><span class="field-label">Author Type</span><span class="field-value">${data.authorType}</span></div>
      <div class="field-row"><span class="field-label">Journal / Venue</span><span class="field-value">${data.journal}</span></div>
      <div class="field-row"><span class="field-label">Publisher</span><span class="field-value">${data.publisher}${data.publisherType ? ` (${data.publisherType})` : ""}</span></div>
      <div class="field-row"><span class="field-label">Publishing Date</span><span class="field-value">${data.publishingDate}</span></div>
      <div class="field-row"><span class="field-label">Access Type</span><span class="field-value">${data.accessType || "—"}</span></div>
      ${data.openAccessAmount ? `<div class="field-row"><span class="field-label">APC Paid (INR)</span><span class="field-value">₹${Number(data.openAccessAmount).toLocaleString("en-IN")}</span></div>` : ""}
      <div class="field-row"><span class="field-label">Indexing</span><span class="field-value">${data.indexing}</span></div>
      <div class="field-row"><span class="field-label">Quartile</span><span class="field-value">${data.quartile || "—"}</span></div>
      <div class="field-row"><span class="field-label">DOI</span><span class="field-value">${data.doi || "—"}</span></div>
      <div class="field-row"><span class="field-label">Preprint</span><span class="field-value">${data.preprintAvailable || "—"}</span></div>
      <div class="field-row"><span class="field-label">Uploaded File</span><span class="field-value">${data.fileName || "—"}</span></div>
      ${data.authors && data.authors.length > 0 ? `
      <div class="section-head" style="margin-top:10px;">Co-Authors</div>
      ${data.authors.map((a, i) => {
        const roleLabel   = a.authorRole ? ` <span style="color:#f56e00;font-size:11px;">[${a.authorRole}]</span>` : "";
        const collabLabel = a.collabType ? ` <span style="color:#1e56c8;font-size:11px;">${a.collabType}</span>` : "";
        const countryFlag = a.country && a.country !== "India" ? ` 🌍 <strong style="color:#1e56c8;">${a.country}</strong>` : (a.country ? ` ${a.country}` : "");
        const org = a.organization || "JSS Science and Technology University";
        return `<div class="field-row"><span class="field-label">Author ${i+2}${roleLabel}</span><span class="field-value">${a.prefix||""} ${a.name} — ${org}${collabLabel}${countryFlag}</span></div>`;
      }).join("")}
      ` : ""}
    </div>
  `);

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `[OPOC] New Submission — ${ackNumber} — ${data.name}`,
    html,
    ...(pdfBuffer && {
      attachments: [
        {
          filename: pdfName || data.fileName || `${ackNumber}.pdf`,
          content:  pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }),
  });
}

/* ── Contact ACK — to sender ── */
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
      <p style="font-size:14px;color:#3a5080;margin-bottom:18px;">
        We have received your message and will respond within <strong>2 working days</strong>.
      </p>
      <div class="ack-box">
        <div class="ack-label">Acknowledgement Number</div>
        <div class="ack-number">${ackNumber}</div>
        <div class="ack-date">${date}</div>
      </div>
      <div class="field-row"><span class="field-label">Subject</span><span class="field-value">${subject}</span></div>
      <div class="field-row"><span class="field-label">Received By</span><span class="field-value">Office of Dean Research</span></div>
      <div class="field-row"><span class="field-label">Response Time</span><span class="field-value">Within 2 working days</span></div>
      <div class="note">
        For urgent matters, call <strong>${CONTACT_PHONE}</strong> or email
        <a href="mailto:${CONTACT_EMAIL}" style="color:#1e56c8;">${CONTACT_EMAIL}</a>.
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
