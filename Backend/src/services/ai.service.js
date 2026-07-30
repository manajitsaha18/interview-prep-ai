const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).nullable().describe(
        "A score between 0 and 100 comparing the candidate profile with the job description. Return null if neither a Resume nor a Self Description is provided."
    ),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    let prompt = `Generate a personalized interview preparation report based on the following information.\n\n`;

    prompt += `Job Description:\n${jobDescription}\n\n`;

    if (resume?.trim()) {
        prompt += `Candidate Resume:\n${resume}\n\n`;
    }

    if (selfDescription?.trim()) {
        prompt += `Candidate Self Description:\n${selfDescription}\n\n`;
    }

    prompt += `
Instructions:
- Job Description is the primary source of truth.
- Resume and Self Description are optional and should only be used to personalize the report.
- If Resume or Self Description is not provided, do not assume any missing information.
- Generate realistic interview questions.
- Calculate a match score ONLY when at least one of the following is provided:
  - Candidate Resume
  - Candidate Self Description

- If neither the Resume nor the Self Description is provided:
  - Set matchScore to null.
  - Do NOT guess or estimate a score.

- A match score compares the candidate profile against the job requirements. If there is no candidate information, there is nothing to compare.
- Identify skill gaps only from the available candidate information.

- If neither Resume nor Self Description is provided:
  - Do NOT list candidate skill gaps.
  - Instead, explain that more candidate information is needed to perform a meaningful skill-gap analysis.
- Create a practical preparation plan.
`;

    try {


        const response = await generateContentWithRetry({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            }
        });

        return JSON.parse(response.text);

    } catch (primaryError) {

        const status =
            primaryError.status ||
            primaryError.response?.status;


        if (status === 503 || status === 429) {

            console.warn(
                `Primary Gemini model unavailable (${status}). Trying secondary model for interview report...`
            );

            try {


                const fallbackResponse = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: zodToJsonSchema(interviewReportSchema),
                    }
                });

                return JSON.parse(fallbackResponse.text);

            } catch (secondaryError) {

                console.error(
                    "Both Gemini models failed for interview report:",
                    secondaryError
                );

                const error = new Error(
                    "AI service is temporarily unavailable. Please try again shortly."
                );

                error.status = 503;

                throw error;
            }
        }

        throw primaryError;
    }


}


async function generatePdfFromHtml(htmlContent) {

    let browser;

    try {
        browser = await puppeteer.launch();

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "domcontentloaded"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true
        });

        return pdfBuffer;

    } finally {

        if (browser) {
            await browser.close();
        }
    }
}


async function generateContentWithRetry(options, maxRetries = 3) {


    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent(options);

        } catch (error) {
            const status = error.status || error.response?.status;


            if (status !== 503 || attempt === maxRetries) {
                throw error;
            }

            const delay = 1000 * attempt;

            console.log(
                `Gemini unavailable. Retrying (${attempt}/${maxRetries}) in ${delay}ms...`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


function generateTargetResumeHtml(data) {

    const escapeHtml = (value = "") =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const safeUrl = (url = "") => {
        const value = String(url).trim();

        if (!value) return "";

        if (/^https?:\/\//i.test(value)) {
            return value;
        }

        return `https://${value}`;
    };

    const contact = data.contact || {};
    const skills = data.skills || {};
    const projects = data.projects || [];
    const education = data.education || [];
    const certifications = data.certifications || [];

    const contactItems = [
        contact.email &&
        `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`,

        contact.phone &&
        `<span>${escapeHtml(contact.phone)}</span>`,

        contact.linkedin &&
        `<a href="${escapeHtml(safeUrl(contact.linkedin))}">LinkedIn</a>`,

        contact.github &&
        `<a href="${escapeHtml(safeUrl(contact.github))}">GitHub</a>`,

        contact.portfolio &&
        `<a href="${escapeHtml(safeUrl(contact.portfolio))}">Portfolio</a>`
    ].filter(Boolean);

    const skillRows = [
        ["Languages & Technologies", skills.languages],
        ["Frameworks & Libraries", skills.frameworks],
        ["Databases & Web Technologies", skills.databases],
        ["Tools & Platforms", skills.tools]
    ]
        .filter(([, values]) => Array.isArray(values) && values.length)
        .map(([label, values]) => `
            <div class="skill-row">
                <span class="skill-label">${escapeHtml(label)}:</span>
                <span>${values.map(escapeHtml).join(", ")}</span>
            </div>
        `)
        .join("");

    const projectsHtml = projects
        .slice(0, 4)
        .map(project => {

            const projectLinks = [
                project.liveDemo &&
                `<a href="${escapeHtml(safeUrl(project.liveDemo))}">Live Demo</a>`,

                project.github &&
                `<a href="${escapeHtml(safeUrl(project.github))}">GitHub</a>`
            ].filter(Boolean).join(" | ");

            const bullets = (project.bullets || [])
                .slice(0, 3)
                .map(bullet => `<li>${escapeHtml(bullet)}</li>`)
                .join("");

            return `
                <div class="project">
                    <div class="project-heading">
                        <div>
                            <strong>${escapeHtml(project.name)}</strong>
                            ${project.description
                    ? ` — ${escapeHtml(project.description)}`
                    : ""
                }
                        </div>

                        ${projectLinks
                    ? `<div class="links">${projectLinks}</div>`
                    : ""
                }
                    </div>

                    ${project.techStack?.length
                    ? `
                            <div class="tech-stack">
                                <strong>Tech Stack |</strong>
                                ${project.techStack.map(escapeHtml).join(", ")}
                            </div>
                            `
                    : ""
                }

                    ${bullets
                    ? `<ul>${bullets}</ul>`
                    : ""
                }
                </div>
            `;
        })
        .join("");

    const educationHtml = education
        .map(item => `
            <div class="education-item">

                <div class="education-main">
                    <strong>${escapeHtml(item.degree)}</strong>

                    ${item.score
                ? `<span>${escapeHtml(item.score)}</span>`
                : ""
            }
                </div>

                <div class="education-main">
                    <span>${escapeHtml(item.institution)}</span>

                    ${item.duration
                ? `<span>${escapeHtml(item.duration)}</span>`
                : ""
            }
                </div>

            </div>
        `)
        .join("");

    const certificationsHtml = certifications
        .map(cert => `
            <div class="certification-item">
                <strong>${escapeHtml(cert.name)}</strong>

                ${cert.issuer
                ? ` — ${escapeHtml(cert.issuer)}`
                : ""
            }

                ${cert.date
                ? ` — ${escapeHtml(cert.date)}`
                : ""
            }
            </div>
        `)
        .join("");

    return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

    @page {
    size: A4;
    margin: 8mm 10mm;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;

   
    font-family: Calibri, Arial, Helvetica, sans-serif;

    
    font-size: 12pt;
    line-height: 1.15;

    color: #111;
    background: #fff;
}

.resume {
    width: 100%;
}


.header {
    text-align: center;
    margin-bottom: 8px;
}

.name {
    margin: 0;

    
    font-size: 14pt;
    line-height: 1.1;
    font-weight: 700;
}

.contact {
    margin-top: 2px;

    display: flex;
    justify-content: center;
    flex-wrap: wrap;

    gap: 2px 7px;

    
    font-size: 12pt;
}

a {
    color: #2f6fed;
    text-decoration: none;
}


.section {
    margin-top: 8px;
}

.section-title {
    margin: 0 0 4px 0;

    font-size: 12pt;
    font-weight: 700;

    color: #2f6fed;

    text-transform: uppercase;
}


.skill-row {
    display: grid;
    grid-template-columns: 165px 1fr;

    gap: 6px;
    margin-bottom: 2px;

    font-size: 12pt;
}

.skill-label {
    font-weight: 700;
}


.project {
    margin-bottom: 6px;

    break-inside: avoid;
    page-break-inside: avoid;
}

.project-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    gap: 8px;

    font-size: 12pt;
}

.project-heading > div:first-child {
    flex: 1;
}

.links {
    white-space: nowrap;

    font-size: 12pt;
}

.tech-stack {
    margin-top: 1px;

   
    font-size: 12pt;
}


ul {
    margin: 2px 0 0 17px;
    padding: 0;
}

li {
    margin-bottom: 1px;
    padding-left: 1px;

    font-size: 12pt;
    line-height: 1.15;
}


.education-item {
    margin-bottom: 4px;

    break-inside: avoid;
    page-break-inside: avoid;
}

.education-main {
    display: flex;
    justify-content: space-between;

    gap: 8px;

    font-size: 12pt;
}



.certification-item {
    margin-bottom: 2px;
    font-size: 12pt;
}
</style>

</head>

<body>

<div class="resume">

    <header class="header">

        <h1 class="name">
            ${escapeHtml(data.name || "Target Candidate")}
        </h1>

        ${contactItems.length
            ? `
                <div class="contact">
                    ${contactItems.join("<span>|</span>")}
                </div>
                `
            : ""
        }

        

    </header>


    ${skillRows
            ? `
            <section class="section">

                <h2 class="section-title">
                    Skills
                </h2>

                ${skillRows}

            </section>
            `
            : ""
        }


    ${projectsHtml
            ? `
            <section class="section">

                <h2 class="section-title">
                    Projects
                </h2>

                ${projectsHtml}

            </section>
            `
            : ""
        }


    ${educationHtml
            ? `
            <section class="section">

                <h2 class="section-title">
                    Education
                </h2>

                ${educationHtml}

            </section>
            `
            : ""
        }


    ${certificationsHtml
            ? `
            <section class="section">

                <h2 class="section-title">
                    Certifications
                </h2>

                ${certificationsHtml}

            </section>
            `
            : ""
        }

</div>

</body>

</html>
    `;
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {



    const resumePdfSchema = z.object({

        name: z.string(),

        contact: z.object({
            email: z.string(),
            phone: z.string(),
            linkedin: z.string(),
            github: z.string(),
            portfolio: z.string(),
        }),

        skills: z.object({
            languages: z.array(z.string()),
            frameworks: z.array(z.string()),
            databases: z.array(z.string()),
            tools: z.array(z.string()),
        }),

        projects: z.array(
            z.object({
                name: z.string(),
                description: z.string(),
                techStack: z.array(z.string()),
                github: z.string(),
                liveDemo: z.string(),
                bullets: z.array(z.string()),
            })
        ),

        education: z.array(
            z.object({
                degree: z.string(),
                institution: z.string(),
                score: z.string(),
                duration: z.string(),
            })
        ),

        certifications: z.array(
            z.object({
                name: z.string(),
                issuer: z.string(),
                date: z.string(),
            })
        ),
    });

    const prompt = `
You are an expert technical resume writer and ATS optimization specialist.

Your task is to generate a professional TARGET RESUME based primarily on the
target Job Description.

TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S EXISTING RESUME:
${resume || "Not provided"}

CANDIDATE'S SELF DESCRIPTION:
${selfDescription || "Not provided"}

GOAL:
Create a highly relevant, ATS-friendly target resume that demonstrates what
a strong resume for this specific job should look like.

The resume should be concise and focused. Prefer one page when the relevant
content fits naturally, but use up to two pages when necessary to preserve
important job-relevant information and readability.

CONTENT RULES:

1. JOB DESCRIPTION PRIORITY
- Analyze the Job Description carefully.
- Identify the most important required and preferred skills.
- Prioritize relevant ATS keywords naturally throughout the resume.
- Order skills and projects according to their relevance to the target role.
- Do not keyword-stuff.

2. WHEN CANDIDATE INFORMATION IS PROVIDED
- Preserve real candidate details whenever available.
- Use the candidate's real name, email, phone, LinkedIn, GitHub, portfolio,
  education, projects, certifications, skills, and other provided information.
- Improve wording and organization to make the resume more relevant to the
  target job.
- Do not replace real candidate information with fictional information.
- Do not falsely claim that the candidate has a skill, certification,
  education, achievement, or experience that they did not provide.

3. WHEN NO CANDIDATE INFORMATION IS PROVIDED
- Generate an EXAMPLE TARGET RESUME representing a strong candidate for the
  supplied Job Description.
- You may create realistic placeholder/example candidate information,
  education, projects, skills, certifications, and contact details.
- The generated content must be understood as reference/example content,
  not verified information about the user.
- Use clearly fictional/example contact details.

4. PROJECTS
- Prioritize projects most relevant to the Job Description.
- When candidate information is provided, select approximately 2-4 of the
  strongest and most job-relevant projects from the available information.
- When only the Job Description is provided, generate approximately 3-4
  strong example projects covering different important requirements of the role.
- Each project should have a concise description, relevant tech stack,
  and approximately 2-3 strong bullet points.
- Start bullets with strong action verbs where appropriate.
- Focus on technical implementation, impact, architecture, performance,
  scalability, problem solving, and relevant technologies.
- Never invent measurable numbers for a real candidate unless those numbers
  were provided by the candidate.
- Preserve GitHub and live-demo links when provided.

5. SKILLS
- Group skills into:
  Languages & Technologies,
  Frameworks & Libraries,
  Databases & Web Technologies,
  Tools & Platforms.
- Put the most job-relevant skills first.
- Keep the section compact and ATS-readable.

6. EDUCATION
- Preserve real education information when provided.
- Keep education concise to save space.

7. CERTIFICATIONS
- Preserve relevant certifications when provided.
- Prioritize certifications related to the target role.
- Keep this section compact.

8. LENGTH AND READABILITY
- Be concise and information-dense.
- Avoid unnecessary paragraphs and repetitive information.
- Prioritize job-relevant content over less relevant content.
- Keep project bullets focused and meaningful.
- Prefer one page when practical.
- Use up to two pages when necessary rather than removing valuable information
  or making the resume difficult to read.

9. ATS REQUIREMENTS
- Use conventional resume terminology.
- Use standard section names.
- Use relevant keywords from the Job Description naturally.
- Avoid decorative or unusual content.
- Keep content clear, professional, and easily parsable by ATS systems.

10. WRITING QUALITY
- Use professional, concise language.
- Avoid generic AI-sounding phrases.
- Avoid first-person pronouns such as "I", "me", and "my".
- Avoid exaggerated claims.
- Do not include explanations outside the resume data.

IMPORTANT:
Return ONLY structured resume data according to the provided response schema.
Do NOT return HTML, Markdown, or additional commentary.
`;

    let htmlContent;

    try {


        const response = await generateContentWithRetry({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        });

        const resumeData = JSON.parse(response.text);

        htmlContent = generateTargetResumeHtml(resumeData);

    } catch (primaryError) {

        const primaryStatus =
            primaryError.status ||
            primaryError.response?.status;

        if (primaryStatus === 503 || primaryStatus === 429) {

            console.warn(
                `Primary Gemini model unavailable (${primaryStatus}). Trying secondary model...`
            );

            try {


                const fallbackResponse = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: zodToJsonSchema(resumePdfSchema),
                    }
                });

                const fallbackResumeData =
                    JSON.parse(fallbackResponse.text);

                htmlContent =
                    generateTargetResumeHtml(fallbackResumeData);

            } catch (secondaryError) {

                console.error(
                    "Both Gemini models failed for target resume:",
                    secondaryError
                );

                const error = new Error(
                    "AI service is temporarily unavailable. Please try again shortly."
                );

                error.status = 503;

                throw error;
            }

        } else {

            throw primaryError;
        }
    }

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    return pdfBuffer;

}



module.exports = { generateInterviewReport, generateResumePdf }