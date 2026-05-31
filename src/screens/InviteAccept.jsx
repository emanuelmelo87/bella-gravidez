import { useState, useEffect } from "react";
import { useMembers } from "../contexts/MembersContext";
import { useAuth } from "../contexts/AuthContext";
import { SF } from "../styles/theme";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const C = { vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8", rosa: "#c38a97", bg: "#f7ece0" };

const ROLE_LABELS = {
  pai:      { label: "Pai / Parceiro", icon: "👨‍👩‍👧" },
  doula:    { label: "Doula",          icon: "🤱" },
  obstetra: { label: "Obstetra",       icon: "👩‍⚕️" },
};

export default function InviteAccept({ inviteId, onDone }) {
  const { user, loginWithGoogle } = useAuth();
  const { acceptInvite } = useMembers();
  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | valid | error | joining | joined
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "pregnancyInvites", inviteId));
        if (!snap.exists()) { setStatus("error"); setError("Convite não encontrado."); return; }
        const data = snap.data();
        if (data.usedBy) { setStatus("error"); setError("Este convite já foi utilizado."); return; }
        if (new Date(data.expiresAt.toDate()) < new Date()) { setStatus("error"); setError("Este convite expirou."); return; }
        setInvite(data);
        setStatus("valid");
      } catch (e) {
        // Se não tem permissão de leitura (não logado), mostra tela de login direto
        setStatus("valid");
        setInvite({ role: null }); // role desconhecido até logar
      }
    }
    load();
  }, [inviteId]);

  async function handleAccept() {
    if (!user) {
      try { await loginWithGoogle(); } catch { return; }
    }
    setStatus("joining");
    const result = await acceptInvite(inviteId);
    if (result.success || result.error === "already_member") {
      setStatus("joined");
      setTimeout(() => onDone(result.pregnancyId), 1500);
    } else {
      setStatus("error");
      setError(
        result.error === "expired" ? "Este convite expirou." :
        result.error === "already_used" ? "Este convite já foi utilizado." :
        "Erro ao aceitar convite. Tente novamente."
      );
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: `linear-gradient(160deg, ${C.bege} 0%, #f5e2d0 100%)`,
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`}</style>

      <div style={{ fontFamily: SF, fontSize: 28, color: C.vinho, textAlign: "center", marginBottom: 32 }}>
        Bella <em style={{ fontStyle: "italic", color: C.rosa }}>Gravidez</em>
      </div>

      <div style={{
        background: "rgba(255,255,255,.88)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(195,138,151,.2)", borderRadius: 24,
        padding: "32px 24px", width: "100%", maxWidth: 380,
        boxShadow: "0 8px 40px rgba(78,43,83,.12)", textAlign: "center",
      }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <div style={{ fontFamily: SF, fontSize: 20, color: C.vinho }}>Verificando convite...</div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
            <div style={{ fontFamily: SF, fontSize: 20, color: C.vinho, marginBottom: 8 }}>Convite inválido</div>
            <div style={{ fontSize: 13, color: C.taupe, marginBottom: 20 }}>{error}</div>
            <button onClick={() => window.location.href = "/"} style={{
              padding: "12px 24px", background: C.vinho, color: C.bege, border: "none",
              borderRadius: 14, fontSize: 13, cursor: "pointer",
            }}>
              Ir para o app
            </button>
          </>
        )}

        {status === "valid" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{ROLE_LABELS[invite?.role]?.icon}</div>
            <div style={{ fontFamily: SF, fontSize: 22, color: C.vinho, marginBottom: 6 }}>
              Você foi convidada!
            </div>
            <div style={{ fontSize: 13, color: C.taupe, marginBottom: 24, lineHeight: 1.6 }}>
              Você recebeu um convite para acompanhar uma gestação como{" "}
              <strong style={{ color: C.vinho }}>{ROLE_LABELS[invite?.role]?.label}</strong>.
            </div>
            {!user ? (
              <button onClick={handleAccept} style={{
                width: "100%", padding: 14, background: C.vinho, color: C.bege,
                border: "none", borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
                Entrar com Google e aceitar
              </button>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                  {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.vinho }}>{user.displayName}</div>
                    <div style={{ fontSize: 11, color: C.taupe }}>{user.email}</div>
                  </div>
                </div>
                <button onClick={handleAccept} style={{
                  width: "100%", padding: 14, background: C.vinho, color: C.bege,
                  border: "none", borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}>
                  Aceitar convite ✨
                </button>
              </>
            )}
          </>
        )}

        {status === "joining" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <div style={{ fontFamily: SF, fontSize: 20, color: C.vinho }}>Entrando...</div>
          </>
        )}

        {status === "joined" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: SF, fontSize: 22, color: C.vinho, marginBottom: 6 }}>Bem-vinda!</div>
            <div style={{ fontSize: 13, color: C.taupe }}>Redirecionando para o app...</div>
          </>
        )}
      </div>
    </div>
  );
}
