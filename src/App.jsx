import { useState, useEffect, useCallback, useMemo } from "react";

// ══════════════════════════════════════════════
// GFI DECK v2 — Geopolitical Finance Intelligence
// Rabbit4eye OS × Systemic Foresight Decoder
// ══════════════════════════════════════════════

const TABS = [
  { id: "overview", label: "OVERVIEW", icon: "◉" },
  { id: "timeline", label: "TIMELINE", icon: "⏱" },
  { id: "perspectives", label: "4-SIDED VIEW", icon: "◈" },
  { id: "wareconomics", label: "WAR ECONOMICS", icon: "⚖" },
  { id: "techshift", label: "TECH SHIFT", icon: "⚛" },
  { id: "sources", label: "INTEL SOURCES", icon: "📡" },
];

const SIDES = {
  us: { label: "US / Western Coalition", color: "#4a9eff", icon: "🦅", shortLabel: "US" },
  iran: { label: "Iran / Axis of Resistance", color: "#ff6b35", icon: "🕊", shortLabel: "IRAN" },
  china: { label: "China / SCO Bloc", color: "#ffd700", icon: "🐉", shortLabel: "CHINA" },
  neutral: { label: "Global South / Third-party", color: "#00e68a", icon: "🌍", shortLabel: "GLOBAL" },
};

// ──── CONFLICT TIMELINE (reconstructed from multiple OSINT sources) ────
const TIMELINE_EVENTS = [
  { date: "2024-Q4", title: "Polymarket signals: Trump win + Iran conflict priced in", category: "signal", sources: ["Polymarket", "Prof. Jiang prediction"], verified: true },
  { date: "2025-01", title: "Trump administration signals maximum pressure 2.0 on Iran", category: "policy", sources: ["Critical Threats", "Reuters"], verified: true },
  { date: "2025-06", title: "Operation Epic Fury Phase 1 — nuclear site strikes (Fordow, Natanz, Isfahan)", category: "kinetic", sources: ["CENTCOM", "Washington Institute"], verified: true },
  { date: "2025-06", title: "Iran retaliatory strikes on Al Udeid base — signaling pattern (like post-Soleimani)", category: "kinetic", sources: ["IranWarLive", "ORF India"], verified: true },
  { date: "2025-H2", title: "THAAD interceptor stock depleted 20-50% — CSIS assessment", category: "logistics", sources: ["CSIS", "Defense Express"], verified: true },
  { date: "2025-10", title: "China mass-produces single-photon detector (quantum radar component)", category: "tech", sources: ["Quantum Insider", "CETC/Science & Tech Daily"], verified: false },
  { date: "2026-01-08", title: "Nationwide Iranian protests — 36,500+ killed in 2-day crackdown", category: "internal", sources: ["Iran International", "Factnameh"], verified: true },
  { date: "2026-02-27", title: "Pasteur Street strikes — Ayatollah targeted, decapitation strategy", category: "kinetic", sources: ["ORF India", "IranWarLive", "CENTCOM"], verified: true },
  { date: "2026-02-28", title: "Iran full retaliation — Hormuz disruption, drone swarms, GCC infrastructure hits", category: "kinetic", sources: ["IranWarLive", "MarineTraffic", "ADS-B Exchange"], verified: true },
  { date: "2026-03-02", title: "Friendly fire incident: Kuwait air defense vs US F-15 — 'software problem'", category: "incident", sources: ["ORF India", "EurasiaReview"], verified: true },
  { date: "2026-03-02", title: "Iran strikes AWS data centers in UAE — targeting AI/C2 infrastructure", category: "cyber", sources: ["ORF India", "EurasiaReview"], verified: true },
  { date: "2026-03-05", title: "US military troops relocate THAAD from Korea bases — inventory signal", category: "logistics", sources: ["Korean press", "sentdefender"], verified: true },
  { date: "2026-03-10", title: "ORF publishes 'Intelligence for Hyperwar' — AI/HUMINT fusion analysis", category: "analysis", sources: ["ORF India"], verified: true },
  { date: "2026-03-12", title: "China rare earth magnet export restrictions tightened — defense impact", category: "supply", sources: ["CSIS", "Mining.com"], verified: true },
  { date: "2026-03-15", title: "Conflict Day 16+ — no ceasefire, multiple fronts active", category: "ongoing", sources: ["Critical Threats daily update"], verified: true },
];

// ──── EXPERT PERSPECTIVES (4 sides) ────
const EXPERT_VIEWS = [
  {
    side: "us",
    experts: [
      { name: "Prof. Robert Pape", role: "U. of Chicago — Escalation traps scholar", handle: "@ProfessorPape", keyInsight: "มหาอำนาจตกหลุม escalation trap ซ้ำแล้วซ้ำเล่าในประวัติศาสตร์ สงครามนี้มีลักษณะเดียวกัน — ทั้งสองฝ่ายไม่ต้องการ full war แต่ถูกดึงเข้าไปเรื่อยๆ", biasNote: "US academic framework — มองผ่าน lens ของ US foreign policy failure patterns" },
      { name: "Dennis Ross", role: "Washington Institute — Former Special Envoy", handle: "washingtoninstitute.org", keyInsight: "Perception mismatch เป็นตัวขับ: ทั้งสองฝ่ายอ่านอีกฝ่ายผิด Trump คิดว่า limited strike = limited response แต่ cumulative effect ทำให้ escalation หยุดไม่อยู่", biasNote: "US establishment perspective — เน้น diplomatic solution ภายใต้ US leadership" },
      { name: "Adil Husain", role: "Intelligence Council — Independent analyst", handle: "adilhusain.substack.com", keyInsight: "Stacked game: 4+ ผู้เล่นเล่นเกมคนละเกมบนสนามเดียวกัน ระบบ default เป็น 'hurting stalemate' — ไม่มีใครชนะ ไม่มีใครยอม", biasNote: "Independent แต่ใช้ framework ตะวันตกเป็นหลัก" },
    ],
    consensus: "US ต้องปิดเกมเร็ว เพราะ asymmetric cost + interceptor depletion ทำให้สงครามยืดเยื้อเสียเปรียบ แต่ 'เร็ว' ทำได้ยากเพราะ IRGC decentralized + domestic political pressure ทั้งสองฝั่ง",
  },
  {
    side: "iran",
    experts: [
      { name: "Factnameh (Souzanchi)", role: "Iranian fact-checker, exile in Toronto", handle: "@Factnameh", keyInsight: "โครงสร้างระบอบถูกสร้างให้ไม่ต้องมีหัว — ยึดเมืองหลวงครึ่งประเทศ IRGC ก็ยังปฏิบัติอิสระได้ แต่ประชาชนไม่พอใจระบอบอย่างรุนแรง (มกราคม 2026)", biasNote: "Opposition lens — เห็นทั้ง regime resilience และ fragility ชัด" },
      { name: "Mehr News Agency", role: "Iranian state-aligned media", handle: "en.mehrnews.com", keyInsight: "Trump ใช้ Madman Theory สร้างบรรยากาศกลัว แล้วเสนอเจรจา — เป็นรูปแบบที่ทำซ้ำได้ แต่อิหร่านเรียนรู้จาก Saddam ว่าอย่ายอม containment", biasNote: "State media — เน้นความแข็งแกร่งของระบอบ ลดทอนปัญหาภายใน" },
      { name: "ISIS (Inst. for Science)", role: "Nuclear analysis think tank", handle: "@TheGoodISIS", keyInsight: "หลังสงครามมิถุนายน 2025 อิหร่านสูญเสียศักยภาพ nuclear breakout อย่างมาก ใช้ Game Theory + Fault Tree Analysis ประเมินว่าโอกาส succeed ลดลงมาก", biasNote: "Technical/nuclear focused — ไม่ cover มิติ social/economic" },
    ],
    consensus: "อิหร่านมีทั้ง resilience (IRGC chain of command, drone production, Shia mobilization) และ fragility (ประชาชน 36,500+ คนถูกฆ่า, internet ถูกตัด, เศรษฐกิจพัง) การ assess ว่า 'อิหร่านชนะแน่' เป็นการมองข้าม fragility dimension",
  },
  {
    side: "china",
    experts: [
      { name: "Prof. Jiang Xueqin", role: "Predictive History (YouTube) — Yale grad", handle: "@xueqinjiang", keyInsight: "Interceptor math: US ใช้ $1M สกัดโดรน $50K ที่ยิงจากรถบรรทุก — unsustainable ในระยะยาว สงครามนี้อาจทำลายระบบ unipolar ที่ US ครองมาตั้งแต่ 1991", biasNote: "Chinese-Canadian — มี lean ไปทาง 'US decline' thesis ตาม Chinese strategic narrative" },
      { name: "NEXTA", role: "Eastern European OSINT outlet", handle: "@nexta_tv", keyInsight: "ทุกคนดูอิหร่าน แต่ไม่มีใครดูจีน — US กำลังสร้าง 'global trap' จีนอาจเป็น biggest winner ของ conflict นี้โดยไม่ต้องยิงสักนัด", biasNote: "Eastern European lens — มองผ่านประสบการณ์ Ukraine conflict" },
    ],
    consensus: "จีนเล่น 'win without fighting' — แทงกั๊ก (hedging) ทั้งช่วยอิหร่าน (GPS/satellite) และเสนอเป็นตัวกลางเจรจา (Moderator Rent) ยิ่ง US ติดหล่มนาน จีนยิ่งได้เปรียบทั้ง rare earth leverage และ geopolitical space",
  },
  {
    side: "neutral",
    experts: [
      { name: "Lt Gen H S Panag (Ret.)", role: "Indian Army", handle: "@rwac48", keyInsight: "ความยืดหยุ่น กำลังโดรน/ขีปนาวุธ และ asymmetric strategy ของอิหร่านทำให้ US-Israel ประหลาดใจ 72 ชม.แรก เจตนาต่อไปคือทำลาย nuclear + military + economic infrastructure", biasNote: "Indian military perspective — เน้น operational assessment ไม่ political" },
      { name: "Oraclum Intelligence", role: "Independent macro strategy", handle: "oraclum.substack.com", keyInsight: "ตลาดเป็น parallel negotiator — ทุก tick ของน้ำมัน/bond yield/ตลาดหุ้น คือ signal ทั้ง 2 ฝ่ายถูก punish สำหรับความไม่แน่นอน มี 3 stable outcomes: coalition win fast, stalemate, negotiated settlement", biasNote: "Market-focused — มอง geopolitics ผ่าน lens ของ capital flows" },
      { name: "ORF India", role: "Observer Research Foundation", handle: "orfonline.org", keyInsight: "Intelligence ยุคนี้คือ 'Hyperwar' — AI/LLM ประมวลผลและสั่งการอิสระ แต่ friendly fire คูเวต-US (2 มี.ค.) แสดงให้เห็นว่า overreliance บน AI มีราคา HUMINT ยังสำคัญมาก", biasNote: "Indian strategic autonomy lens — มองเป็น neutral observer แต่มี stake ใน energy security" },
    ],
    consensus: "Third-party มองว่าสงครามนี้ไม่มีผู้ชนะชัดเจน (hurting stalemate) แต่มี 'collateral winners' — จีนได้ geopolitical space, อินเดียได้ bargaining power, defense contractors ได้ demand ตลาดเป็นตัววัดจริงว่าใครกำลังชนะ/แพ้",
  },
];

// ──── WAR ECONOMICS DATA ────
const ASYMMETRIC_DATA = [
  { category: "ATTACK COST", iran: "$3K-50K per drone", us: "$1-3M per interceptor", ratio: "1:100 to 1:1000", advantage: "iran" },
  { category: "PRODUCTION RATE", iran: "300-400 drones/month", us: "10-20 interceptors/month", ratio: "20:1 to 40:1", advantage: "iran" },
  { category: "REPLENISH TIME", iran: "Continuous (domestic factories)", us: "20-25 months for full restock", ratio: "—", advantage: "iran" },
  { category: "SUPPLY CHAIN", iran: "Domestic + China/Turkey imports", us: "78% minerals from China (USCC)", ratio: "—", advantage: "iran" },
  { category: "AIR SUPERIORITY", iran: "Minimal air defense", us: "Overwhelming (F-22/F-35/B-2)", ratio: "—", advantage: "us" },
  { category: "NAVAL POWER", iran: "Asymmetric (mines/fast boats)", us: "Dominant (carrier groups)", ratio: "—", advantage: "us" },
  { category: "CYBER/AI", iran: "Limited but growing", us: "Advanced but vulnerable (AWS strike)", ratio: "—", advantage: "us" },
  { category: "DOMESTIC SUPPORT", iran: "Regime fractured (Jan 2026 uprising)", us: "Divided (what does 'winning' mean?)", ratio: "—", advantage: "contested" },
];

const SUPPLY_VULNERABILITY = [
  { material: "Heavy Rare Earth", chinaControl: 99, defenseUse: "Missile guidance, radar magnets", timeline: "No US production. 2027 DFARS ban pending", source: "CSIS" },
  { material: "Rare Earth Magnets", chinaControl: 93, defenseUse: "Tomahawk, F-35, Predator, JDAM", timeline: "MP Materials building (2025-27)", source: "DOD/GAO" },
  { material: "Titanium Sponge", chinaControl: 67, defenseUse: "F-22 (39% Ti), sub hulls, missile casings", timeline: "US: 1 producer, 500t/yr vs 42,000t imports", source: "Oregon Group" },
  { material: "Gallium", chinaControl: 98, defenseUse: "Advanced radar, EW, military chips", timeline: "China export license required since 2024", source: "NATO" },
  { material: "Tungsten", chinaControl: 80, defenseUse: "Armor-piercing munitions", timeline: "Price spiked 375% since 2024 restrictions", source: "Chemistry World" },
];

// ──── TECH SHIFT / QUANTUM ────
const TECH_DOMAINS = [
  {
    domain: "QUANTUM SENSING",
    readiness: "3-5 years to field deployment",
    applications: [
      "Quantum Radar — จับ stealth aircraft (CETC prototype, unverified in field)",
      "Quantum Magnetometry — ตรวจจับเรือดำน้ำ/บังเกอร์ใต้ดินด้วยสนามแม่เหล็ก",
      "Quantum Gravimetry — วัดแรงโน้มถ่วงหาโครงสร้างใต้ดิน + นำทางแทน GPS",
    ],
    chinaStatus: "Mass-producing photon detector (2025). Outdoor tests claimed.",
    usStatus: "NQI extended to 2034. NASA involvement. DARPA Quantum Apertures.",
    gameChanger: "ถ้าใช้ได้จริง → stealth aircraft ทั้ง fleet มูลค่าหมื่นล้าน USD ล้าสมัยทันที",
  },
  {
    domain: "QUANTUM COMMUNICATION (QKD)",
    readiness: "Operational (China). 2-5 years (others)",
    applications: [
      "ดักฟังไม่ได้ — photon เปลี่ยนสถานะเมื่อถูกดัก ปลายทางรู้ทันที",
      "Military C2 — สั่งการทหารแบบ tamper-proof",
      "Satellite QKD — สื่อสารข้ามทวีปแบบ quantum-encrypted",
    ],
    chinaStatus: "Micius + Jinan-1 satellites operational. 4,600km integrated network. 12,900km QKD demonstrated.",
    usStatus: "Lagging. NQI focuses on computing. No QKD satellite yet.",
    gameChanger: "ถ้าจีน deploy QKD เต็มรูปแบบ → ข่าวกรอง SIGINT ของ US/Five Eyes ถูก neutralize",
  },
  {
    domain: "QUANTUM COMPUTING",
    readiness: "7-10 years to cryptobreaking",
    applications: [
      "Break RSA/ECC encryption — ต้อง 13K-15K logical qubits",
      "Drug/material discovery — simulate molecular structures",
      "Military optimization — logistics, targeting, resource allocation",
    ],
    chinaStatus: "National priority (Five-Year Plan). China-Russia joint research since 2019.",
    usStatus: "DOE Genesis Mission. IBM/Google/Microsoft ecosystem. ~1000 physical qubits (IBM Heron).",
    gameChanger: "Hack Now Decrypt Later — ข้อมูลที่ถูกขโมยวันนี้จะถูกถอดรหัสเมื่อ quantum computing พร้อม",
  },
];

// ──── INTEL SOURCES (5 selected OSINT tools) ────
const INTEL_SOURCES = [
  {
    name: "IranWarLive",
    url: "https://iranwarlive.com",
    type: "Live Conflict Map",
    dataProvides: "Kinetic events, casualties (civilian vs military), airspace closures",
    methodology: "Automated parsing from Reuters, AP, Al Jazeera, CENTCOM. Mathematically verified casualty breakdown.",
    useFor: "Real-time tactical awareness — where strikes are happening NOW",
    reliability: "HIGH — uses only verified sources, no social media rumors",
    color: "#ff2d2d",
  },
  {
    name: "Critical Threats (AEI-ISW)",
    url: "https://www.criticalthreats.org",
    type: "Daily Strategic Analysis",
    dataProvides: "Iran Updates with static maps, force movements, political developments",
    methodology: "Analyst-driven. Combines OSINT with subject matter expertise. Published daily.",
    useFor: "Strategic context — WHY things are happening, not just what",
    reliability: "HIGH — established think tank, consistent methodology",
    color: "#ff8c00",
  },
  {
    name: "ADS-B Exchange",
    url: "https://globe.adsbexchange.com",
    type: "Flight Tracking",
    dataProvides: "Military aircraft movements — unfiltered (unlike FlightRadar24)",
    methodology: "Crowdsourced ADS-B receivers. Does not hide US military or 'blocked' aircraft.",
    useFor: "Force deployment signals — THAAD movements, tanker activity, B-2 flights",
    reliability: "MEDIUM-HIGH — transponders can be turned off during operations",
    color: "#00bfff",
  },
  {
    name: "CSIS Analysis",
    url: "https://www.csis.org",
    type: "Policy & Supply Chain Research",
    dataProvides: "Rare earth restrictions, defense industrial base, wargaming simulations",
    methodology: "Research papers, congressional testimony, data-driven analysis.",
    useFor: "Long-term structural analysis — supply chain, industrial base, policy implications",
    reliability: "HIGH — gold standard for US defense policy research",
    color: "#ffd700",
  },
  {
    name: "Iran Monitor",
    url: "https://www.iranmonitor.org",
    type: "Multi-source OSINT Dashboard",
    dataProvides: "News sentiment, X/Twitter feeds, prediction markets, internet connectivity",
    methodology: "Aggregates multiple OSINT feeds into single interface. Open source.",
    useFor: "Broad situational awareness — sentiment + connectivity = regime stability indicator",
    reliability: "MEDIUM — aggregator quality depends on source quality",
    color: "#00e68a",
  },
];

// ══════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════

function Pulse({ color = "#ff2d2d", size = 8 }) {
  return (
    <span style={{ display: "inline-block", position: "relative", width: size, height: size, marginRight: 6, verticalAlign: "middle" }}>
      <span style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, animation: "gfipulse 2s infinite" }} />
      <style>{`@keyframes gfipulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}`}</style>
    </span>
  );
}

function Badge({ label, color }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: .8, color, background: `${color}14`, border: `1px solid ${color}25` }}><Pulse color={color} size={6} />{label}</span>;
}

function SideIndicator({ side }) {
  const s = SIDES[side];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: s.color, padding: "2px 8px", borderRadius: 3, background: `${s.color}12`, border: `1px solid ${s.color}22` }}>{s.icon} {s.shortLabel}</span>;
}

function Section({ icon, title, sub, children, style = {} }) {
  return (
    <div style={{ background: "rgba(10,14,22,0.9)", border: "1px solid #1a2535", borderRadius: 8, overflow: "hidden", ...style }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a2535" }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: 2, color: "#dce3eb", fontFamily: "var(--mono)" }}>{icon && <span style={{ marginRight: 8, opacity: .6 }}>{icon}</span>}{title}</h2>
        {sub && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#556677" }}>{sub}</p>}
      </div>
      <div style={{ padding: "14px 18px" }}>{children}</div>
    </div>
  );
}

function ExtLink({ href, children, color = "#4a9eff", style = {} }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color, textDecoration: "none", fontWeight: 600, transition: "opacity .2s", ...style }} onMouseEnter={e => e.target.style.opacity = .7} onMouseLeave={e => e.target.style.opacity = 1}>{children} ↗</a>;
}

// ══════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════

function OverviewTab() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const day = Math.floor((now - new Date("2026-02-27")) / 86400000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Hero */}
      <Section icon="◉" title={`OPERATION EPIC FURY — DAY ${day}`} sub="Systemic Foresight Decoder • Multi-source OSINT reconstruction">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { label: "CONFLICT STATUS", value: "ACTIVE — MULTI-FRONT", color: "#ff2d2d" },
            { label: "ZULU", value: now.toISOString().slice(11, 19) + "Z", color: "#00e68a" },
            { label: "STRAIT OF HORMUZ", value: "PARTIALLY DISRUPTED", color: "#ff8c00" },
            { label: "US INTERCEPTOR STOCK", value: "CRITICALLY LOW", color: "#ff2d2d" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "10px 14px", borderLeft: `3px solid ${m.color}`, background: `${m.color}06`, borderRadius: "0 6px 6px 0" }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#556677", marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: "var(--mono)" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4-sided quick consensus */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {Object.entries(SIDES).map(([key, side]) => {
          const view = EXPERT_VIEWS.find(v => v.side === key);
          return (
            <Section key={key} icon={side.icon} title={side.shortLabel + " VIEW"} sub={side.label}>
              <p style={{ margin: 0, fontSize: 11, color: "#99aabb", lineHeight: 1.65 }}>{view.consensus}</p>
            </Section>
          );
        })}
      </div>

      {/* Key data points */}
      <Section icon="📊" title="CRITICAL DATA POINTS" sub="Sourced from CSIS, USCC, Defense Express, ORF, Oregon Group">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { stat: "78%", desc: "DOD weapons systems use China-sourced minerals", src: "USCC 2025", color: "#ff2d2d" },
            { stat: "1:100", desc: "Drone-to-interceptor cost ratio (Iran advantage)", src: "Prof. Jiang / CSIS", color: "#ff8c00" },
            { stat: "20-25 mo", desc: "Time to replenish US missile stocks", src: "CSIS simulation", color: "#ffd700" },
            { stat: "36,500+", desc: "Iranians killed in Jan 2026 crackdown", src: "Iran International", color: "#ff6b35" },
            { stat: "12,900 km", desc: "China QKD satellite range demonstrated", src: "Nature / USTC", color: "#00bfff" },
            { stat: "15 years", desc: "GAO estimate to overhaul defense supply chain", src: "GAO 2025", color: "#00e68a" },
          ].map((d, i) => (
            <div key={i} style={{ padding: 12, background: `${d.color}06`, border: `1px solid ${d.color}15`, borderRadius: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: d.color, fontFamily: "var(--mono)" }}>{d.stat}</div>
              <div style={{ fontSize: 10, color: "#99aabb", marginTop: 4, lineHeight: 1.4 }}>{d.desc}</div>
              <div style={{ fontSize: 9, color: "#445566", marginTop: 4 }}>Source: {d.src}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Analytical hygiene */}
      <div style={{ padding: "12px 16px", background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 6, fontSize: 11, color: "#bbccaa", lineHeight: 1.6 }}>
        <strong style={{ color: "#ffd700" }}>⚠ ANALYTICAL HYGIENE:</strong> ทุกนักวิเคราะห์มี bias — Prof. Jiang มี China-lean, Washington Institute มี US-lean, Iranian sources มี regime หรือ opposition lean. ข้อมูลที่ดีที่สุดได้จากการ cross-reference ทั้ง 4 ฝ่าย. ตลาดการเงินเป็น "truth machine" ที่ดีกว่า narrative ของฝ่ายใดฝ่ายหนึ่ง.
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TAB: TIMELINE
// ══════════════════════════════════════════════

function TimelineTab() {
  const catConfig = {
    signal: { color: "#9966ff", label: "SIGNAL" },
    policy: { color: "#4a9eff", label: "POLICY" },
    kinetic: { color: "#ff2d2d", label: "KINETIC" },
    logistics: { color: "#ff8c00", label: "LOGISTICS" },
    tech: { color: "#00bfff", label: "TECH" },
    internal: { color: "#ff6b35", label: "INTERNAL" },
    incident: { color: "#ffd700", label: "INCIDENT" },
    cyber: { color: "#ff66b2", label: "CYBER" },
    supply: { color: "#00e68a", label: "SUPPLY" },
    analysis: { color: "#aabbcc", label: "ANALYSIS" },
    ongoing: { color: "#ff2d2d", label: "ONGOING" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Section icon="⏱" title="CONFLICT TIMELINE" sub="Reconstructed from 5 OSINT sources — chronological event ledger">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(catConfig).map(([k, v]) => (
            <span key={k} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, color: v.color, background: `${v.color}12`, border: `1px solid ${v.color}20`, letterSpacing: .5, fontWeight: 700 }}>{v.label}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TIMELINE_EVENTS.map((evt, i) => {
            const cat = catConfig[evt.category] || { color: "#6b7b8d", label: "—" };
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 80px 1fr", gap: 10, padding: "10px 12px", borderLeft: `3px solid ${cat.color}`, background: evt.category === "ongoing" ? `${cat.color}08` : "transparent", borderRadius: "0 4px 4px 0", alignItems: "start" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#dce3eb", fontFamily: "var(--mono)" }}>{evt.date}</div>
                <Badge label={cat.label} color={cat.color} />
                <div>
                  <div style={{ fontSize: 11, color: "#c0ccdd", lineHeight: 1.5 }}>
                    {evt.title}
                    {!evt.verified && <span style={{ marginLeft: 6, fontSize: 9, color: "#ff8c00", fontWeight: 700 }}>⚠ UNVERIFIED</span>}
                  </div>
                  <div style={{ fontSize: 9, color: "#445566", marginTop: 3 }}>Sources: {evt.sources.join(" • ")}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ══════════════════════════════════════════════
// TAB: 4-SIDED VIEW
// ══════════════════════════════════════════════

function PerspectivesTab() {
  const [activeSide, setActiveSide] = useState("us");
  const view = EXPERT_VIEWS.find(v => v.side === activeSide);
  const side = SIDES[activeSide];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Side selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(SIDES).map(([key, s]) => (
          <button key={key} onClick={() => setActiveSide(key)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: `1px solid ${activeSide === key ? s.color : "#1a2535"}`, borderRadius: 6, background: activeSide === key ? `${s.color}12` : "rgba(10,14,22,0.9)", color: activeSide === key ? s.color : "#556677", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: "all .2s" }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span> {s.shortLabel}
          </button>
        ))}
      </div>

      {/* Consensus */}
      <Section icon={side.icon} title={`${side.label.toUpperCase()} — CONSENSUS VIEW`}>
        <p style={{ margin: 0, fontSize: 12, color: "#c0ccdd", lineHeight: 1.7, borderLeft: `3px solid ${side.color}`, paddingLeft: 14 }}>{view.consensus}</p>
      </Section>

      {/* Experts */}
      {view.experts.map((exp, i) => (
        <Section key={i} title={exp.name} sub={exp.role}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#556677", marginBottom: 4 }}>KEY INSIGHT</div>
            <p style={{ margin: 0, fontSize: 11, color: "#c0ccdd", lineHeight: 1.65 }}>{exp.keyInsight}</p>
          </div>
          <div style={{ padding: "8px 12px", background: "rgba(255,215,0,0.04)", borderRadius: 4, border: "1px solid rgba(255,215,0,0.1)" }}>
            <div style={{ fontSize: 9, letterSpacing: 1, color: "#ffd700", marginBottom: 2 }}>⚠ BIAS NOTE</div>
            <div style={{ fontSize: 10, color: "#889988" }}>{exp.biasNote}</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <ExtLink href={exp.handle.startsWith("@") ? `https://x.com/${exp.handle.slice(1)}` : `https://${exp.handle}`} color={side.color} style={{ fontSize: 11 }}>
              {exp.handle}
            </ExtLink>
          </div>
        </Section>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════
// TAB: WAR ECONOMICS
// ══════════════════════════════════════════════

function WarEconomicsTab() {
  const advColors = { iran: "#ff6b35", us: "#4a9eff", contested: "#ffd700" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Section icon="⚖" title="ASYMMETRIC WARFARE ECONOMICS" sub="Cost-exchange analysis — who can sustain longer?">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>{["DIMENSION", "IRAN", "US", "RATIO", "ADVANTAGE"].map((h, i) => (
                <th key={i} style={{ padding: "8px 10px", textAlign: "left", borderBottom: "2px solid #1a2535", color: "#556677", fontSize: 9, letterSpacing: 1.5, fontWeight: 800 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {ASYMMETRIC_DATA.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a253510" }}>
                  <td style={{ padding: "10px", fontWeight: 700, color: "#dce3eb", fontSize: 10, letterSpacing: .5 }}>{r.category}</td>
                  <td style={{ padding: "10px", color: "#ff6b35" }}>{r.iran}</td>
                  <td style={{ padding: "10px", color: "#4a9eff" }}>{r.us}</td>
                  <td style={{ padding: "10px", color: "#99aabb", fontFamily: "var(--mono)" }}>{r.ratio}</td>
                  <td style={{ padding: "10px" }}><SideIndicator side={r.advantage === "contested" ? "neutral" : r.advantage === "iran" ? "iran" : "us"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section icon="⛓" title="SUPPLY CHAIN VULNERABILITY MAP" sub="US defense dependency on China-controlled minerals">
        {SUPPLY_VULNERABILITY.map((s, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #1a2535" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#dce3eb" }}>{s.material}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: s.chinaControl > 90 ? "#ff2d2d" : s.chinaControl > 70 ? "#ff8c00" : "#ffd700", fontFamily: "var(--mono)" }}>{s.chinaControl}% CHINA</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a2535", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ width: `${s.chinaControl}%`, height: "100%", background: `linear-gradient(90deg, ${s.chinaControl > 90 ? "#ff2d2d" : "#ff8c00"}, ${s.chinaControl > 90 ? "#ff6b35" : "#ffd700"})`, borderRadius: 3, transition: "width 1s" }} />
            </div>
            <div style={{ fontSize: 10, color: "#778899" }}>
              <strong>Defense use:</strong> {s.defenseUse}<br />
              <strong>Mitigation:</strong> {s.timeline}<br />
              <span style={{ color: "#556677" }}>Source: {s.source}</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ══════════════════════════════════════════════
// TAB: TECH SHIFT
// ══════════════════════════════════════════════

function TechShiftTab() {
  const domainColors = ["#00bfff", "#00e68a", "#ff66b2"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ padding: "10px 14px", background: "rgba(0,191,255,0.04)", border: "1px solid rgba(0,191,255,0.1)", borderRadius: 6, fontSize: 11, color: "#88bbdd", lineHeight: 1.6 }}>
        <strong>THESIS:</strong> เทคโนโลยี Quantum จะไม่ "ปิดเกม" ในสงครามรอบนี้ (3-5 ปีคือ optimistic เกินไป) แต่การแข่งขันด้าน Quantum ถูกเร่งปฏิกิริยาโดยสงครามนี้ — ทำให้ timeline ของ Quantum Sensing, QKD, และ Computing ถูกเลื่อนเร็วขึ้น ใครลงทุนใน infrastructure ตอนนี้จะได้เปรียบในทศวรรษหน้า
      </div>

      {TECH_DOMAINS.map((d, i) => (
        <Section key={i} icon="⚛" title={d.domain} sub={`Readiness: ${d.readiness}`} style={{ borderColor: `${domainColors[i]}30` }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#556677", marginBottom: 6 }}>APPLICATIONS</div>
            {d.applications.map((a, j) => (
              <div key={j} style={{ fontSize: 11, color: "#99aabb", lineHeight: 1.6, padding: "3px 0 3px 12px", borderLeft: `2px solid ${domainColors[i]}30` }}>{a}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: 10, background: "rgba(255,215,0,0.04)", borderRadius: 4, border: "1px solid rgba(255,215,0,0.1)" }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#ffd700", marginBottom: 3 }}>🐉 CHINA STATUS</div>
              <div style={{ fontSize: 10, color: "#99aabb", lineHeight: 1.5 }}>{d.chinaStatus}</div>
            </div>
            <div style={{ padding: 10, background: "rgba(74,158,255,0.04)", borderRadius: 4, border: "1px solid rgba(74,158,255,0.1)" }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#4a9eff", marginBottom: 3 }}>🦅 US STATUS</div>
              <div style={{ fontSize: 10, color: "#99aabb", lineHeight: 1.5 }}>{d.usStatus}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", background: `${domainColors[i]}08`, borderRadius: 4, border: `1px solid ${domainColors[i]}15` }}>
            <div style={{ fontSize: 10, color: domainColors[i], fontWeight: 700 }}>🎯 GAME CHANGER: {d.gameChanger}</div>
          </div>
        </Section>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════
// TAB: INTEL SOURCES
// ══════════════════════════════════════════════

function SourcesTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Section icon="📡" title="5 CORE OSINT SOURCES" sub="Selected and cross-referenced for this intelligence reconstruction">
        <div style={{ fontSize: 11, color: "#88aabb", lineHeight: 1.6, marginBottom: 14 }}>
          แต่ละ source ถูกเลือกเพราะครอบคลุม layer ที่ต่างกัน: <strong>Tactical</strong> (IranWarLive), <strong>Strategic</strong> (Critical Threats), <strong>Signal</strong> (ADS-B Exchange), <strong>Structural</strong> (CSIS), <strong>Sentiment</strong> (Iran Monitor) — รวมกันให้ภาพ 360° ของสถานการณ์
        </div>
        {INTEL_SOURCES.map((s, i) => (
          <div key={i} style={{ padding: "14px 16px", background: `${s.color}04`, border: `1px solid ${s.color}15`, borderRadius: 6, marginBottom: i < INTEL_SOURCES.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
              <div>
                <ExtLink href={s.url} color={s.color} style={{ fontSize: 14, fontWeight: 800 }}>{s.name}</ExtLink>
                <div style={{ fontSize: 10, color: "#556677", marginTop: 2 }}>{s.type}</div>
              </div>
              <Badge label={s.reliability} color={s.reliability.includes("HIGH") ? "#00e68a" : "#ffd700"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 10, color: "#88aabb", lineHeight: 1.5 }}>
              <div><strong style={{ color: "#99aabb" }}>Data:</strong> {s.dataProvides}</div>
              <div><strong style={{ color: "#99aabb" }}>Method:</strong> {s.methodology}</div>
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: s.color }}><strong>USE FOR:</strong> {s.useFor}</div>
          </div>
        ))}
      </Section>

      <Section icon="🔎" title="X.COM INTELLIGENCE NETWORK" sub="Expert accounts organized by perspective">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {Object.entries(SIDES).map(([key, side]) => {
            const experts = EXPERT_VIEWS.find(v => v.side === key)?.experts || [];
            return (
              <div key={key} style={{ padding: 12, background: `${side.color}04`, border: `1px solid ${side.color}15`, borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: side.color, marginBottom: 8 }}>{side.icon} {side.label}</div>
                {experts.map((e, i) => (
                  <div key={i} style={{ padding: "4px 0", borderBottom: i < experts.length - 1 ? "1px solid #1a2535" : "none" }}>
                    <ExtLink href={e.handle.startsWith("@") ? `https://x.com/${e.handle.slice(1)}` : `https://${e.handle}`} color={side.color} style={{ fontSize: 11 }}>{e.name}</ExtLink>
                    <span style={{ fontSize: 9, color: "#556677", marginLeft: 6 }}>{e.handle}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Section>

      <Section icon="🛠" title="SUPPLEMENTARY TOOLS">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
          {[
            { name: "MarineTraffic", url: "https://www.marinetraffic.com", desc: "Hormuz vessel tracking" },
            { name: "Sentinel Hub", url: "https://apps.sentinel-hub.com", desc: "Satellite thermal detection" },
            { name: "GeoConfirmed", url: "https://geoconfirmed.org", desc: "Video geolocation verification" },
            { name: "Polymarket", url: "https://polymarket.com", desc: "Prediction market signals" },
            { name: "Liveuamap", url: "https://liveuamap.com", desc: "Interactive conflict map" },
            { name: "CFR Conflict Tracker", url: "https://www.cfr.org/global-conflict-tracker", desc: "Global overview" },
          ].map((t, i) => (
            <div key={i} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid #1a2535", borderRadius: 4 }}>
              <ExtLink href={t.url} style={{ fontSize: 11 }}>{t.name}</ExtLink>
              <div style={{ fontSize: 9, color: "#556677", marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════

export default function GFIDeckV2() {
  const [tab, setTab] = useState("overview");
  const [navOpen, setNavOpen] = useState(true);

  const content = useMemo(() => {
    switch (tab) {
      case "overview": return <OverviewTab />;
      case "timeline": return <TimelineTab />;
      case "perspectives": return <PerspectivesTab />;
      case "wareconomics": return <WarEconomicsTab />;
      case "techshift": return <TechShiftTab />;
      case "sources": return <SourcesTab />;
      default: return <OverviewTab />;
    }
  }, [tab]);

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div style={{ "--mono": "'JetBrains Mono', 'Fira Code', monospace", "--sans": "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#080c12", color: "#99aabb", fontFamily: "var(--sans)", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{ width: navOpen ? 190 : 48, background: "#060a10", borderRight: "1px solid #1a2535", display: "flex", flexDirection: "column", transition: "width .25s", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 10px", borderBottom: "1px solid #1a2535", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minHeight: 50 }} onClick={() => setNavOpen(!navOpen)}>
          <div style={{ width: 26, height: 26, borderRadius: 5, background: "linear-gradient(135deg, #4a9eff, #0044cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>G</div>
          {navOpen && <div><div style={{ fontSize: 10, fontWeight: 800, color: "#dce3eb", letterSpacing: 1.5, whiteSpace: "nowrap" }}>GFI DECK</div><div style={{ fontSize: 7, color: "#445566", letterSpacing: 1, whiteSpace: "nowrap" }}>RABBIT4EYE OS • v2</div></div>}
        </div>
        <div style={{ flex: 1, padding: "6px 4px", display: "flex", flexDirection: "column", gap: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 8px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: tab === t.id ? "#4a9eff" : "#556677", background: tab === t.id ? "rgba(74,158,255,0.08)" : "transparent", borderLeft: tab === t.id ? "2px solid #4a9eff" : "2px solid transparent", textAlign: "left", transition: "all .15s", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 13, flexShrink: 0, width: 18, textAlign: "center" }}>{t.icon}</span>
              {navOpen && t.label}
            </button>
          ))}
        </div>
        {navOpen && <div style={{ padding: 10, borderTop: "1px solid #1a2535", fontSize: 7, color: "#334455", textAlign: "center", lineHeight: 1.6 }}>SYSTEMIC FORESIGHT<br />DECODER × CLAUDE<br />15 MAR 2026</div>}
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1a2535" }}>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#dce3eb", letterSpacing: 2, fontFamily: "var(--mono)" }}>{activeTab?.icon} {activeTab?.label}</h1>
            <Badge label="CONFLICT ACTIVE" color="#ff2d2d" />
          </div>
          {content}
          <div style={{ marginTop: 20, padding: 10, textAlign: "center", fontSize: 8, color: "#334455", borderTop: "1px solid #1a2535", lineHeight: 1.8 }}>
            GFI DECK v2 — Geopolitical Finance Intelligence — Rabbit4eye OS × Systemic Foresight Decoder<br />
            Educational & analytical purposes only. Not investment or political advice.<br />
            Cross-reference all sources. Every analyst has bias. Trust no single narrative.<br />
            Data reconstructed from: IranWarLive • Critical Threats • ADS-B Exchange • CSIS • Iran Monitor
          </div>
        </div>
      </main>
    </div>
  );
}
