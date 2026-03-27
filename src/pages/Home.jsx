import React, { useEffect, useRef, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { fetchPaperCount } from "../api.js";

/* ── Icons ── */
const UserIcon      = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const FileIcon      = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const LayersIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const UsersIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BuildingIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/></svg>;
const BriefcaseIcon = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const BookOpenIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const TagIcon       = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const BarChartIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const MailIcon      = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const PhoneIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const AwardIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const ClockIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const HashIcon      = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
const UploadIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const CalendarIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const LockIcon      = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const LayerIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>;
const AlertIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const REQUIRED_FIELDS = [
  { label: "Prefix Title (Mr / Dr / Ms / Mrs / Prof)",           Icon: UserIcon },
  { label: "Full Name & Employee ID",                            Icon: HashIcon },
  { label: "Designation & Department",                           Icon: BriefcaseIcon },
  { label: "Phone Number & Email",                               Icon: PhoneIcon },
  { label: "Paper Title",                                        Icon: FileIcon },
  { label: "Paper Type (Journal / Conference / Book Chapter / Book)", Icon: LayersIcon },
  { label: "Type of Article (Original Research / Review etc.)", Icon: LayerIcon },
  { label: "Domain Type (Multidisciplinary / Core etc.)",        Icon: BuildingIcon },
  { label: "Author Type & Additional Author Details",            Icon: UsersIcon },
  { label: "Journal / Venue Name, Publisher & Date",             Icon: BookOpenIcon },
  { label: "Type of Access + Open Access Fee (if applicable)",   Icon: LockIcon },
  { label: "Indexing (Scopus / SCI / UGC etc.)",                 Icon: TagIcon },
  { label: "Quartile (Q1–Q4) — Journal, Book, Book Chapter",    Icon: BarChartIcon },
  { label: "DOI (Digital Object Identifier)",                    Icon: HashIcon },
  { label: "PDF of Paper (max 2 MB, PDF only)",                  Icon: UploadIcon },
  { label: "Publishing Date",                                    Icon: CalendarIcon },
];

const HOW_IT_WORKS = [
  "Keep your published paper PDF (max 2 MB) and all co-author details ready before starting.",
  "Navigate to the Apply tab and fill in all personal and paper details.",
  "Upload the PDF, add DOI, and submit.",
  "Download your submission report PDF immediately after submission.",
  "Search and verify your entry under the Search tab.",
];

/* ── Animated Counter ── */
function useCounter(target, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick); else setVal(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return [ref, val];
}

function StatCard({ target, suffix, label, colorClass, delay }) {
  const [ref, count] = useCounter(target);
  return (
    <div className="stat-card animate-in" ref={ref} style={{ animationDelay: delay }}>
      <div className={`stat-value ${colorClass}`}>{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function LivePapersCard({ delay }) {
  const [count, setCount] = useState(null);
  const ref = useRef(null);
  const animRef = useRef(null);

  const animateTo = (target) => {
    cancelAnimationFrame(animRef.current);
    let start = null;
    const prev = count || 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1000, 1);
      setCount(Math.floor(prev + (target - prev) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) animRef.current = requestAnimationFrame(step); else setCount(target);
    };
    animRef.current = requestAnimationFrame(step);
  };

  const fetchCount = async () => {
    try { const n = await fetchPaperCount(); animateTo(n); } catch {}
  };

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => { clearInterval(id); cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="stat-card animate-in" ref={ref} style={{ animationDelay: delay }}>
      <div className="stat-value orange">{count === null ? "—" : count}</div>
      <div className="stat-label">Papers Registered</div>
    </div>
  );
}

export default function Home({ setPage }) {
  return (
    <div className="home-page">

      {/* Hero */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-badge"><AwardIcon /> Institutional Research Portal</div>
        <h1 className="hero-title" id="hero-heading">
          One Paper. <span className="accent">One Claim.</span><br />Zero Duplicates.
        </h1>
        <p className="hero-subtitle">
          A centralised portal to register, track, and verify faculty research publications
          across JSS Science and Technology University.
        </p>
        <div className="hero-time-note">
          <ClockIcon />
          <span>If all required details are ready, this application takes <strong>5–8 minutes</strong> to complete.</span>
        </div>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage("apply")}>Submit a Paper</button>
          <button className="btn-secondary" onClick={() => setPage("search")}><SearchIcon /> Search Records</button>
        </div>
      </section>

      {/* Info Cards */}
      <div className="info-grid">
        <GlassCard title="Required Fields" className="section-navy">
          <ul className="fields-list">
            {REQUIRED_FIELDS.map(({ label, Icon }) => (
              <li key={label}>
                <span className="field-icon" aria-hidden="true"><Icon /></span>
                {label}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="How It Works" className="section-orange">
          <ol className="step-list">
            {HOW_IT_WORKS.map(s => <li key={s}>{s}</li>)}
          </ol>
          <div style={{ marginTop:"1.2rem", padding:"1rem", background:"rgba(245,110,0,0.07)", borderRadius:"var(--radius-sm)", border:"1px solid rgba(245,110,0,0.12)" }}>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--orange)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:"0.45rem" }}>Before You Begin</p>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.35rem" }}>
              {["Keep the paper PDF ready (max 2 MB, PDF only)","Have co-author name, org, and email handy","Note down the DOI (mandatory)"].map(tip => (
                <li key={tip} style={{ fontSize:"0.83rem", color:"var(--text-secondary)", display:"flex", alignItems:"flex-start", gap:"0.5rem" }}>
                  <span style={{ color:"var(--orange)", fontWeight:700, marginTop:"1px", flexShrink:0 }}>·</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Live Counter */}
      <section className="stats-section">
        <p className="stats-heading">Portal at a Glance</p>
        <div className="stats-grid">
          <StatCard target={1}   suffix=""       label="Paper Per Author"  colorClass="blue"   delay="0s" />
          <LivePapersCard delay="0.1s" />
          <StatCard target={4}   suffix=" Tiers" label="Q1 – Q4 Tracked"   colorClass="blue"   delay="0.2s" />
        </div>
      </section>

      {/* ── Correction / Wrong Entry Note ── */}
      <section className="contact-section" style={{ marginTop:"2rem" }}>
        <div style={{
          background:"linear-gradient(135deg, rgba(245,110,0,0.08), rgba(245,110,0,0.04))",
          border:"1.5px solid rgba(245,110,0,0.25)",
          borderRadius:"var(--radius)",
          padding:"1.5rem 1.8rem",
          backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          boxShadow:"var(--glass-shadow)",
        }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:"1rem" }}>
            <span style={{ width:38, height:38, borderRadius:10, background:"rgba(245,110,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <AlertIcon />
            </span>
            <div>
              <p style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--orange)", marginBottom:"0.3rem" }}>
                Important — Corrections &amp; Wrong Entries
              </p>
              <p style={{ fontSize:"0.88rem", color:"var(--text-secondary)", lineHeight:1.7, margin:0 }}>
                If you have submitted incorrect details or uploaded the wrong file, <strong style={{ color:"var(--text-primary)" }}>you cannot edit your submission directly</strong>.
                Please contact the Office of Dean Research through the given contact details to know the correction process and get your entry amended or withdrawn.
              </p>
              <div style={{ marginTop:"0.85rem", display:"flex", gap:"1.2rem", flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:"0.45rem", fontSize:"0.83rem", color:"var(--text-secondary)" }}>
                  <span style={{ width:28, height:28, borderRadius:8, background:"var(--navy-pale)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <MailIcon />
                  </span>
                  office.deanres@jssstuniv.in
                </span>
                <span style={{ display:"flex", alignItems:"center", gap:"0.45rem", fontSize:"0.83rem", color:"var(--text-secondary)" }}>
                  <span style={{ width:28, height:28, borderRadius:8, background:"var(--navy-pale)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <PhoneIcon />
                  </span>
                  0821 241 1305
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="contact-section" aria-label="Contact information">
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Get in Touch</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">For assistance with paper submissions or portal access, reach out to the Office of Dean Research.</p>
            </div>
            <div className="contact-items">
              <div className="contact-item">
                <span className="contact-icon"><MailIcon /></span>
                office.deanres@jssstuniv.in
              </div>
              <div className="contact-item">
                <span className="contact-icon"><PhoneIcon /></span>
                0821 241 1305
              </div>
              <div className="contact-item">
                <span className="contact-icon"><MapPinIcon /></span>
                JSS Science and Technology University, Mysuru, Karnataka — 570 006
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

    </div>
  );
}
