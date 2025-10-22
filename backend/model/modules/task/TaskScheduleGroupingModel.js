const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TaskScheduleGroupingSchema = new Schema({

    category: {
        type: String,
        required: false,
    },
    subcategory: {
        type: String,
        required: false,
    },
    startTime: {
        type: [String],
        required: false,
    },
    endTime: {
        type: [String],
        required: false,
    },
    startTimeSchedule: {
        type: [String],
        required: false,
    },
    state: {
        type: String,
        required: false,
    },
    endTimeSchedule: {
        type: [String],
        required: false,
    },
    timetodo:[
        {
          hour: {
            type: String,
            required: false,
          },
          min: {
            type: String,
            required: false,
          },
          timetype: {
            type: String,
            required: false,
          },
        }
      ],

      monthdate: {
        type: String,
        required: false,
    },
    weekdays: {
        type: [String],
        required: false,
    },
    datewise: {
        type: String,
        required: false,
    },
    annumonth: {
        type: String,
        required: false,
    },
    annuday: {
        type: String,
        required: false,
    },
    frequency: {
        type: String,
        required: false,
    },
    duration: {
        type: String,
        required: false,
    },
    breakup: {
        type: String,
        required: false,
    },
    breakupcount: {
        type: String,
        required: false,
    },
    schedule: {
        type: String,
        required: false,
    },
    required: {
        type: [String],
        required: false,
    },

    tableFormat:[{
        sno: {
            type: String,
            required: false,
        },
        task: {
            type: String,
            required: false,
        },
        subtask: {
            type: String,
            required: false,
        },
        totalduration: {
            type: String,
            required: false,
        },
        breakupcount: {
            type: String,
            required: false,
        },
        startDate: {
            type: String,
            required: false,
        },
        startTime: {
            type: String,
            required: false,
        },
        endDate: {
            type: String,
            required: false,
        },
        endTime: {
            type: String,
            required: false,
        },
        reason: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            required: false,
        },

    }]
,
    addedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },

        }],
    updatedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },

        }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('TaskScheduleGrouping', TaskScheduleGroupingSchema);