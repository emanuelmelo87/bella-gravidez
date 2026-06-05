import { useState } from "react";
import { deleteUser } from "firebase/auth";
import {
  collection, query, where, getDocs, deleteDoc, doc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useData } from "../contexts/DataContext";
import { getColors } from "../styles/theme";

export default function Legal({ onClose }) {
  const { user, logout, loginWithGoogle } = useAuth();
  const { pregnancy, myRole } = usePregnancy();
  const { deleteAllPregnancyData } = useData();
  const C = getColors(pregnancy?.theme?.palette);

  const [view, setView] = useState("menu"); // menu | privacy | terms | delete
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      // 1. Se sou dona, apaga toda a gestação e seus dados
      if (myRole === "mae" && pregnancy) {
        await deleteAllPregnancyData(pregnancy.id);
      }
      // 2. Remove meus vínculos de membro
      const q = query(collection(db, "pregnancyMembers"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      for (const d of snap.docs) await deleteDoc(d.ref);
      // 3. Remove meu perfil
      try { await deleteDoc(doc(db, "users", user.uid)); } catch {}
      // 4. Apaga a conta de autenticação
      try {
        await deleteUser(auth.currentUser);
      } catch (e) {
        if (e.code === "auth/requires-recent-login") {
          // Precisa logar de novo antes de excluir
          await loginWithGoogle();
          await deleteUser(auth.currentUser);
        } else { throw e; }
      }
      // 5. Sai
      await logout();
      window.location.href = "/";
    } catch (e) {
      console.error("delete account:", e);
      alert("Não foi possível excluir a conta agora. Tente sair e entrar novamente, depois repita.");
      setDeleting(false);
    }
  }

  const lbl = { fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, margin: "16px 0 6px" };
  const p = { fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 8 };

  if (view === "privacy") return (
    <div>
      <Back C={C} onClick={() => setView("menu")} />
      <div style={{ fontFamily: "Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 4 }}>Política de Privacidade</div>
      <div style={lbl}>Quais dados coletamos</div>
      <p style={p}>Nome, e-mail e foto da sua conta Google; e os dados que você registra: datas da gestação, diário, sintomas, consultas, medicamentos, contrações, plano de parto, fotos (links), músicas e marcos do parto.</p>
      <div style={lbl}>Como usamos</div>
      <p style={p}>Os dados são usados exclusivamente para o funcionamento do app e ficam armazenados no Google Firebase. São compartilhados apenas com as pessoas que você convidar (pai, doula, obstetra), de acordo com as permissões que você definir.</p>
      <div style={lbl}>Dados sensíveis de saúde</div>
      <p style={p}>Informações de gestação são dados sensíveis. Você controla quem tem acesso e pode revogar a qualquer momento na tela de Membros. Não vendemos nem compartilhamos seus dados com terceiros.</p>
      <div style={lbl}>Seus direitos (LGPD)</div>
      <p style={p}>Você pode acessar, corrigir e excluir seus dados a qualquer momento. A exclusão da conta remove permanentemente todos os seus dados (ver "Excluir minha conta").</p>
      <div style={lbl}>Contato</div>
      <p style={p}>Dúvidas sobre privacidade: emanuel.melo87@gmail.com</p>
    </div>
  );

  if (view === "terms") return (
    <div>
      <Back C={C} onClick={() => setView("menu")} />
      <div style={{ fontFamily: "Georgia,serif", fontSize: 20, color: C.vinho, marginBottom: 4 }}>Termos de Uso</div>
      <p style={p}>O Bella Gravidez é um app de acompanhamento gestacional de caráter informativo e organizacional.</p>
      <div style={lbl}>Não substitui acompanhamento médico</div>
      <p style={p}>As informações, dicas e cálculos do app <strong>não substituem</strong> consultas, diagnósticos ou orientações de profissionais de saúde. Em caso de dúvida ou emergência, procure sempre seu médico ou a maternidade.</p>
      <div style={lbl}>Responsabilidade</div>
      <p style={p}>Você é responsável pelos dados que registra e por quem convida para acompanhar sua gestação. Use links de convite apenas com pessoas de sua confiança.</p>
      <div style={lbl}>Uso adequado</div>
      <p style={p}>É proibido usar o app para fins ilícitos ou para acessar dados de terceiros sem autorização.</p>
    </div>
  );

  if (view === "delete") return (
    <div>
      <Back C={C} onClick={() => setView("menu")} />
      <div style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>⚠️</div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "#b91c1c", textAlign: "center", marginBottom: 8 }}>
        Excluir minha conta
      </div>
      <p style={{ ...p, textAlign: "center" }}>
        Esta ação é <strong>permanente</strong>. {myRole === "mae"
          ? "Toda a sua gestação, diário, fotos, exames e registros serão apagados para sempre, inclusive para os membros convidados."
          : "Seu acesso às gestações que você acompanha será removido."}
      </p>
      <p style={{ ...p, textAlign: "center" }}>
        Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
      </p>
      <input
        className="inp"
        value={confirmText}
        onChange={e => setConfirmText(e.target.value)}
        placeholder="EXCLUIR"
        style={{ textAlign: "center", marginBottom: 14 }}
      />
      <button
        onClick={handleDelete}
        disabled={confirmText !== "EXCLUIR" || deleting}
        style={{
          width: "100%", padding: 14, background: confirmText === "EXCLUIR" ? "#dc2626" : "#fca5a5",
          color: "white", border: "none", borderRadius: 14, fontWeight: 500,
          fontFamily: "'DM Sans',sans-serif", fontSize: 14,
          cursor: confirmText === "EXCLUIR" && !deleting ? "pointer" : "not-allowed",
        }}
      >
        {deleting ? "Excluindo..." : "Excluir permanentemente"}
      </button>
    </div>
  );

  // Menu
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { v: "privacy", ic: "🔒", t: "Política de Privacidade" },
          { v: "terms",   ic: "📜", t: "Termos de Uso" },
        ].map(b => (
          <button key={b.v} onClick={() => setView(b.v)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            background: `rgba(238,209,184,.2)`, border: `1.5px solid ${C.bege}`,
            borderRadius: 14, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 20 }}>{b.ic}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.vinho }}>{b.t}</span>
            <span style={{ marginLeft: "auto", color: C.rosa }}>→</span>
          </button>
        ))}
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          background: "transparent", border: `1.5px solid ${C.bege}`,
          borderRadius: 14, cursor: "pointer", textAlign: "left", marginTop: 8,
        }}>
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.taupe }}>Sair da conta</span>
        </button>
        <button onClick={() => setView("delete")} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          background: "transparent", border: `1.5px solid #fca5a5`,
          borderRadius: 14, cursor: "pointer", textAlign: "left",
        }}>
          <span style={{ fontSize: 20 }}>🗑️</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#dc2626" }}>Excluir minha conta e dados</span>
        </button>
      </div>

      {/* Créditos / atribuições */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.bege}`, fontSize: 11, color: C.taupe, lineHeight: 1.6, textAlign: "center" }}>
        <div style={{ fontWeight: 500, marginBottom: 4, letterSpacing: .5 }}>Créditos</div>
        Alguns ícones por{" "}
        <a href="https://www.flaticon.com/br/icones-gratis/botao-home" target="_blank" rel="noopener noreferrer" style={{ color: C.rosa }}>Freepik — Flaticon</a>.
        <div style={{ marginTop: 4 }}>Feito com 💜 — Bella Gravidez</div>
      </div>
    </div>
  );
}

function Back({ C, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer",
      color: C.taupe, fontSize: 13, marginBottom: 14, padding: 0,
    }}>← Voltar</button>
  );
}
