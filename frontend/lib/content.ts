/**
 * Single source of truth for public website content.
 * Source documents: Website Content & Sitemap v1.0, Technical System Description (Provincial HMIS v1.1),
 * AI-Enabled HMIS manuscript, RAI-ECTF manuscript and the leadership CV.
 *
 * Publication safeguards followed here (from the Content & Sitemap document):
 *  - historical projects are labelled "Leadership experience", never as company contracts;
 *  - no logos, facility names, personal contact details or credential IDs are published;
 *  - metrics carry their original scope and are marked as reported / not audited;
 *  - proof-of-concept and research work is never described as production or validated outcomes.
 */

export type Pillar = "ai" | "platforms" | "research";
export type Status = "operational" | "initiative" | "historical" | "poc" | "research";

export const pillars: { id: Pillar; number: string; title: string; positioning: string; description: string; offerings: string[] }[] = [
  {
    id: "ai",
    number: "01",
    title: "AI & Agentic Systems",
    positioning: "Private, practical and governed AI for institutional knowledge and complex workflows.",
    description:
      "We build private and context-aware AI systems that work with organisational knowledge and structured workflows. Our focus includes local language models, retrieval-augmented generation, specialist AI agents and human-reviewed automation.",
    offerings: [
      "Private and on-premises LLM deployments",
      "Retrieval-augmented generation (RAG) over enterprise documents and knowledge repositories",
      "Agentic workflows with specialist roles, tools and approval stages",
      "Intelligent file and document processing, extraction and drafting assistance",
      "Knowledge services, semantic retrieval and organisational memory",
      "Human oversight, access control, auditability and AI lifecycle governance",
    ],
  },
  {
    id: "platforms",
    number: "02",
    title: "Healthcare & Enterprise Platforms",
    positioning: "Connected information systems that support essential services and large organisations.",
    description:
      "We bring experience in large-scale healthcare information systems and enterprise platforms, including HMIS, EMR, hospital workflows, diagnostic integration, ERP, HRMS and programme-monitoring systems.",
    offerings: [
      "Healthcare Management Information Systems (HMIS) and Electronic Medical Records (EMR)",
      "Hospital Management Systems and clinical workflow digitisation",
      "Laboratory, radiology, PACS and medical-device integration concepts",
      "Patient access, appointments, workforce and health-programme workflows",
      "ERP, HRMS, financial management, logistics and inventory systems",
      "Monitoring and evaluation, operational dashboards and programme reporting",
    ],
  },
  {
    id: "research",
    number: "03",
    title: "Applied Research & Digital Infrastructure",
    positioning: "Research, integration and secure foundations for mission-critical digital services.",
    description:
      "We explore and engineer the foundations behind connected digital services — from medical-device integration and DICOM workflows to GIS, data engineering, infrastructure modernisation and secure systems integration.",
    offerings: [
      "Medical IoT and connected-health proof-of-concept research",
      "DICOM study exchange and distributed indexing, caching and storage architectures",
      "GIS and geospatial decision-support systems",
      "Data engineering, ETL and analytical visualisation",
      "Data-centre and network modernisation concepts",
      "Secure systems integration and infrastructure architecture",
    ],
  },
];

export const pillarName: Record<Pillar, string> = {
  ai: "AI & Agentic Systems",
  platforms: "Healthcare & Enterprise Platforms",
  research: "Applied Research & Digital Infrastructure",
};

export const statusInfo: Record<Status, { label: string; note: string }> = {
  operational: {
    label: "Operational (reported)",
    note: "Deployment and usage figures are system-reported by the project owner and have not been independently audited. Definitions and measurement dates should be confirmed before they are relied upon.",
  },
  initiative: {
    label: "Active initiative",
    note: "An ongoing institutional initiative. No performance, accuracy or outcome figures are claimed.",
  },
  historical: {
    label: "Leadership experience",
    note: "Historical leadership experience undertaken in a prior professional context. It is presented as the experience of Agentic Research Labs' leadership and is not described as a contract of Agentic Research Labs (Pvt) Ltd.",
  },
  poc: {
    label: "Proof of concept",
    note: "Design or proof-of-concept work. It is not presented as a production deployment, and no measured operational outcome is claimed.",
  },
  research: {
    label: "Research",
    note: "Research work. Claims of validation, accuracy or effectiveness are made only where supporting evidence is cited.",
  },
};

export type Project = {
  slug: string;
  title: string;
  pillar: Pillar;
  status: Status;
  featured?: boolean;
  period?: string;
  context: string;
  summary: string;
  challenge: string;
  solution: string[];
  capabilities: string[];
  reported?: { label: string; value: string; note?: string }[];
  related?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "provincial-hmis",
    title: "Provincial Healthcare Management Information System (HMIS)",
    pillar: "platforms",
    status: "operational",
    featured: true,
    context: "Provincial public-health programme. Project vision, solution design and development leadership: Abid Ghaffar and Muhammad Arfan.",
    summary:
      "An AI-enabled, three-tier provincial health information ecosystem that connects primary and secondary facilities, district data hubs and a secure provincial core around a unified longitudinal patient record.",
    challenge:
      "Healthcare is information-intensive, yet patient information is often fragmented across facilities and departments — leaving clinicians with incomplete histories and managers with limited visibility for planning, surveillance and resource allocation.",
    solution: [
      "Tier 1 — health facilities (DHQ/THQ hospitals and primary-care units) capture registration, queue, triage, nursing, EMR, inpatient, referral and specialty workflows.",
      "Tier 2 — district data hubs consolidate facility data for local administration and localised reporting.",
      "Tier 3 — a secure provincial core hosts the central patient database, embedded AI services, logistics and supply chain, FlexiCare workforce management and the patient mobile-app server, with an interoperability hub for authorised exchange.",
      "A connected diagnostic chain links laboratory, blood bank, radiology (RIS) and PACS, with blood-product traceability from donor to bedside.",
      "Standards-based terminology and exchange: ICD-11, SNOMED CT, LOINC, RxNorm, ICHI, ICPC-2 and HL7/FHIR.",
      "AI is a decision-support layer — identity and registration support, clinical dictation, imaging and ECG assistance, preventive screening, medication-safety alerts, document scanning and ICD-11 disease-surveillance analytics — with clinicians remaining accountable for clinical decisions.",
      "Security design statements include AES-256 encryption at rest, TLS 1.2+ in transit, role-based least-privilege access and audit trails. A zero-new-hardware device strategy supports existing computers, smartphones and low-cost Android tablets.",
      "Delivered in a record four months by a small development team using an AI-driven software-delivery approach.",
    ],
    capabilities: [
      "Longitudinal patient record",
      "CNIC-based registration",
      "LIS · RIS · PACS · Blood bank",
      "Maternal, child & preventive health",
      "Workforce & payroll",
      "Pharmacy & supply chain",
      "Patient mobile app (Urdu/Punjabi voice booking)",
      "ICD-11 disease surveillance",
      "Executive dashboards",
      "Governed AI services",
    ],
    reported: [
      { label: "Sites", value: "2,000+", note: "Reported operational footprint" },
      { label: "Hospitals", value: "167", note: "Hospital footprint in the technical description" },
      { label: "Web users", value: "25,000+", note: "Administrative / clinical users, as reported" },
      { label: "Mobile users", value: "10,000+", note: "Patient / provider users, as reported" },
      { label: "Clients processed daily", value: "400,000+", note: "Counting unit not defined" },
    ],
    related: [
      { label: "Research: AI-enabled HMIS evaluation framework", href: "/research/ai-enabled-hmis" },
      { label: "Solutions: Healthcare & Enterprise Platforms", href: "/solutions#platforms" },
    ],
  },
  {
    slug: "emr-cct-integration",
    title: "EMR and Conditional Cash Transfer (CCT) Integration",
    pillar: "platforms",
    status: "historical",
    period: "2021 – 2023",
    context: "World Bank-supported health programme, Punjab. Individual consultancy (IT Specialist).",
    summary:
      "Implementation strategy for an electronic medical record application used to identify eligible households and generate conditional cash transfers in the health sector.",
    challenge:
      "Deploy a facility-level EMR across hundreds of facilities, and connect it to government agencies and payment providers so that transfers could reach eligible households reliably.",
    solution: [
      "Prepared the implementation strategy for EMR deployment across 800+ facilities and 5,000+ end users in 11 districts.",
      "Supported integration with government agencies and payment service providers so the application could generate CCT payments to about 1.4 million eligible households.",
      "Scripted ETL jobs, designed Tableau dashboards and prepared spatio-temporal maps to monitor project performance.",
      "Designed the EMR training programme, a WhatsApp-group support mechanism and a social-mobilisation campaign to bring beneficiaries to nearby facilities.",
      "Defined KPIs for patient load, disease prevalence and supply consumption, available automatically through the system interface, and coordinated tablets, routers and SIMs for 800+ sites.",
    ],
    capabilities: ["EMR rollout strategy", "Payment-provider integration", "ETL & Tableau dashboards", "Spatio-temporal monitoring", "Training & support design"],
    reported: [
      { label: "Facilities", value: "800+" },
      { label: "Districts", value: "11" },
      { label: "End users", value: "5,000+" },
      { label: "Eligible households", value: "~1.4 million" },
    ],
  },
  {
    slug: "intelligent-file-management",
    title: "Intelligent File Management and Agentic AI",
    pillar: "ai",
    status: "initiative",
    period: "2026 – present",
    context: "Institutional, on-premises workflow initiative.",
    summary:
      "An on-premises intelligent file system that runs a local large language model through agentic workflows to prepare cited minutes and draft replies for officer approval.",
    challenge:
      "Case files depend on statutes, standing orders and prior precedent. Staff need drafts grounded in the organisation's own record, with a human officer remaining in control of every decision and outgoing letter.",
    solution: [
      "Specialist agents use retrieval-augmented generation over statutes, standing orders and closed precedents, then prepare a cited minute and draft the reply letter.",
      "The officer reviews, approves and issues — the system assists, it does not decide.",
      "Each closed file is written back into the RAG library, so later cases are answered from the organisation's own record.",
      "The workflow is designed to be retargeted to another specialist desk, such as HR, by changing the corpus, officer roles and the rules the agents must follow.",
      "Runs on-premises with a local model, suited to privacy-conscious, offline-first environments.",
    ],
    capabilities: ["Local LLM", "RAG with citations", "Multi-agent workflow", "Human approval stage", "Institutional memory"],
    related: [{ label: "Solutions: AI & Agentic Systems", href: "/solutions#ai" }],
  },
  {
    slug: "oneverse-aios",
    title: "OneVerse AIOS — Enterprise AI Operating Platform",
    pillar: "ai",
    status: "initiative",
    period: "2018 – present",
    context: "Institutional AI engineering and R&D programme. Design and development: Muhammad Arfan.",
    summary:
      "A modular enterprise AI platform that brings Python services, LLM APIs, agent orchestration, knowledge services, retrieval-augmented generation and workflow automation together under human-in-the-loop control.",
    challenge:
      "Organisations want to use several models and many internal data sources, but need controlled tool execution, secure access to enterprise information and a human decision-maker in the loop.",
    solution: [
      "Designed a modular platform integrating Python services, LLM and REST APIs, agent orchestration, knowledge services, RAG and workflow automation.",
      "Developed reusable integration patterns for controlled tool execution, multi-model use and access to enterprise information.",
      "Built in human-in-the-loop controls, input and output validation, access control and regression testing.",
    ],
    capabilities: ["Agent orchestration", "Multi-model integration", "RAG & knowledge services", "Controlled tool execution", "Human-in-the-loop", "LangChain · LangGraph · CrewAI"],
    related: [{ label: "Solutions: AI & Agentic Systems", href: "/solutions#ai" }],
  },
  {
    slug: "ai-document-intelligence",
    title: "AI Document Intelligence",
    pillar: "ai",
    status: "initiative",
    period: "2018 – present",
    context: "Institutional AI engineering and R&D programme. Design and development: Muhammad Arfan.",
    summary:
      "A document-processing pipeline from parsing and OCR through embeddings and hybrid retrieval to source-grounded LLM extraction and summarisation.",
    challenge: "Information in large document collections is hard to find, and AI-generated answers are only useful if they can be traced back to their source.",
    solution: [
      "Built a pipeline covering parsing and OCR, chunking, metadata extraction, embeddings, semantic and hybrid retrieval, reranking, and LLM-based extraction and summarisation.",
      "Designed source-grounded output patterns that support traceability and more reliable information discovery.",
      "Uses vector stores such as Qdrant, Chroma and pgvector, with locally hosted models (Ollama, Qwen) where privacy requires.",
    ],
    capabilities: ["OCR & parsing", "Hybrid retrieval & reranking", "Source-grounded answers", "Vector databases", "Local LLMs"],
  },
  {
    slug: "ai-email-hr-quotation-applications",
    title: "AI eMail, HR Management & Quotation Management Applications",
    pillar: "ai",
    status: "initiative",
    period: "2018 – present",
    context: "Institutional AI engineering and R&D programme. Design and development: Muhammad Arfan.",
    summary:
      "AI-assisted business workflows for email handling, HR policy retrieval and quotation analysis, with controlled data access and user oversight.",
    challenge: "Routine correspondence, HR queries and quotation comparison consume skilled staff time but still need accuracy and human accountability.",
    solution: [
      "Designed AI-assisted workflows for email generation and classification, HR policy retrieval, quotation analysis, document processing and structured information extraction.",
      "Integrated application logic with APIs and databases, emphasising controlled data access, output validation and user oversight.",
    ],
    capabilities: ["Email classification & drafting", "HR policy retrieval", "Quotation analysis", "Structured extraction", "Output validation"],
  },
  {
    slug: "ai-evaluation-verification-platform",
    title: "Enterprise AI Evaluation & Verification Platform",
    pillar: "ai",
    status: "poc",
    period: "2018 – present",
    context: "Design concept within an institutional AI engineering and R&D programme. Design: Muhammad Arfan.",
    summary:
      "A project-level evaluation concept that analyses source repositories for quality and security concerns, supports automated testing and prioritises defects in developer-oriented reports.",
    challenge: "AI-built and AI-assisted software is often judged on demonstrations. Teams need repeatable verification and evidence-based findings.",
    solution: [
      "Designed a project-level evaluation workflow for analysing source repositories and identifying quality and security concerns.",
      "Structured the workflow around repeatable verification, evidence-based findings and retesting — not demonstrations alone.",
      "Supports automated testing, defect prioritisation and developer-oriented reporting.",
    ],
    capabilities: ["Automated evaluation", "Code quality & security analysis", "Regression testing", "Defect prioritisation"],
    related: [{ label: "Research: responsible AI competence (RAI-ECTF)", href: "/research/rai-ectf" }],
  },
  {
    slug: "data-centre-virtualisation",
    title: "Data-centre Virtualisation and Enterprise IT Services",
    pillar: "research",
    status: "historical",
    period: "2010 – 2018",
    context: "Military IT data centres (Senior IT Systems Administrator).",
    summary:
      "Administration of enterprise systems for 3,000+ users and a virtualisation programme that consolidated physical servers into a virtual environment.",
    challenge: "Keep enterprise services available, secure and supportable for thousands of users while reducing ageing hardware.",
    solution: [
      "Administered Windows Server, Active Directory, Group Policy, DNS/DHCP and file and print services for 3,000+ users.",
      "Supported access control, secure configuration, incident troubleshooting, backup and recovery, monitoring and operational continuity.",
      "Took part in infrastructure modernisation, consolidating 20+ physical servers into a virtualised environment with a reported 25% reduction in hardware costs.",
    ],
    capabilities: ["Windows Server & Active Directory", "Virtualisation", "Backup & recovery", "Secure configuration", "Service continuity"],
    reported: [
      { label: "Users supported", value: "3,000+" },
      { label: "Servers consolidated", value: "20+" },
      { label: "Hardware cost reduction", value: "25%", note: "As reported" },
    ],
  },
  {
    slug: "hospital-management-system",
    title: "Hospital Management System Deployment",
    pillar: "platforms",
    status: "historical",
    period: "2014 – 2017",
    context: "Ministry of Defence hospital programme and CMH Lahore (leadership roles).",
    summary:
      "Programme and hospital-level leadership of a large hospital management system rollout, from pilot to deployment across the hospital network.",
    challenge:
      "Introduce a hospital management system at scale while keeping hospitals running 24/7, building local capability and reducing dependence on the original vendor.",
    solution: [
      "Executed the pilot and deployment of the HMS across 61 hospitals; defined strategies, policies and procedures, the supporting IT and network infrastructure, a three-tier 24/7 support model and a stakeholder responsibility matrix.",
      "Planned gradual capacity building and transfer of technology from the vendor.",
      "Ran a post-implementation study and, using user feedback, defined the contours of a new solution, then selected and customised a third-party platform.",
      "As Head of IT at a large military hospital: deployed the pilot, established registration counters and a 24/7 helpline, trained 1,000+ doctors and support personnel, re-engineered business processes and supported information-security and ISO audits.",
    ],
    capabilities: ["Hospital information systems", "Rollout programme leadership", "Support model design", "Training & transfer of technology", "Business-process re-engineering"],
    reported: [{ label: "Hospitals deployed", value: "61" }, { label: "Staff trained (single hospital)", value: "1,000+" }],
  },
  {
    slug: "inter-hospital-dicom-sharing",
    title: "Inter-hospital DICOM Sharing",
    pillar: "research",
    status: "poc",
    period: "2020 – 2021",
    context: "Architecture and design work within a government software development division.",
    summary:
      "Hardware and software architecture for sharing DICOM imaging studies between hospitals, using distributed indexing, caching and storage.",
    challenge: "Make diagnostic imaging studies discoverable and quickly retrievable across hospitals without moving every study to every site.",
    solution: [
      "Designed the distributed indexing mechanism that locates studies across participating hospitals.",
      "Designed caching and storage tiers to keep frequently requested studies close to the clinicians who need them.",
      "Defined the hardware/software architecture for secure inter-hospital exchange.",
    ],
    capabilities: ["DICOM", "PACS interoperability", "Distributed indexing", "Caching & storage architecture"],
    related: [{ label: "Research themes: medical data interoperability", href: "/research#themes" }],
  },
  {
    slug: "gis-trafficability-management",
    title: "GIS Trafficability Management System",
    pillar: "research",
    status: "historical",
    period: "2010",
    context: "GIS consultancy for a national survey organisation.",
    summary:
      "A GIS-based system that combines terrain, weather and survey data to plan routes for heavy vehicles through hazardous areas such as marshy and rough terrain.",
    challenge: "Plan safe movement routes for heavy vehicles where ground conditions change with terrain and weather.",
    solution: [
      "Designed, developed and deployed the Trafficability Management System.",
      "Built an add-in for QGIS and Geomedia add-ins to support map editing and printing operations.",
      "Developed an interactive digital system mapper for overlay marking.",
      "Carried out feasibility studies and reported progress to senior management.",
    ],
    capabilities: ["GIS decision support", "Terrain & weather analysis", "QGIS / Geomedia extensions", "Route planning"],
  },
  {
    slug: "gis-soil-intelligence-portal",
    title: "GIS Soil Intelligence Portal",
    pillar: "research",
    status: "historical",
    period: "2011",
    context: "GIS consultancy for a major fertiliser manufacturer.",
    summary:
      "Real-time GIS visualisation that replaced reports and charts from an existing BI solution, plus geostatistical soil-fertility maps and an online fertiliser-recommendation portal.",
    challenge: "Senior executives were overwhelmed by numerous reports, graphs and charts, which slowed decision-making.",
    solution: [
      "Designed real-time GIS-based visualisation to replace the existing BI dashboards and reports.",
      "Produced geostatistical soil-fertility maps and developed an online portal for fertiliser suggestions.",
      "Ran ETL over twelve years of soil-survey data from five units, and trained staff.",
    ],
    capabilities: ["Geostatistics", "Web GIS portal", "ETL & data engineering", "Executive decision support"],
  },
  {
    slug: "data-centre-modernisation",
    title: "Data-centre Modernisation",
    pillar: "research",
    status: "poc",
    period: "2020 – 2021",
    context: "Proof of concept within a government software development division.",
    summary:
      "A proof of concept for redesigning IT and network-security infrastructure across multiple data centres.",
    challenge: "Provision dozens of software services to thousands of users on ageing infrastructure while improving security and reducing hardware dependency.",
    solution: [
      "Design objectives: improve performance and delivery of existing software services; free up to 50% of servers and network equipment; strengthen overall security; extend the life of existing servers by 8–10 years.",
      "Devised a hardware and software mechanism to connect a highly secure network with the internet safely.",
    ],
    capabilities: ["Data-centre architecture", "Network security design", "Capacity optimisation", "Secure connectivity"],
  },
  {
    slug: "erp-implementation",
    title: "ERP Implementation",
    pillar: "platforms",
    status: "historical",
    period: "2023 – 2025",
    context: "ERP programme for a large government manufacturing organisation (Project Manager).",
    summary:
      "Led the implementation team for an enterprise resource planning system, with responsibility for user needs, technical support, cybersecurity and IT operations.",
    challenge: "Introduce ERP across a large organisation while keeping user issues resolved quickly and operations secure.",
    solution: [
      "Led the ERP implementation team, gathering user needs and technical-support issues.",
      "Acted as liaison between users, developers and data-centre teams to resolve issues promptly.",
      "Managed cybersecurity and IT operations for the organisation.",
    ],
    capabilities: ["ERP programme management", "Requirements & support", "Cybersecurity management", "IT operations"],
  },
  {
    slug: "digital-library-archival-systems",
    title: "Digital Library and Archival Systems",
    pillar: "research",
    status: "historical",
    period: "2007 – 2014",
    context: "Government directorate project work.",
    summary:
      "Digital library management, public online cataloguing and digital archiving across a network of libraries and an archives department.",
    challenge: "Modernise library services and preserve archival material, including old newspapers, in digital form.",
    solution: [
      "Established a digital library management system and supported a network of 60 libraries.",
      "Designed a 3D, publicly accessible online catalogue and supported the redesign of the central library.",
      "Started digital archiving for the archives department and for old newspapers.",
      "Conducted feasibility studies, progress reporting and staff training.",
    ],
    capabilities: ["Digital library systems", "Online catalogue design", "Digital archiving", "Feasibility studies"],
  },
  {
    slug: "medical-iot-pathology-integration",
    title: "Medical IoT and Pathology-instrument Integration",
    pillar: "research",
    status: "poc",
    period: "2020 – 2021",
    context: "Proof-of-concept work within a government software development division.",
    summary:
      "Proof of concept for IoT-based continuous health monitoring of patients, and design of a hardware device to automate pathology-machine integration.",
    challenge: "Capture patient vital signs and laboratory-instrument results automatically instead of by manual transcription.",
    solution: [
      "Conducted a proof of concept for continuous, IoT-based patient health monitoring.",
      "Designed a hardware device to automate integration of pathology machines with information systems.",
    ],
    capabilities: ["Medical IoT", "Device integration", "Laboratory automation", "Connected health"],
    related: [{ label: "Research themes: connected diagnostic systems", href: "/research#themes" }],
  },
  {
    slug: "government-enterprise-systems",
    title: "Government Enterprise and Management Systems",
    pillar: "platforms",
    status: "historical",
    period: "2004 – 2014",
    context: "Consulting and government assignments, including World Bank and provincial-government programmes.",
    summary:
      "Financial, human-resource, logistics and monitoring-and-evaluation systems for public-sector and development programmes.",
    challenge: "Provide dependable management systems for public bodies and development projects at scale.",
    solution: [
      "Financial Management System for a World Bank project, now used by 100+ cities in Pakistan.",
      "Human Resource Management System later adopted across government, oil, agri-tech and retail sectors, locally and internationally.",
      "Monitoring and Evaluation systems for a provincial-government project.",
      "Feasibility studies for government HR, financial and logistics management systems.",
    ],
    capabilities: ["Financial management", "HRMS", "Logistics management", "Monitoring & evaluation"],
    reported: [{ label: "Cities using the FMS", value: "100+" }],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/* ------------------------------------------------------------------ Research */

export const researchThemes = [
  { title: "Agentic AI for institutional knowledge and controlled workflows", detail: "Local models, RAG and specialist agents with approval stages and institutional memory.", links: [{ label: "Intelligent File Management", href: "/projects/intelligent-file-management" }] },
  { title: "Responsible AI, evaluation and human oversight in high-impact environments", detail: "Turning ethical principles into measurable competence and governance evidence.", links: [{ label: "RAI-ECTF framework", href: "/research/rai-ectf" }] },
  { title: "AI-enabled healthcare information systems and clinical workflow support", detail: "Capability-to-impact models and evaluation designs for AI inside clinical workflows.", links: [{ label: "AI-enabled HMIS", href: "/research/ai-enabled-hmis" }, { label: "Provincial HMIS", href: "/projects/provincial-hmis" }] },
  { title: "Medical data interoperability and connected diagnostic systems", detail: "DICOM exchange, device integration and standards-based terminology and messaging.", links: [{ label: "DICOM sharing", href: "/projects/inter-hospital-dicom-sharing" }, { label: "Medical IoT", href: "/projects/medical-iot-pathology-integration" }] },
  { title: "Geospatial intelligence and data-driven public-service planning", detail: "GIS decision-support systems and spatio-temporal monitoring for operations and programmes.", links: [{ label: "GIS Soil Intelligence", href: "/projects/gis-soil-intelligence-portal" }, { label: "GIS Trafficability", href: "/projects/gis-trafficability-management" }] },
  { title: "Secure and resilient digital infrastructure", detail: "Data-centre modernisation, secure connectivity and cybersecurity-aware architecture.", links: [{ label: "Data-centre modernisation", href: "/projects/data-centre-modernisation" }] },
];

export type ResearchItem = {
  slug: string;
  title: string;
  kind: string;
  status: string;
  authors: string;
  affiliation?: string;
  theme: string;
  summary: string;
  keywords: string[];
  /** Optional free-form sections, used for items created in the admin console. */
  body?: { heading: string; text: string }[];
};

export const research: ResearchItem[] = [
  {
    slug: "rai-ectf",
    title: "From AI Ethics Awareness to Measurable Ethical Competence",
    kind: "Conceptual framework · manuscript",
    status: "Manuscript — not yet peer-reviewed or published",
    authors: "Muhammad Arfan",
    affiliation: "Agentic Research Labs (Pvt) Ltd, Lahore, Pakistan",
    theme: "Responsible AI, evaluation and human oversight",
    summary:
      "A conceptual framework — the Responsible AI Ethical Competence and Training Framework (RAI-ECTF) — for turning AI-ethics awareness into measurable, governance-connected competence for generative and agentic AI.",
    keywords: ["AI ethics", "responsible AI", "ethical competence", "generative AI", "agentic AI", "AI governance", "competency assessment"],
  },
  {
    slug: "ai-enabled-hmis",
    title: "AI-Enabled Enterprise-Scale Digital Health Infrastructure",
    kind: "Implementation case study and evaluation framework · manuscript",
    status: "Manuscript — source-grounded; not independently audited",
    authors: "Abid Ghaffar and Muhammad Arfan",
    affiliation: "Agentic Research Labs (Pvt) Ltd, Lahore, Pakistan",
    theme: "AI-enabled healthcare information systems",
    summary:
      "A descriptive case study of a provincial AI-enabled HMIS and a national-to-global evaluation framework that separates reported implementation scale from verified effectiveness.",
    keywords: ["digital health", "HMIS", "EMR", "interoperability", "clinical decision support", "ICD-11", "implementation science"],
  },
];

export const raiDomains = [
  ["C1", "AI foundations and limitations", "Models, data, training and inference, uncertainty, hallucination and capability boundaries."],
  ["C2", "Human-centred AI", "Human agency, oversight, accessibility, inclusion and impact on people."],
  ["C3", "Ethical reasoning", "Principled reasoning, stakeholders, value conflicts, proportionality and justification."],
  ["C4", "Fairness, bias and inclusion", "Data and model bias, disparate impacts, representational harms and inclusive evaluation."],
  ["C5", "Privacy and data ethics", "Consent, minimisation, confidentiality, sensitive data, provenance and retention."],
  ["C6", "Reliability and epistemic integrity", "Factuality, uncertainty, provenance, verification and source criticism."],
  ["C7", "AI security and misuse", "Prompt injection, data leakage, abuse, fraud, cyber misuse and access control."],
  ["C8", "Human–AI interaction", "Automation bias, overreliance, anthropomorphism, vulnerability and human factors."],
  ["C9", "Transparency and explainability", "Disclosure, documentation, traceability, model and system documentation, and limitations."],
  ["C10", "AI governance and regulation", "Roles, accountability, risk management, impact assessment, procurement and policy."],
  ["C11", "Socioeconomic and environmental responsibility", "Labour effects, accessibility, distributional impacts, resource use and sustainability."],
  ["C12", "Responsible AI operations", "Monitoring, incidents, change management, audit evidence, reassessment and improvement."],
] as const;

export const raiLevels = [
  ["Understand", "Explain core AI concepts, capabilities, limitations, ethical principles and common risks."],
  ["Apply", "Use policies, safeguards and responsible-use procedures in routine situations."],
  ["Evaluate", "Analyse ambiguous cases, trade-offs, uncertainty and evidence; justify decisions."],
  ["Govern", "Translate ethical requirements into controls, documentation, oversight, procurement and escalation."],
  ["Create", "Design or redesign AI-enabled processes, training, safeguards or governance mechanisms proactively."],
] as const;

export const raiGaps = [
  "Risk categories are not translated into learner competencies.",
  "Performance-based assessment is scarce; awareness is measured by self-report.",
  "Training is detached from organisational governance controls.",
  "Lifecycle coverage is thin; training is event-based rather than continuous.",
  "Generative and agentic risks are underrepresented.",
  "Contextual and cultural adaptation is weak.",
  "Mechanisms for continuous development and reassessment are limited.",
];

export const hmisRoadmap = [
  ["0", "Governance and discovery", "National steering group, facility inventory, legal and privacy review, baseline architecture and standards profile."],
  ["1", "Interoperability foundation", "National FHIR implementation guide, terminology services, registries, patient identity and matching policy, API security."],
  ["2", "Clinical and operational scale", "Core registration, encounter, diagnostics, medication, referral, discharge, inventory and patient-access workflows."],
  ["3", "AI validation and staged use", "Low-risk assistive features first; silent-mode validation, prospective evaluation and human oversight."],
  ["4", "Provincial and private-sector federation", "Additional hospitals, primary-care facilities, laboratories, pharmacies and approved private providers."],
  ["5", "National optimisation", "National surveillance, analytics, research access, resource planning and continuous AI evaluation."],
] as const;

export const hmisAiCapabilities = [
  ["Clinical documentation support", "Speech dictation and note assistance; clinicians review and authenticate the final record."],
  ["Longitudinal record retrieval", "Consolidated access to prior notes, allergies, medicines, tests and images."],
  ["Diagnostic imaging support", "AI-assisted prioritisation or interpretation support; final interpretation remains with a qualified professional."],
  ["Medication safety", "Configured drug, allergy, dose and prescription checks flag risks for pharmacist or prescriber review."],
  ["Preventive screening", "Eligible-patient identification and screening workflows with clinical confirmation."],
  ["Disease surveillance", "ICD-11-based disease capture and anomaly signals routed to authorised administrators for verification."],
] as const;

/* ------------------------------------------------------------------- Company */

export const company = {
  legalName: "Agentic Research Labs (Pvt) Ltd",
  founded: 2007,
  location: "Lahore, Pakistan",
  tagline: "Intelligent Systems. Practical Impact.",
  /** Registered business objects, as provided by the company. */
  originalObjects:
    "The principal line of business of the company shall be to establish and run data processing centers, computer centers, software development centers, offices and to provide consultancy and data processing software development services, both application packages and operating systems and other services, and to impart training of electronic data processing, computer software and hardware to customers and others and to buy, sell, export, import of software, hardware and establishment of incidental infrastructural facilities, subject to permission of relevant authorities.",
  modifiedObjects:
    "The principal line of business of the company shall be to research, develop, and deploy Large Language Models (LLMs), agentic AI solutions, and specialized healthcare IT software; to operate AI and software development centers, providing end-to-end IT consultancy, custom software engineering, and data processing services; to impart technical training in AI and software systems; and to trade, import, export, and license related software, hardware, and computing infrastructure, subject to necessary regulatory permissions.",
  scope: [
    ["Research & development", "Research, development and deployment of Large Language Models (LLMs) and agentic AI solutions."],
    ["Healthcare IT", "Specialised healthcare IT software — from hospital and health-information systems to AI-enabled clinical and administrative workflows."],
    ["Software engineering & consultancy", "End-to-end IT consultancy, custom software engineering and data-processing services, delivered through AI and software development centres."],
    ["Training", "Technical training in AI and software systems."],
    ["Software, hardware & infrastructure", "Trade, import, export and licensing of related software, hardware and computing infrastructure."],
  ],
  timeline: [
    {
      year: "2007",
      title: "Company established",
      text: "Agentic Research Labs (Pvt) Ltd is established in Lahore with objects covering data-processing and computer centres, software development, IT consultancy and training in electronic data processing, software and hardware.",
    },
    {
      year: "Today",
      title: "Research-led AI and healthcare IT",
      text: "The company’s business objects are modified to centre on research, development and deployment of LLMs, agentic AI solutions and specialised healthcare IT software — alongside software engineering, consultancy, training and infrastructure services.",
    },
  ],
} as const;

/* ---------------------------------------------------------------- Leadership */

export type Leader = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  headline: string;
  bio: string[];
  highlights: { value: string; label: string }[];
  focus: string[];
  expertise?: { group: string; items: string[] }[];
  career?: { period: string; title: string; org: string; points: string[] }[];
  credentials: string[];
  work?: { label: string; href: string }[];
};

export const leaders: Leader[] = [
  {
    slug: "abid-ghaffar",
    initials: "AG",
    name: "Mr. Abid Ghaffar",
    role: "Chief Executive Officer",
    headline: "Technology leader and principal software architect",
    bio: [
      "Mr. Abid Ghaffar is a technology leader and principal software architect with more than two decades of experience across public health, government, defence-related environments, enterprise systems and international development assignments.",
      "His work spans healthcare information systems, enterprise architecture, high-concurrency software, data engineering, geospatial technologies and AI/LLM-based workflows — including local language models, retrieval-augmented generation and agentic workflows for privacy-conscious, on-premises environments.",
    ],
    highlights: [
      { value: "20+", label: "years of technical leadership" },
      { value: "2,000+", label: "sites — provincial HMIS (reported)" },
      { value: "25,000+", label: "users — provincial HMIS (reported)" },
    ],
    focus: ["Healthcare information systems", "Enterprise architecture", "Local AI & agentic workflows", "High-concurrency engineering", "GIS & data engineering"],
    credentials: [
      "MicroMasters in Data, Economics and Development Policy — Massachusetts Institute of Technology",
      "MS (Computer Science), Data Mining / Business Intelligence — University of Engineering and Technology, Lahore",
      "Certified Professional in Healthcare Information and Management Systems (CPHIMS) — HIMSS",
      "ITIL certified; machine-learning, big-data and cloud certifications",
    ],
    work: [
      { label: "Provincial HMIS", href: "/projects/provincial-hmis" },
      { label: "EMR and CCT Integration", href: "/projects/emr-cct-integration" },
      { label: "Intelligent File Management", href: "/projects/intelligent-file-management" },
    ],
  },
  {
    slug: "muhammad-arfan",
    initials: "MA",
    name: "Mr. Muhammad Arfan",
    role: "Director, Operations & Research",
    headline: "AI architect, enterprise-systems engineer and researcher",
    bio: [
      "Mr. Muhammad Arfan leads operations and research at Agentic Research Labs. A software-engineering graduate with more than sixteen years of experience, he combines enterprise-scale IT operations — application infrastructure, cybersecurity and service continuity for thousands of users — with hands-on AI engineering.",
      "He designs AI-enabled applications and enterprise integrations: LLM integration, retrieval-augmented generation, agent orchestration with human-in-the-loop controls, and automated evaluation and verification. He applies software-engineering discipline — input and output validation, regression testing, access control and documentation — so that AI systems are maintainable, secure and trustworthy in production.",
      "As Director, Operations & Research he connects applied research and technical design with operational planning, delivery coordination and institutional requirements. His research at Agentic Research Labs addresses responsible AI governance and measurable ethical competence, and the evaluation of AI-enabled health information systems.",
    ],
    highlights: [
      { value: "16+", label: "years across enterprise IT and AI" },
      { value: "3,000+", label: "users supported by services he administered" },
      { value: "20+", label: "physical servers consolidated through virtualisation" },
      { value: "25%", label: "reported hardware-cost reduction" },
    ],
    focus: ["Operations & delivery coordination", "AI engineering & research", "LLM, RAG & agent orchestration", "Secure infrastructure", "Systems integration", "Responsible AI governance"],
    expertise: [
      { group: "AI engineering", items: ["LLM integration", "RAG & hybrid retrieval", "Agent orchestration (LangChain, LangGraph, CrewAI)", "Local models (Ollama, Qwen)", "Vector stores (Qdrant, Chroma, pgvector)", "Automated evaluation"] },
      { group: "Software & integration", items: ["Python", "C# / .NET", "SQL", "PowerShell", "REST & Web APIs", "Workflow automation"] },
      { group: "Enterprise & Microsoft", items: ["Windows Server", "Active Directory & Group Policy", "Microsoft 365 / Azure fundamentals", "DNS / DHCP", "File & print services"] },
      { group: "Security & operations", items: ["RBAC, MFA, SSO, OAuth", "TLS & endpoint security", "Backup & recovery", "Monitoring", "Technical documentation"] },
    ],
    career: [
      {
        period: "Present",
        title: "Director, Operations & Research",
        org: "Agentic Research Labs (Pvt) Ltd",
        points: ["Leads operations and research coordination, from applied research and technical design to delivery planning.", "Author of research on responsible AI competence and AI-enabled health information systems."],
      },
      {
        period: "2018 – present",
        title: "Senior AI Architect, AI Engineering & R&D",
        org: "Institutional AI engineering and R&D programme",
        points: [
          "Designs and develops AI-enabled applications and enterprise integrations focused on maintainable architecture, secure data access and API connectivity.",
          "Builds reusable API and tool interfaces, structured workflows and integrations across models, data sources and enterprise services.",
          "Applies input and output validation, regression testing, error handling and access control.",
        ],
      },
      {
        period: "2010 – 2018",
        title: "Senior IT Systems Administrator",
        org: "Military IT data centres",
        points: [
          "Administered enterprise systems and application infrastructure for 3,000+ users.",
          "Supported availability, access control, secure configuration, backup and recovery, and monitoring.",
          "Contributed to consolidating 20+ physical servers into a virtualised environment, with a reported 25% reduction in hardware costs.",
        ],
      },
    ],
    credentials: [
      "Bachelor of Software Engineering — GC University, Faisalabad (2005–2009)",
      "Google Project Management certificate",
      "Microsoft Azure Fundamentals (AZ-900); 38 Microsoft Learn certified badges",
      "Anthropic AI Fluency: Framework Foundations; Claude Code 101; Claude Code in Action",
    ],
    work: [
      { label: "OneVerse AIOS", href: "/projects/oneverse-aios" },
      { label: "AI Document Intelligence", href: "/projects/ai-document-intelligence" },
      { label: "AI eMail, HR & Quotation applications", href: "/projects/ai-email-hr-quotation-applications" },
      { label: "AI Evaluation & Verification Platform", href: "/projects/ai-evaluation-verification-platform" },
      { label: "Data-centre Virtualisation", href: "/projects/data-centre-virtualisation" },
      { label: "Research: RAI-ECTF — measurable ethical competence", href: "/research/rai-ectf" },
      { label: "Research: AI-enabled HMIS", href: "/research/ai-enabled-hmis" },
    ],
  },
];
