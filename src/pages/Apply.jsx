import React, { useState, useRef } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { submitPaper } from "../api.js";

/* ── Constants ── */
const PREFIXES           = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const PAPER_TYPES        = ["Journal", "Conference", "Book Chapter", "Book"];
const AUTHOR_TYPES       = ["First Author", "Co-Author", "Corresponding Author"];
const COAUTHOR_TYPES     = ["First Author", "Co-Author", "Corresponding Author"];
const COLLAB_TYPES       = ["National", "International"];
const DEPARTMENTS        = ["Computer Science","Information Technology","Electronics & Communication","Electrical Engineering","Mechanical Engineering","Civil Engineering","Management Studies","Basic Sciences","Other"];
const DESIGNATIONS       = ["Professor","Associate Professor","Assistant Professor","Lecturer","Research Scholar","Other"];
const INDEXING_OPTS      = ["Scopus","SCI","SCIE","ESCI","UGC Care","Web of Science","PubMed","IEEE Xplore","Other"];
const QUARTILES          = ["Q1","Q2","Q3","Q4"];
const QUARTILE_TYPES     = ["Journal","Book Chapter","Book"];
const ACCESS_TYPES       = ["Open Access","Restricted Access","Hybrid"];
const ACCESS_PAPER_TYPES = ["Journal","Book Chapter","Book"];
const BOOK_TYPES         = ["Book Chapter","Book"];
const PUBLISHER_TYPES    = ["National","International"];
const MAX_AUTHORS        = 8;
const DOMAIN_TYPES       = ["Multidisciplinary","Interdisciplinary","Core / Specific Discipline","Engineering & Technology","Medical & Life Sciences","Social Sciences & Humanities","Natural Sciences","Management & Commerce","Other"];
const ARTICLE_TYPES      = ["Original Research","Review Article","Survey","Case Study","Technical Note","Short Communication","Letter to Editor","Conference Paper","Book Chapter","Systematic Review","Meta-Analysis","Other"];

const HOST_UNIVERSITY    = "JSS Science and Technology University";
const HOST_UNIVERSITY_FULL = "JSS Science and Technology University, Mysuru";
const ORG_OPTIONS        = [HOST_UNIVERSITY_FULL, "Others"];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina",
  "Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada",
  "Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia",
  "Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece",
  "Guatemala","Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Timor-Leste","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela",
  "Vietnam","Yemen","Zambia","Zimbabwe"
];

const EMPTY_AUTHOR = { prefix:"", name:"", department:"", orgSelect:"", organization:"", contact:"", email:"", authorRole:"", collabType:"", country:"India" };

const INIT = {
  prefix:"", name:"", empId:"", designation:"", department:"",
  orgSelect:"", organization:"",
  phone:"", email:"",
  paperTitle:"", paperType:"", authorType:"",
  authors:[],
  journal:"", publisher:"", publisherType:"", publishingDate:"",
  domainType:"", articleType:"",
  accessType:"", indexing:"", quartile:"",
  doi:"", preprintAvailable:"",
  openAccessAmount:"",
  paperFile: null,
};

/* ── Validation ── */
function validate(form) {
  const e = {};
  if (!form.prefix)             e.prefix         = "Prefix required.";
  if (!form.name.trim())        e.name           = "Name required.";
  if (!form.empId.trim())       e.empId          = "Employee ID required.";
  if (!form.designation)        e.designation    = "Designation required.";
  if (!form.department)         e.department     = "Department required.";
  if (!form.orgSelect)          e.orgSelect      = "Organisation required.";
  if (form.orgSelect === "Others" && !form.organization.trim()) e.organization = "Please enter your organisation name.";
  if (!form.phone.trim())       e.phone          = "Phone number required.";
  if (!form.email.trim())       e.email          = "Email required.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
  if (!form.paperTitle.trim())  e.paperTitle     = "Paper title required.";
  if (!form.paperType)          e.paperType      = "Paper type required.";
  if (!form.authorType)         e.authorType     = "Author type required.";
  if (!form.journal.trim())     e.journal        = "Journal / venue name required.";
  if (!form.publisher.trim())   e.publisher      = "Publisher required.";
  if (BOOK_TYPES.includes(form.paperType) && !form.publisherType) e.publisherType = "Publisher type required.";
  if (!form.publishingDate)     e.publishingDate = "Publishing date required.";
  if (!form.domainType)         e.domainType     = "Domain type required.";
  if (!form.articleType)        e.articleType    = "Article type required.";
  if (ACCESS_PAPER_TYPES.includes(form.paperType) && !form.accessType) e.accessType = "Access type required.";
  if (!form.indexing)           e.indexing       = "Indexing required.";
  if (QUARTILE_TYPES.includes(form.paperType) && !form.quartile) e.quartile = "Quartile required.";
  if (form.accessType === "Open Access" && !String(form.openAccessAmount||"").trim()) e.openAccessAmount = "Enter the open access fee paid (INR).";
  if (!form.doi.trim())         e.doi            = "DOI is required.";
  if (!form.paperFile)          e.paperFile      = "Please upload the paper PDF.";
  return e;
}

/* ── PDF Report Generator — light orange header ── */
/* ── Load pdf-lib from CDN (cached after first call) ── */
let _pdfLib = null;
async function loadPdfLib() {
  if (_pdfLib) return _pdfLib;
  await new Promise((resolve, reject) => {
    if (document.getElementById("pdf-lib-cdn")) { resolve(); return; }
    const s = document.createElement("script");
    s.id  = "pdf-lib-cdn";
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
    s.onload  = resolve;
    s.onerror = () => reject(new Error("Failed to load pdf-lib"));
    document.head.appendChild(s);
  });
  _pdfLib = window.PDFLib;
  return _pdfLib;
}

/* ── Marks Calculator (per JSSSTU policy) ── */
function calculateMarks(formData) {
  const indexing    = (formData.indexing   || "").toLowerCase();
  const paperType   = (formData.paperType  || "").toLowerCase();
  const quartile    = (formData.quartile   || "").toUpperCase();
  const publisherType = (formData.publisherType || "").toLowerCase();
  const authorType  = (formData.authorType || "");
  const coAuthors   = formData.authors || [];

  // Host university: JSS Science and Technology University, Mysuru
  // Submitter is JSSSTU if orgSelect === HOST_UNIVERSITY_FULL (or blank legacy)
  const submitterIsJss = !formData.orgSelect || formData.orgSelect === HOST_UNIVERSITY_FULL;

  // Co-authors at JSSSTU: orgSelect is JSSSTU or blank
  const jssCoAuthors = coAuthors.filter(a => {
    const sel = (a.orgSelect || "").trim();
    return sel === "" || sel === HOST_UNIVERSITY_FULL;
  });
  const totalJssAuthors = (submitterIsJss ? 1 : 0) + jssCoAuthors.length;

  // International collaboration: any co-author with country != India (or non-empty non-India country)
  // Even ONE international author qualifies for international collab marks
  const hasIntlCollab = coAuthors.some(a => {
    const collabType = (a.collabType || "").toLowerCase();
    const country    = (a.country   || "").trim().toLowerCase();
    // International if explicitly set to "international" OR country is non-empty and not india
    if (collabType === "international") return true;
    if (country && country !== "india") return true;
    return false;
  });
  const intlBonus = hasIntlCollab ? 1 : 0;

  const isScopusWos = ["scopus","sci","scie","esci","web of science"].some(k => indexing.includes(k));

  let basePoints = 0;
  let category   = "";
  let breakdown  = "";
  let maxPoints  = 0;

  if (paperType === "journal" && isScopusWos) {
    /* ── Category 1: Scopus/WoS Journal ── */
    category  = "Category 1 — Scopus/WoS Indexed Journal Paper";
    maxPoints = 15;

    if (["Q1","Q2"].includes(quartile))       basePoints = 5;
    else if (["Q3","Q4"].includes(quartile))  basePoints = 3;
    else                                       basePoints = 3; // default if no quartile

    const totalPts = basePoints + intlBonus;

    // Authorship allocation
    const isFirstOrCorr = ["First Author","Corresponding Author"].includes(authorType);
    let allocatedPoints;

    if (isFirstOrCorr) {
      // First/Corresponding author from JSSSTU → full points; rest share equally
      if (totalJssAuthors === 1) {
        allocatedPoints = totalPts;
        breakdown = `${quartile||"—"} paper (${basePoints} pts)${intlBonus ? " + 1 Intl. Collaboration" : ""}. As ${authorType} (sole JSSSTU author): full ${totalPts} point${totalPts!==1?"s":""} awarded.`;
      } else {
        const otherShare = totalPts / totalJssAuthors;
        allocatedPoints = totalPts; // first/corr gets full points
        breakdown = `${quartile||"—"} paper (${basePoints} pts)${intlBonus ? " + 1 Intl. Collaboration" : ""}. As ${authorType}: full ${totalPts} pt${totalPts!==1?"s":""}. The remaining ${totalJssAuthors-1} JSSSTU co-author${totalJssAuthors>2?"s":""} equally share ${totalPts} pts (${otherShare.toFixed(2)} pts each).`;
      }
    } else {
      // Co-Author: points shared equally among all JSSSTU authors
      const perAuthor = totalPts / totalJssAuthors;
      allocatedPoints = perAuthor;
      breakdown = `${quartile||"—"} paper (${basePoints} pts)${intlBonus ? " + 1 Intl. Collaboration" : ""}. As Co-Author: ${totalPts} pts shared equally among ${totalJssAuthors} JSSSTU authors = ${perAuthor.toFixed(2)} pts each.`;
    }

    return {
      category, maxPoints,
      basePoints, intlBonus,
      allocatedPoints: Math.min(parseFloat(allocatedPoints.toFixed(2)), maxPoints),
      breakdown,
      hasIntlCollab,
    };

  } else if (["conference","book chapter","book"].includes(paperType) && isScopusWos) {
    /* ── Category 2: Scopus/WoS Conference / Book Chapter / Book ── */
    category  = "Category 2 — Scopus/WoS Indexed Conference / Book Chapter / Book";
    maxPoints = 5;

    if (paperType === "book") {
      if (publisherType === "international") {
        basePoints = 5;
        breakdown  = "Book by International Publisher: 5 pts/book.";
      } else {
        basePoints = 4;
        breakdown  = "Book by National Publisher: 4 pts/book.";
      }
      basePoints += intlBonus;
      breakdown  += intlBonus ? " + 1 Intl. Collaboration." : "";
    } else {
      basePoints = 2;
      breakdown  = `${paperType === "conference" ? "Conference paper" : "Book chapter"}: 2 pts/publication.${intlBonus ? " + 1 Intl. Collaboration." : ""}`;
      basePoints += intlBonus;
    }

    const allocatedPoints = Math.min(basePoints, maxPoints);
    return {
      category, maxPoints,
      basePoints, intlBonus,
      allocatedPoints,
      breakdown,
      hasIntlCollab,
    };

  } else {
    /* Non-indexed or UGC Care etc — not in main categories, informational only */
    return {
      category:  "Other / Non-Scopus-WoS Publication",
      maxPoints: "N/A",
      basePoints: 0, intlBonus: 0,
      allocatedPoints: 0,
      breakdown: `Indexing (${formData.indexing || "—"}) does not fall under Category 1 or 2 of the JSSSTU marking scheme. Points not applicable.`,
      hasIntlCollab,
    };
  }
}

/* ── Build cover-sheet + merge with uploaded paper PDF ── */
async function generateAndDownloadMergedPDF(formData, ackNumber) {
  const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();

  const now = new Date().toLocaleString("en-IN", { dateStyle:"long", timeStyle:"short", timeZone:"Asia/Kolkata" });

  /* ── Calculate marks ── */
  const marks = calculateMarks(formData);

  /* ── 1. Build cover-sheet PDF ── */
  const coverDoc = await PDFDocument.create();
  const page     = coverDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontBold    = await coverDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await coverDoc.embedFont(StandardFonts.Helvetica);

  const navy       = rgb(0.04, 0.18, 0.43);
  const orange     = rgb(0.96, 0.43, 0.00);
  const orangeLight= rgb(1.0,  0.95, 0.88);  // light orange — matches ack box
  const orangeMid  = rgb(1.0,  0.91, 0.77);  // slightly deeper for gradient feel
  const grey       = rgb(0.47, 0.57, 0.72);
  const light      = rgb(0.94, 0.96, 1.0);
  const green      = rgb(0.08, 0.55, 0.20);

  /* ── Header — light orange background (matches ack box) ── */
  const headerH = 120;
  page.drawRectangle({ x:0, y:height-headerH, width, height:headerH, color:orangeLight });
  page.drawLine({ start:{x:0, y:height-headerH}, end:{x:width, y:height-headerH}, thickness:3, color:orange });

  /* Logo — centered, 75×55 px */
  const logoX = (width - 75) / 2;
  const logoY = height - headerH + 8;
  try {
    const logoResp  = await fetch("/logo.png");
    if (logoResp.ok) {
      const logoBytes = await logoResp.arrayBuffer();
      const logoImg   = await coverDoc.embedPng(new Uint8Array(logoBytes)).catch(async () =>
        coverDoc.embedJpg(new Uint8Array(logoBytes))
      );
      page.drawImage(logoImg, { x:logoX, y:logoY, width:75, height:55 });
    }
  } catch (_) { /* logo optional — skip silently */ }

  /* Title text — centered under logo */
  const titleText = "ONE PAPER ONE CLAIM";
  const titleW    = fontBold.widthOfTextAtSize(titleText, 16);
  page.drawText(titleText, { x:(width-titleW)/2, y:height-25, font:fontBold, size:16, color:navy });

  const subText = "JSS Science and Technology University — Research Publication Portal";
  const subW    = fontRegular.widthOfTextAtSize(subText, 8.5);
  page.drawText(subText,  { x:(width-subW)/2,   y:height-40, font:fontRegular, size:8.5, color:rgb(0.3,0.4,0.6) });

  const rptText = "SUBMISSION REPORT";
  const rptW    = fontBold.widthOfTextAtSize(rptText, 9);
  page.drawText(rptText,  { x:(width-rptW)/2,   y:height-55, font:fontBold,    size:9,   color:orange });

  /* ── Ack box ── */
  const boxY = height - headerH - 68;
  page.drawRectangle({ x:40, y:boxY, width:width-80, height:55, color:orangeLight, borderColor:orange, borderWidth:1.2 });
  const ackLabel = "ACKNOWLEDGEMENT NUMBER";
  const ackLW    = fontBold.widthOfTextAtSize(ackLabel, 8);
  page.drawText(ackLabel, { x:(width-ackLW)/2,                  y:boxY+38, font:fontBold,    size:8,  color:orange });
  const ackW     = fontBold.widthOfTextAtSize(ackNumber, 18);
  page.drawText(ackNumber,{ x:(width-ackW)/2,                    y:boxY+16, font:fontBold,    size:18, color:navy  });
  page.drawText(`Submitted: ${now}`, { x:44, y:boxY+4, font:fontRegular, size:7.5, color:grey });

  let curY = boxY - 22;
  let currentPage = page;

  /* ── Helpers — multi-page aware ── */
  const ensureSpace = (needed = 20) => {
    if (curY - needed < 38) {
      const np = coverDoc.addPage([595, 842]);
      np.drawRectangle({ x:0, y:0, width:595, height:30, color:navy });
      np.drawText(`© ${new Date().getFullYear()} One Paper One Claim · JSSSTU`, { x:40, y:10, font:fontRegular, size:8, color:rgb(0.7,0.8,1) });
      currentPage = np;
      curY = 842 - 30;
    }
  };

  const sectionHead = (label) => {
    ensureSpace(24);
    currentPage.drawRectangle({ x:40, y:curY-2, width:width-80, height:16, color:light });
    currentPage.drawText(label.toUpperCase(), { x:44, y:curY, font:fontBold, size:8, color:orange });
    curY -= 22;
  };

  const row = (label, value) => {
    if (!value || value === "—" || value === "") return;
    const val  = String(value);
    const maxCh = 52;
    ensureSpace(val.length > maxCh ? 32 : 18);
    currentPage.drawText(label, { x:44,  y:curY, font:fontBold,    size:9, color:grey });
    currentPage.drawText(val.slice(0, maxCh), { x:200, y:curY, font:fontRegular, size:9, color:navy });
    if (val.length > maxCh) {
      curY -= 13;
      currentPage.drawText(val.slice(maxCh, maxCh*2), { x:200, y:curY, font:fontRegular, size:9, color:navy });
    }
    currentPage.drawLine({ start:{x:40,y:curY-4}, end:{x:width-40,y:curY-4}, thickness:0.3, color:light });
    curY -= 16;
  };

  sectionHead("Submitter Information");
  row("Name",         `${formData.prefix||""} ${formData.name}`);
  row("Employee ID",  formData.empId);
  row("Designation",  formData.designation);
  row("Department",   formData.department);
  row("Organisation", formData.orgSelect === "Others" ? (formData.organization || "—") : (formData.orgSelect || HOST_UNIVERSITY_FULL));
  row("Email",        formData.email);
  row("Phone",        formData.phone);

  curY -= 6;
  sectionHead("Paper Details");
  row("Title",           formData.paperTitle);
  row("Paper Type",      formData.paperType);
  row("Article Type",    formData.articleType);
  row("Domain",          formData.domainType);
  row("Author Role",     formData.authorType);
  row("Journal / Venue", formData.journal);
  row("Publisher",       formData.publisher + (formData.publisherType ? ` (${formData.publisherType})` : ""));
  row("Publishing Date", formData.publishingDate);
  row("Indexing",        formData.indexing);
  row("Quartile",        formData.quartile);
  row("Access Type",     formData.accessType);
  row("DOI",             formData.doi);
  row("Preprint",        formData.preprintAvailable);

  if (formData.authors && formData.authors.length > 0) {
    curY -= 4;
    sectionHead("Co-Authors");
    formData.authors.forEach((a, i) => {
      const collabLabel  = a.collabType ? ` [${a.collabType}]` : "";
      const countryLabel = a.country && a.country !== "India" ? ` · ${a.country}` : (a.country === "India" ? " · India" : "");
      const roleLabel    = a.authorRole ? ` (${a.authorRole})` : "";
      const resolvedOrg  = a.orgSelect === "Others" ? (a.organization || "—") : (a.orgSelect || HOST_UNIVERSITY_FULL);
      const orgLabel     = ` — ${resolvedOrg}`;
      row(`Author ${i+2}${roleLabel}`, `${a.prefix||""} ${a.name}${orgLabel}${collabLabel}${countryLabel}`);
    });
  }

  /* ── Marks / Points Section ── */
  curY -= 8;
  ensureSpace(110);

  // Green header bar for marks
  currentPage.drawRectangle({ x:40, y:curY-2, width:width-80, height:16, color:rgb(0.88,0.97,0.90) });
  currentPage.drawText("POINTS AWARDED (JSSSTU RESEARCH PUBLICATION SCHEME)", { x:44, y:curY, font:fontBold, size:8, color:green });
  curY -= 24;

  // Category box
  currentPage.drawRectangle({ x:40, y:curY-42, width:width-80, height:52, color:orangeLight, borderColor:orange, borderWidth:0.8 });
  currentPage.drawText("Category", { x:55, y:curY-6,  font:fontBold,    size:8,  color:grey  });
  currentPage.drawText(marks.category, { x:150, y:curY-6, font:fontRegular, size:8, color:navy });
  currentPage.drawText("Max Points",   { x:55, y:curY-20, font:fontBold,    size:8,  color:grey  });
  currentPage.drawText(String(marks.maxPoints), { x:150, y:curY-20, font:fontRegular, size:8, color:navy });
  currentPage.drawText("Points Awarded", { x:55, y:curY-34, font:fontBold, size:8,  color:grey  });

  // Big points number
  const ptsStr  = typeof marks.allocatedPoints === "number" ? marks.allocatedPoints.toFixed(2) : "0.00";
  const ptsW    = fontBold.widthOfTextAtSize(ptsStr, 16);
  currentPage.drawText(ptsStr, { x:150, y:curY-38, font:fontBold, size:16, color:green });
  currentPage.drawText("pts", { x:150 + ptsW + 4, y:curY-34, font:fontRegular, size:9, color:grey });
  curY -= 52;

  // International collab badge
  if (marks.hasIntlCollab) {
    curY -= 4;
    currentPage.drawRectangle({ x:40, y:curY-14, width:250, height:16, color:rgb(0.9,0.95,1.0), borderColor:rgb(0.3,0.5,0.9), borderWidth:0.6 });
    currentPage.drawText("+ 1 pt: International Collaboration bonus (non-India author verified)", { x:46, y:curY-10, font:fontBold, size:7.5, color:rgb(0.1,0.2,0.7) });
    curY -= 20;
  }

  // Breakdown note
  curY -= 6;
  ensureSpace(36);
  currentPage.drawText("Breakdown:", { x:44, y:curY, font:fontBold, size:8, color:grey });
  curY -= 14;
  // Wrap breakdown text at ~80 chars
  const bdText = marks.breakdown;
  const chPerLine = 88;
  for (let i = 0; i < bdText.length; i += chPerLine) {
    ensureSpace(14);
    currentPage.drawText(bdText.slice(i, i + chPerLine), { x:50, y:curY, font:fontRegular, size:7.5, color:rgb(0.2,0.3,0.5) });
    curY -= 13;
  }

  curY -= 6;
  ensureSpace(24);
  currentPage.drawRectangle({ x:40, y:curY-16, width:width-80, height:20, color:rgb(0.97,0.98,1.0), borderColor:light, borderWidth:0.5 });
  currentPage.drawText("Note: Points are calculated automatically based on submitted data per the JSSSTU Research Publication Incentive Scheme.", { x:46, y:curY-10, font:fontRegular, size:7, color:rgb(0.4,0.4,0.5) });
  curY -= 24;

  /* ── Footer on first page ── */
  page.drawRectangle({ x:0, y:0, width, height:30, color:navy });
  page.drawText(`© ${new Date().getFullYear()} One Paper One Claim · JSS Science and Technology University · office.deanres@jssstuniv.in`,
    { x:40, y:10, font:fontRegular, size:8, color:rgb(0.7,0.8,1) });

  const coverBytes = await coverDoc.save();

  /* ── 2. Merge cover + uploaded paper PDF ── */
  let finalBytes = coverBytes;

  if (formData.paperFile instanceof File) {
    try {
      const uploadedArrayBuffer = await formData.paperFile.arrayBuffer();
      const mergedDoc    = await PDFDocument.create();
      const coverSrc     = await PDFDocument.load(coverBytes);
      const uploadedSrc  = await PDFDocument.load(uploadedArrayBuffer);

      const coverPages    = await mergedDoc.copyPages(coverSrc,    coverSrc.getPageIndices());
      const uploadedPages = await mergedDoc.copyPages(uploadedSrc, uploadedSrc.getPageIndices());

      coverPages.forEach(p    => mergedDoc.addPage(p));
      uploadedPages.forEach(p => mergedDoc.addPage(p));

      finalBytes = await mergedDoc.save();
    } catch (mergeErr) {
      console.warn("PDF merge failed, downloading cover sheet only:", mergeErr.message);
    }
  }

  /* ── 3. Trigger download ── */
  const blob = new Blob([finalBytes], { type:"application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `OPOC-Report-${ackNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ── Icons ── */
const UploadIcon  = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon       = () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const DownloadIcon= () => <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

function Field({ id, label, required, error, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && <span className="required">*</span>}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
}

export default function Apply() {
  const [form, setForm]             = useState(INIT);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal]           = useState(null);
  const [fileLabel, setFileLabel]   = useState("");
  const [fileError, setFileError]   = useState("");
  const submittedFormRef            = useRef(null);

  const showQuartile = QUARTILE_TYPES.includes(form.paperType);
  const showAccess   = ACCESS_PAPER_TYPES.includes(form.paperType);
  const showAuthors  = !!form.authorType;
  const showPubType  = BOOK_TYPES.includes(form.paperType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "paperType") {
      setForm(p => ({ ...p, paperType:value, quartile:"", accessType:"", openAccessAmount:"", publisherType:"" }));
    } else if (name === "authorType") {
      setForm(p => ({ ...p, authorType:value, authors:[] }));
    } else {
      setForm(p => ({ ...p, [name]:value }));
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]:"" }));
  };

  const addAuthor    = () => { if (form.authors.length >= MAX_AUTHORS) return; setForm(p => ({ ...p, authors:[...p.authors, {...EMPTY_AUTHOR}] })); };
  const removeAuthor = (idx) => setForm(p => ({ ...p, authors:p.authors.filter((_,i)=>i!==idx) }));
  const updateAuthor = (idx, field, value) => setForm(p => ({ ...p, authors:p.authors.map((a,i)=>i===idx?{...a,[field]:value}:a) }));
  // Batch update multiple fields atomically (avoids stale-closure race on double setState)
  const updateAuthorMulti = (idx, fields) => setForm(p => ({ ...p, authors:p.authors.map((a,i)=>i===idx?{...a,...fields}:a) }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") { setFileError("Only PDF files are allowed."); return; }
    if (file.size > 2*1024*1024) { setFileError("File must not exceed 2 MB."); return; }
    setForm(p => ({ ...p, paperFile:file }));
    setFileLabel(file.name);
    if (errors.paperFile) setErrors(p => ({ ...p, paperFile:"" }));
  };

  const removeFile = () => { setForm(p => ({ ...p, paperFile:null })); setFileLabel(""); setFileError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!form.email.toLowerCase().endsWith("@jssstuniv.in")) {
      setErrors(p => ({ ...p, email:"Only @jssstuniv.in email addresses are accepted." }));
      return;
    }
    setSubmitting(true);
    try {
      const { paperFile, ...rest } = form;
      const result = await submitPaper(rest, paperFile);
      submittedFormRef.current = { ...rest, paperFile };   // keep file for PDF merge
      setModal({ type:"success", ackNumber:result.ackNumber });
      setForm(INIT); setErrors({}); setFileLabel("");
    } catch (err) {
      if (err.error === "DUPLICATE")       setModal({ type:"duplicate", message:err.message });
      else if (err.error === "INVALID_DOMAIN") setErrors(p => ({ ...p, email:err.message }));
      else setModal({ type:"error", message:err.message || "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (!submittedFormRef.current || !modal?.ackNumber) return;
    setDownloading(true);
    try {
      await generateAndDownloadMergedPDF(submittedFormRef.current, modal.ackNumber);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="apply-page">
      <div className="page-header">
        <span className="page-eyebrow">Research Cell</span>
        <h1 className="page-title">Submit Your Publication</h1>
        <p className="page-subtitle">Fields marked <span style={{color:"var(--orange)"}}>*</span> are mandatory.</p>
      </div>

      <GlassCard className="form-card">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── 1. Personal ── */}
          <div className="form-section-label">Personal Information</div>
          <div className="form-grid-3">
            <Field id="prefix" label="Prefix" required error={errors.prefix}>
              <select id="prefix" name="prefix" className="form-select" value={form.prefix} onChange={handleChange}>
                <option value="">Select</option>
                {PREFIXES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field id="name" label="Full Name" required error={errors.name}>
              <input id="name" name="name" type="text" className="form-input" placeholder="Full legal name" value={form.name} onChange={handleChange}/>
            </Field>
            <Field id="empId" label="Employee ID" required error={errors.empId}>
              <input id="empId" name="empId" type="text" className="form-input" placeholder="EMP / Faculty ID" value={form.empId} onChange={handleChange}/>
            </Field>
          </div>
          <div className="form-grid">
            <Field id="designation" label="Designation" required error={errors.designation}>
              <select id="designation" name="designation" className="form-select" value={form.designation} onChange={handleChange}>
                <option value="">Select</option>
                {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field id="department" label="Department" required error={errors.department}>
              <select id="department" name="department" className="form-select" value={form.department} onChange={handleChange}>
                <option value="">Select</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-grid">
            <Field id="phone" label="Phone Number" required error={errors.phone}>
              <input id="phone" name="phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange}/>
            </Field>
            <Field id="email" label="Email Address" required error={errors.email}>
              <input id="email" name="email" type="email" className="form-input" placeholder="name@jssstuniv.in" value={form.email} onChange={handleChange}/>
            </Field>
          </div>
          <div className={form.orgSelect === "Others" ? "form-grid" : ""}>
            <Field id="orgSelect" label="Organisation" required error={errors.orgSelect}>
              <select id="orgSelect" name="orgSelect" className="form-select" value={form.orgSelect} onChange={e => {
                const val = e.target.value;
                setForm(p => ({ ...p, orgSelect: val, organization: val !== "Others" ? "" : p.organization }));
                if (errors.orgSelect) setErrors(p => ({ ...p, orgSelect: "" }));
                if (errors.organization) setErrors(p => ({ ...p, organization: "" }));
              }}>
                <option value="">Select organisation</option>
                {ORG_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            {form.orgSelect === "Others" && (
              <Field id="organization" label="Enter Organisation Name" required error={errors.organization}>
                <input id="organization" name="organization" type="text" className="form-input" placeholder="Full name of your university / institution" value={form.organization} onChange={handleChange}/>
              </Field>
            )}
          </div>

          {/* ── 2. Paper Details ── */}
          <div className="form-section-label" style={{marginTop:"1.3rem"}}>Paper Details</div>
          <Field id="paperTitle" label="Paper Title" required error={errors.paperTitle}>
            <input id="paperTitle" name="paperTitle" type="text" className="form-input" placeholder="Full title of your published paper" value={form.paperTitle} onChange={handleChange}/>
          </Field>
          <div className="form-grid">
            <Field id="paperType" label="Paper Type" required error={errors.paperType}>
              <select id="paperType" name="paperType" className="form-select" value={form.paperType} onChange={handleChange}>
                <option value="">Select type</option>
                {PAPER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field id="articleType" label="Type of Article" required error={errors.articleType}>
              <select id="articleType" name="articleType" className="form-select" value={form.articleType} onChange={handleChange}>
                <option value="">Select article type</option>
                {ARTICLE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-grid">
            <Field id="domainType" label="Domain Type" required error={errors.domainType}>
              <select id="domainType" name="domainType" className="form-select" value={form.domainType} onChange={handleChange}>
                <option value="">Select domain</option>
                {DOMAIN_TYPES.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field id="authorType" label="Author Type" required error={errors.authorType}>
              <select id="authorType" name="authorType" className="form-select" value={form.authorType} onChange={handleChange}>
                <option value="">Select author type</option>
                {AUTHOR_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* Additional Authors */}
          {showAuthors && (
            <div className="conditional-field" style={{marginBottom:"0.5rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
                <span style={{fontSize:"0.78rem",fontWeight:600,color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  Additional Authors <span style={{fontWeight:400,color:"var(--text-muted)",textTransform:"none"}}>({form.authors.length}/{MAX_AUTHORS})</span>
                </span>
              </div>
              {form.authors.map((author,idx) => (
                <div className="coauthor-card" key={idx}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.9rem"}}>
                    <span className="coauthor-heading" style={{marginBottom:0}}>Author {idx+2}</span>
                    <button type="button" className="btn-remove" onClick={()=>removeAuthor(idx)}><XIcon/> Remove</button>
                  </div>

                  {/* Type of Author & Type of Collaboration */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Type of Author <span className="required">*</span></label>
                      <select className="form-select" value={author.authorRole} onChange={e=>updateAuthor(idx,"authorRole",e.target.value)}>
                        <option value="">Select type</option>
                        {COAUTHOR_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type of Collaboration <span className="required">*</span></label>
                      <select className="form-select" value={author.collabType}
                        onChange={e=>{
                          const val = e.target.value;
                          // Reset country to India when switching to National
                          if (val === "National") updateAuthorMulti(idx,{collabType:val, country:"India"});
                          else updateAuthor(idx,"collabType",val);
                        }}>
                        <option value="">Select collaboration</option>
                        {COLLAB_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Country — always shown, validated for international */}
                  <div className="form-group">
                    <label className="form-label">
                      Country <span className="required">*</span>
                      {author.collabType==="International" && (
                        <span style={{marginLeft:"0.5rem",fontSize:"0.7rem",fontWeight:600,color:"var(--orange)",background:"rgba(245,110,0,0.08)",padding:"1px 7px",borderRadius:"20px",letterSpacing:"0.03em"}}>
                          ★ International Collaboration
                        </span>
                      )}
                    </label>
                    <select className="form-select" value={author.country}
                      onChange={e=>{
                        const country = e.target.value;
                        // Auto-sync collabType based on country atomically
                        if (country && country !== "India") updateAuthorMulti(idx,{country, collabType:"International"});
                        else updateAuthorMulti(idx,{country, collabType:"National"});
                      }}>
                      <option value="">Select country</option>
                      {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    {author.collabType==="International" && author.country && author.country !== "India" && (
                      <span className="form-hint" style={{color:"var(--orange)",fontWeight:500}}>
                        ✓ International collaboration marks will be awarded for this submission.
                      </span>
                    )}
                    {author.collabType==="International" && author.country === "India" && (
                      <span className="form-hint" style={{color:"#dc2626",fontWeight:500}}>
                        ⚠ International collaboration requires a non-India country. Please select the correct country.
                      </span>
                    )}
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Prefix</label>
                      <select className="form-select" value={author.prefix} onChange={e=>updateAuthor(idx,"prefix",e.target.value)}>
                        <option value="">Select</option>
                        {PREFIXES.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn:"span 2"}}>
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" placeholder="Full name" value={author.name} onChange={e=>updateAuthor(idx,"name",e.target.value)}/>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input type="text" className="form-input" placeholder="Department" value={author.department} onChange={e=>updateAuthor(idx,"department",e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Organisation <span className="required">*</span></label>
                      <select className="form-select" value={author.orgSelect}
                        onChange={e=>{
                          const val = e.target.value;
                          updateAuthorMulti(idx,{
                            orgSelect: val,
                            organization: val !== "Others" ? "" : author.organization,
                            // Auto-set collabType: JSSSTU = National, Others = keep current or blank
                            collabType: val === HOST_UNIVERSITY_FULL ? "National" : author.collabType,
                            country:    val === HOST_UNIVERSITY_FULL ? "India"    : author.country,
                          });
                        }}>
                        <option value="">Select organisation</option>
                        {ORG_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  {author.orgSelect === "Others" && (
                    <div className="form-group">
                      <label className="form-label">Enter Organisation Name <span className="required">*</span></label>
                      <input type="text" className="form-input" placeholder="Full name of university / institution" value={author.organization} onChange={e=>updateAuthor(idx,"organization",e.target.value)}/>
                    </div>
                  )}
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Contact Number</label><input type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" value={author.contact} onChange={e=>updateAuthor(idx,"contact",e.target.value)}/></div>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="author@email.com" value={author.email} onChange={e=>updateAuthor(idx,"email",e.target.value)}/></div>
                  </div>
                </div>
              ))}
              {form.authors.length < MAX_AUTHORS && (
                <button type="button" className="btn-add-author" onClick={addAuthor}>
                  <PlusIcon/> Add Author {form.authors.length===0?"":`(${form.authors.length+1})`}
                </button>
              )}
            </div>
          )}

          {/* ── 3. Journal & Publication ── */}
          <div className="form-section-label" style={{marginTop:"1.3rem"}}>Journal &amp; Publication Details</div>
          <div className="form-grid">
            <Field id="journal" label="Journal / Venue Name" required error={errors.journal}>
              <input id="journal" name="journal" type="text" className="form-input" placeholder="e.g. IEEE Transactions on..." value={form.journal} onChange={handleChange}/>
            </Field>
            <Field id="publisher" label="Publisher" required error={errors.publisher}>
              <input id="publisher" name="publisher" type="text" className="form-input" placeholder="e.g. Elsevier, Springer, IEEE" value={form.publisher} onChange={handleChange}/>
            </Field>
          </div>

          {showPubType && (
            <div className="conditional-field">
              <Field id="publisherType" label="Publisher Type" required error={errors.publisherType}>
                <div style={{display:"flex",gap:"0.75rem"}}>
                  {PUBLISHER_TYPES.map(pt=>(
                    <button key={pt} type="button"
                      className={`toggle-btn ${form.publisherType===pt?(pt==="National"?"active-yes":"active-no"):""}`}
                      onClick={()=>{ setForm(p=>({...p,publisherType:p.publisherType===pt?"":pt})); if(errors.publisherType) setErrors(p=>({...p,publisherType:""})); }}>
                      {pt}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          <div className="form-grid">
            <Field id="publishingDate" label="Publishing Date" required error={errors.publishingDate}>
              <input id="publishingDate" name="publishingDate" type="date" className="form-input" value={form.publishingDate} onChange={handleChange}/>
            </Field>
            <Field id="indexing" label="Indexing" required error={errors.indexing}>
              <select id="indexing" name="indexing" className="form-select" value={form.indexing} onChange={handleChange}>
                <option value="">Select indexing</option>
                {INDEXING_OPTS.map(i=><option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          </div>

          {showAccess && (
            <div className="conditional-field">
              <Field id="accessType" label="Type of Access" required error={errors.accessType}>
                <select id="accessType" name="accessType" className="form-select" value={form.accessType} onChange={handleChange}>
                  <option value="">Select access type</option>
                  {ACCESS_TYPES.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              {form.accessType==="Open Access" && (
                <div className="conditional-field">
                  <Field id="openAccessAmount" label="Open Access Fee Paid (INR)" required error={errors.openAccessAmount} hint="Enter the APC (Article Processing Charge) paid">
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",fontSize:"0.88rem",fontWeight:600,color:"var(--text-secondary)",pointerEvents:"none"}}>₹</span>
                      <input id="openAccessAmount" name="openAccessAmount" type="number" min="0" className="form-input" style={{paddingLeft:"2rem"}} placeholder="e.g. 25000" value={form.openAccessAmount||""} onChange={handleChange}/>
                    </div>
                  </Field>
                </div>
              )}
            </div>
          )}

          {showQuartile && (
            <div className="conditional-field">
              <Field id="quartile" label="Quartile" required error={errors.quartile}>
                <select id="quartile" name="quartile" className="form-select" value={form.quartile} onChange={handleChange}>
                  <option value="">Select quartile</option>
                  {QUARTILES.map(q=><option key={q} value={q}>{q}</option>)}
                </select>
              </Field>
            </div>
          )}

          <Field id="doi" label="DOI" required error={errors.doi} hint="e.g. 10.1109/TPAMI.2023.1234567">
            <input id="doi" name="doi" type="text" className="form-input" placeholder="10.xxxx/xxxxxxx" value={form.doi} onChange={handleChange}/>
          </Field>

          <div className="form-group">
            <label className="form-label">Preprint Available <span style={{color:"var(--text-muted)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(Optional)</span></label>
            <div className="toggle-group">
              <button type="button" className={`toggle-btn ${form.preprintAvailable==="yes"?"active-yes":""}`} onClick={()=>setForm(p=>({...p,preprintAvailable:p.preprintAvailable==="yes"?"":"yes"}))}>Yes</button>
              <button type="button" className={`toggle-btn ${form.preprintAvailable==="no"?"active-no":""}`} onClick={()=>setForm(p=>({...p,preprintAvailable:p.preprintAvailable==="no"?"":"no"}))}>No</button>
            </div>
          </div>

          {/* ── 4. Paper Upload ── */}
          <div className="form-section-label" style={{marginTop:"1.3rem"}}>Paper Upload</div>
          <div className="form-group">
            <label className="form-label">Upload Paper PDF <span className="required">*</span></label>
            {fileLabel ? (
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",background:"rgba(22,163,74,0.07)",border:"1px solid rgba(22,163,74,0.2)",borderRadius:"var(--radius-sm)"}}>
                <span style={{fontSize:"0.84rem",color:"var(--green)",fontWeight:600,flex:1}}>{fileLabel}</span>
                <button type="button" className="btn-remove" onClick={removeFile}><XIcon/> Remove</button>
              </div>
            ):(
              <div className="file-upload-area">
                <input type="file" accept=".pdf,application/pdf" onChange={handleFile} aria-label="Upload PDF"/>
                <div className="file-upload-icon"><UploadIcon/></div>
                <div className="file-upload-text">Click to browse or drag and drop</div>
                <div className="file-upload-hint">PDF only — maximum 2 MB</div>
              </div>
            )}
            {(fileError||errors.paperFile) && <span className="file-upload-error" role="alert">{fileError||errors.paperFile}</span>}
          </div>

          <div className="submit-row">
            <button type="submit" className="btn-primary" style={{minWidth:"162px",padding:"0.8rem 2.2rem",opacity:submitting?0.7:1}} disabled={submitting}>
              {submitting?"Submitting…":"Submit Paper"}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Contact */}
      <section className="contact-section" style={{marginTop:"2.5rem"}}>
        <GlassCard>
          <div className="contact-inner">
            <div>
              <p className="contact-label">Need Help?</p>
              <h2 className="contact-heading">Contact Us</h2>
              <p className="contact-desc">Facing issues with submission? Reach out to the Office of Dean Research.</p>
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
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ── Success Modal ── */}
      {modal?.type==="success" && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-box">
            <div className="modal-icon"><CheckIcon/></div>
            <h2 className="modal-title" id="modal-title">Submitted Successfully</h2>
            <div style={{margin:"0.75rem 0 0.8rem",padding:"1rem 1.2rem",background:"rgba(245,110,0,0.08)",border:"1px solid rgba(245,110,0,0.2)",borderRadius:"12px",textAlign:"center"}}>
              <div style={{fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--orange)",marginBottom:"4px"}}>Acknowledgement Number</div>
              <div style={{fontSize:"1.3rem",fontWeight:700,color:"var(--navy)",letterSpacing:"1px"}}>{modal.ackNumber}</div>
            </div>
            <p className="modal-message" style={{marginBottom:"0.6rem"}}>Your paper has been registered. Click below to download your <strong>merged PDF</strong> — the submission report and your uploaded paper combined into one file.</p>
            <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-primary" onClick={handleDownloadReport} disabled={downloading} style={{display:"flex",alignItems:"center",gap:"0.45rem"}}>
                <DownloadIcon/> {downloading ? "Preparing PDF…" : "Download Merged PDF"}
              </button>
              <button className="btn-secondary" onClick={()=>setModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Duplicate Modal ── */}
      {modal?.type==="duplicate" && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="dup-title">
          <div className="modal-box">
            <div className="modal-icon" style={{background:"linear-gradient(135deg,#ef4444,#dc2626)"}}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28,stroke:"white"}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="modal-title" id="dup-title" style={{color:"#dc2626"}}>Paper Already Exists</h2>
            <p className="modal-message">{modal.message}</p>
            <button className="btn-primary" onClick={()=>setModal(null)} style={{background:"linear-gradient(135deg,#ef4444,#dc2626)",minWidth:"120px"}}>Close</button>
          </div>
        </div>
      )}

      {/* ── Error Modal ── */}
      {modal?.type==="error" && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="err-title">
          <div className="modal-box">
            <div className="modal-icon" style={{background:"linear-gradient(135deg,#f59e0b,#d97706)"}}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28,stroke:"white"}}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="modal-title" id="err-title">Submission Failed</h2>
            <p className="modal-message">{modal.message}</p>
            <button className="btn-primary" onClick={()=>setModal(null)} style={{minWidth:"120px"}}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
