const express = require('express');
const interviewRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middlewares/file.middleware');
const uploadResume = require("../middlewares/upload.middleware");


interviewRouter.post('/', authMiddleware.authUser, uploadResume, interviewController.generateInterviewReportController);



interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)



interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)



interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)



interviewRouter.delete("/:interviewReportId", authMiddleware.authUser, interviewController.deleteInterviewReportController)

module.exports = interviewRouter;