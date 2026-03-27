import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ── Marks Calculator (mirrors frontend logic) ── */
function calculateMarks(data) {
  const indexing      = (data.indexing      || "").toLowerCase();
  const paperType     = (data.paperType     || "").toLowerCase();
  const quartile      = (data.quartile      || "").toUpperCase();
  const publisherType = (data.publisherType || "").toLowerCase();
  const authorType    = (data.authorType    || "");
  const coAuthors     = data.authors        || [];

  const jssCoAuthors    = coAuthors.filter(a => !a.organization || a.organization.trim() === "");
  const totalJssAuthors = 1 + jssCoAuthors.length;
  const hasIntlCollab   = coAuthors.some(a => a.organization && a.organization.trim() !== "");
  const intlBonus       = hasIntlCollab ? 1 : 0;
  const isScopusWos     = ["scopus","sci","scie","esci","web of science"].some(k => indexing.includes(k));

  let basePoints = 0, category = "", breakdown = "", maxPoints = 0, allocatedPoints = 0;

  if (paperType === "journal" && isScopusWos) {
    category  = "Category 1 — Scopus/WoS Indexed Journal Paper";
    maxPoints = 15;
    if (["Q1","Q2"].includes(quartile))      basePoints = 5;
    else if (["Q3","Q4"].includes(quartile)) basePoints = 3;
    else                                      basePoints = 3;
    const totalPts = basePoints + intlBonus;
    const isFirstOrCorr = ["First Author","Corresponding Author"].includes(authorType);
    if (isFirstOrCorr) {
      allocatedPoints = totalPts;
      const otherShare = (totalPts / totalJssAuthors).toFixed(2);
      breakdown = `${quartile||"—"} paper (${basePoints} pts)${intlBonus?" + 1 Intl. Collaboration":""}.` +
        (totalJssAuthors === 1
          ? ` As ${authorType} (sole JSSSTU author): full ${totalPts} point${totalPts!==1?"s":""} awarded.`
          : ` As ${authorType}: full ${totalPts} pts. Remaining ${totalJssAuthors-1} JSSSTU co-author${totalJssAuthors>2?"s":""} each receive ${otherShare} pts.`);
    } else {
      const perAuthor = totalPts / totalJssAuthors;
      allocatedPoints = perAuthor;
      breakdown = `${quartile||"—"} paper (${basePoints} pts)${intlBonus?" + 1 Intl. Collaboration":""}.` +
        ` As Co-Author: ${totalPts} pts shared equally among ${totalJssAuthors} JSSSTU authors = ${perAuthor.toFixed(2)} pts each.`;
    }
    allocatedPoints = Math.min(parseFloat(allocatedPoints.toFixed(2)), maxPoints);

  } else if (["conference","book chapter","book"].includes(paperType) && isScopusWos) {
    category  = "Category 2 — Scopus/WoS Indexed Conference / Book Chapter / Book";
    maxPoints = 5;
    if (paperType === "book") {
      basePoints = publisherType === "international" ? 5 : 4;
      breakdown  = `Book by ${publisherType === "international" ? "International" : "National"} Publisher: ${basePoints} pts/book.${intlBonus?" + 1 Intl. Collaboration.":""}`;
      basePoints += intlBonus;
    } else {
      basePoints = 2 + intlBonus;
      breakdown  = `${paperType === "conference" ? "Conference paper" : "Book chapter"}: 2 pts/publication.${intlBonus?" + 1 Intl. Collaboration.":""}`;
    }
    allocatedPoints = Math.min(basePoints, maxPoints);

  } else {
    category        = "Other / Non-Scopus-WoS Publication";
    maxPoints       = "N/A";
    allocatedPoints = 0;
    breakdown       = `Indexing (${data.indexing||"—"}) is not under Category 1 or 2 of the JSSSTU scheme. Points not applicable.`;
  }

  return { category, maxPoints, basePoints, intlBonus, allocatedPoints, breakdown, hasIntlCollab };
}

/**
 * Build a cover-sheet PDF and merge it with the submitted paper PDF.
 * Returns a Buffer of the merged PDF.
 */
export async function buildMergedPdf({ ackNumber, data, submittedAt }, uploadedPdfBuffer) {
  const coverDoc  = await PDFDocument.create();
  const page      = coverDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const fontBold    = await coverDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await coverDoc.embedFont(StandardFonts.Helvetica);

  const navy        = rgb(0.04, 0.18, 0.43);
  const orange      = rgb(0.96, 0.43, 0.00);
  const orangeLight = rgb(1.0,  0.95, 0.88);
  const grey        = rgb(0.47, 0.57, 0.72);
  const light       = rgb(0.94, 0.96, 1.0);
  const green       = rgb(0.08, 0.55, 0.20);

  const dateStr = new Date(submittedAt).toLocaleString("en-IN", {
    dateStyle:"long", timeStyle:"short", timeZone:"Asia/Kolkata",
  });

  /* ── Light orange header ── */
  const headerH = 120;
  page.drawRectangle({ x:0, y:height-headerH, width, height:headerH, color:orangeLight });
  page.drawLine({ start:{x:0,y:height-headerH}, end:{x:width,y:height-headerH}, thickness:3, color:orange });

  /* Logo — centered 75×55 */
  const logoPath = path.resolve(__dirname, "../public/logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImg   = await coverDoc.embedPng(logoBytes).catch(async () => coverDoc.embedJpg(logoBytes));
      page.drawImage(logoImg, { x:(width-75)/2, y:height-headerH+8, width:75, height:55 });
    } catch (_) {}
  }

  /* Title — centered */
  const t1 = "ONE PAPER ONE CLAIM";
  page.drawText(t1, { x:(width - fontBold.widthOfTextAtSize(t1,16))/2,    y:height-26, font:fontBold,    size:16, color:navy  });
  const t2 = "JSS Science and Technology University — Research Publication Portal";
  page.drawText(t2, { x:(width - fontRegular.widthOfTextAtSize(t2,8.5))/2, y:height-42, font:fontRegular, size:8.5, color:rgb(0.3,0.4,0.6) });
  const t3 = "SUBMISSION REPORT";
  page.drawText(t3, { x:(width - fontBold.widthOfTextAtSize(t3,9))/2,     y:height-56, font:fontBold,    size:9,  color:orange });

  /* Ack box */
  const boxY = height - headerH - 68;
  page.drawRectangle({ x:40, y:boxY, width:width-80, height:55, color:orangeLight, borderColor:orange, borderWidth:1.2 });
  const al = "ACKNOWLEDGEMENT NUMBER";
  page.drawText(al,      { x:(width - fontBold.widthOfTextAtSize(al,8))/2,    y:boxY+38, font:fontBold,    size:8,  color:orange });
  page.drawText(ackNumber,{ x:(width - fontBold.widthOfTextAtSize(ackNumber,18))/2, y:boxY+16, font:fontBold, size:18, color:navy });
  page.drawText(`Submitted: ${dateStr}`, { x:44, y:boxY+4, font:fontRegular, size:7.5, color:grey });

  let curY = boxY - 22;
  let currentPage = page;

  const ensureSpace = (n=20) => {
    if (curY - n < 38) {
      const np = coverDoc.addPage([595,842]);
      np.drawRectangle({ x:0, y:0, width:595, height:30, color:navy });
      np.drawText(`© ${new Date().getFullYear()} One Paper One Claim · JSSSTU`, { x:40, y:10, font:fontRegular, size:8, color:rgb(0.7,0.8,1) });
      currentPage = np; curY = 842-30;
    }
  };

  const sectionHead = (label) => {
    ensureSpace(24);
    currentPage.drawRectangle({ x:40, y:curY-2, width:width-80, height:16, color:light });
    currentPage.drawText(label.toUpperCase(), { x:44, y:curY, font:fontBold, size:8, color:orange });
    curY -= 22;
  };

  const row = (label, value) => {
    if (!value || value==="—" || value==="") return;
    const val = String(value); const maxCh=52;
    ensureSpace(val.length>maxCh?32:18);
    currentPage.drawText(label, { x:44, y:curY, font:fontBold, size:9, color:grey });
    currentPage.drawText(val.slice(0,maxCh), { x:200, y:curY, font:fontRegular, size:9, color:navy });
    if (val.length>maxCh) { curY-=13; currentPage.drawText(val.slice(maxCh,maxCh*2), { x:200, y:curY, font:fontRegular, size:9, color:navy }); }
    currentPage.drawLine({ start:{x:40,y:curY-4}, end:{x:width-40,y:curY-4}, thickness:0.3, color:light });
    curY-=16;
  };

  sectionHead("Submitter Information");
  row("Name",        `${data.prefix||""} ${data.name}`);
  row("Employee ID", data.empId);
  row("Designation", data.designation);
  row("Department",  data.department);
  row("Email",       data.email);
  row("Phone",       data.phone);

  curY-=6; sectionHead("Paper Details");
  row("Title",           data.paperTitle);
  row("Paper Type",      data.paperType);
  row("Article Type",    data.articleType);
  row("Domain",          data.domainType);
  row("Author Role",     data.authorType);
  row("Journal / Venue", data.journal);
  row("Publisher",       data.publisher + (data.publisherType ? ` (${data.publisherType})` : ""));
  row("Publishing Date", data.publishingDate);
  row("Access Type",     data.accessType);
  row("Indexing",        data.indexing);
  row("Quartile",        data.quartile);
  row("DOI",             data.doi);
  row("Preprint",        data.preprintAvailable);
  row("Uploaded File",   data.fileName);

  if (data.authors && data.authors.length > 0) {
    curY-=4; sectionHead("Co-Authors");
    data.authors.forEach((a,i) => row(`Author ${i+2}`, `${a.prefix||""} ${a.name}${a.organization?` — ${a.organization}`:""}`));
  }

  /* ── Marks Section ── */
  const marks = calculateMarks(data);
  curY -= 8; ensureSpace(120);

  currentPage.drawRectangle({ x:40, y:curY-2, width:width-80, height:16, color:rgb(0.88,0.97,0.90) });
  currentPage.drawText("POINTS AWARDED (JSSSTU RESEARCH PUBLICATION SCHEME)", { x:44, y:curY, font:fontBold, size:8, color:green });
  curY -= 24;

  currentPage.drawRectangle({ x:40, y:curY-42, width:width-80, height:52, color:orangeLight, borderColor:orange, borderWidth:0.8 });
  currentPage.drawText("Category",       { x:55, y:curY-6,  font:fontBold,    size:8, color:grey });
  currentPage.drawText(marks.category,   { x:150, y:curY-6, font:fontRegular, size:8, color:navy });
  currentPage.drawText("Max Points",     { x:55, y:curY-20, font:fontBold,    size:8, color:grey });
  currentPage.drawText(String(marks.maxPoints), { x:150, y:curY-20, font:fontRegular, size:8, color:navy });
  currentPage.drawText("Points Awarded", { x:55, y:curY-34, font:fontBold,    size:8, color:grey });
  const ptsStr = typeof marks.allocatedPoints==="number" ? marks.allocatedPoints.toFixed(2) : "0.00";
  const ptsW   = fontBold.widthOfTextAtSize(ptsStr, 16);
  currentPage.drawText(ptsStr, { x:150, y:curY-38, font:fontBold,    size:16, color:green });
  currentPage.drawText("pts",  { x:150+ptsW+4, y:curY-34, font:fontRegular, size:9, color:grey });
  curY -= 52;

  if (marks.hasIntlCollab) {
    curY-=4;
    currentPage.drawRectangle({ x:40, y:curY-14, width:220, height:16, color:rgb(0.9,0.95,1.0), borderColor:rgb(0.3,0.5,0.9), borderWidth:0.6 });
    currentPage.drawText("+ 1 pt: International Collaboration bonus applied", { x:46, y:curY-10, font:fontBold, size:7.5, color:rgb(0.1,0.2,0.7) });
    curY-=20;
  }

  curY-=6; ensureSpace(36);
  currentPage.drawText("Breakdown:", { x:44, y:curY, font:fontBold, size:8, color:grey });
  curY-=14;
  const bd = marks.breakdown; const chLine=88;
  for (let i=0; i<bd.length; i+=chLine) {
    ensureSpace(14);
    currentPage.drawText(bd.slice(i,i+chLine), { x:50, y:curY, font:fontRegular, size:7.5, color:rgb(0.2,0.3,0.5) });
    curY-=13;
  }

  curY-=6; ensureSpace(24);
  currentPage.drawRectangle({ x:40, y:curY-16, width:width-80, height:20, color:rgb(0.97,0.98,1.0), borderColor:light, borderWidth:0.5 });
  currentPage.drawText("Note: Points are calculated automatically per the JSSSTU Research Publication Incentive Scheme.", { x:46, y:curY-10, font:fontRegular, size:7, color:rgb(0.4,0.4,0.5) });

  /* Footer first page */
  page.drawRectangle({ x:0, y:0, width, height:30, color:navy });
  page.drawText(`© ${new Date().getFullYear()} One Paper One Claim · JSS Science and Technology University · office.deanres@jssstuniv.in`,
    { x:30, y:10, font:fontRegular, size:7.5, color:rgb(0.7,0.8,1) });

  const coverBytes = await coverDoc.save();

  /* ── Merge ── */
  if (uploadedPdfBuffer) {
    try {
      const mergedDoc     = await PDFDocument.create();
      const coverSrc      = await PDFDocument.load(coverBytes);
      const uploadedSrc   = await PDFDocument.load(uploadedPdfBuffer);
      const coverPages    = await mergedDoc.copyPages(coverSrc,    coverSrc.getPageIndices());
      const uploadedPages = await mergedDoc.copyPages(uploadedSrc, uploadedSrc.getPageIndices());
      coverPages.forEach(p    => mergedDoc.addPage(p));
      uploadedPages.forEach(p => mergedDoc.addPage(p));
      return Buffer.from(await mergedDoc.save());
    } catch (err) {
      console.error("⚠️  PDF merge failed, cover-only:", err.message);
    }
  }
  return Buffer.from(coverBytes);
}
