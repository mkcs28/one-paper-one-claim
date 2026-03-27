import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { submitContact } from "../api.js";

function CheckIcon()  { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function MailIcon()   { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>; }
function PhoneIcon()  { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function MapIcon()    { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ClockIcon()  { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function XIcon()      { return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

const SUBJECT_OPTS = [
  "Submission Issue",
  "Record Amendment / Withdrawal",
  "Access / Login Problem",
  "Policy Clarification",
  "Co-Author Data Correction",
  "Duplicate Entry Complaint",
  "Subscription Access Problem",
  "General Enquiry",
  "Other",
];

const INFO_CARDS = [
  { Icon: MailIcon,  label: "Email",        value: "office.deanres@jssstuniv.in" },
  { Icon: PhoneIcon, label: "Phone",        value: "0821 241 1305" },
  { Icon: MapIcon,   label: "Address",      value: "Mysuru, Karnataka — 570 006" },
  { Icon: ClockIcon, label: "Working Hours", value: "Mon – Fri, 9:00 AM – 5:00 PM" },
];

const INIT = { name: "", email: "", phone: "", subject: "", message: "" };

function validate(f) {
  const e = {};
  if (!f.name.trim())    e.name    = "Name is required.";
  if (!f.email.trim())   e.email   = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Enter a valid email.";
  if (!f.subject)        e.subject = "Please select a subject.";
  if (!f.message.trim()) e.message = "Message is required.";
  else if (f.message.trim().length < 20) e.message = "Message must be at least 20 characters.";
  return e;
}

/* ── Toast Alert ── */
function Toast({ data, onClose }) {
  useEffect(() => {
    if (!data) return;
    const id = setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: "2rem", right: "2rem", zIndex: 999,
        display: "flex", alignItems: "flex-start", gap: "0.75rem",
        background: "linear-gradient(135deg, #16a34a, #15803d)",
        color: "white", padding: "1rem 1.4rem",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(22,163,74,0.35)",
        fontFamily: "var(--font)", fontSize: "0.86rem", fontWeight: 500,
        animation: "slideInToast 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        maxWidth: "340px",
      }}
      role="alert" aria-live="assertive"
    >
      <span style={{ width:22,height:22,background:"rgba(255,255,255,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px" }}>
        <CheckIcon />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: "4px" }}>Message Sent Successfully</div>
        <div style={{ opacity: 0.85, fontSize: "0.8rem" }}>
          Ack. No: <strong style={{ letterSpacing: "0.5px" }}>{data.ackNumber}</strong>
        </div>
        <div style={{ opacity: 0.75, fontSize: "0.78rem", marginTop: "2px" }}>
          A confirmation email has been sent. We respond within 2 working days.
        </div>
      </div>
      <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.8)",padding:"2px",display:"flex",flexShrink:0 }} aria-label="Close"><XIcon /></button>
    </div>
  );
}

export default function Contact() {
  const [form, setForm]     = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState(null); // { ackNumber } or null
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    /* Domain check */
    if (!form.email.toLowerCase().endsWith("@jssstuniv.in")) {
      setErrors((p) => ({ ...p, email: "Only @jssstuniv.in email addresses are accepted." }));
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      const result = await submitContact(form);
      setToast({ ackNumber: result.ackNumber });
      setForm(INIT);
      setErrors({});
    } catch (err) {
      if (err.error === "INVALID_DOMAIN") {
        setErrors((p) => ({ ...p, email: err.message }));
      } else {
        setApiError(err.message || "Failed to send message. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(24px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="page-header">
        <span className="page-eyebrow">Grievances &amp; Enquiries</span>
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">Submit your grievances, complaints, or general enquiries. We respond within 2 working days.</p>
      </div>

      {/* Two-column layout: info cards left, form right */}
      <div className="contact-page-layout">

        {/* LEFT — info cards stacked vertically */}
        <div className="contact-page-info">
          {INFO_CARDS.map(({ Icon, label, value }) => (
            <div className="contact-info-card" key={label}>
              <div className="contact-info-icon"><Icon /></div>
              <div>
                <div className="contact-info-label">{label}</div>
                <div className="contact-info-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — message form */}
        <div className="contact-page-form">
          <GlassCard className="contact-form-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-section-label">Send a Message</div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="c-name">Full Name <span className="required">*</span></label>
                  <input id="c-name" name="name" type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-email">Email Address <span className="required">*</span></label>
                  <input id="c-email" name="email" type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={handleChange} />
                  {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="c-phone">
                    Phone Number{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Optional)</span>
                  </label>
                  <input id="c-phone" name="phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-subject">Subject <span className="required">*</span></label>
                  <select id="c-subject" name="subject" className="form-select" value={form.subject} onChange={handleChange}>
                    <option value="">Select subject</option>
                    {SUBJECT_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <span className="form-error" role="alert">{errors.subject}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="c-message">Message <span className="required">*</span></label>
                <textarea
                  id="c-message" name="message"
                  className="form-input form-textarea"
                  placeholder="Describe your grievance or enquiry in detail (minimum 20 characters)..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="form-error" role="alert">{errors.message}</span>}
              </div>

              {apiError && (
                <div style={{ padding:"0.75rem 1rem", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"var(--radius-sm)", fontSize:"0.84rem", color:"#dc2626", marginBottom:"0.5rem" }}>
                  {apiError}
                </div>
              )}

              <div className="submit-row">
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ minWidth: "150px", opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

      </div>

      {/* Toast alert with ack number */}
      <Toast data={toast} onClose={() => setToast(null)} />
    </div>
  );
}
