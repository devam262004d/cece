const express = require("express");
const router = express.Router();
const signupLimiter = require("../middleware/rateLimiter");
const tokenVerify = require("../middleware/verifyToken");

const {createInterviewJob, getJob} =  require("./interviewJobController");


router.post("/createInterviewJob",signupLimiter,tokenVerify, createInterviewJob);
router.get("/getJob/",tokenVerify,getJob);


module.exports = router;