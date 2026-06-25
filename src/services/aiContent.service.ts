import { openai, OPENAI_MODEL } from '../config/openai';
import { AiContent } from '../models/AiContent.model';

export type ContentType   = 'email' | 'whatsapp' | 'follow_up' | 'proposal';
export type ContentTone   = 'professional' | 'friendly' | 'formal' | 'casual';

/**
 * outreachType controls the angle of the email:
 *
 * 'outsourcing'   — Target is a software agency / IT company that delivers
 *                   projects to their own clients. Pitch Unidev as their
 *                   white-label / outsourcing dev partner so they can take on
 *                   more work without hiring.
 *
 * 'client'        — Target needs software built for their own business.
 *                   Standard cold-outreach / new-client email (default).
 *
 * 'partnership'   — Mutual referral or co-sell partnership angle.
 */
export type OutreachType = 'outsourcing' | 'client' | 'partnership';

export interface LeadContext {
  businessName?: string;
  contactPerson?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;       // if provided and scrapeWebsite=true, content is fetched
  categoryName?: string;
  companySize?:   string;
  position?:      string;
  techStack?:     string;
  businessInfo?:  string;
  painPoints?:    string;
  description?:   string;
  senderName?:    string;
  senderCompany?: string;
  offerSummary?:  string;
}

export interface GenerateContentInput {
  type:           ContentType;
  outreachType?:  OutreachType;  // new — controls the email angle
  tone?:          ContentTone;
  language?:      string;
  subject?:       string;
  instructions?:  string;
  leadId?:        string;
  createdBy?:     string;
  leadContext:    LeadContext;
  analyze?:       boolean;       // run company analysis step
  scrapeWebsite?: boolean;       // fetch & analyse the website URL
}

export interface WebsiteScrape {
  url:     string;
  excerpt: string;   // first ~2000 chars of visible text
  title?:  string;
}

export interface CompanyAnalysis {
  summary:           string;
  growthSignals:     string;
  growthScore:       number;
  worthTrying:       boolean;
  worthTryingReason: string;
  needsHelp:         string[];
  recommendation:    string;
  websiteInsights?:  string;    // present when website was scraped
}

export interface GeneratedContent {
  subject?:       string;
  body:           string;
  type:           ContentType;
  outreachType:   OutreachType;
  tone:           ContentTone;
  language:       string;
  analysis?:      CompanyAnalysis;
  websiteScrape?: WebsiteScrape;
}

// ---------------------------------------------------------------------------
// Website scraper (fetch + strip HTML to plain text)
// ---------------------------------------------------------------------------

async function scrapeWebsite(url: string): Promise<WebsiteScrape> {
  const normalized = url.startsWith('http') ? url : `https://${url}`;

  const res = await fetch(normalized, {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OutreachBot/1.0)' },
  });

  const html  = await res.text();
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();

  // Strip scripts, styles, and tags — keep readable text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 2500);

  return { url: normalized, excerpt: text, title };
}

// ---------------------------------------------------------------------------
// Context builder
// ---------------------------------------------------------------------------

function buildContextLines(
  ctx: LeadContext,
  scrape?: WebsiteScrape,
  subject?: string,
  instructions?: string,
): string {
  const lines: string[] = [];
  if (ctx.businessName)   lines.push(`Business Name: ${ctx.businessName}`);
  if (ctx.contactPerson)  lines.push(`Contact Person: ${ctx.contactPerson}`);
  if (ctx.position)       lines.push(`Their Position: ${ctx.position}`);
  if (ctx.categoryName)   lines.push(`Industry / Category: ${ctx.categoryName}`);
  if (ctx.companySize)    lines.push(`Company Size: ${ctx.companySize}`);
  if (ctx.city || ctx.state || ctx.country) {
    lines.push(`Location: ${[ctx.city, ctx.state, ctx.country].filter(Boolean).join(', ')}`);
  }
  if (ctx.website)        lines.push(`Website: ${ctx.website}`);
  if (ctx.techStack)      lines.push(`Tech Stack They Use: ${ctx.techStack}`);
  if (ctx.businessInfo)   lines.push(`Business Info: ${ctx.businessInfo}`);
  if (ctx.painPoints)     lines.push(`Pain Points / Opportunities: ${ctx.painPoints}`);
  if (ctx.description)    lines.push(`Additional Context: ${ctx.description}`);
  if (ctx.offerSummary)   lines.push(`What We Are Offering: ${ctx.offerSummary}`);
  if (ctx.senderName)     lines.push(`Sender Name: ${ctx.senderName}`);
  if (ctx.senderCompany)  lines.push(`Sender Company: ${ctx.senderCompany}`);
  if (subject)            lines.push(`Preferred Subject Hint: ${subject}`);
  if (instructions)       lines.push(`Extra Instructions: ${instructions}`);

  if (scrape) {
    lines.push(`\n--- Website Content (${scrape.url}) ---`);
    if (scrape.title) lines.push(`Page Title: ${scrape.title}`);
    lines.push(`Visible Text:\n${scrape.excerpt}`);
    lines.push(`--- End of Website Content ---`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// System prompt per outreach type
// ---------------------------------------------------------------------------

const OUTREACH_PERSONAS: Record<OutreachType, (sender: string) => string> = {

  outsourcing: (sender) => `
You are an outsourcing sales specialist writing on behalf of ${sender},
a software development company that works as a white-label or outsourcing partner for agencies and IT firms.

${sender} specialises in:
- Custom software development
- AI agents & automation
- Blockchain & Web3 solutions
- Mobile apps (iOS & Android)
- Web apps & scalable systems
- MVP development
- CRM & SaaS platforms

Your target is a company that BUILDS software or digital products for its own clients —
an agency, IT consultancy, or dev shop. They likely have overflow work, skill gaps, or
want to offer capabilities they do not have in-house.

Pitch ${sender} as their trusted outsourcing partner — the team behind the scenes that
helps them deliver more, take on bigger projects, and expand their service line without
the cost of full-time hires.
`.trim(),

  client: (sender) => `
You are a software agency outreach specialist writing on behalf of ${sender},
a software development company that builds custom websites, apps, CRMs, and digital solutions.

Your target is a business that NEEDS software built to run or grow their operations.
`.trim(),

  partnership: (sender) => `
You are a business development specialist writing on behalf of ${sender},
a software development company specialising in custom software, AI, blockchain, Web3,
mobile & web apps, CRM, SaaS, and MVP development.

Your goal is to propose a mutual referral or co-sell partnership where both companies
send each other clients for services outside their own core offering.
`.trim(),
};

// ---------------------------------------------------------------------------
// Company analyser
// ---------------------------------------------------------------------------

async function analyzeCompany(
  ctx: LeadContext,
  scrape: WebsiteScrape | undefined,
  outreachType: OutreachType,
): Promise<CompanyAnalysis> {
  const contextLines = buildContextLines(ctx, scrape);

  const outsourcingExtra = outreachType === 'outsourcing'
    ? `
Also assess:
- Does this company appear to build software / digital products for clients?
- What services do they offer that we could support behind the scenes?
- Are there signs of overflow work, skill gaps, or limited team size?
- Add a "websiteInsights" field summarising key things noticed on their website.`
    : '';

  const systemPrompt = `
You are a senior B2B sales strategist and business analyst.
Given details about a potential lead, analyse them and return a JSON assessment.

${outsourcingExtra}

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "summary": "string",
  "growthSignals": "string",
  "growthScore": number (1-10),
  "worthTrying": boolean,
  "worthTryingReason": "string",
  "needsHelp": ["string"],
  "recommendation": "string",
  "websiteInsights": "string or null"
}`.trim();

  const completion = await openai.chat.completions.create({
    model:           OPENAI_MODEL,
    temperature:     0.4,
    max_tokens:      900,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: `Lead data:\n\n${contextLines}\n\nReturn JSON.` },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
  return JSON.parse(raw) as CompanyAnalysis;
}

// ---------------------------------------------------------------------------
// Message generator
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<ContentType, string> = {
  email:     'a cold outreach email',
  whatsapp:  'a short WhatsApp message',
  follow_up: 'a follow-up message (the lead was previously contacted)',
  proposal:  'a business proposal introduction message',
};

// Converts GPT plain-text output to clean HTML email body
function plainTextToHtml(text: string): string {
  const emailStyle = `font-family: Arial, sans-serif; font-size: 15px; color: #222222; line-height: 1.7;`;
  const pStyle     = `margin: 0 0 16px 0;`;

  const paragraphs = text
    .split(/\n{2,}/)                         // split on blank lines
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      // Within a paragraph, single newlines become <br>
      const inner = block.replace(/\n/g, '<br>');
      return `<p style="${pStyle}">${inner}</p>`;
    })
    .join('\n');

  return `<div style="${emailStyle}">\n${paragraphs}\n</div>`;
}

async function generateMessage(
  ctx: LeadContext,
  scrape: WebsiteScrape | undefined,
  type: ContentType,
  outreachType: OutreachType,
  tone: ContentTone,
  language: string,
  analysis: CompanyAnalysis | undefined,
  subject?: string,
  instructions?: string,
): Promise<{ subject?: string; body: string }> {
  const senderCompany = ctx.senderCompany ?? 'Unidev Solutions';

  const persona = OUTREACH_PERSONAS[outreachType](senderCompany);

  const analysisBlock = analysis ? `
Company Analysis (use this to personalise the message):
- Summary: ${analysis.summary}
- Growth signals: ${analysis.growthSignals}
- Areas needing help: ${analysis.needsHelp.join(', ')}
- Strategic note: ${analysis.recommendation}
${analysis.websiteInsights ? `- Website insights: ${analysis.websiteInsights}` : ''}
` : '';

  const emailFormat = `
Subject line rules (CRITICAL):
- 5-8 words max. Make it curiosity-driven and specific to them.
- NO generic lines like "Partnership opportunity" or "Let's work together".
- Good examples for outsourcing: "Handling overflow work for [Agency]?", "Extra dev capacity for your client projects", "Noticed you build [X] — have a thought"
- Good examples for client: "Quick idea for [BusinessName]", "Noticed something on your site"

Return in this exact format:
SUBJECT: <subject line>
BODY:
<email body>`;

  const systemPrompt = `
${persona}

Write ${TYPE_LABELS[type]} in ${language}.
Tone: ${tone}.
${analysisBlock}
Rules:
- Write like a real person — casual and genuine, never templated.
- Reference ONE specific detail from their website, industry, or business that shows you looked at them.
- NEVER use buzzwords: no "digital age", "streamlined", "leverage", "synergy", "cutting-edge", "holistic".
- Problem first — acknowledge what they do or what challenge they face, then introduce how you help.
- Exactly 3 short paragraphs. Busy people do not read long emails.
- End with ONE simple CTA: a quick call, a reply, or asking if they are open to it.
${type === 'email' ? emailFormat : 'Return only the message body.'}`.trim();

  const contextLines = buildContextLines(ctx, scrape, subject, instructions);
  const userPrompt   = `Lead information:\n\n${contextLines}\n\nWrite ${TYPE_LABELS[type]}.`;

  const completion = await openai.chat.completions.create({
    model:       OPENAI_MODEL,
    temperature: 0.75,
    max_tokens:  650,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';
  let parsedSubject: string | undefined;
  let body = raw;

  if (type === 'email') {
    const subjectMatch = raw.match(/^SUBJECT:\s*(.+)/m);
    const bodyMatch    = raw.match(/BODY:\s*([\s\S]+)/m);
    if (subjectMatch) parsedSubject = subjectMatch[1].trim();
    if (bodyMatch)    body          = bodyMatch[1].trim();
  }

  // Apply HTML formatting to all email-like types (email, follow_up, proposal)
  if (type !== 'whatsapp') {
    body = plainTextToHtml(body);
  }

  return { subject: parsedSubject, body };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateContent(input: GenerateContentInput): Promise<GeneratedContent> {
  const tone         = input.tone         ?? 'professional';
  const language     = input.language     ?? 'English';
  const type         = input.type;
  const outreachType = input.outreachType ?? 'client';
  const ctx          = input.leadContext;

  // 1. Optionally scrape the website
  let websiteScrape: WebsiteScrape | undefined;
  if (input.scrapeWebsite && ctx.website) {
    try {
      websiteScrape = await scrapeWebsite(ctx.website);
    } catch (err) {
      process.stderr.write(`[AI] Website scrape failed for ${ctx.website}: ${err}\n`);
    }
  }

  // 2. Optionally run company analysis (uses scraped content if available)
  let analysis: CompanyAnalysis | undefined;
  if (input.analyze) {
    analysis = await analyzeCompany(ctx, websiteScrape, outreachType);
  }

  // 3. Generate the message
  const { subject, body } = await generateMessage(
    ctx, websiteScrape, type, outreachType, tone, language,
    analysis, input.subject, input.instructions,
  );

  // 4. Persist
  if (input.createdBy) {
    await AiContent.create({
      leadId:    input.leadId,
      type,
      tone,
      language,
      subject,
      body,
      createdBy: input.createdBy,
    });
  }

  return { subject, body, type, outreachType, tone, language, analysis, websiteScrape };
}

export async function getAiContentByLead(leadId: string) {
  return AiContent.find({ leadId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

export async function listAiContent(filters: {
  leadId?: string;
  type?: ContentType;
  createdBy?: string;
}) {
  const query: Record<string, unknown> = {};
  if (filters.leadId)    query.leadId    = filters.leadId;
  if (filters.type)      query.type      = filters.type;
  if (filters.createdBy) query.createdBy = filters.createdBy;
  return AiContent.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}
