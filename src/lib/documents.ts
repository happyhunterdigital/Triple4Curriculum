import { InstitutionalDocument } from '../types';

export const institutionalDocuments: InstitutionalDocument[] = [
  {
    id: 'doc_sasams_2026',
    title: 'SA-SAMS Statutory Compliance & Audit Guidelines 2026',
    category: 'Statutory & Compliance',
    departmentName: 'Office of Academic Governance & DHET Relations',
    version: 'v4.8-DHET',
    lastUpdated: '2026-08-15',
    author: 'Dean Margaret Edwards & Dr. Arthur Vance',
    fileSizeKb: 1420,
    fileFormat: 'PDF',
    summary: 'Comprehensive audit manual covering real-time CAPS/IEB alignment, POPIA learner record anonymization, daily attendance export schema, and B-BBEE scorecard integration.',
    dhetAccreditationCode: 'DHET-SASAMS-444-2026',
    popiaCompliant: true,
    tags: ['SA-SAMS', 'DHET', 'Compliance', 'Audit', 'Attendance', 'CAPS', 'IEB'],
    content: `
# SA-SAMS Statutory Compliance & Audit Guidelines 2026
**Institution**: Triple 4 Curriculum (Triple 4C)
**Accreditation Reference**: DHET-SASAMS-444-2026 | NQF Level 5-8

## 1. Executive Mandate
In terms of Section 444 of the South African Higher Education & Training Act, all blended learning institutions must maintain a synchronized digital ledger of student attendance, modular progression, and assessment moderation.

## 2. Automated SA-SAMS Export Protocol
1. Daily attendance rosters are verified against biometrically verified and OTP-confirmed logins.
2. SpeedGrader™ marks are encrypted and mapped directly to SA-SAMS Subject Record Sheets (SRS).
3. Quarterly export XMLs are validated against the Department of Basic Education & DHET schema 2026.1.

## 3. POPIA Safeguards & Retention
- All student identifiers are pseudonymized during external statistical audits.
- Academic counselling notes are restricted strictly to designated faculty advisors.
    `
  },
  {
    id: 'doc_popia_charter',
    title: 'POPIA Learner Data Protection & Privacy Charter',
    category: 'Statutory & Compliance',
    departmentName: 'Legal & Institutional Compliance',
    version: 'v3.2',
    lastUpdated: '2026-08-10',
    author: 'Advocate Sipho Mabaso (Information Officer)',
    fileSizeKb: 980,
    fileFormat: 'PDF',
    summary: 'Institutional framework governing the lawful processing, storage, and retention of student personal records, assessment rubrics, and video telemetry under Act 4 of 2013.',
    dhetAccreditationCode: 'POPIA-PO-444-SA',
    popiaCompliant: true,
    tags: ['POPIA', 'Privacy', 'Data Protection', 'Information Officer', 'Security', 'GDPR-Aligned'],
    content: `
# POPIA Learner Data Protection & Privacy Charter
**Triple 4 Curriculum Academic Network**

## 1. Scope & Purpose
This charter enforces the 8 Conditions for Lawful Processing of Personal Information under the Protection of Personal Information Act (POPIA).

## 2. Telemetry and Learning Analytics
- Automated telemetry (such as lecture watch percentages and quiz timestamps) is collected purely for academic intervention.
- Under Section 14, learners retain the right to request a complete export of their academic profile and logs.
- Third-party sharing is strictly forbidden without explicit parental/guardian consent or statutory DHET requirements.
    `
  },
  {
    id: 'doc_444_paradigm',
    title: 'Triple 4 Curriculum Framework: The 4-4-4 Modular Paradigm',
    category: 'Curriculum & Syllabus',
    departmentName: 'Academic Senate & Curriculum Committee',
    version: 'v5.0-Gold',
    lastUpdated: '2026-08-01',
    author: 'Senate Curriculum Working Group',
    fileSizeKb: 2150,
    fileFormat: 'PDF',
    summary: 'The foundational architectural blueprint of Triple 4C: 4 Pillars of Character, 4 Core Cognitive Competencies, and 4 Applied Industry Modules per academic term.',
    dhetAccreditationCode: 'T4C-CURRIC-2026-NQF8',
    popiaCompliant: true,
    tags: ['Curriculum', 'Triple 4C', 'Modular', 'Syllabus', 'Pedagogy', 'Character', 'Competency'],
    content: `
# The Triple 4 Curriculum (Triple 4C) Academic Framework
**Motto: Character, Competency, Critical Thinking, Creativity**

## The 4-4-4 Architectural Matrix:
1. **4 Pillars of Character**: Intellectual Integrity, Digital Citizenship, Social Accountability, and Resilience.
2. **4 Core Cognitive Competencies**: Systems Modeling, Distributed Reasoning, Statistical Inference, and Applied Ethics.
3. **4 Applied Industry Modules**: Every academic qualification pairs theoretical mastery with practical laboratory simulation, peer review, and capstone delivery.
    `
  },
  {
    id: 'doc_speedgrader_guide',
    title: 'SpeedGrader™ Standard Evaluation & Rubric Benchmark',
    category: 'Academic Policies',
    departmentName: 'Office of Faculty Development',
    version: 'v2.6',
    lastUpdated: '2026-07-28',
    author: 'Prof. Nomvula Dlamini',
    fileSizeKb: 840,
    fileFormat: 'PDF',
    summary: 'Standard operating procedure for faculty marking, rubric weighting, turnaround timeframes (48h target), and constructive audio/text feedback rubrics.',
    dhetAccreditationCode: 'FAC-RUBRIC-SG2026',
    popiaCompliant: true,
    tags: ['SpeedGrader', 'Rubric', 'Faculty', 'Grading', 'Assessment', 'Turnaround'],
    content: `
# SpeedGrader™ Standard Evaluation & Rubric Benchmark
**Faculty Assessment Handbook**

## 1. Grading Turnaround Standard
All formative milestone submissions must be evaluated and returned to learners within 48 hours of submission to maintain cognitive momentum.

## 2. Rubric Scoring Criteria
- **Architectural Rigor (40%)**: Correctness, edge-case coverage, and systematic design.
- **Code/Implementation Quality (30%)**: Adherence to PEP8/TypeScript clean code conventions and computational efficiency.
- **POPIA & Ethical Analysis (20%)**: Consideration of data privacy, socio-economic context, and ethical implications.
- **Documentation & Presentation (10%)**: Clarity of markdown explanations, architectural diagrams, and concise summaries.
    `
  },
  {
    id: 'doc_ai_ethics_policy',
    title: 'Academic Integrity & Generative AI Policy v4.2',
    category: 'Academic Policies',
    departmentName: 'Academic Senate Committee on Ethics',
    version: 'v4.2',
    lastUpdated: '2026-08-05',
    author: 'Dr. Johan van der Merwe',
    fileSizeKb: 720,
    fileFormat: 'PDF',
    summary: 'Guidelines on permissible student use of LLMs (Gemini, Claude) for conceptual brainstorming, debugging, and research citation, versus non-permissible plagiarism.',
    dhetAccreditationCode: 'SEN-ETHICS-AI-2026',
    popiaCompliant: true,
    tags: ['AI Ethics', 'Academic Integrity', 'Gemini', 'Plagiarism', 'Citation', 'LLM Policy'],
    content: `
# Academic Integrity & Generative AI Policy v4.2
**Triple 4C Institutional Ethics Code**

## 1. Permitted Uses:
- Utilizing the embedded 444 AI Tutor for conceptual clarification, analogy generation, and self-quizzing.
- Syntax checking and automated test generation with full citation.

## 2. Prohibited Conduct:
- Direct copy-pasting of AI-generated responses for graded essays or capstone architectural designs without synthesis.
- Misrepresenting automated code generation as original algorithmic development.
    `
  },
  {
    id: 'doc_vr_metaverse_guide',
    title: 'Virtual Campus Tour & 3D Simulation Laboratory Manual',
    category: 'Laboratory & Safety',
    departmentName: 'Department of Systems Engineering & Virtual Campus',
    version: 'v1.9',
    lastUpdated: '2026-08-12',
    author: 'Dr. Priya Patel',
    fileSizeKb: 1650,
    fileFormat: 'PDF',
    summary: 'Technical requirements and navigation manual for the Triple 4C Virtual Campus, including 3D rendering in WebGL, virtual simulation wards, and server room walkthroughs.',
    dhetAccreditationCode: 'VR-SIM-444-2026',
    popiaCompliant: true,
    tags: ['VR Campus', '3D Simulation', 'Virtual Labs', 'Metaverse', 'WebGL', 'Health Sciences'],
    content: `
# Virtual Campus Tour & 3D Simulation Laboratory Manual
**Interactive Digital Twin of the Triple 4C Campus**

## 1. Virtual Facilities Available:
- **Main Academic Quadrangle**: Central hub connecting student affairs and lecture halls.
- **Computing & AI Distributed Cluster Lab**: High-density server rack simulations with interactive terminal probes.
- **Health Sciences Simulation Ward**: An interactive clinical ward with simulated biometric patient monitors.
- **Great Academic Hall**: Auditorium for live guest keynotes and graduation ceremonies.
    `
  }
];
