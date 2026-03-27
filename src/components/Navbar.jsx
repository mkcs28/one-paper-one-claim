import React, { useState, useEffect, useRef } from "react";

const NAV_ITEMS = [
  { key: "home",          label: "Home",          activeClass: "home-active",          emoji: "🏠" },
  { key: "apply",         label: "Apply",         activeClass: "apply-active",         emoji: "📝" },
  { key: "search",        label: "Search",        activeClass: "search-active",        emoji: "🔍" },
  { key: "policy",        label: "Policy",        activeClass: "policy-active",        emoji: "📋" },
  { key: "subscriptions", label: "Subscriptions", activeClass: "subscriptions-active", emoji: "📚" },
  { key: "contact",       label: "Contact",       activeClass: "contact-active",       emoji: "✉️"  },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: 20, height: 20, stroke: "var(--text-primary)", display:"block" }}>
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </>
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="17" x2="21" y2="17"/>
        </>
      )}
    </svg>
  );
}

export default function Navbar({ page, setPage, dark, setDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (
        menuOpen &&
        menuRef.current && !menuRef.current.contains(e.target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleNav = (key) => {
    setPage(key);
    setMenuOpen(false);
  };

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 620) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">

          <button className="navbar-brand" onClick={() => handleNav("home")} aria-label="Go to homepage">
            <img
              src="/logo.png"
              alt="One Paper One Claim"
              className="navbar-logo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                document.getElementById("nav-logo-fb").style.display = "flex";
              }}
            />
            <span id="nav-logo-fb" className="navbar-logo-fallback" style={{ display: "none" }}>1P</span>
          </button>

          <ul className="navbar-nav" role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <button
                  className={`nav-btn ${page === item.key ? `active ${item.activeClass}` : ""}`}
                  onClick={() => handleNav(item.key)}
                  aria-current={page === item.key ? "page" : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="navbar-controls">
            <button
              className="theme-toggle"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              ref={hamburgerRef}
              className="hamburger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>

        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div
        ref={menuRef}
        className={"mobile-menu" + (menuOpen ? " mobile-menu--open" : "")}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 18, height: 18, stroke: "var(--text-secondary)" }}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <ul className="mobile-nav-list" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={"mobile-nav-btn" + (page === item.key ? ` active ${item.activeClass}` : "")}
                onClick={() => handleNav(item.key)}
                aria-current={page === item.key ? "page" : undefined}
              >
                <span className="mobile-nav-emoji" aria-hidden="true">{item.emoji}</span>
                <span>{item.label}</span>
                {page === item.key && <span className="mobile-nav-chevron" aria-hidden="true">●</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
