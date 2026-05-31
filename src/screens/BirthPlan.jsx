import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useAuth } from "../contexts/AuthContext";
import { getColors } from "../styles/theme";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SECTIONS = [
  {
    key: "companions",
    title: "Acompanhantes",
    icon: "👥",
    options: [
      "Parceiro(a) presente",
      "Doula presente",
      "Familiar de escolha",
      "Somente equipe médica",
      "Fotógrafo de parto",
    ],
  },
  {
    key: "environment",
    title: "Ambiente",
    icon: "🌿",
    options: [
      "Luz baixa / penumbra",
      "Música ambiente",
      "Aromaterapia",
      "Silêncio e tranquilidade",
      "Temperatura agradável",
      "Entrada mínima de pessoas",
    ],
  },
  {
    key: "painRelief",
    title: "Alívio da Dor",
    icon: "💙",
    options: [
      "Parto sem analgesia (natural)",
      "Analgesia peridural",
      "Banheira / chuveiro",
      "Massagem e técnicas manuais",
      "Bola de pilates",
      "Movimentação livre",
      "Óxido nitroso (se disponível)",
    ],
  },
  {
    key: "position",
    title: "Posição do Parto",
    icon: "🤱",
    options: [
      "Posição livre / à minha escolha",
      "Deitada (litotomia)",
      "De cócoras",
      "De lado",
      "Na água",
      "De quatro apoios",
    ],
  },
  {
    key: "cord",
    title: "Cordão Umbilical",
    icon: "🔗",
    options: [
      "Esperar pulsar antes de cortar",
      "Parceiro(a) corta o cordão",
      "Corte imediato (se necessário)",
      "Doação do sangue do cordão",
    ],
  },
  {
    key: "skinToSkin",
    title: "Contato Pele a Pele",
    icon: "🫂",
    options: [
      "Contato pele a pele imediato",
      "Antes de pesar e medir",
      "Pelo menos 1 hora sem interrupção",
      "Pai/parceiro(a) também",
      "Se cesárea: contato na sala cirúrgica",
    ],
  },
  {
    key: "breastfeeding",
    title: "Amamentação",
    icon: "🍼",
    options: [
      "Amamentar na sala de parto",
      "Sem oferecer chupeta",
      "Sem fórmula sem minha autorização",
      "Apoio de consultora de amamentação",
    ],
  },
  {
    key: "cesarean",
    title: "Em caso de Cesárea",
    icon: "🏥",
    options: [
      "Cortina transparente (gentle cesarean)",
      "Música de minha escolha",
      "Acompanhante presente",
      "Anestesia com explicação prévia",
      "Ver o bebê imediatamente",
      "Pele a pele na mesa cirúrgica",
    ],
  },
  {
    key: "newborn",
    title: "Cuidados com o Recém-nascido",
    icon: "👶",
    options: [
      "Sem banho imediato (preservar vérnix)",
      "Vitamina K oral (em vez de injeção)",
      "Colírio sem apressar",
      "Pesagem após contato pele a pele",
      "Berçário somente se necessário",
    ],
  },
];

export default function BirthPlan() {
  const { pregnancy, can } = usePregnancy();
  const { user } = useAuth();
  const C = getColors(pregnancy?.theme?.palette);
  const canEdit = can("birthPlan", "edit");

  const [plan, setPlan] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const pdfRef = useRef(null);

  const pregnancyId = pregnancy?.id;

  // Firestore listener
  useEffect(() => {
    if (!pregnancyId) return;
    const unsub = onSnapshot(doc(db, "pregnancies", pregnancyId, "birthPlan", "document"), snap => {
      if (snap.exists()) setPlan(snap.data());
    });
    return unsub;
  }, [pregnancyId]);

  function toggleOption(sectionKey, option) {
    if (!canEdit) return;
    setPlan(p => {
      const curr = p[sectionKey]?.selected ?? [];
      const next = curr.includes(option)
        ? curr.filter(o => o !== option)
        : [...curr, option];
      return { ...p, [sectionKey]: { ...p[sectionKey], selected: next } };
    });
  }

  function setNotes(sectionKey, notes) {
    if (!canEdit) return;
    setPlan(p => ({ ...p, [sectionKey]: { ...p[sectionKey], notes } }));
  }

  async function handleSave() {
    setSaving(true);
    await setDoc(
      doc(db, "pregnancies", pregnancyId, "birthPlan", "document"),
      { ...plan, updatedAt: serverTimestamp(), updatedBy: user.uid },
      { merge: true }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePDF() {
    setGeneratingPDF(true);
    await new Promise(r => setTimeout(r, 100));

    const element = pdfRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let yPos = 0;
    while (yPos < pdfHeight) {
      if (yPos > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yPos, pdfWidth, pdfHeight);
      yPos += pageHeight;
    }

    const name = pregnancy?.babyNickname
      ? `Plano_de_Parto_${pregnancy.babyNickname.replace(/\s+/g, "_")}.pdf`
      : "Plano_de_Parto.pdf";
    pdf.save(name);
    setGeneratingPDF(false);
  }

  const totalSelected = SECTIONS.reduce((a, s) => a + (plan[s.key]?.selected?.length ?? 0), 0);

  return (
    <div className="SCR">
      {/* Header card */}
      <div className="card fu">
        <div className="ctit"><span>📋</span>Plano de Parto</div>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
          Registre suas preferências para o momento do parto. Este documento orienta sua equipe médica sobre seus desejos.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="sbox" style={{ flex: 1 }}>
            <span className="sn">{totalSelected}</span>
            <span className="sl">preferências</span>
          </div>
          <div className="sbox" style={{ flex: 1 }}>
            <span className="sn">{SECTIONS.filter(s => (plan[s.key]?.selected?.length ?? 0) > 0).length}</span>
            <span className="sl">seções preenchidas</span>
          </div>
          <div className="sbox" style={{ flex: 1 }}>
            <span className="sn">{SECTIONS.length}</span>
            <span className="sl">seções total</span>
          </div>
        </div>
      </div>

      {/* Seções */}
      {SECTIONS.map(sec => {
        const secData = plan[sec.key] ?? {};
        const selected = secData.selected ?? [];
        const notes = secData.notes ?? "";
        const isOpen = activeSection === sec.key;

        return (
          <div key={sec.key} className="card fu">
            {/* Header da seção */}
            <button
              onClick={() => setActiveSection(isOpen ? null : sec.key)}
              style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: 0, textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{sec.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 17, color: C.vinho }}>
                    {sec.title}
                  </div>
                  {selected.length > 0 && (
                    <div style={{ fontSize: 11, color: C.taupe, marginTop: 2 }}>
                      {selected.length} opção{selected.length > 1 ? "s" : ""} selecionada{selected.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selected.length > 0 && (
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: C.verde, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "white",
                  }}>✓</div>
                )}
                <span style={{ fontSize: 18, color: C.taupe, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  ⌄
                </span>
              </div>
            </button>

            {/* Conteúdo expansível */}
            {isOpen && (
              <div style={{ marginTop: 14 }}>
                {/* Opções */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {sec.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(sec.key, opt)}
                      disabled={!canEdit}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 12,
                        border: `1.5px solid ${selected.includes(opt) ? C.rosa : C.bege}`,
                        background: selected.includes(opt) ? `${C.rosa}18` : "transparent",
                        cursor: canEdit ? "pointer" : "default", textAlign: "left",
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${selected.includes(opt) ? C.rosa : C.bege}`,
                        background: selected.includes(opt) ? C.rosa : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {selected.includes(opt) && <span style={{ fontSize: 11, color: "white" }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: selected.includes(opt) ? C.vinho : "#555" }}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Observações livres */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 6 }}>
                    Observações livres
                  </div>
                  <textarea
                    className="inp"
                    rows={3}
                    placeholder="Algum desejo específico ou contexto importante..."
                    value={notes}
                    onChange={e => setNotes(sec.key, e.target.value)}
                    disabled={!canEdit}
                    style={{ resize: "vertical", lineHeight: 1.6, fontSize: 13 }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Botões de ação */}
      {canEdit && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", padding: 14,
            background: saved ? "#22c55e" : C.vinho,
            color: C.bege, border: "none", borderRadius: 14,
            fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer", transition: "background .3s",
          }}
        >
          {saved ? "✅ Salvo!" : saving ? "Salvando..." : "💾 Salvar plano de parto"}
        </button>
      )}

      <button
        onClick={handlePDF}
        disabled={generatingPDF || totalSelected === 0}
        style={{
          width: "100%", padding: 14,
          background: "white", color: C.vinho,
          border: `1.5px solid ${C.bege}`, borderRadius: 14,
          fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
          cursor: generatingPDF || totalSelected === 0 ? "not-allowed" : "pointer",
          opacity: totalSelected === 0 ? .5 : 1,
        }}
      >
        {generatingPDF ? "⏳ Gerando PDF..." : "📄 Baixar PDF para maternidade"}
      </button>

      {/* Elemento oculto para gerar o PDF */}
      <div ref={pdfRef} style={{
        position: "fixed", left: -9999, top: 0, width: 794,
        background: "white", padding: "48px 48px 60px", fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{ borderBottom: "2px solid #4e2b53", paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 300, color: "#4e2b53", fontFamily: "Georgia, serif" }}>
            🌸 Plano de Parto
          </div>
          {pregnancy?.babyNickname && (
            <div style={{ fontSize: 15, color: "#ab9d95", marginTop: 4 }}>
              Bebê {pregnancy.babyNickname}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#ab9d95", marginTop: 6 }}>
            Gerado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>

        {SECTIONS.map(sec => {
          const secData = plan[sec.key] ?? {};
          const selected = secData.selected ?? [];
          const notes = secData.notes ?? "";
          if (selected.length === 0 && !notes) return null;
          return (
            <div key={sec.key} style={{ marginBottom: 24, breakInside: "avoid" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#4e2b53", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                {sec.icon} {sec.title}
              </div>
              {selected.map(opt => (
                <div key={opt} style={{ fontSize: 12, color: "#333", padding: "4px 0 4px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#9fb0a0", fontWeight: "bold" }}>✓</span> {opt}
                </div>
              ))}
              {notes && (
                <div style={{ fontSize: 12, color: "#555", marginTop: 6, padding: "8px 12px", background: "#f7ece0", borderRadius: 6, fontStyle: "italic" }}>
                  {notes}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ borderTop: "1px solid #eed1b8", marginTop: 32, paddingTop: 16, fontSize: 11, color: "#ab9d95", textAlign: "center" }}>
          Este plano de parto foi preparado com carinho e reflete os desejos da mãe. Pedimos à equipe médica que o respeite dentro das possibilidades clínicas.
        </div>
      </div>
    </div>
  );
}
