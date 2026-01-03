const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boweeDeviceCommandQueueSchema = new mongoose.Schema(
  {
    deviceSn: {
      type: String,
      required: true,
      index: true
    },

    // KeepAlive-level command
    commandType: {
      type: String,
      required: true,
      enum: [
        "REMOTE",
        "ADD_PEOPLE",
        "DELETE_PEOPLE",
        "SYNC_PARAM",
        "UPLOAD_WORK_PARAM"
      ]
    },

    // 👇 RemoteCommand-specific action
    remoteAction: {
      type: String,
      enum: [
        "RESTART",
        "FACTORY_RESET",
        "OPEN_DOOR",
        "KEEP_DOOR_OPEN",
        "CLOSE_DOOR",
        "LOCK_DOOR",
        "UNLOCK_DOOR",
        "REPOST_RECORD",
        "PUSH_ALL_PEOPLE",
        "QUERY_PEOPLE",
        "CLEAR_RECORD"
      ]
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    status: {
      type: String,
      enum: ["PENDING", "EXECUTED", "FAILED"],
      default: "PENDING"
    },

    sentAt: Date
  },
  { timestamps: true }
);

boweeDeviceCommandQueueSchema.pre("validate", function (next) {
  if (this.commandType === "REMOTE" && !this.remoteAction) {
    return next(
      new Error("remoteAction is required when commandType is REMOTE")
    );
  }
  next();
});


module.exports = mongoose.model("BoweeDeviceCommandQueue" , boweeDeviceCommandQueueSchema);