import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import CreatePregnancy from "./CreatePregnancy";
import { SF } from "../styles/theme";

const C = { vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8", rosa: "#c38a97", bg: "#f7ece0" };

export default function Onboarding() {
  const { user, logout } = useAuth();
  const [role, setRole] = useState(null);      // null | "mae" | "pai"
  const [invite, setInvite] = useState("");

  // Mãe → cria a gestação (fluxo existente)
  if (role === "mae") return <CreatePregnancy onBack={() => setRole(null)} />;

  // Pai → precisa do link de convite da mãe
  if (role === "pai") {
    function entrar() {
      const m = invite.match(/[?&]invite=([\w-]+)/);
      const id = m ? m[1] : invite.trim();
      if (id) window.location.href = `/?invite=${id}`;
    }
    return (
      <Shell user={user} logout={logout}>
        <div style={{ fontFamily: SF, fontSize: 24, color: C.vinho, marginBottom: 6 }}>Você é o Pai 👨‍👩‍👧</div>
        <p style={{ fontSize: 13, color: C.taupe, marginBottom: 20, lineHeight: 1.6 }}>
          Para acompanhar a gestação, peça à mãe o <strong>link de convite</strong> (ela gera em
          Configurações → Membros) e cole aqui:
        </p>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Link do convite</label>
          <input className="inp" value={invite} onChange={e => setInvite(e.target.value)}
            placeholder="https://bella-gravidez.web.app/?invite=..."
            style={inp} />
        </div>
        <button onClick={entrar} disabled={!invite.trim()} style={{ ...btnp, opacity: invite.trim() ? 1 : .5 }}>
          Entrar com o convite ✨
        </button>
        <button onClick={() => setRole(null)} style={btnGhost}>← Voltar</button>
      </Shell>
    );
  }

  // Pergunta inicial
  return (
    <Shell user={user} logout={logout}>
      <div style={{ fontFamily: SF, fontSize: 26, color: C.vinho, marginBottom: 6, textAlign: "center" }}>
        Bem-vinda(o)! 🌸
      </div>
      <p style={{ fontSize: 14, color: C.taupe, marginBottom: 24, lineHeight: 1.6, textAlign: "center" }}>
        Para começar, nos conte: qual é o seu papel nesta gestação?
      </p>
      <button onClick={() => setRole("mae")} style={choice}>
        <span style={{ fontSize: 30 }}>🤰</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.vinho }}>Sou a Mãe</div>
          <div style={{ fontSize: 12, color: C.taupe }}>Vou criar e administrar a gestação</div>
        </div>
      </button>
      <button onClick={() => setRole("pai")} style={choice}>
        <span style={{ fontSize: 30 }}>👨‍👩‍👧</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.vinho }}>Sou o Pai / Parceiro(a)</div>
          <div style={{ fontSize: 12, color: C.taupe }}>Vou acompanhar com o link de convite</div>
        </div>
      </button>
      <button onClick={logout} style={btnGhost}>Sair da conta</button>
    </Shell>
  );
}

function Shell({ user, logout, children }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: `linear-gradient(160deg, ${C.bege} 0%, #f5e2d0 100%)`,
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=DM+Sans:wght@300;400;500&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;padding:12px 14px;border:1.5px solid ${C.bege};border-radius:12px;background:rgba(238,209,184,.15);font-family:'DM Sans',sans-serif;font-size:14px;color:${C.vinho};outline:none}`}</style>
      {user?.photoURL && <img src={user.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: "50%", marginBottom: 14, border: `2px solid ${C.rosa}` }} />}
      <div style={{
        background: "rgba(255,255,255,.88)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(195,138,151,.2)", borderRadius: 24,
        padding: "28px 22px", width: "100%", maxWidth: 380,
        boxShadow: "0 8px 40px rgba(78,43,83,.12)",
      }}>
        {children}
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 6 };
const inp = { width: "100%", padding: "12px 14px", border: `1.5px solid ${C.bege}`, borderRadius: 12, background: "rgba(238,209,184,.15)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: C.vinho, outline: "none" };
const btnp = { width: "100%", padding: 14, background: C.vinho, color: C.bege, border: "none", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" };
const btnGhost = { width: "100%", padding: 12, background: "transparent", color: C.taupe, border: `1.5px solid ${C.bege}`, borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", marginTop: 10 };
const choice = { width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", marginBottom: 12, background: `rgba(238,209,184,.25)`, border: `1.5px solid ${C.bege}`, borderRadius: 16, cursor: "pointer" };
