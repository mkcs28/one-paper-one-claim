import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Paper from "./models/Paper.js";
import Message from "./models/Message.js";
import { sendPaperAck, sendContactAck } from "./mailer.js";

const app  = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || "jssstuniv.in";

/* ── Middleware ── */
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

/* ── Multer — PDF upload, max 2 MB ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed."));
  },
});

/* ── MongoDB Connection ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

/* ── Helpers ── */
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function isAllowedEmail(email) {
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

function generateAck(prefix) {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

/* ════════════════════════════════════════════
   PAPER ROUTES
   ════════════════════════════════════════════ */

/* POST /api/papers — submit a new paper */
app.post("/api/papers", upload.single("paperFile"), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || "{}");

    /* 1. Domain validation */
    if (!isAllowedEmail(data.email)) {
      return res.status(400).json({
        error: "INVALID_DOMAIN",
        message: `Only @${ALLOWED_DOMAIN} email addresses are accepted.`,
      });
    }

    /* 2. Duplicate check rules:
          Rule A — Same title + same publisher (any author) → BLOCKED
          Rule B — Same author + same title (any publisher) → BLOCKED
          Different author + same title + different publisher → ALLOWED
    */
    const titleNorm     = normalize(data.paperTitle);
    const authorNorm    = normalize(data.name);
    const publisherNorm = normalize(data.publisher);

    /* Rule A: same title + same publisher */
    const dupTitlePublisher = await Paper.findOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: "$paperTitle" }, titleNorm] },
          { $eq: [{ $toLower: "$publisher" }, publisherNorm] },
        ],
      },
    });

    if (dupTitlePublisher) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: `The paper "${data.paperTitle}" is already registered with publisher "${data.publisher}". The same paper cannot be submitted twice regardless of author.`,
        ackNumber: dupTitlePublisher.ackNumber,
      });
    }

    /* Rule B: same author + same title (different publisher allowed for different papers) */
    const dupAuthorTitle = await Paper.findOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: "$paperTitle" }, titleNorm] },
          { $eq: [{ $toLower: "$name" }, authorNorm] },
        ],
      },
    });

    if (dupAuthorTitle) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: `You (${data.name}) have already submitted a paper titled "${data.paperTitle}". Each author may submit a unique paper title only once.`,
        ackNumber: dupAuthorTitle.ackNumber,
      });
    }

    /* 3. Save to MongoDB */
    const ackNumber = generateAck("OPOC");
    const paper = new Paper({
      ...data,
      ackNumber,
      fileName: req.file?.originalname || data.fileName || "",
    });
    await paper.save();

    /* 4. Send acknowledgement email */
    try {
      await sendPaperAck({
        to: data.email,
        name: `${data.prefix} ${data.name}`,
        ackNumber,
        paperTitle: data.paperTitle,
        paperType:  data.paperType,
        journal:    data.journal,
        submittedAt: paper.createdAt,
      });
      console.log(`✅ Ack email sent to ${data.email}`);
    } catch (mailErr) {
      console.error("❌ Email send failed:", mailErr.message);
      console.error("   Recipient:", data.email);
      console.error("   MAIL_USER:", process.env.MAIL_USER);
      console.error("   Tip: Check App Password and that 2FA is enabled on Gmail");
    }

    return res.status(201).json({
      success: true,
      ackNumber,
      message: "Paper submitted successfully. Acknowledgement sent to your email.",
    });

  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "FILE_TOO_LARGE", message: "File must not exceed 2 MB." });
    }
    console.error("POST /api/papers error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Submission failed. Please try again." });
  }
});

/* GET /api/papers — fetch all papers (latest first) */
app.get("/api/papers", async (req, res) => {
  try {
    const { q, type, dept } = req.query;
    const filter = {};

    if (type && type !== "All") filter.paperType = type;
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

    const papers = await Paper.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return res.json({ success: true, papers });
  } catch (err) {
    console.error("GET /api/papers error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to fetch papers." });
  }
});

/* GET /api/papers/count — for live counter on home page */
app.get("/api/papers/count", async (req, res) => {
  try {
    const count = await Paper.countDocuments();
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to fetch count." });
  }
});

/* ════════════════════════════════════════════
   CONTACT / MESSAGE ROUTES
   ════════════════════════════════════════════ */

/* POST /api/contact — submit a grievance/message */
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    /* Domain validation */
    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        error: "INVALID_DOMAIN",
        message: `Only @${ALLOWED_DOMAIN} email addresses are accepted.`,
      });
    }

    const ackNumber = generateAck("MSG");
    const msg = new Message({ ackNumber, name, email, phone, subject, message });
    await msg.save();

    /* Send ack email */
    try {
      await sendContactAck({
        to: email,
        name,
        ackNumber,
        subject,
        createdAt: msg.createdAt,
      });
    } catch (mailErr) {
      console.warn("⚠️  Email failed (message saved):", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      ackNumber,
      message: "Message received. Acknowledgement sent to your email.",
    });

  } catch (err) {
    console.error("POST /api/contact error:", err);
    return res.status(500).json({ error: "SERVER_ERROR", message: "Failed to send message. Please try again." });
  }
});

/* ── Health check ── */
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

/* ── Start ── */
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
