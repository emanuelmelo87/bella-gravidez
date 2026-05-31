import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, orderBy, where, getDocs, serverTimestamp, addDoc, updateDoc, getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const C = {
  vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8",
  rosa: "#c38a97", verde: "#9fb0a0", bg: "#f7ece0",
};
const SF = "'Cormorant Garamond',Georgia,serif";

const DEFAULT_MILESTONES = [
  { key: "tampon",               label: "Tampão mucoso",           icon: "🔴", order: 1, repeatable: false },
  { key: "contractions_start",   label: "Início das contrações",   icon: "⏱️", order: 2, repeatable: false },
  { key: "contractions_regular", label: "Contrações regulares",    icon: "📊", order: 3, repeatable: false },
  { key: "water_break",          label: "Bolsa rota",              icon: "💧", order: 4, repeatable: false },
  { key: "left_home",            label: "Saída para maternidade",  icon: "🚗", order: 5, repeatable: false },
  { key: "hospital_admission",   label: "Admissão na maternidade", icon: "🏥", order: 6, repeatable: false },
  { key: "dilation",             label: "Dilatação",               icon: "📏", order: 7, repeatable: true  },
  { key: "expulsive",            label: "Período expulsivo",       icon: "💪", order: 8, repeatable: false },
  { key: "birth",                label: "Nascimento 🌟",           icon: "👶", order: 9, repeatable: false },
  { key: "custom",               label: "Evento personalizado",    icon: "✏️", order: 10, repeatable: true },
];

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("metrics");
  const [isAdmin, setIsAdmin] = useState(null); // null=loading, false=denied, true=ok

  // Dados
  const [admins, setAdmins] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [pregnancies, setPregnancies] = useState([]);
  const [metrics, setMetrics] = useState({ pregnancies: 0, users: 0, members: 0 });

  // Forms
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newMs, setNewMs] = useState({ label: "", icon: "✨", repeatable: false });
  const [editMs, setEditMs] = useState(null);
  const [saving, setSaving] = useState(false);

  // Verifica se é admin
  useEffect(() => {
    if (!user) return;
    async function check() {
      try {
        // Busca o documento do admin pelo UID
        const ref = doc(db, "platform", "admins", "list", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().active !== false) {
          setIsAdmin(true);
          return;
        }

        // Não existe — cria automaticamente (qualquer usuário logado vira admin na primeira vez)
        // Depois que entrar, o admin pode remover outros e manter só os que quiser
        await setDoc(ref, {
          email: user.email,
          uid: user.uid,
          name: user.displayName,
          addedAt: serverTimestamp(),
          active: true,
        });
        setIsAdmin(true);
      } catch (e) {
        console.error("Admin check:", e.code, e.message);
        setIsAdmin(false);
      }
    }
    check();
  }, [user]);

  // Carrega dados quando admin confirmado
  useEffect(() => {
    if (!isAdmin) return;

    // Admins
    const unsubAdmins = onSnapshot(
      collection(db, "platform", "admins", "list"),
      snap => setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // Milestones — coleção própria na raiz para simplificar
    const unsubMs = onSnapshot(
      collection(db, "platformMilestones"),
      snap => {
        if (snap.empty) {
          DEFAULT_MILESTONES.forEach(ms =>
            setDoc(doc(db, "platformMilestones", ms.key), ms)
          );
        } else {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMilestones(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        }
      },
      err => console.error("milestones error:", err)
    );

    // Gestações
    const unsubPreg = onSnapshot(
      collection(db, "pregnancies"),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPregnancies(list);
        setMetrics(m => ({ ...m, pregnancies: list.length }));
      }
    );

    // Membros
    const unsubMembers = onSnapshot(
      collection(db, "pregnancyMembers"),
      snap => setMetrics(m => ({ ...m, members: snap.size }))
    );

    // Usuários
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      snap => setMetrics(m => ({ ...m, users: snap.size }))
    );

    return () => {
      unsubAdmins(); unsubMs(); unsubPreg(); unsubMembers(); unsubUsers();
    };
  }, [isAdmin]);

  // Loading
  if (isAdmin === null) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <span style={{ fontFamily: SF, fontSize: 24, color: C.vinho }}>Verificando acesso...</span>
    </div>
  );

  // Sem acesso
  if (!isAdmin) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: C.bg,
      fontFamily: "'DM Sans',sans-serif", gap: 16, padding: 20,
    }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontFamily: SF, fontSize: 24, color: C.vinho }}>Acesso restrito</div>
      <div style={{ fontSize: 14, color: C.taupe, textAlign: "center" }}>
        Você não tem permissão para acessar o painel administrativo.
      </div>
      <div style={{ fontSize: 12, color: C.taupe }}>{user?.email}</div>
      <button onClick={logout} style={{
        padding: "10px 24px", background: C.vinho, color: C.bege,
        border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13,
      }}>Sair</button>
      <button onClick={() => window.location.href = "/bella-gravidez/"} style={{
        padding: "10px 24px", background: "transparent", color: C.taupe,
        border: `1.5px solid ${C.bege}`, borderRadius: 12, cursor: "pointer", fontSize: 13,
      }}>Ir para o app</button>
    </div>
  );

  async function addAdmin() {
    if (!newAdminEmail.trim()) return;
    setSaving(true);
    // Cria entrada com email — uid será preenchido quando a pessoa logar pela primeira vez
    const id = newAdminEmail.trim().replace(/[^a-zA-Z0-9]/g, "_");
    await setDoc(doc(db, "platform", "admins", "list", id), {
      email: newAdminEmail.trim(),
      addedBy: user.uid,
      addedByEmail: user.email,
      addedAt: serverTimestamp(),
      active: true,
    });
    setNewAdminEmail("");
    setSaving(false);
  }

  async function removeAdmin(id) {
    if (id === user.uid) return; // não pode remover a si mesmo
    await deleteDoc(doc(db, "platform", "admins", "list", id));
  }

  async function addMilestone() {
    if (!newMs.label.trim()) return;
    setSaving(true);
    const key = newMs.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "") + "_" + Date.now();
    await setDoc(doc(db, "platformMilestones", key), {
      key,
      label: newMs.label.trim(),
      icon: newMs.icon,
      repeatable: newMs.repeatable,
      order: (milestones.length + 1) * 10,
      active: true,
      createdAt: serverTimestamp(),
    });
    setNewMs({ label: "", icon: "✨", repeatable: false });
    setSaving(false);
  }

  async function toggleMilestone(id, active) {
    await updateDoc(doc(db, "platformMilestones", id), { active });
  }

  async function saveMilestone() {
    if (!editMs) return;
    await updateDoc(doc(db, "platformMilestones", editMs.id), {
      label: editMs.label,
      icon: editMs.icon,
      repeatable: editMs.repeatable,
    });
    setEditMs(null);
  }

  const TABS = [
    { id: "metrics",     l: "📊 Métricas" },
    { id: "pregnancies", l: "🤰 Gestações" },
    { id: "milestones",  l: "🌟 Marcos" },
    { id: "admins",      l: "👑 Admins" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.vinho, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: SF, fontSize: 22, color: C.bege }}>
            Bella <em style={{ color: C.rosa }}>Admin</em>
          </div>
          <div style={{ fontSize: 11, color: "rgba(238,209,184,.5)", marginTop: 2 }}>{user?.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.location.href = "/bella-gravidez/"} style={{
            padding: "8px 14px", background: "rgba(238,209,184,.15)", color: C.bege,
            border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12,
          }}>← App</button>
          <button onClick={logout} style={{
            padding: "8px 14px", background: "transparent", color: C.taupe,
            border: `1px solid ${C.bege}44`, borderRadius: 10, cursor: "pointer", fontSize: 12,
          }}>Sair</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "12px 16px", background: "white", borderBottom: `1px solid ${C.bege}`, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            background: tab === t.id ? C.vinho : "transparent",
            color: tab === t.id ? "white" : C.taupe,
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
            whiteSpace: "nowrap",
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>

        {/* ── MÉTRICAS ── */}
        {tab === "metrics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { n: metrics.pregnancies, l: "Gestações",  ic: "🤰" },
                { n: metrics.users,       l: "Usuários",   ic: "👤" },
                { n: metrics.members,     l: "Membros",    ic: "👥" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: 16, padding: 16, textAlign: "center",
                  border: `1px solid ${C.bege}`, boxShadow: "0 2px 8px rgba(78,43,83,.06)",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{m.ic}</div>
                  <div style={{ fontFamily: SF, fontSize: 32, color: C.vinho, lineHeight: 1 }}>{m.n}</div>
                  <div style={{ fontSize: 11, color: C.taupe, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}` }}>
              <div style={{ fontFamily: SF, fontSize: 18, color: C.vinho, marginBottom: 12 }}>Gestações recentes</div>
              {pregnancies.slice(0, 5).map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: `1px solid ${C.bege}44`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>
                      {p.babyNickname ? `Bebê ${p.babyNickname}` : "Gestação"}
                    </div>
                    <div style={{ fontSize: 11, color: C.taupe }}>DPP: {p.dpp ?? "—"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.taupe }}>{fmtDate(p.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GESTAÇÕES ── */}
        {tab === "pregnancies" && (
          <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}` }}>
            <div style={{ fontFamily: SF, fontSize: 20, color: C.vinho, marginBottom: 4 }}>
              {pregnancies.length} gestações cadastradas
            </div>
            <div style={{ fontSize: 12, color: C.taupe, marginBottom: 16 }}>Visão geral de todas as gestações na plataforma</div>
            {pregnancies.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: C.taupe }}>Nenhuma gestação ainda</div>
            ) : pregnancies.map(p => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                borderBottom: `1px solid ${C.bege}44`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.rosa}44, ${C.bege})`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>🤰</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.vinho }}>
                    {p.babyNickname ? `Bebê ${p.babyNickname}` : "Sem apelido"}
                  </div>
                  <div style={{ fontSize: 11, color: C.taupe }}>
                    DPP: {p.dpp ?? "—"} · Tema: {p.theme?.palette ?? "rosa-bella"}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.taupe, textAlign: "right" }}>
                  {fmtDate(p.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MARCOS ── */}
        {tab === "milestones" && (
          <div>
            {/* Adicionar novo marco */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}`, marginBottom: 16 }}>
              <div style={{ fontFamily: SF, fontSize: 18, color: C.vinho, marginBottom: 14 }}>Adicionar marco</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={newMs.icon} onChange={e => setNewMs(p => ({ ...p, icon: e.target.value }))}
                  style={{ width: 52, padding: "10px 8px", border: `1.5px solid ${C.bege}`, borderRadius: 10, fontSize: 20, textAlign: "center" }} />
                <input placeholder="Nome do marco..." value={newMs.label}
                  onChange={e => setNewMs(p => ({ ...p, label: e.target.value }))}
                  style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${C.bege}`, borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.taupe, cursor: "pointer" }}>
                  <input type="checkbox" checked={newMs.repeatable}
                    onChange={e => setNewMs(p => ({ ...p, repeatable: e.target.checked }))} />
                  Repetível (ex: dilatação)
                </label>
              </div>
              <button onClick={addMilestone} disabled={!newMs.label.trim() || saving} style={{
                width: "100%", padding: 12, background: C.vinho, color: C.bege,
                border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500,
              }}>
                + Adicionar marco
              </button>
            </div>

            {/* Lista de marcos */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}` }}>
              <div style={{ fontFamily: SF, fontSize: 18, color: C.vinho, marginBottom: 14 }}>
                Marcos da plataforma ({milestones.length})
              </div>
              {milestones.map(ms => (
                <div key={ms.id}>
                  {editMs?.id === ms.id ? (
                    <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.bege}44` }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={editMs.icon} onChange={e => setEditMs(p => ({ ...p, icon: e.target.value }))}
                          style={{ width: 52, padding: "8px", border: `1.5px solid ${C.rosa}`, borderRadius: 10, fontSize: 20, textAlign: "center" }} />
                        <input value={editMs.label} onChange={e => setEditMs(p => ({ ...p, label: e.target.value }))}
                          style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.rosa}`, borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }} />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.taupe, marginBottom: 8 }}>
                        <input type="checkbox" checked={editMs.repeatable}
                          onChange={e => setEditMs(p => ({ ...p, repeatable: e.target.checked }))} />
                        Repetível
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={saveMilestone} style={{
                          flex: 1, padding: "8px", background: C.verde, color: "white",
                          border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12,
                        }}>✓ Salvar</button>
                        <button onClick={() => setEditMs(null)} style={{
                          flex: 1, padding: "8px", background: "transparent", color: C.taupe,
                          border: `1.5px solid ${C.bege}`, borderRadius: 10, cursor: "pointer", fontSize: 12,
                        }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                      borderBottom: `1px solid ${C.bege}44`,
                      opacity: ms.active === false ? .4 : 1,
                    }}>
                      <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{ms.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{ms.label}</div>
                        <div style={{ fontSize: 10, color: C.taupe }}>
                          Ordem {ms.order} · {ms.repeatable ? "Repetível" : "Único"}
                          {ms.active === false && " · Inativo"}
                        </div>
                      </div>
                      <button onClick={() => setEditMs(ms)} style={{
                        padding: "5px 10px", background: "transparent", color: C.taupe,
                        border: `1.5px solid ${C.bege}`, borderRadius: 8, cursor: "pointer", fontSize: 11,
                      }}>✏️</button>
                      <button onClick={() => toggleMilestone(ms.id, ms.active === false)} style={{
                        padding: "5px 10px", background: "transparent",
                        color: ms.active === false ? C.verde : "#ef4444",
                        border: `1.5px solid ${ms.active === false ? C.verde : "#ef4444"}44`,
                        borderRadius: 8, cursor: "pointer", fontSize: 11,
                      }}>
                        {ms.active === false ? "Ativar" : "Desativar"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMINS ── */}
        {tab === "admins" && (
          <div>
            {/* Adicionar admin */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}`, marginBottom: 16 }}>
              <div style={{ fontFamily: SF, fontSize: 18, color: C.vinho, marginBottom: 14 }}>Adicionar admin</div>
              <input
                placeholder="email@exemplo.com"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addAdmin()}
                style={{
                  width: "100%", padding: "12px 14px", border: `1.5px solid ${C.bege}`,
                  borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: 14,
                  marginBottom: 10, boxSizing: "border-box",
                }}
              />
              <button onClick={addAdmin} disabled={!newAdminEmail.trim() || saving} style={{
                width: "100%", padding: 12, background: C.vinho, color: C.bege,
                border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500,
              }}>
                👑 Adicionar como master admin
              </button>
              <div style={{ fontSize: 11, color: C.taupe, marginTop: 8, lineHeight: 1.5 }}>
                A pessoa precisará fazer login com o Google usando este email para acessar o painel.
              </div>
            </div>

            {/* Lista de admins */}
            <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${C.bege}` }}>
              <div style={{ fontFamily: SF, fontSize: 18, color: C.vinho, marginBottom: 14 }}>
                Admins ({admins.length})
              </div>
              {admins.map(a => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderBottom: `1px solid ${C.bege}44`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.rosa}44, ${C.bege})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>👑</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{a.email}</div>
                    <div style={{ fontSize: 11, color: C.taupe }}>
                      Adicionado em {fmtDate(a.addedAt)}
                      {a.addedByEmail && ` por ${a.addedByEmail}`}
                    </div>
                  </div>
                  {a.id !== user.uid && (
                    <button onClick={() => removeAdmin(a.id)} style={{
                      padding: "6px 12px", background: "transparent", color: "#ef4444",
                      border: "1.5px solid #ef444444", borderRadius: 10, cursor: "pointer", fontSize: 12,
                    }}>Remover</button>
                  )}
                  {a.id === user.uid && (
                    <span style={{ fontSize: 11, color: C.verde, fontWeight: 500 }}>Você</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
