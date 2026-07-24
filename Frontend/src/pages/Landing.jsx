import React from 'react'
import './landing.scss'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import dashboardPreview from "../assets/dashboard.png";

const steps = [
    {
        n: '1',
        title: 'Paste the job description',
        badge: 'Required',
        badgeColor: 'pink',
        desc: "This is the one input every interview plan needs \u2014 the target role Gemini AI will prepare you for.",
    },
    {
        n: '2',
        title: 'Upload resume or write a self-description',
        badge: 'Optional \u00b7 Recommended',
        badgeColor: 'blue',
        desc: "Either one sharpens the AI's understanding of your background, producing more personalized questions and a more accurate match score.",
    },
    {
        n: '3',
        title: 'Gemini AI analyzes your profile and the job',
        desc: "The AI cross-references what you provided against the target role's requirements.",
    },
    {
        n: '4',
        title: 'Receive your personalized interview report',
        tags: ['Technical questions', 'Behavioral questions', 'Match score', 'Skill gap analysis', 'Learning roadmap'],
    },
]

const Landing = () => {
    const navigate = useNavigate()
    const { user, loading } = useAuth()

    const handleGetStarted = () => {
        if (loading) return
        navigate(user ? '/dashboard' : '/login')
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const scrollToAbout = () => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className='landing-page'>

            {/* Navbar */}
            <nav className='landing-nav'>
                <div className='landing-nav__brand'>
                    Interview Prep <span className='highlight'>AI</span>
                </div>
                <div className='landing-nav__links'>
                    <button className='nav-link' onClick={scrollToTop}>Home</button>
                    <button className='nav-link' onClick={scrollToAbout}>About</button>
                    <button className='nav-link' onClick={() => navigate('/login')}>Login</button>
                </div>
            </nav>

            {/* Hero */}
            <header className='landing-hero'>
                <div className='landing-hero__content'>
                    <span className='eyebrow-badge'>
                        <i className='ti ti-sparkles' aria-hidden='true' />
                        Powered by Gemini AI
                    </span>
                    <h1>
                        Ace your next technical<br />interview <br /> <span className='highlight'>with AI</span>
                    </h1>
                    <p>
                        Paste a job description and let Gemini AI build your personalized
                        interview plan &mdash; technical questions, behavioral questions,
                        match score, and a skill gap roadmap.
                    </p>
                    <div className='landing-hero__actions'>
                        <button className='btn btn--primary' onClick={handleGetStarted}>
                            <i className='ti ti-rocket' aria-hidden='true' />
                            Get Started
                        </button>
                        <button className='btn btn--ghost' onClick={scrollToAbout}>
                            See how it works
                        </button>
                    </div>
                </div>

                <div className='landing-hero__preview'>
                    <div className='preview-glow' />
                    <img
                        src={dashboardPreview}
                        alt="Interview Prep AI Dashboard"
                        className="dashboard-preview"
                    />
                </div>
            </header>

            {/* How to get the best results */}
            <section className='landing-steps' id='how-it-works'>
                <div className='section-heading'>
                    <h2>How to get the best interview results</h2>
                    <p>One input is required. Everything else improves the accuracy of your report.</p>
                </div>

                <div className='steps-timeline'>
                    {steps.map((s, i) => (
                        <div className='timeline-row' key={s.n}>
                            <div className='timeline-row__marker'>
                                <span className={`timeline-row__number ${s.badgeColor ? `timeline-row__number--${s.badgeColor}` : ''}`}>
                                    {s.n}
                                </span>
                                {i < steps.length - 1 && <span className='timeline-row__line' />}
                            </div>
                            <div className='timeline-row__content'>
                                <div className='timeline-row__heading'>
                                    <h4>{s.title}</h4>
                                    {s.badge && (
                                        <span className={`step-badge step-badge--${s.badgeColor}`}>{s.badge}</span>
                                    )}
                                </div>
                                {s.desc && <p>{s.desc}</p>}
                                {s.tags && (
                                    <div className='timeline-row__tags'>
                                        {s.tags.map((t) => (
                                            <span className='tag-pill' key={t}>{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className='landing-cta'>
                <div className='landing-cta__card'>
                    <h2>Start Preparing Like Top Candidates</h2>
                    <p>Paste a job description and get your first AI interview plan in under a minute.</p>
                    <button className='btn btn--primary' onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className='landing-footer'>
                <span>Interview Prep AI</span>
                <span className='landing-footer__divider'>&bull;</span>
                <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
            </footer>
        </div>
    )
}

export default Landing
