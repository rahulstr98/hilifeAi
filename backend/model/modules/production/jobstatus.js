const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const JobStatusSchema = new Schema({
  batchId: { type: String, required: true },
  jobId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  status: { type: String, enum: ["pending", "inProgress", "completed", "failed"], default: "pending" },
  progress: { type: Number, default: 0 }, // Progress % (0 - 100)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobStatus", JobStatusSchema);
