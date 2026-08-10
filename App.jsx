import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://srxlotxroshssnyrufgq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeGxvdHhyb3Noc3NueXJ1ZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5ODM4MTIsImV4cCI6MjA5ODU1OTgxMn0.Yh2HeOGkAB4krgsGLcszpAVOBuUeI1RSFJT9p47gw_s"
);

const EMAIL_MAP = {
  Carlos: "carlos@marey.local", Anthony: "anthony@marey.local", Luis: "luis@marey.local",
  Willy: "willy@marey.local", Kenneth: "kenneth@marey.local", Jean: "jean@marey.local", Admin: "admin@marey.local"
};

function fmtDate(d) { return new Date(d).toLocaleDateString("es-PR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function hrsLeft(c) { return Math.max(0, 24 - ((Date.now() - new Date(c).getTime()) / 3600000)).toFixed(0); }
function isToday(d) { const t = new Date(); const x = new Date(d); return x.getDate() === t.getDate() && x.getMonth() === t.getMonth() && x.getFullYear() === t.getFullYear(); }
function isThisWeek(d) { const t = new Date(); const x = new Date(d); const startOfWeek = new Date(t); startOfWeek.setDate(t.getDate() - t.getDay()); startOfWeek.setHours(0,0,0,0); return x >= startOfWeek; }
function isThisMonth(d) { const t = new Date(); const x = new Date(d); return x.getMonth() === t.getMonth() && x.getFullYear() === t.getFullYear(); }
function isThisYear(d) { const t = new Date(); const x = new Date(d); return x.getFullYear() === t.getFullYear(); }
function filterByTime(records, filter, dateRange) {
  if (filter === "today") return records.filter(r => isToday(r.created_at));
  if (filter === "week") return records.filter(r => isThisWeek(r.created_at));
  if (filter === "month") return records.filter(r => isThisMonth(r.created_at));
  if (filter === "year") return records.filter(r => isThisYear(r.created_at));
  if (filter === "custom" && dateRange) {
    const from = dateRange.from ? new Date(dateRange.from + "T00:00:00") : null;
    const to = dateRange.to ? new Date(dateRange.to + "T23:59:59") : null;
    return records.filter(r => {
      const d = new Date(r.created_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }
  return records;
}

const STATUS_COLORS = {
  dirigido: { t: "Dirigido", c: "#0F6E56", b: "#E1F5EE" },
  pendiente_willy: { t: "Pendiente", c: "#854F0B", b: "#FAEEDA" },
  atendido_resuelto: { t: "Resuelto", c: "#3B6D11", b: "#EAF3DE" },
  atendido_cita_marey: { t: "Citó a Marey", c: "#534AB7", b: "#EEEDFE" },
  no_contesto: { t: "No contestó", c: "#A32D2D", b: "#FCEBEB" },
  cita_domicilio: { t: "Cita domicilio", c: "#854F0B", b: "#FAEEDA" },
  cita_confirmada: { t: "Confirmada", c: "#3B6D11", b: "#EAF3DE" }
};

const bigBtn = (bg) => ({ padding: "16px 24px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, background: bg, color: "#fff", cursor: "pointer", width: "100%", textAlign: "center" });
const inputStyle = { padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 16, width: "100%", boxSizing: "border-box", background: "#fff" };
const labelStyle = { fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" };
const cardStyle = { padding: "16px", borderRadius: 14, border: "2px solid #e8e8e8", marginBottom: 10, background: "#fff" };

function Badge({ status, centro }) {
  const s = STATUS_COLORS[status] || { t: status, c: "#888", b: "#f0f0f0" };
  let label = s.t;
  if (status === "dirigido" && centro) label = "Dirigido a " + centro;
  return <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: s.b, color: s.c }}>{label}</span>;
}

function TimeFilter({ value, onChange, dateRange, onDateRange }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[{ id: "today", label: "Hoy" }, { id: "week", label: "Semana" }, { id: "month", label: "Mes" }, { id: "year", label: "Año" }, { id: "all", label: "Todo" }, { id: "custom", label: "Rango" }].map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: value === o.id ? "#534AB7" : "#f0f0f0", color: value === o.id ? "#fff" : "#888" }}>{o.label}</button>
        ))}
      </div>
      {value === "custom" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Desde</label>
            <input type="date" value={dateRange.from} onChange={e => onDateRange({ ...dateRange, from: e.target.value })} style={{ ...inputStyle, fontSize: 14, padding: "10px 12px" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Hasta</label>
            <input type="date" value={dateRange.to} onChange={e => onDateRange({ ...dateRange, to: e.target.value })} style={{ ...inputStyle, fontSize: 14, padding: "10px 12px" }} />
          </div>
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
    if (value && !selectedLabel) {
      for (const items of Object.values(groups)) {
        const found = items.find(i => String(i.id) === String(value));
        if (found) { setSelectedLabel(found.nombre); break; }
      }
    }
  }, [value, groups, selectedLabel]);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredGroups = {};
  const q = search.toLowerCase();
  Object.entries(groups).forEach(([group, items]) => {
    const filtered = items.filter(i => i.nombre.toLowerCase().includes(q));
    if (filtered.length > 0) filteredGroups[group] = filtered;
  });

  const handleSelect = (item) => {
    onChange(String(item.id));
    setSelectedLabel(item.nombre);
    setSearch("");
    setOpen(false);
  };

  const clear = () => { onChange(""); setSelectedLabel(""); setSearch(""); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={labelStyle}>{label}</label>
      {selectedLabel && !open ? (
        <div onClick={() => { setOpen(true); setSearch(""); }} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{selectedLabel}</span>
          <span onClick={(e) => { e.stopPropagation(); clear(); }} style={{ color: "#aaa", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>x</span>
        </div>
      ) : (
        <input
          style={inputStyle}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || "Buscar..."}
        />
      )}
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "2px solid #e0e0e0", borderRadius: 12, maxHeight: 260, overflowY: "auto", zIndex: 100, marginTop: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {Object.keys(filteredGroups).length === 0 ? (
            <div style={{ padding: "14px 16px", color: "#aaa", fontSize: 14 }}>No se encontró</div>
          ) : (
            Object.entries(filteredGroups).map(([group, items]) => (
              <div key={group}>
                <div style={{ padding: "8px 16px 4px", fontSize: 12, fontWeight: 700, color: "#888", background: "#f9f9f9" }}>{group}</div>
                {items.map(item => (
                  <div key={item.id} onClick={() => handleSelect(item)} style={{ padding: "10px 16px", cursor: "pointer", fontSize: 15 }}
                    onMouseEnter={e => e.target.style.background = "#f0f0f0"} onMouseLeave={e => e.target.style.background = "#fff"}>
                    {item.nombre}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!name) {
    return (
      <div style={{ maxWidth: 360, margin: "0 auto", padding: "60px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#534AB7", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>M</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>Marey Service Center</div>
        </div>
        <label style={labelStyle}>¿Quién eres?</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.keys(EMAIL_MAP).map(u => (
            <button key={u} onClick={() => setName(u)} style={{ padding: "18px", borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer", background: "#534AB7", color: "#fff" }}>{u}</button>
          ))}
        </div>
      </div>
    );
  }

  const handlePin = async (digit) => {
    setPinError(false);
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL_MAP[name], password: newPin });
      if (error) { setPinError(true); setLoading(false); setTimeout(() => setPin(""), 800); }
      else {
        const { data: ud } = await supabase.from("usuarios").select("id, nombre, rol").eq("auth_id", data.user.id).single();
        setLoading(false);
        if (ud) onLogin(ud);
      }
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "60px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Hola, {name}</div>
        <div style={{ fontSize: 16, color: "#888", marginTop: 8 }}>{loading ? "Verificando..." : "Entra tu PIN"}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
        {[0,1,2,3].map(i => (<div key={i} style={{ width: 52, height: 58, borderRadius: 12, border: pinError ? "2px solid #E24B4A" : "2px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, background: "#fff" }}>{pin[i] ? "*" : ""}</div>))}
      </div>
      {pinError && <div style={{ textAlign: "center", color: "#E24B4A", fontSize: 15, fontWeight: 500, marginBottom: 16 }}>PIN incorrecto</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 260, margin: "0 auto" }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"del"].map((n, i) => {
          if (n === "") return <div key={i}></div>;
          if (n === "del") return <button key={i} onClick={() => { setPin(p => p.slice(0,-1)); setPinError(false); }} style={{ padding: "16px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 16, fontWeight: 500, background: "#f5f5f5", cursor: "pointer", color: "#888" }}>Borrar</button>;
          return <button key={i} onClick={() => handlePin(String(n))} disabled={loading} style={{ padding: "16px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 20, fontWeight: 600, background: "#fff", cursor: "pointer" }}>{n}</button>;
        })}
      </div>
      <button onClick={() => { setName(""); setPin(""); setPinError(false); }} style={{ display: "block", margin: "24px auto 0", background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer" }}>Cambiar usuario</button>
    </div>
  );
}

export default function App() {
  const [userData, setUserData] = useState(null);
  const [tab, setTab] = useState("llamadas");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [antiguedadList, setAntiguedadList] = useState([]);
  const [form, setForm] = useState({ telefono: "", nombre: "", municipio_id: "", modelo_id: "", antiguedad_id: "", problema: "" });
  const [clienteFound, setClienteFound] = useState(null);
  const [clienteHistory, setClienteHistory] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [citaForm, setCitaForm] = useState({});
  const [showCitaId, setShowCitaId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [statsFilter, setStatsFilter] = useState("all");
  const [dashFilter, setDashFilter] = useState("all");
  const [histFilter, setHistFilter] = useState("all");
  const [queueFilter, setQueueFilter] = useState("all");
  const [citasFilter, setCitasFilter] = useState("all");
  const [statsDateRange, setStatsDateRange] = useState({ from: "", to: "" });
  const [dashDateRange, setDashDateRange] = useState({ from: "", to: "" });
  const [histDateRange, setHistDateRange] = useState({ from: "", to: "" });
  const [queueDateRange, setQueueDateRange] = useState({ from: "", to: "" });
  const [citasDateRange, setCitasDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("usuarios").select("id, nombre, rol").eq("auth_id", session.user.id).single().then(({ data }) => {
          if (data) { setUserData(data); setTab(data.rol === "tech" ? "queue" : data.rol === "admin" ? "dashboard" : "llamadas"); }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!userData) return;
    supabase.from("municipios").select("*").order("nombre").then(({ data }) => { if (data) setMunicipios(data); });
    supabase.from("modelos").select("*").eq("activo", true).order("categoria").order("subcategoria").order("nombre").then(({ data }) => { if (data) setModelos(data); });
    supabase.from("status").select("*").then(({ data }) => { if (data) setStatusList(data); });
    supabase.from("antiguedad").select("*").order("id").then(({ data }) => { if (data) setAntiguedadList(data); });
  }, [userData]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("llamadas_completas").select("*").order("created_at", { ascending: false }).limit(500);
    if (data) setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => { if (userData) { fetchRecords(); const iv = setInterval(fetchRecords, 30000); return () => clearInterval(iv); } }, [userData, fetchRecords]);

  useEffect(() => {
    if (!userData) return;
    const ch = supabase.channel("llamadas_rt").on("postgres_changes", { event: "*", schema: "public", table: "llamadas" }, () => { fetchRecords(); }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userData, fetchRecords]);

  if (!userData) return <LoginScreen onLogin={(u) => { setUserData(u); setTab(u.rol === "tech" ? "queue" : u.rol === "admin" ? "dashboard" : "llamadas"); }} />;

  const user = userData.nombre;
  const role = userData.rol;
  const userId = userData.id;
  const getStatusId = (nombre) => { const s = statusList.find(x => x.nombre === nombre); return s ? s.id : null; };

  const searchPhone = async (tel) => {
    if (tel.length < 10) { setClienteFound(null); setClienteHistory([]); return; }
    setSearching(true);
    const { data: cliente } = await supabase.from("clientes").select("*").eq("telefono", tel).maybeSingle();
    if (cliente) {
      setClienteFound(cliente);
      setForm(f => ({ ...f, nombre: cliente.nombre }));
      const { data: history } = await supabase.from("llamadas_completas").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false });
      if (history && history.length > 0) {
        setClienteHistory(history);
        const last = history[0];
        const mun = municipios.find(m => m.nombre === last.municipio);
        const mod = modelos.find(m => m.nombre === last.modelo);
        const ant = antiguedadList.find(a => a.rango === last.antiguedad);
        setForm(f => ({ ...f, nombre: cliente.nombre, municipio_id: mun ? String(mun.id) : "", modelo_id: mod ? String(mod.id) : "", antiguedad_id: ant ? String(ant.id) : "" }));
      }
    } else { setClienteFound(null); setClienteHistory([]); }
    setSearching(false);
  };

  const saveCallWith = async (statusNombre, centroDirigido) => {
    const statusId = getStatusId(statusNombre);
    if (!statusId) return;
    let clienteId;
    if (clienteFound) {
      clienteId = clienteFound.id;
      if (form.nombre !== clienteFound.nombre) await supabase.from("clientes").update({ nombre: form.nombre }).eq("id", clienteId);
    } else {
      const { data: nc } = await supabase.from("clientes").insert({ nombre: form.nombre, telefono: form.telefono }).select().single();
      if (!nc) return;
      clienteId = nc.id;
    }
    await supabase.from("llamadas").insert({
      cliente_id: clienteId, municipio_id: parseInt(form.municipio_id), modelo_id: parseInt(form.modelo_id),
      antiguedad_id: form.antiguedad_id ? parseInt(form.antiguedad_id) : null,
      status_id: statusId, registrado_por: userId, resuelto_por: statusNombre === "atendido_resuelto" ? userId : null,
      centro_dirigido: centroDirigido || null, problema: form.problema || null
    });
    setSaved(true); fetchRecords();
    setTimeout(() => { setForm({ telefono: "", nombre: "", municipio_id: "", modelo_id: "", antiguedad_id: "", problema: "" }); setClienteFound(null); setClienteHistory([]); setSaved(false); }, 1800);
  };

  const canSave = form.nombre && form.telefono && form.municipio_id && form.modelo_id;

  const updateStatus = async (id, statusNombre) => {
    const statusId = getStatusId(statusNombre);
    if (!statusId) return;
    await supabase.from("llamadas").update({ status_id: statusId, resuelto_por: userId }).eq("id", id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: statusNombre, resuelto_por: user } : r));
    setOpenId(null);
  };

  const handleNoContesto = async (id, currentIntentos) => {
    if (currentIntentos >= 1) {
      const statusId = getStatusId("no_contesto");
      await supabase.from("llamadas").update({ status_id: statusId, intentos: 2, resuelto_por: userId }).eq("id", id);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "no_contesto", intentos: 2, resuelto_por: user } : r));
    } else {
      await supabase.from("llamadas").update({ intentos: 1, last_attempt_at: new Date().toISOString() }).eq("id", id);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, intentos: 1, last_attempt_at: new Date().toISOString() } : r));
    }
    setOpenId(null);
  };

  const saveCitaDomicilio = async (id) => {
    const cf = citaForm[id];
    if (!cf || !cf.direccion) return;
    const statusId = getStatusId("cita_domicilio");
    if (!statusId) return;
    await supabase.from("llamadas").update({ status_id: statusId, direccion: cf.direccion, descripcion_cita: cf.descripcion || null, resuelto_por: userId }).eq("id", id);
    const record = records.find(r => r.id === id);
    if (record && record.cliente_id) {
      await supabase.from("clientes").update({ direccion: cf.direccion }).eq("id", record.cliente_id);
    }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "cita_domicilio", direccion: cf.direccion, descripcion_cita: cf.descripcion, resuelto_por: user } : r));
    setCitaForm(prev => { const n = {...prev}; delete n[id]; return n; });
    setShowCitaId(null);
    setOpenId(null);
  };

  const confirmCita = async (id) => {
    const statusId = getStatusId("cita_confirmada");
    await supabase.from("llamadas").update({ status_id: statusId }).eq("id", id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "cita_confirmada" } : r));
  };

  const logout = async () => { await supabase.auth.signOut(); setUserData(null); setRecords([]); };

  const deleteLlamada = async (id) => {
    if (!confirm("¿Seguro que quieres borrar esta llamada?")) return;
    await supabase.from("llamadas").delete().eq("id", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const deleteCliente = async (clienteId, nombre) => {
    if (!confirm("¿Seguro que quieres borrar a " + nombre + " y todas sus llamadas?")) return;
    await supabase.from("llamadas").delete().eq("cliente_id", clienteId);
    await supabase.from("clientes").delete().eq("id", clienteId);
    setRecords(prev => prev.filter(r => r.cliente_id !== clienteId));
  };

  const startEdit = (r) => {
    const mun = municipios.find(m => m.nombre === r.municipio);
    const mod = modelos.find(m => m.nombre === r.modelo);
    const ant = antiguedadList.find(a => a.rango === r.antiguedad);
    const st = statusList.find(s => s.nombre === r.status);
    setEditId(r.id);
    setEditForm({
      nombre: r.cliente_nombre,
      telefono: r.cliente_telefono,
      municipio_id: mun ? String(mun.id) : "",
      modelo_id: mod ? String(mod.id) : "",
      antiguedad_id: ant ? String(ant.id) : "",
      status_id: st ? String(st.id) : "",
      problema: r.problema || "",
      cliente_id: r.cliente_id
    });
  };

  const saveEdit = async (id) => {
    await supabase.from("clientes").update({
      nombre: editForm.nombre,
      telefono: editForm.telefono
    }).eq("id", editForm.cliente_id);

    await supabase.from("llamadas").update({
      municipio_id: parseInt(editForm.municipio_id),
      modelo_id: parseInt(editForm.modelo_id),
      antiguedad_id: editForm.antiguedad_id ? parseInt(editForm.antiguedad_id) : null,
      problema: editForm.problema || null
    }).eq("id", id);

    setEditId(null);
    setEditForm({});
    fetchRecords();
  };

  const pendingCount = records.filter(r => r.status === "pendiente_willy").length;
  const citasCount = records.filter(r => r.status === "cita_domicilio").length;
  const myResolved = records.filter(r => r.resuelto_por === user).length;

  let tabs = [];
  if (role === "agent") tabs = ["llamadas", "queue", "citas", "historial"];
  else if (role === "tech") tabs = ["queue", "citas", "stats", "historial"];
  else if (role === "admin") tabs = ["dashboard", "llamadas", "queue", "citas", "stats", "historial"];

  const tabLabels = { llamadas: "Nueva llamada", queue: "Queue", citas: "Citas", historial: "Historial", dashboard: "Dashboard", stats: "Estadísticas" };
  const tabColors = { llamadas: "#534AB7", queue: "#854F0B", citas: "#185FA5", historial: "#5F5E5A", dashboard: "#0F6E56", stats: "#534AB7" };

  // Grouped data for searchable selects
  const munGroups = { "Área Metro": [], "Oeste / Sur": [], "Otras áreas": [] };
  municipios.forEach(m => { if (m.zona === "Metro") munGroups["Área Metro"].push(m); else if (m.zona === "Oeste/Sur") munGroups["Oeste / Sur"].push(m); else munGroups["Otras áreas"].push(m); });

  const modelGroups = {};
  modelos.forEach(m => { const key = m.subcategoria ? m.categoria + " — " + m.subcategoria : m.categoria; if (!modelGroups[key]) modelGroups[key] = []; modelGroups[key].push(m); });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 12px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>M</div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{user}</span>
          {myResolved > 0 && <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: "#EAF3DE", color: "#3B6D11" }}>{myResolved} atendidas</span>}
        </div>
        <button onClick={logout} style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #e0e0e0", background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#888" }}>Salir</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "12px 18px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", position: "relative", background: tab === t ? tabColors[t] : "#f0f0f0", color: tab === t ? "#fff" : "#888" }}>
            {tabLabels[t]}
            {t === "queue" && pendingCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#E24B4A", color: "#fff", borderRadius: 12, fontSize: 11, fontWeight: 700, padding: "2px 7px" }}>{pendingCount}</span>}
            {t === "citas" && citasCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#854F0B", color: "#fff", borderRadius: 12, fontSize: 11, fontWeight: 700, padding: "2px 7px" }}>{citasCount}</span>}
          </button>
        ))}
      </div>

      {tab === "llamadas" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} onBlur={e => searchPhone(e.target.value)} placeholder="787-000-0000" />
              {searching && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Buscando...</div>}
            </div>
            {clienteFound && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "#E1F5EE", border: "1px solid #0F6E56" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F6E56" }}>Cliente encontrado — {clienteHistory.length} llamada{clienteHistory.length !== 1 ? "s" : ""} previa{clienteHistory.length !== 1 ? "s" : ""}</div>
                {clienteFound.direccion && <div style={{ fontSize: 13, color: "#0F6E56", marginTop: 4 }}>Dirección: {clienteFound.direccion}</div>}
                {clienteHistory.length > 0 && <div style={{ marginTop: 8 }}>{clienteHistory.slice(0, 5).map(h => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#0F6E56", padding: "3px 0", borderBottom: "1px solid rgba(15,110,86,0.15)" }}>
                    <span>{fmtDate(h.created_at)} — {h.problema || "Sin problema"}</span><Badge status={h.status} centro={h.centro_dirigido} />
                  </div>
                ))}</div>}
              </div>
            )}
            <div><label style={labelStyle}>Nombre</label><input style={inputStyle} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre del cliente" /></div>
            <SearchSelect label="Pueblo" value={form.municipio_id} onChange={v => setForm({...form, municipio_id: v})} groups={munGroups} placeholder="Escribe para buscar pueblo..." />
            <SearchSelect label="Modelo" value={form.modelo_id} onChange={v => setForm({...form, modelo_id: v})} groups={modelGroups} placeholder="Escribe para buscar modelo..." />
            <div>
              <label style={labelStyle}>¿Hace cuánto tiene la unidad?</label>
              <select style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }} value={form.antiguedad_id} onChange={e => setForm({...form, antiguedad_id: e.target.value})}>
                <option value="">-- Seleccionar --</option>
                {antiguedadList.map(a => <option key={a.id} value={a.id}>{a.rango}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Problema</label><input style={inputStyle} value={form.problema} onChange={e => setForm({...form, problema: e.target.value})} placeholder="Breve descripción" /></div>
          </div>
          {canSave && !saved && (
            <div style={{ marginTop: 24 }}>
              <label style={{ ...labelStyle, fontSize: 16, marginBottom: 12 }}>¿Qué pasó con la llamada?</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => saveCallWith("dirigido", "San Juan")} style={bigBtn("#0F6E56")}>ENVIADO A SAN JUAN</button>
                <button onClick={() => saveCallWith("dirigido", "San Germán")} style={bigBtn("#185FA5")}>ENVIADO A SAN GERMÁN</button>
                <button onClick={() => saveCallWith("pendiente_willy", null)} style={bigBtn("#854F0B")}>REFERIDO A TÉCNICOS</button>
                <button onClick={() => saveCallWith("atendido_resuelto", null)} style={bigBtn("#3B6D11")}>SE RESOLVIÓ</button>
              </div>
            </div>
          )}
          {saved && <div style={{ textAlign: "center", marginTop: 20, fontSize: 16, fontWeight: 600, color: "#0F6E56" }}>GUARDADO</div>}
        </div>
      )}

      {tab === "queue" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Queue</div>
          <TimeFilter value={queueFilter} onChange={setQueueFilter} dateRange={queueDateRange} onDateRange={setQueueDateRange} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status === "pendiente_willy"), queueFilter, queueDateRange).sort((a,b) => new Date(a.last_attempt_at || a.created_at) - new Date(b.last_attempt_at || b.created_at));
            if (filtered.length === 0) return <div style={{ textAlign: "center", padding: "60px 20px" }}><div style={{ fontSize: 48, marginBottom: 12 }}>&#10003;</div><div style={{ fontSize: 18, fontWeight: 600, color: "#0F6E56" }}>Todo al día</div></div>;
            return filtered.map(r => {
              const hrs = hrsLeft(r.last_attempt_at || r.created_at);
              const urgent = parseInt(hrs) < 6;
              const open = openId === r.id;
              return (
                <div key={r.id} style={{ ...cardStyle, borderColor: urgent ? "#F09595" : "#e8e8e8" }}>
                  <div onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 600 }}>{r.cliente_nombre}</div>
                        <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{r.cliente_telefono}</div>
                        <div style={{ fontSize: 14, color: "#888" }}>{r.municipio} — {r.modelo}</div>
                        <div style={{ fontSize: 14, color: "#666", marginTop: 2 }}>{r.problema}</div>
                        {r.antiguedad && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Tiempo con la unidad: {r.antiguedad}</div>}
                        {r.intentos > 0 && <div style={{ marginTop: 4, padding: "3px 10px", borderRadius: 8, background: "#FCEBEB", color: "#A32D2D", fontSize: 12, fontWeight: 600, display: "inline-block" }}>Intento {r.intentos} de 2</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ padding: "6px 14px", borderRadius: 10, fontSize: 15, fontWeight: 700, background: urgent ? "#FCEBEB" : "#FAEEDA", color: urgent ? "#A32D2D" : "#854F0B" }}>{hrs}h</div>
                        <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{r.registrado_por}</div>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      {showCitaId === r.id ? (
                        <>
                          <div><label style={labelStyle}>Dirección del cliente</label><input style={inputStyle} value={(citaForm[r.id] || {}).direccion || ""} onChange={e => setCitaForm(prev => ({...prev, [r.id]: {...(prev[r.id] || {}), direccion: e.target.value}}))} placeholder="Dirección completa" /></div>
                          <div><label style={labelStyle}>¿Qué trabajo vas a realizar?</label><input style={inputStyle} value={(citaForm[r.id] || {}).descripcion || ""} onChange={e => setCitaForm(prev => ({...prev, [r.id]: {...(prev[r.id] || {}), descripcion: e.target.value}}))} placeholder="Descripción breve del trabajo" /></div>
                          <button onClick={() => saveCitaDomicilio(r.id)} disabled={!(citaForm[r.id] || {}).direccion} style={bigBtn((citaForm[r.id] || {}).direccion ? "#185FA5" : "#ccc")}>CONFIRMAR CITA</button>
                          <button onClick={() => { setShowCitaId(null); setCitaForm(prev => { const n = {...prev}; delete n[r.id]; return n; }); }} style={{ ...bigBtn("#f0f0f0"), color: "#888" }}>CANCELAR</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => updateStatus(r.id, "atendido_resuelto")} style={bigBtn("#0F6E56")}>RESUELTO</button>
                          <button onClick={() => updateStatus(r.id, "atendido_cita_marey")} style={bigBtn("#534AB7")}>SE CITÓ A MAREY</button>
                          <button onClick={() => setShowCitaId(r.id)} style={bigBtn("#185FA5")}>CITA A DOMICILIO</button>
                          <button onClick={() => handleNoContesto(r.id, r.intentos || 0)} style={bigBtn("#888")}>NO CONTESTÓ {r.intentos > 0 ? "(ÚLTIMO INTENTO)" : ""}</button>
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

      {tab === "citas" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Citas a domicilio</div>
          <TimeFilter value={citasFilter} onChange={setCitasFilter} dateRange={citasDateRange} onDateRange={setCitasDateRange} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status === "cita_domicilio" || r.status === "cita_confirmada"), citasFilter, citasDateRange)
              .sort((a,b) => { if (a.status === "cita_domicilio" && b.status !== "cita_domicilio") return -1; if (a.status !== "cita_domicilio" && b.status === "cita_domicilio") return 1; return 0; });
            if (filtered.length === 0) return <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>No hay citas para este período</div>;
            return filtered.map(r => {
              const cf = citaForm[r.id] || { direccion: "", descripcion: "" };
              return (
                <div key={r.id} style={{ ...cardStyle, borderColor: r.status === "cita_domicilio" ? "#FAEEDA" : "#EAF3DE", borderWidth: 2 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{r.cliente_nombre}</div>
                    <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{r.cliente_telefono} — {r.municipio}</div>
                    <div style={{ fontSize: 14, color: "#666" }}>{r.modelo} — {r.problema}</div>
                    {r.antiguedad && <div style={{ fontSize: 13, color: "#888" }}>Tiempo con la unidad: {r.antiguedad}</div>}
                    {r.direccion && <div style={{ fontSize: 14, color: "#333", marginTop: 6 }}>Dirección: {r.direccion}</div>}
                    {r.descripcion_cita && <div style={{ fontSize: 14, color: "#333", marginTop: 2 }}>Trabajo: {r.descripcion_cita}</div>}
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Por: {r.registrado_por} — {fmtDate(r.created_at)}</div>
                    {role === "admin" && (
                      <button onClick={() => deleteLlamada(r.id)} style={{ marginTop: 6, padding: "4px 12px", borderRadius: 8, border: "1px solid #E24B4A", background: "#FCEBEB", color: "#A32D2D", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Borrar cita</button>
                    )}
                  </div>
                  {r.status === "cita_domicilio" && user === "Anthony" && (
                    <div style={{ marginTop: 14 }}>
                      <button onClick={() => confirmCita(r.id)} style={bigBtn("#854F0B")}>CONFIRMAR EN PLANNER</button>
                    </div>
                  )}
                  {r.status === "cita_domicilio" && user !== "Anthony" && (
                    <div style={{ marginTop: 10, padding: "10px 16px", borderRadius: 12, background: "#FAEEDA", color: "#854F0B", fontSize: 14, fontWeight: 700, textAlign: "center" }}>PENDIENTE</div>
                  )}
                  {r.status === "cita_confirmada" && (
                    <div style={{ marginTop: 10, padding: "10px 16px", borderRadius: 12, background: "#EAF3DE", textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#3B6D11" }}>CONFIRMADA</div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {tab === "stats" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Estadísticas por técnico</div>
          <TimeFilter value={statsFilter} onChange={setStatsFilter} dateRange={statsDateRange} onDateRange={setStatsDateRange} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.resuelto_por), statsFilter, statsDateRange);
            const byUser = {};
            filtered.forEach(r => {
              if (!byUser[r.resuelto_por]) byUser[r.resuelto_por] = { total: 0, resueltas: 0, citados_marey: 0, citas_domicilio: 0, no_contestaron: 0 };
              byUser[r.resuelto_por].total++;
              if (r.status === "atendido_resuelto") byUser[r.resuelto_por].resueltas++;
              if (r.status === "atendido_cita_marey") byUser[r.resuelto_por].citados_marey++;
              if (r.status === "cita_domicilio" || r.status === "cita_confirmada") byUser[r.resuelto_por].citas_domicilio++;
              if (r.status === "no_contesto") byUser[r.resuelto_por].no_contestaron++;
            });
            const sorted = Object.entries(byUser).sort((a,b) => b[1].total - a[1].total);
            if (sorted.length === 0) return <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>No hay estadísticas para este período</div>;
            return sorted.map(([nombre, s]) => (
              <div key={nombre} style={{ ...cardStyle, borderColor: nombre === user ? "#534AB7" : "#e8e8e8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{nombre}</div>
                  <div style={{ padding: "4px 14px", borderRadius: 10, fontSize: 18, fontWeight: 700, background: "#534AB7", color: "#fff" }}>{s.total}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ padding: "10px", borderRadius: 10, background: "#EAF3DE", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#3B6D11" }}>{s.resueltas}</div><div style={{ fontSize: 11, color: "#3B6D11" }}>Resueltas</div></div>
                  <div style={{ padding: "10px", borderRadius: 10, background: "#EEEDFE", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#534AB7" }}>{s.citados_marey}</div><div style={{ fontSize: 11, color: "#534AB7" }}>Citados Marey</div></div>
                  <div style={{ padding: "10px", borderRadius: 10, background: "#FAEEDA", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#854F0B" }}>{s.citas_domicilio}</div><div style={{ fontSize: 11, color: "#854F0B" }}>Citas domicilio</div></div>
                  <div style={{ padding: "10px", borderRadius: 10, background: "#FCEBEB", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#A32D2D" }}>{s.no_contestaron}</div><div style={{ fontSize: 11, color: "#A32D2D" }}>No contestaron</div></div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {tab === "historial" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Historial</div>
          <TimeFilter value={histFilter} onChange={setHistFilter} dateRange={histDateRange} onDateRange={setHistDateRange} />
          {(() => {
            const filtered = filterByTime(records.filter(r => r.status !== "pendiente_willy"), histFilter, histDateRange).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            if (filtered.length === 0) return <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>No hay registros para este período</div>;
            return filtered.map(r => {
              const s = STATUS_COLORS[r.status] || { t: r.status, c: "#888", b: "#f0f0f0" };
              let label = s.t;
              if (r.status === "dirigido" && r.centro_dirigido) label = "Dirigido a " + r.centro_dirigido;
              if (r.status === "no_contesto" && r.intentos) label = "No contestó (" + r.intentos + " intentos)";
              return (
                <div key={r.id} style={{ ...cardStyle, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{r.cliente_nombre}</div>
                      <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{r.cliente_telefono} — {r.municipio} — {r.modelo}{r.antiguedad ? " — " + r.antiguedad : ""}</div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Registrado por: {r.registrado_por}{r.resuelto_por ? " — Atendido por: " + r.resuelto_por : ""}</div>
                      {role === "admin" && (
                        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                          <button onClick={() => startEdit(r)} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #534AB7", background: "#EEEDFE", color: "#534AB7", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                          <button onClick={() => deleteLlamada(r.id)} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #E24B4A", background: "#FCEBEB", color: "#A32D2D", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Borrar llamada</button>
                          <button onClick={() => deleteCliente(r.cliente_id, r.cliente_nombre)} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #A32D2D", background: "#A32D2D", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Borrar cliente</button>
                        </div>
                      )}
                      {editId === r.id && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, padding: "14px", borderRadius: 12, background: "#f9f9f9" }}>
                          <div><label style={labelStyle}>Nombre</label><input style={inputStyle} value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></div>
                          <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} /></div>
                          <SearchSelect label="Pueblo" value={editForm.municipio_id} onChange={v => setEditForm({...editForm, municipio_id: v})} groups={munGroups} placeholder="Buscar pueblo..." />
                          <SearchSelect label="Modelo" value={editForm.modelo_id} onChange={v => setEditForm({...editForm, modelo_id: v})} groups={modelGroups} placeholder="Buscar modelo..." />
                          <div>
                            <label style={labelStyle}>Tiempo con la unidad</label>
                            <select style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }} value={editForm.antiguedad_id} onChange={e => setEditForm({...editForm, antiguedad_id: e.target.value})}>
                              <option value="">-- Seleccionar --</option>
                              {antiguedadList.map(a => <option key={a.id} value={a.id}>{a.rango}</option>)}
                            </select>
                          </div>
                          <div><label style={labelStyle}>Problema</label><input style={inputStyle} value={editForm.problema} onChange={e => setEditForm({...editForm, problema: e.target.value})} /></div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveEdit(r.id)} style={bigBtn("#0F6E56")}>GUARDAR</button>
                            <button onClick={() => { setEditId(null); setEditForm({}); }} style={{ ...bigBtn("#f0f0f0"), color: "#888" }}>CANCELAR</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: s.b, color: s.c }}>{label}</span>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{fmtDate(r.created_at)}</div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {tab === "dashboard" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Dashboard</div>
          <TimeFilter value={dashFilter} onChange={setDashFilter} dateRange={dashDateRange} onDateRange={setDashDateRange} />
          {(() => {
            const filtered = filterByTime(records, dashFilter, dashDateRange);
            const total = filtered.length;
            const byStatus = {};
            const byPueblo = {};
            filtered.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; byPueblo[r.municipio] = (byPueblo[r.municipio] || 0) + 1; });
            const pueblos = Object.entries(byPueblo).sort((a,b) => b[1] - a[1]);
            const maxP = pueblos[0] ? pueblos[0][1] : 1;
            const cards = [
              { label: "Total", value: total, bg: "#534AB7" },
              { label: "Resueltas", value: byStatus["atendido_resuelto"] || 0, bg: "#0F6E56" },
              { label: "Referido San Juan", value: filtered.filter(r => r.status === "dirigido" && r.centro_dirigido === "San Juan").length, bg: "#0F6E56" },
              { label: "Referido San Germán", value: filtered.filter(r => r.status === "dirigido" && r.centro_dirigido === "San Germán").length, bg: "#185FA5" },
              { label: "Citados Marey", value: byStatus["atendido_cita_marey"] || 0, bg: "#185FA5" },
              { label: "Cita domicilio", value: (byStatus["cita_domicilio"]||0) + (byStatus["cita_confirmada"]||0), bg: "#854F0B" },
              { label: "No contestaron", value: byStatus["no_contesto"] || 0, bg: "#A32D2D" },
              { label: "Pendientes", value: byStatus["pendiente_willy"] || 0, bg: "#854F0B" },
            ];
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 30 }}>
                  {cards.map(c => (
                    <div key={c.label} style={{ padding: "18px 10px", borderRadius: 14, background: c.bg, textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{c.value}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: 500 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Por pueblo</div>
                {pueblos.map(([pueblo, count]) => (
                  <div key={pueblo} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 100, fontSize: 13, color: "#666", textAlign: "right", flexShrink: 0, fontWeight: 500 }}>{pueblo}</div>
                    <div style={{ flex: 1, height: 26, background: "#f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ width: (count/maxP*100)+"%", height: "100%", background: "#534AB7", borderRadius: 8, minWidth: 26, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
