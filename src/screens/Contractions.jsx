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
  { v: "leve",     l: "Leve",     emoji: "🟡", desc: "Desconforto leve, consigo falar" },
  { v: "moderada", l: "Moderada", emoji: "🟠", desc: "Dói mas é suportável" },
  { v: "intensa",  l: "Intensa",  emoji: "🔴", desc: "Forte, preciso parar o que faço" },
];

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function calcStats(contractions) {
  const now = Date.now();
  const lastHour = contractions.filter(c => {
    if (!c.startedAt) return false;
    const t = c.startedAt.toDate ? c.startedAt.toDate().getTime() : c.startedAt;
    return now - t < 3600000 && c.duration;
  });

  if (lastHour.length === 0) return { count: 0, avgDuration: null, avgInterval: null };

  const avgDuration = Math.round(lastHour.reduce((a, c) => a + c.duration, 0) / lastHour.length);

  // Intervalo = tempo entre início de uma e início da próxima
  let avgInterval = null;
  if (lastHour.length >= 2) {
    const sorted = [...lastHour].sort((a, b) => {
      const ta = a.startedAt.toDate ? a.startedAt.toDate().getTime() : a.startedAt;
      const tb = b.startedAt.toDate ? b.startedAt.toDate().getTime() : b.startedAt;
      return ta - tb;
    });
    let totalInterval = 0;
    for (let i = 1; i < sorted.length; i++) {
      const ta = sorted[i - 1].startedAt.toDate ? sorted[i - 1].startedAt.toDate().getTime() : sorted[i - 1].startedAt;
      const tb = sorted[i].startedAt.toDate ? sorted[i].startedAt.toDate().getTime() : sorted[i].startedAt;
      totalInterval += (tb - ta) / 1000;
    }
    avgInterval = Math.round(totalInterval / (sorted.length - 1));
  }

  return { count: lastHour.length, avgDuration, avgInterval };
}

export default function Contractions() {
  const { pregnancy, can } = usePregnancy();
  const { user } = useAuth();
  const C = getColors(pregnancy?.theme?.palette);
  const canEdit = can("contractions", "edit");

  const [contractions, setContractions] = useState([]);
  const [active, setActive] = useState(null); // contração em andamento
  const [elapsed, setElapsed] = useState(0);
  const [showIntensity, setShowIntensity] = useState(null); // id da contração parada
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const pregnancyId = pregnancy?.id;

  // Firestore listener — tempo real
  useEffect(() => {
    if (!pregnancyId) return;
    const q = query(
      collection(db, "pregnancies", pregnancyId, "contractions"),
      orderBy("startedAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContractions(list);
      // Detecta contração ativa (sem endedAt)
      const curr = list.find(c => !c.endedAt);
      setActive(curr || null);
      setLoading(false);
    });
    return unsub;
  }, [pregnancyId]);

  // Timer local para a contração ativa
  useEffect(() => {
    if (active?.startedAt) {
      const start = active.startedAt.toDate ? active.startedAt.toDate().getTime() : active.startedAt;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  async function handleStart() {
    if (!canEdit || active) return;
    await addDoc(collection(db, "pregnancies", pregnancyId, "contractions"), {
      startedAt: serverTimestamp(),
      endedAt: null,
      duration: null,
      intensity: null,
      startedBy: user.uid,
    });
  }

  async function handleStop() {
    if (!canEdit || !active) return;
    const start = active.startedAt.toDate ? active.startedAt.toDate().getTime() : active.startedAt;
    const duration = Math.floor((Date.now() - start) / 1000);
    await updateDoc(doc(db, "pregnancies", pregnancyId, "contractions", active.id), {
      endedAt: serverTimestamp(),
      duration,
    });
    setShowIntensity(active.id);
  }

  async function handleIntensity(contractionId, intensity) {
    await updateDoc(doc(db, "pregnancies", pregnancyId, "contractions", contractionId), { intensity });
    setShowIntensity(null);
  }

  const stats = calcStats(contractions);
  const completed = contractions.filter(c => c.endedAt);

  return (
    <div className="SCR">
      {/* Card principal — botão */}
      <div className="card fu">
        <div className="ctit"><span>⏱️</span>Contrações</div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {/* Timer */}
          <div style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: active ? 72 : 48,
            fontWeight: 300,
            color: active ? C.vinho : C.taupe,
            lineHeight: 1,
            transition: "font-size .3s",
          }}>
            {active ? fmt(elapsed) : "00:00"}
          </div>

          {active && (
            <div style={{ fontSize: 12, color: C.taupe, textAlign: "center" }}>
              Iniciou às {fmtTime(active.startedAt)}
            </div>
          )}

          {/* Botão principal */}
          {canEdit && (
            <button
              onClick={active ? handleStop : handleStart}
              style={{
                width: 160, height: 160, borderRadius: "50%",
                background: active
                  ? `linear-gradient(135deg, #ef4444, #b91c1c)`
                  : `linear-gradient(135deg, ${C.rosa}, ${C.vinho})`,
                border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: active
                  ? "0 8px 32px rgba(239,68,68,.35)"
                  : `0 8px 32px rgba(78,43,83,.28)`,
                transition: "all .3s",
                animation: active ? "kp 1.8s ease infinite" : "none",
              }}
            >
              <span style={{ fontSize: 36 }}>{active ? "⏹️" : "▶️"}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: "white",
                letterSpacing: 1, textTransform: "uppercase",
              }}>
                {active ? "Parar" : "Iniciar"}
              </span>
            </button>
          )}

          {!canEdit && (
            <div style={{
              background: `${C.bege}44`, borderRadius: 16, padding: "12px 20px",
              fontSize: 13, color: C.taupe, textAlign: "center",
            }}>
              👁️ Modo visualização — apenas a mãe e o pai podem registrar contrações
            </div>
          )}
        </div>
      </div>

      {/* Modal de intensidade */}
      {showIntensity && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(78,43,83,.5)",
          backdropFilter: "blur(4px)", zIndex: 200,
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            background: "white", borderRadius: "24px 24px 0 0",
            padding: "24px 20px 40px", width: "100%", maxWidth: 480, margin: "0 auto",
          }}>
            <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: 22, color: C.vinho, marginBottom: 6,
            }}>
              Intensidade da contração
            </div>
            <p style={{ fontSize: 13, color: C.taupe, marginBottom: 20 }}>
              Como foi essa contração?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INTENSITIES.map(i => (
                <button key={i.v} onClick={() => handleIntensity(showIntensity, i.v)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", background: `${C.bege}22`,
                  border: `1.5px solid ${C.bege}`, borderRadius: 14,
                  cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ fontSize: 24 }}>{i.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.vinho }}>{i.l}</div>
                    <div style={{ fontSize: 12, color: C.taupe }}>{i.desc}</div>
                  </div>
                </button>
              ))}
              <button onClick={() => handleIntensity(showIntensity, null)} style={{
                padding: "12px", background: "transparent", color: C.taupe,
                border: `1.5px solid ${C.bege}`, borderRadius: 14,
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
              }}>
                Pular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas da última hora */}
      <div className="card fu">
        <div className="ctit"><span>📊</span>Última hora</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { n: stats.count, l: "contrações" },
            { n: stats.avgDuration ? fmt(stats.avgDuration) : "—", l: "duração média" },
            { n: stats.avgInterval ? fmt(stats.avgInterval) : "—", l: "intervalo médio" },
          ].map((s, i) => (
            <div key={i} className="sbox">
              <span className="sn" style={{ fontSize: 18 }}>{s.n}</span>
              <span className="sl">{s.l}</span>
            </div>
          ))}
        </div>

        {/* Alerta de atenção */}
        {stats.avgInterval && stats.avgInterval <= 300 && stats.count >= 3 && (
          <div style={{
            marginTop: 14, background: "#fef3c7", border: "1px solid #f59e0b",
            borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#92400e",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠️ <strong>Contrações a cada {fmt(stats.avgInterval)}!</strong> Considere contatar sua equipe.
          </div>
        )}
      </div>

      {/* Histórico */}
      {completed.length > 0 && (
        <div className="card fu">
          <div className="ctit"><span>📋</span>Histórico da sessão</div>
          {completed.slice(0, 20).map((c, i) => {
            const intensity = INTENSITIES.find(x => x.v === c.intensity);
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", borderBottom: i < completed.length - 1 ? `1px solid ${C.bege}44` : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${C.bege}55`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
                }}>
                  {intensity?.emoji ?? "⚪"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>
                    {c.duration ? fmt(c.duration) : "—"} de duração
                  </div>
                  <div style={{ fontSize: 11, color: C.taupe }}>
                    {fmtTime(c.startedAt)} · {intensity?.l ?? "Intensidade não informada"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && contractions.length === 0 && (
        <div className="emp">
          <div style={{ fontSize: 40, marginBottom: 10 }}>⏱️</div>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 6 }}>
            Nenhuma contração ainda
          </div>
          <div style={{ fontSize: 13, color: C.taupe }}>
            Toque em Iniciar quando sentir a primeira contração
          </div>
        </div>
      )}
    </div>
  );
}
