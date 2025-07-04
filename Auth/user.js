const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    gender: { type: String, enum:["Male", "Female", "Other"]},
    photo: { type: String },
    accoutnType: { type: String, enum: ["Interviewer", "Candidate"], default: "Candidate"},
   
    password: { type: String },

    googleId: { type: String },

    signupType: { type: String, enum: ["manual", "google"], default: "manual" },
});

const User = mongoose.model("user", userSchema);
module.exports = User;