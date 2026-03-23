import React from "react";
import GlassCard from "../components/GlassCard.jsx";

function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

const SUBSCRIPTIONS = [
  { name:"IEEE Xplore",          type:"Digital Library",     desc:"Access to IEEE journals, conferences, and standards in electrical engineering, computer science, and electronics.",        logoUrl:"https://upload.wikimedia.org/wikipedia/commons/2/21/IEEE_logo.svg", logoText:"IEEE",    logoColor:"#00629B", access:"Full Access" },
  { name:"ACM Digital Library",  type:"Digital Library",     desc:"Comprehensive collection of computing and IT research from the Association for Computing Machinery.",                       logoUrl:"", logoText:"ACM",     logoColor:"#0085CA", access:"Full Access" },
  { name:"Springer Link",        type:"Publisher",           desc:"Scientific, technical, and medical journals, books, and conference proceedings across all disciplines.",                    logoUrl:"", logoText:"Springer", logoColor:"#E2001A", access:"Full Access" },
  { name:"Elsevier ScienceDirect",type:"Publisher",          desc:"Leading platform for peer-reviewed journals and books in science, technology, and medicine.",                               logoUrl:"", logoText:"Elsevier", logoColor:"#FF6900", access:"Full Access" },
  { name:"Wiley Online Library", type:"Publisher",           desc:"Multidisciplinary collection of journals, books, and reference works from John Wiley and Sons.",                           logoUrl:"", logoText:"Wiley",    logoColor:"#003B5C", access:"Full Access" },
  { name:"Scopus",               type:"Abstract & Citation", desc:"The largest abstract and citation database of peer-reviewed literature — journals, books, and conference papers.",          logoUrl:"", logoText:"Scopus",   logoColor:"#E67300", access:"Full Access" },
  { name:"Web of Science",       type:"Citation Index",      desc:"Multidisciplinary research platform covering thousands of peer-reviewed journals with citation analysis tools.",            logoUrl:"", logoText:"WoS",     logoColor:"#5B3C8C", access:"Full Access" },
  { name:"Taylor & Francis",     type:"Publisher",           desc:"Peer-reviewed journals and books across humanities, social sciences, engineering, and STEM disciplines.",                  logoUrl:"", logoText:"T&F",      logoColor:"#005CA5", access:"Partial Access" },
  { name:"JSTOR",                type:"Digital Archive",     desc:"Digital library of academic journals, books, and primary sources with long-term preservation.",                            logoUrl:"", logoText:"JSTOR",   logoColor:"#1A1A1A", access:"Full Access" },
  { name:"ProQuest",             type:"Research Platform",   desc:"Aggregator of dissertations, theses, databases, and periodicals across global research institutions.",                     logoUrl:"", logoText:"PQ",      logoColor:"#0069B4", access:"Full Access" },
  { name:"PubMed / MEDLINE",     type:"Biomedical Database", desc:"Free resource for biomedical and life sciences journal articles maintained by the National Library of Medicine.",          logoUrl:"", logoText:"PubMed",  logoColor:"#326599", access:"Open Access" },
  { name:"arXiv",                type:"Preprint Server",     desc:"Open-access repository for preprints in physics, mathematics, computer science, and related fields.",                      logoUrl:"", logoText:"arXiv",   logoColor:"#B31B1B", access:"Open Access" },
];

const ACCESS_STYLE = {
  "Full Access":    { bg:"rgba(22,163,74,0.1)",   color:"#16a34a", border:"rgba(22,163,74,0.22)" },
  "Partial Access": { bg:"rgba(245,158,11,0.1)",  color:"#d97706", border:"rgba(245,158,11,0.22)" },
  "Open Access":    { bg:"rgba(59,130,246,0.1)",  color:"#2563eb", border:"rgba(59,130,246,0.22)" },
};

/* Logo: tries image first, falls back to brand-colored text */
function SubLogo({ sub }) {
  const [failed, setFailed] = React.useState(false);
  const textStyle = {
    fontFamily: "var(--font)",
    fontWeight: 800,
    fontSize: sub.logoText.length > 5 ? "0.78rem" : sub.logoText.length > 3 ? "0.92rem" : "1.1rem",
    color: sub.logoColor,
    letterSpacing: "-0.01em",
    lineHeight: 1,
    textAlign: "center",
  };

  if (!sub.logoUrl || failed) {
    return <span style={textStyle}>{sub.logoText}</span>;
  }

  return (
    <img
      src={sub.logoUrl}
      alt={sub.name + " logo"}
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}

export default function Subscriptions() {
  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <span className="page-eyebrow" style={{ color: "var(--maroon)" }}>Library Resources</span>
        <h1 className="page-title">College Subscriptions</h1>
        <p className="page-subtitle">
          JSSSTU provides institutional access to the following academic databases and publishers.
          Available on campus and via VPN.
        </p>
      </div>

      <div className="subs-grid">
        {SUBSCRIPTIONS.map((sub) => {
          const ac = ACCESS_STYLE[sub.access] || ACCESS_STYLE["Full Access"];
          return (
            <div className="sub-card" key={sub.name}>
              {/* Logo box — white rounded square, brand text/image inside */}
              <div className="sub-logo-wrap">
                <SubLogo sub={sub} />
              </div>

              <div className="sub-name">{sub.name}</div>

              {/* Type badge — orange like screenshot */}
              <span
                className="sub-type-badge"
                style={{
                  background: "rgba(245,110,0,0.1)",
                  color: "var(--orange)",
                  border: "1px solid rgba(245,110,0,0.25)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  padding: "0.22rem 0.7rem",
                }}
              >
                {sub.type}
              </span>

              <p className="sub-desc">{sub.desc}</p>

              {/* Access badge — green / amber / blue */}
              <div
                className="sub-access"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  color: ac.color,
                  background: ac.bg,
                  border: `1px solid ${ac.border}`,
                  borderRadius: "var(--radius-pill)",
                  padding: "0.22rem 0.85rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  fontFamily: "var(--font)",
                }}
              >
                <CheckIcon />
                {sub.access}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact section */}
      <section className="contact-section">
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Library Access</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">For subscription access issues or off-campus VPN setup, contact the Library or Research Cell.</p>
            </div>
            <div className="contact-items">
              <div className="contact-item">
                <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg></span>
                library@jssstu.edu.in
              </div>
              <div className="contact-item">
                <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                +91 821 2548 400
              </div>
              <div className="contact-item">
                <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                Mysuru, Karnataka — 570 006
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
