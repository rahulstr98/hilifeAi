module.exports = {
  // 🔁 KeepAlive → which flag to raise
  keepAlive: {
    REMOTE: { Remote: 1 },
    ADD_PEOPLE: { AddPeople: 1 },
    DELETE_PEOPLE: { DeletePeople: 1 },
    SYNC_PARAM: { SyncParameter: 1 },
    UPLOAD_WORK_PARAM: { UploadWorkParameter: 1 },

    // ✅ New KeepAlive commands
    PUSH_ALL_PEOPLE: { PushAllPeople: 1 },
    REPOST_RECORD: { RepostRecord: 1 },
    CLEAR_RECORD: { ClearRecord: 1 },
    CLOSE_ALARM: { Closealarm: 1 }
  },

  // 🎯 RemoteCommand → actual device instructions
  remoteCommand: {
    RESTART: { Restart: 1 },
    FACTORY_RESET: { Recover: 1 },
    OPEN_DOOR: (payload) => ({ Opendoor: payload?.mode ?? 1 }),
    CLOSE_ALARM: { Closealarm: 1 },
    REPOST_RECORD: { RepostRecord: 1 },
    PUSH_ALL_PEOPLE: { PushAllPeople: 1 },
    QUERY_PEOPLE: (payload) => ({ QueryPeople: payload?.userIds || [] }),
    CLEAR_RECORD: { ClearRecord: 1 }
  }
};
