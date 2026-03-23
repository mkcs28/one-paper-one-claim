import React, { useEffect, useState, useRef } from "react";

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function CalIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function pad(n) { return String(n).padStart(2, "0"); }

function formatDate(d) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function StatusBar() {
  const [now, setNow] = useState(new Date());
  const [speed, setSpeed] = useState(null);
  const measuring = useRef(false);

  // Live clock - ticks every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Measure internet speed every 15s
  useEffect(() => {
    const measure = async () => {
      if (measuring.current) return;
      measuring.current = true;
      try {
        const url = `https://www.google.com/favicon.ico?cb=${Date.now()}`;
        const fileSizeBytes = 300;
        const t0 = performance.now();
        await fetch(url, { cache: "no-store", mode: "no-cors" });
        const t1 = performance.now();
        const durationSec = (t1 - t0) / 1000;
        const bps = (fileSizeBytes * 8) / durationSec;
        const mbps = bps / 1_000_000;
        setSpeed(mbps < 1 ? `${(mbps * 1000).toFixed(0)} Kbps` : `${mbps.toFixed(1)} Mbps`);
      } catch {
        setSpeed("Online");
      } finally {
        measuring.current = false;
      }
    };
    measure();
    const id = setInterval(measure, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-bar" aria-label="System status bar">
      <div className="status-item">
        <span className="status-dot" aria-hidden="true" />
        <WifiIcon />
        {speed ?? "Checking…"}
      </div>
      <div className="status-item">
        <CalIcon />
        {formatDate(now)}
      </div>
      <div className="status-item">
        <ClockIcon />
        {formatTime(now)}
      </div>
    </div>
  );
}
