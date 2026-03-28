import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Paper from "./models/Paper.js";
import Message from "./models/Message.js";
import { sendPaperAck, sendPaperNotifyDean, sendContactAck } from "./mailer.js";
import { buildMergedPdf } from "./pdfMerge.js";

const app  = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || "jssstuniv.in";

/* ── Middleware ── */
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // and any origin — restrict further via CLIENT_ORIGIN env if needed
    const allowed = process.env.CLIENT_ORIGIN;
    if (!allowed || !origin || origin === allowed) return callback(null, true);
    // Also allow localhost for local dev
    if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) return callback(null, true);
    return callback(null, true); // allow all for now — tighten after deploy confirmed
  },
  credentials: true,
}));
app.use(express.json());

/* ── Multer — PDF only, max 10 MB ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed."));
  },
});

/* ── MongoDB ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

/* ── Helpers ── */
function normalize(str) { return str.toLowerCase().replace(/\s+/g, " ").trim(); }
function isAllowedEmail(email) { return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`); }
function generateAck(prefix) {
  const ts   = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

/* ════════════════════════════════════════════
   PAPER ROUTES
   ════════════════════════════════════════════ */

/* POST /api/papers */
app.post("/api/papers", upload.single("paperFile"), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || "{}");

    /* 1. Domain check */
    if (!isAllowedEmail(data.email)) {
      return res.status(400).json({
        error: "INVALID_DOMAIN",
        message: `Only @${ALLOWED_DOMAIN} email addresses are accepted.`,
      });
    }

    const titleNorm     = normalize(data.paperTitle);
    const authorNorm    = normalize(data.name);
    const publisherNorm = normalize(data.publisher);

    /* 2a. Duplicate: same title + same publisher */
    const dupTitlePub = await Paper.findOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: "$paperTitle" }, titleNorm] },
          { $eq: [{ $toLower: "$publisher"  }, publisherNorm] },
        ],
      },
    });
    if (dupTitlePub) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: `The paper "${data.paperTitle}" is already registered with publisher "${data.publisher}". The same paper cannot be submitted twice regardless of author.`,
        ackNumber: dupTitlePub.ackNumber,
      });
    }

    /* 2b. Duplicate: same author + same title */
    const dupAuthorTitle = await Paper.findOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: "$paperTitle" }, titleNorm] },
          { $eq: [{ $toLower: "$name"       }, authorNorm] },
        ],
      },
    });
    if (dupAuthorTitle) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: `You (${data.name}) have already submitted a paper titled "${data.paperTitle}".`,
        ackNumber: dupAuthorTitle.ackNumber,
      });
    }

    /* 3. Save */
    const ackNumber = generateAck("OPOC");
    const paper = new Paper({
      ...data,
      ackNumber,
      fileName: req.file?.originalname || data.fileName || "",
    });
    await paper.save();

    /* 4. Build merged PDF (cover sheet + uploaded paper) */
    let mergedPdfBuffer = null;
    const mergedFileName = `OPOC-Report-${ackNumber}.pdf`;
    try {
      mergedPdfBuffer = await buildMergedPdf(
        { ackNumber, data, submittedAt: paper.createdAt },
        req.file?.buffer || null
      );
      console.log(`✅ Merged PDF built — ${(mergedPdfBuffer.length / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error("❌ PDF merge error:", err.message);
    }

    /* 4a. Email — applicant (with merged PDF) */
    try {
      await sendPaperAck({
        to: data.email,
        name: `${data.prefix} ${data.name}`,
        ackNumber,
        data,
        submittedAt: paper.createdAt,
        pdfBuffer: mergedPdfBuffer,
        pdfName:   mergedFileName,
      });
      console.log(`✅ Applicant email sent → ${data.email}`);
    } catch (err) {
      console.error("❌ Applicant email failed:", err.message);
    }

    /* 4b. Email — Office of Dean Research (with merged PDF) */
    try {
      await sendPaperNotifyDean({
        ackNumber,
        data,
        submittedAt: paper.createdAt,
        pdfBuffer:   mergedPdfBuffer,
        pdfName:     mergedFileName,
      });
      const deanMail = process.env.DEAN_RESEARCH_MAIL || "office.deanres@jssstuniv.in";
      console.log(`✅ Dean Research email sent → ${deanMail}`);
    } catch (err) {
      console.error("❌ Dean Research email failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      ackNumber,
      message: "Paper submitted successfully.",
    });

  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "FILE_TOO_LARGE", message: "File must not exceed 10 MB." });
    }
    console.error("POST /api/papers error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Submission failed. Please try again." });
  }
});

/* GET /api/papers — with search, type, dept, sort filters */
app.get("/api/papers", async (req, res) => {
  try {
    const { q, type, dept, sort, limit } = req.query;
    const filter = {};

    if (type && type !== "All") filter.paperType  = type;
    if (dept && dept !== "All") filter.department = dept;

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { paperTitle: regex }, { name: regex }, { department: regex },
        { journal: regex }, { indexing: regex }, { publisher: regex },
        { authorType: regex }, { designation: regex }, { doi: regex },
        { articleType: regex }, { domainType: regex }, { empId: regex },
      ];
    }

    /* Sort options */
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === "journal_asc")  sortObj = { journal: 1 };
    if (sort === "journal_desc") sortObj = { journal: -1 };
    if (sort === "date_asc")     sortObj = { publishingDate: 1 };
    if (sort === "date_desc")    sortObj = { publishingDate: -1 };
    if (sort === "newest")       sortObj = { createdAt: -1 };
    if (sort === "oldest")       sortObj = { createdAt: 1 };

    let query = Paper.find(filter).sort(sortObj).select("-__v");
    if (limit) query = query.limit(parseInt(limit));

    const papers = await query.lean();
    return res.json({ success: true, papers });
  } catch (err) {
    console.error("GET /api/papers error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to fetch papers." });
  }
});

/* GET /api/papers/count */
app.get("/api/papers/count", async (req, res) => {
  try {
    const count = await Paper.countDocuments();
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to fetch count." });
  }
});

/* GET /api/papers/latest — latest 6 for home/search landing */
app.get("/api/papers/latest", async (req, res) => {
  try {
    const papers = await Paper.find({}).sort({ createdAt: -1 }).limit(6).select("-__v").lean();
    return res.json({ success: true, papers });
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to fetch latest." });
  }
});

/* ════════════════════════════════════════════
   CONTACT ROUTES
   ════════════════════════════════════════════ */

/* POST /api/contact */
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        error: "INVALID_DOMAIN",
        message: `Only @${ALLOWED_DOMAIN} email addresses are accepted.`,
      });
    }

    const ackNumber = generateAck("MSG");
    const msg = new Message({ ackNumber, name, email, phone, subject, message });
    await msg.save();

    try {
      await sendContactAck({ to: email, name, ackNumber, subject, createdAt: msg.createdAt });
      console.log(`✅ Contact ack email sent → ${email}`);
    } catch (err) {
      console.error("❌ Contact email failed:", err.message);
    }

    return res.status(201).json({ success: true, ackNumber });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to send message." });
  }
});

/* ── Health ── */
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
