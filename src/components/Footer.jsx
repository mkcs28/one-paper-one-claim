import React from "react";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <p className="footer-text">
        &copy; {new Date().getFullYear()} <span>One Paper One Claim</span> &mdash; JSS Science and Technology University Research Portal. All rights reserved.
      </p>
    </footer>
  );
}
