import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { fetchPapers, fetchLatestPapers } from "../api.js";

/* ── Icons ── */
const SearchIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const InboxIcon   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const ChevronDown = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUp   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const LinkIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const DoiIcon     = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6M11 8v6"/></svg>;
const SortIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const UserIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const MailIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
const PhoneIcon   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const TYPE_FILTERS = ["All","Journal","Conference","Book Chapter","Book"];

const SORT_OPTIONS = [
  { value:"newest",       label:"Newest First" },
  { value:"oldest",       label:"Oldest First" },
  { value:"journal_asc",  label:"Journal A → Z" },
  { value:"journal_desc", label:"Journal Z → A" },
  { value:"date_asc",     label:"Pub. Date ↑" },
  { value:"date_desc",    label:"Pub. Date ↓" },
];

/* ── DOI / Name lookup modal ── */
function LookupModal({ onClose }) {
  const [tab, setTab]       = useState("doi");
  const [input, setInput]   = useState("");
  const [result, setResult] = useState(null);
  const [results, setResults]= useState([]);
  const [loading, setLoading]= useState(false);
  const [error, setError]   = useState("");

  const handleSearch = async () => {
    if (!input.trim()) { setError("Please enter a value."); return; }
    setLoading(true); setError(""); setResult(null); setResults([]);
    try {
      const papers = await fetchPapers({ q: input.trim() });
      if (tab === "doi") {
        const match = papers.find(p => p.doi && p.doi.toLowerCase() === input.trim().toLowerCase());
        if (match) setResult(match);
        else setError("No paper found with this DOI.");
      } else {
        const matches = papers.filter(p => p.name?.toLowerCase().includes(input.trim().toLowerCase()));
        if (matches.length) setResults(matches);
        else setError("No papers found for this author name.");
      }
    } catch { setError("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  const MiniCard = ({ paper }) => (
    <div style={{ padding:"0.85rem 1rem", background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:"var(--radius-sm)", marginBottom:"0.6rem" }}>
      <div style={{ fontSize:"0.88rem", fontWeight:600, color:"var(--text-primary)", marginBottom:"0.35rem" }}>{paper.paperTitle}</div>
      {[["Author",`${paper.prefix||""} ${paper.name}`],["Type",paper.paperType],["Journal",paper.journal],["Date",paper.publishingDate],["Indexing",paper.indexing]].map(([l,v]) => v?.trim() && (
        <div key={l} style={{ display:"flex", gap:"0.5rem", fontSize:"0.79rem", marginBottom:"0.22rem" }}>
          <span style={{ color:"var(--text-muted)", minWidth:65, fontWeight:600 }}>{l}</span>
          <span style={{ color:"var(--text-secondary)" }}>{v}</span>
        </div>
      ))}
      {paper.doi && <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link" style={{ marginTop:"0.4rem", display:"inline-flex" }}><LinkIcon />{paper.doi}</a>}
    </div>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520, textAlign:"left", maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <h2 className="modal-title" style={{ margin:0, fontSize:"1.05rem" }}>Quick Lookup</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1.2rem" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
          {[{key:"doi",label:"Search by DOI"},{key:"name",label:"Search by Author Name"}].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setInput(""); setError(""); setResult(null); setResults([]); }}
              style={{ padding:"0.35rem 0.9rem", borderRadius:"var(--radius-pill)", border:"1.5px solid", cursor:"pointer", fontFamily:"var(--font)", fontSize:"0.78rem", fontWeight:600, transition:"all 0.2s",
                borderColor: tab===t.key ? "var(--orange)" : "var(--border)",
                background:  tab===t.key ? "rgba(245,110,0,0.1)" : "var(--glass-bg)",
                color:       tab===t.key ? "var(--orange)" : "var(--text-secondary)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:"0.6rem", marginBottom:"0.9rem" }}>
          <input type="text" className="form-input" style={{ flex:1 }}
            placeholder={tab==="doi" ? "e.g. 10.1109/TMI.2024.1234567" : "Enter author name"}
            value={input} onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key==="Enter" && handleSearch()} autoFocus />
          <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ padding:"0.7rem 1.1rem", whiteSpace:"nowrap" }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        {error && <div style={{ padding:"0.65rem 1rem", background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.18)", borderRadius:"var(--radius-sm)", fontSize:"0.83rem", color:"#dc2626", marginBottom:"0.75rem" }}>{error}</div>}
        {result && <MiniCard paper={result} />}
        {results.map((p,i) => <MiniCard key={i} paper={p} />)}
      </div>
    </div>
  );
}

/* ── Result Card — APC hidden ── */
function ResultCard({ paper, index }) {
  const [expanded, setExpanded] = useState(false);
  const subDate = paper.createdAt ? new Date(paper.createdAt).toLocaleDateString("en-IN",{dateStyle:"medium"}) : "—";

  return (
    <GlassCard className="result-card animate-in" style={{ animationDelay:`${Math.min(index%6,5)*0.06}s` }}>
      <div className="result-card-header">
        <h3 className="result-title">{paper.paperTitle}</h3>
        {paper.quartile && <span className={`quartile-badge ${paper.quartile}`}>{paper.quartile}</span>}
      </div>
      <ul className="result-meta-list">
        <li className="result-meta-item"><span className="result-meta-label">Author</span><span className="result-meta-value">{paper.prefix} {paper.name}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Dept.</span><span className="result-meta-value">{paper.department}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Type</span><span className="result-meta-value">{paper.paperType}{paper.articleType && <span style={{color:"var(--text-muted)",marginLeft:"0.35rem"}}>· {paper.articleType}</span>}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Journal</span><span className="result-meta-value">{paper.journal}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Indexing</span><span className="result-meta-value"><span className="indexing-tag">{paper.indexing}</span></span></li>
        <li className="result-meta-item"><span className="result-meta-label">Published</span><span className="result-meta-value">{paper.publishingDate||"—"}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Submitted</span><span className="result-meta-value">{subDate}</span></li>
      </ul>

      <button className="result-expand-btn" onClick={() => setExpanded(v=>!v)} aria-expanded={expanded}>
        <span>{expanded?"Hide Details":"View Details"}</span>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {expanded && (
        <div className="result-expanded animate-in">
          <div className="result-expanded-grid">
            {paper.designation && <div className="result-expanded-item"><span className="result-expanded-label">Designation</span><span className="result-expanded-value">{paper.designation}</span></div>}
            {paper.publisher && <div className="result-expanded-item"><span className="result-expanded-label">Publisher</span><span className="result-expanded-value">{paper.publisher}{paper.publisherType && <span style={{marginLeft:"0.4rem",fontSize:"0.72rem",color:"var(--orange)",fontWeight:600}}>({paper.publisherType})</span>}</span></div>}
            {paper.domainType && <div className="result-expanded-item"><span className="result-expanded-label">Domain</span><span className="result-expanded-value">{paper.domainType}</span></div>}
            {/* APC intentionally hidden */}
            {paper.accessType && <div className="result-expanded-item"><span className="result-expanded-label">Access</span><span className="result-expanded-value">{paper.accessType}</span></div>}
            {paper.authorType && <div className="result-expanded-item"><span className="result-expanded-label">Author Role</span><span className="result-expanded-value">{paper.authorType}</span></div>}
            {paper.ackNumber && <div className="result-expanded-item"><span className="result-expanded-label">Ack. No</span><span className="result-expanded-value" style={{fontWeight:600,color:"var(--navy-light)"}}>{paper.ackNumber}</span></div>}
            {paper.preprintAvailable && <div className="result-expanded-item"><span className="result-expanded-label">Preprint</span><span className="result-expanded-value" style={{color:paper.preprintAvailable==="yes"?"var(--green)":"var(--text-muted)",fontWeight:600,textTransform:"capitalize"}}>{paper.preprintAvailable}</span></div>}
            {paper.doi && <div className="result-expanded-item" style={{gridColumn:"span 2"}}><span className="result-expanded-label">DOI</span><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link"><LinkIcon />{paper.doi}</a></div>}
            {paper.authors && paper.authors.length>0 && <div className="result-expanded-item" style={{gridColumn:"span 2"}}><span className="result-expanded-label">Co-Authors</span><span className="result-expanded-value">{paper.authors.map((a,i)=><span key={i} style={{display:"block"}}>{a.prefix} {a.name}{a.organization?` — ${a.organization}`:""}</span>)}</span></div>}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card" style={{opacity:0.5}}>
      {[100,65,80,55,70].map((w,i)=>(
        <div key={i} style={{height:12,width:`${w}%`,background:"var(--border)",borderRadius:6,marginBottom:10,animation:"pulse 1.4s ease-in-out infinite",animationDelay:`${i*0.1}s`}}/>
      ))}
    </div>
  );
}

export default function Search() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery]           = useState("");
  const [type, setType]             = useState("All");
  const [dept, setDept]             = useState("All");
  const [sort, setSort]             = useState("newest");
  const [papers, setPapers]         = useState([]);
  const [isDefault, setIsDefault]   = useState(true); // showing latest 6
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showModal, setShowModal]   = useState(false);
  const debounceRef                 = useRef(null);

  /* Load latest 6 on mount */
  const loadLatest = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLatestPapers();
      setPapers(data);
      setIsDefault(true);
    } catch { setError("Failed to load papers."); }
    finally { setLoading(false); }
  }, []);

  /* Full search */
  const loadAll = useCallback(async (q="", t="All", d="All", s="newest") => {
    setLoading(true); setError(""); setIsDefault(false);
    try {
      const data = await fetchPapers({ q, type:t, dept:d, sort:s });
      setPapers(data);
    } catch { setError("Failed to load papers."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLatest(); }, [loadLatest]);

  const handleQueryChange = e => {
    const val = e.target.value;
    setDraftQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      debounceRef.current = setTimeout(() => { setQuery(""); loadLatest(); }, 400);
    } else {
      debounceRef.current = setTimeout(() => { setQuery(val); loadAll(val, type, dept, sort); }, 400);
    }
  };

  const handleTypeChange = t => { setType(t); loadAll(query, t, dept, sort); };
  const handleDeptChange = d => { setDept(d); loadAll(query, type, d, sort); };
  const handleSortChange = s => { setSort(s); loadAll(query, type, dept, s); };

  const departments = useMemo(() => {
    const depts = [...new Set(papers.map(p=>p.department).filter(Boolean))].sort();
    return ["All",...depts];
  }, [papers]);

  return (
    <div className="search-page">
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div className="page-header">
        <span className="page-eyebrow">Publication Records</span>
        <h1 className="page-title">Search Publications</h1>
        <p className="page-subtitle">
          {isDefault
            ? "Showing latest 6 submissions. Search to find specific papers."
            : "Live database search — results update as you type."}
        </p>
      </div>

      {/* Search + Lookup + Refresh */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span className="search-icon"><SearchIcon /></span>
          <input type="search" className="form-input search-input"
            placeholder="Search by title, author name, DOI, department, journal…"
            value={draftQuery} onChange={handleQueryChange} aria-label="Search publications" />
        </div>
        <button className="btn-secondary" onClick={() => setShowModal(true)}
          style={{ display:"flex", alignItems:"center", gap:"0.45rem", padding:"0 1.1rem", height:50, borderRadius:"var(--radius-pill)", flexShrink:0, whiteSpace:"nowrap" }}>
          <DoiIcon /> <span className="doi-btn-text">Quick Lookup</span>
        </button>
      </div>

      {/* Sort selector */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"0.35rem", fontSize:"0.77rem", color:"var(--text-muted)", fontWeight:500 }}>
          <SortIcon /> Sort:
        </span>
        <select className="form-select" value={sort} onChange={e => handleSortChange(e.target.value)}
          style={{ width:"auto", padding:"0.3rem 2.2rem 0.3rem 0.75rem", fontSize:"0.8rem", height:"auto", borderRadius:"var(--radius-pill)" }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Type filter */}
      <div className="filter-row" role="group" aria-label="Filter by type">
        <span className="filter-label">Type:</span>
        {TYPE_FILTERS.map(f => (
          <button key={f} className={`filter-chip ${type===f?"active":""}`} onClick={() => handleTypeChange(f)} aria-pressed={type===f}>{f}</button>
        ))}
      </div>

      {/* Dept filter */}
      {!loading && departments.length > 2 && (
        <div className="filter-row" role="group" aria-label="Filter by department">
          <span className="filter-label">Dept:</span>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {departments.map(d => (
              <button key={d} className={`filter-chip ${dept===d?"active":""}`} onClick={() => handleDeptChange(d)} aria-pressed={dept===d}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {/* Results meta */}
      {!loading && !error && (
        <p className="results-meta" aria-live="polite">
          {isDefault
            ? <><strong>{papers.length}</strong> latest submissions · <span style={{color:"var(--orange)",fontSize:"0.75rem",fontWeight:600}}>Search to see all</span></>
            : <><strong>{papers.length}</strong> record{papers.length!==1?"s":""}{(query||type!=="All"||dept!=="All")&&" (filtered)"} · <span style={{color:"var(--green)",fontSize:"0.75rem",fontWeight:600}}>Live from database</span></>
          }
        </p>
      )}

      {error && (
        <div style={{ padding:"1rem 1.2rem", background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.18)", borderRadius:"var(--radius-sm)", color:"#dc2626", fontSize:"0.87rem", marginBottom:"1.4rem", display:"flex", alignItems:"center", gap:"0.75rem" }}>
          <span style={{fontWeight:700}}>Error:</span>{error}
          <button className="btn-secondary" onClick={loadLatest} style={{ marginLeft:"auto", padding:"0.32rem 0.85rem", fontSize:"0.78rem" }}>Retry</button>
        </div>
      )}

      {loading && <div className="results-grid">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}</div>}

      {!loading && !error && papers.length===0 && (
        <div className="no-results" role="status">
          <div className="no-results-icon"><InboxIcon /></div>
          <h3>No papers found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      )}

      {!loading && !error && papers.length>0 && (
        <div className="results-grid">
          {papers.map((p,i) => <ResultCard key={p._id||p.id} paper={p} index={i}/>)}
        </div>
      )}

      {/* Contact */}
      <section className="contact-section">
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Get in Touch</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">For portal access or record queries, contact the Office of Dean Research.</p>
            </div>
            <div className="contact-items">
              <div className="contact-item"><span className="contact-icon"><MailIcon /></span>office.deanres@jssstuniv.in</div>
              <div className="contact-item"><span className="contact-icon"><PhoneIcon /></span>0821 241 1305</div>
              <div className="contact-item"><span className="contact-icon"><MapPinIcon /></span>JSS Science and Technology University, Mysuru, Karnataka — 570 006</div>
            </div>
          </div>
        </GlassCard>
      </section>

      {showModal && <LookupModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
