const InterviewJob = require('../interviewJob/interviewJob');
const mailSender = require("../utility/mailSender");

exports.createInterviewJob = async (req, res) => {
  try {
    console.log("this is createInterviewJob function");
    console.log(req.body);
    const { jobTitle, description, skills, scheduledAt, interviewType, draft, userEmail } = req.body;
   console.log(draft)
    if (!jobTitle || !description || !skills || !scheduledAt || !interviewType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const id = Math.floor(1000000000 + Math.random() * 9000000000);
    const interviewCode = id.toString();

    console.log("Generated:", { interviewCode, password });
    const user = req.user;

    if (userEmail) {
      const html = generateInterviewEmail(
        interviewCode,
        password,
        scheduledAt
      );
      mailSender(userEmail, "Your Interview Details", html);
    }

    const job = new InterviewJob({
      interviwerId: user.id,
      jobTitle: jobTitle,
      description: description,
      skills: skills,
      scheduledAt: scheduledAt,
      InterviewType: interviewType,
      interviewCode: interviewCode,
      password: password,
      interviewStatus: "scheduled",
      status: draft ? "draft" : "live"
    })

    await job.save();
    return res.status(201).json({
      message: "Interview job created successfully",
      interviewCode,
      password,
    });
  } catch (error) {
    console.error("Error in createInterviewJob:", error.message);
    return res.status(500).json({ message: error.message });
  }
};



exports.getJob = async (req, res) => {
  try {
    const search = req.query.q || "";
    const status = req.query.status || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    console.log("status", status)
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.jobTitle = { $regex: search, $options: "i" }
    }
    const jobs = await InterviewJob.find(filter).skip(skip).limit(limit);
    const totalJobs = await InterviewJob.countDocuments(filter);
    return res.status(200).json({
      data: jobs,
      totalJobs: totalJobs,
      currentPage: page,
      message: "Jobs fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}





function generateInterviewEmail(interviewCode, password, interviewDate = "Not specified") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2c3e50; text-align: center;">🎯 Interview Invitation</h2>

      <p style="font-size: 16px; color: #444;">Hello Candidate,</p>

      <p style="font-size: 16px; color: #444;">
        You are invited to attend an interview. Please find your interview details below:
      </p>

      <div style="background-color: #f9f9f9; padding: 15px 20px; border-left: 4px solid #1976d2; margin: 20px 0; border-radius: 5px;">
        <p style="font-size: 16px; margin: 0;"><strong>📅 Date:</strong> <span>${interviewDate}</span></p>
        <p style="font-size: 16px; margin: 0;"><strong>🔐 Interview Code:</strong> <span style="color: #1976d2;">${interviewCode}</span></p>
        <p style="font-size: 16px; margin: 0;"><strong>🔑 Password:</strong> <span style="color: #1976d2;">${password}</span></p>
      </div>


      <p style="font-size: 15px; color: #555; margin-top: 30px;">
        Please ensure you are ready and available at the scheduled time. Use the above code and password to join.
      </p>

      <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
        This is an automated message. Do not reply.
      </p>
    </div>
  `;
}
