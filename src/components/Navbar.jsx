import React from "react";

const NAV_ITEMS = [
  { key: "home",          label: "Home",          activeClass: "home-active" },
  { key: "apply",         label: "Apply",         activeClass: "apply-active" },
  { key: "search",        label: "Search",        activeClass: "search-active" },
  { key: "policy",        label: "Policy",        activeClass: "policy-active" },
  { key: "subscriptions", label: "Subscriptions", activeClass: "subscriptions-active" },
  { key: "contact",       label: "Contact",       activeClass: "contact-active" },
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

export default function Navbar({ page, setPage, dark, setDark }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">

        {/* LEFT — logo only */}
        <button className="navbar-brand" onClick={() => setPage("home")} aria-label="Go to homepage">
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

        {/* CENTER — nav pills */}
        <ul className="navbar-nav" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`nav-btn ${page === item.key ? `active ${item.activeClass}` : ""}`}
                onClick={() => setPage(item.key)}
                aria-current={page === item.key ? "page" : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* RIGHT — dark mode toggle */}
        <div className="navbar-controls">
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

      </div>
    </nav>
  );
}
