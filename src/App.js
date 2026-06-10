import { tryOnAPI } from './api';
import { useState, useRef, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS — elegant boutique · soft neutral + sage accent ──
const T = {
  bg: "#FCFBF9", bgSoft: "#F3F1EC", card: "#FFFFFF",
  ink: "#14110F", text: "#4A4540", textMuted: "#736C64", textDim: "#A39B91",
  line: "#E8E4DE", lineSoft: "#F2EFEA",
  accent: "#C2410C", accentDeep: "#9A330A",
  accentSoft: "rgba(194,65,12,0.09)", accentLine: "rgba(194,65,12,0.26)",
  clay: "#90867B", claySoft: "rgba(144,134,123,0.12)",
  shadow: "0 14px 40px rgba(20,17,15,0.09)",
  shadowSoft: "0 6px 20px rgba(20,17,15,0.06)",
};

const HEAD = "'Playfair Display','Hind Siliguri',serif";
const BODY = "'Inter','Hind Siliguri',sans-serif";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const noSym = (t = "") => t.replace(/^[\s◆◈◉✦✧■]+/, "").trim();

// ─── i18n ─────────────────────────────────────────────────────────
const STRINGS = {
  bn: {
    brandSub: "ভার্চুয়াল ফ্যাশন স্টুডিও",
    tryOnBtn: "ট্রাই অন →",
    homeBtn: "← হোম",
    badge: "AI ভার্চুয়াল ড্রেসিং রুম",
    heroLine1: "পোশাক পরার আগেই",
    heroLine2: "দেখুন কেমন লাগে",
    heroPara: "মাত্র কয়েক সেকেন্ডে AI দিয়ে যেকোনো পোশাক আপনার শরীরে দেখুন — সম্পূর্ণ বিনামূল্যে।",
    startBtn: "শুরু করুন",
    free: "বিনামূল্যে", sec: "দ্রুত ফলাফল", priv: "প্রাইভেট",
    previewTitle: "আপনার ব্যক্তিগত ড্রেসিং রুম",
    previewSub: "আপনার ছবি + যেকোনো পোশাক = নিখুঁত লুক",
    processLabel: "প্রক্রিয়া", howTitle: "কিভাবে কাজ করে",
    steps: [
      { t: "ছবি আপলোড করুন", d: "আপনার ফুল-বডি ছবি এবং পোশাকের ছবি দিন" },
      { t: "পোশাক বেছে নিন", d: "ধরন ও লিঙ্গ সিলেক্ট করুন — শার্ট থেকে শাড়ি পর্যন্ত" },
      { t: "ট্রাই অন করুন", d: "AI কয়েক সেকেন্ডে আপনার শরীরে পোশাক পরিয়ে দেবে" },
    ],
    featLabel: "সুবিধাসমূহ", whyTitle: "কেন TrialRoom",
    features: [
      { icon: "✦", t: "নিখুঁত AI ফিটিং", d: "IDM-VTON মডেল আপনার শরীরের মাপ অনুযায়ী পোশাক ফিট করে" },
      { icon: "◷", t: "দ্রুত ফলাফল", d: "অল্প সময়েই রেজাল্ট — অপেক্ষার ঝামেলা নেই" },
      { icon: "♡", t: "সম্পূর্ণ বিনামূল্যে", d: "কোনো সাবস্ক্রিপশন নেই, কোনো লুকানো চার্জ নেই" },
      { icon: "⊘", t: "১০০% প্রাইভেট", d: "আপনার ছবি কোনো সার্ভারে সেভ হয় না" },
    ],
    initLabel: "এখনই শুরু করুন", ctaTitle: "আপনার পারফেক্ট লুক খুঁজে নিন",
    ctaSub: "হাজার হাজার মানুষ ইতিমধ্যে ব্যবহার করছে",
    launchBtn: "ট্রাই অন শুরু করুন",
    privacy: "গোপনীয়তা", terms: "শর্তাবলি",
    yourPhoto: "আপনার ছবি", garmentPhoto: "পোশাকের ছবি",
    fullBody: "ফুল-বডি ছবি দিন", garmentHint: "পোশাকের ছবি দিন",
    upload: "আপলোড", camera: "ক্যামেরা", change: "পরিবর্তন",
    dragDrop: "টেনে আনুন বা ট্যাপ করুন", dropHere: "এখানে ছেড়ে দিন",
    customerType: "গ্রাহকের ধরন", garmentType: "পোশাকের ধরন",
    male: "পুরুষ", female: "মহিলা",
    tryOnSystem: "ট্রাই অন করুন",
    needBoth: "দুটো ছবিই আপলোড করুন!",
    reupload: "ভালো রেজাল্টের জন্য পরিষ্কার ফুল-বডি ছবি ব্যবহার করুন",
    scanBody: "শরীরের অবস্থান বিশ্লেষণ করা হচ্ছে…",
    mapTex: "পোশাকের টেক্সচার ম্যাপিং…",
    fitting: "ফিটিং চলছে…",
    rendering: "ফাইনাল রেন্ডার হচ্ছে…",
    ready: "প্রায় প্রস্তুত…",
    processing: "প্রসেসিং",
    resultTitle: "আপনার ট্রাই-অন রেজাল্ট",
    aiGenerated: "AI জেনারেটেড",
    rateThis: "এই লুকটি রেট করুন",
    tryAgain: "← আবার চেষ্টা",
    saveLook: "লুক সেভ করুন",
    saved: "✓ সেভ হয়েছে",
    share: "শেয়ার", copy: "কপি", download: "ডাউনলোড",
    maleGarments: [
      { id:"shirt",    e:"👔", l:"শার্ট",           s:"ফর্মাল / ক্যাজুয়াল" },
      { id:"trouser",  e:"👖", l:"ট্রাউজার",         s:"প্যান্ট / বটম" },
      { id:"blazer",   e:"🕴️", l:"ব্লেজার",          s:"ফর্মাল জ্যাকেট" },
      { id:"suit",     e:"🤵", l:"থ্রি-পিস স্যুট",  s:"কোট + ভেস্ট" },
      { id:"nehru",    e:"🧥", l:"নেহরু জ্যাকেট",   s:"স্লিভলেস কোট" },
      { id:"indo",     e:"🎽", l:"ইন্দো-ওয়েস্টার্ন",s:"এথনিক আপার" },
      { id:"sherwani", e:"🧣", l:"শেরওয়ানি",        s:"ট্র্যাডিশনাল" },
      { id:"kurta",    e:"👕", l:"কুর্তা",           s:"এথনিক / ক্যাজুয়াল" },
    ],
    femaleGarments: [
      { id:"saree",    e:"🥻", l:"শাড়ি",            s:"ট্র্যাডিশনাল" },
      { id:"lehenga",  e:"👗", l:"লেহেঙ্গা",          s:"এথনিক স্কার্ট" },
      { id:"kurti",    e:"👚", l:"কুর্তি",            s:"এথনিক / ক্যাজুয়াল" },
      { id:"dress",    e:"💃", l:"ড্রেস",             s:"ক্যাজুয়াল / ফর্মাল" },
      { id:"top",      e:"👘", l:"টপ / ব্লাউজ",      s:"ক্যাজুয়াল" },
      { id:"salwar",   e:"🧥", l:"সালোয়ার স্যুট",   s:"ট্র্যাডিশনাল" },
      { id:"anarkali", e:"✨", l:"আনারকলি",           s:"ফ্লেয়ার্ড এথনিক" },
      { id:"fusion",   e:"🌸", l:"ফিউশন",            s:"ইন্দো-ওয়েস্টার্ন" },
    ],
    tickerItems: ["শার্ট","শাড়ি","ব্লেজার","লেহেঙ্গা","কুর্তা","শেরওয়ানি","ড্রেস","স্যুট"],
  },
  en: {
    brandSub: "Virtual Fashion Studio",
    tryOnBtn: "Try On →",
    homeBtn: "← Home",
    badge: "AI Virtual Dressing Room",
    heroLine1: "See how you look",
    heroLine2: "before you wear it",
    heroPara: "Try on any garment in seconds with AI — beautifully, and completely free.",
    startBtn: "Get Started",
    free: "Free", sec: "Fast results", priv: "Private",
    previewTitle: "Your private dressing room",
    previewSub: "Your photo + any garment = the perfect look",
    processLabel: "Process", howTitle: "How it works",
    steps: [
      { t: "Upload photos", d: "Add your full-body photo and the garment photo" },
      { t: "Choose a garment", d: "Pick type and gender — from shirt to saree" },
      { t: "Try it on", d: "AI dresses you in just a few seconds" },
    ],
    featLabel: "Why us", whyTitle: "Why TrialRoom",
    features: [
      { icon: "✦", t: "Precise AI fitting", d: "IDM-VTON fits garments to your exact body shape" },
      { icon: "◷", t: "Fast results", d: "Real-time processing — no waiting around" },
      { icon: "♡", t: "Completely free", d: "No subscription, no hidden charges" },
      { icon: "⊘", t: "100% private", d: "Your photos are never saved to any server" },
    ],
    initLabel: "Start now", ctaTitle: "Find your perfect look",
    ctaSub: "Thousands of people are already using it",
    launchBtn: "Launch Try On",
    privacy: "Privacy", terms: "Terms",
    yourPhoto: "Your Photo", garmentPhoto: "Garment Photo",
    fullBody: "Upload a full-body photo", garmentHint: "Upload garment photo",
    upload: "Upload", camera: "Camera", change: "Change",
    dragDrop: "Tap or drag & drop", dropHere: "Drop here",
    customerType: "Customer", garmentType: "Garment",
    male: "Male", female: "Female",
    tryOnSystem: "Try It On",
    needBoth: "Please upload both photos!",
    reupload: "Use a clear full-body photo for the best results",
    scanBody: "Analysing body position…",
    mapTex: "Mapping garment texture…",
    fitting: "Running the fitting…",
    rendering: "Rendering the final look…",
    ready: "Almost ready…",
    processing: "Processing",
    resultTitle: "Your Try-On Result",
    aiGenerated: "AI generated",
    rateThis: "Rate this look",
    tryAgain: "← Try Again",
    saveLook: "Save Look",
    saved: "✓ Saved",
    share: "Share", copy: "Copy", download: "Download",
    maleGarments: [
      { id:"shirt",    e:"👔", l:"Shirt",       s:"Formal / Casual" },
      { id:"trouser",  e:"👖", l:"Trousers",    s:"Pants / Bottoms" },
      { id:"blazer",   e:"🕴️", l:"Blazer",      s:"Formal Jacket" },
      { id:"suit",     e:"🤵", l:"3-Piece Suit",s:"Coat + Vest" },
      { id:"nehru",    e:"🧥", l:"Nehru Jacket",s:"Sleeveless Coat" },
      { id:"indo",     e:"🎽", l:"Indo-Western",s:"Ethnic Upper" },
      { id:"sherwani", e:"🧣", l:"Sherwani",    s:"Traditional" },
      { id:"kurta",    e:"👕", l:"Kurta",       s:"Ethnic / Casual" },
    ],
    femaleGarments: [
      { id:"saree",    e:"🥻", l:"Saree",       s:"Traditional Drape" },
      { id:"lehenga",  e:"👗", l:"Lehenga",     s:"Ethnic Skirt" },
      { id:"kurti",    e:"👚", l:"Kurti",       s:"Ethnic / Casual" },
      { id:"dress",    e:"💃", l:"Dress",       s:"Casual / Formal" },
      { id:"top",      e:"👘", l:"Top / Blouse",s:"Casual Wear" },
      { id:"salwar",   e:"🧥", l:"Salwar Suit", s:"Traditional Set" },
      { id:"anarkali", e:"✨", l:"Anarkali",    s:"Flared Ethnic" },
      { id:"fusion",   e:"🌸", l:"Fusion",      s:"Indo-Western" },
    ],
    tickerItems: ["Shirt","Saree","Blazer","Lehenga","Kurta","Sherwani","Dress","Suit"],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────
function useDrop(onFile) {
  const [drag, setDrag] = useState(false);
  // Return handlers separately so `drag` is never spread onto the DOM node.
  const handlers = {
    onDragOver: (e) => { e.preventDefault(); setDrag(true); },
    onDragLeave: () => setDrag(false),
    onDrop: (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); },
  };
  return { drag, handlers };
}

function useResponsive() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 768, isTablet: w < 1024, width: w };
}

// Small label used above sections — calm, lowercase tracking instead of techno-caps.
function Eyebrow({ children }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
      <span style={{ width:18, height:1, background:T.accentLine }}/>
      <span style={{ color:T.accent, fontSize:11, fontFamily:BODY, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>{children}</span>
    </div>
  );
}

// ─── UPLOAD ZONE ──────────────────────────────────────────────────
function UploadZone({ label, hint, accent, s, onFile }) {
  const [preview, setPreview] = useState(null);
  const [ratio, setRatio] = useState(0.8); // box adopts the image's own ratio
  const ref = useRef();
  const camRef = useRef();
  const accept = useCallback((f) => { if (!f?.type.startsWith("image/")) return; setPreview(URL.createObjectURL(f)); onFile?.(f); }, [onFile]);
  const { drag, handlers } = useDrop(accept);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div {...handlers} onClick={() => !preview && ref.current.click()} style={{
      flex: 1, aspectRatio: ratio, minHeight: 196, maxHeight: 440,
      borderRadius: 18, overflow: "hidden",
      border: drag ? `1.5px solid ${accent}` : preview ? `1px solid ${T.line}` : `1.5px dashed ${T.line}`,
      background: drag ? `${accent}0E` : preview ? "#fff" : T.bgSoft,
      cursor: preview ? "default" : "pointer",
      position: "relative", transition: "border-color .25s, background .25s",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: preview ? T.shadowSoft : "none",
    }}>
      {preview ? (
        <>
          <img
            src={preview}
            alt=""
            onLoad={(e) => { const r = e.target.naturalWidth / e.target.naturalHeight; if (r) setRatio(clamp(r, 0.6, 1.25)); }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(38,33,28,.72) 0%,rgba(38,33,28,0) 42%)" }}/>
          <div style={{ position:"relative", zIndex:2, width:"100%", padding:"0 13px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto" }}>
            <span style={{ color:"#fff", fontSize:12.5, fontWeight:600, fontFamily:BODY, display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ width:7, height:7, borderRadius:99, background:accent, boxShadow:`0 0 0 3px ${accent}40` }}/>{label}
            </span>
            <button onClick={(e) => { e.stopPropagation(); setPreview(null); ref.current.value=""; }} style={{ background:"rgba(255,255,255,.16)", border:"1px solid rgba(255,255,255,.28)", borderRadius:999, color:"#fff", fontSize:11, padding:"5px 12px", cursor:"pointer", fontFamily:BODY, fontWeight:500, backdropFilter:"blur(4px)" }}>{s.change}</button>
          </div>
        </>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:13, padding:"26px 16px", textAlign:"center" }}>
          <div style={{ width:54, height:54, borderRadius:16, background:`${accent}14`, border:`1px solid ${accent}2E`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
            {label === s.yourPhoto ? "🧍" : "🧥"}
          </div>
          <div>
            <div style={{ color:T.ink, fontWeight:600, fontSize:14.5, fontFamily:HEAD, marginBottom:4 }}>{label}</div>
            <div style={{ color:T.textDim, fontSize:11.5, fontFamily:BODY }}>{drag ? s.dropHere : hint}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={(e) => { e.stopPropagation(); ref.current.click(); }} style={{ background:T.ink, border:"none", borderRadius:999, color:"#fff", fontSize:11.5, fontWeight:500, padding:"7px 15px", cursor:"pointer", fontFamily:BODY }}>{s.upload}</button>
            <button onClick={(e) => { e.stopPropagation(); camRef.current.click(); }} style={{ background:"#fff", border:`1px solid ${T.line}`, borderRadius:999, color:T.text, fontSize:11.5, fontWeight:500, padding:"7px 15px", cursor:"pointer", fontFamily:BODY }}>{s.camera}</button>
          </div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => accept(e.target.files[0])}/>
      <input ref={camRef} type="file" accept="image/*" capture="user" style={{ display:"none" }} onChange={(e) => accept(e.target.files[0])}/>
    </div>
  );
}

// ─── GARMENT CHIP ─────────────────────────────────────────────────
function GChip({ item, sel, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: sel ? T.accentSoft : "#fff",
      border: sel ? `1.5px solid ${T.accent}` : `1px solid ${T.line}`,
      borderRadius: 14, padding: "12px 6px 10px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
      cursor: "pointer", transition: "all .2s ease",
      transform: sel ? "translateY(-2px)" : "none",
      boxShadow: sel ? T.shadowSoft : "none",
    }}>
      <span style={{ fontSize: 22 }}>{item.e}</span>
      <span style={{ color: sel ? T.accentDeep : T.text, fontWeight:600, fontSize:11.5, fontFamily:BODY, textAlign:"center", lineHeight:1.3 }}>{item.l}</span>
      <span style={{ color:T.textDim, fontSize:9.5, textAlign:"center", fontFamily:BODY, lineHeight:1.3 }}>{item.s}</span>
    </button>
  );
}

// ─── LANG TOGGLE ──────────────────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <div style={{ display:"flex", background:T.bgSoft, border:`1px solid ${T.line}`, borderRadius:999, padding:3, flexShrink:0 }}>
      {["bn","en"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding:"5px 12px", border:"none", cursor:"pointer", borderRadius:999,
          background: lang === l ? T.ink : "transparent",
          color: lang === l ? "#fff" : T.textMuted,
          fontFamily:BODY, fontSize:11, fontWeight:600, letterSpacing:"0.5px", transition:"all .2s",
        }}>{l === "bn" ? "বাং" : "EN"}</button>
      ))}
    </div>
  );
}

// ─── ERROR VIEW ───────────────────────────────────────────────────
function ErrorView({ error, onRetry, s }) {
  return (
    <div style={{ animation:"fadeUp .45s ease", padding:"40px 24px", textAlign:"center", maxWidth:420, margin:"0 auto" }}>
      <div style={{ width:78, height:78, borderRadius:22, background:T.claySoft, border:`1px solid ${T.clay}3A`, margin:"0 auto 22px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>☁️</div>
      <div style={{ fontFamily:HEAD, fontWeight:600, fontSize:24, color:T.ink, marginBottom:10 }}>Something went wrong</div>
      <p style={{ color:T.textMuted, fontSize:14, fontFamily:BODY, marginBottom:22, lineHeight:1.7 }}>
        The AI studio is busy or briefly unavailable. This usually clears up within a few minutes — please try again.
      </p>
      {error && (
        <div style={{ background:T.bgSoft, border:`1px solid ${T.line}`, borderRadius:12, padding:"13px 15px", marginBottom:22, textAlign:"left" }}>
          <div style={{ fontSize:12, color:T.clay, fontFamily:BODY, wordBreak:"break-word", lineHeight:1.5 }}>{error}</div>
        </div>
      )}
      <button onClick={onRetry} style={{
        width:"100%", padding:"15px 0", background:T.ink, border:"none", borderRadius:14, color:"#fff",
        fontFamily:BODY, fontWeight:600, fontSize:14.5, cursor:"pointer", boxShadow:T.shadowSoft, transition:"transform .2s"
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
      >Try Again</button>
    </div>
  );
}

// ─── LOADING VIEW ─────────────────────────────────────────────────
function LoadingView({ s }) {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const msgs = [s.scanBody, s.mapTex, s.fitting, s.rendering, s.ready];

  useEffect(() => {
    const a = setInterval(() => setPct(p => (p >= 96 ? 96 : p + 0.9)), 50);
    const b = setInterval(() => setStep(v => Math.min(v + 1, msgs.length - 1)), 1100);
    return () => { clearInterval(a); clearInterval(b); };
  }, [msgs.length]);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:30, padding:"72px 24px", animation:"fadeUp .5s ease" }}>
      <div style={{ position:"relative", width:120, height:120 }}>
        <svg viewBox="0 0 120 120" style={{ position:"absolute", inset:0, width:"100%", height:"100%", animation:"spin 3.5s linear infinite" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke={T.line} strokeWidth="2"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="70 270" strokeLinecap="round"/>
        </svg>
        <div style={{ position:"absolute", inset:18, borderRadius:"50%", background:"#fff", border:`1px solid ${T.line}`, boxShadow:T.shadowSoft, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🪞</div>
      </div>
      <div style={{ width:"100%", maxWidth:320, textAlign:"center" }}>
        <div style={{ fontFamily:HEAD, color:T.ink, fontSize:18, marginBottom:16, minHeight:26 }}>{msgs[step]}</div>
        <div style={{ height:5, background:T.bgSoft, borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:99, background:T.accent, width:`${pct}%`, transition:"width .1s linear" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:9 }}>
          <span style={{ color:T.textDim, fontSize:11, fontFamily:BODY }}>{s.processing}</span>
          <span style={{ color:T.accent, fontSize:11, fontFamily:BODY, fontWeight:600 }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div style={{ color:T.textDim, fontSize:11, fontFamily:BODY, letterSpacing:"1px" }}>Powered by IDM-VTON · Free</div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────
function ResultView({ item, onRetry, s, resultImg, resp }) {
  const [saved, setSaved] = useState(false);
  const [stars, setStars] = useState(0);
  const [ratio, setRatio] = useState(0.75);

  const handleDownload = async () => {
    if (!resultImg) return;
    try {
      const res = await fetch(resultImg);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `trialroom-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { window.open(resultImg, "_blank", "noopener"); }
  };
  const handleCopy = async () => {
    if (!resultImg) return;
    try { await navigator.clipboard.writeText(resultImg); } catch { /* clipboard unavailable */ }
  };
  const handleShare = async () => {
    if (!resultImg) return;
    if (navigator.share) { try { await navigator.share({ title: "TrialRoom", url: resultImg }); } catch { /* cancelled */ } }
    else handleCopy();
  };
  const actions = [
    { label: s.share, onClick: handleShare },
    { label: s.copy, onClick: handleCopy },
    { label: s.download, onClick: handleDownload },
  ];

  return (
    <div style={{ animation:"fadeUp .45s ease", maxWidth:460, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
        <div style={{ position:"relative", borderRadius:22, overflow:"hidden", border:`1px solid ${T.line}`, background:T.bgSoft, boxShadow:T.shadow, width:"100%", maxWidth: resp.isMobile ? "100%" : 372, aspectRatio: ratio, maxHeight:"70vh" }}>
          {resultImg ? (
            <img
              src={resultImg}
              alt={s.resultTitle}
              onLoad={(e) => { const r = e.target.naturalWidth / e.target.naturalHeight; if (r) setRatio(clamp(r, 0.55, 1.3)); }}
              style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}
            />
          ) : (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:64 }}>🪞</div>
          )}
          <div style={{ position:"absolute", top:14, left:14, background:"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:`1px solid ${T.accentLine}`, borderRadius:999, padding:"5px 13px", color:T.accentDeep, fontSize:11, fontWeight:600, fontFamily:BODY, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:99, background:T.accent }}/>{s.aiGenerated}
          </div>
        </div>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, boxShadow:T.shadowSoft }}>
        <span style={{ color:T.textMuted, fontSize:13, fontFamily:BODY }}>{s.rateThis}</span>
        <div style={{ display:"flex", gap:4 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStars(n)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:19, lineHeight:1, color:n<=stars?"#E0A93B":T.line, transition:"all .15s", transform:n<=stars?"scale(1.12)":"scale(1)" }}>★</button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <button onClick={onRetry} style={{ flex:1, padding:"15px 0", background:"#fff", border:`1px solid ${T.line}`, borderRadius:14, color:T.text, fontFamily:BODY, fontWeight:600, fontSize:14, cursor:"pointer", transition:"border-color .2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.accentLine}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.line}>{s.tryAgain}</button>
        <button onClick={() => setSaved(true)} style={{ flex:1.4, padding:"15px 0", background: saved ? T.accent : T.ink, border:"none", borderRadius:14, color:"#fff", fontFamily:BODY, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all .3s", boxShadow:T.shadowSoft }}>
          {saved ? s.saved : s.saveLook}
        </button>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        {actions.map(a => (
          <button key={a.label} onClick={a.onClick} style={{ background:"transparent", border:`1px solid ${T.line}`, borderRadius:999, color:T.textMuted, fontSize:12, fontWeight:500, padding:"7px 16px", cursor:"pointer", fontFamily:BODY, transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = T.accentDeep; e.currentTarget.style.borderColor = T.accentLine; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.line; }}>{a.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── TRY-ON PAGE ──────────────────────────────────────────────────
function TryOnPage({ s, resp }) {
  const [customerFile, setCustomerFile] = useState(null);
  const [garmentFile,  setGarmentFile]  = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [gender, setGender] = useState("male");
  const [garment, setGarment] = useState(null);
  const [view, setView] = useState("form");
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const list = gender === "male" ? s.maleGarments : s.femaleGarments;
  const selItem = list.find(g => g.id === garment);
  const cols = resp.isMobile ? 4 : 8;

  const go = async () => {
    if (!customerFile || !garmentFile) { alert(s.needBoth); return; }
    setCount(c => c + 1);
    setView("loading");
    try {
      const imgUrl = await tryOnAPI(customerFile, garmentFile, selItem?.l || "shirt");
      setResultImg(imgUrl);
      setView("result");
    } catch (err) {
      console.error("TryOn failed:", err);
      setError(err.message);
      setView("error");
    }
  };

  if (view === "loading") return <LoadingView s={s} />;
  if (view === "error") return <ErrorView error={error} onRetry={() => { setView("form"); setError(null); }} s={s} />;
  if (view === "result") return <ResultView item={selItem} onRetry={() => setView("form")} s={s} resultImg={resultImg} resp={resp}/>;

  return (
    <div style={{ animation:"fadeUp .4s ease", maxWidth:560, margin:"0 auto" }}>
      {count >= 2 && (
        <div style={{ background:T.accentSoft, border:`1px solid ${T.accentLine}`, borderRadius:12, padding:"11px 15px", display:"flex", gap:9, alignItems:"center", marginBottom:16 }}>
          <span>💡</span>
          <span style={{ color:T.accentDeep, fontSize:12.5, fontFamily:BODY }}>{s.reupload}</span>
        </div>
      )}

      {/* Upload */}
      <div style={{ display:"flex", gap:14, marginBottom:16, alignItems:"flex-start" }}>
        <UploadZone label={s.yourPhoto} hint={s.fullBody} accent={T.accent} s={s} onFile={setCustomerFile}/>
        <UploadZone label={s.garmentPhoto} hint={s.garmentHint} accent={T.clay} s={s} onFile={setGarmentFile}/>
      </div>

      {/* Config */}
      <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:20, padding:"20px 18px", marginBottom:16, boxShadow:T.shadowSoft }}>
        <div style={{ marginBottom:12 }}><Eyebrow>{s.customerType}</Eyebrow></div>
        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[{ id:"male", l:s.male, e:"👤" }, { id:"female", l:s.female, e:"👩" }].map(g => (
            <button key={g.id} onClick={() => { setGender(g.id); setGarment(null); }} style={{
              flex:1, padding:"14px 0", borderRadius:14,
              border: gender===g.id ? `1.5px solid ${T.accent}` : `1px solid ${T.line}`,
              background: gender===g.id ? T.accentSoft : "#fff",
              color: gender===g.id ? T.accentDeep : T.textMuted,
              fontFamily:BODY, fontWeight:600, fontSize:14, cursor:"pointer",
              transition:"all .2s", display:"flex", flexDirection:"column", alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:21 }}>{g.e}</span>{g.l}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:12 }}><Eyebrow>{s.garmentType}</Eyebrow></div>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
          {list.map(it => <GChip key={it.id} item={it} sel={garment===it.id} onClick={() => setGarment(it.id)}/>)}
        </div>
      </div>

      {/* CTA */}
      <button onClick={go} style={{
        width:"100%", padding:"17px 0", borderRadius:16, border:"none",
        background:T.ink, color:"#fff", fontFamily:BODY, fontWeight:600, fontSize:resp.isMobile?15:16,
        cursor:"pointer", boxShadow:T.shadow, transition:"all .2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
      >{noSym(s.tryOnSystem)}</button>

      <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:16 }}>
        {[s.free, s.sec, s.priv].map(t => (
          <div key={t} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ width:5, height:5, borderRadius:99, background:T.accent }}/>
            <span style={{ color:T.textMuted, fontSize:12, fontFamily:BODY }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────
function HomePage({ onStart, s, resp }) {
  const heroSize = resp.isMobile ? 34 : resp.isTablet ? 46 : 56;
  const gridCols = resp.isMobile ? "1fr 1fr" : "repeat(4,1fr)";
  const sidePad = resp.isMobile ? 16 : 32;

  return (
    <div style={{ animation:"fadeUp .5s ease" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding: resp.isMobile ? "44px 22px 36px" : "72px 40px 52px", position:"relative" }}>
        <div style={{ position:"absolute", top:"6%", left:"50%", transform:"translateX(-50%)", width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle,${T.accentSoft} 0%,transparent 68%)`, pointerEvents:"none" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:`1px solid ${T.line}`, borderRadius:999, padding:"7px 16px", marginBottom:22, boxShadow:T.shadowSoft }}>
            <span style={{ width:6, height:6, borderRadius:99, background:T.accent }}/>
            <span style={{ color:T.textMuted, fontSize:12, fontWeight:500, fontFamily:BODY, letterSpacing:"0.5px" }}>{s.badge}</span>
          </div>

          <h1 style={{ fontFamily:HEAD, fontWeight:600, fontSize:heroSize, lineHeight:1.12, color:T.ink, marginBottom:18, letterSpacing:"-0.5px" }}>
            {s.heroLine1}<br/>
            <span style={{ color:T.accentDeep }}>{s.heroLine2}</span>
          </h1>

          <p style={{ color:T.textMuted, fontSize: resp.isMobile ? 14.5 : 16.5, fontFamily:BODY, lineHeight:1.75, maxWidth:430, margin:"0 auto 30px" }}>
            {s.heroPara}
          </p>

          <button onClick={onStart} style={{
            background:T.ink, border:"none", borderRadius:14, padding: resp.isMobile ? "15px 40px" : "16px 54px",
            color:"#fff", fontFamily:BODY, fontWeight:600, fontSize: resp.isMobile ? 15 : 16,
            cursor:"pointer", boxShadow:T.shadow, transition:"transform .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
          >{noSym(s.startBtn)}</button>

          <div style={{ display:"flex", justifyContent:"center", gap:26, marginTop:24 }}>
            {[s.free, s.sec, s.priv].map(t => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:5, height:5, borderRadius:99, background:T.accent }}/>
                <span style={{ color:T.textMuted, fontSize:12.5, fontFamily:BODY }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview card */}
      <div style={{ margin:`0 ${sidePad}px 36px`, borderRadius:24, background:T.card, border:`1px solid ${T.line}`, padding: resp.isMobile?"32px 22px":"44px 36px", textAlign:"center", boxShadow:T.shadow }}>
        <div style={{ fontSize:54, marginBottom:14 }}>🪞</div>
        <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?22:28, color:T.ink, marginBottom:10 }}>{s.previewTitle}</div>
        <div style={{ color:T.textMuted, fontSize: resp.isMobile?13.5:15, fontFamily:BODY, marginBottom:22, lineHeight:1.6 }}>{s.previewSub}</div>
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8 }}>
          {s.tickerItems.map(t => (
            <span key={t} style={{ background:T.accentSoft, border:`1px solid ${T.accentLine}`, borderRadius:999, padding:"5px 14px", color:T.accentDeep, fontSize:12.5, fontFamily:BODY, fontWeight:500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ margin:`0 ${sidePad}px 36px` }}>
        <div style={{ textAlign:"center", marginBottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <Eyebrow>{s.processLabel}</Eyebrow>
          <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?24:32, color:T.ink }}>{s.howTitle}</div>
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:20, overflow:"hidden", boxShadow:T.shadowSoft }}>
          {s.steps.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", padding: resp.isMobile?"18px 18px":"22px 24px", borderBottom:i<2?`1px solid ${T.lineSoft}`:"none" }}>
              <div style={{ minWidth:44, height:44, borderRadius:999, background:T.accentSoft, border:`1px solid ${T.accentLine}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:HEAD, fontWeight:600, fontSize:17, color:T.accentDeep }}>{i+1}</span>
              </div>
              <div>
                <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?16:18, color:T.ink, marginBottom:4 }}>{step.t}</div>
                <div style={{ color:T.textMuted, fontSize: resp.isMobile?13:14.5, fontFamily:BODY, lineHeight:1.65 }}>{step.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ margin:`0 ${sidePad}px 36px` }}>
        <div style={{ textAlign:"center", marginBottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <Eyebrow>{s.featLabel}</Eyebrow>
          <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?24:32, color:T.ink }}>{s.whyTitle}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:12 }}>
          {s.features.map((f, i) => (
            <div key={i} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:18, padding: resp.isMobile?"18px 16px":"24px 20px", transition:"transform .25s, box-shadow .25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = T.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width:42, height:42, borderRadius:12, background:T.accentSoft, display:"flex", alignItems:"center", justifyContent:"center", color:T.accent, fontSize:18, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?15:17, color:T.ink, marginBottom:7 }}>{f.t}</div>
              <div style={{ color:T.textMuted, fontSize: resp.isMobile?12.5:13.5, fontFamily:BODY, lineHeight:1.65 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ margin:`0 ${sidePad}px 8px`, borderRadius:24, border:`1px solid ${T.accentLine}`, background:T.accentSoft, padding: resp.isMobile?"34px 24px":"48px 36px", textAlign:"center" }}>
        <div style={{ marginBottom:14, display:"flex", justifyContent:"center" }}><Eyebrow>{s.initLabel}</Eyebrow></div>
        <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?26:36, color:T.ink, marginBottom:10 }}>{s.ctaTitle}</div>
        <div style={{ color:T.textMuted, fontSize: resp.isMobile?13.5:15, fontFamily:BODY, marginBottom:26, lineHeight:1.6 }}>{s.ctaSub}</div>
        <button onClick={onStart} style={{ background:T.ink, border:"none", borderRadius:14, padding: resp.isMobile?"14px 36px":"16px 46px", color:"#fff", fontFamily:BODY, fontWeight:600, fontSize: resp.isMobile?14:15.5, cursor:"pointer", boxShadow:T.shadow, transition:"transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>{noSym(s.launchBtn)}</button>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("bn");
  const s = STRINGS[lang];
  const resp = useResponsive();

  const maxW = resp.isMobile ? "100%" : resp.isTablet ? 720 : 1080;
  const px = resp.isMobile ? 16 : resp.isTablet ? 28 : 40;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", justifyContent:"center", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        body{background:${T.bg};font-family:${BODY};}
        ::-webkit-scrollbar{width:8px;}
        ::-webkit-scrollbar-thumb{background:${T.line};border-radius:99px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.textDim};}
      `}</style>

      <div style={{ width:"100%", maxWidth:maxW, position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ position:"sticky", top:0, zIndex:30, backdropFilter:"blur(16px)", background:"rgba(247,244,239,.82)", borderBottom:`1px solid ${T.line}`, padding:`14px ${px}px` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:T.accentSoft, border:`1px solid ${T.accentLine}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:HEAD, fontWeight:700, fontSize:19, color:T.accentDeep }}>T</div>
              <div>
                <div style={{ fontFamily:HEAD, fontWeight:600, fontSize: resp.isMobile?18:20, lineHeight:1, color:T.ink }}>
                  TrialRoom<span style={{ color:T.accent, fontSize:12 }}>.ai</span>
                </div>
                {!resp.isMobile && <div style={{ color:T.textDim, fontSize:10.5, fontFamily:BODY, letterSpacing:"0.5px", marginTop:3 }}>{s.brandSub}</div>}
              </div>
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <LangToggle lang={lang} setLang={setLang}/>
              {page === "home" ? (
                <button onClick={() => setPage("tryon")} style={{ background:T.ink, border:"none", borderRadius:999, padding: resp.isMobile?"8px 15px":"9px 20px", color:"#fff", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:BODY, transition:"transform .2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>{s.tryOnBtn}</button>
              ) : (
                <button onClick={() => setPage("home")} style={{ background:"#fff", border:`1px solid ${T.line}`, borderRadius:999, padding: resp.isMobile?"8px 15px":"9px 18px", color:T.textMuted, fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:BODY }}>{s.homeBtn}</button>
              )}
            </div>
          </div>
        </div>

        {/* Page */}
        <div style={{ padding: resp.isMobile ? "16px 0 64px" : "28px 0 80px" }}>
          {page === "home"  && <HomePage onStart={() => setPage("tryon")} s={s} resp={resp}/>}
          {page === "tryon" && (
            <div style={{ padding:`0 ${px}px` }}>
              <TryOnPage s={s} resp={resp}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${T.line}`, padding:`18px ${px}px`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:T.textDim, fontSize:11.5, fontFamily:BODY }}>© 2026 TrialRoom.ai</span>
          <div style={{ display:"flex", gap:18 }}>
            {[s.privacy, s.terms].map(t => (
              <span key={t} style={{ color:T.textDim, fontSize:12.5, fontFamily:BODY, cursor:"pointer", transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.accentDeep}
                onMouseLeave={e => e.currentTarget.style.color = T.textDim}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
