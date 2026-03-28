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
const StarIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const HOST_UNIVERSITY_FULL = "JSS Science and Technology University, Mysuru";

const TYPE_FILTERS = ["All","Journal","Conference","Book Chapter","Book"];
const SORT_OPTIONS = [
  { value:"newest",       label:"Newest First" },
  { value:"oldest",       label:"Oldest First" },
  { value:"journal_asc",  label:"Journal A → Z" },
  { value:"journal_desc", label:"Journal Z → A" },
  { value:"date_asc",     label:"Pub. Date ↑" },
  { value:"date_desc",    label:"Pub. Date ↓" },
];

/* ── Marks Calculator (mirrors Apply.jsx logic) ── */
function calculateMarks(formData) {
  const indexing      = (formData.indexing   || "").toLowerCase();
  const paperType     = (formData.paperType  || "").toLowerCase();
  const quartile      = (formData.quartile   || "").toUpperCase();
  const publisherType = (formData.publisherType || "").toLowerCase();
  const authorType    = (formData.authorType || "");
  const coAuthors     = formData.authors || [];

  const submitterIsJss = !formData.orgSelect || formData.orgSelect === HOST_UNIVERSITY_FULL;
  const jssCoAuthors   = coAuthors.filter(a => {
    const sel = (a.orgSelect || "").trim();
    return sel === "" || sel === HOST_UNIVERSITY_FULL;
  });
  const totalJssAuthors = (submitterIsJss ? 1 : 0) + jssCoAuthors.length;

  const hasIntlCollab = coAuthors.some(a => {
    const ct = (a.collabType || "").toLowerCase();
    const co = (a.country   || "").trim().toLowerCase();
    if (ct === "international") return true;
    if (co && co !== "india") return true;
    return false;
  });
  const intlBonus = hasIntlCollab ? 1 : 0;
  const isScopusWos = ["scopus","sci","scie","esci","web of science"].some(k => indexing.includes(k));

  if (paperType === "journal" && isScopusWos) {
    let basePoints;
    if (["Q1","Q2"].includes(quartile))      basePoints = 5;
    else if (["Q3","Q4"].includes(quartile)) basePoints = 3;
    else                                      basePoints = 3;
    const totalPts = basePoints + intlBonus;
    const isFirstOrCorr = ["First Author","Corresponding Author"].includes(authorType);
    let allocatedPoints;
    if (isFirstOrCorr) {
      allocatedPoints = totalPts;
    } else {
      allocatedPoints = totalJssAuthors > 0 ? totalPts / totalJssAuthors : totalPts;
    }
    return { points: Math.min(parseFloat(allocatedPoints.toFixed(2)), 15), category: "Scopus/WoS Journal" };
  } else if (["conference","book chapter","book"].includes(paperType) && isScopusWos) {
    let basePoints;
    if (paperType === "book") {
      basePoints = publisherType === "international" ? 5 : 4;
    } else {
      basePoints = 2;
    }
    basePoints += intlBonus;
    return { points: Math.min(basePoints, 5), category: "Scopus/WoS Conf/Book" };
  } else {
    return { points: 0, category: "Non-indexed" };
  }
}

/* ── Person Summary Panel ── */
function PersonSummary({ papers, searchName, searchDept }) {
  if (!papers || papers.length === 0) return null;

  const totalMarks = papers.reduce((sum, p) => {
    const m = calculateMarks(p);
    return sum + (m.points || 0);
  }, 0);

  // Use first paper's info for the person profile
  const sample = papers[0];

  return (
    <div style={{marginBottom:"1.5rem"}}>
      {/* Person Card */}
      <div style={{
        background:"linear-gradient(135deg,rgba(22,48,100,0.08),rgba(245,110,0,0.06))",
        border:"1.5px solid rgba(22,48,100,0.15)",
        borderRadius:"var(--radius)",
        padding:"1.25rem 1.5rem",
        marginBottom:"1rem",
        display:"flex",
        alignItems:"center",
        gap:"1.25rem",
        flexWrap:"wrap",
      }}>
        <div style={{
          width:52,height:52,borderRadius:"50%",
          background:"linear-gradient(135deg,var(--navy),var(--orange))",
          display:"flex",alignItems:"center",justifyContent:"center",
          flexShrink:0,
        }}>
          <UserIcon style={{width:26,height:26,stroke:"white"}}/>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26,stroke:"white"}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"1.08rem",fontWeight:700,color:"var(--navy)",marginBottom:"0.2rem",textTransform:"capitalize"}}>
            {sample.name || searchName}
          </div>
          <div style={{fontSize:"0.82rem",color:"var(--text-secondary)",fontWeight:500}}>
            {sample.department || searchDept || "—"} · {sample.designation || "—"}
          </div>
          {sample.email && (
            <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:"0.15rem"}}>{sample.email}</div>
          )}
        </div>
        {/* Total Marks Badge */}
        <div style={{
          textAlign:"center",
          background:"linear-gradient(135deg,rgba(22,163,74,0.12),rgba(22,163,74,0.05))",
          border:"1.5px solid rgba(22,163,74,0.25)",
          borderRadius:"var(--radius-sm)",
          padding:"0.7rem 1.2rem",
          flexShrink:0,
        }}>
          <div style={{fontSize:"0.67rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--green)",marginBottom:"0.2rem"}}>
            Total Marks Scored
          </div>
          <div style={{fontSize:"2rem",fontWeight:800,color:"var(--green)",lineHeight:1}}>
            {totalMarks.toFixed(2)}
          </div>
          <div style={{fontSize:"0.7rem",color:"var(--text-muted)",marginTop:"0.15rem"}}>
            across {papers.length} paper{papers.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Paper List with Individual Marks */}
      <div style={{
        background:"var(--glass-bg)",
        border:"1px solid var(--border)",
        borderRadius:"var(--radius)",
        overflow:"hidden",
      }}>
        <div style={{
          padding:"0.75rem 1.1rem",
          borderBottom:"1px solid var(--border)",
          fontSize:"0.75rem",fontWeight:700,
          textTransform:"uppercase",letterSpacing:"0.06em",
          color:"var(--text-secondary)",
          background:"rgba(22,48,100,0.04)",
          display:"grid",
          gridTemplateColumns:"1fr auto auto",
          gap:"1rem",
        }}>
          <span>Paper</span>
          <span style={{minWidth:80,textAlign:"center"}}>Category</span>
          <span style={{minWidth:70,textAlign:"right"}}>Marks</span>
        </div>
        {papers.map((paper, idx) => {
          const m = calculateMarks(paper);
          return (
            <PaperRow key={paper._id || idx} paper={paper} marks={m} idx={idx} total={papers.length} />
          );
        })}
        {/* Total row */}
        <div style={{
          padding:"0.7rem 1.1rem",
          borderTop:"2px solid var(--border)",
          background:"rgba(22,163,74,0.06)",
          display:"grid",
          gridTemplateColumns:"1fr auto auto",
          gap:"1rem",
          alignItems:"center",
        }}>
          <span style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)"}}>Total</span>
          <span style={{minWidth:80}}/>
          <span style={{
            minWidth:70,textAlign:"right",
            fontSize:"1.05rem",fontWeight:800,color:"var(--green)",
          }}>{totalMarks.toFixed(2)} pts</span>
        </div>
      </div>
    </div>
  );
}

function PaperRow({ paper, marks, idx, total }) {
  const [expanded, setExpanded] = useState(false);
  const isLast = idx === total - 1;

  return (
    <div style={{borderBottom: isLast ? "none" : "1px solid var(--border)"}}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          padding:"0.8rem 1.1rem",
          display:"grid",
          gridTemplateColumns:"1fr auto auto",
          gap:"1rem",
          alignItems:"start",
          cursor:"pointer",
          transition:"background 0.15s",
          background: expanded ? "rgba(245,110,0,0.04)" : "transparent",
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(22,48,100,0.04)"}
        onMouseLeave={e => e.currentTarget.style.background=expanded?"rgba(245,110,0,0.04)":"transparent"}
      >
        <div style={{minWidth:0}}>
          <div style={{
            fontSize:"0.86rem",fontWeight:600,color:"var(--text-primary)",
            marginBottom:"0.25rem",lineHeight:1.35,
          }}>
            {paper.paperTitle}
          </div>
          <div style={{fontSize:"0.75rem",color:"var(--text-muted)",display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
            <span>{paper.paperType}</span>
            {paper.publishingDate && <span>· {paper.publishingDate}</span>}
            <span>· {paper.journal}</span>
            {paper.indexing && <span className="indexing-tag" style={{fontSize:"0.68rem"}}>{paper.indexing}</span>}
            {paper.quartile && <span className={`quartile-badge ${paper.quartile}`} style={{fontSize:"0.68rem",padding:"0 5px"}}>{paper.quartile}</span>}
          </div>
        </div>
        <div style={{
          minWidth:80,textAlign:"center",
          fontSize:"0.72rem",fontWeight:600,
          color: marks.category === "Non-indexed" ? "var(--text-muted)" : "var(--navy-light)",
          padding:"3px 8px",
          background: marks.category === "Non-indexed" ? "transparent" : "rgba(22,48,100,0.07)",
          borderRadius:"var(--radius-pill)",
          alignSelf:"start",
          marginTop:"2px",
        }}>
          {marks.category}
        </div>
        <div style={{
          minWidth:70,textAlign:"right",alignSelf:"start",marginTop:"2px",
          display:"flex",alignItems:"center",gap:"0.3rem",justifyContent:"flex-end",
        }}>
          <span style={{
            fontSize:"1rem",fontWeight:800,
            color: marks.points > 0 ? "var(--green)" : "var(--text-muted)",
          }}>
            {marks.points.toFixed(2)}
          </span>
          <span style={{fontSize:"0.72rem",color:"var(--text-muted)",fontWeight:500}}>pts</span>
          <span style={{marginLeft:4,color:"var(--text-muted)",display:"flex"}}>
            {expanded ? <ChevronUp/> : <ChevronDown/>}
          </span>
        </div>
      </div>

      {/* Expanded application details */}
      {expanded && (
        <div style={{
          padding:"0 1.1rem 1rem 1.1rem",
          background:"rgba(245,110,0,0.03)",
          borderTop:"1px solid rgba(245,110,0,0.1)",
        }}>
          <div className="result-expanded-grid" style={{paddingTop:"0.75rem"}}>
            {paper.ackNumber && <div className="result-expanded-item"><span className="result-expanded-label">Ack. No</span><span className="result-expanded-value" style={{fontWeight:600,color:"var(--navy-light)"}}>{paper.ackNumber}</span></div>}
            {paper.authorType && <div className="result-expanded-item"><span className="result-expanded-label">Author Role</span><span className="result-expanded-value">{paper.authorType}</span></div>}
            {paper.publisher && <div className="result-expanded-item"><span className="result-expanded-label">Publisher</span><span className="result-expanded-value">{paper.publisher}{paper.publisherType && <span style={{marginLeft:"0.4rem",fontSize:"0.72rem",color:"var(--orange)",fontWeight:600}}>({paper.publisherType})</span>}</span></div>}
            {paper.designation && <div className="result-expanded-item"><span className="result-expanded-label">Designation</span><span className="result-expanded-value">{paper.designation}</span></div>}
            {paper.preprintAvailable && <div className="result-expanded-item"><span className="result-expanded-label">Preprint</span><span className="result-expanded-value" style={{color:paper.preprintAvailable==="yes"?"var(--green)":"var(--text-muted)",fontWeight:600,textTransform:"capitalize"}}>{paper.preprintAvailable}</span></div>}
            {paper.doi && (
              <div className="result-expanded-item" style={{gridColumn:"span 2"}}>
                <span className="result-expanded-label">DOI</span>
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link">
                  <LinkIcon/>{paper.doi}
                </a>
              </div>
            )}
            {paper.authors && paper.authors.length > 0 && (
              <div className="result-expanded-item" style={{gridColumn:"span 2"}}>
                <span className="result-expanded-label">Co-Authors</span>
                <span className="result-expanded-value">
                  {paper.authors.map((a,i)=>(
                    <span key={i} style={{display:"block"}}>
                      {a.name}{a.organization ? ` — ${a.organization}` : ""}
                      {a.collabType ? <span style={{marginLeft:"0.4rem",fontSize:"0.7rem",color:"var(--orange)",fontWeight:600}}>({a.collabType})</span> : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {/* Marks breakdown */}
            <div className="result-expanded-item" style={{gridColumn:"span 2",marginTop:"0.35rem"}}>
              <span className="result-expanded-label">Marks</span>
              <span className="result-expanded-value" style={{color:"var(--green)",fontWeight:700,fontSize:"0.9rem"}}>
                {marks.points.toFixed(2)} pts <span style={{fontWeight:400,color:"var(--text-muted)",fontSize:"0.78rem"}}>({marks.category})</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Person Search Modal ── */
function PersonSearchModal({ onClose }) {
  const [name, setName]         = useState("");
  const [dept, setDept]         = useState("");
  const [papers, setPapers]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!name.trim() && !dept.trim()) { setError("Please enter a name or department."); return; }
    setLoading(true); setError(""); setPapers([]); setSearched(false);
    try {
      const data = await fetchPapers({ q: name.trim(), dept: dept.trim() });
      // Filter by name if provided
      const filtered = name.trim()
        ? data.filter(p => p.name?.toLowerCase().includes(name.trim().toLowerCase()))
        : data;
      setPapers(filtered);
      setSearched(true);
    } catch { setError("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:620, textAlign:"left", maxHeight:"90vh", overflowY:"auto", padding:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.1rem" }}>
          <h2 className="modal-title" style={{ margin:0, fontSize:"1.05rem" }}>Person Lookup — Marks & Papers</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1.2rem" }}>✕</button>
        </div>

        <div style={{ display:"flex", gap:"0.6rem", marginBottom:"0.5rem", flexWrap:"wrap" }}>
          <input type="text" className="form-input" style={{ flex:2, minWidth:140 }}
            placeholder="Faculty / Author name"
            value={name} onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={e => e.key==="Enter" && handleSearch()} autoFocus />
          <input type="text" className="form-input" style={{ flex:1, minWidth:120 }}
            placeholder="Department (optional)"
            value={dept} onChange={e => { setDept(e.target.value); setError(""); }}
            onKeyDown={e => e.key==="Enter" && handleSearch()} />
          <button className="btn-primary" onClick={handleSearch} disabled={loading}
            style={{ padding:"0.7rem 1.2rem", whiteSpace:"nowrap", flexShrink:0 }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        {error && (
          <div style={{ padding:"0.65rem 1rem", background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.18)", borderRadius:"var(--radius-sm)", fontSize:"0.83rem", color:"#dc2626", marginBottom:"0.75rem" }}>
            {error}
          </div>
        )}

        {searched && papers.length === 0 && !loading && (
          <div style={{ padding:"1.5rem", textAlign:"center", color:"var(--text-muted)", fontSize:"0.88rem" }}>
            No papers found for this person.
          </div>
        )}

        {papers.length > 0 && (
          <PersonSummary papers={papers} searchName={name} searchDept={dept} />
        )}
      </div>
    </div>
  );
}

/* ── DOI Lookup Modal ── */
function DoiLookupModal({ onClose }) {
  const [input, setInput]   = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading]= useState(false);
  const [error, setError]   = useState("");

  const handleSearch = async () => {
    if (!input.trim()) { setError("Please enter a DOI."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const papers = await fetchPapers({ q: input.trim() });
      const match  = papers.find(p => p.doi && p.doi.toLowerCase() === input.trim().toLowerCase());
      if (match) setResult(match);
      else setError("No paper found with this DOI.");
    } catch { setError("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520, textAlign:"left", maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <h2 className="modal-title" style={{ margin:0, fontSize:"1.05rem" }}>Search by DOI</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1.2rem" }}>✕</button>
        </div>

        <div style={{ display:"flex", gap:"0.6rem", marginBottom:"0.9rem" }}>
          <input type="text" className="form-input" style={{ flex:1 }}
            placeholder="e.g. 10.1109/TMI.2024.1234567"
            value={input} onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key==="Enter" && handleSearch()} autoFocus />
          <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ padding:"0.7rem 1.1rem", whiteSpace:"nowrap" }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        {error && (
          <div style={{ padding:"0.65rem 1rem", background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.18)", borderRadius:"var(--radius-sm)", fontSize:"0.83rem", color:"#dc2626", marginBottom:"0.75rem" }}>
            {error}
          </div>
        )}
        {result && (
          <div style={{ padding:"0.85rem 1rem", background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:"var(--radius-sm)" }}>
            <div style={{ fontSize:"0.88rem", fontWeight:600, color:"var(--text-primary)", marginBottom:"0.35rem" }}>{result.paperTitle}</div>
            {[["Author",result.name],["Type",result.paperType],["Journal",result.journal],["Date",result.publishingDate],["Indexing",result.indexing]].map(([l,v]) => v?.trim() && (
              <div key={l} style={{ display:"flex", gap:"0.5rem", fontSize:"0.79rem", marginBottom:"0.22rem" }}>
                <span style={{ color:"var(--text-muted)", minWidth:65, fontWeight:600 }}>{l}</span>
                <span style={{ color:"var(--text-secondary)" }}>{v}</span>
              </div>
            ))}
            {result.doi && <a href={`https://doi.org/${result.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link" style={{ marginTop:"0.4rem", display:"inline-flex" }}><LinkIcon/>{result.doi}</a>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Result Card (general browse) ── */
function ResultCard({ paper, index }) {
  const [expanded, setExpanded] = useState(false);
  const subDate = paper.createdAt ? new Date(paper.createdAt).toLocaleDateString("en-IN",{dateStyle:"medium"}) : "—";
  const marks = calculateMarks(paper);

  return (
    <GlassCard className="result-card animate-in" style={{ animationDelay:`${Math.min(index%6,5)*0.06}s` }}>
      <div className="result-card-header">
        <h3 className="result-title">{paper.paperTitle}</h3>
        {paper.quartile && <span className={`quartile-badge ${paper.quartile}`}>{paper.quartile}</span>}
      </div>
      <ul className="result-meta-list">
        <li className="result-meta-item"><span className="result-meta-label">Author</span><span className="result-meta-value">{paper.name}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Dept.</span><span className="result-meta-value">{paper.department}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Type</span><span className="result-meta-value">{paper.paperType}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Journal</span><span className="result-meta-value">{paper.journal}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Indexing</span><span className="result-meta-value"><span className="indexing-tag">{paper.indexing}</span></span></li>
        <li className="result-meta-item"><span className="result-meta-label">Published</span><span className="result-meta-value">{paper.publishingDate||"—"}</span></li>
        <li className="result-meta-item"><span className="result-meta-label">Submitted</span><span className="result-meta-value">{subDate}</span></li>
        <li className="result-meta-item">
          <span className="result-meta-label">Marks</span>
          <span className="result-meta-value" style={{color:marks.points>0?"var(--green)":"var(--text-muted)",fontWeight:700}}>
            {marks.points.toFixed(2)} pts
          </span>
        </li>
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
            {paper.authorType && <div className="result-expanded-item"><span className="result-expanded-label">Author Role</span><span className="result-expanded-value">{paper.authorType}</span></div>}
            {paper.ackNumber && <div className="result-expanded-item"><span className="result-expanded-label">Ack. No</span><span className="result-expanded-value" style={{fontWeight:600,color:"var(--navy-light)"}}>{paper.ackNumber}</span></div>}
            {paper.preprintAvailable && <div className="result-expanded-item"><span className="result-expanded-label">Preprint</span><span className="result-expanded-value" style={{color:paper.preprintAvailable==="yes"?"var(--green)":"var(--text-muted)",fontWeight:600,textTransform:"capitalize"}}>{paper.preprintAvailable}</span></div>}
            {paper.doi && <div className="result-expanded-item" style={{gridColumn:"span 2"}}><span className="result-expanded-label">DOI</span><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="result-doi-link"><LinkIcon/>{paper.doi}</a></div>}
            {paper.authors && paper.authors.length>0 && (
              <div className="result-expanded-item" style={{gridColumn:"span 2"}}>
                <span className="result-expanded-label">Co-Authors</span>
                <span className="result-expanded-value">
                  {paper.authors.map((a,i)=><span key={i} style={{display:"block"}}>{a.name}{a.organization?` — ${a.organization}`:""}</span>)}
                </span>
              </div>
            )}
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
  const [draftQuery, setDraftQuery]   = useState("");
  const [query, setQuery]             = useState("");
  const [type, setType]               = useState("All");
  const [dept, setDept]               = useState("All");
  const [sort, setSort]               = useState("newest");
  const [papers, setPapers]           = useState([]);
  const [isDefault, setIsDefault]     = useState(true);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDoiModal, setShowDoiModal]       = useState(false);
  const debounceRef                   = useRef(null);

  const loadLatest = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchLatestPapers();
      setPapers(data); setIsDefault(true);
    } catch { setError("Failed to load papers."); }
    finally { setLoading(false); }
  }, []);

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

      {/* Search + Lookup buttons */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span className="search-icon"><SearchIcon /></span>
          <input type="search" className="form-input search-input"
            placeholder="Search by title, author name, DOI, department, journal…"
            value={draftQuery} onChange={handleQueryChange} aria-label="Search publications" />
        </div>
        {/* Person Marks Lookup */}
        <button className="btn-primary" onClick={() => setShowPersonModal(true)}
          style={{ display:"flex", alignItems:"center", gap:"0.45rem", padding:"0 1.1rem", height:50, borderRadius:"var(--radius-pill)", flexShrink:0, whiteSpace:"nowrap" }}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,stroke:"currentColor"}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Person Lookup</span>
        </button>
        {/* DOI Lookup */}
        <button className="btn-secondary" onClick={() => setShowDoiModal(true)}
          style={{ display:"flex", alignItems:"center", gap:"0.45rem", padding:"0 1.1rem", height:50, borderRadius:"var(--radius-pill)", flexShrink:0, whiteSpace:"nowrap" }}>
          <DoiIcon /> <span className="doi-btn-text">DOI Lookup</span>
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
              <div className="contact-item"><span className="contact-icon"><MapPinIcon /></span>Mysuru, Karnataka — 570 006</div>
            </div>
          </div>
        </GlassCard>
      </section>

      {showPersonModal && <PersonSearchModal onClose={() => setShowPersonModal(false)} />}
      {showDoiModal    && <DoiLookupModal    onClose={() => setShowDoiModal(false)} />}
    </div>
  );
}
