import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { SF } from "../styles/theme";

const C = {
  vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8",
  rosa: "#c38a97", bg: "#f7ece0",
};

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: `linear-gradient(160deg, ${C.bege} 0%, #f5e2d0 100%)`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:${C.bg}}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fu .5s ease both" }}>
        <div style={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: C.taupe, marginBottom: 10 }}>
          ✦ seu diário de gestação
        </div>
        <h1 style={{ fontFamily: SF, fontSize: 64, fontWeight: 300, color: C.vinho, lineHeight: 1.05 }}>
          Bella<br />
          <em style={{ fontStyle: "italic", color: C.rosa }}>Gravidez</em>
        </h1>
        <p style={{ fontSize: 14, color: C.taupe, marginTop: 10 }}>
          acompanhe cada momento especial
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(195,138,151,.2)", borderRadius: 24,
        padding: "32px 24px", width: "100%", maxWidth: 380,
        boxShadow: "0 8px 40px rgba(78,43,83,.12)",
        animation: "fu .5s .1s ease both", opacity: 0,
      }}>
        <div style={{ fontFamily: SF, fontSize: 24, color: C.vinho, marginBottom: 6 }}>
          Bem-vinda 🌸
        </div>
        <p style={{ fontSize: 13, color: C.taupe, marginBottom: 28, lineHeight: 1.6 }}>
          Entre com sua conta Google para acessar ou criar sua gestação.
        </p>

        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10,
            padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14,
            border: `1.5px solid ${C.bege}`, background: "white",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1,
            fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
            color: C.vinho, transition: "all .2s",
            boxShadow: "0 2px 8px rgba(78,43,83,.08)",
          }}
        >
          <GoogleIcon />
          {loading ? "Entrando..." : "Continuar com Google"}
        </button>

        <p style={{ fontSize: 11, color: C.taupe, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Ao entrar, você concorda com os termos de uso e política de privacidade do Bella Gravidez.
        </p>
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: C.taupe, opacity: .6 }}>
        feito com 💜 para mamães
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
