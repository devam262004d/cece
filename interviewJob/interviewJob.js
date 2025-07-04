const mongoose = require("mongoose");


const interviewJobSchema = new mongoose.Schema({
    interviwerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: [],
    },
    interviewCode: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    interviewStatus: {
        type: String,
        enum: ["scheduled", "in-progress", "completed", "canceled"],
        default: "scheduled",
    },
    interviewerJoined: {
        type: Boolean,
        default: false
    },
    candidateJoined: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    InterviewType:{
        type: String,
        enum:["Technical", "HR", "Managerial"],
        required:true
    },
    status:{
        type:String,
        enum:["live", "closed", "draft"],
        default:"draft"
    }
});

module.exports = mongoose.model("InterviewJob", interviewJobSchema);