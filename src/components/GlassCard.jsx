import React from "react";

export default function GlassCard({ children, title, className = "" }) {
  return (
    <div className={`glass-card ${className}`}>
      {title && <h3 className="glass-card-title">{title}</h3>}
      {children}
    </div>
  );
}
