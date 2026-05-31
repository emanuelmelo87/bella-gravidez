import { useState } from "react";
import { usePregnancy } from "../contexts/PregnancyContext";
import { useAuth } from "../contexts/AuthContext";
import { SF } from "../styles/theme";

const C = {
  vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8",
  rosa: "#c38a97", bg: "#f7ece0",
};

const calcLMP = (dpp) => { const d = new Date(dpp + "T12:00:00"); d.setDate(d.getDate() - 280); return d.toISOString().split("T")[0]; };
const calcDPP = (lmp) => { const d = new Date(lmp + "T12:00:00"); d.setDate(d.getDate() + 280); return d.toISOString().split("T")[0]; };

export default function CreatePregnancy() {
  const { createPregnancy } = usePregnancy();
  const { logout, user } = useAuth();
  const [step, setStep] = useState(1);
  const [dt, setDt] = useState("lmp");
  const [date, setDate] = useState("");
  const [babyNickname, setBabyNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!date || loading) return;
    setLoading(true);
    try {
      const lmp = dt === "lmp" ? date : calcLMP(date);
      const dpp = dt === "dpp" ? date : calcDPP(date);
      await createPregnancy({ lmp, dpp, babyNickname });
    } catch (e) {
      console.error("createPregnancy:", e);
      alert("Não foi possível criar a gestação agora. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: `linear-gradient(160deg, ${C.bege} 0%, #f5e2d0 100%)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:${C.bg}}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .inp{width:100%;padding:12px 14px;border:1.5px solid ${C.bege};border-radius:12px;background:rgba(238,209,184,.15);font-family:'DM Sans',sans-serif;font-size:14px;color:${C.vinho};outline:none;transition:border-color .2s}
        .inp:focus{border-color:${C.rosa}}
        .inp::placeholder{color:${C.taupe};opacity:.7}
        .tbtn{flex:1;padding:10px 6px;border-radius:10px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s}
      `}</style>

      {/* Avatar */}
      {user?.photoURL && (
        <img src={user.photoURL} alt="" style={{
          width: 48, height: 48, borderRadius: "50%", marginBottom: 16,
          border: `2px solid ${C.rosa}`, animation: "fu .4s ease both",
        }} />
      )}

      <div style={{
        fontFamily: SF, fontSize: 13, color: C.taupe, marginBottom: 32,
        animation: "fu .4s .05s ease both", opacity: 0,
      }}>
        Olá, {user?.displayName?.split(" ")[0]}! 🌸
      </div>

      <div style={{
        background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(195,138,151,.2)", borderRadius: 24,
        padding: "32px 24px", width: "100%", maxWidth: 380,
        boxShadow: "0 8px 40px rgba(78,43,83,.12)",
        animation: "fu .5s .1s ease both", opacity: 0,
      }}>
        <div style={{ fontFamily: SF, fontSize: 26, color: C.vinho, marginBottom: 6 }}>
          Vamos começar ✨
        </div>
        <p style={{ fontSize: 13, color: C.taupe, marginBottom: 24, lineHeight: 1.6 }}>
          Configure sua gestação para acompanhar semana a semana.
        </p>

        {/* Apelido do bebê */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 6 }}>
            Apelido do bebê (opcional)
          </label>
          <input
            className="inp"
            placeholder="Ex: Sofia, Miguelzinho, Bolinha..."
            value={babyNickname}
            onChange={e => setBabyNickname(e.target.value)}
          />
        </div>

        {/* Tipo de data */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 6 }}>
            Tipo de data
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ v: "lmp", l: "Última menstruação" }, { v: "dpp", l: "Parto previsto" }].map(o => (
              <button key={o.v} className="tbtn" onClick={() => setDt(o.v)} style={{
                border: `1.5px solid ${dt === o.v ? C.rosa : C.bege}`,
                background: dt === o.v ? "rgba(195,138,151,.15)" : "transparent",
                color: dt === o.v ? C.vinho : C.taupe,
              }}>{o.l}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: C.taupe, marginBottom: 6 }}>
            {dt === "lmp" ? "Data da última menstruação" : "Data provável do parto"}
          </label>
          <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <button
          onClick={handleCreate}
          disabled={!date || loading}
          style={{
            width: "100%", padding: 14, background: C.vinho, color: C.bege,
            border: "none", borderRadius: 14, fontFamily: "'DM Sans',sans-serif",
            fontSize: 14, fontWeight: 500, cursor: !date || loading ? "not-allowed" : "pointer",
            opacity: !date || loading ? .5 : 1,
          }}
        >
          {loading ? "Criando..." : "Começar minha jornada ✨"}
        </button>

        <button
          onClick={logout}
          style={{
            width: "100%", padding: 12, background: "transparent", color: C.taupe,
            border: `1.5px solid ${C.bege}`, borderRadius: 14,
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", marginTop: 10,
          }}
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
