const JobStatus = require("../../../model/modules/production/jobstatus");

// Get Job Status from MongoDB
exports.getJobStatus = async (req, res) => {
  try {
    const jobs = await JobStatus.find({});

    const statusCounts = {
      pending: jobs.filter((job) => job.status === "pending").length,
      inProgress: jobs.filter((job) => job.status === "inProgress").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      progressPercentage: jobs.find((job) => job.status === "inProgress")?.progress || 0,
    };

    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get job status" });
  }
};
