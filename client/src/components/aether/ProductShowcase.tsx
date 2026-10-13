import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

type View = "analytics" | "forecasting" | "insights";

const tabs: { id: View; label: string }[] = [
  { id: "analytics", label: "Analytics" },
  { id: "forecasting", label: "Forecasting" },
  { id: "insights", label: "Insights" },
];

const analyticsData = {
  "30 days": [{ label: "Aug 04", revenue: 112, customers: 64, conversion: 4.7 }, { label: "Aug 11", revenue: 126, customers: 69, conversion: 5.0 }, { label: "Aug 18", revenue: 121, customers: 73, conversion: 4.8 }, { label: "Aug 25", revenue: 144, customers: 80, conversion: 5.4 }, { label: "Sep 01", revenue: 156, customers: 85, conversion: 5.8 }],
  "Quarter": [{ label: "Jul", revenue: 368, customers: 240, conversion: 4.5 }, { label: "Aug", revenue: 412, customers: 263, conversion: 4.9 }, { label: "Sep", revenue: 456, customers: 291, conversion: 5.3 }, { label: "Oct", revenue: 478, customers: 314, conversion: 5.5 }, { label: "Nov", revenue: 502, customers: 338, conversion: 5.7 }],
};

const forecastData = [{ label: "Jul", actual: 368 }, { label: "Aug", actual: 412 }, { label: "Sep", actual: 456 }, { label: "Oct", projected: 478, high: 510, low: 446 }, { label: "Nov", projected: 502, high: 544, low: 464 }, { label: "Dec", projected: 548, high: 602, low: 498 }];

const story = [
  { id: "analytics" as View, eyebrow: "Analytics", title: "See what is happening right now.", copy: "Start with revenue, customers, and conversion in one view. Change the time range to compare a recent shift with the bigger picture.", stat: "+18.4%", label: "revenue this quarter" },
  { id: "forecasting" as View, eyebrow: "Forecasting", title: "Plan with a range, not a guess.", copy: "Compare actual results with the current forecast. The confidence band makes it clear where the plan has room to move.", stat: "91.2%", label: "forecast confidence" },
  { id: "insights" as View, eyebrow: "Insights", title: "Turn a change into a next step.", copy: "AETHER highlights the changes worth discussing and gives your team a practical starting point for the conversation.", stat: "3", label: "new items to review" },
];

const tooltipStyle = { background: "#19181f", border: "1px solid #44404f", borderRadius: 6, fontSize: 11, color: "#f4f3f8" };

function ChartFrame({ children, active }: { children: React.ReactNode; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  return <div className="product-chart" ref={ref}>{children instanceof Array ? children : <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={reduced ? {} : { opacity: active && inView ? 1 : 0, y: active && inView ? 0 : 8 }} transition={{ duration: .45, ease: [0.16, 1, .3, 1] }}>{children}</motion.div>}</div>;
}

function AnalyticsView({ active }: { active: boolean }) {
  const [range, setRange] = useState<"30 days" | "Quarter">("Quarter");
  const reduced = useReducedMotion();
  const data = analyticsData[range];
  return <div className="product-view"><div className="product-topline"><div><span>REVENUE PERFORMANCE</span><b>{range === "Quarter" ? "$1.37m" : "$659k"}</b><em>↑ 18.4% vs prior period</em></div><div className="range-switch" aria-label="Analytics date range">{(["30 days", "Quarter"] as const).map(item => <button key={item} className={range === item ? "selected" : ""} onClick={() => setRange(item)} aria-pressed={range === item}>{item}</button>)}</div></div><ChartFrame active={active}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="productRevenue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b6a8ff" stopOpacity=".42"/><stop offset="1" stopColor="#b6a8ff" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#302e38"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#85818d", fontSize: 9 }}/><YAxis hide domain={[0, "dataMax + 50"]}/><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}k`, "Revenue"]}/><Area dataKey="revenue" type="monotone" stroke="#b9abff" strokeWidth={2} fill="url(#productRevenue)" isAnimationActive={!reduced && active} animationDuration={650}/></AreaChart></ResponsiveContainer></ChartFrame><div className="product-stat-grid"><div><span>CUSTOMER GROWTH</span><b>{data.at(-1)?.customers}</b><small>active accounts</small></div><div><span>CONVERSION</span><b>{data.at(-1)?.conversion}%</b><small>qualified to closed</small></div><div><span>AVERAGE DEAL</span><b>$14.8k</b><small>↑ 7.1% this period</small></div></div></div>;
}

function ForecastingView({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  return <div className="product-view"><div className="product-topline"><div><span>REVENUE FORECAST</span><b>$1.53m</b><em>Expected Q4 result</em></div><div className="confidence-chip"><i /> High confidence</div></div><ChartFrame active={active}><ResponsiveContainer width="100%" height="100%"><LineChart data={forecastData}><CartesianGrid vertical={false} stroke="#302e38"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#85818d", fontSize: 9 }}/><YAxis hide domain={[300, 650]}/><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`$${value}k`, name === "actual" ? "Actual" : name === "projected" ? "Forecast" : name === "high" ? "Upper range" : "Lower range"]}/><Line dataKey="high" stroke="#554f68" strokeDasharray="4 4" dot={false} isAnimationActive={!reduced && active}/><Line dataKey="low" stroke="#554f68" strokeDasharray="4 4" dot={false} isAnimationActive={!reduced && active}/><Line dataKey="actual" stroke="#f4f3f8" strokeWidth={2} dot={{ r: 3, fill: "#f4f3f8" }} connectNulls isAnimationActive={!reduced && active}/><Line dataKey="projected" stroke="#b9abff" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: "#b9abff" }} connectNulls isAnimationActive={!reduced && active}/></LineChart></ResponsiveContainer></ChartFrame><div className="forecast-summary"><div><span>LIKELY RANGE</span><b>$1.41m – $1.65m</b></div><div><span>BIGGEST FACTOR</span><p>Expansion in the top 12 accounts</p></div></div></div>;
}

function InsightsView({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(false);
  const data = [{ label: "Expansion", value: 42 }, { label: "New business", value: 31 }, { label: "Retention", value: 19 }, { label: "Other", value: 8 }];
  const observations = ["Ask the account team to review the three expanding customers before the next forecast meeting.", "Review the self-serve trial path and compare this week’s traffic sources before changing the conversion target.", "Share the response-time improvement with the support team and watch whether it holds through the next release."];
  return <div className="product-view"><div className="product-topline"><div><span>THIS WEEK</span><b>3 items need attention</b><em>Based on fictional sample data</em></div><div className="confidence-chip"><Sparkles size={12}/> Updated now</div></div><div className="insight-layout"><div className="insight-list"><article className={selected === 0 ? "selected" : ""}><span className="insight-dot positive"/><div><b>Enterprise expansion is up</b><p>Three accounts are growing faster than planned.</p></div><button onClick={() => setSelected(0)} aria-label="Show enterprise expansion recommendation" aria-pressed={selected === 0}><ChevronRight size={15}/></button></article><article className={selected === 1 ? "selected" : ""}><span className="insight-dot"/><div><b>Trial conversion slipped</b><p>Self-serve conversion is down 0.6 points this week.</p></div><button onClick={() => setSelected(1)} aria-label="Show conversion recommendation" aria-pressed={selected === 1}><ChevronRight size={15}/></button></article><article className={selected === 2 ? "selected" : ""}><span className="insight-dot positive"/><div><b>Support response is improving</b><p>Median first response is now under two hours.</p></div><button onClick={() => setSelected(2)} aria-label="Show support recommendation" aria-pressed={selected === 2}><ChevronRight size={15}/></button></article></div><ChartFrame active={active}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical"><XAxis type="number" hide domain={[0, 50]}/><YAxis type="category" dataKey="label" width={72} axisLine={false} tickLine={false} tick={{ fill: "#aaa6b2", fontSize: 9 }}/><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Share"]}/><Bar dataKey="value" fill="#aa9bff" radius={[0, 3, 3, 0]} isAnimationActive={!reduced && active} animationDuration={650}/></BarChart></ResponsiveContainer></ChartFrame></div><div className="recommendation"><Sparkles size={15}/><p><b>Suggested next step:</b> {observations[selected]}</p><button onClick={() => setSaved(!saved)} aria-pressed={saved}>{saved ? <><CheckCircle2 size={13}/> Saved</> : <>Save for review <ArrowUpRight size={13}/></>}</button></div></div>;
}

function ProductPanel({ active }: { active: View }) {
  const reduced = useReducedMotion();
  return <AnimatePresence mode="wait"><motion.div key={active} initial={reduced ? false : { opacity: 0, y: 10 }} animate={reduced ? {} : { opacity: 1, y: 0 }} exit={reduced ? {} : { opacity: 0, y: -6 }} transition={{ duration: .32, ease: [0.16, 1, .3, 1] }}>{active === "analytics" && <AnalyticsView active />}{active === "forecasting" && <ForecastingView active />}{active === "insights" && <InsightsView active />}</motion.div></AnimatePresence>;
}

export default function ProductShowcase() {
  const [active, setActive] = useState<View>("analytics");
  const ref = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  useEffect(() => { const nodes = ref.current?.querySelectorAll<HTMLElement>("[data-product-story]"); if (!nodes || reduced) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.productStory as View); }), { rootMargin: "-38% 0px -42% 0px" }); nodes.forEach(node => observer.observe(node)); return () => observer.disconnect(); }, [reduced]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => { if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return; event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; setActive(tabs[next].id); tabRefs.current[next]?.focus(); };
  return <section className="product-showcase" id="product-experience" ref={ref}><div className="product-showcase-head"><span className="section-number">02 — Explore the product</span><h2>One place to see the business from every angle.</h2><p>Move between the views your team uses most, then follow the details when something changes.</p></div><div className="product-experience"><div className="product-sticky"><div className="product-shell"><div className="product-shell-top"><span/><span/><span/><b>AETHER / PRODUCT WORKSPACE</b></div><div className="product-tabs" role="tablist" aria-label="AETHER product views">{tabs.map((tab, index) => <button key={tab.id} ref={element => { tabRefs.current[index] = element; }} role="tab" aria-selected={active === tab.id} aria-controls={`product-panel-${tab.id}`} id={`product-tab-${tab.id}`} tabIndex={active === tab.id ? 0 : -1} className={active === tab.id ? "active" : ""} onClick={() => setActive(tab.id)} onKeyDown={event => onKeyDown(event, index)}>{tab.label}</button>)}</div><section role="tabpanel" id={`product-panel-${active}`} aria-labelledby={`product-tab-${active}`}><ProductPanel active={active}/></section></div></div><div className="product-story-copy">{story.map(item => <article data-product-story={item.id} key={item.id} className={active === item.id ? "current" : ""}><span>{item.eyebrow}</span><h3>{item.title}</h3><p>{item.copy}</p><div className="product-story-stat"><b>{item.stat}</b><small>{item.label}</small></div></article>)}</div></div></section>;
}
