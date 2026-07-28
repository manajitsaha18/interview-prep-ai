import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useState } from "react"
import { InterviewContext } from "../interview.context"



export const useInterview = () => {

    const context = useContext(InterviewContext)
    const [resumeLoading, setResumeLoading] = useState(false)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            setLoading(false)
        }

    }


    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            setLoading(false)
        }
    }


    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            setLoading(false)
        }

    }


    const getResumePdf = async (interviewReportId) => {
        setResumeLoading(true)

        try {
            const response = await generateResumePdf({
                interviewReportId
            })

            const blob = new Blob(
                [response],
                { type: "application/pdf" }
            )

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement("a")

            link.href = url
            link.download = `resume_${interviewReportId}.pdf`

            link.style.display = "none"
            document.body.appendChild(link)

            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error("Resume generation failed:", error)
            throw error
        } finally {
            setResumeLoading(false)
        }
    }

    const removeInterviewReport = async (interviewReportId) => {

        setLoading(true);

        try {

            await deleteInterviewReport(interviewReportId);

            setReports(prev =>
                prev.filter(report => report._id !== interviewReportId)
            );

        } catch (error) {

            console.error(error);

            throw error;

        } finally {

            setLoading(false);

        }

    }




    return {
        loading,
        resumeLoading,
        report,
        reports,
        setReport,
        setReports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
        removeInterviewReport
    }

}