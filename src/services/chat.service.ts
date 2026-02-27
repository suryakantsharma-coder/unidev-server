import OpenAI from "openai";
import {
  openai,
  OPENAI_MODEL,
  OPENAI_TEMPERATURE,
  OPENAI_MAX_TOKENS,
} from "../config/openai";
import { getConversationContext } from "./intent.service";
import { ChatMessagePayload, LeadData } from "../types/chat.types";
import { logTest, logTestLine } from "../utils/logger";
import { sendLeadEmail } from "./email.service";

const Projects = [
  {
    id: "berry-protocol",
    title: "Berry Protocol – Cross-Chain Liquidity & Automation",
    category: "Blockchain / Web3 Infrastructure",
    client_type: "Web3 Protocol / DeFi Platform",
    image: "/projects/berry-protocol.png",
    overview:
      "A high-speed cross-chain protocol designed to provide instant liquidity and automated execution across multiple blockchains, enabling seamless one-click transactions for end users.",

    what_was_the_problem: [
      "Users lacked funds on destination chains for instant actions",
      "Cross-chain transfers were slow and costly",
      "Manual execution required multiple steps across chains",
      "Poor user experience for time-sensitive transactions",
    ],
    what_we_built: [
      "A protocol that provides instant liquidity from Chain A to Chain B",
      "Automated execution engine for destination chain tasks",
      "One-click cross-chain user transaction flow",
      "Optimized routing for speed + low fees",
    ],
    tech_stack: ["Solidity", "Node.js", "EVM Chains", "Cross-Chain Messaging"],
    result_outcome: [
      "Improved transaction speed across chains",
      "Reduced friction for cross-chain users",
      "Enhanced UX for DeFi and NFT purchases",
      "Enabled scalable cross-chain automation",
    ],

    key_features: [
      "Instant cross-chain liquidity provisioning",
      "Automated execution on destination chain",
      "One-click asset purchase without prior funding",
      "Configurable automation rules set once by the user",
    ],
    business_impact: [
      "Improved transaction speed across chains",
      "Reduced friction for cross-chain users",
      "Enhanced UX for DeFi and NFT purchases",
      "Enabled scalable cross-chain automation",
    ],
    why_clients_choose_this:
      "Showcases Unidev’s expertise in building high-performance cross-chain protocols with real-world DeFi usability.",
    is_live: false,
    tags: ["MVP"],
  },

  {
    id: "unified-smart-wallet",
    title: "Unified Smart Wallet for Cross-Chain Address Management",
    category: "Blockchain / Smart Wallets",
    client_type: "Web3 Platform / Infrastructure Provider",
    image: "/projects/ERC4337.png",
    overview:
      "A smart contract wallet system that provides a unified wallet address across multiple EVM-compatible blockchains using account abstraction standards.",

    what_was_the_problem: [
      "Users had different wallet addresses on different chains",
      "Managing multiple addresses caused confusion and errors",
      "Poor UX for multi-chain applications",
      "Lack of abstraction for cross-chain identity",
    ],
    what_we_built: [
      "ERC-4337 based account abstraction wallet system",
      "Safe smart wallet integration for secure ownership",
      "Custom module to deploy identical wallet addresses across chains",
      "Unified cross-chain wallet identity layer",
    ],
    tech_stack: ["Solidity", "ERC-4337", "Safe Wallet", "EVM Chains"],
    result_outcome: [
      "Simplified multi-chain user experience",
      "Reduced wallet management errors",
      "Improved adoption for cross-chain applications",
      "Future-ready wallet infrastructure",
    ],

    key_features: [
      "Same wallet address across multiple EVM chains",
      "Account abstraction using ERC-4337",
      "Safe-based smart contract wallet",
      "Custom cross-chain deployment module",
    ],
    business_impact: [
      "Simplified multi-chain user experience",
      "Reduced wallet management errors",
      "Improved adoption for cross-chain applications",
      "Future-ready wallet infrastructure",
    ],
    why_clients_choose_this:
      "Demonstrates Unidev’s ability to build advanced Web3 wallet infrastructure aligned with next-generation blockchain standards.",
    is_live: false,
    tags: ["MVP"],
  },

  {
    id: "ai-calling-chatbot",
    title: "AI Calling & Conversational Chatbot System",
    category: "AI Automation / Customer Support",
    client_type: "Businesses / Service Providers",
    image: "/projects/ai-calling.png",
    overview:
      "An AI-powered calling and chat automation system designed to handle customer interactions, reduce human workload, and improve response efficiency.",

    what_was_the_problem: [
      "High volume of repetitive customer queries",
      "Manual calling and support processes",
      "Delayed response times",
      "High operational costs for support teams",
    ],
    what_we_built: [
      "AI-powered voice calling agent for inbound + outbound calls",
      "Conversational chat automation for customer support",
      "Intent-based resolution system for common queries",
      "Admin dashboard for monitoring, analytics, and control",
    ],
    tech_stack: ["Node.js", "AI/LLM Frameworks", "Speech APIs", "React"],
    result_outcome: [
      "Reduced customer support workload",
      "Faster response times",
      "Lower operational costs",
      "Scalable customer engagement system",
    ],

    key_features: [
      "AI voice calling automation",
      "Conversational chat support",
      "Intent detection and smart responses",
      "Admin dashboard for call and chat analytics",
    ],
    business_impact: [
      "Reduced customer support workload",
      "Faster response times",
      "Lower operational costs",
      "Scalable customer engagement system",
    ],
    why_clients_choose_this:
      "Highlights Unidev’s strength in delivering AI-driven automation solutions with immediate operational value.",
    is_live: false,
    tags: ["MVP"],
  },

  {
    id: "dropzone-nft-platform",
    title: "Dropzone – Scalable NFT Distribution Platform",
    image: "/projects/dropzone.webp",
    category: "Blockchain / NFT Infrastructure",
    client_type: "NFT Creators / Web3 Platforms",
    overview:
      "A platform built to simplify and optimize NFT distribution by bundling multiple blockchain transactions into a single execution, significantly reducing gas fees and effort.",

    what_was_the_problem: [
      "High gas fees for NFT minting and distribution",
      "Complex multi-step transaction processes",
      "Time-consuming NFT drops for creators",
      "Poor scalability for large NFT distributions",
    ],
    what_we_built: [
      "A transaction bundling system to combine multiple NFT actions",
      "A streamlined NFT drop workflow for creators",
      "Gas-optimized smart contract execution",
      "Scalable infrastructure for bulk NFT distribution",
    ],
    tech_stack: ["Solidity", "EVM Chains", "Node.js", "Web3 Libraries"],
    result_outcome: [
      "Reduced gas costs significantly",
      "Faster NFT distribution",
      "Lower operational complexity",
      "Improved creator and user experience",
    ],

    key_features: [
      "Transaction bundling for gas optimization",
      "Single-click NFT distribution",
      "Creator-friendly NFT drop management",
      "Cost-efficient blockchain execution",
    ],
    business_impact: [
      "Reduced gas costs significantly",
      "Faster NFT distribution",
      "Lower operational complexity",
      "Improved creator and user experience",
    ],
    why_clients_choose_this:
      "Demonstrates Unidev’s capability to build scalable and cost-efficient NFT infrastructure for real-world creator use cases.",
    is_live: false,
    tags: ["MVP"],
  },

  {
    id: "mytube-platform",
    title: "MyTube – YouTube Enhancer (Extension + Android App)",
    category: "Consumer Product / Productivity",
    image: "/projects/mytube.png",
    client_type: "Direct-to-Consumer Product",
    overview:
      "A cross-platform YouTube enhancement product designed to deliver distraction-free viewing with advanced controls and performance optimization.",

    metrics: {
      active_users: "500+",
      platforms: ["Chrome Extension", "Android App"],
    },

    what_was_the_problem: [
      "Distractions on YouTube reducing productivity",
      "Lack of advanced audio and control features",
      "No unified experience across devices",
    ],
    what_we_built: [
      "A Chrome extension for distraction-free YouTube usage",
      "An Android app with feature parity",
      "Persistent preferences system for users",
      "A fast, minimal UX optimized for daily use",
    ],
    tech_stack: ["Next.js", "TailwindCSS", "Chrome Extension APIs", "Android"],
    result_outcome: [
      "500+ active users organically acquired",
      "High engagement due to productivity-focused design",
      "Scalable foundation for premium features",
    ],

    key_features: [
      "Volume booster and equalizer",
      "Distraction blocking",
      "Advanced watch-later management",
      "Cross-session preference persistence",
    ],
    business_impact: [
      "500+ active users organically acquired",
      "High engagement due to productivity-focused design",
      "Scalable foundation for premium features",
    ],
    why_clients_choose_this:
      "Shows Unidev’s ability to build consumer products that gain real users, not just demos.",
    live_url: "https://mytube.club/",
    is_live: true,
  },

  {
    id: "t3play-staking",
    title: "Web3 Staking Platform for T3Play",
    category: "Web3 / DeFi",
    client_type: "Blockchain Startup",
    image: "/projects/t3play.webp",
    overview:
      "A secure and scalable staking dApp enabling users to stake tokens, earn rewards, and manage assets across multiple chains.",

    what_was_the_problem: [
      "Need for secure staking infrastructure",
      "Complex Web3 UX for non-technical users",
      "Gas optimization concerns",
    ],
    what_we_built: [
      "Secure staking smart contracts in Solidity",
      "Next.js frontend with wallet integrations",
      "Real-time staking UI using contract events",
      "Production-ready staking dApp architecture",
    ],
    tech_stack: ["Solidity", "Next.js", "wagmi", "rainbowkit", "Ethers.js"],
    result_outcome: [
      "Production-ready staking platform",
      "Improved user trust through transparent UI",
      "Optimized gas costs for users",
    ],

    key_features: [
      "Token staking and reward distribution",
      "WalletConnect and Web3Modal integration",
      "Real-time transaction status updates",
      "Multi-chain compatibility",
    ],
    business_impact: [
      "Production-ready staking platform",
      "Improved user trust through transparent UI",
      "Optimized gas costs for users",
    ],
    why_clients_choose_this:
      "Proves Unidev’s expertise in secure, user-friendly Web3 product delivery.",
    live_url: "https://vaults.t3play.com/",
    is_live: true,
  },

  {
    id: "quantx-trading-ui",
    title: "Real-Time Trading Platform UI",
    category: "FinTech / Trading",
    client_type: "Financial Technology Company",
    image: "/projects/quantx-black.jpeg",
    overview:
      "A high-performance real-time trading interface built for professional traders handling live market data.",

    what_was_the_problem: [
      "Laggy UI under high-frequency data",
      "Poor charting experience",
      "Limited layout flexibility",
    ],
    what_we_built: [
      "A real-time trading dashboard UI for professionals",
      "TradingView Advanced Charts integration",
      "WebSocket-based live data rendering system",
      "Modular dockable layouts for flexible workflow",
    ],
    tech_stack: [
      "React",
      "TypeScript",
      "WebSockets",
      "TradingView",
      "Dockview",
    ],
    result_outcome: [
      "Improved trader productivity",
      "Smooth performance under heavy data loads",
      "Professional-grade trading UX",
    ],

    key_features: [
      "Live market data rendering",
      "Advanced chart indicators",
      "Draggable and resizable panels",
      "Optimized performance for traders",
    ],
    business_impact: [
      "Improved trader productivity",
      "Smooth performance under heavy data loads",
      "Professional-grade trading UX",
    ],
    why_clients_choose_this:
      "Highlights Unidev’s strength in performance-critical, real-time systems.",
    is_live: false,
  },

  {
    id: "sqmt-admin",
    title: "SQMT Admin – MERN Web Application",
    category: "Enterprise Admin System",
    client_type: "Operations / Management Team",
    image: "https://placehold.co/800x400/059669/ffffff?text=SQMT+Admin",
    overview:
      "A MERN-based admin web application transforming manual workflows into a centralized digital system.",

    what_was_the_problem: [
      "Manual data handling",
      "No centralized admin visibility",
      "Permission management challenges",
    ],
    what_we_built: [
      "A full MERN admin platform with scalable APIs",
      "Role-based access dashboard for teams",
      "Centralized workflow management system",
      "Analytics dashboards for better visibility",
    ],
    tech_stack: ["MongoDB", "Express.js", "React", "Node.js"],
    result_outcome: [
      "Reduced operational errors",
      "Improved internal efficiency",
      "Foundation for future automation",
    ],

    key_features: [
      "Secure authentication",
      "Role-based access control",
      "Operational analytics dashboards",
      "Scalable backend architecture",
    ],
    business_impact: [
      "Reduced operational errors",
      "Improved internal efficiency",
      "Foundation for future automation",
    ],
    why_clients_choose_this:
      "Shows Unidev’s capability in building reliable enterprise admin systems.",
    is_live: true,
    live_url: "https://square-meter-landing.vercel.app/",
  },

  {
    id: "supersort-extension",
    title: "SuperSort – Productivity Browser Extension",
    image: "/projects/supersort.webp",
    category: "Browser Extension / Productivity",
    client_type: "Internal Tool / Productivity Users",
    overview:
      "A browser extension designed to organize, filter, and streamline repetitive web workflows.",

    what_was_the_problem: [
      "Unorganized web workflows",
      "Time wasted on repetitive tasks",
    ],
    what_we_built: [
      "A lightweight browser extension to organize and automate repetitive web tasks",
      "Fast sorting + filtering UI for daily workflows",
      "Performance-optimized extension architecture",
    ],
    tech_stack: ["JavaScript", "Chrome Extension APIs"],
    result_outcome: ["Improved productivity", "Low-latency daily usage"],

    key_features: [
      "Smart sorting and filtering",
      "Fast, lightweight execution",
      "User-friendly UI",
    ],
    business_impact: ["Improved productivity", "Low-latency daily usage"],
    why_clients_choose_this:
      "Demonstrates Unidev’s ability to build fast, practical productivity tools.",
    is_live: false,
  },

  {
    id: "stackwarz-web3-game",
    title: "Stackwarz – Web3 Skill-Based Game",
    category: "Web3 / Gaming / Esports",
    image: "/projects/stackwarz.webp",
    client_type: "Gaming Platform / Web3 Startup",
    overview:
      "Stackwarz is an engaging Web3 skill-based game where players compete by stacking blocks with precision and speed in real-time. Players participate in tournaments to climb the leaderboard and share the prize pool based on their performance. Built with Web3 mechanics, the game rewards players transparently and fairly.",

    what_was_the_problem: [
      "Need for a competitive gaming ecosystem with blockchain integration",
      "Desire for a fun, engaging game with real-time rewards",
      "Lack of transparency in prize distribution in traditional gaming",
    ],
    what_we_built: [
      "A skill-based stacking game with Web3 reward mechanics",
      "Tournament system with real-time leaderboard",
      "Secure prize pool distribution using smart contracts",
      "Wallet-based authentication and reward claiming flow",
    ],
    tech_stack: [
      "React.js",
      "WebGL / Canvas",
      "Node.js",
      "WebSockets",
      "Solidity / EVM Smart Contracts",
      "WalletConnect",
    ],
    result_outcome: [
      "Increased player engagement through competitive gameplay",
      "Transparent prize distribution powered by blockchain",
      "Scalable tournament system for weekly/daily events",
      "Strong foundation for monetization (entry fees, NFTs, sponsorships)",
    ],

    key_features: [
      "Skill-based stacking game mechanics",
      "Real-time leaderboard updates during tournaments",
      "Blockchain-powered prize pool system with secure smart contracts",
      "Cross-platform support for mobile and desktop users",
      "Web3 wallet integration for player authentication and prize distribution",
    ],
    business_impact: [
      "Increased player engagement through competitive gameplay",
      "Transparent prize distribution powered by blockchain",
      "Scalable tournament system, supporting weekly or daily events",
      "Potential for monetization through entry fees, NFT skins, and sponsorships",
    ],
    why_clients_choose_this:
      "Stackwarz combines addictive gameplay with blockchain rewards, offering a competitive environment where players can earn real-world value, demonstrating Unidev's expertise in Web3 game development and blockchain integration.",
    outcome:
      "Stackwarz successfully merges gaming with blockchain rewards, creating a fair, transparent, and engaging environment. Its real-time leaderboard and prize pool system set the stage for the future of Web3 esports-style casual gaming.",
    live_url: "https://game.mytube.club/",
    is_live: false,
  },

  {
    id: "frank-solana-spl-token-platform",
    title: "FRANK – Solana SPL Token Purchase Platform",
    category: "Web3 / Token Launch Platform",
    client_type: "Blockchain / Token Issuance",
    image: "/projects/frank.webp",
    overview:
      "A secure Solana-based token platform enabling users to purchase FRANK tokens using USDT, USDC, or SOL with real-time pricing and full backend validations.",

    what_was_the_problem: [
      "Need for a business-ready token purchase experience",
      "Handling multiple currency payments securely",
      "Ensuring real-time price updates tied to demand",
    ],
    what_we_built: [
      "A Solana token purchase platform with wallet-connected flow",
      "Secure backend validations for payments and token issuance",
      "Dynamic pricing algorithm tied to real-time purchase activity",
      "Mobile-first UI for smooth buying experience",
    ],
    tech_stack: [
      "Solana blockchain",
      "React",
      "Node.js",
      "Web3 integrations",
      "Wallet connect APIs",
    ],
    result_outcome: [
      "Professional launch platform for the FRANK token",
      "Broadened accessibility with multiple payment options",
      "Enhanced trust due to secure and validated flows",
      "Positioned the client for continued growth in the Solana ecosystem",
    ],

    key_features: [
      "Multi-currency token purchases (USDT, USDC, SOL)",
      "Dynamic pricing algorithm based on real-time demand",
      "Responsive, mobile-friendly UI",
      "Secure backend validations and transaction safeguards",
    ],
    business_impact: [
      "Professional launch platform for the FRANK token",
      "Broadened accessibility for buyers with multiple payment options",
      "Enhanced trust due to transparent pricing and secure flows",
      "Positioned client for continued growth within the Solana ecosystem",
    ],
    why_clients_choose_this:
      "Showcases Unidev’s experience building secure, scalable blockchain purchase platforms with polished UX and business-ready infrastructure.",
    demo_url: "https://frank-plum-one.vercel.app/",
    is_live: true,
  },
];

// TODO: Add projects to the system prompt

const PROJECTS_PROMPT = `
  ${Projects.map(
    (project) => `
    ${project.title} - ${project.overview}
    ${project.what_we_built.map((built) => `- ${built}`).join("\n")}
    ${project.tech_stack.map((tech) => `- ${tech}`).join("\n")}
    ${project.result_outcome.map((outcome) => `- ${outcome}`).join("\n")}
    ${project.key_features.map((feature) => `- ${feature}`).join("\n")}
    ${project.business_impact.map((impact) => `- ${impact}`).join("\n")}
    ${project.why_clients_choose_this}
    ${project.is_live ? "Live" : "Not Live"}
  `,
  ).join("\n")}
`;

const SYSTEM_PROMPT = `
You are Unidev’s AI Tech Consultant.

You are not just a support bot.
You act like a smart, friendly technology consultant helping businesses plan and build digital products.

You are knowledgeable about all Unidev projects listed below.

${PROJECTS_PROMPT}

==========================
🎯 PRIMARY OBJECTIVES
==========================

1. Understand the visitor’s goal.
2. Provide clear, confident answers.
3. Identify serious prospects.
4. Collect lead information naturally.
5. Encourage booking a strategy call.

==========================
🧠 SMART LEAD COLLECTION FLOW
==========================

When a user describes a project idea:

1. Briefly restate what you understood in 1–2 sentences.
2. Ask at most ONE clarifying question if needed.
3. Then smoothly move to contact collection.

Example:

"So you're planning a SaaS platform with real-time features. That’s a strong idea."

If clarification needed:
"Will this be web-only or mobile as well?"

Then say:

"This sounds like something our team can definitely help with. 
If you'd like, you can share your name and best email, and our team will review your idea and get back to you shortly."

Collect in ONE message:

- Name
- Email
- Optional phone
- Optional timeline

Do NOT ask more than 2 back-to-back questions.

Keep it conversational, not like a form.

==========================
📧 LEAD COLLECTION & BACKEND EMAIL TRIGGER
==========================

Once name + email + project summary are collected,
tell the user:

"Thank you. Our team will review this and reach out shortly at hello@unidevsolutions.in or via your contact details."

At the very END of your reply (after a blank line), always append a machine-readable block in **exactly** this format:

LEAD_DATA:
Name: <full name or "-">
Email: <email or "-">
Company: <company or "-">
Budget: <budget or "-">
Timeline: <timeline or "-">
Project Summary: <one-line project summary>

Example:

LEAD_DATA:
Name: Rohan Sharma
Email: rohan@example.com
Company: Acme Corp
Budget: $5k–$10k
Timeline: 2–3 months
Project Summary: SaaS dashboard for internal analytics

Do NOT explain this block.
Do NOT say you are sending an email.
Just append this block so the backend can parse it and send an email to the Unidev team.

==========================
🌍 LANGUAGE SUPPORT
==========================

Support:
English + Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam).

Respond in the same language as the user.
If they mix languages, respond naturally in that mix.

Hindi tone example:
"Bilkul. Aap kya banana chahte hain?"
Use respectful "aap".

==========================
🗣 VOICE OPTIMIZATION (Important)
==========================

- Keep replies 1–3 short sentences.
- Avoid long bullet lists.
- Use natural conversational tone.
- Use contractions in English (we’re, you’ll, that’s).
- Prefer "we" instead of "Unidev".

==========================
🏢 COMPANY INFO
==========================

Location: New Delhi, India
Office hours: Mon–Fri 9AM–6PM IST, Sat 10AM–4PM IST
Email: hello@unidevsolutions.in
Phone: +91 8383801256

Services:
- Web development (React, MERN, SEO-ready sites)
- Mobile apps
- AI & automation
- Blockchain & Web3
- SaaS MVP development
- Custom admin dashboards
- Browser extensions

==========================
📅 BOOKING FLOW
==========================

If user clearly talks about their project or idea (scope, features, business, app/website/SaaS/AI product):

- Briefly restate what you understood about the project in 1–2 sentences.
- Then ALWAYS invite them to connect with the Unidev team and schedule a meeting.

Say something like:
- "This sounds like a great fit for our team. I recommend you connect with us and schedule a quick strategy call so we can go deeper."

If user wants meeting (or agrees to connect):

- Say:
  "I’ll share the booking link so you can choose a time that works for you."
- Then provide:
  [CALENDLY_URL] (or mention that they can use the contact/booking link on the Unidev website).

If they are serious but not explicitly asking for a call:
- Suggest:
  "A short 15-minute strategy call would help us give accurate guidance on cost, timeline, and tech choices."

==========================
🚫 IMPORTANT RULES
==========================

- Do not make up pricing.
- Do not promise timelines.
- Do not argue.
- Do not overwhelm with technical details unless asked.
- Always move conversation toward clarity or action.

End responses sometimes with:
"Anything else I can help with?"
"Aur kuch poochna hai?"
`;

const MAX_MESSAGES = 5;

function toOpenAIMessages(
  messages: ChatMessagePayload[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const trimmed = messages.slice(-MAX_MESSAGES);
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmed.map((m) => ({ role: m.role, content: m.content })),
  ];
  return openaiMessages;
}

export async function acceptChatInput(
  messages: ChatMessagePayload[],
): Promise<void> {
  logTest("acceptChatInput messages", messages);
  getConversationContext(messages);
  // MongoDB removed for now – no persistence
  for (const msg of messages) {
    logTestLine(
      "acceptChatInput",
      `${msg.role}: ${msg.content.slice(0, 80)}${msg.content.length > 80 ? "…" : ""}`,
    );
  }
}

export async function streamChatResponse(
  messages: ChatMessagePayload[],
  signal?: AbortSignal,
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  const openaiMessages = toOpenAIMessages(messages);
  logTest(
    "streamChatResponse openai messages (last 5 + system)",
    openaiMessages,
  );
  const requestOptions = signal ? { signal } : {};
  const stream = await openai.chat.completions.create(
    {
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      max_tokens: OPENAI_MAX_TOKENS,
      stream: true,
      messages: openaiMessages,
      stream_options: { include_usage: true },
    },
    requestOptions,
  );
  return stream as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
}

export async function saveAssistantMessage(content: string): Promise<void> {
  logTest("saveAssistantMessage", { content });
  // MongoDB removed for now – no persistence

  const lead = extractLeadData(content);
  if (lead) {
    try {
      await sendLeadEmail(lead);
      logTest("leadEmailSent", lead);
    } catch (err) {
      logTest("leadEmailError", (err as Error).message);
    }
  }
}

function extractLeadData(text: string): LeadData | null {
  const marker = "LEAD_DATA:";
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return null;

  const block = text.slice(idx).split(/\r?\n\r?\n/)[0]; // up to next blank line
  const lines = block.split(/\r?\n/).map((l) => l.trim());
  const data: Partial<LeadData> = {};

  for (const line of lines) {
    if (line.startsWith("Name:")) {
      data.name = line.slice("Name:".length).trim();
    } else if (line.startsWith("Email:")) {
      data.email = line.slice("Email:".length).trim();
    } else if (line.startsWith("Company:")) {
      data.company = line.slice("Company:".length).trim() || undefined;
    } else if (line.startsWith("Budget:")) {
      data.budget = line.slice("Budget:".length).trim() || undefined;
    } else if (line.startsWith("Timeline:")) {
      data.timeline = line.slice("Timeline:".length).trim() || undefined;
    } else if (line.startsWith("Project Summary:")) {
      data.projectSummary = line.slice("Project Summary:".length).trim();
    }
  }

  if (!data.email || !data.projectSummary || !data.name) {
    return null;
  }

  return {
    name: data.name,
    email: data.email,
    company: data.company,
    budget: data.budget,
    timeline: data.timeline,
    projectSummary: data.projectSummary,
  };
}
