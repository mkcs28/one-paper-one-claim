import React from "react";
import GlassCard from "../components/GlassCard.jsx";

const POLICIES = [
  {
    title: "One Paper One Claim Rule",
    body: "Each faculty member may register only one unique research paper per submission cycle. Duplicate entries for the same paper — regardless of author order — will be automatically rejected. This ensures fair representation and accurate institutional records.",
  },
  {
    title: "Eligibility",
    body: "Submissions are open to all full-time faculty, visiting faculty, and registered research scholars of JSS Science and Technology University. The paper must be published in a peer-reviewed journal, conference, book chapter, or book recognized by the portal.",
    points: [
      "The submitting author must be affiliated with JSSSTU at the time of publication.",
      "Retired or transferred faculty must obtain prior approval from the Research Cell.",
      "Student publications without faculty co-authorship are not eligible.",
    ],
  },
  {
    title: "Accepted Paper Types",
    body: "The portal accepts the following categories of scholarly work:",
    points: [
      "Journal articles indexed in Scopus, SCI, SCIE, ESCI, UGC Care, or Web of Science.",
      "Conference papers presented at IEEE, ACM, Springer, or equivalent recognized venues.",
      "Book chapters published by Springer, Elsevier, Wiley, CRC Press, or equivalent.",
      "Books published by reputed publishers with an ISBN.",
    ],
  },
  {
    title: "Document Requirements",
    body: "Applicants must upload a PDF copy of the accepted/published paper. The file must not exceed 2 MB in size. The PDF should clearly display the journal name, ISSN/ISBN, volume, issue, and page numbers where applicable.",
  },
  {
    title: "Co-Author Policy",
    body: "When the submitting author is listed as a Co-Author, full details of all co-authors including name, department, organization, contact, and email must be provided. Co-authors from other institutions are accepted, but at least one author must be from JSSSTU.",
  },
  {
    title: "Indexing & Quartile",
    body: "Quartile information (Q1–Q4) is mandatory for Journal, Book Chapter, and Book submissions. Conference submissions are exempt from quartile classification. Indexing must be verified against the latest official databases before submission.",
  },
  {
    title: "Data Accuracy & Responsibility",
    body: "The submitting author is solely responsible for the accuracy of all information provided. False or misleading entries may result in disqualification and disciplinary action as per university norms. The Research Cell reserves the right to verify any submission at any time.",
  },
  {
    title: "Amendment & Withdrawal",
    body: "Once submitted, entries cannot be edited directly. To amend or withdraw a submission, please contact the Research Cell with your Employee ID and paper title. Amendments are processed within 5 working days.",
  },
  {
    title: "Privacy & Data Usage",
    body: "All data collected through this portal is used solely for institutional research tracking and reporting. Personal information such as contact numbers and email addresses will not be shared with third parties. Data is stored securely and retained as per university data governance policy.",
  },
];

export default function Policy() {
  return (
    <div className="policy-page">
      <div className="page-header">
        <span className="page-eyebrow">Portal Guidelines</span>
        <h1 className="page-title">Submission Policy</h1>
        <p className="page-subtitle">Please read and understand all policies before submitting your publication.</p>
      </div>

      <GlassCard>
        {POLICIES.map((p, i) => (
          <div className="policy-section" key={i}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            {p.points && (
              <ul>
                {p.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
            )}
          </div>
        ))}
      </GlassCard>

      {/* Contact section */}
      <section className="contact-section">
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Policy Queries</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">For clarifications on submission policies, reach out to the Research Cell.</p>
            </div>
            <div className="contact-items">
              <div className="contact-item">
                <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg></span>
                office.deanres@jssstuniv.in
              </div>
              <div className="contact-item">
                <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                0821 241 1305
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
