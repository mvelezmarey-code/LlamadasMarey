import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://srxlotxroshssnyrufgq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeGxvdHhyb3Noc3NueXJ1ZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5ODM4MTIsImV4cCI6MjA5ODU1OTgxMn0.Yh2HeOGkAB4krgsGLcszpAVOBuUeI1RSFJT9p47gw_s"
);

/* =====================================================================
   DISENO
   Una paleta, un tipo de tarjeta, un tipo de boton. Navy como unico
   color fuerte; los estados usan tonos suaves con texto oscuro.
   ===================================================================== */
const C = {
  navy: "#16324F", navyDark: "#0F2438", ink: "#111827", text: "#374151", muted: "#6B7280", faint: "#9CA3AF",
  line: "#E5E7EB", bg: "#F5F6F8", card: "#FFFFFF", amber: "#B45309", amberBg: "#FEF3C7",
  green: "#166534", greenBg: "#DCFCE7", red: "#B91C1C", redBg: "#FEE2E2", blue: "#1D4ED8", blueBg: "#DBEAFE",
  violet: "#5B21B6", violetBg: "#EDE9FE", slateBg: "#F1F5F9"
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const EMAIL_MAP = {
  Carlos: "carlos@marey.local", Anthony: "anthony@marey.local", Luis: "luis@marey.local",
  Willy: "willy@marey.local", Kenneth: "kenneth@marey.local", Jean: "jean@marey.local", Admin: "admin@marey.local"
};

const STATUS = {
  dirigido:            { t: "Dirigido",       c: C.green,  b: C.greenBg },
  pendiente_willy:     { t: "Pendiente",      c: C.amber,  b: C.amberBg },
  atendido_resuelto:   { t: "Resuelto",       c: C.green,  b: C.greenBg },
  atendido_cita_marey: { t: "Citó a Marey",   c: C.violet, b: C.violetBg },
  no_contesto:         { t: "No contestó",    c: C.red,    b: C.redBg },
  cita_domicilio:      { t: "Cita domicilio", c: C.amber,  b: C.amberBg },
  cita_confirmada:     { t: "Confirmada",     c: C.green,  b: C.greenBg }
};

/* ---------- estilos base ---------- */
const S = {
  page: { maxWidth: 640, margin: "0 auto", padding: "0 16px 48px", fontFamily: FONT, color: C.ink },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18, marginBottom: 12, boxShadow: "none" },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, fontWeight: 400, background: "#fff", color: C.ink, outline: "none", fontFamily: FONT },
  label: { display: "block", fontSize: 11, fontWeight: 500, color: C.muted, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 },
  h2: { fontSize: 17, fontWeight: 600, margin: "4px 0 14px" },
  sub: { fontSize: 13, color: C.muted },
  pill: (bg, color) => ({ display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: bg, color }),
  btn: (kind = "primary") => {
    const base = { width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "1px solid transparent", fontFamily: FONT, transition: "transform .05s" };
    if (kind === "primary") return { ...base, background: C.navy, color: "#fff" };
    if (kind === "ghost") return { ...base, background: "#fff", color: C.text, border: `1px solid ${C.line}` };
    if (kind === "danger") return { ...base, background: C.redBg, color: C.red };
    if (kind === "red") return { ...base, background: C.red, color: "#fff" };
    if (kind === "green") return { ...base, background: C.green, color: "#fff" };
    if (kind === "amber") return { ...base, background: C.amberBg, color: C.amber };
    if (kind === "blue") return { ...base, background: C.blue, color: "#fff" };
    if (kind === "violet") return { ...base, background: C.violet, color: "#fff" };
    if (kind === "disabled") return { ...base, background: C.slateBg, color: C.faint, cursor: "not-allowed" };
    return base;
  },
  small: { padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${C.line}`, background: "#fff", color: C.text, fontFamily: FONT }
};

/* ---------- utilidades ---------- */
function fmtDate(d) { return new Date(d).toLocaleDateString("es-PR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function fmtTel(t) { const d = String(t || "").replace(/\D/g, "").replace(/^1(\d{10})$/, "$1"); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : (t || ""); }
function soloDigitos(t) { return String(t || "").replace(/\D/g, "").replace(/^1(\d{10})$/, "$1"); }
function hace(iso) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "ahora"; if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}
function hrsLeft(c) { return Math.max(0, 24 - ((Date.now() - new Date(c).getTime()) / 3600000)).toFixed(0); }
function isToday(d) { const t = new Date(), x = new Date(d); return x.getDate() === t.getDate() && x.getMonth() === t.getMonth() && x.getFullYear() === t.getFullYear(); }
function isThisWeek(d) { const t = new Date(), x = new Date(d); const s = new Date(t); s.setDate(t.getDate() - t.getDay()); s.setHours(0, 0, 0, 0); return x >= s; }
function isThisMonth(d) { const t = new Date(), x = new Date(d); return x.getMonth() === t.getMonth() && x.getFullYear() === t.getFullYear(); }
function isThisYear(d) { return new Date(d).getFullYear() === new Date().getFullYear(); }
function filterByTime(records, filter, dateRange, field = "created_at") {
  if (filter === "today") return records.filter(r => isToday(r[field]));
  if (filter === "week") return records.filter(r => isThisWeek(r[field]));
  if (filter === "month") return records.filter(r => isThisMonth(r[field]));
  if (filter === "year") return records.filter(r => isThisYear(r[field]));
  if (filter === "custom" && dateRange) {
    const from = dateRange.from ? new Date(dateRange.from + "T00:00:00") : null;
    const to = dateRange.to ? new Date(dateRange.to + "T23:59:59") : null;
    return records.filter(r => { const d = new Date(r[field]); if (from && d < from) return false; if (to && d > to) return false; return true; });
  }
  return records;
}
// rango de fechas (yyyy-mm-dd) para los RPC de metricas
function rangoFechas(filter, dateRange) {
  const iso = (d) => d.toISOString().slice(0, 10);
  const t = new Date();
  if (filter === "today") return [iso(t), iso(t)];
  if (filter === "week") { const s = new Date(t); s.setDate(t.getDate() - t.getDay()); return [iso(s), iso(t)]; }
  if (filter === "month") return [iso(new Date(t.getFullYear(), t.getMonth(), 1)), iso(t)];
  if (filter === "year") return [`${t.getFullYear()}-01-01`, iso(t)];
  if (filter === "custom") return [dateRange.from || "2020-01-01", dateRange.to || iso(t)];
  return ["2020-01-01", iso(t)];
}

// sonido corto de aviso (dos tonos), sin archivos
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const tono = (f, t0, dur) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination); o.start(t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.stop(t0 + dur + 0.05); };
    tono(880, ctx.currentTime, 0.18); tono(1175, ctx.currentTime + 0.2, 0.25);
  } catch { /* sin audio */ }
}

/* ---------- Encabezado de seccion de la lista de perdidas ---------- */
const SecHead = ({ dot, t, n, d }) => (
  <div style={{ padding: "13px 16px 12px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{t}</span>
      {n != null && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: C.muted, background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: "1px 9px" }}>{n}</span>}
    </div>
    {d && <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.45, paddingLeft: 17 }}>{d}</div>}
  </div>
);

/* ---------- CSS global minimo (fuente, animaciones) ---------- */
function GlobalCss() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      body { background: ${C.bg}; margin: 0; font-family: ${FONT}; -webkit-font-smoothing: antialiased; font-feature-settings: 'cv11', 'ss01', 'tnum'; }
      * { letter-spacing: -0.01em; }
      input:focus, select:focus, textarea:focus { border-color: ${C.navy} !important; box-shadow: 0 0 0 3px rgba(22,50,79,0.12); }
      button:active { transform: translateY(1px); }
      @keyframes bajar { from { transform: translateY(-16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      @keyframes latir { 0%,100% { box-shadow: 0 0 0 0 rgba(185,28,28,.35) } 50% { box-shadow: 0 0 0 8px rgba(185,28,28,0) } }
      .shell { display: grid; grid-template-columns: 232px minmax(0,1fr); min-height: 100vh; }
      .side { background: ${C.navy}; color: #fff; padding: 22px 16px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
      .main { min-width: 0; display: flex; flex-direction: column; }
      .topbar { position: sticky; top: 0; z-index: 20; background: #fff; border-bottom: 1px solid ${C.line}; height: 56px; display: flex; align-items: center; gap: 14px; padding: 0 24px; }
      .content { padding: 22px 24px 60px; max-width: 1180px; width: 100%; margin: 0 auto; }
      .two { display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: 20px; align-items: start; }
      .sticky { position: sticky; top: 76px; }
      .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .mtabs { display: none; }
      .solo-movil { display: none; }
      .nav-a { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 12px; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.78); background: transparent; border: none; cursor: pointer; margin-bottom: 4px; font-family: ${FONT}; text-align: left; }
      .nav-a.on { background: rgba(255,255,255,.12); color: #fff; font-weight: 600; }
      .nav-n { min-width: 22px; height: 22px; border-radius: 11px; background: rgba(255,255,255,.18); font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; padding: 0 6px; }
      .nav-n.red { background: #EF4444; }
      .acts3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .tipw { position: relative; }
      .tipw .tip { position: absolute; bottom: calc(100% + 8px); left: 0; min-width: 210px; max-width: 280px; background: ${C.ink}; color: #fff; font-size: 12px; font-weight: 500; line-height: 1.4; text-align: left; padding: 10px 12px; border-radius: 10px; box-shadow: 0 12px 30px -12px rgba(0,0,0,.5); opacity: 0; visibility: hidden; transform: translateY(4px); transition: opacity .15s, transform .15s; z-index: 30; pointer-events: none; }
      .tipw .tip b { color: #fff; }
      .tipw .tip::after { content: ""; position: absolute; top: 100%; left: 22px; border: 6px solid transparent; border-top-color: ${C.ink}; }
      .tipw:hover .tip, .tipw:focus-within .tip { opacity: 1; visibility: visible; transform: translateY(0); }
      @media (max-width: 899px) {
        .shell { grid-template-columns: 1fr; }
        .side { display: none; }
        .mtabs { display: flex; gap: 6px; overflow-x: auto; padding: 10px 16px 8px; background: #fff; border-bottom: 1px solid ${C.line}; position: sticky; top: 64px; z-index: 19; }
        .mtabs::-webkit-scrollbar { display: none; }
        .topbar { padding: 0 16px; }
        .content { padding: 16px 16px 60px; }
        .two { grid-template-columns: 1fr; }
        .sticky { position: static; }
        .row2 { grid-template-columns: 1fr; }
        .acts3 { grid-template-columns: 1fr 1fr; }
        .solo-movil { display: inline-block; }
      }
    `}</style>
  );
}

/* ---------- componentes chicos ---------- */
function Badge({ status, centro }) {
  const s = STATUS[status] || { t: status, c: C.muted, b: C.slateBg };
  return <span style={S.pill(s.b, s.c)}>{status === "dirigido" && centro ? `Dirigido a ${centro}` : s.t}</span>;
}

function Empty({ titulo, texto }) {
  return (
    <div style={{ ...S.card, textAlign: "center", padding: "44px 20px" }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{titulo}</div>
      {texto && <div style={{ ...S.sub, marginTop: 6 }}>{texto}</div>}
    </div>
  );
}

function Stat({ label, value, tone = "navy", sub }) {
  const bg = { navy: C.navy, green: C.green, amber: C.amber, red: C.red, blue: C.blue, violet: C.violet, slate: C.slateBg }[tone] || C.navy;
  const light = tone === "slate";
  return (
    <div style={{ padding: "16px 12px", borderRadius: 14, background: bg, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: light ? C.ink : "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: light ? C.muted : "rgba(255,255,255,.85)", marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: light ? C.faint : "rgba(255,255,255,.7)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TimeFilter({ value, onChange, dateRange, onDateRange }) {
  const ops = [["today", "Hoy"], ["week", "Semana"], ["month", "Mes"], ["year", "Año"], ["all", "Todo"], ["custom", "Rango"]];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: C.slateBg, borderRadius: 12 }}>
        {ops.map(([id, label]) => (
          <button key={id} onClick={() => onChange(id)} style={{ padding: "7px 12px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, background: value === id ? "#fff" : "transparent", color: value === id ? C.ink : C.muted, boxShadow: value === id ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>{label}</button>
        ))}
      </div>
      {value === "custom" && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1 }}><label style={S.label}>Desde</label><input type="date" value={dateRange.from} onChange={e => onDateRange({ ...dateRange, from: e.target.value })} style={{ ...S.input, padding: "10px 12px", fontSize: 14 }} /></div>
          <div style={{ flex: 1 }}><label style={S.label}>Hasta</label><input type="date" value={dateRange.to} onChange={e => onDateRange({ ...dateRange, to: e.target.value })} style={{ ...S.input, padding: "10px 12px", fontSize: 14 }} /></div>
        </div>
      )}
    </div>
  );
}

function SearchSelect({ label, value, onChange, groups, placeholder }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!value) { setSelectedLabel(""); return; }
    for (const items of Object.values(groups)) {
      const found = items.find(i => String(i.id) === String(value));
      if (found) { setSelectedLabel(found.nombre); return; }
    }
  }, [value, groups]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const q = search.toLowerCase();
  const filtered = {};
  Object.entries(groups).forEach(([g, items]) => { const f = items.filter(i => i.nombre.toLowerCase().includes(q)); if (f.length) filtered[g] = f; });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={S.label}>{label}</label>
      {selectedLabel && !open ? (
        <div onClick={() => { setOpen(true); setSearch(""); }} style={{ ...S.input, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{selectedLabel}</span>
          <span onClick={(e) => { e.stopPropagation(); onChange(""); setSelectedLabel(""); setSearch(""); }} style={{ color: C.faint, fontSize: 13, fontWeight: 600, padding: "0 4px" }}>Cambiar</span>
        </div>
      ) : (
        <input style={S.input} value={search} onChange={e => { setSearch(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder || "Buscar..."} />
      )}
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, maxHeight: 260, overflowY: "auto", zIndex: 100, marginTop: 6, boxShadow: "0 12px 32px rgba(16,24,40,.12)" }}>
          {Object.keys(filtered).length === 0 ? <div style={{ padding: 14, color: C.faint, fontSize: 14 }}>No se encontró</div> :
            Object.entries(filtered).map(([g, items]) => (
              <div key={g}>
                <div style={{ padding: "8px 14px 4px", fontSize: 11, fontWeight: 600, color: C.faint, textTransform: "uppercase", letterSpacing: .4, background: "#FAFAFA" }}>{g}</div>
                {items.map(item => (
                  <div key={item.id} onClick={() => { onChange(String(item.id)); setSelectedLabel(item.nombre); setSearch(""); setOpen(false); }} style={{ padding: "11px 14px", cursor: "pointer", fontSize: 15 }}
                    onMouseEnter={e => e.currentTarget.style.background = C.slateBg} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{item.nombre}</div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ---------- login ---------- */
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(false);

  const Logo = () => (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.navy, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 600, marginBottom: 14 }}>M</div>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Marey Service Center</div>
      <div style={S.sub}>Registro de llamadas</div>
    </div>
  );

  if (!name) return (
    <div style={{ ...S.page, maxWidth: 380, paddingTop: 64 }}><GlobalCss /><Logo />
      <label style={S.label}>¿Quién eres?</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {Object.keys(EMAIL_MAP).map(u => <button key={u} onClick={() => setName(u)} style={{ ...S.btn("ghost"), padding: "18px", fontSize: 16 }}>{u}</button>)}
      </div>
    </div>
  );

  const handlePin = async (digit) => {
    setPinError(false);
    const p = pin + digit; setPin(p);
    if (p.length === 4) {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL_MAP[name], password: p });
      if (error) { setPinError(true); setLoading(false); setTimeout(() => setPin(""), 800); }
      else {
        const { data: ud } = await supabase.from("usuarios").select("id, nombre, rol").eq("auth_id", data.user.id).single();
        setLoading(false); if (ud) onLogin(ud);
      }
    }
  };

  return (
    <div style={{ ...S.page, maxWidth: 380, paddingTop: 64 }}><GlobalCss /><Logo />
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Hola, {name}</div>
        <div style={S.sub}>{loading ? "Verificando..." : "Entra tu PIN"}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 52, height: 58, borderRadius: 12, border: `1px solid ${pinError ? C.red : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, background: "#fff" }}>{pin[i] ? "•" : ""}</div>)}
      </div>
      {pinError && <div style={{ textAlign: "center", color: C.red, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>PIN incorrecto</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 270, margin: "0 auto" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((n, i) => {
          if (n === "") return <div key={i} />;
          if (n === "del") return <button key={i} onClick={() => { setPin(p => p.slice(0, -1)); setPinError(false); }} style={{ ...S.btn("ghost"), padding: 16, fontSize: 14, color: C.muted }}>Borrar</button>;
          return <button key={i} onClick={() => handlePin(String(n))} disabled={loading} style={{ ...S.btn("ghost"), padding: 16, fontSize: 20 }}>{n}</button>;
        })}
      </div>
      <button onClick={() => { setName(""); setPin(""); setPinError(false); }} style={{ display: "block", margin: "22px auto 0", background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Cambiar usuario</button>
    </div>
  );
}

/* =====================================================================
   APP
   ===================================================================== */
export default function App() {
  const [userData, setUserData] = useState(null);
  const [tab, setTab] = useState("llamadas");
  const [records, setRecords] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [antiguedadList, setAntiguedadList] = useState([]);
  const FORM0 = { telefono: "", nombre: "", municipio_id: "", modelo_id: "", antiguedad_id: "", problema: "" };
  const [form, setForm] = useState(FORM0);
  const [clienteFound, setClienteFound] = useState(null);
  const [clienteHistory, setClienteHistory] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [citaForm, setCitaForm] = useState({});
  const [showCitaId, setShowCitaId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filters, setFilters] = useState({ stats: "all", dash: "all", hist: "all", queue: "all", citas: "all", perd: "all" });
  const [ranges, setRanges] = useState({ stats: { from: "", to: "" }, dash: { from: "", to: "" }, hist: { from: "", to: "" }, queue: { from: "", to: "" }, citas: { from: "", to: "" }, perd: { from: "", to: "" } });
  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const setR = (k, v) => setRanges(p => ({ ...p, [k]: v }));

  // ---- llamadas perdidas ----
  const [perdidas, setPerdidas] = useState([]);          // abiertas + tomadas
  const [perdidasCerradas, setPerdidasCerradas] = useState([]); // historial reciente
  const [devolviendo, setDevolviendo] = useState(null);  // fila de llamadas_perdidas que se esta devolviendo
  const [aviso, setAviso] = useState(null);              // banner
  const [metricasPerd, setMetricasPerd] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const perdidasRef = useRef([]);
  const avisoTimer = useRef(null);

  /* ---------- sesion y catalogos ---------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("usuarios").select("id, nombre, rol").eq("auth_id", session.user.id).single().then(({ data }) => {
        if (data) { setUserData(data); setTab(data.rol === "tech" ? "queue" : data.rol === "admin" ? "dashboard" : "llamadas"); }
      });
    });
  }, []);

  useEffect(() => {
    if (!userData) return;
    supabase.from("municipios").select("*").order("nombre").then(({ data }) => data && setMunicipios(data));
    supabase.from("modelos").select("*").eq("activo", true).order("categoria").order("subcategoria").order("nombre").then(({ data }) => data && setModelos(data));
    supabase.from("status").select("*").then(({ data }) => data && setStatusList(data));
    supabase.from("antiguedad").select("*").order("id").then(({ data }) => data && setAntiguedadList(data));
  }, [userData]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase.from("llamadas_completas").select("*").order("created_at", { ascending: false }).limit(500);
    if (data) setRecords(data);
  }, []);

  useEffect(() => { if (userData) { fetchRecords(); const iv = setInterval(fetchRecords, 30000); return () => clearInterval(iv); } }, [userData, fetchRecords]);

  useEffect(() => {
    if (!userData) return;
    const ch = supabase.channel("llamadas_rt").on("postgres_changes", { event: "*", schema: "public", table: "llamadas" }, fetchRecords).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userData, fetchRecords]);

  /* ---------- llamadas perdidas: carga + realtime ---------- */
  const fetchPerdidas = useCallback(async () => {
    const { data } = await supabase.from("v_llamadas_perdidas").select("*").neq("estado", "cerrada").order("ultima_llamada", { ascending: false });
    const hace7 = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: cer } = await supabase.from("v_llamadas_perdidas").select("*").eq("estado", "cerrada").gte("cerrada_at", hace7).order("cerrada_at", { ascending: false }).limit(100);
    if (data) { setPerdidas(data); perdidasRef.current = data; }
    if (cer) setPerdidasCerradas(cer);
  }, []);

  useEffect(() => { if (userData) fetchPerdidas(); }, [userData, fetchPerdidas]);

  /* Actualizar: recarga la lista y pide a la funcion que revise en Resend los correos recientes */
  const [sync, setSync] = useState({ busy: false, msg: "" });
  async function sincronizar() {
    setSync({ busy: true, msg: "Revisando correos..." });
    try {
      const { data, error } = await supabase.functions.invoke("llamada-perdida", { body: { sync: true } });
      if (error) throw error;
      await fetchPerdidas();
      const extra = data.acumulados ? ` · ${data.acumulados} sumados a un número ya en lista` : "";
      setSync({ busy: false, msg: `Revisados ${data.revisados} correos · ${data.nuevos} nuevos${extra}${data.errores ? ` · ${data.errores} con error` : ""}` });
    } catch (e) {
      await fetchPerdidas();
      setSync({ busy: false, msg: "Lista actualizada. No se pudo revisar Resend: " + (e?.message || String(e)) });
    }
    setTimeout(() => setSync(s => ({ ...s, msg: "" })), 8000);
  }

  useEffect(() => {
    if (!userData) return;
    const ch = supabase.channel("perdidas_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "llamadas_perdidas" }, (p) => { mostrarAviso(p.new, "nueva"); fetchPerdidas(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "llamadas_perdidas" }, (p) => {
        if (p.new.estado !== "cerrada" && p.old && p.new.veces > (p.old.veces || 0)) mostrarAviso(p.new, "repite");
        fetchPerdidas();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, fetchPerdidas]);

  function mostrarAviso(fila, tipo) {
    if (userData?.rol === "tech") return; // los tecnicos no devuelven estas llamadas
    setAviso({ ...fila, tipo });
    beep();
    if (avisoTimer.current) clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(null), 25000);
  }

  // URL firmada para escuchar el voicemail
  async function urlAudio(fila) {
    if (!fila.voicemail_url) return;
    if (audioUrls[fila.id]) return;
    const { data } = await supabase.storage.from("voicemails").createSignedUrl(fila.voicemail_url, 3600);
    if (data?.signedUrl) setAudioUrls(p => ({ ...p, [fila.id]: data.signedUrl }));
  }

  /* ---------- metricas de perdidas (dashboard) ---------- */
  useEffect(() => {
    if (!userData || tab !== "dashboard") return;
    const [d, h] = rangoFechas(filters.dash, ranges.dash);
    supabase.rpc("metricas_llamadas_perdidas", { p_desde: d, p_hasta: h }).then(({ data }) => setMetricasPerd(Array.isArray(data) ? data[0] : data));
  }, [userData, tab, filters.dash, ranges.dash, perdidas.length, perdidasCerradas.length]);

  const munGroups = useMemo(() => {
    const g = {};
    municipios.forEach(m => { const z = m.zona || "Otras áreas"; (g[z] = g[z] || []).push(m); });
    return g;
  }, [municipios]);
  const modelGroups = useMemo(() => {
    const g = {};
    modelos.forEach(m => { const k = m.subcategoria ? `${m.categoria} — ${m.subcategoria}` : m.categoria; (g[k] = g[k] || []).push(m); });
    return g;
  }, [modelos]);

  if (!userData) return <LoginScreen onLogin={(u) => { setUserData(u); setTab(u.rol === "tech" ? "queue" : u.rol === "admin" ? "dashboard" : "llamadas"); }} />;

  const user = userData.nombre, role = userData.rol, userId = userData.id;
  const getStatusId = (nombre) => { const s = statusList.find(x => x.nombre === nombre); return s ? s.id : null; };

  /* ---------- cliente por telefono ---------- */
  const searchPhone = async (tel) => {
    const dig = soloDigitos(tel);
    if (dig.length < 10) { setClienteFound(null); setClienteHistory([]); return; }
    setSearching(true);
    // acepta como este guardado: con guiones, sin guiones o con el 1
    const variantes = [...new Set([tel, dig, fmtTel(dig), "1" + dig])];
    const { data: cliente } = await supabase.from("clientes").select("*").in("telefono", variantes).limit(1).maybeSingle();
    if (cliente) {
      setClienteFound(cliente);
      setForm(f => ({ ...f, nombre: cliente.nombre }));
      const { data: history } = await supabase.from("llamadas_completas").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false });
      if (history?.length) {
        setClienteHistory(history);
        const last = history[0];
        const mun = municipios.find(m => m.nombre === last.municipio);
        const mod = modelos.find(m => m.nombre === last.modelo);
        const ant = antiguedadList.find(a => a.rango === last.antiguedad);
        setForm(f => ({ ...f, nombre: cliente.nombre, municipio_id: mun ? String(mun.id) : "", modelo_id: mod ? String(mod.id) : "", antiguedad_id: ant ? String(ant.id) : "" }));
      } else setClienteHistory([]);
    } else { setClienteFound(null); setClienteHistory([]); }
    setSearching(false);
  };

  /* ---------- guardar llamada (y cerrar la perdida si aplica) ---------- */
  const saveCallWith = async (statusNombre, centroDirigido) => {
    const statusId = getStatusId(statusNombre);
    if (!statusId) { alert("No se encontró el status '" + statusNombre + "'. Recarga la página e intenta de nuevo."); return; }

    // 1) Cliente: usa el que ya existe (por id o por telefono) o lo crea.
    //    Si busca por telefono evita chocar con el UNIQUE y evita duplicados.
    let clienteId;
    if (clienteFound) {
      clienteId = clienteFound.id;
      if (form.nombre && form.nombre !== clienteFound.nombre) {
        await supabase.from("clientes").update({ nombre: form.nombre }).eq("id", clienteId);
      }
    } else {
      const { data: existente } = await supabase.from("clientes").select("id").eq("telefono", form.telefono).maybeSingle();
      if (existente) {
        clienteId = existente.id;
      } else {
        const { data: nc, error: eCli } = await supabase.from("clientes").insert({ nombre: form.nombre, telefono: form.telefono }).select("id").single();
        if (eCli || !nc) { alert("No se pudo guardar el cliente: " + (eCli?.message || "sin datos")); return; }
        clienteId = nc.id;
      }
    }

    // 2) Registrar la llamada
    const { data: nueva, error: eLlam } = await supabase.from("llamadas").insert({
      cliente_id: clienteId, municipio_id: parseInt(form.municipio_id), modelo_id: parseInt(form.modelo_id),
      antiguedad_id: form.antiguedad_id ? parseInt(form.antiguedad_id) : null,
      status_id: statusId, registrado_por: userId, resuelto_por: statusNombre === "atendido_resuelto" ? userId : null,
      centro_dirigido: centroDirigido || null, problema: form.problema || null
    }).select("id").single();
    if (eLlam) { alert("No se pudo registrar la llamada: " + eLlam.message); return; }

    // 3) Cerrar la llamada perdida si venimos de "Por devolver"
    if (devolviendo) {
      // San Juan / San Germán / Se resolvió = atendida. Referido a técnicos = pendiente del técnico.
      const resPerdida = statusNombre === "pendiente_willy" ? "pendiente_tecnico" : "atendida";
      const { error: ePerd } = await supabase.from("llamadas_perdidas").update({
        estado: "cerrada", resultado: resPerdida, cerrada_por: user, cerrada_at: new Date().toISOString(), llamada_id: nueva?.id || null
      }).eq("id", devolviendo.id);
      if (ePerd) { alert("La llamada se registró, pero no se pudo cerrar la perdida: " + ePerd.message); }
      setDevolviendo(null);
      fetchPerdidas();
    }

    setSaved(true); fetchRecords();
    setTimeout(() => { setForm(FORM0); setClienteFound(null); setClienteHistory([]); setSaved(false); }, 1600);
  };

  const canSave = form.nombre && form.telefono && form.municipio_id && form.modelo_id;

  /* ---------- acciones sobre perdidas ---------- */
  const tomar = async (p) => {
    await supabase.from("llamadas_perdidas").update({ estado: "tomada", tomada_por: user, tomada_at: new Date().toISOString() }).eq("id", p.id);
    fetchPerdidas();
  };
  const soltar = async (p) => {
    await supabase.from("llamadas_perdidas").update({ estado: "abierta", tomada_por: null, tomada_at: null }).eq("id", p.id);
    fetchPerdidas();
  };
  // Atender: la toma (desaparece de la lista del otro) y abre el formulario con el telefono puesto
  const devolver = (p) => {
    setDevolviendo(p);
    if (p.estado === "abierta") tomar(p);
    setForm({ ...FORM0, telefono: fmtTel(p.telefono) });
    setClienteFound(null); setClienteHistory([]);
    setTab("llamadas");
    setTimeout(() => searchPhone(fmtTel(p.telefono)), 50);
  };
  const limpiarAtendiendo = () => { setDevolviendo(null); setForm(FORM0); setClienteFound(null); setClienteHistory([]); setTab("perdidas"); };
  // No contestó: nunca cierra sola. 1er intento -> dormida 30 min. 2do -> vuelve a la lista para decidir.
  const noContestoAtendiendo = async () => {
    const p = devolviendo; if (!p) return;
    const n = (p.intentos || 0) + 1;
    await supabase.from("llamadas_perdidas").update({
      intentos: n, ultimo_intento: new Date().toISOString(), estado: "abierta", tomada_por: null, tomada_at: null,
      dormida_hasta: n >= 2 ? null : new Date(Date.now() + 30 * 60000).toISOString()
    }).eq("id", p.id);
    limpiarAtendiendo(); fetchPerdidas();
  };
  // Decisión tras el 2do intento: cerrar como "Devuelta, no contestó"
  const cerrarNoContestoAtendiendo = async () => {
    const p = devolviendo; if (!p) return;
    await supabase.from("llamadas_perdidas").update({ estado: "cerrada", resultado: "no_contesta", cerrada_por: user, cerrada_at: new Date().toISOString() }).eq("id", p.id);
    limpiarAtendiendo(); fetchPerdidas();
  };
  // Ya estaba atendido: el cliente ya había sido atendido o lo resolvió por su cuenta. Sin gestión nueva.
  const yaAtendidoAtendiendo = async () => {
    const p = devolviendo; if (!p) return;
    await supabase.from("llamadas_perdidas").update({ estado: "cerrada", resultado: "ya_atendido", cerrada_por: user, cerrada_at: new Date().toISOString() }).eq("id", p.id);
    limpiarAtendiendo(); fetchPerdidas();
  };
  // No aplica: número equivocado, llamada repetida o basura.
  const noAplicaAtendiendo = async () => {
    const p = devolviendo; if (!p) return;
    await supabase.from("llamadas_perdidas").update({ estado: "cerrada", resultado: "no_aplica", cerrada_por: user, cerrada_at: new Date().toISOString() }).eq("id", p.id);
    limpiarAtendiendo(); fetchPerdidas();
  };
  // Cancelar: la suelta y vuelve a la lista de los dos
  const cancelarAtendiendo = async () => {
    const p = devolviendo; if (!p) return;
    await soltar(p);
    limpiarAtendiendo();
  };

  /* ---------- acciones existentes ---------- */
  const updateStatus = async (id, statusNombre) => {
    const statusId = getStatusId(statusNombre); if (!statusId) return;
    await supabase.from("llamadas").update({ status_id: statusId, resuelto_por: userId }).eq("id", id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: statusNombre, resuelto_por: user } : r));
    setOpenId(null);
  };
  const handleNoContesto = async (id, intentos) => {
    if (intentos >= 1) {
      await supabase.from("llamadas").update({ status_id: getStatusId("no_contesto"), intentos: 2, resuelto_por: userId }).eq("id", id);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "no_contesto", intentos: 2, resuelto_por: user } : r));
    } else {
      const now = new Date().toISOString();
      await supabase.from("llamadas").update({ intentos: 1, last_attempt_at: now }).eq("id", id);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, intentos: 1, last_attempt_at: now } : r));
    }
    setOpenId(null);
  };
  const saveCitaDomicilio = async (id) => {
    const cf = citaForm[id]; if (!cf?.direccion) return;
    const statusId = getStatusId("cita_domicilio"); if (!statusId) return;
    await supabase.from("llamadas").update({ status_id: statusId, direccion: cf.direccion, descripcion_cita: cf.descripcion || null, resuelto_por: userId }).eq("id", id);
    const record = records.find(r => r.id === id);
    if (record?.cliente_id) await supabase.from("clientes").update({ direccion: cf.direccion }).eq("id", record.cliente_id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "cita_domicilio", direccion: cf.direccion, descripcion_cita: cf.descripcion, resuelto_por: user } : r));
    setCitaForm(prev => { const n = { ...prev }; delete n[id]; return n; });
    setShowCitaId(null); setOpenId(null);
  };
  const confirmCita = async (id) => {
    await supabase.from("llamadas").update({ status_id: getStatusId("cita_confirmada") }).eq("id", id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "cita_confirmada" } : r));
  };
  const logout = async () => { await supabase.auth.signOut(); setUserData(null); setRecords([]); };
  const deleteLlamada = async (id) => { if (!confirm("¿Seguro que quieres borrar esta llamada?")) return; await supabase.from("llamadas").delete().eq("id", id); setRecords(prev => prev.filter(r => r.id !== id)); };
  const deleteCliente = async (clienteId, nombre) => {
    if (!confirm("¿Seguro que quieres borrar a " + nombre + " y todas sus llamadas?")) return;
    await supabase.from("llamadas").delete().eq("cliente_id", clienteId);
    await supabase.from("clientes").delete().eq("id", clienteId);
    setRecords(prev => prev.filter(r => r.cliente_id !== clienteId));
  };
  const startEdit = (r) => {
    const mun = municipios.find(m => m.nombre === r.municipio), mod = modelos.find(m => m.nombre === r.modelo), ant = antiguedadList.find(a => a.rango === r.antiguedad), st = statusList.find(s => s.nombre === r.status);
    setEditId(r.id);
    setEditForm({ nombre: r.cliente_nombre, telefono: r.cliente_telefono, municipio_id: mun ? String(mun.id) : "", modelo_id: mod ? String(mod.id) : "", antiguedad_id: ant ? String(ant.id) : "", status_id: st ? String(st.id) : "", problema: r.problema || "", cliente_id: r.cliente_id });
  };
  const saveEdit = async (id) => {
    await supabase.from("clientes").update({ nombre: editForm.nombre, telefono: editForm.telefono }).eq("id", editForm.cliente_id);
    await supabase.from("llamadas").update({ municipio_id: parseInt(editForm.municipio_id), modelo_id: parseInt(editForm.modelo_id), antiguedad_id: editForm.antiguedad_id ? parseInt(editForm.antiguedad_id) : null, problema: editForm.problema || null }).eq("id", id);
    setEditId(null); setEditForm({}); fetchRecords();
  };

  /* ---------- derivados ---------- */
  const pendingCount = records.filter(r => r.status === "pendiente_willy").length;
  const citasCount = records.filter(r => r.status === "cita_domicilio").length;
  // Lo que ve cada uno: las abiertas + las que el mismo esta atendiendo. Las que tomo otro desaparecen de su lista.
  // Visibles: abiertas o la que yo atiendo; se ocultan las dormidas (reintento programado) hasta su hora
  const ahoraMs = Date.now();
  // Si una llamada lleva mas de LOCK_MIN minutos "tomada" sin cerrarse, se considera abandonada y vuelve a la lista de todos.
  const LOCK_MIN = 15;
  const noCerradas = perdidas.filter(p => {
    const abandonada = p.estado === "tomada" && (!p.tomada_at || (ahoraMs - new Date(p.tomada_at).getTime()) > LOCK_MIN * 60000);
    return p.estado === "abierta" || p.tomada_por === user || abandonada;
  });
  // Nuevas: nunca se han llamado. Reintento: ya se les llamo y no contestaron (dormidas o listas para decidir).
  const perdidasNuevas = noCerradas.filter(p => (p.intentos || 0) === 0);
  const perdidasReintento = noCerradas
    .filter(p => (p.intentos || 0) >= 1)
    .sort((a, b) => ((b.intentos || 0) >= 2 ? 1 : 0) - ((a.intentos || 0) >= 2 ? 1 : 0));
  const perdidasVisibles = noCerradas;
  const perdidasCount = perdidasVisibles.length;

  // Una fila de la lista de perdidas (se reusa en Nuevas y en Reintento)
  const filaPerdida = (p) => {
    const mia = p.tomada_por === user;
    const decidir = (p.intentos || 0) >= 2 && p.estado !== "cerrada";
    const dormida = p.dormida_hasta && new Date(p.dormida_hasta).getTime() > ahoraMs;
    const minsFalta = dormida ? Math.max(1, Math.ceil((new Date(p.dormida_hasta).getTime() - ahoraMs) / 60000)) : 0;
    const urgente = decidir || (!dormida && (Date.now() - new Date(p.primera_llamada).getTime()) > 15 * 60000 && p.estado === "abierta");
    return (
      <div key={p.id} style={{ ...S.card, borderColor: urgente ? "#FCA5A5" : C.line }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtTel(p.telefono)}</div>
            {p.nombre_cid && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{p.nombre_cid}</div>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              <span style={S.pill(p.tiene_voicemail ? C.violetBg : C.amberBg, p.tiene_voicemail ? C.violet : C.amber)}>{p.tiene_voicemail ? `Voicemail${p.voicemail_seg ? ` · ${p.voicemail_seg}s` : ""}` : "Perdida"}</span>
              {p.veces > 1 && <span style={S.pill(C.redBg, C.red)}>Llamó {p.veces} veces</span>}
              {decidir && <span style={S.pill(C.redBg, C.red)}>{p.intentos} intentos · decidir</span>}
              {!decidir && dormida && <span style={S.pill(C.amberBg, C.amber)}>{p.intentos} {p.intentos === 1 ? "intento" : "intentos"} · vuelve en {minsFalta} min</span>}
              {!decidir && !dormida && p.intentos > 0 && <span style={S.pill(C.slateBg, C.text)}>{p.intentos} {p.intentos === 1 ? "intento" : "intentos"} sin contestar</span>}
              {mia && <span style={S.pill(C.greenBg, C.green)}>La estás atendiendo</span>}
              {p.cola && <span style={S.pill(C.slateBg, C.muted)}>{p.cola.replace("MRY-PR_", "")}</span>}
            </div>
            {p.voicemail_url && (
              <div style={{ marginTop: 10, maxWidth: 380 }}>
                {audioUrls[p.id] ? <audio controls src={audioUrls[p.id]} style={{ width: "100%", height: 36 }} /> :
                  <button onClick={() => urlAudio(p)} style={{ ...S.btn("ghost"), padding: "9px 14px", fontSize: 13, width: "auto" }}>Escuchar voicemail</button>}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: urgente ? C.red : C.text }}>{hace(p.ultima_llamada)}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{fmtDate(p.ultima_llamada)}</div>
            </div>
            {mia
              ? <button onClick={() => (devolviendo && devolviendo.id === p.id) ? setTab("llamadas") : devolver(p)} style={{ ...S.btn("ghost"), padding: "11px 18px", fontSize: 14, width: "auto" }}>Continuar</button>
              : <button onClick={() => devolver(p)} style={{ ...S.btn(decidir ? "red" : "primary"), padding: "11px 18px", fontSize: 14, width: "auto" }}>{decidir ? "Decidir" : (p.intentos ? "Reintentar" : "Atender")}</button>}
          </div>
        </div>
      </div>
    );
  };
  const myResolved = records.filter(r => r.resuelto_por === user).length;

  let tabs = [];
  if (role === "tech") tabs = ["queue", "citas", "stats", "historial"];
  else if (role === "admin") tabs = ["dashboard", "llamadas", "perdidas", "queue", "citas", "stats", "historial"];
  else tabs = ["llamadas", "perdidas", "queue", "citas", "historial"]; // agent, recepcion o cualquier otro rol
  if (user === "Carlos" && !tabs.includes("dashboard")) tabs = ["dashboard", ...tabs];
  const tabLabels = { llamadas: "Nueva llamada", perdidas: "Por devolver", queue: "Queue", citas: "Citas", historial: "Historial", dashboard: "Dashboard", stats: "Estadísticas" };
  const tabBadge = { perdidas: perdidasCount, queue: pendingCount, citas: citasCount };


  /* =================================================================
     RENDER
     ================================================================= */
  const hoyRecs = records.filter(r => isToday(r.created_at));
  const hoyMias = hoyRecs.filter(r => r.registrado_por === user || r.resuelto_por === user).length;
  const hoyResueltas = hoyRecs.filter(r => r.status === "atendido_resuelto").length;
  const rolTxt = role === "admin" ? "Administración" : role === "tech" ? "Técnico" : "Servicio al cliente";

  const Nav = ({ mobile }) => tabs.map(t => {
    const n = tabBadge[t] || 0, on = tab === t;
    if (mobile) return (
      <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 14px", borderRadius: 999, border: `1px solid ${on ? C.navy : C.line}`, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", background: on ? C.navy : "#fff", color: on ? "#fff" : C.text, fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {tabLabels[t]}{n > 0 && <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", background: t === "perdidas" ? C.red : (on ? "rgba(255,255,255,.25)" : C.slateBg), color: t === "perdidas" || on ? "#fff" : C.text }}>{n}</span>}
      </button>
    );
    return (
      <button key={t} className={`nav-a${on ? " on" : ""}`} onClick={() => setTab(t)}>
        <span>{tabLabels[t]}</span>{n > 0 && <span className={`nav-n${t === "perdidas" ? " red" : ""}`}>{n}</span>}
      </button>
    );
  });

  const Banner = () => aviso && (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, background: C.navyDark, color: "#fff", animation: "bajar .25s ease-out", maxWidth: 520, minWidth: 0 }}>
      <div style={{ width: 9, height: 9, borderRadius: 5, background: "#F87171", animation: "latir 1.4s infinite", flexShrink: 0 }} />
      <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <b>{aviso.tiene_voicemail ? "Voicemail" : aviso.tipo === "repite" ? `Volvió a llamar (${aviso.veces})` : "Llamada perdida"}</b> · {fmtTel(aviso.telefono)}{aviso.nombre_cid ? ` · ${aviso.nombre_cid}` : ""}
      </div>
      <button onClick={() => { setTab("perdidas"); setAviso(null); }} style={{ ...S.small, background: "#fff", color: C.navy, border: "none", padding: "5px 10px" }}>Ver</button>
      <button onClick={() => setAviso(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 18, cursor: "pointer", padding: "0 2px" }}>×</button>
    </div>
  );

  return (
    <div className="shell" style={{ fontFamily: FONT, color: C.ink }}>
      <GlobalCss />

      {/* ---- menu lateral (computadora) ---- */}
      <aside className="side">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", color: C.navy, fontWeight: 600, display: "grid", placeItems: "center" }}>M</div>
          <div><div style={{ fontSize: 15, fontWeight: 600 }}>MareyApp</div><div style={{ fontSize: 11, opacity: .7 }}>{rolTxt}</div></div>
        </div>
        <nav><Nav /></nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.14)" }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: "#d98a1f", display: "grid", placeItems: "center", fontWeight: 600 }}>{user[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{user}</div><div style={{ fontSize: 11, opacity: .7 }}>{myResolved} atendidas</div></div>
          <button onClick={logout} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Salir</button>
        </div>
      </aside>

      <div className="main">
        {/* ---- barra superior ---- */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div className="mtabs-logo" style={{ width: 30, height: 30, borderRadius: 9, background: C.navy, color: "#fff", fontWeight: 600, display: "grid", placeItems: "center", fontSize: 13 }}>M</div>
            <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{tabLabels[tab]}</div>
          </div>
          <div style={{ flex: 1 }} />
          <Banner />
          <button onClick={logout} className="solo-movil" style={S.small}>Salir</button>
        </div>
        {/* ---- pestanas (celular) ---- */}
        <div className="mtabs"><Nav mobile /></div>

        <div className="content">

      {/* ============ NUEVA LLAMADA ============ */}
      {tab === "llamadas" && (
        <div className="two">
          <div>
            {devolviendo && (
              <div style={{ ...S.card, background: C.amberBg, borderColor: "#FCD34D", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>Atendiendo llamada perdida{devolviendo.tiene_voicemail ? " · voicemail" : ""}</div>
                  <div style={{ fontSize: 13, color: C.amber }}>{fmtTel(devolviendo.telefono)}{devolviendo.nombre_cid ? ` · ${devolviendo.nombre_cid}` : ""} · llamó {devolviendo.veces} {devolviendo.veces === 1 ? "vez" : "veces"}{devolviendo.intentos ? ` · ${devolviendo.intentos} ${devolviendo.intentos === 1 ? "intento" : "intentos"} sin contestar` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {(devolviendo.intentos || 0) >= 2
                    ? <span className="tipw"><button onClick={() => cerrarNoContestoAtendiendo()} style={{ ...S.btn("red"), padding: "9px 14px", fontSize: 13, width: "auto" }}>Cerrar · no contestó</button><span className="tip">Se intentó <b>2 veces</b> y el cliente no contestó. Se cierra como <b>Devuelta, no contestó</b>.</span></span>
                    : <span className="tipw"><button onClick={() => noContestoAtendiendo()} style={{ ...S.btn("amber"), padding: "9px 14px", fontSize: 13, width: "auto" }}>No contestó</button><span className="tip">El cliente no cogió. <b>1er intento:</b> vuelve dormida 30 min. <b>2do intento:</b> queda para decidir.</span></span>}
                  <span className="tipw"><button onClick={() => yaAtendidoAtendiendo()} style={{ ...S.btn("green"), padding: "9px 14px", fontSize: 13, width: "auto" }}>Ya estaba atendido</button><span className="tip">El cliente <b>ya había sido atendido</b> o lo resolvió por su cuenta. Se cierra como contactado, sin gestión nueva.</span></span>
                  <span className="tipw"><button onClick={() => noAplicaAtendiendo()} style={{ ...S.btn("ghost"), padding: "9px 14px", fontSize: 13, width: "auto" }}>No aplica</button><span className="tip">Número equivocado, llamada repetida o basura. Se descarta.</span></span>
                  <button onClick={() => cancelarAtendiendo()} style={{ background: "none", border: "none", color: C.amber, fontSize: 13, cursor: "pointer", fontFamily: FONT, padding: "0 4px", textDecoration: "underline" }}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={S.card}>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Teléfono</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...S.input, fontSize: 21, fontWeight: 500, fontVariantNumeric: "tabular-nums", height: 54, paddingRight: clienteFound ? 200 : 14 }} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} onBlur={e => searchPhone(e.target.value)} placeholder="787-000-0000" inputMode="tel" autoFocus />
                  {searching && <span style={{ position: "absolute", right: 14, top: 20, fontSize: 12, color: C.faint }}>Buscando...</span>}
                  {!searching && clienteFound && <span style={{ position: "absolute", right: 12, top: 15, ...S.pill(C.greenBg, C.green), padding: "6px 10px" }}>Cliente conocido · {clienteHistory.length} llamada{clienteHistory.length !== 1 ? "s" : ""}</span>}
                </div>
              </div>
              {clienteFound && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{clienteFound.nombre}{clienteHistory[0]?.municipio ? ` · ${clienteHistory[0].municipio}` : ""}{clienteHistory[0]?.modelo ? ` · ${clienteHistory[0].modelo}` : ""}</div>
                  {clienteFound.direccion && <div style={{ fontSize: 12, color: C.green, marginTop: 2 }}>{clienteFound.direccion}</div>}
                  {clienteHistory.slice(0, 4).map(h => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: C.green, padding: "6px 0 0" }}>
                      <span>{fmtDate(h.created_at)} — {h.problema || "Sin problema"}</span><Badge status={h.status} centro={h.centro_dirigido} />
                    </div>
                  ))}
                </div>
              )}
              <div className="row2">
                <div><label style={S.label}>Nombre</label><input style={S.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del cliente" /></div>
                <SearchSelect label="Pueblo" value={form.municipio_id} onChange={v => setForm({ ...form, municipio_id: v })} groups={munGroups} placeholder="Escribe para buscar pueblo" />
                <SearchSelect label="Modelo" value={form.modelo_id} onChange={v => setForm({ ...form, modelo_id: v })} groups={modelGroups} placeholder="Escribe para buscar modelo" />
                <div>
                  <label style={S.label}>Tiempo con la unidad</label>
                  <select style={{ ...S.input, appearance: "auto", cursor: "pointer" }} value={form.antiguedad_id} onChange={e => setForm({ ...form, antiguedad_id: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {antiguedadList.map(a => <option key={a.id} value={a.id}>{a.rango}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}><label style={S.label}>Problema</label><input style={S.input} value={form.problema} onChange={e => setForm({ ...form, problema: e.target.value })} placeholder="Breve descripción" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 18 }}>
                <Stat label="Llamadas hoy" value={hoyRecs.length} tone="slate" />
                <Stat label="Resueltas hoy" value={hoyResueltas} tone="slate" />
                <Stat label="Por devolver" value={perdidasCount} tone={perdidasCount > 0 ? "amber" : "slate"} />
              </div>
            </div>
          </div>

          <div className="sticky">
            <div style={{ ...S.card, padding: 16 }}>
              <div style={{ ...S.label, marginBottom: 12 }}>¿Qué pasó con la llamada?</div>
              {saved ? (
                <div style={{ padding: "22px 10px", borderRadius: 12, background: C.greenBg, color: C.green, fontWeight: 600, textAlign: "center", fontSize: 16 }}>Guardado</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Se resolvió", "por teléfono", "primary", () => saveCallWith("atendido_resuelto", null), "El problema se resolvió en la misma llamada." + (devolviendo ? " La perdida queda como Devuelta y atendida." : "")],
                    ["Enviado a San Juan", "", "green", () => saveCallWith("dirigido", "San Juan"), "El cliente va al centro de servicio de San Juan." + (devolviendo ? " La perdida queda como Devuelta y atendida." : "")],
                    ["Enviado a San Germán", "", "blue", () => saveCallWith("dirigido", "San Germán"), "El cliente va al centro de servicio de San Germán." + (devolviendo ? " La perdida queda como Devuelta y atendida." : "")],
                    ["Referido a técnicos", "entra al Queue", "amber", () => saveCallWith("pendiente_willy", null), "El caso entra al Queue de los técnicos para que lo llamen." + (devolviendo ? " La perdida queda como Devuelta · pendiente técnico." : "")],
                  ].map(([t, sub, kind, fn, tip]) => (
                    <span key={t} className="tipw" style={{ display: "block" }}>
                      <button onClick={fn} disabled={!canSave} style={{ ...S.btn(canSave ? kind : "disabled"), height: 56, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{t}</span>{sub && <span style={{ fontSize: 11, fontWeight: 600, opacity: .8 }}>{sub}</span>}
                      </button>
                      <span className="tip">{tip}</span>
                    </span>
                  ))}
                  <div style={{ fontSize: 12, color: C.faint, textAlign: "center", marginTop: 2 }}>{canSave ? "Toca una para guardar" : "Se activan cuando el formulario está completo"}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ POR DEVOLVER (llamadas perdidas) ============ */}
      {tab === "perdidas" && (
        <div className="two">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: C.muted, minHeight: 18 }}>{sync.msg}</div>
              <button onClick={sincronizar} disabled={sync.busy} style={{ ...S.btn("ghost"), padding: "9px 14px", fontSize: 13, width: "auto", opacity: sync.busy ? 0.6 : 1 }}>{sync.busy ? "Revisando..." : "Actualizar"}</button>
            </div>
            {perdidasVisibles.length === 0 && <Empty titulo="Todo devuelto" texto="Cuando entre una llamada perdida o un voicemail aparece aquí y suena un aviso." />}

            {perdidasNuevas.length > 0 && (
              <>
                <SecHead dot={C.amber} t="Nuevas" n={perdidasNuevas.length} d="Perdidas y voicemails que todavía nadie ha devuelto." />
                {perdidasNuevas.map(filaPerdida)}
              </>
            )}

            {perdidasReintento.length > 0 && (
              <div style={{ marginTop: perdidasNuevas.length ? 20 : 0 }}>
                <SecHead dot={C.red} t="Se llamó · el cliente no contestó" n={perdidasReintento.length} d="Ya se les devolvió la llamada y no contestaron · esperan el 2do intento o una decisión." />
                {perdidasReintento.map(filaPerdida)}
              </div>
            )}

            {perdidasCerradas.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SecHead dot={C.green} t="Atendidas · últimos 7 días" n={perdidasCerradas.length} d="Devueltas y cerradas." />
                {perdidasCerradas.map(p => {
                  const res = { atendida: ["Devuelta y atendida", C.greenBg, C.green], contestada: ["Devuelta y atendida", C.greenBg, C.green], pendiente_tecnico: ["Devuelta · pendiente técnico", C.amberBg, C.amber], ya_atendido: ["Ya estaba atendido", C.violetBg, C.violet], no_contesta: ["Devuelta, no contestó", C.redBg, C.red], spam: ["No aplica", C.slateBg, C.text], no_aplica: ["No aplica", C.slateBg, C.text] }[p.resultado] || [p.resultado, C.slateBg, C.text];
                  return (
                    <div key={p.id} style={{ ...S.card, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 13 }}><b>{fmtTel(p.telefono)}</b> <span style={{ color: C.muted }}>· {p.cerrada_por || "—"}{p.minutos_respuesta != null ? ` · ${Math.round(p.minutos_respuesta)} min` : ""}{p.intentos ? ` · ${p.intentos} intentos` : ""} · {fmtDate(p.cerrada_at)}</span></div>
                      <span style={S.pill(res[1], res[2])}>{res[0]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky">
            <MetricasHoy perdidas={perdidas} cerradas={perdidasCerradas} />
            <div style={{ ...S.card }}>
              <div style={{ ...S.label, marginBottom: 8 }}>Regla</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>Una sola fila por número. Si vuelve a llamar o deja voicemail, se suma a la misma. Se cierra al registrar la llamada devuelta, o a los 3 intentos sin contestar.</div>
            </div>
          </div>
        </div>
      )}

      {/* ============ QUEUE ============ */}
      {tab === "queue" && (
        <div>
          <div style={S.h2}>Queue</div>
          <TimeFilter value={filters.queue} onChange={v => setF("queue", v)} dateRange={ranges.queue} onDateRange={v => setR("queue", v)} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status === "pendiente_willy"), filters.queue, ranges.queue).sort((a, b) => new Date(a.last_attempt_at || a.created_at) - new Date(b.last_attempt_at || b.created_at));
            if (!filtered.length) return <Empty titulo="Todo al día" />;
            return filtered.map(r => {
              const hrs = hrsLeft(r.last_attempt_at || r.created_at), urgent = parseInt(hrs) < 6, open = openId === r.id;
              return (
                <div key={r.id} style={{ ...S.card, borderColor: urgent ? "#FCA5A5" : C.line }}>
                  <div onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 600 }}>{r.cliente_nombre}</div>
                      <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{fmtTel(r.cliente_telefono)} · {r.municipio} · {r.modelo}</div>
                      {r.problema && <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{r.problema}</div>}
                      {r.antiguedad && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Tiempo con la unidad: {r.antiguedad}</div>}
                      {r.intentos > 0 && <div style={{ marginTop: 6 }}><span style={S.pill(C.redBg, C.red)}>Intento {r.intentos} de 2</span></div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={S.pill(urgent ? C.redBg : C.amberBg, urgent ? C.red : C.amber)}>{hrs} h</span>
                      <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>{r.registrado_por}</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      {showCitaId === r.id ? (
                        <>
                          <div><label style={S.label}>Dirección del cliente</label><input style={S.input} value={(citaForm[r.id] || {}).direccion || ""} onChange={e => setCitaForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), direccion: e.target.value } }))} placeholder="Dirección completa" /></div>
                          <div><label style={S.label}>Trabajo a realizar</label><input style={S.input} value={(citaForm[r.id] || {}).descripcion || ""} onChange={e => setCitaForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), descripcion: e.target.value } }))} placeholder="Descripción breve" /></div>
                          <button onClick={() => saveCitaDomicilio(r.id)} disabled={!(citaForm[r.id] || {}).direccion} style={S.btn((citaForm[r.id] || {}).direccion ? "blue" : "disabled")}>Confirmar cita</button>
                          <button onClick={() => { setShowCitaId(null); setCitaForm(prev => { const n = { ...prev }; delete n[r.id]; return n; }); }} style={S.btn("ghost")}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => updateStatus(r.id, "atendido_resuelto")} style={S.btn("green")}>Resuelto</button>
                          <button onClick={() => updateStatus(r.id, "atendido_cita_marey")} style={S.btn("violet")}>Se citó a Marey</button>
                          <button onClick={() => setShowCitaId(r.id)} style={S.btn("blue")}>Cita a domicilio</button>
                          <button onClick={() => handleNoContesto(r.id, r.intentos || 0)} style={S.btn("ghost")}>No contestó{r.intentos > 0 ? " · último intento" : ""}</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ============ CITAS ============ */}
      {tab === "citas" && (
        <div>
          <div style={S.h2}>Citas a domicilio</div>
          <TimeFilter value={filters.citas} onChange={v => setF("citas", v)} dateRange={ranges.citas} onDateRange={v => setR("citas", v)} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status === "cita_domicilio" || r.status === "cita_confirmada"), filters.citas, ranges.citas)
              .sort((a, b) => (a.status === "cita_domicilio" ? 0 : 1) - (b.status === "cita_domicilio" ? 0 : 1));
            if (!filtered.length) return <Empty titulo="No hay citas en este período" />;
            return filtered.map(r => (
              <div key={r.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{r.cliente_nombre}</div>
                    <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{fmtTel(r.cliente_telefono)} · {r.municipio}</div>
                    <div style={{ fontSize: 14, color: C.text }}>{r.modelo}{r.problema ? ` · ${r.problema}` : ""}</div>
                    {r.direccion && <div style={{ fontSize: 14, color: C.ink, marginTop: 6 }}>{r.direccion}</div>}
                    {r.descripcion_cita && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Trabajo: {r.descripcion_cita}</div>}
                    <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>{r.registrado_por} · {fmtDate(r.created_at)}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
                {r.status === "cita_domicilio" && user === "Anthony" && <button onClick={() => confirmCita(r.id)} style={{ ...S.btn("amber"), marginTop: 12 }}>Confirmar en Planner</button>}
                {r.status === "cita_domicilio" && user !== "Anthony" && <div style={{ marginTop: 12, padding: "10px", borderRadius: 12, background: C.amberBg, color: C.amber, fontSize: 13, fontWeight: 600, textAlign: "center" }}>Pendiente de confirmar</div>}
                {role === "admin" && <button onClick={() => deleteLlamada(r.id)} style={{ ...S.small, marginTop: 10, color: C.red }}>Borrar cita</button>}
              </div>
            ));
          })()}
        </div>
      )}

      {/* ============ ESTADISTICAS ============ */}
      {tab === "stats" && (
        <div>
          <div style={S.h2}>Estadísticas por técnico</div>
          <TimeFilter value={filters.stats} onChange={v => setF("stats", v)} dateRange={ranges.stats} onDateRange={v => setR("stats", v)} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.resuelto_por), filters.stats, ranges.stats);
            const by = {};
            filtered.forEach(r => {
              const u = by[r.resuelto_por] = by[r.resuelto_por] || { total: 0, resueltas: 0, citados: 0, domicilio: 0, no: 0 };
              u.total++;
              if (r.status === "atendido_resuelto") u.resueltas++;
              if (r.status === "atendido_cita_marey") u.citados++;
              if (r.status === "cita_domicilio" || r.status === "cita_confirmada") u.domicilio++;
              if (r.status === "no_contesto") u.no++;
            });
            const sorted = Object.entries(by).sort((a, b) => b[1].total - a[1].total);
            if (!sorted.length) return <Empty titulo="Sin datos en este período" />;
            return sorted.map(([nombre, s]) => (
              <div key={nombre} style={{ ...S.card, borderColor: nombre === user ? C.navy : C.line }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{nombre}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: C.navy }}>{s.total}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[["Resueltas", s.resueltas, C.greenBg, C.green], ["Citados", s.citados, C.violetBg, C.violet], ["Domicilio", s.domicilio, C.amberBg, C.amber], ["No contestó", s.no, C.redBg, C.red]].map(([l, v, b, c]) => (
                    <div key={l} style={{ padding: "10px 6px", borderRadius: 12, background: b, textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: c }}>{v}</div><div style={{ fontSize: 11, color: c, fontWeight: 600 }}>{l}</div></div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ============ HISTORIAL ============ */}
      {tab === "historial" && (
        <div>
          <div style={S.h2}>Historial</div>
          <TimeFilter value={filters.hist} onChange={v => setF("hist", v)} dateRange={ranges.hist} onDateRange={v => setR("hist", v)} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status !== "pendiente_willy"), filters.hist, ranges.hist).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            if (!filtered.length) return <Empty titulo="No hay registros en este período" />;
            return filtered.map(r => {
              let label = (STATUS[r.status] || { t: r.status }).t;
              if (r.status === "dirigido" && r.centro_dirigido) label = "Dirigido a " + r.centro_dirigido;
              if (r.status === "no_contesto" && r.intentos) label = `No contestó (${r.intentos})`;
              const s = STATUS[r.status] || { c: C.muted, b: C.slateBg };
              return (
                <div key={r.id} style={{ ...S.card, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{r.cliente_nombre}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{fmtTel(r.cliente_telefono)} · {r.municipio} · {r.modelo}{r.antiguedad ? ` · ${r.antiguedad}` : ""}</div>
                      <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{r.registrado_por}{r.resuelto_por ? ` · atendido por ${r.resuelto_por}` : ""}</div>
                      {role === "admin" && (
                        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button onClick={() => startEdit(r)} style={S.small}>Editar</button>
                          <button onClick={() => deleteLlamada(r.id)} style={{ ...S.small, color: C.red }}>Borrar llamada</button>
                          <button onClick={() => deleteCliente(r.cliente_id, r.cliente_nombre)} style={{ ...S.small, color: C.red }}>Borrar cliente</button>
                        </div>
                      )}
                      {editId === r.id && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12, background: C.slateBg }}>
                          <div><label style={S.label}>Nombre</label><input style={S.input} value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} /></div>
                          <div><label style={S.label}>Teléfono</label><input style={S.input} value={editForm.telefono} onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} /></div>
                          <SearchSelect label="Pueblo" value={editForm.municipio_id} onChange={v => setEditForm({ ...editForm, municipio_id: v })} groups={munGroups} placeholder="Buscar pueblo" />
                          <SearchSelect label="Modelo" value={editForm.modelo_id} onChange={v => setEditForm({ ...editForm, modelo_id: v })} groups={modelGroups} placeholder="Buscar modelo" />
                          <div><label style={S.label}>Tiempo con la unidad</label>
                            <select style={{ ...S.input, appearance: "auto" }} value={editForm.antiguedad_id} onChange={e => setEditForm({ ...editForm, antiguedad_id: e.target.value })}>
                              <option value="">Seleccionar</option>{antiguedadList.map(a => <option key={a.id} value={a.id}>{a.rango}</option>)}
                            </select></div>
                          <div><label style={S.label}>Problema</label><input style={S.input} value={editForm.problema} onChange={e => setEditForm({ ...editForm, problema: e.target.value })} /></div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveEdit(r.id)} style={S.btn("primary")}>Guardar</button>
                            <button onClick={() => { setEditId(null); setEditForm({}); }} style={S.btn("ghost")}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={S.pill(s.b, s.c)}>{label}</span>
                      <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>{fmtDate(r.created_at)}</div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ============ DASHBOARD ============ */}
      {tab === "dashboard" && (
        <div>
          <div style={S.h2}>Dashboard</div>
          <TimeFilter value={filters.dash} onChange={v => setF("dash", v)} dateRange={ranges.dash} onDateRange={v => setR("dash", v)} />
          {(() => {
            const filtered = filterByTime(records, filters.dash, ranges.dash);
            const by = {}, byP = {};
            filtered.forEach(r => { by[r.status] = (by[r.status] || 0) + 1; byP[r.municipio] = (byP[r.municipio] || 0) + 1; });
            const pueblos = Object.entries(byP).sort((a, b) => b[1] - a[1]);
            const maxP = pueblos[0] ? pueblos[0][1] : 1;
            const m = metricasPerd;
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  <Stat label="Total" value={filtered.length} />
                  <Stat label="Resueltas" value={by.atendido_resuelto || 0} tone="green" />
                  <Stat label="Pendientes" value={by.pendiente_willy || 0} tone="amber" />
                  <Stat label="San Juan" value={filtered.filter(r => r.status === "dirigido" && r.centro_dirigido === "San Juan").length} tone="green" />
                  <Stat label="San Germán" value={filtered.filter(r => r.status === "dirigido" && r.centro_dirigido === "San Germán").length} tone="blue" />
                  <Stat label="Citados Marey" value={by.atendido_cita_marey || 0} tone="violet" />
                  <Stat label="Cita domicilio" value={(by.cita_domicilio || 0) + (by.cita_confirmada || 0)} tone="amber" />
                  <Stat label="No contestaron" value={by.no_contesto || 0} tone="red" />
                </div>

                <div style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Llamadas perdidas</div>
                    <div style={S.sub}>{m ? `${m.pct_devueltas}% devueltas` : ""}</div>
                  </div>
                  {!m ? <div style={S.sub}>Cargando...</div> : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        <Stat label="Entraron" value={m.total} tone="slate" />
                        <Stat label="Perdidas" value={m.perdidas} tone="slate" />
                        <Stat label="Voicemail" value={m.voicemails} tone="slate" />
                        <Stat label="Devueltas" value={m.devueltas} tone="green" sub={m.min_respuesta != null ? `${m.min_respuesta} min prom.` : ""} />
                        <Stat label="Atendidas" value={m.atendidas} tone="green" />
                        <Stat label="Pendiente técnico" value={m.pendiente_tecnico} tone="amber" />
                        <Stat label="Ya estaba atendido" value={m.ya_atendido} tone="slate" />
                        <Stat label="No contestaron" value={m.no_contestaron} tone="red" />
                        <Stat label="Abiertas" value={m.abiertas} tone={m.abiertas > 0 ? "amber" : "slate"} />
                      </div>
                      {(() => {
                        const partes = [];
                        partes.push(`Entraron ${m.total === 1 ? "1 llamada perdida" : m.total + " llamadas perdidas"}${m.voicemails ? ` (${m.voicemails} con voicemail)` : ""}.`);
                        if (m.devueltas) {
                          const sub = [];
                          if (m.atendidas) sub.push(`${m.atendidas} se resolvieron o se enviaron a un centro`);
                          if (m.pendiente_tecnico) sub.push(`${m.pendiente_tecnico} pasaron a técnicos`);
                          if (m.ya_atendido) sub.push(`${m.ya_atendido} ya no necesitaban ayuda`);
                          partes.push(`Se les devolvió la llamada a ${m.devueltas} (${m.pct_devueltas}%)${sub.length ? ": " + sub.join(", ") : ""}.`);
                        }
                        if (m.no_contestaron) partes.push(`A ${m.no_contestaron} se les llamó y no contestaron.`);
                        if (m.spam) partes.push(`${m.spam} no aplicaban (número malo, repetida o basura).`);
                        if (m.abiertas) partes.push(`${m.abiertas === 1 ? "Queda 1 llamada" : "Quedan " + m.abiertas + " llamadas"} sin devolver.`);
                        return <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{partes.join(" ")}</div>;
                      })()}
                    </>
                  )}
                </div>

                <div style={{ ...S.card }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Por pueblo</div>
                  {pueblos.map(([pueblo, count]) => (
                    <div key={pueblo} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 96, fontSize: 13, color: C.muted, textAlign: "right", flexShrink: 0 }}>{pueblo}</div>
                      <div style={{ flex: 1, height: 22, background: C.slateBg, borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: (count / maxP * 100) + "%", height: "100%", background: C.navy, borderRadius: 6, minWidth: 26, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

/* ---------- metricas del dia (columna derecha de Por devolver) ---------- */
function MetricasHoy({ perdidas, cerradas }) {
  const hoyAb = perdidas.filter(p => isToday(p.primera_llamada));
  const hoyCe = cerradas.filter(p => isToday(p.primera_llamada));
  const todas = [...hoyAb, ...hoyCe];
  const entraron = todas.length;

  // Clasificacion por resultado
  const esNoAplica  = p => p.resultado === "no_aplica" || p.resultado === "spam";
  const esContactada = p => p.resultado === "atendida" || p.resultado === "contestada" || p.resultado === "pendiente_tecnico" || p.resultado === "ya_atendido";
  const esDevuelta  = p => esContactada(p) || p.resultado === "no_contesta"; // se hizo el intento de llamar de vuelta

  const noAplica    = hoyCe.filter(esNoAplica).length;        // numero malo / repetida / basura
  const reales      = entraron - noAplica;                    // lo que de verdad habia que devolver
  const devueltas   = hoyCe.filter(esDevuelta).length;        // se les llamo de vuelta (incluye no contesto)
  const contactadas = hoyCe.filter(esContactada).length;      // el cliente cogio
  const noCont      = hoyCe.filter(p => p.resultado === "no_contesta").length;

  const conMin = hoyCe.filter(p => esContactada(p) && p.minutos_respuesta != null);
  const prom = conMin.length ? Math.round(conMin.reduce((a, p) => a + p.minutos_respuesta, 0) / conMin.length) : null;

  const pctDev  = reales ? Math.round(devueltas / reales * 100) : 0;       // esfuerzo del equipo
  const pctCont = devueltas ? Math.round(contactadas / devueltas * 100) : 0; // de las llamadas, cuantas cogieron

  // Por persona: lo que hizo cada uno
  const porPersona = {};
  hoyCe.forEach(p => {
    if (!p.cerrada_por) return;
    const q = porPersona[p.cerrada_por] || (porPersona[p.cerrada_por] = { dev: 0, cont: 0, min: 0, noc: 0, na: 0 });
    if (esNoAplica(p)) { q.na++; return; }
    if (esDevuelta(p)) q.dev++;
    if (esContactada(p)) { q.cont++; if (p.minutos_respuesta != null) q.min += p.minutos_respuesta; }
    if (p.resultado === "no_contesta") q.noc++;
  });
  const personas = Object.entries(porPersona).sort((a, b) => b[1].dev - a[1].dev);

  const Row = ({ l, sub, v, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.slateBg}` }}>
      <span style={{ fontSize: 13, color: C.text }}>{l}{sub && <small style={{ display: "block", fontSize: 11, color: C.faint, fontWeight: 400, marginTop: 1 }}>{sub}</small>}</span>
      <b style={{ fontSize: 15, fontVariantNumeric: "tabular-nums", color: color || C.ink }}>{v}</b>
    </div>
  );
  const Cell = ({ num, cap, pct }) => (
    <div style={{ flex: 1, borderRadius: 12, padding: "14px 8px", textAlign: "center", background: C.greenBg }}>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: C.green, fontVariantNumeric: "tabular-nums" }}>{num}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.green, marginTop: 6 }}>{cap}</div>
      {pct != null && <div style={{ fontSize: 11, color: C.green, marginTop: 2, opacity: .85 }}>{pct}</div>}
    </div>
  );
  const Bar = ({ t, frac, pct, color }) => (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 5 }}><span>{t}</span><span><b style={{ color: C.text }}>{frac}</b> · {pct}%</span></div>
      <div style={{ height: 9, borderRadius: 5, background: C.slateBg, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 5, background: color }} /></div>
    </div>
  );
  const Chip = ({ t, tone }) => {
    const m = { g: [C.greenBg, C.green], s: [C.slateBg, C.text], a: [C.amberBg, C.amber] }[tone] || [C.slateBg, C.text];
    return <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: m[0], color: m[1] }}>{t}</span>;
  };

  return (
    <div style={S.card}>
      <div style={{ ...S.label, marginBottom: 6 }}>Hoy</div>

      <div style={{ display: "flex", gap: 10, margin: "2px 0 12px" }}>
        <Cell num={devueltas} cap="Devueltas" pct={`${devueltas}/${reales} · ${pctDev}%`} />
        <Cell num={contactadas} cap="Contactadas" pct={`${contactadas}/${devueltas} · ${pctCont}%`} />
      </div>

      <Row l="Entraron" v={entraron} />
      <Row l="No aplican" sub="número malo / repetida / basura" v={noAplica} color={C.muted} />
      <Row l="Reales por devolver" v={reales} />
      <Row l="Devueltas" sub="se les llamó de vuelta" v={devueltas} color={C.green} />
      <Row l="Contactadas" sub="el cliente cogió" v={contactadas} color={C.green} />
      <Row l="No contestó" sub="el cliente no cogió" v={noCont} color={C.amber} />
      <Row l="Tiempo de respuesta" v={prom != null ? `${prom} min` : "—"} />

      <Bar t="Devueltas" frac={`${devueltas}/${reales}`} pct={pctDev} color={C.green} />
      <Bar t="Contactó al cliente" frac={`${contactadas}/${devueltas}`} pct={pctCont} color={C.navy} />

      {personas.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Quién atendió</div>
          {personas.map(([n, q]) => (
            <div key={n} style={{ padding: "11px 0", borderBottom: `1px solid ${C.slateBg}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{n}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{q.cont ? `${Math.round(q.min / q.cont)} min prom.` : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <Chip t={`${q.dev} devuelta${q.dev !== 1 ? "s" : ""}`} tone="g" />
                <Chip t={`${q.cont} contactó`} tone={q.cont ? "g" : "s"} />
                {q.noc > 0 && <Chip t={`${q.noc} no contestó`} tone="a" />}
                {q.na > 0 && <Chip t={`${q.na} no aplica`} tone="s" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
