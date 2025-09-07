import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  personal: {
    name: String,
    email: String,
  },
  education: String,
  experience: String,
  skills: String,
}, { timestamps: true });

export default mongoose.model("Resume", ResumeSchema);
