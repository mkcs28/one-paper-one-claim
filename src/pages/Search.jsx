import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { fetchPapers } from "../api.js";

/* ── Icons ── */
const SearchIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const InboxIcon   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const ChevronDown = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUp   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const LinkIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const MailIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const PhoneIcon   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const TYPE_FILTERS = ["All", "Journal", "Conference", "Book Chapter", "Book"];

/* ── Expandable Result Card ── */
function ResultCard({ paper, index }) {
  const [expanded, setExpanded] = useState(false);

  const submittedDate = paper.createdAt
    ? new Date(paper.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
    : "—";

  return (
    <GlassCard className="result-card animate-in" style={{ animationDelay: `${Math.min(index % 6, 5) * 0.06}s` }}>
      <div className="result-card-header">
        <h3 className="result-title">{paper.paperTitle}</h3>
        {paper.quartile && (
          <span className={`quartile-badge ${paper.quartile}`}>{paper.quartile}</span>
        )}
      </div>

      <ul className="result-meta-list">
        <li className="result-meta-item">
          <span className="result-meta-label">Author</span>
          <span className="result-meta-value">{paper.prefix} {paper.name}</span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Dept.</span>
          <span className="result-meta-value">{paper.department}</span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Type</span>
          <span className="result-meta-value">
            {paper.paperType}
            {paper.articleType && <span style={{ color: "var(--text-muted)", marginLeft: "0.35rem" }}>· {paper.articleType}</span>}
          </span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Journal</span>
          <span className="result-meta-value">{paper.journal}</span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Indexing</span>
          <span className="result-meta-value"><span className="indexing-tag">{paper.indexing}</span></span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Published</span>
          <span className="result-meta-value">{paper.publishingDate || "—"}</span>
        </li>
        <li className="result-meta-item">
          <span className="result-meta-label">Submitted</span>
          <span className="result-meta-value">{submittedDate}</span>
        </li>
      </ul>

      <button
        className="result-expand-btn"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span>{expanded ? "Hide Details" : "View Details"}</span>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {expanded && (
        <div className="result-expanded animate-in">
          <div className="result-expanded-grid">
            {paper.empId && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Employee ID</span>
                <span className="result-expanded-value">{paper.empId}</span>
              </div>
            )}
            {paper.designation && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Designation</span>
                <span className="result-expanded-value">{paper.designation}</span>
              </div>
            )}
            {paper.publisher && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Publisher</span>
                <span className="result-expanded-value">{paper.publisher}</span>
              </div>
            )}
            {paper.domainType && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Domain</span>
                <span className="result-expanded-value">{paper.domainType}</span>
              </div>
            )}
            {paper.accessType && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Access</span>
                <span className="result-expanded-value">
                  {paper.accessType}
                  {paper.accessType === "Open Access" && paper.openAccessAmount &&
                    <span style={{ marginLeft: "0.4rem", color: "var(--orange)", fontWeight: 600 }}>
                      (₹{Number(paper.openAccessAmount).toLocaleString("en-IN")})
                    </span>
                  }
                </span>
              </div>
            )}
            {paper.authorType && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Author Role</span>
                <span className="result-expanded-value">{paper.authorType}</span>
              </div>
            )}
            {paper.ackNumber && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Ack. No</span>
                <span className="result-expanded-value" style={{ fontWeight: 600, color: "var(--navy-light)" }}>{paper.ackNumber}</span>
              </div>
            )}
            {paper.preprintAvailable && (
              <div className="result-expanded-item">
                <span className="result-expanded-label">Preprint</span>
                <span className="result-expanded-value" style={{ color: paper.preprintAvailable === "yes" ? "var(--green)" : "var(--text-muted)", fontWeight: 600, textTransform: "capitalize" }}>
                  {paper.preprintAvailable}
                </span>
              </div>
            )}
            {paper.doi && (
              <div className="result-expanded-item" style={{ gridColumn: "span 2" }}>
                <span className="result-expanded-label">DOI</span>
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link">
                  <LinkIcon /> {paper.doi}
                </a>
              </div>
            )}
            {paper.authors && paper.authors.length > 0 && (
              <div className="result-expanded-item" style={{ gridColumn: "span 2" }}>
                <span className="result-expanded-label">Co-Authors</span>
                <span className="result-expanded-value">
                  {paper.authors.map((a, i) => (
                    <span key={i} style={{ display: "block" }}>
                      {a.prefix} {a.name}{a.organization ? ` — ${a.organization}` : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

/* ── Skeleton loader ── */
function SkeletonCard() {
  return (
    <div className="glass-card" style={{ opacity: 0.6 }}>
      {[100, 65, 80, 55, 70].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w}%`, background: "var(--border)", borderRadius: 6, marginBottom: 10, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export default function Search() {
  const [query, setQuery]     = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [type, setType]       = useState("All");
  const [dept, setDept]       = useState("All");
  const [papers, setPapers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const debounceRef           = useRef(null);

  /* Fetch from backend */
  const load = useCallback(async (q = "", t = "All", d = "All") => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPapers({ q, type: t, dept: d });
      setPapers(data);
    } catch {
      setError("Failed to load papers. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => { load(); }, [load]);

  /* Debounced search query */
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setDraftQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      load(val, type, dept);
    }, 400);
  };

  /* Filter change — immediate */
  const handleTypeChange = (t) => {
    setType(t);
    load(query, t, dept);
  };

  const handleDeptChange = (d) => {
    setDept(d);
    load(query, type, d);
  };

  /* Derive unique departments from loaded papers */
  const departments = useMemo(() => {
    const depts = [...new Set(papers.map(p => p.department).filter(Boolean))].sort();
    return ["All", ...depts];
  }, [papers]);

  return (
    <div className="search-page">
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
      `}</style>

      <div className="page-header">
        <span className="page-eyebrow">Publication Records</span>
        <h1 className="page-title">Search Publications</h1>
        <p className="page-subtitle">Live database search — results update as you type. Click a card to expand full details.</p>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrap" style={{ display: "flex", gap: "0.75rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span className="search-icon"><SearchIcon /></span>
          <input
            type="search"
            className="form-input search-input"
            placeholder="Search by title, author, department, journal, DOI, emp ID…"
            value={draftQuery}
            onChange={handleQueryChange}
            aria-label="Search publications"
          />
        </div>
        <button
          className="btn-secondary"
          onClick={() => load(query, type, dept)}
          aria-label="Refresh results"
          style={{ padding: "0 1.2rem", height: 50, borderRadius: "var(--radius-pill)", flexShrink: 0 }}
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Type filter */}
      <div className="filter-row" role="group" aria-label="Filter by paper type">
        <span className="filter-label">Type:</span>
        {TYPE_FILTERS.map(f => (
          <button key={f} className={`filter-chip ${type === f ? "active" : ""}`} onClick={() => handleTypeChange(f)} aria-pressed={type === f}>{f}</button>
        ))}
      </div>

      {/* Department filter — only once data loaded */}
      {!loading && departments.length > 2 && (
        <div className="filter-row" role="group" aria-label="Filter by department">
          <span className="filter-label">Dept:</span>
          {departments.map(d => (
            <button key={d} className={`filter-chip ${dept === d ? "active" : ""}`} onClick={() => handleDeptChange(d)} aria-pressed={dept === d}>{d}</button>
          ))}
        </div>
      )}

      {/* Results meta */}
      {!loading && !error && (
        <p className="results-meta" aria-live="polite">
          Showing <strong>{papers.length}</strong> record{papers.length !== 1 ? "s" : ""}
          {(query || type !== "All" || dept !== "All") && " (filtered)"}
          {" · "}
          <span style={{ color: "var(--green)", fontSize: "0.75rem", fontWeight: 600 }}>Live from database</span>
        </p>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding: "1.2rem 1.5rem", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "var(--radius-sm)", color: "#dc2626", fontSize: "0.88rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700 }}>Error:</span> {error}
          <button className="btn-secondary" onClick={() => load(query, type, dept)} style={{ marginLeft: "auto", padding: "0.35rem 0.9rem", fontSize: "0.8rem" }}>Retry</button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="results-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && papers.length === 0 && (
        <div className="no-results" role="status">
          <div className="no-results-icon"><InboxIcon /></div>
          <h3>No papers found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && papers.length > 0 && (
        <div className="results-grid">
          {papers.map((p, i) => <ResultCard key={p._id || p.id} paper={p} index={i} />)}
        </div>
      )}

      {/* Contact section */}
      <section className="contact-section">
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Get in Touch</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">For portal access or record queries, reach out to the Research Cell.</p>
            </div>
            <div className="contact-items">
              <div className="contact-item"><span className="contact-icon"><MailIcon /></span>research@jssstuniv.in</div>
              <div className="contact-item"><span className="contact-icon"><PhoneIcon /></span>+91 821 2548 400</div>
              <div className="contact-item"><span className="contact-icon"><MapPinIcon /></span>Mysuru, Karnataka — 570 006</div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
