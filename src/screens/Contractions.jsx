import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, updateDoc, doc, onSnapshot,
  query, orderBy, serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useAuth } from "../contexts/AuthContext";
import { getColors } from "../styles/theme";

const INTENSITIES = [
  { v: "leve",     l: "Leve",     bars: 2, desc: "Desconforto leve, consigo falar" },
  { v: "moderada", l: "Moderada", bars: 3, desc: "Dói mas é suportável" },
  { v: "intensa",  l: "Intensa",  bars: 5, desc: "Forte, preciso parar o que faço" },
];

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
// Horas:minutos:segundos (para intervalos, que podem ser longos)
function fmtHMS(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function tms(ts) { return ts?.toDate ? ts.toDate().getTime() : (ts ? new Date(ts).getTime() : 0); }
function todayLabel() { return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }); }

function calcStats(contractions) {
  const now = Date.now();
  const lastHour = contractions.filter(c => c.duration && now - tms(c.startedAt) < 3600000);
  if (lastHour.length === 0) return { count: 0, avgDuration: null, avgInterval: null };
  const avgDuration = Math.round(lastHour.reduce((a, c) => a + c.duration, 0) / lastHour.length);
  let avgInterval = null;
  if (lastHour.length >= 2) {
    const sorted = [...lastHour].sort((a, b) => tms(a.startedAt) - tms(b.startedAt));
    let total = 0;
    for (let i = 1; i < sorted.length; i++) total += (tms(sorted[i].startedAt) - tms(sorted[i - 1].startedAt)) / 1000;
    avgInterval = Math.round(total / (sorted.length - 1));
  }
  return { count: lastHour.length, avgDuration, avgInterval };
}

export default function Contractions() {
  const { pregnancy, myRole, can } = usePregnancy();
  const { user } = useAuth();
  const C = getColors(pregnancy?.theme?.palette);
  const canEdit = can("contractions", "edit");

  const [contractions, setContractions] = useState([]);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showIntensity, setShowIntensity] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const pregnancyId = pregnancy?.id;

  // Tempo real — todos os membros com acesso veem ao vivo
  useEffect(() => {
    if (!pregnancyId) return;
    const q = query(
      collection(db, "pregnancies", pregnancyId, "contractions"),
      orderBy("startedAt", "desc"), limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContractions(list);
      setActive(list.find(c => !c.endedAt) || null);
      setLoading(false);
    });
    return unsub;
  }, [pregnancyId]);

  // Cronômetro da contração ativa
  useEffect(() => {
    if (active?.startedAt) {
      const start = tms(active.startedAt) || Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    } else { clearInterval(timerRef.current); setElapsed(0); }
    return () => clearInterval(timerRef.current);
  }, [active]);

  async function handleStart() {
    if (!canEdit || active) return;
    await addDoc(collection(db, "pregnancies", pregnancyId, "contractions"), {
      startedAt: serverTimestamp(), endedAt: null, duration: null, intensity: null,
      startedBy: user.uid, startedByName: user.displayName,
    });
  }
  async function handleStop() {
    if (!canEdit || !active) return;
    const duration = Math.floor((Date.now() - (tms(active.startedAt) || Date.now())) / 1000);
    await updateDoc(doc(db, "pregnancies", pregnancyId, "contractions", active.id), {
      endedAt: serverTimestamp(), duration,
    });
    setShowIntensity(active.id);
  }
  async function handleIntensity(id, intensity) {
    await updateDoc(doc(db, "pregnancies", pregnancyId, "contractions", id), { intensity });
    setShowIntensity(null);
  }

  const stats = calcStats(contractions);
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  // Só as contrações finalizadas de HOJE (a timeline diz "Hoje")
  const completed = contractions.filter(c => c.endedAt && tms(c.startedAt) >= startOfToday.getTime());
  const intenseOf = v => INTENSITIES.find(x => x.v === v);

  return (
    <div className="SCR">
      {/* Stats — Última hora */}
      <div className="card fu">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>⏱️</span>
          <div style={{ flex: 1, display: "flex", justifyContent: "space-between", textAlign: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 26, color: C.vinho, lineHeight: 1 }}>{stats.count}</div>
              <div style={{ fontSize: 9, color: C.taupe, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Última hora</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 26, color: C.vinho, lineHeight: 1 }}>{stats.avgDuration ? fmt(stats.avgDuration) : "—"}</div>
              <div style={{ fontSize: 9, color: C.taupe, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Duração méd.</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 26, color: C.vinho, lineHeight: 1 }}>{stats.avgInterval ? fmtHMS(stats.avgInterval) : "—"}</div>
              <div style={{ fontSize: 9, color: C.taupe, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>Intervalo méd.</div>
            </div>
          </div>
        </div>
        {stats.avgInterval && stats.avgInterval <= 300 && stats.count >= 3 && (
          <div style={{ marginTop: 12, background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: "9px 12px", fontSize: 12.5, color: "#92400e" }}>
            ⚠️ Contrações a cada <strong>{fmtHMS(stats.avgInterval)}</strong> — considere contatar sua equipe.
          </div>
        )}
      </div>

      {/* Botão grande iniciar/parar */}
      {canEdit ? (
        <button
          onClick={active ? handleStop : handleStart}
          className="fu"
          style={{
            width: "100%", padding: "20px", borderRadius: 22, border: "none", cursor: "pointer",
            color: "white", fontFamily: "'DM Sans',sans-serif",
            background: active ? "linear-gradient(135deg,#ef4444,#b91c1c)" : `linear-gradient(135deg,${C.rosa},${C.vinho})`,
            boxShadow: active ? "0 10px 30px rgba(239,68,68,.32)" : `0 10px 30px rgba(78,43,83,.28)`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            animation: active ? "kp 1.6s ease infinite" : "none",
          }}>
          {active && <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 46, lineHeight: 1 }}>{fmt(elapsed)}</span>}
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1 }}>
            {active ? "⏹ PARAR CONTRAÇÃO" : "▶ INÍCIO DA CONTRAÇÃO"}
          </span>
          {active && <span style={{ fontSize: 11, opacity: .85 }}>iniciada às {fmtTime(active.startedAt)} · por {active.startedByName || "—"}</span>}
        </button>
      ) : (
        <div className="card fu" style={{ textAlign: "center", color: C.taupe, fontSize: 13 }}>
          👁️ Você acompanha as contrações <strong>em tempo real</strong>. O registro é feito pela mãe ou pelo pai.
        </div>
      )}

      {/* Timeline — Hoje */}
      <div className="card fu">
        <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 4 }}>
          Hoje ({todayLabel()})
        </div>
        {!loading && completed.length === 0 ? (
          <div className="emp" style={{ padding: "20px 10px" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>⏱️</div>
            <div style={{ fontSize: 13, color: C.taupe }}>Nenhuma contração registrada ainda</div>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {completed.map((c, i) => {
              const it = intenseOf(c.intensity);
              const older = completed[i + 1];
              const interval = older ? Math.round((tms(c.startedAt) - tms(older.startedAt)) / 1000) : null;
              return (
                <div key={c.id}>
                  {/* card da contração */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: `${C.bege}22`, borderRadius: 16, border: `1px solid ${C.bege}66` }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.rosa}1f`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👶</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho, lineHeight: 1 }}>{fmtTime(c.startedAt)}</div>
                      <div style={{ fontSize: 11, color: C.taupe, marginTop: 2 }}>Duração <strong style={{ color: C.vinho }}>{c.duration != null ? fmt(c.duration) : "—"}</strong></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: C.taupe, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Intensidade</div>
                      <Bars n={it?.bars ?? 0} C={C} />
                    </div>
                  </div>
                  {/* conector de intervalo */}
                  {interval != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 8px 24px" }}>
                      <span style={{ color: C.rosa, fontSize: 15 }}>💗</span>
                      <span style={{ fontSize: 12, color: C.taupe }}>Intervalo: <strong style={{ color: C.vinho }}>{fmtHMS(interval)}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de intensidade */}
      {showIntensity && (
        <div className="OVL" onClick={() => setShowIntensity(null)}>
          <div className="MDL" onClick={e => e.stopPropagation()}>
            <div className="mh" />
            <div className="mt">Intensidade da contração</div>
            <div className="ms">Como foi essa contração?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INTENSITIES.map(i => (
                <button key={i.v} onClick={() => handleIntensity(showIntensity, i.v)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: `${C.bege}22`, border: `1.5px solid ${C.bege}`, borderRadius: 14, cursor: "pointer", textAlign: "left",
                }}>
                  <Bars n={i.bars} C={C} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.vinho }}>{i.l}</div>
                    <div style={{ fontSize: 12, color: C.taupe }}>{i.desc}</div>
                  </div>
                </button>
              ))}
              <button onClick={() => handleIntensity(showIntensity, null)} style={{
                padding: 12, background: "transparent", color: C.taupe, border: `1.5px solid ${C.bege}`,
                borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
              }}>Pular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bars({ n, C }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 20 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 6, height: 7 + i * 3, borderRadius: 2,
          background: i < n ? C.rosa : `${C.bege}`,
          opacity: i < n ? (i === n - 1 ? .7 : 1) : 1,
        }} />
      ))}
    </div>
  );
}
