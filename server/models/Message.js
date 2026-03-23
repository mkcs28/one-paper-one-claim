import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    ackNumber: { type: String, unique: true, required: true },
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    phone:     { type: String, default: "" },
    subject:   { type: String, required: true },
    message:   { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
