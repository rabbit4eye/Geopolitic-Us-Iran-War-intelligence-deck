import { readFileSync, writeFileSync, existsSync } from 'fs';

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) { console.log('⚠ No API key — skipping AI brief'); process.exit(0); }

// ──── อ่าน headlines ใหม่ ────
const feed = JSON.parse(readFileSync('public/data/osint-feed.json', 'utf-8'));
if (!feed.headlines?.length) { console.log('⚠ No headlines — skipping'); process.exit(0); }

// ──── SMART CHECK: มีอะไรใหม่จริงไหม? ────
let previousTitles = [];
if (existsSync('public/data/ai-brief.json')) {
  try {
    const prev = JSON.parse(readFileSync('public/data/ai-brief.json', 'utf-8'));
    previousTitles = prev._processedTitles || [];
  } catch {}
}

const currentTitles = feed.headlines.slice(0, 20).map(h => h.title);
const newTitles = currentTitles.filter(t => !previousTitles.includes(t));

// ──── ถ้าไม่มีข่าวใหม่ = ไม่เรียก AI = ไม่กิน token ────
if (newTitles.length === 0) {
  console.log('😴 No new headlines since last brief — skipping AI call (0 tokens used)');
  process.exit(0);
}

// ──── ปรับ prompt ตามจำนวนข่าวใหม่ ────
const isHighActivity = newTitles.length >= 10;
const isMediumActivity = newTitles.length >= 5;

const headlineText = feed.headlines.slice(0, isHighActivity ? 20 : 10).map((h, i) =>
  `${i + 1}. [${h.source}] ${h.title}`
).join('\n');

// Alert keywords = ถ้ามีคำเหล่านี้ = เพิ่ม depth ของ analysis
const criticalKeywords = ['nuclear', 'hormuz', 'ceasefire', 'escalation', 'THAAD', 'quantum'];
const hasCritical = feed.alerts?.some(a => a.level === 'CRITICAL');

const analysisDepth = hasCritical ? 'DEEP' : isHighActivity ? 'STANDARD' : 'LIGHT';
const maxTokens = hasCritical ? 2000 : isHighActivity ? 1500 : 800;

console.log(`📊 Activity: ${newTitles.length} new headlines`);
console.log(`📊 Analysis depth: ${analysisDepth} (max ${maxTokens} tokens)`);
console.log(`📊 Critical alerts: ${hasCritical ? 'YES' : 'NO'}`);

// ──── สร้าง prompt ตาม depth ────
let prompt;

if (analysisDepth === 'LIGHT') {
  prompt = `You are a geopolitical intelligence analyst. Analyze these ${newTitles.length} new OSINT headlines:

${headlineText}

Respond in this exact JSON format only, no markdown, no backticks:
{
  "timestamp": "${new Date().toISOString()}",
  "analysisDepth": "LIGHT",
  "brief": "1-2 sentence summary in Thai ของข่าวใหม่",
  "threatLevel": "CRITICAL or HIGH or ELEVATED or GUARDED or LOW",
  "threatReason": "1 sentence why in Thai",
  "keyDevelopments": ["point 1 in Thai", "point 2", "point 3"],
  "watchItems": ["watch 1 in Thai", "watch 2"]
}`;
} else if (analysisDepth === 'DEEP') {
  prompt = `You are a senior geopolitical intelligence analyst (Systemic Foresight Decoder framework).
CRITICAL ALERT DETECTED. Provide deep analysis.

New headlines (${newTitles.length} new out of ${feed.totalItems} total):

${headlineText}

Active alerts: ${feed.alerts?.map(a => `[${a.level}] ${a.keyword}: ${a.title}`).join('\n')}

Respond in this exact JSON format only, no markdown, no backticks:
{
  "timestamp": "${new Date().toISOString()}",
  "analysisDepth": "DEEP",
  "brief": "3-4 sentence executive summary in Thai — focus on escalation trajectory",
  "threatLevel": "CRITICAL or HIGH or ELEVATED or GUARDED or LOW",
  "threatReason": "2 sentences why in Thai with specific evidence",
  "keyDevelopments": ["development 1 in Thai", "development 2", "development 3", "development 4", "development 5"],
  "marketSignal": "2 sentences on economic/energy/supply chain impact in Thai",
  "watchItems": ["critical watch 1 in Thai", "watch 2", "watch 3"],
  "perspectiveUS": "2 sentences US strategic calculus in Thai",
  "perspectiveIran": "2 sentences Iran strategic calculus in Thai",
  "perspectiveChina": "2 sentences China positioning in Thai",
  "escalarionRisk": "1-10 scale with 1 sentence explanation in Thai",
  "scenarioNext48h": "Most likely scenario in next 48 hours in Thai"
}`;
} else {
  prompt = `You are a geopolitical intelligence analyst (Systemic Foresight Decoder framework).

Analyze these OSINT headlines (${newTitles.length} new):

${headlineText}

Respond in this exact JSON format only, no markdown, no backticks:
{
  "timestamp": "${new Date().toISOString()}",
  "analysisDepth": "STANDARD",
  "brief": "2-3 sentence executive summary in Thai",
  "keyDevelopments": ["development 1 in Thai", "development 2", "development 3", "development 4", "development 5"],
  "threatLevel": "CRITICAL or HIGH or ELEVATED or GUARDED or LOW",
  "threatReason": "1 sentence why in Thai",
  "marketSignal": "1 sentence on economic impact in Thai",
  "watchItems": ["watch 1 in Thai", "watch 2", "watch 3"],
  "perspectiveUS": "1 sentence US view in Thai",
  "perspectiveIran": "1 sentence Iran view in Thai",
  "perspectiveChina": "1 sentence China view in Thai"
}`;
}

try {
  console.log('🤖 Calling OpenRouter API...');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://geopolitic-us-iran-war-intelligence.vercel.app',
      'X-Title': 'GFI Deck v2',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  console.log(`📊 Tokens used: ${usage.total_tokens || 'unknown'} (prompt: ${usage.prompt_tokens || '?'}, completion: ${usage.completion_tokens || '?'})`);

  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  const brief = JSON.parse(clean);

  // เก็บ titles ที่ process แล้ว สำหรับ smart check รอบถัดไป
  brief._processedTitles = currentTitles;
  brief._tokensUsed = usage.total_tokens || 0;
  brief._newHeadlines = newTitles.length;

  writeFileSync('public/data/ai-brief.json', JSON.stringify(brief, null, 2));
  console.log(`✅ AI brief written (${analysisDepth} mode, ${newTitles.length} new headlines analyzed)`);

} catch (err) {
  console.error('❌ AI brief failed:', err.message);
  process.exit(0);
}
