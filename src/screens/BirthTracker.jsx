import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, addDoc, setDoc, deleteDoc,
  query, orderBy, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useAuth } from "../contexts/AuthContext";
import { getColors } from "../styles/theme";

const MILESTONES = [
  { key: "tampon",      label: "Tampão mucoso",          icon: "🔴", desc: "Saída do tampão cervical",                   repeatable: false },
  { key: "contractions_start", label: "Início das contrações", icon: "⏱️", desc: "Primeiras contrações percebidas",       repeatable: false },
  { key: "contractions_regular", label: "Contrações regulares", icon: "📊", desc: "A cada 5 min ou menos, mais de 1 hora", repeatable: false },
  { key: "water_break", label: "Bolsa rota",              icon: "💧", desc: "Ruptura da membrana amniótica",               repeatable: false },
  { key: "left_home",   label: "Saída para maternidade", icon: "🚗", desc: "Partida de casa",                             repeatable: false },
  { key: "hospital_admission", label: "Admissão na maternidade", icon: "🏥", desc: "Check-in no hospital",              repeatable: false },
  { key: "dilation",    label: "Dilatação",               icon: "📏", desc: "Registro de dilatação cervical",             repeatable: true,  extraLabel: "Centímetros (ex: 4cm)", extraPlaceholder: "4cm" },
  { key: "expulsive",   label: "Período expulsivo",       icon: "💪", desc: "Início dos puxos",                           repeatable: false },
  { key: "birth",       label: "Nascimento 🌟",           icon: "👶", desc: "O grande momento chegou!",                   repeatable: false,
    extras: [
      { key: "weight",  label: "Peso",        placeholder: "3.200g" },
      { key: "length",  label: "Comprimento", placeholder: "48cm" },
      { key: "apgar",   label: "Apgar",       placeholder: "9/10" },
    ]
  },
  { key: "custom",      label: "Evento personalizado",   icon: "✏️", desc: "Registre outro evento importante",           repeatable: true  },
];

function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function diffStr(a, b) {
  if (!a || !b) return null;
  const ta = a.toDate ? a.toDate() : new Date(a);
  const tb = b.toDate ? b.toDate() : new Date(b);
  const secs = Math.abs(Math.floor((tb - ta) / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function BirthTracker() {
  const { pregnancy, can } = usePregnancy();
  const { user } = useAuth();
  const C = getColors(pregnancy?.theme?.palette);
  const canEdit = can("birthTrack", "edit");

  const [session, setSession] = useState(null);   // sessão ativa
  const [events, setEvents] = useState([]);        // eventos registrados
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);        // { milestone } ou null
  const [extraValues, setExtraValues] = useState({});
  const [notes, setNotes] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const pregnancyId = pregnancy?.id;

  // Listeners Firestore
  useEffect(() => {
    if (!pregnancyId) return;

    const sessionUnsub = onSnapshot(
      doc(db, "pregnancies", pregnancyId, "birthSession", "current"),
      snap => setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    );

    const eventsUnsub = onSnapshot(
      query(collection(db, "pregnancies", pregnancyId, "birthEvents"), orderBy("occurredAt", "asc")),
      snap => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );

    return () => { sessionUnsub(); eventsUnsub(); };
  }, [pregnancyId]);

  async function startLabor() {
    await setDoc(doc(db, "pregnancies", pregnancyId, "birthSession", "current"), {
      startedAt: serverTimestamp(),
      endedAt: null,
      startedBy: user.uid,
    });
  }

  async function endLabor() {
    const birth = events.find(e => e.milestoneKey === "birth");
    await setDoc(doc(db, "pregnancies", pregnancyId, "birthSession", "current"), {
      endedAt: serverTimestamp(),
    }, { merge: true });
    setShowSummary(true);
  }

  function openMilestone(ms) {
    setModal(ms);
    setExtraValues({});
    setNotes("");
    setCustomLabel("");
  }

  async function registerEvent() {
    if (!modal) return;
    if (modal.key === "custom" && !customLabel.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "pregnancies", pregnancyId, "birthEvents"), {
      milestoneKey: modal.key,
      milestoneLabel: modal.key === "custom" ? customLabel.trim() : modal.label,
      milestoneIcon: modal.icon,
      notes: notes.trim(),
      extras: extraValues,
      occurredAt: serverTimestamp(),
      registeredBy: user.uid,
      registeredByName: user.displayName,
    });
    setSaving(false);
    setModal(null);
  }

  async function deleteEvent(id) {
    await deleteDoc(doc(db, "pregnancies", pregnancyId, "birthEvents", id));
  }

  // Quais marcos já foram registrados (não repetíveis)
  const registeredKeys = new Set(events.filter(e => {
    const ms = MILESTONES.find(m => m.key === e.milestoneKey);
    return ms && !ms.repeatable;
  }).map(e => e.milestoneKey));

  const birthEvent = events.find(e => e.milestoneKey === "birth");
  const laborEnded = !!session?.endedAt;

  return (
    <div className="SCR">

      {/* Estado: sem sessão ativa */}
      {!session && !loading && (
        <div className="card fu" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, color: C.vinho, marginBottom: 8 }}>
            Trabalho de Parto
          </div>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
            Quando o trabalho de parto começar, ative o rastreamento. Toda a equipe poderá registrar e acompanhar os marcos em tempo real.
          </p>
          {canEdit && (
            <button onClick={startLabor} style={{
              padding: "16px 32px", background: `linear-gradient(135deg, ${C.rosa}, ${C.vinho})`,
              color: "white", border: "none", borderRadius: 16,
              fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer",
              boxShadow: `0 8px 24px rgba(78,43,83,.25)`,
            }}>
              🌸 Iniciar acompanhamento
            </button>
          )}
          {events.length > 0 && (
            <button onClick={() => setShowSummary(true)} style={{
              marginTop: 12, padding: "10px 20px", background: "transparent",
              color: C.taupe, border: `1.5px solid ${C.bege}`, borderRadius: 12,
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", display: "block", width: "100%",
            }}>
              Ver histórico anterior
            </button>
          )}
        </div>
      )}

      {/* Sessão ativa */}
      {session && !laborEnded && (
        <>
          {/* Status header */}
          <div className="card fu" style={{ background: `linear-gradient(135deg, ${C.vinho}, #2d1533)`, color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: .7 }}>Em andamento</div>
                <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22 }}>Trabalho de Parto</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, opacity: .7 }}>Iniciou às</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{fmtTime(session.startedAt)}</div>
                <div style={{ fontSize: 11, opacity: .7 }}>{fmtDate(session.startedAt)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "kp 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, opacity: .8 }}>{events.length} evento{events.length !== 1 ? "s" : ""} registrado{events.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Timeline de eventos já registrados */}
          {events.length > 0 && (
            <div className="card fu">
              <div className="ctit"><span>📍</span>Timeline</div>
              {events.map((ev, i) => (
                <div key={ev.id} style={{ display: "flex", gap: 12, marginBottom: i < events.length - 1 ? 16 : 0, position: "relative" }}>
                  {i < events.length - 1 && (
                    <div style={{ position: "absolute", left: 17, top: 36, bottom: -16, width: 2, background: `${C.bege}`, zIndex: 0 }} />
                  )}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: ev.milestoneKey === "birth" ? `linear-gradient(135deg, ${C.rosa}, ${C.vinho})` : `${C.bege}77`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, zIndex: 1, border: `2px solid white`,
                    boxShadow: ev.milestoneKey === "birth" ? `0 4px 12px rgba(78,43,83,.3)` : "none",
                  }}>
                    {ev.milestoneIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{ev.milestoneLabel}</div>
                      {canEdit && (
                        <button onClick={() => deleteEvent(ev.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.taupe, fontSize: 13, padding: 2 }}>✕</button>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.taupe }}>{fmtTime(ev.occurredAt)} · {ev.registeredByName}</div>
                    {ev.notes && <div style={{ fontSize: 12, color: "#555", marginTop: 3, fontStyle: "italic" }}>{ev.notes}</div>}
                    {ev.extras && Object.entries(ev.extras).filter(([,v]) => v).map(([k, v]) => (
                      <span key={k} style={{
                        display: "inline-block", marginTop: 4, marginRight: 6,
                        background: `${C.bege}55`, borderRadius: 20, padding: "2px 10px",
                        fontSize: 11, color: C.vinho,
                      }}>
                        {k === "weight" ? "⚖️" : k === "length" ? "📏" : "💯"} {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Marcos disponíveis */}
          {canEdit && (
            <div className="card fu">
              <div className="ctit"><span>➕</span>Registrar marco</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MILESTONES.map(ms => {
                  const done = registeredKeys.has(ms.key) && !ms.repeatable;
                  return (
                    <button key={ms.key + (ms.repeatable ? Date.now() : "")}
                      onClick={() => !done && openMilestone(ms)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        background: done ? `${C.bege}22` : `${C.bege}44`,
                        border: `1.5px solid ${done ? C.bege : C.bege}`,
                        borderRadius: 14, cursor: done ? "default" : "pointer", textAlign: "left",
                        opacity: done ? .5 : 1,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{ms.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: done ? C.taupe : C.vinho }}>
                          {ms.label} {ms.repeatable && <span style={{ fontSize: 10, color: C.taupe }}>(repetível)</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.taupe }}>{ms.desc}</div>
                      </div>
                      {done
                        ? <span style={{ fontSize: 16, color: C.verde }}>✅</span>
                        : <span style={{ fontSize: 16, color: C.rosa }}>+</span>
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Encerrar */}
          {canEdit && birthEvent && (
            <button onClick={endLabor} style={{
              width: "100%", padding: 14, background: "#22c55e",
              color: "white", border: "none", borderRadius: 14,
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>
              🌟 Encerrar — Bebê nasceu!
            </button>
          )}
        </>
      )}

      {/* Resumo pós-parto */}
      {showSummary && events.length > 0 && (
        <div className="card fu">
          <div className="ctit"><span>🌟</span>Resumo do Parto</div>
          {birthEvent && (
            <div style={{
              background: `linear-gradient(135deg, ${C.rosa}22, ${C.bege}44)`,
              borderRadius: 16, padding: 16, marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👶</div>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, color: C.vinho }}>
                {pregnancy?.babyNickname ? `${pregnancy.babyNickname} chegou!` : "O bebê chegou!"}
              </div>
              <div style={{ fontSize: 13, color: C.taupe, marginTop: 4 }}>
                {fmtDate(birthEvent.occurredAt)} às {fmtTime(birthEvent.occurredAt)}
              </div>
              {birthEvent.extras && (
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
                  {birthEvent.extras.weight && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 600, color: C.vinho }}>{birthEvent.extras.weight}</div><div style={{ fontSize: 10, color: C.taupe }}>peso</div></div>}
                  {birthEvent.extras.length && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 600, color: C.vinho }}>{birthEvent.extras.length}</div><div style={{ fontSize: 10, color: C.taupe }}>comprimento</div></div>}
                  {birthEvent.extras.apgar && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 600, color: C.vinho }}>{birthEvent.extras.apgar}</div><div style={{ fontSize: 10, color: C.taupe }}>apgar</div></div>}
                </div>
              )}
              {session?.startedAt && birthEvent.occurredAt && (
                <div style={{ fontSize: 12, color: C.taupe, marginTop: 8 }}>
                  Duração total: <strong>{diffStr(session.startedAt, birthEvent.occurredAt)}</strong>
                </div>
              )}
            </div>
          )}
          {events.map((ev, i) => (
            <div key={ev.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0", borderBottom: i < events.length - 1 ? `1px solid ${C.bege}44` : "none",
            }}>
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{ev.milestoneIcon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.vinho, fontWeight: 500 }}>{ev.milestoneLabel}</div>
                {ev.notes && <div style={{ fontSize: 11, color: "#555" }}>{ev.notes}</div>}
              </div>
              <div style={{ fontSize: 11, color: C.taupe, textAlign: "right" }}>
                {fmtTime(ev.occurredAt)}
                {i > 0 && events[i - 1].occurredAt && (
                  <div style={{ fontSize: 10 }}>+{diffStr(events[i - 1].occurredAt, ev.occurredAt)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de registro */}
      {modal && (
        <div className="OVL" onClick={() => setModal(null)}>
          <div className="MDL" onClick={e => e.stopPropagation()}>
            <div className="mh" />
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>{modal.icon}</div>
            <div className="mt" style={{ textAlign: "center" }}>{modal.label}</div>
            <div className="ms" style={{ textAlign: "center" }}>{modal.desc}</div>

            {/* Campo personalizado para evento livre */}
            {modal.key === "custom" && (
              <div className="fg">
                <div className="lbl">Nome do evento</div>
                <input className="inp" placeholder="Ex: Anestesia peridural aplicada..."
                  value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
              </div>
            )}

            {/* Campo extra para dilatação */}
            {modal.extraLabel && (
              <div className="fg">
                <div className="lbl">{modal.extraLabel}</div>
                <input className="inp" placeholder={modal.extraPlaceholder}
                  value={extraValues[modal.key] ?? ""}
                  onChange={e => setExtraValues(p => ({ ...p, [modal.key]: e.target.value }))} />
              </div>
            )}

            {/* Campos extras para nascimento */}
            {modal.extras?.map(ex => (
              <div key={ex.key} className="fg">
                <div className="lbl">{ex.label}</div>
                <input className="inp" placeholder={ex.placeholder}
                  value={extraValues[ex.key] ?? ""}
                  onChange={e => setExtraValues(p => ({ ...p, [ex.key]: e.target.value }))} />
              </div>
            ))}

            {/* Observações */}
            <div className="fg">
              <div className="lbl">Observações (opcional)</div>
              <textarea className="inp" rows={3} placeholder="Detalhes, horário exato, quem estava presente..."
                value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: "vertical", lineHeight: 1.6 }} />
            </div>

            <button className="btnp" onClick={registerEvent}
              disabled={saving || (modal.key === "custom" && !customLabel.trim())}>
              {saving ? "Registrando..." : `✅ Registrar agora`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
