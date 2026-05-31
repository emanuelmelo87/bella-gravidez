import { useState } from "react";
import { useMembers } from "../contexts/MembersContext";
import { usePregnancy } from "../contexts/PregnancyContext";
import { getColors } from "../styles/theme";

const PERMISSION_SECTIONS = [
  { key: "diary",        label: "Diário",              icon: "📖" },
  { key: "kicks",        label: "Chutes",               icon: "👣" },
  { key: "contractions", label: "Contrações",           icon: "⏱️" },
  { key: "health",       label: "Saúde",                icon: "🩺" },
  { key: "layette",      label: "Enxoval",              icon: "🛍️" },
  { key: "photos",       label: "Fotos",                icon: "📸" },
  { key: "songs",        label: "Músicas",              icon: "🎵" },
  { key: "birthPlan",    label: "Plano de Parto",       icon: "📋" },
  { key: "birthTrack",   label: "Trabalho de Parto",    icon: "🌟" },
  { key: "tips",         label: "Dicas Profissionais",  icon: "💡" },
];

const PERM_OPTS = [
  { v: "none", l: "Sem acesso", color: "#e5e7eb" },
  { v: "view", l: "Visualizar", color: "#fde68a" },
  { v: "edit", l: "Editar",     color: "#86efac" },
];

export default function Members({ onClose }) {
  const { members, loading, ROLE_LABELS, createInvite, updateMember, removeMember, updatePermissions } = useMembers();
  const { pregnancy } = usePregnancy();
  const C = getColors(pregnancy?.theme?.palette);

  const [sub, setSub] = useState("list");
  const [inviteRole, setInviteRole] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [copied, setCopied] = useState(false);

  const byRole = ["pai", "doula", "obstetra"].reduce((acc, r) => {
    acc[r] = members.filter(m => m.role === r);
    return acc;
  }, {});

  async function handleGenerateInvite(role) {
    setGenerating(true);
    const id = await createInvite(role);
    const base = window.location.origin + "/";
    setInviteLink(`${base}?invite=${id}`);
    setInviteRole(role);
    setGenerating(false);
    setSub("invite");
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "Convite Bella Gravidez", url: inviteLink });
    } else {
      handleCopy();
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Tabs */}
      {sub === "list" && (
        <>
          {/* Botões de convite */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.taupe, marginBottom: 10 }}>
              Convidar pessoa
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(ROLE_LABELS).map(([role, { label, icon }]) => (
                <button key={role} onClick={() => handleGenerateInvite(role)}
                  disabled={generating}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                    background: `${C.bege}33`, border: `1.5px solid ${C.bege}`,
                    borderRadius: 14, cursor: "pointer", textAlign: "left",
                    opacity: generating ? .5 : 1,
                  }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>Convidar {label}</div>
                    <div style={{ fontSize: 11, color: C.taupe }}>Gera link válido por 7 dias</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 16, color: C.rosa }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de membros */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: C.taupe, fontSize: 13 }}>Carregando...</div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 18, color: C.vinho, marginBottom: 4 }}>Nenhum membro ainda</div>
              <div style={{ fontSize: 13, color: C.taupe }}>Convide o pai, doula ou obstetra acima</div>
            </div>
          ) : (
            Object.entries(byRole).map(([role, list]) => list.length === 0 ? null : (
              <div key={role} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.taupe, marginBottom: 8 }}>
                  {ROLE_LABELS[role].icon} {ROLE_LABELS[role].label}
                </div>
                {list.map(m => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                    borderBottom: `1px solid ${C.bege}55`,
                  }}>
                    {m.userPhotoURL
                      ? <img src={m.userPhotoURL} alt="" style={{ width: 38, height: 38, borderRadius: "50%", border: `2px solid ${C.bege}` }} />
                      : <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${C.rosa}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{m.label || m.userName}</div>
                      <div style={{ fontSize: 11, color: C.taupe }}>
                        {m.status === "active" ? "● Ativo" : "○ Inativo"}
                        {m.isPrimary ? " · Principal" : " · Backup"}
                      </div>
                    </div>
                    <button onClick={() => { setEditMember(m); setSub("perms"); }}
                      style={{ background: "none", border: `1.5px solid ${C.bege}`, borderRadius: 10, padding: "6px 12px", fontSize: 11, color: C.taupe, cursor: "pointer" }}>
                      Permissões
                    </button>
                    <button onClick={() => removeMember(m.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: C.taupe, fontSize: 16, padding: 4 }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </>
      )}

      {/* Tela do link de convite */}
      {sub === "invite" && (
        <div>
          <button onClick={() => setSub("list")} style={{ background: "none", border: "none", cursor: "pointer", color: C.taupe, fontSize: 13, marginBottom: 16, padding: 0 }}>
            ← Voltar
          </button>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔗</div>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 4 }}>
              Link de convite — {ROLE_LABELS[inviteRole]?.label}
            </div>
            <div style={{ fontSize: 13, color: C.taupe, lineHeight: 1.5 }}>
              Compartilhe o link abaixo. Válido por 7 dias e só pode ser usado uma vez.
            </div>
          </div>

          <div style={{
            background: `${C.bege}33`, border: `1.5px solid ${C.bege}`,
            borderRadius: 12, padding: "12px 14px", fontSize: 12, color: C.vinho,
            wordBreak: "break-all", marginBottom: 14, lineHeight: 1.6,
          }}>
            {inviteLink}
          </div>

          <button onClick={handleShare} style={{
            width: "100%", padding: 14, background: C.vinho, color: C.bege,
            border: "none", borderRadius: 14, fontFamily: "'DM Sans',sans-serif",
            fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 8,
          }}>
            {copied ? "✅ Copiado!" : "📤 Compartilhar / Copiar link"}
          </button>
          <button onClick={() => { setInviteLink(null); setSub("list"); }} style={{
            width: "100%", padding: 12, background: "transparent", color: C.taupe,
            border: `1.5px solid ${C.bege}`, borderRadius: 14,
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
          }}>
            Gerar outro link
          </button>
        </div>
      )}

      {/* Tela de permissões */}
      {sub === "perms" && editMember && (
        <div>
          <button onClick={() => setSub("list")} style={{ background: "none", border: "none", cursor: "pointer", color: C.taupe, fontSize: 13, marginBottom: 16, padding: 0 }}>
            ← Voltar
          </button>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: C.vinho }}>
              {editMember.label || editMember.userName}
            </div>
            <div style={{ fontSize: 12, color: C.taupe }}>{ROLE_LABELS[editMember.role]?.icon} {ROLE_LABELS[editMember.role]?.label}</div>
          </div>

          {/* Toggle ativo/inativo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.bege}55`, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.vinho }}>Status</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["active", "inactive"].map(s => (
                <button key={s} onClick={() => updateMember(editMember.id, { status: s })}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                    border: `1.5px solid ${editMember.status === s ? C.rosa : C.bege}`,
                    background: editMember.status === s ? `${C.rosa}22` : "transparent",
                    color: editMember.status === s ? C.vinho : C.taupe,
                  }}>
                  {s === "active" ? "● Ativo" : "○ Inativo"}
                </button>
              ))}
            </div>
          </div>

          {/* Permissões por seção */}
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.taupe, marginBottom: 10 }}>
            Acesso por seção
          </div>
          {PERMISSION_SECTIONS.map(sec => {
            const curr = editMember.permissions?.[sec.key] ?? "none";
            return (
              <div key={sec.key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.vinho }}>{sec.icon} {sec.label}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {PERM_OPTS.map(opt => (
                    <button key={opt.v}
                      onClick={async () => {
                        const newPerms = { ...editMember.permissions, [sec.key]: opt.v };
                        await updatePermissions(editMember.id, newPerms);
                        setEditMember(p => ({ ...p, permissions: newPerms }));
                      }}
                      style={{
                        flex: 1, padding: "7px 4px", borderRadius: 10, fontSize: 11, cursor: "pointer",
                        border: `1.5px solid ${curr === opt.v ? C.rosa : C.bege}`,
                        background: curr === opt.v ? opt.color : "transparent",
                        color: curr === opt.v ? "#333" : C.taupe, fontWeight: curr === opt.v ? 600 : 400,
                      }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
