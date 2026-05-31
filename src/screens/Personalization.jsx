import { useState } from "react";
import { usePregnancy } from "../contexts/PregnancyContext";
import { getColors, PALETTES, PALETTE_LABELS } from "../styles/theme";

export default function Personalization({ onClose }) {
  const { pregnancy, updatePregnancy } = usePregnancy();
  const C = getColors(pregnancy?.theme?.palette);

  const [nickname, setNickname] = useState(pregnancy?.babyNickname ?? "");
  const [palette, setPalette] = useState(pregnancy?.theme?.palette ?? "rosa-bella");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updatePregnancy({
      babyNickname: nickname.trim(),
      theme: { palette },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  const preview = getColors(palette);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* Apelido do bebê */}
      <div style={{ marginBottom: 24 }}>
        <label style={{
          display: "block", fontSize: 10, fontWeight: 500,
          letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 8,
        }}>
          Apelido do bebê
        </label>
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Ex: Sofia, Miguelzinho, Bolinha..."
          style={{
            width: "100%", padding: "12px 14px",
            border: `1.5px solid ${C.bege}`, borderRadius: 12,
            background: "rgba(238,209,184,.15)", fontFamily: "'DM Sans',sans-serif",
            fontSize: 14, color: C.vinho, outline: "none",
          }}
        />
        <div style={{ fontSize: 11, color: C.taupe, marginTop: 6 }}>
          Aparece no cabeçalho do app no lugar de "Gravidez"
        </div>
      </div>

      {/* Preview do header */}
      <div style={{
        background: preview.vinho, borderRadius: 16, padding: "14px 18px",
        marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: 18, fontWeight: 300, color: preview.bege,
        }}>
          Bella{" "}
          <em style={{ fontStyle: "italic", color: preview.rosa }}>
            {nickname.trim() || "Gravidez"}
          </em>
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(238,209,184,.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: preview.bege,
        }}>⚙️</div>
      </div>

      {/* Paleta de cores */}
      <div style={{ marginBottom: 24 }}>
        <label style={{
          display: "block", fontSize: 10, fontWeight: 500,
          letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 12,
        }}>
          Tema de cores
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(PALETTE_LABELS).map(([key, label]) => {
            const p = PALETTES[key];
            const isSelected = palette === key;
            return (
              <button
                key={key}
                onClick={() => setPalette(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${isSelected ? p.rosa : "transparent"}`,
                  background: isSelected ? `${p.bege}55` : `${p.bg}`,
                  transition: "all .2s",
                  boxShadow: isSelected ? `0 0 0 1px ${p.rosa}44` : "none",
                }}
              >
                {/* Bolinhas de cor */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {[p.vinho, p.rosa, p.bege, p.verde].map((cor, i) => (
                    <div key={i} style={{
                      width: 18, height: 18, borderRadius: "50%", background: cor,
                      border: "1.5px solid rgba(0,0,0,.08)",
                    }} />
                  ))}
                </div>
                {/* Nome */}
                <span style={{
                  fontSize: 13, fontWeight: isSelected ? 500 : 400,
                  color: isSelected ? p.vinho : "#555", flex: 1,
                }}>
                  {label}
                </span>
                {/* Check */}
                {isSelected && (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: p.rosa, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "white", flexShrink: 0,
                  }}>✓</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%", padding: 14,
          background: saved ? "#22c55e" : preview.vinho,
          color: preview.bege, border: "none", borderRadius: 14,
          fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? .7 : 1, transition: "background .3s",
        }}
      >
        {saved ? "✅ Salvo!" : saving ? "Salvando..." : "Salvar personalização"}
      </button>
    </div>
  );
}
