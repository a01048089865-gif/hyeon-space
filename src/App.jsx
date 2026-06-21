<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>hyeoni's space ♡</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
<style>
  @font-face {
    font-family: 'DungGeunMo';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff') format('woff');
    font-weight: normal;
    font-display: swap;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'DungGeunMo', 'Courier New', monospace; }
  #root { min-height: 100vh; }
  .hp-root, .hp-root input, .hp-root textarea, .hp-root select, .hp-root button {
    font-family: 'DungGeunMo', 'Courier New', monospace !important;
  }
  .hp-scroll::-webkit-scrollbar { width:6px; }
  .hp-scroll::-webkit-scrollbar-thumb { background:#B8DCEF; border-radius:4px; }
  .hp-navbtn:hover { background:#CDE9F8 !important; }
  .hp-navbtn.active:hover { background:#7EC8E3 !important; }
  .hp-profile-badge:hover { filter: brightness(1.05); }
  .hp-name-edit:hover { opacity: 0.75; }
  @media (max-width: 760px) {
    .hp-body { flex-direction: column !important; }
    .hp-sidebar { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; align-items: center !important; }
    .hp-sidebar-profile { width: 100% !important; }
    .hp-navlist { flex-direction: row !important; flex-wrap: wrap; width: 100% !important; }
    .hp-shelf { display: none !important; }
  }
</style>
</head>
<body>
<div id="root"></div>

<script type="text/babel" data-presets="react">
const { useState, useEffect, useRef } = React;

// ── local storage helpers ────────────────────────────────────────
const LS_PREFIX = "hyeoniSpace_";
function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function saveLS(key, value) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("storage save failed", e);
  }
}
const LS = {
  profile: "profile",
  items: "items",
  nextId: "nextId",
  diary: "diary",
  panelItems: "panelItems",
  panelChecked: "panelChecked",
  calNotes: "calNotes",
  pomo: "pomo",
  routineHistory: "routineHistory",
  lastRoutineDate: "lastRoutineDate",
  visitDay: "visitDay",
};

// ── image helper: shrink + compress any uploaded photo before storing ──
function resizeImageFile(file, maxDim = 480, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image load failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Pixel art SVG icons ──────────────────────────────────────────
const PixelHeart = ({ color = "#F4A7C3", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="1" y="2" width="3" height="1" fill={color} />
    <rect x="6" y="2" width="3" height="1" fill={color} />
    <rect x="0" y="3" width="4" height="2" fill={color} />
    <rect x="5" y="3" width="4" height="2" fill={color} />
    <rect x="1" y="5" width="8" height="2" fill={color} />
    <rect x="2" y="7" width="6" height="1" fill={color} />
    <rect x="3" y="8" width="4" height="1" fill={color} />
    <rect x="4" y="9" width="2" height="1" fill={color} />
  </svg>
);

const PixelExclaim = () => (
  <svg width="20" height="20" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="4" y="1" width="2" height="5" fill="#7EC8E3" />
    <rect x="4" y="8" width="2" height="2" fill="#7EC8E3" />
  </svg>
);

const PixelCat = () => (
  <svg width="20" height="20" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="1" y="3" width="1" height="2" fill="#A0C8DC" />
    <rect x="8" y="3" width="1" height="2" fill="#A0C8DC" />
    <rect x="2" y="2" width="6" height="6" fill="#C8E4F4" />
    <rect x="3" y="4" width="1" height="1" fill="#5A9FBF" />
    <rect x="6" y="4" width="1" height="1" fill="#5A9FBF" />
    <rect x="4" y="6" width="2" height="1" fill="#F4A7C3" />
    <rect x="3" y="5" width="1" height="1" fill="#A0C8DC" />
    <rect x="6" y="5" width="1" height="1" fill="#A0C8DC" />
  </svg>
);

const PixelRibbon = () => (
  <svg width="20" height="20" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="0" y="2" width="4" height="3" fill="#F4A7C3" />
    <rect x="6" y="2" width="4" height="3" fill="#F4A7C3" />
    <rect x="4" y="3" width="2" height="1" fill="#E07AAC" />
    <rect x="1" y="3" width="2" height="1" fill="#fff" opacity="0.5" />
    <rect x="7" y="3" width="2" height="1" fill="#fff" opacity="0.5" />
    <rect x="3" y="2" width="4" height="3" fill="#F4A7C3" />
    <rect x="4" y="3" width="2" height="1" fill="#E07AAC" />
  </svg>
);

// ── decorative "mini room shelf" icons (no characters, just props) ──
const PixelLamp = () => (
  <svg width="18" height="18" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="3" y="0" width="4" height="3" fill="#FFE08A" />
    <rect x="2" y="0" width="1" height="2" fill="#FFE08A" />
    <rect x="7" y="0" width="1" height="2" fill="#FFE08A" />
    <rect x="4" y="3" width="2" height="4" fill="#C8DCEF" />
    <rect x="2" y="7" width="6" height="1" fill="#A0B4E8" />
  </svg>
);
const PixelPlant = () => (
  <svg width="18" height="18" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="3" y="0" width="1" height="3" fill="#7BC47F" />
    <rect x="5" y="1" width="1" height="3" fill="#7BC47F" />
    <rect x="4" y="2" width="2" height="3" fill="#9AD89E" />
    <rect x="3" y="6" width="4" height="3" fill="#E0A872" />
    <rect x="3" y="6" width="4" height="1" fill="#C88E5C" />
  </svg>
);
const PixelBook = () => (
  <svg width="18" height="18" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="1" y="2" width="8" height="6" fill="#F4A7C3" />
    <rect x="1" y="2" width="8" height="1" fill="#E07AAC" />
    <rect x="4" y="2" width="1" height="6" fill="#fff" opacity="0.6" />
  </svg>
);
const PixelFrame = () => (
  <svg width="18" height="18" viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
    <rect x="1" y="1" width="8" height="8" fill="#A0B4E8" />
    <rect x="2" y="2" width="6" height="6" fill="#EAF2FF" />
    <rect x="3" y="5" width="4" height="2" fill="#9AD89E" />
    <rect x="4" y="3" width="2" height="2" fill="#FFE08A" />
  </svg>
);

const PANEL_ICONS = [PixelHeart, PixelExclaim, PixelCat, PixelRibbon];

const PANELS = [
  { id: "vitamins", label: "Vitamins" },
  { id: "morning", label: "Morning" },
  { id: "night", label: "Night" },
  { id: "habit", label: "Habit" },
];

const PANEL_META = {
  vitamins: { title: "💊 Vitamins / 약", color: "#E8F4FF", accent: "#7EC8E3", placeholder: "예) 비타민 D, 오메가3..." },
  morning: { title: "🌅 Morning Routine", color: "#EAF6FF", accent: "#89C4E1", placeholder: "예) 스트레칭 10분, 물 한 잔..." },
  night: { title: "🌙 Night Routine", color: "#EEF0FF", accent: "#A0B4E8", placeholder: "예) 스킨케어, 일기 쓰기..." },
  habit: { title: "💪 Habit Tracker", color: "#E8F8FF", accent: "#6BBFD8", placeholder: "예) 운동, 독서 30분..." },
};

const TABS = ["ALL", "IDEA", "TO DO", "MEMO", "WORK"];
const CAT_COLORS = {
  IDEA: { bg: "#D6EFFF", icon: "💡" },
  "TO DO": { bg: "#D6F0FF", icon: "✅" },
  MEMO: { bg: "#E0F4FF", icon: "📝" },
  WORK: { bg: "#D0E8FF", icon: "💼" },
};

const INIT_ITEMS = [
  { id: 1, category: "TO DO", text: "오늘 할 일 정리하기", done: false, photo: null },
  { id: 2, category: "IDEA", text: "새로운 아이디어 메모", done: false, photo: null },
  { id: 3, category: "MEMO", text: "중요한 메모 내용", done: false, photo: null },
  { id: 4, category: "WORK", text: "업무 관련 사항", done: false, photo: null },
];

const INIT_PANEL_ITEMS = {
  vitamins: ["비타민 D ☀️", "오메가3 🐟", "마그네슘 💎"],
  morning: ["물 한 잔 마시기 🥛", "스트레칭 10분 🧘", "오늘 할 일 확인 📋"],
  night: ["스킨케어 루틴 🧴", "내일 준비하기 🎒", "일기 쓰기 📖"],
  habit: ["하루 30분 운동 🏃", "독서 20분 📚", "물 2L 마시기 💧"],
};
const EMPTY_CHECKED = { vitamins: [], morning: [], night: [], habit: [] };

// site pages (sidebar nav — clicking SWAPS the frame content, no page scroll)
const PAGES = [
  { id: "home", label: "HOME", mark: "⌂" },
  { id: "routine", label: "ROUTINE", mark: "✎" },
  { id: "calendar", label: "CALENDAR", mark: "▣" },
  { id: "memo", label: "MEMO", mark: "✐" },
  { id: "diary", label: "DIARY", mark: "✉" },
];

function useTimer(focusMins, breakMins) {
  const [phase, setPhase] = useState("idle");
  const [remaining, setRemaining] = useState(focusMins * 60);
  const [isFocus, setIsFocus] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (phase === "idle" || phase === "paused") {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          const next = !isFocus;
          setIsFocus(next);
          setPhase("idle");
          return next ? breakMins * 60 : focusMins * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const start = () => setPhase("focus");
  const pause = () => setPhase("paused");
  const resume = () => setPhase("focus");
  const reset = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setIsFocus(true);
    setRemaining(focusMins * 60);
  };

  useEffect(() => {
    if (phase === "idle") setRemaining(isFocus ? focusMins * 60 : breakMins * 60);
  }, [focusMins, breakMins]);

  return { phase, remaining, isFocus, start, pause, resume, reset };
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function todayStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatHistoryDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${m}월 ${d}일 (${weekdays[dt.getDay()]})`;
}

// pink-themed pixel heart pattern for the header (data URI, brick-offset tile)
const HEART_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="white" fill-opacity="0.55"><rect x="5" y="6" width="3" height="1"/><rect x="10" y="6" width="3" height="1"/><rect x="4" y="7" width="4" height="2"/><rect x="9" y="7" width="4" height="2"/><rect x="5" y="9" width="8" height="2"/><rect x="6" y="11" width="6" height="1"/><rect x="7" y="12" width="4" height="1"/><rect x="8" y="13" width="2" height="1"/><rect x="20" y="20" width="3" height="1"/><rect x="25" y="20" width="3" height="1"/><rect x="19" y="21" width="4" height="2"/><rect x="24" y="21" width="4" height="2"/><rect x="20" y="23" width="8" height="2"/><rect x="21" y="25" width="6" height="1"/><rect x="22" y="26" width="4" height="1"/><rect x="23" y="27" width="2" height="1"/></g></svg>`;
const HEART_TILE_URL = `url("data:image/svg+xml,${encodeURIComponent(HEART_TILE_SVG)}")`;

function HyeoniSpace() {
  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 (${weekdays[now.getDay()]})`;

  // Daily visitor counter — real local count, resets with the date
  const [visitorCount] = useState(() => {
    const today = todayStr(new Date());
    const stored = loadLS(LS.visitDay, null);
    if (stored && stored.date === today) {
      const next = stored.count + 1;
      saveLS(LS.visitDay, { date: today, count: next });
      return next;
    }
    saveLS(LS.visitDay, { date: today, count: 1 });
    return 1;
  });

  // Site navigation — this is the whole point: clicking swaps the frame, not scroll
  const [page, setPage] = useState("home");

  // Profile (name + photo, persisted)
  const [profileName, setProfileName] = useState(() => loadLS(LS.profile, { name: "hyeoni", photo: null }).name);
  const [profilePhoto, setProfilePhoto] = useState(() => loadLS(LS.profile, { name: "hyeoni", photo: null }).photo);
  const [editingProfile, setEditingProfile] = useState(false);
  const [tmpProfileName, setTmpProfileName] = useState(profileName);
  const profilePhotoInputRef = useRef(null);
  useEffect(() => { saveLS(LS.profile, { name: profileName, photo: profilePhoto }); }, [profileName, profilePhoto]);

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 240, 0.82);
      setProfilePhoto(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };
  const saveProfileName = () => {
    const t = tmpProfileName.trim();
    if (t) setProfileName(t);
    setEditingProfile(false);
  };

  // Lightbox (tap any photo to view it bigger)
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Panels (routine)
  const [activePanel, setActivePanel] = useState(null);
  const [panelItems, setPanelItems] = useState(() => loadLS(LS.panelItems, INIT_PANEL_ITEMS));
  const [panelChecked, setPanelChecked] = useState(() => loadLS(LS.panelChecked, EMPTY_CHECKED));
  const [panelInput, setPanelInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [routineHistory, setRoutineHistory] = useState(() => loadLS(LS.routineHistory, []));
  useEffect(() => { saveLS(LS.panelItems, panelItems); }, [panelItems]);
  useEffect(() => { saveLS(LS.panelChecked, panelChecked); }, [panelChecked]);
  useEffect(() => { saveLS(LS.routineHistory, routineHistory); }, [routineHistory]);

  // Routine daily rollover: archive yesterday's checks into history, then reset checkmarks.
  // Runs once on load and every minute after, so it also catches the app being left open past midnight.
  useEffect(() => {
    const rollover = () => {
      const today = todayStr(new Date());
      const lastDate = localStorage.getItem(LS_PREFIX + LS.lastRoutineDate);
      if (!lastDate) {
        localStorage.setItem(LS_PREFIX + LS.lastRoutineDate, today);
        return;
      }
      if (lastDate !== today) {
        const itemsSnap = loadLS(LS.panelItems, INIT_PANEL_ITEMS);
        const checkedSnap = loadLS(LS.panelChecked, EMPTY_CHECKED);
        const counts = {};
        PANELS.forEach((p) => {
          counts[p.id] = { done: (checkedSnap[p.id] || []).length, total: (itemsSnap[p.id] || []).length };
        });
        setRoutineHistory((prev) => [{ date: lastDate, counts }, ...prev].slice(0, 60));
        setPanelChecked(EMPTY_CHECKED);
        localStorage.setItem(LS_PREFIX + LS.lastRoutineDate, today);
      }
    };
    rollover();
    const id = setInterval(rollover, 60000);
    return () => clearInterval(id);
  }, []);

  // Memo
  const [activeTab, setActiveTab] = useState("ALL");
  const [items, setItems] = useState(() => loadLS(LS.items, INIT_ITEMS));
  const [nextId, setNextId] = useState(() => loadLS(LS.nextId, 5));
  const [memoInput, setMemoInput] = useState("");
  const [memoCategory, setMemoCategory] = useState("MEMO");
  const [memoPhoto, setMemoPhoto] = useState(null);
  const memoPhotoInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editCat, setEditCat] = useState("");
  useEffect(() => { saveLS(LS.items, items); }, [items]);
  useEffect(() => { saveLS(LS.nextId, nextId); }, [nextId]);

  const handleMemoPhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 640, 0.72);
      setMemoPhoto(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  // Pomodoro
  const [{ focusMins, breakMins }, setPomoCfg] = useState(() => loadLS(LS.pomo, { focusMins: 25, breakMins: 5 }));
  const [showPomoCfg, setShowPomoCfg] = useState(false);
  const [tmpFocus, setTmpFocus] = useState(focusMins);
  const [tmpBreak, setTmpBreak] = useState(breakMins);
  const { phase, remaining, isFocus, start, pause, resume, reset } = useTimer(focusMins, breakMins);
  useEffect(() => { saveLS(LS.pomo, { focusMins, breakMins }); }, [focusMins, breakMins]);

  // Calendar (notes are {text, done} so they can be checked off)
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calNotes, setCalNotes] = useState(() => loadLS(LS.calNotes, {}));
  const [selectedDay, setSelectedDay] = useState(null);
  const [calInput, setCalInput] = useState("");
  useEffect(() => { saveLS(LS.calNotes, calNotes); }, [calNotes]);

  // Diary / scribble feed (ADHD-friendly quick capture, twitter-style)
  const [diaryEntries, setDiaryEntries] = useState(() =>
    loadLS(LS.diary, []).map((e) => ({ ...e, time: new Date(e.time) }))
  );
  const [diaryInput, setDiaryInput] = useState("");
  const [diaryPhoto, setDiaryPhoto] = useState(null);
  const diaryPhotoInputRef = useRef(null);
  useEffect(() => { saveLS(LS.diary, diaryEntries); }, [diaryEntries]);

  const handleDiaryPhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 640, 0.72);
      setDiaryPhoto(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  // ── helpers ──
  const togglePanelCheck = (pid, idx) =>
    setPanelChecked((p) => ({ ...p, [pid]: p[pid].includes(idx) ? p[pid].filter((i) => i !== idx) : [...p[pid], idx] }));
  const addPanelItem = (pid) => {
    const t = panelInput.trim();
    if (!t) return;
    setPanelItems((p) => ({ ...p, [pid]: [...p[pid], t] }));
    setPanelInput("");
  };
  const delPanelItem = (pid, idx) => {
    setPanelItems((p) => ({ ...p, [pid]: p[pid].filter((_, i) => i !== idx) }));
    setPanelChecked((p) => ({ ...p, [pid]: p[pid].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)) }));
  };

  const filtered = activeTab === "ALL" ? items : items.filter((i) => i.category === activeTab);
  const sendMemo = () => {
    const t = memoInput.trim();
    if (!t && !memoPhoto) return;
    setItems((p) => [...p, { id: nextId, category: memoCategory, text: t, done: false, photo: memoPhoto }]);
    setNextId((n) => n + 1);
    setMemoInput("");
    setMemoPhoto(null);
  };
  const toggleDone = (id) => setItems((p) => p.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const deleteItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const saveEdit = (id) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, category: editCat } : i)));
    setEditingId(null);
  };

  const applyPomo = () => {
    setPomoCfg({ focusMins: tmpFocus, breakMins: tmpBreak });
    reset();
    setShowPomoCfg(false);
  };
  const mm = Math.floor(remaining / 60),
    ss = remaining % 60;
  const total = isFocus ? focusMins * 60 : breakMins * 60;
  const pct = ((total - remaining) / total) * 100;

  // Calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const calKey = (d) => `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
  const addCalNote = () => {
    if (!selectedDay || !calInput.trim()) return;
    const k = calKey(selectedDay);
    setCalNotes((p) => ({ ...p, [k]: [...(p[k] || []), { text: calInput.trim(), done: false }] }));
    setCalInput("");
  };
  const toggleCalNote = (k, idx) =>
    setCalNotes((p) => ({ ...p, [k]: p[k].map((n, i) => (i === idx ? { ...n, done: !n.done } : n)) }));
  const delCalNote = (k, idx) => setCalNotes((p) => ({ ...p, [k]: p[k].filter((_, i) => i !== idx) }));

  const isToday = (d) => d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();

  // Diary helpers
  const addDiaryEntry = () => {
    const t = diaryInput.trim();
    if (!t && !diaryPhoto) return;
    setDiaryEntries((p) => [{ id: Date.now(), text: t, time: new Date(), photo: diaryPhoto }, ...p]);
    setDiaryInput("");
    setDiaryPhoto(null);
  };
  const deleteDiaryEntry = (id) => setDiaryEntries((p) => p.filter((e) => e.id !== id));
  const formatDiaryTime = (d) => `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // HOME dashboard numbers
  const todoTotal = items.length;
  const todoDone = items.filter((i) => i.done).length;
  const routineTotal = Object.values(panelItems).reduce((a, arr) => a + arr.length, 0);
  const routineDone = Object.values(panelChecked).reduce((a, arr) => a + arr.length, 0);
  const latestDiary = diaryEntries[0];

  return (
    <div style={s.page}>
      {lightboxSrc && (
        <div style={s.lightboxOverlay} onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="" style={s.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="hp-root" style={s.frame}>
        {/* ── title bar: like a window/site header, not a hero ── */}
        <div style={s.titlebar}>
          <div style={s.titlebarDots}>
            <span style={{ ...s.tbDot, background: "#fff" }} />
            <span style={{ ...s.tbDot, background: "#FFE08A" }} />
            <span style={{ ...s.tbDot, background: "#9AD89E" }} />
          </div>
          <div style={s.siteTitle}>✦ {profileName}'s space ♡ ✦</div>
          <div style={s.tbClock}>{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</div>
        </div>

        {/* ── body: sidebar + content frame (no scroll-to-section, just swap) ── */}
        <div className="hp-body" style={s.body}>
          <aside className="hp-sidebar" style={s.sidebar}>
            <div className="hp-sidebar-profile" style={s.profileBox}>
              <input type="file" accept="image/*" ref={profilePhotoInputRef} style={{ display: "none" }} onChange={handleProfilePhotoChange} />
              <div
                className="hp-profile-badge"
                style={s.profileBadge}
                onClick={() => profilePhotoInputRef.current.click()}
                title="사진 바꾸기"
              >
                {profilePhoto ? <img src={profilePhoto} alt="" style={s.profilePhotoImg} /> : <PixelHeart color="#fff" size={22} />}
              </div>
              <div>
                {editingProfile ? (
                  <input
                    autoFocus
                    value={tmpProfileName}
                    onChange={(e) => setTmpProfileName(e.target.value)}
                    onBlur={saveProfileName}
                    onKeyDown={(e) => e.key === "Enter" && saveProfileName()}
                    style={s.profileNameInput}
                  />
                ) : (
                  <div
                    className="hp-name-edit"
                    style={s.profileName}
                    onClick={() => { setTmpProfileName(profileName); setEditingProfile(true); }}
                    title="이름 바꾸기"
                  >
                    {profileName} ♡ <span style={{ fontSize: 10, opacity: 0.6 }}>✏️</span>
                  </div>
                )}
                <div style={s.profileSub}>{dateStr}</div>
              </div>
            </div>

            <div style={s.sidebarDivider} />

            <nav className="hp-navlist" style={s.navList}>
              {PAGES.map((p) => (
                <button
                  key={p.id}
                  className={`hp-navbtn${page === p.id ? " active" : ""}`}
                  onClick={() => setPage(p.id)}
                  style={{
                    ...s.navBtn,
                    background: page === p.id ? "#7EC8E3" : "transparent",
                    color: page === p.id ? "#fff" : "#3A7A9C",
                    fontWeight: page === p.id ? 700 : 400,
                  }}
                >
                  <span style={{ opacity: 0.8, marginRight: 6 }}>{p.mark}</span>{p.label}
                </button>
              ))}
            </nav>

            <div style={s.sidebarDivider} />

            <div className="hp-shelf" style={s.shelfRow}>
              <PixelLamp />
              <PixelPlant />
              <PixelBook />
              <PixelFrame />
            </div>

            <div style={s.visitorBadge}>오늘 다녀간 사람 ⊹ {visitorCount}명</div>
          </aside>

          {/* ── main content frame — fixed-feeling, swaps by page, not anchor scroll ── */}
          <main className="hp-scroll" style={s.content}>
            {page === "home" && (
              <div style={s.homeWrap}>
                <div style={s.homeHero}>
                  <div style={s.homeGreeting}>안녕, {profileName}! 오늘도 좋은 하루 ⋆⁺</div>
                  <div style={s.homeClock}>{pad(now.getHours())}:{pad(now.getMinutes())}</div>
                  <div style={s.homeDate}>{dateStr}</div>
                </div>

                <div style={s.statRow}>
                  <button style={s.statTile} onClick={() => setPage("memo")}>
                    <div style={s.statNum}>{todoDone}/{todoTotal}</div>
                    <div style={s.statLabel}>오늘 메모 완료</div>
                  </button>
                  <button style={s.statTile} onClick={() => setPage("routine")}>
                    <div style={s.statNum}>{routineDone}/{routineTotal}</div>
                    <div style={s.statLabel}>루틴 체크</div>
                  </button>
                  <button style={s.statTile} onClick={() => setPage("diary")}>
                    <div style={s.statNum}>{diaryEntries.length}</div>
                    <div style={s.statLabel}>끄적인 글</div>
                  </button>
                </div>

                <div style={s.homeDiaryPreview}>
                  <div style={s.homeSectionLabel}>✉ 최근 끄적임</div>
                  {latestDiary ? (
                    <div style={s.quoteCard}>
                      {latestDiary.photo && (
                        <img src={latestDiary.photo} alt="" style={s.itemThumb} onClick={() => setLightboxSrc(latestDiary.photo)} />
                      )}
                      <div style={s.quoteText}>"{latestDiary.text}"</div>
                      <div style={s.quoteTime}>{formatDiaryTime(latestDiary.time)}</div>
                    </div>
                  ) : (
                    <div style={s.empty}>아직 끄적인 게 없어요. DIARY 메뉴에서 가볍게 적어보세요 ✏️</div>
                  )}
                  <button style={s.homeLinkBtn} onClick={() => setPage("diary")}>다이어리 보러가기 →</button>
                </div>

                <div style={s.homeSectionLabel}>✎ 바로가기</div>
                <div style={s.shortcutRow}>
                  <button style={s.shortcutBtn} onClick={() => setPage("routine")}>ROUTINE</button>
                  <button style={s.shortcutBtn} onClick={() => setPage("calendar")}>CALENDAR</button>
                  <button style={s.shortcutBtn} onClick={() => setPage("memo")}>MEMO</button>
                </div>
              </div>
            )}

            {page === "routine" && (
              <div style={s.routineWrap}>
                <div style={s.card}>
                  <div style={s.cardBar}>
                    <span style={s.dot} />
                    <span style={s.cardBarTitle}>ROUTINE</span>
                    <button onClick={() => setShowHistory((v) => !v)} style={s.closeBtn} title="기록 보기">
                      {showHistory ? "✕" : "📜"}
                    </button>
                  </div>

                  {showHistory ? (
                    <div style={s.historyWrap}>
                      <div style={{ fontSize: 11, color: "#90BFDC", padding: "0 2px 2px" }}>
                        매일 자정이 지나면 체크는 비워지고, 그날 기록은 여기 남아요 🗓️
                      </div>
                      {routineHistory.length === 0 && (
                        <div style={s.empty}>아직 기록이 없어요. 하루가 지나면 자동으로 쌓여요 ⌛</div>
                      )}
                      {routineHistory.map((rec, idx) => (
                        <div key={idx} style={s.historyRow}>
                          <div style={s.historyDate}>{formatHistoryDate(rec.date)}</div>
                          <div style={s.historyCounts}>
                            {PANELS.map((p, i) => {
                              const c = rec.counts[p.id] || { done: 0, total: 0 };
                              const Icon = PANEL_ICONS[i];
                              return (
                                <span key={p.id} style={s.historyChip}>
                                  <Icon size={12} /> {c.done}/{c.total}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <React.Fragment>
                      <div style={s.panelIconRow}>
                        {PANELS.map((p, i) => {
                          const Icon = PANEL_ICONS[i];
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                setActivePanel(activePanel === p.id ? null : p.id);
                                setPanelInput("");
                              }}
                              style={{
                                ...s.iconBtn,
                                background: activePanel === p.id ? "#C8E8F8" : "#F0F8FF",
                                border: activePanel === p.id ? "1.5px solid #7EC8E3" : "1.5px solid #C0DFF0",
                              }}
                              title={p.label}
                            >
                              <Icon />
                            </button>
                          );
                        })}
                      </div>

                      {activePanel ? (
                        (() => {
                          const meta = PANEL_META[activePanel];
                          const list = panelItems[activePanel];
                          const checked = panelChecked[activePanel];
                          return (
                            <div style={{ background: meta.color, borderRadius: 10, margin: "0 10px 10px" }}>
                              <div style={s.panelSubBar}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#5A9FBF" }}>{meta.title}</span>
                                <button onClick={() => setActivePanel(null)} style={s.closeBtn}>✕</button>
                              </div>
                              <div className="hp-scroll" style={s.panelList}>
                                {list.length === 0 && <div style={s.empty}>항목을 추가해보세요 🩵</div>}
                                {list.map((item, idx) => (
                                  <div key={idx} style={s.panelRow}>
                                    <input type="checkbox" checked={checked.includes(idx)} onChange={() => togglePanelCheck(activePanel, idx)} style={s.checkbox} />
                                    <span style={{ ...s.panelText, textDecoration: checked.includes(idx) ? "line-through" : "none", color: checked.includes(idx) ? "#A0C8DC" : "#3A7A9C" }}>{item}</span>
                                    <button onClick={() => delPanelItem(activePanel, idx)} style={s.deleteBtn}>×</button>
                                  </div>
                                ))}
                              </div>
                              <div style={s.inputRow}>
                                <input style={s.textInput} placeholder={meta.placeholder} value={panelInput} onChange={(e) => setPanelInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPanelItem(activePanel)} />
                                <button onClick={() => addPanelItem(activePanel)} style={{ ...s.sendBtn, background: meta.accent }}>ADD</button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div style={s.panelPlaceholder}>아이콘을 눌러서<br />루틴을 확인해보세요 🩵</div>
                      )}
                    </React.Fragment>
                  )}
                </div>

                {/* Pomodoro */}
                <div style={s.card}>
                  <div style={s.cardBar}>
                    <span style={s.dot} />
                    <span style={s.cardBarTitle}>🍅 POMODORO</span>
                    <button
                      onClick={() => {
                        setTmpFocus(focusMins);
                        setTmpBreak(breakMins);
                        setShowPomoCfg((v) => !v);
                      }}
                      style={s.closeBtn}
                    >
                      ⚙
                    </button>
                  </div>
                  {showPomoCfg && (
                    <div style={s.pomoCfgRow}>
                      <label style={s.cfgLabel}>
                        집중<input type="number" min={1} max={99} value={tmpFocus} onChange={(e) => setTmpFocus(Number(e.target.value))} style={s.cfgInput} />분
                      </label>
                      <label style={s.cfgLabel}>
                        휴식<input type="number" min={1} max={99} value={tmpBreak} onChange={(e) => setTmpBreak(Number(e.target.value))} style={s.cfgInput} />분
                      </label>
                      <button onClick={applyPomo} style={{ ...s.sendBtn, padding: "4px 12px", fontSize: 12 }}>적용</button>
                    </div>
                  )}
                  <div style={s.pomoBody}>
                    <div style={{ fontSize: 12, color: isFocus ? "#4A9ABF" : "#A0B4E8", fontWeight: 600 }}>
                      {phase === "idle" ? (isFocus ? "집중 준비" : "휴식 준비") : isFocus ? "🎯 집중 중" : "☕ 휴식 중"}
                    </div>
                    <div style={{ position: "relative", width: 84, height: 84 }}>
                      <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="42" cy="42" r="35" fill="none" stroke="#D8EEF8" strokeWidth="7" />
                        <circle
                          cx="42" cy="42" r="35" fill="none"
                          stroke={isFocus ? "#7EC8E3" : "#A0B4E8"} strokeWidth="7"
                          strokeDasharray={`${2 * Math.PI * 35}`}
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - pct / 100)}`}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#4A9ABF" }}>
                        {pad(mm)}:{pad(ss)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {phase === "idle" && <button onClick={start} style={s.pomoBtn}>▶ 시작</button>}
                      {phase === "focus" && <button onClick={pause} style={s.pomoBtn}>⏸ 정지</button>}
                      {phase === "paused" && <button onClick={resume} style={s.pomoBtn}>▶ 재개</button>}
                      <button onClick={reset} style={{ ...s.pomoBtn, background: "#C8DCE8" }}>↺</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#90BFDC" }}>집중 {focusMins}분 · 휴식 {breakMins}분</div>
                  </div>
                </div>
              </div>
            )}

            {page === "calendar" && (
              <div style={s.card}>
                <div style={s.cardBar}>
                  <span style={s.dot} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                    <button
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear((y) => y - 1);
                        } else setCalMonth((m) => m - 1);
                        setSelectedDay(null);
                      }}
                      style={s.calNavBtn}
                    >
                      ‹
                    </button>
                    <span style={{ ...s.cardBarTitle, flex: 1, textAlign: "center" }}>{calYear}년 {calMonth + 1}월</span>
                    <button
                      onClick={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear((y) => y + 1);
                        } else setCalMonth((m) => m + 1);
                        setSelectedDay(null);
                      }}
                      style={s.calNavBtn}
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div style={{ padding: "10px 10px 4px" }}>
                  <div style={s.calGrid}>
                    {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                      <div key={d} style={{ ...s.calCell, color: "#90BFDC", fontWeight: 700, fontSize: 11 }}>{d}</div>
                    ))}
                    {cells.map((d, i) => {
                      const k = d ? calKey(d) : null;
                      const hasNote = d && calNotes[k] && calNotes[k].length > 0;
                      return (
                        <div
                          key={i}
                          onClick={() => d && setSelectedDay(selectedDay === d ? null : d)}
                          style={{
                            ...s.calCell,
                            background: d && selectedDay === d ? "#B8E0F4" : isToday(d) ? "#DFF0FA" : "transparent",
                            borderRadius: 6,
                            cursor: d ? "pointer" : "default",
                            border: d && selectedDay === d ? "1.5px solid #7EC8E3" : "1.5px solid transparent",
                            color: isToday(d) ? "#4A9ABF" : "#3A6080",
                            fontWeight: isToday(d) ? 700 : 400,
                            position: "relative",
                          }}
                        >
                          {d}
                          {hasNote && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#7EC8E3" }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedDay && (
                  <div style={s.calNotePanel}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5A9FBF", marginBottom: 6 }}>{calMonth + 1}월 {selectedDay}일 일정</div>
                    <div className="hp-scroll" style={{ maxHeight: 140, overflowY: "auto" }}>
                      {(calNotes[calKey(selectedDay)] || []).map((n, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <input type="checkbox" checked={n.done} onChange={() => toggleCalNote(calKey(selectedDay), i)} style={s.checkbox} />
                          <span style={{ flex: 1, fontSize: 12, color: n.done ? "#A0C0D8" : "#3A6080", textDecoration: n.done ? "line-through" : "none" }}>{n.text}</span>
                          <button onClick={() => delCalNote(calKey(selectedDay), i)} style={s.deleteBtn}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <input style={{ ...s.textInput, fontSize: 12 }} placeholder="일정 추가..." value={calInput} onChange={(e) => setCalInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCalNote()} />
                      <button onClick={addCalNote} style={{ ...s.sendBtn, padding: "5px 10px", fontSize: 12 }}>ADD</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {page === "memo" && (
              <div style={s.card}>
                <div style={s.tabRow}>
                  {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}>{tab}</button>
                  ))}
                </div>
                <div className="hp-scroll" style={s.itemList}>
                  {filtered.length === 0 && <div style={s.empty}>메모가 없어요 🩵</div>}
                  {filtered.map((item) => (
                    <div key={item.id} style={s.itemRow}>
                      <div style={{ ...s.catBadge, background: (CAT_COLORS[item.category] && CAT_COLORS[item.category].bg) || "#D6EFFF" }}>{(CAT_COLORS[item.category] && CAT_COLORS[item.category].icon) || "📌"}</div>
                      <input type="checkbox" checked={item.done} onChange={() => toggleDone(item.id)} style={s.checkbox} />
                      {item.photo && <img src={item.photo} alt="" style={s.itemThumbSmall} onClick={() => setLightboxSrc(item.photo)} />}
                      <span style={{ ...s.itemText, textDecoration: item.done ? "line-through" : "none", color: item.done ? "#A0C0D8" : "#3A6080" }}>{item.text}</span>
                      {editingId === item.id ? (
                        <select value={editCat} onChange={(e) => setEditCat(e.target.value)} onBlur={() => saveEdit(item.id)} autoFocus style={{ ...s.select, fontSize: 11, padding: "2px 4px" }}>
                          {TABS.filter((t) => t !== "ALL").map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      ) : (
                        <span style={s.catLabel} onClick={() => { setEditingId(item.id); setEditCat(item.category); }} title="클릭해서 카테고리 변경">{item.category} ✏️</span>
                      )}
                      <button onClick={() => deleteItem(item.id)} style={s.deleteBtn}>×</button>
                    </div>
                  ))}
                </div>
                {memoPhoto && (
                  <div style={s.photoPreviewChip}>
                    <img src={memoPhoto} alt="" style={s.photoPreviewImg} />
                    <span style={{ fontSize: 11, color: "#5A9FBF" }}>사진 첨부됨</span>
                    <button onClick={() => setMemoPhoto(null)} style={s.deleteBtn}>×</button>
                  </div>
                )}
                <div style={s.inputRow}>
                  <select value={memoCategory} onChange={(e) => setMemoCategory(e.target.value)} style={s.select}>
                    {TABS.filter((t) => t !== "ALL").map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <input style={s.textInput} placeholder="memo..." value={memoInput} onChange={(e) => setMemoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMemo()} />
                  <input type="file" accept="image/*" ref={memoPhotoInputRef} style={{ display: "none" }} onChange={handleMemoPhotoChange} />
                  <button onClick={() => memoPhotoInputRef.current.click()} style={s.photoBtn} title="사진 첨부">📷</button>
                  <button onClick={sendMemo} style={s.sendBtn}>SEND</button>
                </div>
              </div>
            )}

            {page === "diary" && (
              <div style={s.card}>
                <div style={s.cardBar}>
                  <span style={s.dot} />
                  <span style={s.cardBarTitle}>끄적이기 (낙서장)</span>
                  <span style={s.diaryHint}>날짜별 일기 대신, 떠오르면 바로 적는 칸</span>
                </div>
                <div style={s.composerRow}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <textarea
                      style={s.diaryTextarea}
                      placeholder="오늘 무슨 생각? 그냥 막 적어보세요..."
                      rows={2}
                      value={diaryInput}
                      onChange={(e) => setDiaryInput(e.target.value)}
                      onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") addDiaryEntry(); }}
                    />
                    {diaryPhoto && (
                      <div style={s.photoPreviewChip}>
                        <img src={diaryPhoto} alt="" style={s.photoPreviewImg} />
                        <span style={{ fontSize: 11, color: "#5A9FBF" }}>사진 첨부됨</span>
                        <button onClick={() => setDiaryPhoto(null)} style={s.deleteBtn}>×</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input type="file" accept="image/*" ref={diaryPhotoInputRef} style={{ display: "none" }} onChange={handleDiaryPhotoChange} />
                    <button onClick={() => diaryPhotoInputRef.current.click()} style={s.photoBtn} title="사진 첨부">📷</button>
                    <button onClick={addDiaryEntry} style={s.diaryPostBtn}>올리기</button>
                  </div>
                </div>
                <div className="hp-scroll" style={s.diaryFeed}>
                  {diaryEntries.length === 0 && <div style={s.empty}>아직 끄적인 게 없어요. 짧게, 가볍게, 편하게 ✏️</div>}
                  {diaryEntries.map((e) => (
                    <div key={e.id} style={s.diaryItem}>
                      <div style={{ flex: 1 }}>
                        <div style={s.diaryTime}>{formatDiaryTime(e.time)}</div>
                        {e.photo && <img src={e.photo} alt="" style={s.diaryPhotoImg} onClick={() => setLightboxSrc(e.photo)} />}
                        {e.text && <div style={s.diaryText}>{e.text}</div>}
                      </div>
                      <button onClick={() => deleteDiaryEntry(e.id)} style={s.deleteBtn}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        <div style={s.footer}>⋆⁺ ﾞ {profileName}'s space 방명록 환영 ﾞ⁺⋆</div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#EEF7FF 0%,#F5FBFF 100%)", display: "flex", justifyContent: "center", padding: 24 },
  frame: { width: "100%", maxWidth: 1040, background: "#F8FCFF", border: "1.5px solid #B8DCEF", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 36px rgba(80,150,200,0.18)", display: "flex", flexDirection: "column" },

  // Title bar (site header — soft pink with a white pixel-heart pattern)
  titlebar: {
    background: "#FAD3E7",
    backgroundImage: HEART_TILE_URL,
    backgroundSize: "32px 32px",
    backgroundRepeat: "repeat",
    padding: "10px 16px",
    borderBottom: "3px solid #FF9FC8",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  titlebarDots: { display: "flex", gap: 5, flexShrink: 0 },
  tbDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block", border: "1px solid rgba(255,255,255,0.85)" },
  siteTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 15, letterSpacing: 0.5, textShadow: "1.5px 1.5px 0 #E8649A" },
  tbClock: { color: "rgba(255,255,255,0.9)", fontSize: 12, flexShrink: 0, minWidth: 64, textAlign: "right" },

  body: { display: "flex", flex: 1, minHeight: 560 },

  // Sidebar (the real "site nav" — clicking swaps content, no scroll-jump)
  sidebar: { width: 196, flexShrink: 0, background: "#EAF5FC", borderRight: "1.5px solid #B8DCEF", display: "flex", flexDirection: "column", padding: "16px 12px", gap: 12 },
  profileBox: { display: "flex", alignItems: "center", gap: 10 },
  profileBadge: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7EC8E3,#A0B4E8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(100,160,210,0.35)", cursor: "pointer", overflow: "hidden" },
  profilePhotoImg: { width: "100%", height: "100%", objectFit: "cover" },
  profileName: { fontSize: 14, color: "#3A6080", fontWeight: 700, cursor: "pointer" },
  profileNameInput: { fontSize: 13, color: "#3A6080", fontWeight: 700, border: "1px solid #B8DCEF", borderRadius: 6, padding: "2px 6px", outline: "none", width: 96, background: "#fff" },
  profileSub: { fontSize: 10, color: "#90BFDC", marginTop: 2 },
  sidebarDivider: { borderTop: "1px dashed #B8DCEF" },
  navList: { display: "flex", flexDirection: "column", gap: 4 },
  navBtn: { textAlign: "left", border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, cursor: "pointer", letterSpacing: 0.3, transition: "background 0.15s" },
  shelfRow: { display: "flex", justifyContent: "center", gap: 10, padding: "2px 0" },
  visitorBadge: { fontSize: 10.5, color: "#7AAFC8", textAlign: "center", marginTop: "auto" },

  // Content frame
  content: { flex: 1, padding: 18, overflowY: "auto", maxHeight: 700 },

  // HOME page
  homeWrap: { display: "flex", flexDirection: "column", gap: 14 },
  homeHero: { background: "linear-gradient(135deg,#DFF0FA,#EAF2FF)", border: "1.5px solid #C8E4F4", borderRadius: 12, padding: "18px 16px", textAlign: "center" },
  homeGreeting: { fontSize: 13, color: "#4A9ABF", marginBottom: 8 },
  homeClock: { fontSize: 30, color: "#3A6080", letterSpacing: 1 },
  homeDate: { fontSize: 11, color: "#90BFDC", marginTop: 4 },
  statRow: { display: "flex", gap: 10 },
  statTile: { flex: 1, background: "#F0F8FF", border: "1.5px solid #C8E4F4", borderRadius: 10, padding: "10px 6px", cursor: "pointer", textAlign: "center" },
  statNum: { fontSize: 16, color: "#4A9ABF", fontWeight: 700 },
  statLabel: { fontSize: 10.5, color: "#7AAFC8", marginTop: 4 },
  homeDiaryPreview: { background: "#F8FCFF", border: "1.5px solid #C8E4F4", borderRadius: 10, padding: "12px 14px" },
  homeSectionLabel: { fontSize: 12, color: "#5A9FBF", fontWeight: 700, marginBottom: 8 },
  quoteCard: { background: "#EEF8FF", borderLeft: "3px solid #F4A7C3", borderRadius: 6, padding: "8px 10px" },
  quoteText: { fontSize: 12.5, color: "#3A6080", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  quoteTime: { fontSize: 10.5, color: "#90BFDC", marginTop: 4 },
  homeLinkBtn: { marginTop: 8, background: "none", border: "none", color: "#5A9FBF", fontSize: 11.5, cursor: "pointer", padding: 0, textDecoration: "underline" },
  shortcutRow: { display: "flex", gap: 8 },
  shortcutBtn: { flex: 1, background: "#7EC8E3", color: "#fff", border: "none", borderRadius: 8, padding: "8px 4px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" },

  // Routine page (two columns inside the swapped frame)
  routineWrap: { display: "flex", flexDirection: "column", gap: 14 },

  card: { background: "#F8FCFF", border: "1.5px solid #B8DCEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 3px 14px rgba(100,180,220,0.10)" },
  cardBar: { background: "#DFF0FA", padding: "7px 10px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid #B8DCEF" },
  dot: { width: 9, height: 9, borderRadius: "50%", background: "#7EC8E3", display: "inline-block", flexShrink: 0 },
  cardBarTitle: { fontSize: 12, color: "#5A9FBF", flex: 1, letterSpacing: 0.3 },
  closeBtn: { background: "none", border: "none", color: "#7AAFC8", fontSize: 13, cursor: "pointer", padding: "0 2px" },

  panelIconRow: { display: "flex", justifyContent: "center", gap: 8, padding: "12px 10px" },
  iconBtn: { width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" },
  panelPlaceholder: { textAlign: "center", fontSize: 12, color: "#90C0DC", padding: "6px 10px 16px", lineHeight: 1.7 },
  panelSubBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px 4px" },
  panelList: { padding: "4px 10px", minHeight: 50, maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 },
  panelRow: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "6px 9px", border: "1px solid #C8E4F4" },
  panelText: { flex: 1, fontSize: 13, lineHeight: 1.5 },

  pomoCfgRow: { padding: "10px 14px", background: "#EAF5FC", borderBottom: "1px solid #B8DCEF", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  cfgLabel: { fontSize: 12, color: "#5A9FBF", display: "flex", alignItems: "center", gap: 4 },
  cfgInput: { width: 36, border: "1px solid #B8DCEF", borderRadius: 6, padding: "3px 5px", fontSize: 13, color: "#3A6080", textAlign: "center", outline: "none", margin: "0 3px" },
  pomoBody: { padding: "14px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  pomoBtn: { background: "#7EC8E3", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },

  calGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 },
  calCell: { aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  calNavBtn: { background: "none", border: "none", color: "#7AAFC8", fontSize: 15, cursor: "pointer", padding: "0 4px" },
  calNotePanel: { borderTop: "1px solid #B8DCEF", padding: "10px 12px", background: "#EAF5FC" },

  tabRow: { display: "flex", borderBottom: "1px solid #B8DCEF", background: "#E8F5FC", padding: "6px 8px 0", gap: 4, flexWrap: "wrap" },
  tab: { padding: "5px 9px", fontSize: 11, fontWeight: 600, border: "none", background: "transparent", color: "#90BFDC", cursor: "pointer", borderRadius: "6px 6px 0 0", letterSpacing: 0.3 },
  tabActive: { background: "#F8FCFF", color: "#4A9ABF", borderBottom: "2px solid #7EC8E3" },
  itemList: { padding: "10px 12px", minHeight: 100, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 },
  empty: { textAlign: "center", color: "#90C0DC", fontSize: 12, marginTop: 16, padding: "0 10px" },
  itemRow: { display: "flex", alignItems: "center", gap: 7, background: "#EEF8FF", borderRadius: 8, padding: "7px 10px", border: "1px solid #C8E4F4" },
  catBadge: { width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 },
  checkbox: { accentColor: "#7EC8E3", width: 14, height: 14, flexShrink: 0, cursor: "pointer" },
  itemText: { flex: 1, fontSize: 13, lineHeight: 1.5 },
  catLabel: { fontSize: 11, color: "#90BFDC", background: "#E0F3FF", border: "1px solid #B8DCEF", borderRadius: 4, padding: "1px 5px", flexShrink: 0, cursor: "pointer", whiteSpace: "nowrap" },
  deleteBtn: { background: "none", border: "none", color: "#A0C8DC", fontSize: 15, cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0 },
  inputRow: { display: "flex", borderTop: "1px solid #B8DCEF", padding: "9px 10px", gap: 7, background: "#DFF0FA", alignItems: "center" },
  select: { fontSize: 12, border: "1px solid #B8DCEF", borderRadius: 8, padding: "5px 4px", background: "#F0F8FF", color: "#4A9ABF", outline: "none", cursor: "pointer" },
  textInput: { flex: 1, border: "1px solid #B8DCEF", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#F8FCFF", color: "#3A6080", outline: "none" },
  sendBtn: { background: "#7EC8E3", color: "#fff", border: "none", borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  photoBtn: { background: "#EAF5FC", border: "1px solid #B8DCEF", borderRadius: 8, padding: "6px 9px", fontSize: 14, cursor: "pointer", flexShrink: 0, lineHeight: 1 },
  photoPreviewChip: { display: "inline-flex", alignItems: "center", gap: 6, background: "#EEF8FF", border: "1px solid #C8E4F4", borderRadius: 8, padding: "4px 8px", margin: "0 10px 8px", width: "fit-content" },
  photoPreviewImg: { width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 },
  itemThumb: { width: 44, height: 44, borderRadius: 8, objectFit: "cover", cursor: "pointer", flexShrink: 0, marginBottom: 6, display: "block" },
  itemThumbSmall: { width: 26, height: 26, borderRadius: 6, objectFit: "cover", cursor: "pointer", flexShrink: 0 },

  // Diary
  diaryHint: { fontSize: 11, color: "#90BFDC", fontWeight: 400 },
  composerRow: { display: "flex", gap: 10, padding: "12px 14px", alignItems: "flex-start", borderBottom: "1px dashed #C8E4F4" },
  diaryTextarea: { flex: 1, border: "1px solid #B8DCEF", borderRadius: 10, padding: "8px 10px", fontSize: 13, color: "#3A6080", background: "#F8FCFF", outline: "none", resize: "none" },
  diaryPostBtn: { background: "#F4A7C3", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  diaryFeed: { padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" },
  diaryItem: { display: "flex", gap: 10, alignItems: "flex-start", background: "#EEF8FF", border: "1px solid #C8E4F4", borderRadius: 10, padding: "8px 12px" },
  diaryTime: { fontSize: 11, color: "#90BFDC", paddingTop: 1, whiteSpace: "nowrap", marginBottom: 4 },
  diaryText: { fontSize: 13, color: "#3A6080", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  diaryPhotoImg: { display: "block", maxWidth: "100%", maxHeight: 220, borderRadius: 8, objectFit: "cover", cursor: "pointer", marginBottom: 6 },

  // History (routine log)
  historyWrap: { padding: "8px 10px 12px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" },
  historyRow: { background: "#EEF8FF", border: "1px solid #C8E4F4", borderRadius: 10, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 },
  historyDate: { fontSize: 12, fontWeight: 700, color: "#4A9ABF" },
  historyCounts: { display: "flex", gap: 7, flexWrap: "wrap" },
  historyChip: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#5A9FBF", background: "#fff", border: "1px solid #C8E4F4", borderRadius: 6, padding: "2px 6px" },

  // Lightbox
  lightboxOverlay: { position: "fixed", inset: 0, background: "rgba(20,30,50,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24, cursor: "pointer" },
  lightboxImg: { maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.4)", cursor: "default" },

  footer: { textAlign: "center", color: "#90BFDC", fontSize: 11, padding: "10px 0 14px", borderTop: "1px dashed #C8E4F4" },
};

ReactDOM.createRoot(document.getElementById("root")).render(<HyeoniSpace />);
</script>
</body>
</html>
