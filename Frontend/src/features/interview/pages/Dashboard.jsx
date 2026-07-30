import { useState, useRef, useEffect } from 'react'
import { toast } from "sonner";
import "../style/dashboard.scss"
import { useInterview } from '../hooks/useinterview.js'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from '../../../components/ConfirmationModal.jsx'

const Dashboard = () => {

    const { loading, generateReport, reports, getReports, removeInterviewReport } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedResume, setSelectedResume] = useState(null);
    const resumeInputRef = useRef()

    const navigate = useNavigate()
    useEffect(() => {
        getReports()
    }, [])

    const handleGenerateReport = async () => {
        try {
            const resumeFile = resumeInputRef.current.files[0];
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            });
            toast.success("Interview report generated successfully!");
            navigate(`/interview/${data._id}`);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Failed to generate interview report."
            );
        }
    }
    const handleDeleteInterview = async () => {

        if (!selectedReport) return;

        try {

            await removeInterviewReport(selectedReport._id);
            toast.success("Interview report deleted successfully!");
            setDeleteModalOpen(false);
            setSelectedReport(null);

        } catch (error) {
            console.error(error);
            toast.error("Failed to delete interview report.");

        }

    }

    const isFormValid = jobDescription.trim();

    return (
        <>

            <div className='dashboard-page'>

                {/* Page Header */}
                <header className='page-header'>
                    <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                    <p>Paste a job description to instantly generate an AI-powered interview strategy.
                        Optionally add your resume or tell us about yourself for a more personalized experience.</p>
                </header>

                {/* Main Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>

                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </span>
                                <h2>Target Job Description</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>
                            <textarea
                                onChange={(e) => { setJobDescription(e.target.value) }}
                                className='panel__textarea'
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                                maxLength={5000}
                            />
                            <div className="char-counter">
                                {jobDescription.length} / 5000 chars
                            </div>
                        </div>
                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <h2>Improve Your Results</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <label className='section-label'>
                                    Upload Resume
                                    <span className='badge badge--best'>Recommended</span>
                                </label>

                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    {selectedResume ? (
                                        <p className="dropzone__title">
                                            {selectedResume.name}
                                        </p>
                                    ) : (
                                        <>
                                            <p className="dropzone__title">
                                                Click to upload or drag & drop
                                            </p>

                                            <p className="dropzone__subtitle">
                                                PDF or DOCX (Max 3MB)
                                            </p>
                                        </>
                                    )}

                                    <input
                                        ref={resumeInputRef}
                                        hidden
                                        type="file"
                                        id="resume"
                                        accept=".pdf,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files[0];

                                            if (!file) return;

                                            const MAX_SIZE = 3 * 1024 * 1024; // 3 MB

                                            if (file.size > MAX_SIZE) {
                                                toast.error("File size must be less than 3 MB.");
                                                e.target.value = "";
                                                setSelectedResume(null);
                                                return;
                                            }

                                            setSelectedResume(file);
                                        }}
                                    />
                                </label>
                            </div>


                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                                <textarea
                                    onChange={(e) => { setSelfDescription(e.target.value) }}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Tell us about your skills, projects, experience,
or career goals. This helps the AI personalize
your interview strategy."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                                </span>
                                <p>
                                    Start with just the <strong>Job Description</strong>.
                                    Add your <strong>Resume</strong> or a <strong>Self Description</strong> to unlock
                                    more personalized interview questions, a more accurate match score, and a tailored
                                    preparation roadmap.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                        <button
                            onClick={handleGenerateReport}
                            className="generate-btn"
                            disabled={loading || !isFormValid}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                                    Generate My Interview Strategy
                                </>
                            )}
                        </button>

                    </div>
                </div>

                {/* Recent Reports List */}
                <section className="recent-reports">
                    <h2>My Recent Interview Plans</h2>

                    {reports.length > 0 ? (

                        <ul className='reports-list'>
                            {reports.map(report => (
                                <li
                                    key={report._id}
                                    className="report-item"
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                >
                                    <div className="report-header">
                                        <h3>{report.title || "Untitled Position"}</h3>

                                        <button
                                            className="delete-btn"
                                            title="Delete Interview"
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                setSelectedReport(report);
                                                setDeleteModalOpen(true);
                                            }}
                                        >
                                            <i className="ti ti-trash"></i>
                                        </button>
                                    </div>

                                    <p className="report-meta">
                                        Generated on {new Date(report.createdAt).toLocaleDateString()}
                                    </p>

                                    <p
                                        className={`match-score ${report.matchScore >= 80
                                            ? "score--high"
                                            : report.matchScore >= 60
                                                ? "score--mid"
                                                : "score--low"
                                            }`}
                                    >
                                        Match Score: {report.matchScore}%
                                    </p>
                                </li>
                            ))}
                        </ul>

                    ) : (

                        <div className="empty-state">

                            <div className="empty-icon">
                                <i className="ti ti-file-search"></i>
                            </div>

                            <h3>No Interview Plans Yet</h3>

                            <p>
                                Generate your first AI-powered interview strategy
                                to get started.
                            </p>

                        </div>

                    )}
                </section>


                {/* Page Footer */}




                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    title="Delete Interview?"
                    message="This interview report will be permanently deleted."
                    confirmText="Delete"
                    onConfirm={handleDeleteInterview}
                    onClose={() => setDeleteModalOpen(false)}
                />
            </div>
        </>
    )
}

export default Dashboard