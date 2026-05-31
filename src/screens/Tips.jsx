import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useAuth } from "../contexts/AuthContext";
import { getColors } from "../styles/theme";

const CATEGORIES = [
  { v: "nutricao",     l: "Nutrição",       emoji: "🥗" },
  { v: "exercicio",    l: "Exercício",       emoji: "🤸" },
  { v: "emocional",    l: "Emocional",       emoji: "💙" },
  { v: "medico",       l: "Médico",          emoji: "🩺" },
  { v: "preparacao",   l: "Preparação",      emoji: "🎒" },
  { v: "amamentacao",  l: "Amamentação",     emoji: "🤱" },
  { v: "bebe",         l: "Sobre o bebê",    emoji: "👶" },
  { v: "geral",        l: "Geral",           emoji: "💡" },
];

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function Tips({ compact = false }) {
  const { pregnancy, myRole } = usePregnancy();
  const { user, isAdmin } = useAuth();
  const C = getColors(pregnancy?.theme?.palette);
  // Só profissionais (doula/obstetra) e admin CRIAM dicas. Mãe e pai só veem.
  const canEdit = isAdmin || myRole === "doula" || myRole === "obstetra";

  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("geral");
  const [scheduleWeek, setScheduleWeek] = useState("");
  const [saving, setSaving] = useState(false);

  const pregnancyId = pregnancy?.id;
  const currentWeek = pregnancy?.lmp
    ? Math.max(1, Math.min(42, Math.floor((Date.now() - new Date(pregnancy.lmp + "T12:00:00")) / 6048e5)))
    : null;

  // Firestore listener
  useEffect(() => {
    if (!pregnancyId) return;
    const q = query(
      collection(db, "pregnancies", pregnancyId, "tips"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setTips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [pregnancyId]);

  // Filtra dicas visíveis: publicadas agora OU semana agendada <= semana atual
  const visibleTips = tips.filter(t => {
    if (!t.scheduleWeek) return true;
    if (!currentWeek) return false;
    return t.scheduleWeek <= currentWeek;
  });

  // Dicas agendadas (para profissionais verem)
  const scheduledTips = canEdit ? tips.filter(t => t.scheduleWeek && currentWeek && t.scheduleWeek > currentWeek) : [];

  async function handleSave() {
    if (!title.trim() || !text.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "pregnancies", pregnancyId, "tips"), {
      title: title.trim(),
      text: text.trim(),
      category,
      scheduleWeek: scheduleWeek ? parseInt(scheduleWeek) : null,
      createdBy: user.uid,
      createdByName: user.displayName,
      createdByRole: myRole,
      createdAt: serverTimestamp(),
    });
    setTitle(""); setText(""); setCategory("geral"); setScheduleWeek("");
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(tipId) {
    await deleteDoc(doc(db, "pregnancies", pregnancyId, "tips", tipId));
  }

  const cat = v => CATEGORIES.find(c => c.v === v) ?? CATEGORIES[7];

  // Modo compacto: só mostra as últimas 2 dicas (para usar no Início)
  if (compact) {
    if (visibleTips.length === 0) return null;
    return (
      <div className="card fu">
        <div className="ctit"><span>💡</span>Dicas dos profissionais</div>
        {visibleTips.slice(0, 2).map(t => (
          <div key={t.id} style={{
            padding: "12px 0", borderBottom: `1px solid ${C.bege}44`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{cat(t.category).emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{t.title}</span>
            </div>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{t.text}</p>
            <div style={{ fontSize: 10, color: C.taupe, marginTop: 4 }}>
              {t.createdByName} · {fmtDate(t.createdAt)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="SCR grid">
      {/* Botão adicionar — só para profissionais */}
      {canEdit && (
        <button className="btnp fu" onClick={() => setShowForm(true)}>
          💡 Nova dica
        </button>
      )}

      {/* Dicas agendadas (só visível ao autor) */}
      {scheduledTips.length > 0 && (
        <div className="card fu" style={{ border: `1.5px dashed ${C.rosa}55` }}>
          <div className="ctit"><span>📅</span>Agendadas</div>
          <div style={{ fontSize: 12, color: C.taupe, marginBottom: 10 }}>
            Estas dicas ainda não apareceram para a gestante
          </div>
          {scheduledTips.map(t => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 0", borderBottom: `1px solid ${C.bege}44`,
            }}>
              <span style={{ fontSize: 18 }}>{cat(t.category).emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{t.title}</div>
                <div style={{ fontSize: 11, color: C.taupe }}>Aparece na semana {t.scheduleWeek}</div>
              </div>
              <button onClick={() => handleDelete(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.taupe }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dicas visíveis */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: C.taupe }}>Carregando...</div>
      ) : visibleTips.length === 0 ? (
        <div className="emp">
          <div style={{ fontSize: 40, marginBottom: 10 }}>💡</div>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 6 }}>
            {canEdit ? "Nenhuma dica publicada" : "Nenhuma dica ainda"}
          </div>
          <div style={{ fontSize: 13, color: C.taupe }}>
            {canEdit
              ? "Publique dicas personalizadas para sua paciente"
              : "Sua doula ou obstetra ainda não publicou dicas"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visibleTips.map(t => {
            const c = cat(t.category);
            const isOwner = t.createdBy === user?.uid;
            return (
              <div key={t.id} className="dcard fu">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `${C.bege}55`, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                    }}>
                      {c.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.vinho }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: C.taupe }}>
                        {c.l} · {t.createdByName} · {fmtDate(t.createdAt)}
                      </div>
                    </div>
                  </div>
                  {(isOwner || canEdit) && (
                    <button onClick={() => handleDelete(t.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.taupe, padding: 4, flexShrink: 0 }}>
                      🗑️
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{t.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de nova dica */}
      {showForm && (
        <div className="OVL" onClick={() => setShowForm(false)}>
          <div className="MDL" onClick={e => e.stopPropagation()}>
            <div className="mh" />
            <div className="mt">Nova dica</div>
            <div className="ms">Publique uma orientação personalizada</div>

            {/* Categoria */}
            <div className="fg">
              <div className="lbl">Categoria</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                {CATEGORIES.map(c => (
                  <button key={c.v} onClick={() => setCategory(c.v)} style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                    border: `1.5px solid ${category === c.v ? C.rosa : C.bege}`,
                    background: category === c.v ? `${C.rosa}22` : "transparent",
                    color: category === c.v ? C.vinho : C.taupe,
                  }}>
                    {c.emoji} {c.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div className="fg">
              <div className="lbl">Título</div>
              <input className="inp" placeholder="Ex: Hidratação no 3° trimestre"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* Texto */}
            <div className="fg">
              <div className="lbl">Dica</div>
              <textarea className="inp" rows={4}
                placeholder="Escreva a orientação para sua paciente..."
                value={text} onChange={e => setText(e.target.value)}
                style={{ resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* Agendar */}
            <div className="fg">
              <div className="lbl">Agendar para semana (opcional)</div>
              <input className="inp" type="number" min={1} max={42}
                placeholder={`Semana atual: ${currentWeek ?? "—"} · Deixe vazio para publicar agora`}
                value={scheduleWeek} onChange={e => setScheduleWeek(e.target.value)} />
              {scheduleWeek && (
                <div style={{ fontSize: 11, color: C.taupe, marginTop: 4 }}>
                  {parseInt(scheduleWeek) <= (currentWeek ?? 0)
                    ? "⚡ Será publicada imediatamente (semana já passou)"
                    : `📅 Aparecerá para a gestante na semana ${scheduleWeek}`}
                </div>
              )}
            </div>

            <button className="btnp" onClick={handleSave}
              disabled={!title.trim() || !text.trim() || saving}>
              {saving ? "Publicando..." : scheduleWeek && parseInt(scheduleWeek) > (currentWeek ?? 0)
                ? `📅 Agendar para semana ${scheduleWeek}`
                : "💡 Publicar agora"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
