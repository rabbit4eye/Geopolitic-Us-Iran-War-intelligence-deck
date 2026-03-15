// ══════════════════════════════════════════
// GFI DECK — OSINT Data Fetcher
// รันโดย GitHub Actions ทุก 6 ชม.
// ดึง RSS feeds → แปลงเป็น JSON → บันทึก
// ══════════════════════════════════════════

import { writeFileSync, mkdirSync } from 'fs';

// ──── RSS Feed Sources ────
const FEEDS = [
  {
    id: 'aljazeera_mideast',
    name: 'Al Jazeera — Middle East',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'news',
  },
  {
    id: 'defense_one',
    name: 'Defense One',
    url: 'https://www.defenseone.com/rss/',
    category: 'defense',
  },
  {
    id: 'war_on_rocks',
    name: 'War on the Rocks',
    url: 'https://warontherocks.com/feed/',
    category: 'strategic',
  },
  {
    id: 'arms_control',
    name: 'Arms Control Association',
    url: 'https://www.armscontrol.org/rss.xml',
    category: 'policy',
  },
  {
    id: 'breaking_defense',
    name: 'Breaking Defense',
    url: 'https://breakingdefense.com/feed/',
    category: 'defense',
  },
];

// ──── Simple RSS Parser (ไม่ต้อง install อะไร) ────
async function fetchRSS(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'GFI-Deck-Bot/2.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`⚠ ${feed.name}: HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();

    // Simple XML parsing without dependencies
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || '';

      if (title) {
        items.push({
          title: title.replace(/<[^>]*>/g, '').trim(),
          link: link.trim(),
          date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: feed.name,
          sourceId: feed.id,
          category: feed.category,
          snippet: desc.replace(/<[^>]*>/g, '').trim().slice(0, 200),
        });
      }
    }

    console.log(`✅ ${feed.name}: ${items.length} items`);
    return items;

  } catch (err) {
    console.warn(`❌ ${feed.name}: ${err.message}`);
    return [];
  }
}

// ──── Keyword-based alert detection ────
function detectAlerts(items) {
  const ALERT_KEYWORDS = {
    CRITICAL: ['nuclear', 'strait of hormuz', 'hormuz closed', 'ceasefire', 'escalation', 'THAAD depleted', 'interceptor shortage'],
    HIGH: ['drone strike', 'missile launch', 'sanctions', 'rare earth', 'oil spike', 'quantum', 'cyber attack'],
    ELEVATED: ['diplomacy', 'negotiation', 'UN security council', 'proxy', 'hezbollah', 'houthi'],
  };

  const alerts = [];
  for (const item of items) {
    const text = (item.title + ' ' + item.snippet).toLowerCase();
    for (const [level, keywords] of Object.entries(ALERT_KEYWORDS)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) {
          alerts.push({
            level,
            keyword: kw,
            title: item.title,
            source: item.source,
            date: item.date,
            link: item.link,
          });
          break; // one alert per item per level
        }
      }
    }
  }

  return alerts.slice(0, 20); // cap at 20 alerts
}

// ──── Main ────
async function main() {
  console.log(`\n🔄 GFI DECK — OSINT fetch started at ${new Date().toISOString()}\n`);

  // Fetch all feeds in parallel
  const results = await Promise.all(FEEDS.map(fetchRSS));
  const allItems = results.flat();

  // Sort by date (newest first)
  allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Detect alerts
  const alerts = detectAlerts(allItems);

  // Build output
  const output = {
    lastUpdated: new Date().toISOString(),
    feedCount: FEEDS.length,
    totalItems: allItems.length,
    alertCount: alerts.length,
    headlines: allItems.slice(0, 30), // top 30 items
    alerts: alerts,
    sources: FEEDS.map(f => ({ id: f.id, name: f.name, category: f.category })),
  };

  // Write to file
  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/osint-feed.json', JSON.stringify(output, null, 2));

  console.log(`\n✅ Done: ${allItems.length} items, ${alerts.length} alerts`);
  console.log(`📁 Written to public/data/osint-feed.json\n`);
}

main().catch(console.error);
