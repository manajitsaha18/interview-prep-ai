const pdfParse = require('pdf-parse');
const { generateInterviewReport, generateResumePdf } = require('../services/ai.service');
const interviewReportModel = require('../models/interviewReport.model');



async function generateInterviewReportController(req, res) {

    try {

        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        let resumeText = "";

        if (req.file) {
            const resumeContent = await (
                new pdfParse.PDFParse(
                    Uint8Array.from(req.file.buffer)
                )
            ).getText();

            resumeText = resumeContent.text;
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error(error);

        if (error.status === 429) {
            return res.status(429).json({
                message: "AI request limit reached. Please try again later."
            });
        }

        res.status(500).json({
            message: "Internal Server Error"
        });
    }

}



async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}



async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}



async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("Resume generation failed:", error);

        res.status(error.status || 500).json({
            message: error.message || "Unable to generate resume."
        });
    }
}


async function deleteInterviewReportController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOneAndDelete({
        _id: interviewReportId,
        user: req.user.id,
    });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found.",
        });
    }

    res.status(200).json({
        message: "Interview report deleted successfully.",
    });
}


module.exports = {
    generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController,
    deleteInterviewReportController
}