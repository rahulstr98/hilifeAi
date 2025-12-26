const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignElevatorPortSchema = new Schema({
  company: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
    required: true,
  },
  elevatorPort: {
    type: String,
    required: true,
  },
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
    },
  ],
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
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AssignElevatorPort', AssignElevatorPortSchema);
