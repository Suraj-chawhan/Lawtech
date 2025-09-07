import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pdf from "html-pdf";
import fs from "fs";
import dotenv from "dotenv";
import morgan from "morgan"
import User from "./models/User.js";
import Resume from "./models/Resume.js";

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/resume_builder";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(morgan("dev"))
app.use(express.static("public"))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// -------- AUTH ROUTES --------

// Signup
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.json({ message: "User created" });
  } catch {
    res.status(400).json({ message: "Email already exists" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// -------- RESUME ROUTES --------

// Create Resume
app.post("/resume", authMiddleware, async (req, res) => {
  const resume = new Resume({ ...req.body, userId: req.user.id });
  await resume.save();
  res.json(resume);
});

// Get All Resumes for Logged User
app.get("/resume", authMiddleware, async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(resumes);
});

// Update Resume
app.put("/resume/:id", authMiddleware, async (req, res) => {
  const updated = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// Delete Resume
app.delete("/resume/:id", authMiddleware, async (req, res) => {
  await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
});

// Download Resume as PDF

import PDFDocument from "pdfkit";

// Download Resume as PDF
app.get("/resume/:id/pdf", authMiddleware, async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ message: "Not found" });

  // Create PDF document
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
  doc.pipe(res);

  // Title
  doc.fontSize(20).text(resume.personal?.name || "No Name", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Email: ${resume.personal?.email || ""}`);
  doc.text(`Phone: ${resume.personal?.phone || ""}`);
  doc.moveDown();

  // Education
  doc.fontSize(16).text("Education", { underline: true });
  doc.fontSize(12).text(resume.education || "N/A");
  doc.moveDown();

  // Experience
  doc.fontSize(16).text("Experience", { underline: true });
  doc.fontSize(12).text(resume.experience || "N/A");
  doc.moveDown();

  // Skills
  doc.fontSize(16).text("Skills", { underline: true });
  doc.fontSize(12).text(resume.skills || "N/A");
  doc.moveDown();

  // End PDF
  doc.end();
});






// -------- START SERVER --------
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
